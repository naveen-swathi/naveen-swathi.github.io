// Option 5 "Real dove": the four page scenes ("a pair that builds a nest") and the desktop side doves, with their motion.
// Same contract as the site's dove.js: doveScene(page, host, opts) -> { prime, enter, live, finish, still, lift, destroy, apply }.
// Motion is GSAP tweening plain pose objects; apply() writes them once per tick. Only transforms and opacity are animated.
import { createDove, place, pose, beak, POSES, dropOpenWings, ensureDefs, use, bough, cluster, sprig, twig, nestBack, nestFront, jasString, strand, ribbon, bow, heart, f, P, rng, at } from './real-dove.js';

const SVGNS = 'http://www.w3.org/2000/svg';
let clipN = 0;
function svgIn(host, vb) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', vb); s.setAttribute('class', 'dv-svg'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  host.appendChild(s);
  return s;
}
function layer(parent, html = '', cls = '', tr = '') {
  const g = document.createElementNS(SVGNS, 'g');
  if (cls) g.setAttribute('class', cls);
  if (tr) g.setAttribute('transform', tr);
  g.innerHTML = html;
  parent.appendChild(g);
  return g;
}

// ---- motion primitives ----
export function flaps(gsap, b, n, period = 0.5, top = -84, bottom = -222) {
  const tl = gsap.timeline();
  for (let i = 0; i < n; i++) {
    const per = period * (1 + i * 0.12);
    tl.to(b.p, { wing: bottom, fan: 0.84, far: 10, duration: per * 0.42, ease: 'power2.in' })
      .to(b.p, { wing: top, fan: 1, far: -4, duration: per * 0.58, ease: 'sine.out' });
  }
  return tl;
}
const breathe = (gsap, b, { delay = 0, period = 3.2, bob = 0, base = -100 } = {}) => gsap.timeline({ repeat: -1, yoyo: true, delay })
  .fromTo(b.p, { wing: base + 6, fan: 0.95, bob: -1 * bob, tail: 0.76 }, { wing: base - 6, fan: 0.88, bob: 1.2 * bob, tail: 0.68, duration: period / 2, ease: 'sine.inOut' });
const sitBreath = (gsap, b, delay = 0) => gsap.timeline({ repeat: -1, yoyo: true, delay }).to(b.p, { breath: 1, duration: 2.3, ease: 'sine.inOut' });
const nod = (gsap, b, { every = 9, depth = 12, delay = 3, base = {} } = {}) => gsap.timeline({ repeat: -1, repeatDelay: every, delay })
  .to(b.p, { head: (base.head || 0) + depth, pitch: (base.pitch || 0) + depth * 0.25, duration: 1.2, ease: 'sine.inOut' })
  .to(b.p, { head: base.head || 0, pitch: base.pitch || 0, duration: 1.4, ease: 'sine.inOut' }, '+=0.6');

