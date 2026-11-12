// r13 peacock variant (Mayil, pastel): the peacock designer's pk.js + pk-motion.js, merged into one self-contained module,
// plus the four page compositions. All art is vector, built as layered DOM: each train feather is its own small <svg> in an
// <i class="pk-f"> rotated about the rump, so every motion is a compositor transform. Entrances are GSAP (pass gsap in);
// idle loops are WAAPI (transform and opacity only, zero per-frame JS). Nothing is random: every delay comes from an index.
// Needs the CSS in proto.css (.pk, .pk-f, .pk-gl, .pair, ...) and pkDefs() once in the document.

// ===================== art (pk.js) =====================
export const PAL = {
  gold: '#BF9850', goldHi: '#F4E1AA', goldLo: '#9C7535', goldDeep: '#7D5F22',
  champ: '#EBD3A0', blush: '#F2CFC6', peach: '#E7B497',
  mint: '#AEDCCB', mintHi: '#D2EEE2', aqua: '#77C2B6', teal: '#3F9A92', tealDeep: '#23676A',
  powder: '#A9C8EA', blue: '#6E9BD3', blueDeep: '#41709F', sapph: '#2E4C9A', sapphDeep: '#1D3270',
  pearl: '#FBF5EE', ink: '#213C3E',
};

