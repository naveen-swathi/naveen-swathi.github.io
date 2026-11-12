export const mulberry32 = (a) => () => {
  a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const CELLS = { marigold: [0, 1, 2, 3], rose: [4, 5, 6, 7], jasmine: [8, 9, 10, 11] };
const SIZE = { jasmine: [14, 18], marigold: [15, 20], rose: [16, 21] };
const PLANES = [
  { n: 'far', share: 0.3, sz: 0.7, al: 0.55, v: [24, 32], k: 0.06 },
  { n: 'mid', share: 0.45, sz: 1, al: 0.82, v: [38, 50], k: 0.12 },
  { n: 'near', share: 0.25, sz: 1.3, al: 0.95, v: [55, 70], k: 0.22 },
];
const PAPER_MIX = { jasmine: 0.55, rose: 0.35, marigold: 0.10 };
const JASMINE = { jasmine: 1, marigold: 0, rose: 0 };
const SCENE_MIX = { jasmine: 0.55, rose: 0.35, marigold: 0.10 };
const TARGET = { gate: 4, invite: 6, date: 5, blessings: 6, thennow: 4, reception: 6, savedate: 5, closing: 10 };
const SCENES = new Set(['gate', 'date', 'reception', 'closing']);
const CAP = [48, 28, 14];
const WEST = document.documentElement.dataset.look === 'western';
const WEST_MIX = { rose: 0.55, jasmine: 0.45, marigold: 0 };
const NOOP = { setPage() {}, setTarget() {}, setScrollSource() {}, hush() {}, gate() {}, burst() {}, cross() {}, pause() {}, resume() {}, tier: 3 };

export function createBlossoms({ gsap, RM, VIDEO, rng = Math.random }) {
  if (RM) return NOOP;
  const cv = document.querySelector('#petals');
  const ctx = cv.getContext('2d');
  const lite = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 3 || navigator.connection?.saveData;
  let tier = lite ? 1 : 0;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let sc = 1;
  let hs = 1;
  let atlas = null;
  let fallback = false;
  const petals = [];
  const queue = [];
  let page = 'gate';
  let target = TARGET.gate;
  let hushed = false;
  let paused = false;
  let running = false;
  let t = 0;
  let acc = 0;
  let scrollSrc = () => scrollY;
  let lastY = scrollSrc();
  let lastInput = performance.now();
  let slow = 0.016;
  let bad = 0;
  let lastCross = -9999;

  const R = (a, b) => a + rng() * (b - a);
  const pick = (w) => { let x = rng(); for (const k in w) { x -= w[k]; if (x <= 0) return k; } return 'jasmine'; };

  function size() {
    dpr = tier === 0 ? Math.min(devicePixelRatio || 1, 2) : Math.min(1.5, devicePixelRatio || 1);
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    sc = Math.min(1.15, Math.max(0.9, innerWidth / 390));
    hs = innerHeight / 844;
  }
  size();
  addEventListener('resize', size);

  function buildAtlas(img, extra) {
    const o = document.createElement('canvas');
    o.width = 576;
    o.height = 192;
    const c = o.getContext('2d');
    c.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--petal-shadow').trim() || 'rgba(58,36,23,.28)';
    c.shadowBlur = 3;
    c.shadowOffsetY = 1;
    if (img) c.drawImage(img, 0, 0);
    extra?.(c);
    atlas = o;
  }
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  loadImg('img/blooms.webp').then(async (i) => { await i.decode?.().catch(() => {}); buildAtlas(i); }).catch(async () => {
    fallback = true;
    const imgs = await Promise.all([1, 2, 3, 4].map((n) => loadImg(`img/petal-${n}.png`).catch(() => null)));
    buildAtlas(null, (c) => imgs.forEach((im, i) => {
      if (!im) return;
      const s = Math.min(88 / im.naturalWidth, 88 / im.naturalHeight);
      const w = im.naturalWidth * s;
      const h = im.naturalHeight * s;
      c.drawImage(im, ((8 + i) % 6) * 96 + (96 - w) / 2, 96 + (96 - h) / 2, w, h);
    }));
  });

  const cap = () => CAP[tier];
  const planeOf = () => {
    const r = rng();
    if (tier >= 1) return r < 0.4 ? PLANES[0] : PLANES[1];
    return r < 0.3 ? PLANES[0] : r < 0.75 ? PLANES[1] : PLANES[2];
  };

  function make(x, y, mix, plane) {
    const kind = fallback ? 'jasmine' : pick(WEST ? WEST_MIX : mix);
    const cells = CELLS[kind];
    const pl = plane || planeOf();
    const [s0, s1] = SIZE[kind];
    const vT = R(pl.v[0], pl.v[1]) * hs;
    return {
      x0: x, y, A: R(10, 26), w: R(0.8, 1.6), ph: R(0, 6.28), dx: 0, vx: 0, vy: vT * 0.6, vT,
      rot: R(0, 6.28), spin: (rng() < 0.5 ? -1 : 1) * R(25, 80) * Math.PI / 180,
      th: R(0, 6.28), wf: R(1.2, 2.6), pl, cell: cells[Math.floor(rng() * cells.length)],
      size: R(s0, s1) * pl.sz * sc, age: 0, seam: false, kd: 0.94, life: 0, amb: false, born: t,
    };
  }

  function room(n) {
    let over = petals.length + n - cap();
    for (let i = 0; i < petals.length && over > 0; i++) if (petals[i].amb) { petals.splice(i--, 1); over--; }
    return over > 0 ? n - over : n;
  }

  function spawnAmbient() {
    if (room(1) < 1) return;
    const mix = page === 'gate' ? JASMINE : SCENES.has(page) ? SCENE_MIX : PAPER_MIX;
    const p = make(W * R(0.06, 0.94), -R(24, 64), mix);
    p.amb = true;
    petals.push(p);
  }

  function spawnBurst(spec) {
    if (room(1) < 1) return;
    const mix = spec.mix || PAPER_MIX;
    let p;
    if (spec.from === 'seam') {
      p = make(W / 2 + R(-10, 10), H * R(0.35, 0.65), spec.mix || SCENE_MIX, PLANES[2]);
      const side = spec.i % 2 ? 1 : -1;
      p.vx = side * R(60, 180);
      p.vy = -R(40, 140);
      p.seam = true;
      p.kd = 0.975;
      p.life = 6;
      p.x0 = W / 2 + R(-10, 10);
    } else if (spec.from && typeof spec.from === 'object') {
      p = make(spec.from.x, spec.from.y, mix);
      p.vx = (rng() < 0.5 ? -1 : 1) * R(20, 80);
      p.vy = -R(60, 140);
      p.life = spec.life || 6;
    } else {
      const seed = spec.i % 2 === 1;
      p = make(W * R(0.08, 0.92), seed ? H * R(0.02, 0.25) : -R(10, 40), mix);
      p.vy = p.vT * (seed ? 1.2 : 2.8);
      p.life = spec.life || 6;
    }
    petals.push(p);
  }

  const idleMul = () => { const s = (performance.now() - lastInput) / 1000; return s > 90 ? 0 : s > 30 ? 0.5 : 1; };
  const eff = () => (hushed || tier === 2 ? 0 : target * (tier === 1 ? 0.6 : 1) * idleMul());

  function wake() {
    if (running || paused || document.hidden) return;
    running = true;
    lastY = scrollSrc();
    gsap.ticker.add(tick);
  }
  function sleep() { if (running) { running = false; gsap.ticker.remove(tick); } }

  function tick(_, deltaMs) {
    const dt = Math.min(0.05, (deltaMs || 16.7) / 1000);
    t += dt;
    const raw = (deltaMs || 16.7) / 1000;
    slow = slow * 0.9 + Math.min(raw, 0.2) * 0.1;
    bad = slow > 0.024 && petals.length > 6 ? bad + raw : 0;
    if (bad > 1.5 && tier < 2) { tier++; bad = 0; slow = 0.016; size(); }

    for (let i = queue.length - 1; i >= 0; i--) {
      queue[i].t -= dt;
      if (queue[i].t <= 0) { const q = queue.splice(i, 1)[0]; spawnBurst(q.spec); }
    }
    const e = eff();
    const amb = petals.length;
    if (e > 0 && amb < Math.ceil(e)) {
      acc += dt;
      if (acc >= (H + 60) / (44 * hs) / Math.max(1, e) || amb === 0) { acc = 0; spawnAmbient(); }
    }

    const sy = scrollSrc();
    const dy = sy - lastY;
    lastY = sy;
    const sw = Math.abs(dy) > 200 ? 0 : Math.max(-60, Math.min(60, dy));
    const wind = 8 * Math.sin(0.13 * t) + 5 * Math.sin(0.31 * t + 1.7);
    const k2 = Math.min(1, 2.2 * dt);
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.age += dt;
      p.vy += (p.vT - p.vy) * k2;
      p.vx *= Math.pow(p.kd, 60 * dt);
      p.dx += (wind + p.vx) * dt;
      p.y += p.vy * dt - sw * p.pl.k;
      p.rot += p.spin * dt;
      p.th += p.wf * dt;
      if (p.y > H + 30 || p.y < -400 || (p.life && p.age > p.life + 0.8)) petals.splice(i, 1);
    }
    draw();
    if (!petals.length && !queue.length && e === 0) sleep();
  }

  function draw() {
    if (!atlas) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of petals) {
      const x = p.x0 + p.A * Math.sin(p.w * p.age + p.ph) + p.dx;
      const c = Math.cos(p.rot);
      const s = Math.sin(p.rot);
      const cs = Math.cos(p.th);
      const sx = 0.3 + 0.7 * Math.abs(cs);
      const grow = p.seam ? (p.age < 1.2 ? 0.6 + 0.9 * (p.age / 1.2) : p.age < 1.6 ? 1.5 - 0.5 * ((p.age - 1.2) / 0.4) : 1) : 1;
      const sz = p.size * (96 / 88) * grow;
      let a = p.pl.al * Math.min(1, p.age / 0.6) * Math.min(1, Math.max(0, (H - p.y) / (0.12 * H)));
      if (cs < 0) a *= 0.85;
      if (p.life && p.age > p.life) a *= 1 - (p.age - p.life) / 0.8;
      if (a <= 0.01) continue;
      ctx.globalAlpha = a;
      ctx.setTransform(dpr * c * sx, dpr * s * sx, -dpr * s, dpr * c, dpr * x, dpr * p.y);
      ctx.drawImage(atlas, (p.cell % 6) * 96, Math.floor(p.cell / 6) * 96, 96, 96, -sz / 2, -sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  function enqueue(n, spec, win) {
    n = Math.round(n * (tier === 2 ? 0.4 : 1));
    for (let i = 0; i < n; i++) queue.push({ t: (i / Math.max(1, n)) * win + R(0, 0.05), spec: { ...spec, i } });
    wake();
  }

  const touch = () => { lastInput = performance.now(); wake(); };
  ['scroll', 'touchstart', 'pointerdown', 'keydown', 'wheel'].forEach((ev) => addEventListener(ev, touch, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) sleep(); else wake(); });

  if (!VIDEO) {
    let last = null;
    const move = (x, y, now) => {
      if (last) {
        const dtp = Math.max(8, now - last.t) / 1000;
        const vx = (x - last.x) / dtp;
        const vy = (y - last.y) / dtp;
        const v = Math.min(Math.hypot(vx, vy), 1500);
        if (v > 60) {
          const r = cv.getBoundingClientRect();
          const px = x - r.left;
          const py = y - r.top;
          const n = Math.hypot(vx, vy) || 1;
          for (const p of petals) {
            const pxp = p.x0 + p.A * Math.sin(p.w * p.age + p.ph) + p.dx;
            const d = Math.hypot(pxp - px, p.y - py);
            if (d < 80) { const f = 1 - d / 80; p.vx += (vx / n) * f * v * 0.35; p.vy += (vy / n) * f * v * 0.2; }
          }
        }
      }
      last = { x, y, t: now };
    };
    addEventListener('pointermove', (e) => move(e.clientX, e.clientY, e.timeStamp), { passive: true });
    addEventListener('touchmove', (e) => { const q = e.touches[0]; if (q) move(q.clientX, q.clientY, e.timeStamp); }, { passive: true });
    addEventListener('pointerup', () => { last = null; }, { passive: true });
  }

  return {
    setPage(id) { page = id; target = TARGET[id] ?? 4; touch(); },
    setTarget(n) { target = n; touch(); },
    setScrollSource(fn) { scrollSrc = fn; lastY = fn(); },
    hush(on) { hushed = on; touch(); },
    gate(on) { cv.classList.toggle('over-gate', on); },
    burst(n, opts = {}) {
      let from = opts.from || 'top';
      if (from && typeof from === 'object') { const r = cv.getBoundingClientRect(); from = { x: from.x - r.left, y: from.y - r.top }; }
      enqueue(n, { from, mix: opts.mix, life: opts.life }, opts.window ?? 1.2);
    },
    cross(_p, sceneArrival) {
      const now = performance.now();
      if (now - lastCross < 1200) return;
      lastCross = now;
      enqueue(sceneArrival ? 6 : 5, { from: 'top', life: 3.5 }, 0.8);
    },
    pause() { paused = true; sleep(); },
    resume() { paused = false; wake(); },
    get tier() { return tier; },
  };
}
