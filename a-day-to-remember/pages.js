// r14 paged engine (BUILD-r14.md section 5). Drop-in replacement for sample-south/pages.js.
// The document never scrolls. Every page keeps the r13 two-channel dissolve, but it is driven by a timed tween of a
// virtual position, one step per gesture (wheel notch or trackpad swipe, touch swipe, key, the next button, focus).
const clamp = (x) => Math.min(1, Math.max(0, x));
const range = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const ease = (x) => x * x * (3 - 2 * x);
const DRIFT = 0.07;
const GAP = 0.9;
const fire = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail }));

export function initPages({ gsap, RM, VIDEO = false, hooks = {} }) {
  const chan = (els) => els.map((el) => ({ el, fade: el.classList.contains('fade'), key: '' }));
  const pages = [...document.querySelectorAll('.page')].filter((el) => getComputedStyle(el).display !== 'none').map((el, i) => {
    const pg = el.firstElementChild;
    const kids = [...pg.children];
    return {
      el, i, pg, revealed: false, key: '', r: 0, over: 0,
      crossed: null, rest: false, seen: false, live: false, idle: false, uoKey: '', pe: '',
      w: 0, o: 0,
      words: chan(kids.filter((c) => !c.classList.contains('och') && !c.matches('.sr'))),
      orn: chan(kids.filter((c) => c.classList.contains('och'))),
      depth: [...el.querySelectorAll('[data-depth]')].map((d) => ({ el: d, k: +d.dataset.depth, tilt: d.hasAttribute('data-tilt'), key: '' })),
      lns: [...el.querySelectorAll('.ln')].filter((l) => !l.closest('.defer, .tn-lines, .act')).slice(0, 12),
    };
  });
  const last = pages.length - 1;
  const frame = document.getElementById('frame');
  let veil = document.getElementById('veil');
  let crestKey = '';
  let busy = false;
  const intro = { v: 0 };
  let started = false;
  let queued = false;
  let vw = 0;
  let vh = 0;

  const lines = (p) => [...p.el.querySelectorAll('.li')].filter((l) => !l.closest('.defer'));
  const fades = (p) => [...p.el.querySelectorAll('.fade')];

  function whenLoaded(el, fn) {
    const imgs = [...el.querySelectorAll('img[data-src]')].filter((im) => !im.complete || !im.naturalWidth);
    if (!imgs.length) { fn(); return; }
    let n = imgs.length;
    const one = () => { if (--n === 0) fn(); };
    imgs.forEach((im) => { im.addEventListener('load', one, { once: true }); im.addEventListener('error', one, { once: true }); });
    setTimeout(() => { n = 1; one(); }, 4000);
  }

  // lead: seconds until the words channel starts to arrive (a move starts the reveal with the move, so lines and fades land together).
  function reveal(p, lead = 0) {
    p.revealed = true;
    const first = p.i === 0;
    const ls = lines(p);
    if (ls.length) gsap.fromTo(ls, { yPercent: 108, opacity: 0, filter: 'blur(5px)' },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', stagger: 0.12, delay: first ? 0.7 : lead, clearProps: 'filter' });
    fire(p.el, 'pg:reveal', { first });
    fades(p).forEach((f, k) => whenLoaded(f, () => gsap.to(f, { '--fo': 1, duration: 1.3, ease: 'power2.out', delay: first ? 0.4 + k * 0.9 : Math.max(0, lead - 0.15) + k * 0.12 })));
  }

  function drawInvite() {
    const q = (sel) => document.querySelectorAll(sel);
    const tl = gsap.timeline({ delay: 0.2 });
    hooks.invite?.(tl);
    const draw = (sel, vars, at, from) => {
      const els = q(sel);
      if (!els.length) return;
      if (from) tl.fromTo(els, from, vars, at); else tl.to(els, vars, at);
    };
    draw('.gable .g1.gd', { strokeDashoffset: 0, autoRound: false, duration: 1.6, ease: 'power2.inOut' }, 0.4);
    draw('.gable .g2.gd', { strokeDashoffset: 0, autoRound: false, duration: 1.4, ease: 'power2.inOut' }, 0.7);
    draw('.gable .g3', { opacity: 1, duration: 0.5 }, 1.8);
    draw('.gb-eave > .gb-i', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.04 }, 2.1, { opacity: 0, y: -4 });
    draw('.gable .gb-fin', { opacity: 1, duration: 0.6 }, 2.9);
    draw('.pk-thresh', { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 1.2, { scaleX: 0 });
  }

  // Virtual layout: page i rests at r (and at r + over when its content is taller than the screen).
  function layout() {
    vw = innerWidth;
    vh = innerHeight;
    let y = 0;
    pages.forEach((p) => {
      p.over = Math.max(0, Math.round(p.pg.offsetHeight - vh));
      p.r = y;
      y += p.over + GAP * vh;
    });
  }
  // Steps: one per page, plus a "deep" step for a page that overflows.
  const steps = () => pages.flatMap((p) => (p.over > 8 ? [{ p, y: p.r }, { p, y: p.r + p.over }] : [{ p, y: p.r }]));

  // The engine state: A is the page at rest (or leaving), B the page arriving; each page reads its own virtual y.
  // offA / offB pin a page's content offset during a jump (null: follow its virtual y).
  const st = { A: null, yA: 0, offA: null, B: null, yB: 0, offB: null, T: 0 };
  const hidden = (p) => (p.i === 0 ? 1e9 : -1e9);
  const yOf = (p) => (p === st.A ? st.yA : p === st.B ? st.yB : hidden(p));

  const e = (x) => ease(clamp(x));
  const put = (list, v) => {
    const k = v.toFixed(3);
    for (const c of list) {
      if (c.key === k) continue;
      c.key = k;
      if (c.fade) c.el.style.setProperty('--co', k); else c.el.style.opacity = k;
    }
  };
  const setT = (el, v) => { el.style.transform = v; };

  function update() {
    queued = false;
    if (!started) return;
    const G = GAP * vh;
    const d = vh * DRIFT;
    let liveP = null;
    let liveOp = 0.02;
    for (const p of pages) {
      const y = yOf(p);
      const isLast = p.i === last;
      const u = clamp((y - (p.r - G)) / G);
      const uo = isLast ? 0 : clamp((y - (p.r + p.over)) / G);
      let wIn = e((u - 0.5) / 0.42);
      let oIn = e((u - 0.24) / 0.6);
      if (p.i === 0) wIn = oIn = Math.min(1, intro.v);
      const wOut = e((uo - 0.04) / 0.4);
      const oOut = e((uo - 0.12) / 0.6);
      const w = wIn * (1 - wOut);
      const o = oIn * (1 - oOut);
      p.w = w;
      p.o = o;
      const any = Math.max(w, o);

      const sc = (1 + 0.02 * (1 - oIn)) * (1 - 0.025 * oOut);
      const off = p === st.A && st.offA !== null ? st.offA : p === st.B && st.offB !== null ? st.offB : -range(y - p.r, 0, p.over);
      const ty = off + (1 - oIn) * vh * 0.04 - oOut * vh * 0.03;
      const key = `${any > 0 ? 1 : 0}|${ty.toFixed(1)}|${sc.toFixed(4)}`;
      if (key !== p.key) {
        p.key = key;
        p.pg.style.opacity = any > 0 ? '1' : '0';
        p.pg.style.visibility = any > 0 ? '' : 'hidden';
        p.pg.style.setProperty('--ty', `${ty.toFixed(1)}px`);
        p.pg.style.transform = sc === 1 ? `translate3d(0,${ty.toFixed(1)}px,0)` : `translate3d(0,${ty.toFixed(1)}px,0) scale(${sc.toFixed(4)})`;
      }
      const pe = w > 0.6 ? 'auto' : 'none';
      if (pe !== p.pe) { p.pe = pe; p.pg.style.pointerEvents = pe; p.pg.classList.toggle('on', pe === 'auto'); }
      put(p.words, w);
      put(p.orn, o);
      if (!p.revealed && wIn > 0.02) reveal(p);
      if (any > liveOp) { liveOp = any; liveP = p; }
      const idle = any === 0;
      if (idle !== p.idle) { p.idle = idle; p.el.classList.toggle('idle', idle); }

      const moving = (oIn > 0 && oIn < 1) || (oOut > 0 && oOut < 1);
      const k0 = (1 - oIn) * d - oOut * d;
      const R = (1 - oIn) * 7 - oOut * 5;
      for (const de of p.depth) {
        const ek = moving ? `${k0.toFixed(1)}|${R.toFixed(2)}` : 'rest';
        if (ek === de.key) continue;
        de.key = ek;
        if (!moving) { setT(de.el, 'none'); continue; }
        const Y = (de.k - 1) * k0;
        setT(de.el, `translate3d(0,${Y.toFixed(1)}px,0)${de.tilt ? ` perspective(1000px) rotateX(${R.toFixed(2)}deg)` : ''}`);
      }

      const uk = wOut.toFixed(3);
      if (uk !== p.uoKey) {
        p.uoKey = uk;
        p.lns.forEach((l, k) => {
          const x = uo > 0 ? ease(clamp((uo - 0.04 - 0.03 * k) / 0.34)) : 0;
          if (x > 0) { l.style.transform = `translate3d(0,${(-14 * x).toFixed(2)}px,0)`; l.style.opacity = (1 - x).toFixed(3); }
          else { l.style.transform = ''; l.style.opacity = ''; }
        });
      }

      const crossed = u >= 0.3;
      if (p.crossed === null) p.crossed = crossed;
      else if (crossed !== p.crossed) { p.crossed = crossed; hooks.cross?.(p, false); }

      const rest = w > 0.98 && wOut < 0.02 && !busy;
      if (rest !== p.rest) { p.rest = rest; if (rest) fire(p.el, 'pg:rest'); }
      if (any > 0) p.seen = true;
      else if (p.seen) { p.seen = false; fire(p.el, 'pg:leave'); }
    }
    if (liveP && !liveP.live) {
      pages.forEach((q) => { if (q.live !== (q === liveP)) { q.live = q === liveP; q.el.classList.toggle('live', q.live); } });
      hooks.live?.(liveP.el.id);
    }
    const ck = (1 - pages[0].o).toFixed(3);
    if (ck !== crestKey) { crestKey = ck; frame?.style.setProperty('--crest', ck); }
    if (veil) veil.style.opacity = busy ? (Math.sin(Math.PI * st.T) * 0.55).toFixed(3) : '0';
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };

  if (RM) {
    const crest = () => {
      const c = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.5))).toFixed(2);
      if (c !== crestKey) { crestKey = c; frame?.style.setProperty('--crest', c); }
    };
    addEventListener('scroll', crest, { passive: true });
    crest();
    // Reduced motion: the r13 scrolling document; goPage jumps there (used by the autopilot and the calendar menu).
    const goPage = (el, deep = false) => { scrollTo(0, el.getBoundingClientRect().top + scrollY + (deep ? Math.max(0, el.offsetHeight - innerHeight) : 0)); return Promise.resolve(); };
    addEventListener('pg:deep', (ev) => { if (ev.detail) goPage(ev.detail, true); });
    return { start() {}, pages: pages.map((p) => p.el), go: () => Promise.resolve(), goPage, next() {}, prev() {}, get index() { return 0; }, get busy() { return false; }, get y() { return scrollY; }, rest: (el) => ({ r: el.offsetTop, over: Math.max(0, el.offsetHeight - innerHeight) }) };
  }

  document.documentElement.classList.add('paged');
  let at = 0;
  let tw = null;
  let pending = null;
  let navigated = false;
  let stale = false;
  const nx = document.getElementById('nx');
  const srEl = document.getElementById('pgsr');

  const DUR = VIDEO ? 1.4 : 1.1;
  const DEEP = 0.75;
  const stepIndex = (p, deep) => { const S = steps(); const k = S.findIndex((s) => s.p === p && (!deep || s.y > p.r)); return k < 0 ? 0 : k; };

  // Move to step k. Returns a promise that resolves when the move has finished (or at once if nothing to do).
  function go(k, { dur } = {}) {
    const S = steps();
    k = Math.max(0, Math.min(S.length - 1, k));
    if (!started || k === at && !busy) return Promise.resolve();
    if (busy) { pending = k; return new Promise((res) => { const t = setInterval(() => { if (!busy && pending === null) { clearInterval(t); res(); } }, 50); }); }
    const from = S[at];
    const to = S[k];
    const fwd = k > at;
    const same = from.p === to.p;
    const G = GAP * vh;
    busy = true;
    navigated = true;
    at = k;
    hooks.leaving?.(from.p.el.id, to.p.el.id);
    const P = { T: 0 };
    const D = RM ? 0 : (dur ?? (same ? DEEP : DUR));
    if (!same && !to.p.revealed) reveal(to.p, 0.45 * D);
    return new Promise((res) => {
      const apply = () => {
        const T = P.T;
        st.T = same ? 0 : T;
        if (same) { st.A = from.p; st.B = null; st.offA = null; st.yA = from.y + (to.y - from.y) * T; }
        else {
          st.A = from.p; st.B = to.p; st.offA = from.p.r - from.y; st.offB = to.p.r - to.y;
          if (fwd) { st.yA = from.p.r + from.p.over + T * G; st.yB = to.p.r - G + T * G; }
          else { st.yA = from.p.r - T * G; st.yB = to.p.r + to.p.over + G - T * G; }
        }
        update();
      };
      tw = gsap.to(P, {
        T: 1, duration: D, ease: same ? 'power2.inOut' : 'power1.inOut', onUpdate: apply,
        onComplete: () => {
          tw = null;
          st.A = to.p; st.yA = to.y; st.offA = null; st.B = null; st.offB = null; st.T = 0;
          busy = false;
          if (stale) { stale = false; relayout(); }
          update();
          settleFocus(to.p);
          nxState();
          res();
          if (pending !== null) { const n = pending; pending = null; go(n); }
        },
      });
      apply();
    });
  }
  const step = (dir) => go(busy ? (pending ?? at) + dir : at + dir);
  const goPage = (el, deep = false) => go(stepIndex(pages.find((p) => p.el === el), deep));

  // After a move, focus must not stay on a control of a page that is no longer shown.
  function settleFocus(p) {
    const a = document.activeElement;
    if (a && a !== document.body && !p.el.contains(a) && a.closest?.('.page')) { p.pg.tabIndex = -1; p.pg.focus({ preventScroll: true }); }
    if (srEl) srEl.textContent = p.el.getAttribute('aria-label') || '';
  }
  function nxState() {
    if (!nx) return;
    const endOf = at === steps().length - 1;
    if (endOf && document.activeElement === nx) { const p = steps()[at].p; p.pg.tabIndex = -1; p.pg.focus({ preventScroll: true }); }
    nx.hidden = endOf;
    nx.classList.toggle('cue', !navigated);
  }

  // ---- input ----
  const inGate = () => document.body.matches('.locked, .opening') || !!document.getElementById('gate');
  const blocked = (t) => hooks.blockSwipe?.(t) || !!t?.closest?.('input, textarea, select, [contenteditable]');

  // Wheel and trackpad: one step per gesture. A gesture ends after 220 ms of silence; the inertia tail of a
  // trackpad flick never starts a second step, but a clearly new swipe inside the tail (3x the tail's smallest delta) does.
  let acc = 0, lastT = 0, minMag = Infinity, armed = true;
  addEventListener('wheel', (ev) => {
    if (inGate() || ev.ctrlKey) return;
    ev.preventDefault();
    const now = performance.now();
    const unit = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? innerHeight : 1;
    const dy = (Math.abs(ev.deltaY) >= Math.abs(ev.deltaX) ? ev.deltaY : 0) * unit;
    const mag = Math.abs(dy);
    if (now - lastT > 220) { armed = true; acc = 0; minMag = Infinity; }
    else if (!armed && !busy && mag > Math.max(24, 3 * minMag)) { armed = true; acc = 0; }
    lastT = now;
    minMag = Math.min(minMag, mag || minMag);
    if (!armed) return;
    acc += dy;
    if (Math.abs(acc) >= 40) {
      armed = false; minMag = mag;
      if (!busy || pending === null) step(Math.sign(acc));
      acc = 0;
    }
  }, { passive: false });

  // Touch: a vertical swipe of 56 px (or a 24 px flick faster than 0.3 px/ms) is one step; nothing follows the finger.
  let t0 = null;
  addEventListener('touchstart', (ev) => {
    if (ev.touches.length !== 1 || inGate()) { t0 = null; return; }
    const t = ev.touches[0];
    t0 = blocked(ev.target) ? null : { x: t.clientX, y: t.clientY, t: performance.now(), done: false };
  }, { passive: true });
  addEventListener('touchmove', (ev) => {
    if (ev.touches.length === 1 && !inGate()) ev.preventDefault();
    if (!t0 || t0.done || ev.touches.length !== 1) return;
    const t = ev.touches[0];
    const dx = t.clientX - t0.x;
    const dy = t.clientY - t0.y;
    if (Math.abs(dy) >= 56 && Math.abs(dy) > 1.2 * Math.abs(dx)) { t0.done = true; step(dy < 0 ? 1 : -1); }
  }, { passive: false });
  addEventListener('touchend', (ev) => {
    if (!t0 || t0.done) { t0 = null; return; }
    const t = ev.changedTouches[0];
    const dx = t.clientX - t0.x;
    const dy = t.clientY - t0.y;
    const v = Math.abs(dy) / Math.max(1, performance.now() - t0.t);
    if (Math.abs(dy) >= 24 && v > 0.3 && Math.abs(dy) > 1.2 * Math.abs(dx)) step(dy < 0 ? 1 : -1);
    t0 = null;
  }, { passive: true });
  addEventListener('touchcancel', () => { t0 = null; }, { passive: true });

  addEventListener('keydown', (ev) => {
    if (inGate() || ev.defaultPrevented || ev.repeat || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    const t = ev.target;
    const onControl = t?.closest?.('button, a, [role="button"], input, textarea, select');
    let dir = 0;
    if (['ArrowDown', 'PageDown'].includes(ev.key) || (ev.key === ' ' && !ev.shiftKey && !onControl)) dir = 1;
    else if (['ArrowUp', 'PageUp'].includes(ev.key) || (ev.key === ' ' && ev.shiftKey && !onControl)) dir = -1;
    else if (ev.key === 'Home') { ev.preventDefault(); go(0); return; }
    else if (ev.key === 'End') { ev.preventDefault(); go(steps().length - 1); return; }
    if (!dir || blocked(t)) return;
    ev.preventDefault();
    step(dir);
  });

  nx?.addEventListener('click', () => step(1));
  addEventListener('pg:deep', (ev) => { if (ev.detail) goPage(ev.detail, true); });

  addEventListener('focusin', (ev) => {
    const p = pages.find((q) => q.el.contains(ev.target));
    if (!p || !started || busy) return;
    const deep = p.over > 8 && ev.target.getBoundingClientRect().bottom > innerHeight - 8;
    const k = stepIndex(p, deep);
    if (k !== at) go(k);
  });

  // Relayout keeps the current step; a move in flight snaps to its end first.
  const relayout = () => {
    if (!started) { layout(); return; }
    if (tw) { tw.progress(1); }
    const cur = steps()[at];
    const deep = cur && cur.y > cur.p.r;
    layout();
    at = cur ? stepIndex(cur.p, deep) : 0;
    const S = steps();
    st.A = S[at].p; st.yA = S[at].y; st.B = null;
    schedule();
  };
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(relayout, 120); });
  addEventListener('relayout', relayout);
  pages.forEach((p) => new ResizeObserver(() => { if (!started) return; if (busy) stale = true; else relayout(); }).observe(p.pg));
  document.fonts?.ready.then(relayout);
  layout();

  return {
    start() {
      started = true;
      layout();
      st.A = pages[0]; st.yA = 0;
      gsap.to(intro, { v: 1, duration: 0.9, ease: 'power1.inOut', onUpdate: update, onComplete: update });
      drawInvite();
      update();
      nxState();
    },
    pages: pages.map((p) => p.el),
    go: (k, o) => go(k, o),
    goPage,
    next: () => step(1),
    prev: () => step(-1),
    get index() { return at; },
    get busy() { return busy; },
    get y() { return st.A ? yOf(st.A) : 0; },
    rest: (el) => { const p = pages.find((q) => q.el === el); return { r: p.r, over: p.over }; },
  };
}