const f = (v) => +(+v).toFixed(2);
const rad = (a) => (a * Math.PI) / 180;
const pts = (a) => a.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('');
export const smooth = (a, closed = true) => {
  const L = a.length; let d = `M${f(a[0][0])} ${f(a[0][1])}`;
  const n = closed ? L : L - 1;
  for (let i = 0; i < n; i++) {
    const p0 = a[(i - 1 + L) % L], p1 = a[i], p2 = a[(i + 1) % L], p3 = a[(i + 2) % L];
    const q0 = !closed && i === 0 ? p1 : p0, q3 = !closed && i === n - 1 ? p2 : p3;
    d += `C${f(p1[0] + (p2[0] - q0[0]) / 6)} ${f(p1[1] + (p2[1] - q0[1]) / 6)} ${f(p2[0] - (q3[0] - p1[0]) / 6)} ${f(p2[1] - (q3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
};

// teardrop pointing to -x, round end at +x
export function tear(rx, ry, cx = 0) {
  return `M${f(cx - rx * 1.45)} 0C${f(cx - rx * .8)} ${f(-ry * .5)} ${f(cx - rx * .6)} ${f(-ry)} ${f(cx + rx * .08)} ${f(-ry)}`
    + `C${f(cx + rx * .72)} ${f(-ry)} ${f(cx + rx)} ${f(-ry * .52)} ${f(cx + rx)} 0`
    + `C${f(cx + rx)} ${f(ry * .52)} ${f(cx + rx * .72)} ${f(ry)} ${f(cx + rx * .08)} ${f(ry)}`
    + `C${f(cx - rx * .6)} ${f(ry)} ${f(cx - rx * .8)} ${f(ry * .5)} ${f(cx - rx * 1.45)} 0Z`;
}

// one document-wide <defs>; every bird layer references these ids
export function pkDefs() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <linearGradient id="pkEg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${PAL.goldLo}"/><stop offset=".5" stop-color="#DDBB72"/><stop offset="1" stop-color="${PAL.goldHi}"/></linearGradient>
  <radialGradient id="pkLg" cx=".62" cy=".4" r=".75"><stop offset="0" stop-color="#5E82D6"/><stop offset=".55" stop-color="${PAL.sapph}"/><stop offset="1" stop-color="${PAL.sapphDeep}"/></radialGradient>
  <radialGradient id="pkAq" cx=".6" cy=".45" r=".7"><stop offset="0" stop-color="#A6E2D8"/><stop offset="1" stop-color="${PAL.aqua}"/></radialGradient>
  <linearGradient id="pkVg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${PAL.tealDeep}" stop-opacity=".25"/><stop offset=".55" stop-color="${PAL.teal}" stop-opacity=".62"/><stop offset="1" stop-color="${PAL.aqua}" stop-opacity=".9"/></linearGradient>
  <radialGradient id="pkHalo" cx=".62" cy=".5" r=".62"><stop offset=".55" stop-color="${PAL.mint}"/><stop offset="1" stop-color="${PAL.aqua}"/></radialGradient>
  <linearGradient id="pkNeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8DB6E6"/><stop offset=".32" stop-color="${PAL.blue}"/><stop offset=".7" stop-color="#4F86B4"/><stop offset="1" stop-color="${PAL.teal}"/></linearGradient>
  <radialGradient id="pkSheen" cx=".72" cy=".3" r=".5"><stop offset="0" stop-color="#EAF4FF" stop-opacity=".55"/><stop offset="1" stop-color="#EAF4FF" stop-opacity="0"/></radialGradient>
  <linearGradient id="pkWing" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PAL.mint}"/><stop offset=".5" stop-color="${PAL.aqua}"/><stop offset="1" stop-color="${PAL.teal}"/></linearGradient>
  <linearGradient id="pkCov" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${PAL.teal}"/><stop offset="1" stop-color="${PAL.mint}"/></linearGradient>
  <linearGradient id="pkBeak" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${PAL.goldHi}"/><stop offset="1" stop-color="${PAL.gold}"/></linearGradient>
  <pattern id="pkSc" width="5" height="4.2" patternUnits="userSpaceOnUse"><path d="M0 4.2q2.5 -3.6 5 0" fill="none" stroke="#FFFFFF" stroke-width=".4" opacity=".38"/></pattern>
  <pattern id="pkSc2" width="7" height="5.6" patternUnits="userSpaceOnUse"><path d="M0 5.6q3.5 -5 7 0M-3.5 2.8q3.5 -5 7 0M3.5 2.8q3.5 -5 7 0" fill="none" stroke="${PAL.goldHi}" stroke-width=".5" opacity=".7"/></pattern>
</defs></svg>`;
}

// a feather eye (ocellus) centred on the origin, pointing along +x: champagne, peach-bronze, aqua, powder, sapphire heart
export function eyeSVG(ex) {
  const ey = ex * .8;
  return `<path d="${tear(ex, ey)}" fill="url(#pkEg)"/>`
    + `<path d="${tear(ex * .8, ey * .8, ex * .1)}" fill="${PAL.peach}"/>`
    + `<path d="${tear(ex * .66, ey * .66, ex * .18)}" fill="url(#pkAq)"/>`
    + `<path d="${tear(ex * .46, ey * .5, ex * .27)}" fill="${PAL.powder}"/>`
    + `<ellipse cx="${f(ex * .4)}" cy="0" rx="${f(ex * .25)}" ry="${f(ey * .31)}" fill="url(#pkLg)"/>`
    + `<circle cx="${f(ex * .48)}" cy="${f(-ey * .12)}" r="${f(ex * .07)}" fill="#fff" opacity=".8"/>`
    + `<path d="${tear(ex, ey)}" fill="none" stroke="${PAL.gold}" stroke-width=".45"/>`;
}

// one train feather in its own frame: quill base at the origin, rachis along +x, a lace vane, the eye in a round halo at the tip
export function featherGeom(L, sag, ex, { covert = false } = {}) {
  const ey = ex * .8, N = 16, top = [], bot = [];
  let barbs = '';
  const c = (s) => [L * s, sag * 4 * s * (1 - s)];
  const tan = (s) => { const dx = L, dy = sag * 4 * (1 - 2 * s), m = Math.hypot(dx, dy); return [dx / m, dy / m]; };
  const tipS = 1 - (ex * .9) / L;
  const s0 = covert ? .2 : .08, sEnd = tipS - (ex * .8) / L;
  for (let i = 0; i <= N; i++) {
    const s = s0 + ((sEnd - s0) * i) / N;
    const [x, y] = c(s), [tx, ty] = tan(s), nx = -ty, ny = tx;
    const w = .5 + ey * (covert ? 1.1 : .95) * Math.pow((s - s0) / (sEnd - s0), 1.5);
    const wob = 1 + .07 * Math.sin(i * 2.1);
    top.push([x + nx * w * wob, y + ny * w * wob]); bot.push([x - nx * w / wob, y - ny * w / wob]);
    if (s > .22 && i > 0) {
      const bl = w * 1.25 + ex * .12;
      barbs += `M${f(x)} ${f(y)}l${f(nx * bl + tx * bl * .8)} ${f(ny * bl + ty * bl * .8)}M${f(x)} ${f(y)}l${f(-nx * bl + tx * bl * .8)} ${f(-ny * bl + ty * bl * .8)}`;
    }
  }
  const [qx, qy] = c(1), [tx, ty] = tan(1);
  const ang = (Math.atan2(ty, tx) * 180) / Math.PI;
  const ecx = qx - tx * ex * .55, ecy = qy - ty * ex * .55;
  const vane = `${pts(top)}L${f(ecx)} ${f(ecy)}` + bot.slice().reverse().map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + 'Z';
  const quill = `M0 0Q${f(L / 2)} ${f(sag * 2)} ${f(ecx - tx * ex * .6)} ${f(ecy - ty * ex * .6)}`;
  const hx = ex * 1.5, hy = ey * 1.42;
  const beads = Array.from({ length: 11 }, (_, i) => {
    const aa = -2.3 + (4.6 * i) / 10;
    const u = Math.cos(aa) * hx * 1.04 + ex * .02, v = Math.sin(aa) * hy * 1.1;
    return `<circle cx="${f(u)}" cy="${f(v)}" r="${f(ex * .07)}"/>`;
  }).join('');
  const ys = [...top, ...bot].map((p) => p[1]).concat([ecy - hy * 1.3, ecy + hy * 1.3]);
  const tipx = ecx + tx * hx * 1.15;
  const box = { x: -2, y: f(Math.min(...ys) - 1), w: f(tipx + 3), h: 0 };
  box.h = f(Math.max(...ys) + 1 - box.y);
  const inner = `<path d="${vane}" fill="url(#pkVg)"/>`
    + (covert ? '' : `<path d="${barbs}" stroke="${PAL.goldHi}" stroke-width=".38" stroke-opacity=".75" fill="none" stroke-linecap="round"/>`)
    + `<path d="${quill}" stroke="${PAL.gold}" stroke-width=".85" fill="none" stroke-linecap="round"/>`
    + `<g transform="translate(${f(ecx)} ${f(ecy)}) rotate(${f(ang)})">`
    + `<path d="${tear(hx, hy, -ex * .1)}" fill="url(#pkHalo)" stroke="${PAL.gold}" stroke-width=".35" stroke-opacity=".7"/>`
    + `<g fill="${PAL.gold}" opacity=".85">${beads}</g>${eyeSVG(ex)}</g>`;
  return { inner, box, eye: [ecx + tx * ex * .38, ecy + ty * ex * .38], ex };
}

// lay a feather into a bird box: VB = [x, y, w, h] of the bird, P = pivot in VB units, angle in degrees (CSS rotate)
function featherEl(g, VB, P, a, cls = '', extra = '') {
  const { box } = g;
  const st = `left:${f(((P[0] + box.x - VB[0]) / VB[2]) * 100)}%;top:${f(((P[1] + box.y - VB[1]) / VB[3]) * 100)}%;`
    + `width:${f((box.w / VB[2]) * 100)}%;height:${f((box.h / VB[3]) * 100)}%;`
    + `transform-origin:${f((-box.x / box.w) * 100)}% ${f((-box.y / box.h) * 100)}%;transform:rotate(${f(a)}deg)`;
  const gx = f(((g.eye[0] - box.x) / box.w) * 100), gy = f(((g.eye[1] - box.y) / box.h) * 100), gs = f(((g.ex * 2.6) / box.w) * 100);
  return `<i class="pk-f ${cls}" ${extra} style="${st}"><svg viewBox="${box.x} ${box.y} ${box.w} ${box.h}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${g.inner}</svg>`
    + `<b class="pk-gl" style="left:${gx}%;top:${gy}%;width:${gs}%"></b></i>`;
}

// graduated tiers, longest at the back; rest = trailing train, fan = raised display (CSS degrees, 180 = pointing back)
export function trainSpec({ scale = 1, fanFrom = 167, fanTo = 291, restAt = 173, spread = 1, tiers = [[300, 7], [258, 7], [216, 6], [174, 5], [132, 4], [92, 4]], coverts = 5 } = {}) {
  const out = [];
  tiers.forEach(([L, n], t) => {
    for (let i = 0; i < n; i++) {
      const m = t % 2 ? 2 : 3, lane = i % m;
      const rest = restAt + t * .7 + (lane - (m - 1) / 2) * (4.2 + t * .3) * spread;
      const ph = (t * .618) % 1;
      const fan = fanFrom + ((fanTo - fanFrom) * (i + ph)) / n;
      out.push({ L: L * scale, sag: (8 + L * .11) * scale, rest, fan, t, ex: Math.max(7, L * .052) * (1 + (scale - 1) * .45) });
    }
  });
  for (let i = 0; i < coverts; i++) {
    const u = i / (coverts - 1);
    out.push({ L: (40 + 8 * Math.sin(Math.PI * u)) * Math.min(scale, 1.2), sag: 0, rest: restAt - 12 + 24 * u, fan: fanFrom + 8 + (fanTo - fanFrom - 30) * u, t: tiers.length, ex: 7.4 * Math.min(scale, 1.2), covert: true });
  }
  return out;
}

// ---------- side bird (faces +x) ----------
const T = [318, 236];
const SIL = [[322, 226], [346, 213], [373, 202], [397, 193], [414, 180], [423, 162], [427, 142], [431, 120], [438, 104],
  [440, 93], [445, 85], [453, 81.5], [461, 84.5], [465, 90], [464, 97], [458, 104], [451, 120], [447, 140], [449, 160],
  [457, 180], [461, 202], [452, 223], [428, 238], [398, 244], [366, 242], [341, 236], [325, 232]];

function bodySVG(VB, { legs = true } = {}) {
  const sil = smooth(SIL);
  let sc = '';
  for (let r = 0; r < 5; r++) for (let i = 0; i < 8 - r; i++) { const x = 28 - i * 8.5 - r * 4.25, y = -9.5 + r * 4.6; sc += `M${f(x - 4.25)} ${f(y)}q4.25 5 8.5 0`; }
  const prim = [0, 1, 2, 3].map((i) => `M${-14 - i * 3} ${5 + i * 2.4}L${-60 - i * 2} ${8 + i * 2.6}`).join('');
  const pearls = Array.from({ length: 9 }, (_, i) => `<circle cx="${f(-30 + i * 7.6)}" cy="${f(-14.6 - Math.sin((i / 8) * Math.PI) * 1.2)}" r=".95"/>`).join('');
  const wing = `<g transform="translate(381 220) rotate(-13)"><path d="${tear(38, 15.5)}" fill="url(#pkWing)" stroke="${PAL.gold}" stroke-width=".9"/>`
    + `<path d="${sc}${prim}" fill="none" stroke="${PAL.goldHi}" stroke-width=".6" opacity=".95"/><g fill="${PAL.pearl}">${pearls}</g></g>`;
  const coverts = [-34, -20, -7, 6, 19].map((a, i) => `<g transform="translate(${326 + i * 2} ${234 - i * 1.5}) rotate(${172 + a})"><path d="${tear(15, 6)}" fill="url(#pkCov)" stroke="${PAL.gold}" stroke-width=".8"/><circle cx="7" r="1.6" fill="${PAL.sapph}"/></g>`).join('');
  const lg = legs ? `<path d="M390 242L383 272L392 300M405 241L410 272L417 300" stroke="${PAL.goldLo}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M392 300h-9M392 300h9M392 300l-5-3M417 300h-9M417 300h9M417 300l-5-3" stroke="${PAL.goldLo}" stroke-width="1.25" stroke-linecap="round"/>` : '';
  const head = `<path d="M464 89Q471 90.5 477 93.5Q470 96 463.6 96.4Z" fill="url(#pkBeak)" stroke="${PAL.goldLo}" stroke-width=".4"/>`
    + `<path d="M447 88.5Q454 84.6 461.5 88" stroke="${PAL.pearl}" stroke-width="1" fill="none" stroke-linecap="round"/>`
    + `<path d="M448.5 94.6Q454.5 97 460.5 94.4" stroke="${PAL.pearl}" stroke-width=".9" fill="none" stroke-linecap="round"/>`
    + `<ellipse cx="456.6" cy="91" rx="1.7" ry="1.4" fill="${PAL.ink}"/><circle cx="457.2" cy="90.5" r=".45" fill="#fff"/>`;
  const neckband = `<path d="M413 182Q436 196 459 186" fill="none" stroke="${PAL.goldHi}" stroke-width="1.1" stroke-dasharray="0 3.4" stroke-linecap="round"/>`;
  return `<svg class="pk-b" viewBox="${VB.join(' ')}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${coverts}${lg}`
    + `<path d="${sil}" fill="url(#pkNeck)"/><path d="${sil}" fill="url(#pkSc)"/><path d="${sil}" fill="url(#pkSheen)"/>`
    + `${neckband}<path d="${sil}" fill="none" stroke="${PAL.gold}" stroke-width="1.3" stroke-linejoin="round"/>${wing}${head}</svg>`;
}

function crestEl(VB, base = [451, 82]) {
  const tufts = [-122, -106, -90, -74, -58].map((a, i) => {
    const L = 16 + (i === 2 ? 4 : i % 2 ? 2 : 0), r = rad(a);
    const x = Math.cos(r) * L, y = Math.sin(r) * L;
    return `<path d="M0 0Q${f(Math.cos(r) * L * .5 - 1)} ${f(Math.sin(r) * L * .5)} ${f(x)} ${f(y)}" stroke="${PAL.gold}" stroke-width=".7" fill="none" stroke-linecap="round"/>`
      + `<g transform="translate(${f(x)} ${f(y)}) rotate(${a})"><path d="${tear(2.7, 2.2)}" fill="url(#pkEg)" stroke="${PAL.goldLo}" stroke-width=".35"/><circle cx=".9" r="1.05" fill="${PAL.sapph}"/></g>`;
  }).join('');
  const bx = [-16, -26, 32, 28];
  const st = `left:${f(((base[0] + bx[0] - VB[0]) / VB[2]) * 100)}%;top:${f(((base[1] + bx[1] - VB[1]) / VB[3]) * 100)}%;width:${f((bx[2] / VB[2]) * 100)}%;height:${f((bx[3] / VB[3]) * 100)}%;transform-origin:${f((-bx[0] / bx[2]) * 100)}% ${f((-bx[1] / bx[3]) * 100)}%`;
  return `<i class="pk-c" style="${st}"><svg viewBox="${bx.join(' ')}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${tufts}</svg></i>`;
}

// the bird box: union of the body and every feather tip in the rest and the fan pose (VB units)
export function sideVB(train = {}) {
  const spec = trainSpec(train);
  let x0 = 322, x1 = 482, y0 = 70, y1 = 304;
  for (const s of spec) for (const a of [s.rest, s.fan]) {
    const tx = T[0] + Math.cos(rad(a)) * (s.L + s.ex), ty = T[1] + Math.sin(rad(a)) * (s.L + s.ex);
    x0 = Math.min(x0, tx - s.ex * 1.6); x1 = Math.max(x1, tx + s.ex * 1.6); y0 = Math.min(y0, ty - s.ex * 1.6); y1 = Math.max(y1, ty + s.ex * 1.6);
  }
  return [Math.floor(x0), Math.floor(y0), Math.ceil(x1 - x0), Math.ceil(Math.max(304, y1) - y0)];
}

// a side peacock as layered DOM; p in [0, 1] (0 = trailing train, 1 = full display)
export function sideBird({ cls = '', p = .5, train = {}, VB = null } = {}) {
  const spec = trainSpec(train);
  VB = VB || sideVB(train);
  const fe = spec.map((s, k) => featherEl(featherGeom(s.L, s.sag, s.ex, { covert: s.covert }), VB, T, s.rest + (s.fan - s.rest) * p, `t${s.t}`, `data-k="${k}" data-t="${s.t}" data-rest="${f(s.rest)}" data-fan="${f(s.fan)}"`)).join('');
  return `<div class="pk ${cls}" style="aspect-ratio:${f(VB[2])}/${f(VB[3])}" data-vb="${VB.join(' ')}"><div class="pk-tr">${fe}</div>${bodySVG(VB)}${crestEl(VB)}</div>`;
}

export function setPose(pk, p) {
  pk.querySelectorAll('.pk-f').forEach((el) => { const r = +el.dataset.rest, fn = +el.dataset.fan; el.style.transform = `rotate(${f(r + (fn - r) * p)}deg)`; });
}

// ---------- front bird in display (date page): the fan opens like a hand fan ----------
const FROWS = [{ n: 23, L: 300, sp: 86, ex: 15.5 }, { n: 19, L: 238, sp: 80, ex: 13.5 }, { n: 14, L: 174, sp: 71, ex: 11.5 }, { n: 10, L: 104, sp: 58, ex: 8.8, covert: true }];
export function frontBird({ cls = '', open = 1 } = {}) {
  const P = [0, 0], VB = [-338, -338, 676, 470];
  let fe = '';
  FROWS.forEach((r, t) => {
    for (let i = 0; i < r.n; i++) {
      const u = r.n === 1 ? 0 : (i / (r.n - 1)) * 2 - 1;
      const aOpen = -90 + u * r.sp, aShut = -90 + u * r.sp * .07;
      const L = r.L * (1 - .05 * Math.abs(u) ** 2);
      const g = featherGeom(L, r.covert ? 0 : Math.sign(u) * L * .035, r.ex, { covert: r.covert });
      fe += featherEl(g, VB, P, aShut + (aOpen - aShut) * open, `t${t}`, `data-t="${t}" data-u="${f(u)}" data-rest="${f(aShut)}" data-fan="${f(aOpen)}"`);
    }
  });
  // body seen from the front: breast, slim neck, head with the beak toward us, drooping wings, legs
  const R = [[0, -140], [7, -137], [11.5, -127], [10.5, -112], [9.5, -92], [12, -70], [22, -50], [34, -22], [39, 14], [33, 50], [17, 71], [0, 76]];
  const sil = smooth([...R, ...R.slice(1, -1).reverse().map(([x, y]) => [-x, y])]);
  const wing = (s) => `<g transform="scale(${s} 1)"><path d="M26 -30C46 -18 54 14 52 52C51 76 46 92 38 104C34 76 30 48 20 28Z" fill="url(#pkWing)" stroke="${PAL.gold}" stroke-width=".9"/>`
    + `<path d="M32 2Q42 28 41 66M27 -6Q36 30 38 88" stroke="${PAL.goldHi}" stroke-width=".6" fill="none" opacity=".9"/>`
    + `<path d="M38 104C43 111 46 119 47 127M41 98C49 104 54 112 57 120" stroke="${PAL.goldLo}" stroke-width="1" fill="none" stroke-linecap="round"/></g>`;
  const legs = `<path d="M-11 72L-14 104L-12 128M11 72L14 104L12 128" stroke="${PAL.goldLo}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M-12 128l-9 3M-12 128l0 6M-12 128l8 3M12 128l9 3M12 128l0 6M12 128l-8 3" stroke="${PAL.goldLo}" stroke-width="1.3" stroke-linecap="round"/>`;
  const necklace = Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (.15 + .7 * i / 8); return `<circle cx="${f(-Math.cos(a) * 21)}" cy="${f(-44 + Math.sin(a) * 8)}" r="1.1"/>`; }).join('');
  const head = `<path d="M-6.5 -126Q0 -129 6.5 -126" stroke="${PAL.pearl}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`
    + `<ellipse cx="-6" cy="-122" rx="1.7" ry="1.5" fill="${PAL.ink}"/><ellipse cx="6" cy="-122" rx="1.7" ry="1.5" fill="${PAL.ink}"/>`
    + `<path d="M-3.4 -119L3.4 -119L0 -109Z" fill="url(#pkBeak)" stroke="${PAL.goldLo}" stroke-width=".4"/>`;
  const body = `<svg class="pk-b" viewBox="${VB.join(' ')}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${legs}${wing(1)}${wing(-1)}`
    + `<path d="${sil}" fill="url(#pkNeck)"/><path d="${sil}" fill="url(#pkSc)"/><path d="${sil}" fill="url(#pkSheen)"/><path d="${sil}" fill="none" stroke="${PAL.gold}" stroke-width="1.2"/>`
    + `<g fill="${PAL.goldHi}">${necklace}</g>${head}</svg>`;
  return `<div class="pk pk-front ${cls}" style="aspect-ratio:${VB[2]}/${VB[3]}" data-vb="${VB.join(' ')}"><div class="pk-tr">${fe}</div>${body}${crestFront(VB)}</div>`;
}