// drifting petals: n petals (<= 6) falling through [x0, x1] from y0 and gone by y1
function petals(parent, n, { x0, x1, y0, y1, seed = 9, size = 1 }) {
  const r = rng(seed), g = layer(parent, '', 'rd-petals'), items = [];
  for (let i = 0; i < Math.min(6, n); i++) {
    const e = layer(g, use(i % 3 === 2 ? 'pjs' : 'ppk', 0, 0, 10 * size * (0.8 + r() * 0.4), r() * 180));
    e.style.opacity = 0;
    items.push({ e, x: x0 + (x1 - x0) * ((i + 0.5) / n) + (r() - 0.5) * 20, dur: 9 + r() * 3, delay: i * 1.9 + r() * 1.2, sway: 8 + r() * 10, spin: 120 + r() * 200 });
  }
  return (gsap) => items.map((it) => gsap.timeline({ repeat: -1, delay: it.delay })
    .fromTo(it.e, { x: it.x, y: y0, rotation: 0, opacity: 0 }, { y: y1, rotation: it.spin, duration: it.dur, ease: 'none' }, 0)
    .to(it.e, { x: it.x + it.sway, duration: it.dur / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
    .to(it.e, { opacity: 0.9, duration: 1.2 }, 0)
    .to(it.e, { opacity: 0, duration: 1.6 }, it.dur - 1.8));
}

export function doveScene(page, host, opts = {}) {
  ensureDefs();
  const birds = [], ticks = [], idles = [];
  const w = host.getBoundingClientRect().width || (typeof innerWidth === 'number' ? innerWidth * 0.8 : 320);
  let tl = null, ticking = false, held = false, isLive = true, gsapRef = null, started = false, entering = false, lifting = null, liftAt = -9;
  const bird = (parent, { x, y, s, flip = false, bride = false, pose: ps = 'perch', carry = null, extra = {}, tq = 1 }) => {
    const d = createDove(parent, { x, y, s: bride ? s * 0.95 : s, flip, bride, carry, tq });
    const p = Object.assign({}, POSES.perch, POSES[ps], extra, { x, y });
    const b = { d, p, apply() { place(d, p.x, p.y, d.s, flip); pose(d, p); } };
    b.apply(); birds.push(b);
    return b;
  };
  const apply = () => { birds.forEach((b) => b.apply()); ticks.forEach((fn) => fn()); };
  // Phones redraw the idle breathing at half rate (the entrance and every other state at full rate).
  const half = typeof matchMedia === 'function' && matchMedia('(max-width: 519px)').matches;
  let tk = 0;
  const tick = () => { if (!half || entering || (tk++ & 1) === 0) apply(); };
  const tickOn = (on) => { if (!gsapRef || on === ticking) return; ticking = on; gsapRef.ticker[on ? 'add' : 'remove'](tick); };
  const sync = () => tickOn(!held && started && (isLive || entering));
  const fin = {};
  let build = () => null;

  // y of a cubic bough at x (bisection on t; boughs run left to right)
  const yAt = (c, x) => { let a = 0, b = 1; for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if (at(c, m)[0] < x) a = m; else b = m; } return at(c, (a + b) / 2)[1]; };
  const FOOT = 27.4; // perched feet line in dove units

  if (page === 'invite') {
    // Arrival: the pair flies in bearing a jasmine string with a frangipani pendant; blossom ties hang where the string meets each beak
    const svg = svgIn(host, '0 0 350 176');
    const fall = petals(svg, 5, { x0: 112, x1: 238, y0: 108, y1: 164, seed: 4 });
    const L = bird(svg, { x: 92, y: 120, s: 0.8, pose: 'hover', extra: { head: 3, pitch: -9, wing: -96 } });
    const R = bird(svg, { x: 258, y: 118, s: 0.8, flip: true, bride: true, pose: 'hover', extra: { head: 9, pitch: -6, wing: -106, fan: 0.9 } });
    const str = layer(svg, '', 'rd-string');
    const pend = layer(svg, `<g class="rd-pend-in"><path d="M0 1L0 13" stroke="#DCCFB8" stroke-width=".5"/>${use('leaf', -2, 2, 8, 160)}${use('leafl', 2, 2, 8, 20)}${use('pk', -6.4, 3, 3.6, 20)}${use('pk', 6.4, 3, 3.6, 50)}${use('fr', 0, 5, 7)}${use('mari', 0, 16, 3.8)}${use('pkbud', 0, 21, 3.6, 180)}</g>`, 'rd-pend');
    const pendIn = pend.firstChild;
    // a blossom tie: leaves, two pink blooms, a jasmine bud and a pink bud hanging from the string's end
    const tie = (x, y, m) => `<g transform="translate(${f(x)} ${f(y)}) scale(${m} 1)">${use('leaf', 0, 1, 9, 120)}${use('leafl', 0, 1, 8, 70)}${use('pk', -1.4, 4.4, 4.2, 10)}${use('pk', 3.6, 2, 3.2, 40)}${use('jbud', -3.6, 2, 3.4, 160)}${use('pkbud', 0.6, 8.4, 3, 180)}</g>`;
    const st = { draw: 1, sway: 0, drop: 1 };
    let last = '', mid = { x: 175, y: 104 };
    ticks.push(() => {
      const a = beak(L.d), b = beak(R.d);
      const key = [a.x, a.y, b.x, b.y].map((v) => v.toFixed(1)).join();
      if (key !== last && st.draw > 0) {
        last = key;
        const sag = 7;
        str.innerHTML = jasString(a.x, a.y + 0.6, b.x, b.y + 0.6, sag, 0.95) + tie(a.x + 1, a.y + 1, 1) + tie(b.x - 1, b.y + 1, -1);
        mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + sag + 0.6 };
      }
      pend.setAttribute('transform', `translate(${f(mid.x)} ${f(mid.y)})`);
      pendIn.setAttribute('transform', `rotate(${f(st.sway)}) translate(0 ${f(-14 * (1 - st.drop))})`);
      pend.style.opacity = f(Math.min(1, st.drop * 1.6));
    });
    const cp = document.createElementNS(SVGNS, 'clipPath'); cp.id = `rd-str-clip-${++clipN}`;
    const r1 = document.createElementNS(SVGNS, 'rect'), r2 = document.createElementNS(SVGNS, 'rect');
    [r1, r2].forEach((r) => { r.setAttribute('y', 0); r.setAttribute('height', 176); cp.appendChild(r); });
    svg.appendChild(cp); str.setAttribute('clip-path', `url(#${cp.id})`);
    ticks.push(() => { const wd = 56 * st.draw; r1.setAttribute('x', 118); r1.setAttribute('width', f(wd)); r2.setAttribute('x', f(232 - wd)); r2.setAttribute('width', f(wd)); });
    build = (gsap) => {
      st.draw = 0; st.drop = 0; L.p.x = -80; L.p.y = 46; R.p.x = 430; R.p.y = 40;
      return gsap.timeline()
        .to(L.p, { x: 92, duration: 2.6, ease: 'power2.out' }, 0).to(L.p, { y: 120, duration: 2.6, ease: 'sine.inOut' }, 0)
        .to(R.p, { x: 258, duration: 2.6, ease: 'power2.out' }, 0.18).to(R.p, { y: 118, duration: 2.6, ease: 'sine.inOut' }, 0.18)
        .add(flaps(gsap, L, 4, 0.55), 0).add(flaps(gsap, R, 4, 0.58), 0.18)
        .to(L.p, { wing: -96, fan: 0.94, pitch: -9, head: 3, duration: 0.8, ease: 'sine.out' }, 2.5)
        .to(R.p, { wing: -106, fan: 0.9, pitch: -6, head: 9, duration: 0.8, ease: 'sine.out' }, 2.7)
        .to(st, { draw: 1, duration: 1.6, ease: 'power1.inOut' }, 2.6)
        .to(st, { drop: 1, duration: 0.7, ease: 'power2.in' }, 3.6)
        .fromTo(st, { sway: 8 }, { sway: 0, duration: 2.2, ease: 'elastic.out(1, 0.35)' }, 4.2);
    };
    fin.idle = (gsap) => [breathe(gsap, L, { base: -96 }), breathe(gsap, R, { delay: 1.1, period: 3.6, base: -106 }),
      nod(gsap, L, { every: 9, depth: 6, delay: 2, base: { head: 3, pitch: -9 } }), nod(gsap, R, { every: 11, depth: 6, delay: 5, base: { head: 9, pitch: -6 } }),
      gsap.timeline({ repeat: -1, yoyo: true }).fromTo(st, { sway: -3 }, { sway: 3, duration: 2.6, ease: 'sine.inOut' }), ...fall(gsap)];
  }

  if (page === 'date') {
    // Gathering: the card hangs from a flowering bough; she tucks jasmine into the half-built nest, he flies in with a pink sprig
    const svg = svgIn(host, '0 0 330 124');
    const BC = [14, 106, 100, 100, 220, 107, 316, 86];
    const NX = 180, NY = yAt(BC, 180) - 8;
    const S = 0.88, GX = 118, BX = 240;
    const rib = (x) => { const y = yAt(BC, x); return ribbon(x, y, x, 121, 2.6, 1.4) + `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2" ry="2.8" fill="${P.rib2}"/>` + bow(x, 119.5, 0.8); };
    layer(svg, `<g class="rd-ribbon-l">${rib(70)}</g><g class="rd-ribbon-r">${rib(262)}</g>`);
    layer(svg, bough(BC, 4.6, 3.2, { seed: 8 }) + twig(44, 104, 36, 98, 30, 92, 1.4) + twig(292, 92, 298, 86, 302, 78, 1.3)
      + cluster(30, 92, 0.66, ['pk', 'jas', 'pk', 'fr'], { seed: 3, dir: -30 }) + cluster(300, 76, 0.64, ['fr', 'pk', 'jas', 'pk'], { seed: 6, dir: 20 })
      + use('leaf', 214, 105, 10, 20) + use('leafl', 150, 103, 9, -30) + use('pkbud', 222, 104, 4, -60) + use('jbud', 146, 102, 3.6, -10), 'rd-bough');
    layer(svg, `<g transform="translate(${NX} ${f(NY)})">${nestBack(52, 16, { seed: 31 })}</g>`, 'rd-nest-back');
    const fall = petals(svg, 3, { x0: 120, x1: 250, y0: 6, y1: 96, seed: 14 });
    const R = bird(svg, { x: BX, y: yAt(BC, BX) - FOOT * S * 0.95, s: S, flip: true, bride: true, pose: 'perch', carry: use('jbud', 1, 0.6, 4.6, 100) });
    const L = bird(svg, { x: GX, y: yAt(BC, GX) - FOOT * S, s: S, pose: 'perch', carry: sprig('pk') });
    const front = layer(svg, `<g transform="translate(${NX} ${f(NY)})">${nestFront(52, 16, { seed: 33, jas: 5, pink: false })}</g>`, 'rd-nest-front');
    const tucked = layer(front, use('jas', NX + 20, NY + 1, 4.4, 30), 'rd-tuck');
    const placed = layer(front, `<g transform="translate(${NX - 24} ${f(NY + 2)}) rotate(-28) scale(.8)">${sprig('pk')}</g>`, 'rd-placed');
    const fin0 = () => { L.d.carryG.style.opacity = 0; R.d.carryG.style.opacity = 0; tucked.style.opacity = 1; placed.style.opacity = 1; };
    fin.still = fin0; fin0();
    Object.assign(L.p, { head: 10, pitch: -4 }); Object.assign(R.p, { head: 14, pitch: -2 });
    build = (gsap) => {
      L.d.carryG.style.opacity = 1; R.d.carryG.style.opacity = 1; tucked.style.opacity = 0; placed.style.opacity = 0;
      Object.assign(L.p, POSES.glide, { x: -60, y: 44 });
      const gy = yAt(BC, GX - 6) - FOOT * S;
      return gsap.timeline()
        .fromTo(svg, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 2.2, ease: 'power2.out' }, 0)
        .fromTo(opts.card || {}, { y: 18 }, { y: 0, duration: 2.2, ease: 'power2.out' }, 0)
        // she bows and tucks a jasmine bud into the rim
        .to(R.p, { head: 32, pitch: 10, duration: 1.1, ease: 'sine.inOut' }, 0.9)
        .set(R.d.carryG.style, { opacity: 0 }, 2.0).set(tucked.style, { opacity: 1 }, 2.0)
        .to(R.p, { head: 14, pitch: -2, duration: 1.2, ease: 'sine.inOut' }, 2.1)
        // he flies in with the sprig, flares and lands
        .add(flaps(gsap, L, 4, 0.5, -90), 0.3)
        .to(L.p, { x: GX - 6, duration: 2.6, ease: 'power2.out' }, 0.3).to(L.p, { y: gy, duration: 2.6, ease: 'sine.inOut' }, 0.3)
        .to(L.p, { ...POSES.flare, duration: 0.45, ease: 'sine.out' }, 2.4)
        .to(L.p, { ...POSES.perch, duration: 0.9, ease: 'power2.inOut' }, 2.9)
        // a step toward the nest, then the sprig goes into the rim
        .to(L.p, { x: GX, y: yAt(BC, GX) - FOOT * S, duration: 0.5, ease: 'sine.inOut' }, 3.8)
        .to(L.p, { head: 32, pitch: 10, neck: 2, duration: 0.9, ease: 'sine.inOut' }, 4.3)
        .set(L.d.carryG.style, { opacity: 0 }, 5.2).set(placed.style, { opacity: 1 }, 5.2)
        .to(L.p, { head: 10, pitch: -4, neck: 0, duration: 1.1, ease: 'sine.inOut' }, 5.3);
    };
    fin.landed = [L];
    fin.idle = (gsap) => [sitBreath(gsap, L), sitBreath(gsap, R, 0.6),
      nod(gsap, L, { every: 9, depth: 14, delay: 2, base: { head: 10, pitch: -4 } }), nod(gsap, R, { every: 10, depth: 14, delay: 6, base: { head: 14, pitch: -2 } }), ...fall(gsap)];
  }

  if (page === 'reception') {
    // Home: the pair sits in the finished jasmine nest in the fork of a blossoming bough; he offers her a pink blossom
    const svg = svgIn(host, '-130 -178 260 358');
    const root = layer(svg, '', '', 'translate(0 10) scale(1.52)');
    const sway = layer(root, '', 'rd-sway');
    const BC = [-84, 28, -36, 24, 36, 18, 84, -20];
    layer(sway, bough([-26, 22, -44, 6, -60, -16, -70, -30], 2.8, 1.2, { seed: 5, knots: 2 }) + twig(-52, -4, -62, -6, -68, 0, 0.9)
      + cluster(-70, -34, 0.64, ['pk', 'pk', 'jas', 'fr', 'pk'], { seed: 12, dir: -40 }) + cluster(-67, 1, 0.42, ['pk', 'jas'], { seed: 2, leaves: 2, buds: 1 }), 'rd-fork');
    layer(sway, bough(BC, 5, 2.8, { seed: 9 }) + cluster(60, 5, 0.44, ['pk', 'jas', 'pk'], { seed: 4, leaves: 2, buds: 2 })
      + cluster(72, -24, 0.64, ['fr', 'pk', 'pk', 'jas', 'pk'], { seed: 7, dir: 30 }) + cluster(-76, 26, 0.5, ['pk', 'jas', 'fr'], { seed: 15, dir: 180 }), 'dv-bough');
    const SX = [[-28, 24], [0, 34], [28, 24]];
    const strands = SX.map(([x, l]) => layer(sway, strand(x, 26 - Math.abs(x) * 0.1, l, 0.95), 'rd-strand'));
    const NW = 106, NYc = 4;
    layer(sway, `<g transform="translate(0 ${NYc})">${nestBack(NW, 30, { seed: 11 })}</g>`, 'dv-nest-back');
    // she sits a little behind and higher, turned three-quarters toward him
    const R = bird(sway, { x: 32, y: -9, s: 0.8, flip: true, bride: true, pose: 'sit', tq: 0.88, extra: { head: 6 } });
    const tuck = layer(R.d.head, use('pk', 33.6, -45.6, 3.6, 16) + use('leaf', 35, -43, 5, 40), 'rd-tuck');
    const L = bird(sway, { x: -33, y: -5, s: 0.82, pose: 'sit', carry: `<g transform="rotate(16)">${use('leaf', 2, 1, 7, 20)}${use('pk', 6, -0.4, 5, 10)}</g>`, extra: { head: 8, neck: 2 } });
    layer(sway, `<g transform="translate(0 ${NYc})">${nestFront(NW, 30, { seed: 12, jas: 11 })}</g>`, 'dv-nest-front');
    const fall = petals(root, 5, { x0: -70, x1: 70, y0: -100, y1: 70, seed: 21, size: 0.9 });
    const fin0 = () => { L.d.carryG.style.opacity = 0; tuck.style.opacity = 1; };
    fin.still = fin0; fin0();
    Object.assign(L.p, { head: 4, neck: 0 }); Object.assign(R.p, { head: 8 });
    build = (gsap) => {
      L.d.carryG.style.opacity = 1; tuck.style.opacity = 0;
      Object.assign(L.p, POSES.glide, { x: -200, y: -70 }); Object.assign(R.p, POSES.glide, { x: 200, y: -80 });
      return gsap.timeline()
        .fromTo(sway, { opacity: 0, scale: 0.94, svgOrigin: '0 10' }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0)
        .add(flaps(gsap, L, 3, 0.56, -100), 0.2).add(flaps(gsap, R, 3, 0.6, -100), 0.4)
        .to(L.p, { x: -33, duration: 2.4, ease: 'power2.out' }, 0.2).to(L.p, { y: -14, duration: 2.4, ease: 'sine.inOut' }, 0.2)
        .to(R.p, { x: 32, duration: 2.4, ease: 'power2.out' }, 0.4).to(R.p, { y: -18, duration: 2.4, ease: 'sine.inOut' }, 0.4)
        .to([L.p, R.p], { ...POSES.flare, legs: 0, duration: 0.45, ease: 'sine.out' }, 2.3)
        // sink into the nest: body drops between the back and front walls, wings fold, feet hide
        .to(L.p, { ...POSES.sit, y: -5, head: 8, neck: 2, duration: 1.1, ease: 'power2.inOut' }, 2.8)
        .to(R.p, { ...POSES.sit, y: -9, head: 6, duration: 1.1, ease: 'power2.inOut' }, 2.9)
        // he offers the blossom, she bows to take it, it moves to beside her veni
        .to(R.p, { head: 22, pitch: -6, duration: 1, ease: 'sine.inOut' }, 4.2)
        .set(L.d.carryG.style, { opacity: 0 }, 5.1).set(tuck.style, { opacity: 1 }, 5.1)
        .to(L.p, { head: 4, neck: 0, duration: 1, ease: 'sine.inOut' }, 5.2)
        .to(R.p, { head: 8, pitch: -7, duration: 1.2, ease: 'sine.inOut' }, 5.2);
    };
    fin.landed = [L, R];
    fin.idle = (gsap) => [sitBreath(gsap, L), sitBreath(gsap, R, 0.5),
      nod(gsap, L, { every: 8, depth: 10, delay: 1.5, base: { head: 4, pitch: -7 } }), nod(gsap, R, { every: 10, depth: 10, delay: 4.5, base: { head: 8, pitch: -7 } }),
      gsap.timeline({ repeat: -1, yoyo: true }).fromTo(sway, { rotation: -0.8, svgOrigin: '-84 28' }, { rotation: 0.8, duration: 5, ease: 'sine.inOut' }),
      ...strands.map((s, i) => gsap.timeline({ repeat: -1, yoyo: true, delay: i * 0.5 }).fromTo(s, { rotation: -2.4, svgOrigin: `${SX[i][0]} 24` }, { rotation: 2.4, duration: 2.2 + i * 0.3, ease: 'sine.inOut' })),
      ...fall(gsap)];
  }

  if (page === 'closing') {
    // Forever: the nest rests on the window's lower edge; the pair nuzzles in the ivory window, necks framing a heart, the gold heart above
    const svg = svgIn(host, '-150 -150 300 230');
    layer(svg, opts.backdrop || `<circle cx="0" cy="-43" r="99" fill="#F6D9DC"/><circle cx="0" cy="-43" r="45" fill="#FFFBF6" stroke="${P.gold}" stroke-width="1"/>`, 'dv-moon');
    layer(svg, `<circle cx="0" cy="-43" r="43.4" fill="url(#rd-tint)"/>`, 'rd-tint');
    const hw = layer(svg, '', '', 'translate(0 -77)');
    const ht = layer(hw, heart(1.5), 'rd-heart');
    const NY = 13, NW = 132;
    layer(svg, `<g transform="translate(0 ${NY})">${nestBack(NW, 32, { seed: 41 })}</g>`, 'dv-nest-back');
    const kiss = { ...POSES.nuzzle };
    const L = bird(svg, { x: -42, y: -2, s: 0.95, pose: 'nuzzle' });
    const R = bird(svg, { x: 42, y: -2, s: 0.95, flip: true, bride: true, pose: 'nuzzle' });
    // bring the bills tip to tip
    { const a = beak(L.d), b = beak(R.d), gap = (b.x - a.x - 0.6) / 2; L.p.x += gap; R.p.x -= gap; R.p.y += a.y - b.y; L.apply(); R.apply(); }
    const HX = [L.p.x, R.p.x], HY = [L.p.y, R.p.y];
    layer(svg, `<g transform="translate(0 ${NY})">${nestFront(NW, 32, { seed: 42, jas: 13 })}</g>`
      + `<g transform="translate(-30 ${NY + 5}) rotate(-20) scale(.8)">${sprig('pk')}</g>`
      + cluster(-66, NY + 8, 0.6, ['pk', 'fr', 'jas'], { seed: 5, dir: 200, leaves: 3 }) + cluster(66, NY + 8, 0.6, ['fr', 'pk', 'jas'], { seed: 8, dir: -20, leaves: 3 }), 'dv-nest-front');
    build = (gsap) => {
      Object.assign(L.p, POSES.glide, { x: -250, y: -40 }); Object.assign(R.p, POSES.glide, { x: 250, y: -48 });
      return gsap.timeline()
        .add(flaps(gsap, L, 3, 0.56, -100), 0).add(flaps(gsap, R, 3, 0.6, -100), 0.16)
        .to(L.p, { x: HX[0], duration: 2.4, ease: 'power2.out' }, 0).to(L.p, { y: HY[0] - 8, duration: 2.4, ease: 'power1.inOut' }, 0)
        .to(R.p, { x: HX[1], duration: 2.4, ease: 'power2.out' }, 0.16).to(R.p, { y: HY[1] - 8, duration: 2.4, ease: 'power1.inOut' }, 0.16)
        .to([L.p, R.p], { ...POSES.flare, legs: 0, duration: 0.5, ease: 'sine.out' }, 1.9)
        .to(L.p, { ...POSES.sit, y: HY[0], duration: 1.1, ease: 'power2.inOut' }, 2.4)
        .to(R.p, { ...POSES.sit, y: HY[1], duration: 1.1, ease: 'power2.inOut' }, 2.4)
        .to([L.p, R.p], { ...kiss, duration: 1.6, ease: 'sine.inOut' }, 3.6)
        .fromTo(ht, { opacity: 0, scale: 0.4, svgOrigin: '0 0' }, { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.6)' }, 0.8);
    };
    fin.landed = [L, R];
    fin.idle = (gsap) => [sitBreath(gsap, L), sitBreath(gsap, R, 0.4), gsap.timeline({ repeat: -1, yoyo: true }).to(ht, { y: -3, duration: 2.6, ease: 'sine.inOut' })];
    fin.lift = (gsap) => gsap.timeline().to([L.p, R.p], { wing: -146, fan: 0.42, tail: 0.5, duration: 0.42, ease: 'sine.out' }).to([L.p, R.p], { ...kiss, duration: 0.9, ease: 'sine.inOut' });
  }

  if (page === 'side') {
    // desktop margin: one dove perched on a blossom sprig with a jasmine bud, facing the card (CSS mirrors the right one)
    const svg = svgIn(host, '-130 -100 260 200');
    const BC = [-128, 52, -60, 40, 40, 34, 124, 14];
    const bride = !!host.closest('.side.r');
    layer(svg, bough(BC, 5, 2.6, { seed: 4 }) + twig(60, 30, 76, 18, 84, 4, 1.4) + cluster(86, 0, 0.9, ['pk', 'pk', 'jas', 'fr'], { seed: 9 }) + cluster(-110, 46, 0.7, ['pk', 'jas'], { seed: 3, leaves: 3 })
      + use('jbud', 30, 34, 5, -20) + use('leaf', 18, 36, 12, 200), 'rd-sprig');
    const b = bird(svg, { x: 0, y: yAt(BC, 0) - FOOT * 1.15, s: 1.15, bride, pose: 'perch' });
    build = (gsap) => gsap.timeline().fromTo(host, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    fin.idle = (gsap) => [sitBreath(gsap, b), nod(gsap, b, { every: 9, depth: 12, delay: 2 })];
  }

  apply();
  const prime = (gsap) => {
    gsapRef = gsap;
    tl = (build(gsap) || gsap.timeline()).pause(0);
    tl.eventCallback('onComplete', () => {
      entering = false;
      (fin.landed || []).forEach((b) => dropOpenWings(b.d));
      if (fin.idle) idles.push(...fin.idle(gsap));
      idles.forEach((t) => t.paused(held || !isLive));
      sync();
    });
    apply();
  };
  return {
    birds,
    prime,
    enter(gsap) {
      if (!tl) prime(gsap);
      if (started) return tl;
      started = true; entering = true;
      tl.play();
      sync();
      return tl;
    },
    hold(on) {
      if (held === on) return;
      held = on;
      if (entering && tl) tl.paused(on);
      idles.forEach((t) => t.paused(on || !isLive));
      lifting?.paused(on);
      sync();
    },
    live(on) { isLive = on; idles.forEach((t) => t.paused(held || !on)); sync(); if (!on) apply(); },
    finish() { if (started && entering) { tl.progress(1); apply(); } },
    lift(gsap) {
      if (!fin.lift || !started || entering || !isLive || gsap.ticker.time - liftAt < 1.2) return null;
      liftAt = gsap.ticker.time;
      lifting?.kill();
      lifting = fin.lift(gsap);
      return lifting;
    },
    still() { fin.still?.(); apply(); },
    destroy() { tl?.kill(); idles.forEach((t) => t.kill()); lifting?.kill(); started = false; entering = false; sync(); },
    apply,
  };
}
