// Peeking half-mandalas (phones, BUILD-r17.md section 3): a third of a gold-leaf mandala shows inside the frame's inner rule on each side.
// buildPeeks() inserts them in the ornament channel; placePeeks() measures text and controls per page and picks the largest size that clears them.
const ARC = [[172, -44, 15, 0.3], [172, -14, 17, 1.6], [172, 18, 14, 2.5], [172, 46, 16, 0.9], [108, -28, 13, 2.0], [108, 30, 13, 1.1]];
const spots = (side) => ARC.map(([r, a, s, d]) => [r, side === 'l' ? a : 180 - a, s, d]);
const KEEP = 'button, a, .scratch, .card, .tn-stage, .tn-thread, .lamps, .cl-lock';
const V = 0.34;
const CLEAR = 14;

export const phoneMQ = () => matchMedia('(max-width: 519px)');

export function buildPeeks(F, pgs) {
  pgs.forEach((pg) => {
    if (pg.querySelector(':scope > .pkm')) return;
    let after = pg.querySelector(':scope > .pg-wash');
    for (const side of ['l', 'r']) {
      const el = document.createElement('i');
      el.className = `pkm och ${side}`;
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = `<i class="pkm-host">${F.mandala()}</i>`;
      if (after) after.after(el); else pg.prepend(el);
      after = el;
      const host = el.firstElementChild;
      host.querySelector('svg').classList.add('wm-gilt');
      F.glitter(host, { scale: 0.62, list: spots(side), rings: 2 });
    }
  });
}

function keepRects(pg, P, s) {
  const out = [];
  const add = (b, g = 0) => { if (b.width > 1 && b.height > 1) out.push({ x: (b.left - P.left) / s - g, y: (b.top - P.top) / s - g, r: (b.right - P.left) / s + g, b: (b.bottom - P.top) / s + g }); };
  const tw = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (el.closest('.sr, .pkm') || (el.closest('[aria-hidden="true"]') && !el.closest('.tn-thread, .tn-lines'))) continue;
    if (getComputedStyle(el).display === 'none') continue;
    const rg = document.createRange();
    rg.selectNodeContents(n);
    const lnB = (el.closest('.ln') || el).getBoundingClientRect();
    for (const q of rg.getClientRects()) if (q.width > 1) add({ left: q.left, right: q.right, top: lnB.top, bottom: lnB.bottom, width: q.width, height: lnB.height });
  }
  pg.querySelectorAll(KEEP).forEach((e) => { if (getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')) add(e.getBoundingClientRect(), e.matches('.scratch') ? 8 : 0); });
  return out;
}

// Reads every rect first, then writes the custom properties. Never call during a move.
export function placePeeks(pgs, U) {
  const jobs = [];
  for (const pg of pgs) {
    const pk = [...pg.querySelectorAll(':scope > .pkm')];
    if (!pk.length) continue;
    const W = pg.clientWidth;
    const H = pg.offsetHeight;
    if (!W || !H) continue;
    const P = pg.getBoundingClientRect();
    const s = P.height / H || 1;
    const rects = keepRects(pg, P, s);
    const inner = 36 * U;
    const top = 128 * U;
    const bot = Math.min(H - 128 * U, H - 74);
    const free = (y, side) => { let m = 1e9; for (const r of rects) if (r.b + CLEAR > y && r.y - CLEAR < y) m = Math.min(m, side !== 'r' ? r.x : 1e9, side !== 'l' ? W - r.r : 1e9); return m - CLEAR - inner; };
    const rows = { b: [], l: [], r: [] };
    for (let y = 0; y <= H; y += 2) { rows.l.push(free(y, 'l')); rows.r.push(free(y, 'r')); rows.b.push(Math.min(rows.l.at(-1), rows.r.at(-1))); }
    const fitFor = (rw, Dmin) => {
      for (let D = Math.min(210, 0.3 * H); D >= Dmin; D -= 4) {
        const R = D / 2;
        const v = V * D;
        let best = null;
        for (let y0 = top; y0 + D <= bot; y0 += 2) {
          let ok = true;
          for (let y = y0; y <= y0 + D && ok; y += 2) {
            const dy = y - (y0 + R);
            const lens = v - (R - Math.sqrt(Math.max(0, R * R - dy * dy)));
            if (lens > 0 && lens > rw[Math.round(y / 2)]) ok = false;
          }
          if (ok) { const c = Math.abs(y0 + R - 0.58 * H); if (!best || c < best.c) best = { y0, c }; }
        }
        if (best) return { D, y: best.y0 };
      }
      return null;
    };
    const both = fitFor(rows.b, 118);
    jobs.push([pk, both ? [both, both] : [fitFor(rows.l, 100), fitFor(rows.r, 100)]]);
  }
  for (const [pk, fits] of jobs) {
    pk.forEach((e, i) => {
      const fit = fits[i];
      if (!fit) { e.classList.remove('on'); return; }
      e.style.setProperty('--pk-y', `${fit.y.toFixed(1)}px`);
      e.style.setProperty('--pk-d', `${fit.D}px`);
      e.classList.add('on');
    });
  }
}