function crestFront(VB, base = [0, -138]) {
  const tufts = [-130, -110, -90, -70, -50].map((a, i) => {
    const L = 15 + (i === 2 ? 4 : i % 2 ? 2 : 0), r = rad(a);
    const x = Math.cos(r) * L, y = Math.sin(r) * L;
    return `<path d="M0 0L${f(x)} ${f(y)}" stroke="${PAL.gold}" stroke-width=".7" fill="none" stroke-linecap="round"/>`
      + `<g transform="translate(${f(x)} ${f(y)}) rotate(${a})"><path d="${tear(2.7, 2.2)}" fill="url(#pkEg)" stroke="${PAL.goldLo}" stroke-width=".35"/><circle cx=".9" r="1.05" fill="${PAL.sapph}"/></g>`;
  }).join('');
  const bx = [-18, -24, 36, 26];
  const st = `left:${f(((base[0] + bx[0] - VB[0]) / VB[2]) * 100)}%;top:${f(((base[1] + bx[1] - VB[1]) / VB[3]) * 100)}%;width:${f((bx[2] / VB[2]) * 100)}%;height:${f((bx[3] / VB[3]) * 100)}%;transform-origin:${f((-bx[0] / bx[2]) * 100)}% ${f((-bx[1] / bx[3]) * 100)}%`;
  return `<i class="pk-c" style="${st}"><svg viewBox="${bx.join(' ')}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${tufts}</svg></i>`;
}

// ---------- perched bird (reception): on a gold mango-leaf branch, the train hanging in a cascade ----------
const leafD = 'M0 0C8 -7 19 -6.5 26 0C19 6.5 8 7 0 0Z';
export function mangoLeaf(x, y, r, s = 1, deep = false) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${r}) scale(${s})"><path d="${leafD}" fill="${deep ? '#9CCBB4' : '#BFE0CC'}" stroke="${PAL.gold}" stroke-width=".7"/><path d="M1 0H23" stroke="${PAL.gold}" stroke-width=".45"/></g>`;
}
export function perchBird({ cls = '', p = 0, branch: withBranch = true } = {}) {
  const VB = [150, 40, 470, 600];
  const spec = trainSpec({ restAt: 99, spread: 2.3, scale: 1.14, fanFrom: 128, fanTo: 196, tiers: [[300, 6], [258, 6], [216, 5], [174, 5], [132, 4], [92, 3]], coverts: 4 });
  const fe = spec.map((s, k) => featherEl(featherGeom(s.L, -s.sag * .35, s.ex, { covert: s.covert }), VB, T, s.rest + (s.fan - s.rest) * p, `t${s.t}`, `data-k="${k}" data-t="${s.t}" data-rest="${f(s.rest)}" data-fan="${f(s.fan)}"`)).join('');
  const lv = [[188, 302, 160, 1.05], [214, 300, 205, .85, 1], [262, 302, 148, .95], [458, 302, 28, 1], [494, 299, -26, 1.05, 1], [534, 294, 32, .92], [566, 288, -38, .88, 1], [596, 280, 20, .8]]
    .map(([x, y, r, s, d]) => mangoLeaf(x, y, r, s, d)).join('');
  const branch = `<svg class="pk-br" viewBox="${VB.join(' ')}" preserveAspectRatio="none" aria-hidden="true" focusable="false">`
    + `<path class="br-line" pathLength="1" d="M160 305C230 298 300 301 380 302S540 298 612 278" stroke="${PAL.gold}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    + `<g class="br-lv">${lv}</g><circle cx="613" cy="278" r="3" fill="${PAL.goldHi}" stroke="${PAL.gold}" stroke-width=".6"/></svg>`;
  return `<div class="pk pk-perch ${cls}" style="aspect-ratio:${VB[2]}/${VB[3]}" data-vb="${VB.join(' ')}">${withBranch ? branch : ''}<div class="pk-tr">${fe}</div>${bodySVG(VB)}${crestEl(VB)}</div>`;
}

// a five-petal blush blossom with a gold heart
export function blossomSVG(x, y, r) {
  const pet = Array.from({ length: 5 }, (_, i) => `<path transform="rotate(${i * 72})" d="M0 0C${f(r * .55)} ${f(-r * .3)} ${f(r * .5)} ${f(-r)} 0 ${f(-r * 1.05)}C${f(-r * .5)} ${f(-r)} ${f(-r * .55)} ${f(-r * .3)} 0 0Z"/>`).join('');
  return `<g transform="translate(${f(x)} ${f(y)})"><g fill="#F6D6CE" stroke="${PAL.gold}" stroke-width=".4">${pet}</g><circle r="${f(r * .26)}" fill="${PAL.goldHi}" stroke="${PAL.gold}" stroke-width=".4"/></g>`;
}

// a mango-leaf vine that crosses the page from band to band (reception); the perch is at x = px (0..400), y = 20
export function vineBranch({ px = 228 } = {}) {
  const d = `M0 26C60 30 110 14 170 19S${px - 20} 21 ${px + 10} 20S330 12 400 22`;
  const pairs = [[18, 27, 1], [52, 24, 0], [92, 18, 1], [128, 17, 0], [300, 15, 1], [338, 14, 0], [372, 18, 1]];
  let lv = '';
  pairs.forEach(([x, y, k], i) => {
    const up = i % 2 ? -1 : 1;
    lv += mangoLeaf(x, y, up > 0 ? -150 + k * 8 : -32 - k * 6, .82, k);
    lv += mangoLeaf(x + 4, y, up > 0 ? 34 - k * 6 : 150 + k * 8, .66, !k);
  });
  const buds = [[70, 25, 1], [150, 18, .8], [318, 14, .9], [388, 21, .7]].map(([x, y, k]) => blossomSVG(x, y, 5.2 * k)).join('');
  // hanging tendrils: a gold thread with mango leaves in pairs and a blossom at the end (they sway at idle)
  const sprig = (x, y, len, k = 0) => {
    let g = `<path d="M${x} ${y}q${k % 2 ? 3 : -3} ${len * .5} 0 ${len}" stroke="${PAL.gold}" stroke-width=".6" fill="none"/>`;
    for (let j = 1, n = Math.max(1, Math.round(len / 16)); j <= n; j++) { const yy = y + (len * j) / (n + .6); g += mangoLeaf(x, yy, 58 + (j % 2) * 10, .5, j % 2) + mangoLeaf(x, yy, 122 - (j % 2) * 10, .44, !(j % 2)); }
    return `<g class="br-sp" style="--k:${k}" transform-origin="${x} ${y}">${g}${blossomSVG(x, y + len + 3, 3.4)}</g>`;
  };
  return `<svg class="branch" viewBox="0 0 400 80" aria-hidden="true" focusable="false"><path class="br-line" pathLength="1" d="${d}" stroke="${PAL.gold}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`
    + `<path d="M0 29C70 33 120 18 172 22" stroke="${PAL.gold}" stroke-width=".5" fill="none" opacity=".7"/><g class="br-lv">${lv}</g>${buds}${sprig(40, 25, 34, 0)}${sprig(110, 18, 22, 1)}${sprig(298, 15, 46, 2)}${sprig(352, 15, 26, 3)}</svg>`;
}

// ===================== motion (pk-motion.js) =====================
const E = 'cubic-bezier(.45,0,.55,1)';
const deg = (v) => `rotate(${v.toFixed(2)}deg)`;
const pose = (el, p) => { const r = +el.dataset.rest, f = +el.dataset.fan; return r + (f - r) * p; };
const feathers = (pk) => [...pk.querySelectorAll('.pk-f')];

// pivot of the train in % of the bird box, for rotating the whole .pk-tr
export function trainOrigin(pk, P) {
  const vb = (pk.dataset.vb || '').split(' ').map(Number);
  if (vb.length === 4) pk.querySelector('.pk-tr').style.transformOrigin = `${(((P[0] - vb[0]) / vb[2]) * 100).toFixed(2)}% ${(((P[1] - vb[1]) / vb[3]) * 100).toFixed(2)}%`;
}

// side bird: the train opens from p0 to p1, back tiers first, outer feathers of a tier first
export function enterSide(pk, gsap, { p0 = .12, p1 = .8, at = .5, dur = 2.6, from = -1, slide = 16, rise = 0 } = {}) {
  const tl = gsap.timeline();
  const fs = feathers(pk);
  const st = fs.map((el) => ({ el, p: p0 }));
  const set = (o) => { o.el.style.transform = deg(pose(o.el, o.p)); };
  st.forEach(set);
  tl.fromTo(pk, { xPercent: from * slide, yPercent: rise, opacity: 0 }, { xPercent: 0, yPercent: 0, opacity: 1, duration: 1.7, ease: 'power3.out' }, 0);
  st.forEach((o) => {
    const t = +o.el.dataset.t, k = +o.el.dataset.k;
    tl.to(o, { p: p1, duration: dur, ease: 'sine.inOut', onUpdate: () => set(o) }, at + t * .1 + (k % 7) * .025);
  });
  const crest = pk.querySelector('.pk-c');
  tl.fromTo(crest, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(2)' }, 1.1);
  glintWave(tl, pk, at + dur * .85);
  return tl;
}

// one pass of glints through the eyes, back tier and outer feathers first
export function glintWave(tl, pk, at, each = .035) {
  const gl = feathers(pk).filter((el) => !el.classList.contains('t6') && !el.classList.contains('t7')).map((el) => el.querySelector('.pk-gl'));
  gl.forEach((g, i) => tl.fromTo(g, { opacity: 0, scale: .4, xPercent: -50, yPercent: -50 }, { opacity: 1, scale: 1.15, xPercent: -50, yPercent: -50, duration: .35, ease: 'sine.out', yoyo: true, repeat: 1 }, at + i * each));
}

// side bird idle, one 22 s cycle: the train rises to pPeak and spreads (3.6 s), holds, settles (4.4 s), rests;
// the eyes glint as it peaks, the crest sways all the while. Returns the WAAPI animations (pause/play with the page).
export function idleSide(pk, { pRest = .8, pPeak = 1, period = 22000, delay = 0, offset = 0 } = {}) {
  const out = [];
  const fs = feathers(pk);
  fs.forEach((el) => {
    const t = +el.dataset.t, k = +el.dataset.k;
    const a0 = pose(el, pRest), a1 = pose(el, pPeak);
    const s0 = (t * 120 + (k % 7) * 30) / period;
    const up = 3600 / period, hold = 2400 / period, down = 4400 / period;
    const s3 = s0 + up + hold + (6 - t) * 60 / period;
    out.push(el.animate([
      { transform: deg(a0), offset: 0 },
      { transform: deg(a0), offset: s0, easing: E },
      { transform: deg(a1), offset: s0 + up },
      { transform: deg(a1), offset: s3, easing: E },
      { transform: deg(a0), offset: Math.min(.98, s3 + down) },
      { transform: deg(a0), offset: 1 },
    ], { duration: period, iterations: Infinity, delay: delay + offset }));
  });
  fs.filter((el) => +el.dataset.t < 6).forEach((el, i) => {
    const g = el.querySelector('.pk-gl');
    const c = (3400 + i * 40) / period, w = 380 / period;
    out.push(g.animate([
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.4)', offset: 0 },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.4)', offset: c - w, easing: 'ease-out' },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1.15)', offset: c },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.4)', offset: c + w },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.4)', offset: 1 },
    ], { duration: period, iterations: Infinity, delay: delay + offset }));
  });
  out.push(...crestSway(pk, delay + offset));
  return out;
}

export function crestSway(pk, delay = 0, amp = 4, ms = 2300) {
  const c = pk.querySelector('.pk-c');
  return c ? [c.animate([{ transform: `rotate(${-amp}deg)` }, { transform: `rotate(${amp}deg)` }], { duration: ms, iterations: Infinity, direction: 'alternate', easing: E, delay })] : [];
}

// front bird: the fan opens like a hand fan, back row first, from the centre outward; eyes glint ring by ring
export function openFront(pk, gsap, { dur = 2.4, from = 0 } = {}) {
  const tl = gsap.timeline();
  feathers(pk).forEach((el) => {
    const t = +el.dataset.t, u = Math.abs(+el.dataset.u);
    const o = { p: from };
    const set = () => { el.style.transform = deg(pose(el, o.p)); };
    tl.to(o, { p: 1, duration: dur, ease: 'power2.inOut', onUpdate: set }, t * .12 + u * .22);
  });
  const rows = [0, 1, 2].map((t) => [...pk.querySelectorAll(`.pk-f.t${t} .pk-gl`)]);
  rows.forEach((gl, t) => gl.forEach((g, i) => tl.fromTo(g, { opacity: 0, scale: .4, xPercent: -50, yPercent: -50 }, { opacity: 1, scale: 1.15, xPercent: -50, yPercent: -50, duration: .35, yoyo: true, repeat: 1, ease: 'sine.out' }, dur * .8 + t * .14 + Math.abs(i - (gl.length - 1) / 2) * .03)));
  tl.fromTo(pk.querySelector('.pk-c'), { scaleY: .7 }, { scaleY: 1, duration: .6, ease: 'back.out(2)' }, dur * .7);
  return tl;
}

// front bird idle: a breath of wind runs across the back row every 9 s, the eyes glint, the crest sways
export function idleFront(pk, { period = 9000, delay = 0, shut = false } = {}) {
  const out = [];
  if (shut) {
    const tr = pk.querySelector('.pk-tr');
    out.push(tr.animate([{ transform: 'rotate(-1.4deg)' }, { transform: 'rotate(1.4deg)' }], { duration: 5200, iterations: Infinity, direction: 'alternate', easing: E, delay }));
    return out;
  }
  const back = [...pk.querySelectorAll('.pk-f.t0, .pk-f.t1')];
  back.forEach((el) => {
    const a = pose(el, 1), u = +el.dataset.u, t = +el.dataset.t;
    const c = (.12 + (u + 1) * .18 + t * .03), w = .1;
    out.push(el.animate([
      { transform: deg(a), offset: 0 },
      { transform: deg(a), offset: c - w, easing: E },
      { transform: deg(a + 1.6 * (t ? .7 : 1)), offset: c },
      { transform: deg(a), offset: c + w * 1.6, easing: E },
      { transform: deg(a), offset: 1 },
    ], { duration: period, iterations: Infinity, delay }));
  });
  [0, 1, 2].forEach((t) => [...pk.querySelectorAll(`.pk-f.t${t} .pk-gl`)].forEach((g) => {
    const u = +g.parentElement.dataset.u, c = .2 + (u + 1) * .18 + t * .04, w = .04;
    out.push(g.animate([
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.4)', offset: 0 },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.4)', offset: c - w },
      { opacity: .95, transform: 'translate(-50%,-50%) scale(1.1)', offset: c },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.4)', offset: c + w },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.4)', offset: 1 },
    ], { duration: period, iterations: Infinity, delay }));
  }));
  out.push(...crestSway(pk, delay, 3, 2600));
  return out;
}

// perched bird: the branch draws, leaves open along it, the bird settles and lets its train fall into a cascade
export function enterPerch(stage, gsap, { dur = 2.4 } = {}) {
  const tl = gsap.timeline();
  const line = stage.querySelector('.br-line');
  const pk = stage.querySelector('.pk-perch');
  if (line) tl.fromTo(line, { strokeDasharray: '1 2', strokeDashoffset: 1.02 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', autoRound: false }, 0);
  const lv = [...stage.querySelectorAll('.br-lv > g')];
  lv.forEach((g, i) => tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: .5, ease: 'sine.out' }, .25 + i * .045));
  stage.querySelectorAll('.br-sp').forEach((g, i) => tl.fromTo(g, { scaleY: 0 }, { scaleY: 1, duration: .8, ease: 'power2.out', svgOrigin: g.getAttribute('transform-origin') }, .8 + i * .12));
  tl.fromTo(pk, { opacity: 0, yPercent: -2 }, { opacity: 1, yPercent: 0, duration: .9, ease: 'power2.out' }, .6);
  feathers(pk).forEach((el) => {
    const t = +el.dataset.t, k = +el.dataset.k;
    const o = { p: 1 };
    const set = () => { el.style.transform = deg(pose(el, o.p)); };
    set();
    tl.to(o, { p: 0, duration: dur, ease: 'back.out(1.1)', onUpdate: set }, 1.0 + t * .09 + (k % 6) * .02);
  });
  return tl;
}

// perched bird idle: the train swings like a pendulum, the tendrils sway, a glint runs down the train toward the button
export function idlePerch(stage, { delay = 0 } = {}) {
  const pk = stage.querySelector('.pk-perch');
  const tr = pk.querySelector('.pk-tr');
  const out = [tr.animate([{ transform: 'rotate(1.3deg)' }, { transform: 'rotate(-1.3deg)' }], { duration: 3600, iterations: Infinity, direction: 'alternate', easing: E, delay })];
  stage.querySelectorAll('.br-sp').forEach((g, i) => {
    g.style.transformBox = 'view-box';
    out.push(g.animate([{ transform: `rotate(${i % 2 ? 3 : -3}deg)` }, { transform: `rotate(${i % 2 ? -3 : 3}deg)` }], { duration: 3000 + i * 400, iterations: Infinity, direction: 'alternate', easing: E, delay: delay + i * 300 }));
  });
  const gl = feathers(pk).filter((el) => +el.dataset.t < 6).sort((a, b) => b.dataset.t - a.dataset.t).map((el) => el.querySelector('.pk-gl'));
  gl.forEach((g, i) => {
    const c = .1 + i * .012, w = .03;
    out.push(g.animate([
      { transform: 'translate(-50%,-50%)', opacity: 0, offset: 0 }, { transform: 'translate(-50%,-50%)', opacity: 0, offset: c - w }, { transform: 'translate(-50%,-50%)', opacity: 1, offset: c }, { transform: 'translate(-50%,-50%)', opacity: 0, offset: c + w }, { transform: 'translate(-50%,-50%)', opacity: 0, offset: 1 },
    ], { duration: 9000, iterations: Infinity, delay }));
  });
  out.push(...crestSway(pk, delay));
  return out;
}

// ===================== page compositions =====================
// Trains: the invite pair arches its half-fans over the backs; the closing pair opens full fans that cross above the heads.
export const TR_INVITE = { scale: 1, fanFrom: 178, fanTo: 318 };
export const TR_CLOSING = { scale: 1, fanFrom: 182, fanTo: 324 };
// the date fan waits a little open (a folded hand fan, not a shut sheaf) until the gold is scratched
export const FAN_WAIT = 0.12;

// A facing pair: two side birds, beak tips g units apart, trains outward. `mid` sits between them on the floor
// (a lamp on the invite, the sapphire bindu at beak height on the closing, midY in bird units).
export function pair({ p, train, g, mid = '', wide = 2.3, midY = 0 }) {
  const VB = sideVB(train), right = VB[0] + VB[2] - 477, total = 2 * VB[2] + g - 2 * right, H = VB[3];
  const off = ((g / 2 - right) / total) * 100;
  const b = (side) => sideBird({ p, cls: side, train, VB });
  return `<div class="pair" style="--ar:${(total / H).toFixed(4)};--g:${off.toFixed(3)};--wide:${wide}">${b('l')}${b('mir r')}`
    + `<div class="mid" style="bottom:${midY ? (((VB[1] + VB[3] - midY) / H) * 100).toFixed(2) : 0}%">${mid}</div></div>`;
}

// Markup for a page's bird stage (the .pk-stage box). lamp: the site's deepam markup for the invite's single lamp.
export function peacockScene(page, { lamp = '', branch = '' } = {}) {
  if (page === 'invite') return pair({ p: 0.8, train: TR_INVITE, g: 130, mid: lamp }) + '<i class="pk-thresh"></i>';
  if (page === 'closing') return pair({ p: 1, train: TR_CLOSING, g: 30, mid: '<i class="bindu"></i>', midY: 96 }) + '<i class="pk-thresh"></i>';
  if (page === 'date') return `<div class="fanbox">${frontBird({ open: FAN_WAIT })}</div>`;
  if (page === 'reception') return `${branch || vineBranch()}<div class="perchbox">${perchBird({ p: 0, branch: false })}</div>`;
  if (page === 'side') return sideBird({ p: 0.62, train: { scale: 1.25 } });
  return '';
}

// Lifecycle for one stage. enter() once on the first pg:reveal; the WAAPI idle starts from the entrance's onComplete
// (so ?video=1 frames line up); live(false) pauses every idle animation; finish() jumps to the end (pg:leave mid-entrance).
// Date: bloom() opens the fan (call it from the scratch reveal; before that the shut sheaf only sways).
// RM: call still() instead of anything else; no GSAP and no WAAPI are created.
export function peacockMotion(page, stage, gsap) {
  stage.querySelectorAll('.pk').forEach((pk) => trainOrigin(pk, pk.classList.contains('pk-front') ? [0, 0] : T));
  const birds = [...stage.querySelectorAll('.pk')];
  let anims = [], tl = null, bl = null, isLive = true, entered = false, bloomed = false, wantBloom = false;
  const run = (list) => { anims.push(...list); if (!isLive) list.forEach((a) => a.pause()); };
  const stop = () => { anims.forEach((a) => a.cancel()); anims = []; };
  const idle = () => {
    stop();
    if (page === 'invite') run([...idleSide(birds[0], { pRest: 0.8, pPeak: 1 }), ...idleSide(birds[1], { pRest: 0.8, pPeak: 1, offset: 500 })]);
    if (page === 'closing') run([...idleSide(birds[0], { pRest: 1, pPeak: 0.9 }), ...idleSide(birds[1], { pRest: 1, pPeak: 0.9 })]);
    if (page === 'date') run(idleFront(birds[0], { shut: !bloomed }));
    if (page === 'reception') run(idlePerch(stage));
    if (page === 'side') run(idleSide(birds[0], { pRest: 0.62, pPeak: 0.8 }));
  };
  const api = {
    prime() {
      if (tl) return tl;
      tl = gsap.timeline({ paused: true, onComplete: () => { idle(); if (wantBloom) api.bloom(); } });
      if (page === 'invite') tl.add(enterSide(birds[0], gsap, { p0: 0.12, p1: 0.8, from: -1 }), 0).add(enterSide(birds[1], gsap, { p0: 0.12, p1: 0.8, from: 1 }), 0.2);
      if (page === 'closing') {
        tl.add(enterSide(birds[0], gsap, { p0: 0.3, p1: 1, from: -1, slide: 6, rise: 4 }), 0).add(enterSide(birds[1], gsap, { p0: 0.3, p1: 1, from: 1, slide: 6, rise: 4 }), 0)
          .fromTo(stage.querySelector('.bindu'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)' }, 3.4);
      }
      if (page === 'date') tl.fromTo(birds[0], { opacity: 0, yPercent: 3 }, { opacity: 1, yPercent: 0, duration: 1.2, ease: 'power2.out' }, 0);
      if (page === 'reception') tl.add(enterPerch(stage, gsap), 0);
      if (page === 'side') tl.fromTo(birds[0], { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);
      tl.progress(0);
      return tl;
    },
    enter() {
      if (entered) return tl; entered = true;
      api.prime().play();
      return tl;
    },
    bloom() {
      if (page !== 'date' || bloomed) return bl;
      if (!entered || tl?.isActive()) { wantBloom = true; tl?.timeScale(3); return null; }
      bloomed = true; stop();
      bl = gsap.timeline({ onComplete: idle }).add(openFront(birds[0], gsap, { from: FAN_WAIT }), 0);
      return bl;
    },
    finish() { tl?.progress(1); bl?.progress(1); },
    live(on) { isLive = on; anims.forEach((a) => (on ? a.play() : a.pause())); },
    still() {
      if (page === 'date') setPose(birds[0], 1);
      stage.querySelectorAll('.bindu').forEach((b) => { b.style.opacity = 1; });
    },
    get anims() { return anims; },
  };
  return api;
}
