// r13 dove variant (Puravu): the dove designer's pearl-dove rig (dove.js), its ornaments (orn.js: garland, satin ribbon,
// bow, lace medallion, lace rosette, jasmine wreath, perch branch, feather) and its scene motion (scene.js), rewritten as one
// self-contained ES module with per-page compositions. A dove is one SVG group facing right (~110 units beak to tail), posed
// by writing transforms on its parts (wing angle and fan, tail, pitch, head bow, breath, legs). Motion is GSAP tweening a
// plain pose object; apply() writes it once per tick (only changed attributes are touched). Nothing is random.

// ===================== rig (dove.js) =====================
const NS = 'http://www.w3.org/2000/svg';
const f = (n) => Math.round(n * 100) / 100;
const lerp = (a, b, t) => a + (b - a) * t;
const mk = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};

const C = {
  gold: '#B48434', goldHi: '#EBCB86', goldDeep: '#8A6526',
  pearl: '#FFFEFC', shade: '#E7DCE3', shade2: '#D5C7D3', blush: '#E9B3AE', beak: '#D99A93', eye: '#3A2230', leg: '#DD9C93',
};

// feather blade along +x: base at 0, tip at L, width w, bend b (tip y offset as a fraction of L), sq = tip squareness
function blade(L, w, b = 0, sq = 0.5) {
  const h = w / 2, by = b * L;
  return `M0 ${f(-h * 0.5)}C${f(L * 0.3)} ${f(-h * 1.02 + by * 0.15)} ${f(L * 0.7)} ${f(-h * 1.0 + by * 0.55)} ${f(L * (0.9 - sq * 0.04))} ${f(-h * (0.55 + sq * 0.3) + by * 0.9)}`
    + `C${f(L * 1.0)} ${f(-h * 0.25 + by)} ${f(L * 1.0)} ${f(h * 0.3 + by)} ${f(L * (0.9 - sq * 0.04))} ${f(h * (0.55 + sq * 0.3) + by * 0.9)}`
    + `C${f(L * 0.7)} ${f(h * 1.0 + by * 0.55)} ${f(L * 0.3)} ${f(h * 1.02 + by * 0.15)} 0 ${f(h * 0.5)}Z`;
}

// the gradients live once in a 0 x 0 SVG in <body> (never display:none, so hidden stages cannot break them)
function ensureDefs() {
  if (document.getElementById('dv-body')) return;
  const host = mk('svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false', style: 'position:absolute' });
  document.body.appendChild(host);
  const d = mk('defs', {}, host);
  d.innerHTML = `
    <radialGradient id="dv-body" cx="62%" cy="30%" r="78%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#FCF8F7"/><stop offset=".82" stop-color="${C.shade}"/><stop offset="1" stop-color="${C.shade2}"/></radialGradient>
    <radialGradient id="dv-head" cx="55%" cy="35%" r="70%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FBF6F6"/><stop offset="1" stop-color="#F6F0F1"/></radialGradient>
    <linearGradient id="dv-fp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.shade}"/><stop offset=".42" stop-color="#FBF7F7"/><stop offset=".86" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3ECEF"/></linearGradient>
    <linearGradient id="dv-fs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.shade2}"/><stop offset=".45" stop-color="#F6F0F2"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
    <linearGradient id="dv-fc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EEE5EA"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
    <linearGradient id="dv-fb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.shade2}"/><stop offset="1" stop-color="#EFE7EC"/></linearGradient>
    <linearGradient id="dv-ft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.shade}"/><stop offset=".6" stop-color="#FCF9F9"/><stop offset="1" stop-color="#F1E9EE"/></linearGradient>
    <linearGradient id="dv-arm" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F2EAEE"/></linearGradient>
    <linearGradient id="dv-beak" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F1C6C0"/><stop offset="1" stop-color="${C.beak}"/></linearGradient>` + RIBBON_DEFS;
}

// wing layout: leading edge along +x from the shoulder (length E); feathers hang toward -y; angles in local degrees
const PRIM = [
  { s: 1.0, L: 56, o: -10, c: -6 }, { s: 0.97, L: 62, o: -21, c: -7.5 }, { s: 0.92, L: 63, o: -32, c: -9 },
  { s: 0.86, L: 60, o: -43, c: -10.5 }, { s: 0.8, L: 56, o: -54, c: -12 }, { s: 0.74, L: 51, o: -64, c: -13.5 }, { s: 0.68, L: 46, o: -74, c: -15 },
];
const SEC = [0.63, 0.56, 0.49, 0.42, 0.35, 0.28, 0.21, 0.14].map((s, i) => ({ s, L: 41 - i * 1.3, o: -84 - i * 3.6, c: -24 - i * 2.6 }));
const COV = [0.68, 0.6, 0.52, 0.44, 0.36, 0.28, 0.2, 0.12, 0.05].map((s, i) => ({ s, L: 23 - i * 0.4, o: -80 - i * 4, c: -34 - i * 2.6 }));
const LES = [0.6, 0.48, 0.36, 0.24, 0.12].map((s, i) => ({ s, L: 12, o: -72 - i * 5, c: -46 - i * 3 }));
const TAIL = [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ k, L: 46 - Math.abs(k) * 2.2 }));

function buildWing(parent, far) {
  const g = mk('g', { class: far ? 'dv-wing dv-far' : 'dv-wing' }, parent);
  const st = { fill: '', stroke: C.gold, 'stroke-width': far ? 0.45 : 0.55, 'stroke-linejoin': 'round' };
  const parts = [];
  const add = (spec, grad, w, b, sq, rachis) => spec.map((p) => {
    const e = mk('g', {}, g);
    mk('path', { ...st, d: blade(p.L, w, b, sq), fill: `url(#${far ? 'dv-fb' : grad})` }, e);
    if (grad === 'dv-fp' && !far) mk('circle', { cx: f(p.L * 0.9), cy: f(b * p.L * 0.9), r: 0.8, fill: C.gold }, e);
    if (rachis && !far) mk('path', { d: `M1 0Q${f(p.L * 0.5)} ${f(b * p.L * 0.3)} ${f(p.L * 0.86)} ${f(b * p.L * 0.8)}`, fill: 'none', stroke: C.gold, 'stroke-width': 0.32, 'stroke-opacity': 0.75 }, e);
    const it = { e, ...p };
    parts.push(it);
    return it;
  });
  add(PRIM, 'dv-fp', 11, -0.05, 0.25, true);
  add(SEC, 'dv-fs', 13.5, 0, 0.7, true);
  add(COV, 'dv-fc', 12, 0, 0.8, false);
  add(LES, 'dv-fc', 10, 0, 0.9, false);
  // the arm: a soft band covering the feather bases along the leading edge
  const arm = mk('path', { d: '', fill: `url(#${far ? 'dv-fb' : 'dv-arm'})` }, g);
  const edge = mk('path', { d: '', fill: 'none', stroke: C.gold, 'stroke-width': far ? 0.45 : 0.6, 'stroke-linecap': 'round' }, g);
  const lace = far ? null : mk('path', { d: '', fill: 'none', stroke: C.gold, 'stroke-width': 0.35, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, g);
  return { g, parts, arm, edge, lace, far };
}

function buildTail(parent) {
  const g = mk('g', { class: 'dv-tail' }, parent);
  const parts = TAIL.map((p) => {
    const e = mk('g', {}, g);
    mk('path', { d: blade(p.L, 12.5, 0, 0.95), fill: 'url(#dv-ft)', stroke: C.gold, 'stroke-width': 0.55 }, e);
    mk('path', { d: `M2 0L${f(p.L * 0.82)} 0`, stroke: C.gold, 'stroke-width': 0.3, 'stroke-opacity': 0.7 }, e);
    return { e, ...p };
  });
  // draw outer feathers first so the centre feather sits on top
  parts.slice().sort((a, b) => Math.abs(b.k) - Math.abs(a.k)).forEach((p) => g.appendChild(p.e));
  return { g, parts };
}

function create(svg, { x = 0, y = 0, s = 1, flip = false } = {}) {
  ensureDefs(svg);
  const root = mk('g', { class: 'dove' }, svg);
  const pos = mk('g', {}, root);           // placement (x, y, scale, mirror)
  const body = mk('g', {}, pos);           // pitch + bob
  const farW = buildWing(body, true);
  const tail = buildTail(body);
  const legs = mk('g', { class: 'dv-legs', stroke: C.leg, 'stroke-width': 1.6, 'stroke-linecap': 'round', fill: 'none' }, body);
  legs.innerHTML = '<path d="M-4 22L-5 32M-5 32l-4 1.6M-5 32l1 3.2M-5 32l3.6 1"/><path d="M5 21.6L5 31.6M5 31.6l-4 1.6M5 31.6l1 3.2M5 31.6l3.6 1"/>';
  const torso = mk('g', {}, body);
  mk('path', {
    d: 'M25 -24C35.5 -16.5 40 -3 33 8C26 18 8 22.5 -12 21.5C-30 20.5 -44 13.5 -57 7.5L-58.5 0C-42 -2.5 -25 -8 -10 -14C2 -19 12 -28 18 -34C22 -36.5 27 -30 25 -24Z',
    fill: 'url(#dv-body)', stroke: C.gold, 'stroke-width': 0.7,
  }, torso);
  // soft breast feather scallops
  mk('path', { d: 'M31 -8q-3 4 -7 3.4M32 1q-3.4 4.2 -8 3.2M28 11q-3.6 3.6 -8 2.6M18 19q-3.4 3 -7.6 1.8', fill: 'none', stroke: C.gold, 'stroke-width': 0.35, 'stroke-opacity': 0.55, 'stroke-linecap': 'round' }, torso);
  const head = mk('g', {}, torso);
  mk('path', { d: 'M17 -32C16 -44 23 -49.5 29.5 -49C36 -48.5 39.6 -43.6 39.6 -38C39.6 -33 36.6 -29.4 33 -27C29 -24.2 23 -23.2 17.4 -26Z', fill: 'url(#dv-head)' }, head);
  mk('path', { d: 'M17.4 -33C16.4 -44 23 -49.5 29.5 -49C34.6 -48.6 38 -45.4 39.2 -41.6M38.6 -35.6C37.8 -31.6 35.8 -29 33.2 -27', fill: 'none', stroke: C.gold, 'stroke-width': 0.7, 'stroke-linecap': 'round' }, head);
  mk('path', { d: 'M38.8 -41.8C42.2 -41 45.4 -39.2 48.4 -36.6C45 -35.4 41.6 -35 38.4 -35.4Z', fill: 'url(#dv-beak)', stroke: C.goldDeep, 'stroke-width': 0.5, 'stroke-linejoin': 'round' }, head);
  mk('path', { d: 'M39.2 -38.2L46.6 -36.9', stroke: C.goldDeep, 'stroke-width': 0.35, 'stroke-opacity': 0.8 }, head);
  mk('ellipse', { cx: 39.8, cy: -41.2, rx: 1.7, ry: 1, fill: '#FFFFFF', stroke: C.gold, 'stroke-width': 0.3 }, head);
  mk('circle', { cx: 32, cy: -40.2, r: 2.6, fill: 'none', stroke: C.gold, 'stroke-width': 0.4 }, head);
  mk('circle', { cx: 32, cy: -40.2, r: 1.7, fill: C.eye }, head);
  mk('circle', { cx: 32.6, cy: -40.8, r: 0.55, fill: '#FFFFFF' }, head);
  // a gold-dot collar at the throat
  const collar = mk('g', { fill: C.gold }, head);
  [[20.6, -25.6], [23.6, -24.2], [26.8, -23.6], [30, -23.9], [33, -25]].forEach(([cx, cy], i) => mk('circle', { cx, cy, r: i % 2 ? 0.7 : 0.9 }, collar));
  const beakPt = mk('circle', { cx: 47.4, cy: -36.8, r: 0, fill: 'none' }, head);
  const nearW = buildWing(torso, false);
  const dove = { root, pos, body, torso, head, tail, farW, nearW, legs, beakPt, x, y, s, flip, p: {} };
  place(dove, x, y, s, flip);
  pose(dove, POSES.hover);
  return dove;
}

function place(d, x, y, s, flip) {
  Object.assign(d, { x, y, s, flip });
  const v = `translate(${f(x)} ${f(y)}) scale(${flip ? -s : s} ${s})`;
  if (d.pos.__t !== v) { d.pos.__t = v; d.pos.setAttribute('transform', v); }
}

const setT = (el, v) => { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } };
function setWing(w, ang, fan, sx, sh) {
  const E = 52 * (0.7 + 0.3 * fan);
  setT(w.g, `translate(${sh[0]} ${sh[1]}) rotate(${f(ang)})${sx !== 1 ? ` scale(${f(sx)} 1)` : ''}`);
  if (Math.abs((w.__fan ?? -9) - fan) < 0.002) return;
  w.__fan = fan;
  for (const p of w.parts) {
    const a = lerp(p.c, p.o, fan);
    p.e.setAttribute('transform', `translate(${f(p.s * E)} 0) rotate(${f(a)})`);
  }
  // arm band: from shoulder to wrist, thicker at the shoulder, on the leading side
  w.arm.setAttribute('d', `M-5 -4C${f(E * 0.2)} -6 ${f(E * 0.62)} -4.5 ${f(E * 1.02)} -1.2C${f(E * 1.06)} 0.8 ${f(E * 1.0)} 2.2 ${f(E * 0.9)} 2.2C${f(E * 0.6)} 4 ${f(E * 0.26)} 6.6 -1 5.4C-6.4 4.4 -8 -1.6 -5 -4Z`);
  w.edge.setAttribute('d', `M-6.6 -1.2C-7.4 3 -5 5.2 -1 5.4C${f(E * 0.26)} 6.6 ${f(E * 0.6)} 4 ${f(E * 0.9)} 2.2C${f(E * 1.0)} 2.2 ${f(E * 1.06)} 0.8 ${f(E * 1.02)} -1.2`);
  if (w.lace) {
    let d = '';
    for (let i = 0; i < 7; i++) { const x = E * (0.06 + i * 0.12), y = -2.2 - i * 0.05; d += `M${f(x - 3.2)} ${f(y)}q3.2 -3 6.4 0`; }
    w.lace.setAttribute('d', d);
  }
}

// p: wing (deg, near wing leading-edge angle), fan 0..1, far (deg offset), tail 0..1, pitch, head, breath 0..1, legs 0..1, bob (units)
function pose(d, p) {
  p = Object.assign({}, d.p, p);
  d.p = p;
  setWing(d.nearW, p.wing, p.fan, 1, [7, -12]);
  setWing(d.farW, p.wing - 9 + (p.far || 0), Math.min(1, p.fan * 0.95), 0.86, [13, -18]);
  const fo = p.fan < 0.15 && p.wing < -175 ? '0' : '1';
  if (d.farW.g.__o !== fo) { d.farW.g.__o = fo; d.farW.g.style.opacity = fo; }
  const tf = p.tail;
  if (Math.abs((d.__tf ?? -9) - tf) >= 0.002) { d.__tf = tf; for (const t of d.tail.parts) t.e.setAttribute('transform', `rotate(${f(t.k * (2.4 + 6.4 * tf))})`); }
  setT(d.tail.g, `translate(-55 8) rotate(${f(176 - (p.tailLift || 0))})`);
  setT(d.head, `rotate(${f(p.head || 0)} 22 -24)`);
  const br = 1 + (p.breath || 0) * 0.018;
  setT(d.body, `translate(0 ${f(p.bob || 0)}) rotate(${f(p.pitch || 0)}) scale(${f(br)} ${f(2 - br)})`);
  const lo = String(f(p.legs));
  if (d.legs.__o !== lo) { d.legs.__o = lo; d.legs.style.opacity = lo; }
  return d;
}

function beak(d) {
  // the beak tip in the coordinates of the owning svg
  const m = d.beakPt.getCTM(), r = d.root.ownerSVGElement.getCTM();
  const pt = new DOMPoint(47.4, -36.8).matrixTransform(m);
  return r ? pt.matrixTransform(r.inverse()) : pt;
}

const POSES = {
  hover: { wing: -98, fan: 0.92, far: -6, tail: 0.75, pitch: -8, head: 4, breath: 0, legs: 0, bob: 0, tailLift: -6 },
  up: { wing: -84, fan: 1, far: -4, tail: 0.85, pitch: -10, head: 2, legs: 0, tailLift: -8 },
  down: { wing: -226, fan: 0.86, far: 10, tail: 0.7, pitch: -2, head: 0, legs: 0, tailLift: -2 },
  glide: { wing: -150, fan: 1, far: -10, tail: 0.95, pitch: 2, head: -2, legs: 0, tailLift: 0 },
  perch: { wing: -194, fan: 0, far: 0, tail: 0.15, pitch: 0, head: 0, breath: 0, legs: 1, bob: 0, tailLift: 6 },
  bow: { wing: -192, fan: 0.04, far: 0, tail: 0.25, pitch: 9, head: 20, legs: 1, tailLift: 3 },
};


// ===================== ornaments (orn.js) =====================
const T = {
  gold: '#B48434', goldHi: '#EBCB86', goldDeep: '#8A6526', pearl: '#FFFDFB', pearl2: '#FBF4F1',
  sage: '#9DB59B', sageDeep: '#5E7A62', blush: '#EBB9B4', blushDeep: '#D9928E', lilac: '#D9CCE0', rose: '#F1D3CA',
};
const R = (a) => (a * Math.PI) / 180;
const jasmine = (x, y, r, rot = 0, n = 5) => {
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
  for (let i = 0; i < n; i++) s += `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 0.34)}" ry="${f(r * 0.56)}" transform="rotate(${f((360 / n) * i)})" fill="${T.pearl}" stroke="${T.gold}" stroke-width="${f(Math.max(0.3, r * 0.1))}"/>`;
  return s + `<circle r="${f(r * 0.22)}" fill="${T.gold}"/></g>`;
};
const bud = (x, y, len, ang, w = 0.38) => {
  const L = len, h = L * w * 0.5;
  return `<path transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})" d="M0 0C${f(L * 0.2)} ${f(-h * 1.2)} ${f(L * 0.8)} ${f(-h * 1.1)} ${f(L)} 0C${f(L * 0.8)} ${f(h * 1.1)} ${f(L * 0.2)} ${f(h * 1.2)} 0 0Z" fill="${T.pearl}" stroke="${T.gold}" stroke-width=".35"/>`;
};
const leaf = (x, y, len, ang, fill = T.sage) => {
  const L = len, h = L * 0.24;
  return `<path transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})" d="M0 0C${f(L * 0.3)} ${f(-h * 1.3)} ${f(L * 0.75)} ${f(-h)} ${f(L)} 0C${f(L * 0.75)} ${f(h)} ${f(L * 0.3)} ${f(h * 1.3)} 0 0Z" fill="${fill}" stroke="${T.goldDeep}" stroke-width=".3"/><path transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})" d="M0 0L${f(L * 0.85)} 0" stroke="${T.goldHi}" stroke-width=".3"/>`;
};
const rosebud = (x, y, r) => `<g transform="translate(${f(x)} ${f(y)})"><circle r="${f(r)}" fill="${T.blush}" stroke="${T.goldDeep}" stroke-width=".3"/><path d="M${f(-r * 0.5)} 0a${f(r * 0.5)} ${f(r * 0.5)} 0 1 1 ${f(r * 0.5)} ${f(r * 0.5)}" fill="none" stroke="${T.blushDeep}" stroke-width=".45"/></g>`;
// --- jasmine garland along a quadratic swag from p0 to p1 sagging by `sag`; returns {buds, roses} path markup
function swagPoints(p0, p1, sag, step = 3.3) {
  const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2 + sag * 2;
  const q = (t) => ({ x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * mx + t * t * p1.x, y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * my + t * t * p1.y });
  const dense = [];
  for (let i = 0; i <= 200; i++) dense.push(q(i / 200));
  const pts = [];
  let acc = 0;
  for (let i = 1; i < dense.length; i++) {
    const a = dense[i - 1], b = dense[i];
    acc += Math.hypot(b.x - a.x, b.y - a.y);
    if (acc >= step || i === 1) { acc = 0; pts.push({ x: b.x, y: b.y, a: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI }); }
  }
  return pts;
}
function garland(p0, p1, sag, size = 1) {
  const pts = swagPoints(p0, p1, sag, 3.1 * size);
  let thread = `M${f(p0.x)} ${f(p0.y)}`;
  pts.forEach((p) => { thread += `L${f(p.x)} ${f(p.y)}`; });
  let s = `<path d="${thread}" fill="none" stroke="${T.gold}" stroke-width="${f(0.6 * size)}"/>`;
  pts.forEach((p, i) => {
    if (i % 4 === 1) s += leaf(p.x, p.y, 5 * size, p.a + (i % 8 === 1 ? 70 : -70), i % 8 === 1 ? T.sage : '#B9CBB3');
  });
  pts.forEach((p, i) => {
    if (i % 8 === 4) { s += rosebud(p.x, p.y, 2.5 * size); return; }
    s += bud(p.x, p.y, 6.6 * size, p.a + 34, 0.42) + bud(p.x, p.y, 6.6 * size, p.a + 180 + 34, 0.42);
  });
  return s;
}

// satin ribbon from a to b as a gentle S; width w
function ribbon(a, b, w = 4, wave = 6) {
  const n = 40, L = [], Rt = [];
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (let i = 0; i <= n; i++) {
    const t = i / n, off = Math.sin(t * Math.PI * 2) * wave * Math.sin(t * Math.PI), tw = Math.abs(Math.cos(t * Math.PI * 2.2)) * 0.55 + 0.45;
    const x = a.x + dx * t + nx * off, y = a.y + dy * t + ny * off, hw = (w / 2) * tw;
    L.push([x + nx * hw, y + ny * hw]); Rt.push([x - nx * hw, y - ny * hw]);
  }
  const d = 'M' + L.map((p) => p.map(f).join(' ')).join('L') + 'L' + Rt.reverse().map((p) => p.map(f).join(' ')).join('L') + 'Z';
  return `<path d="${d}" fill="url(#rb-satin)" stroke="${T.gold}" stroke-width=".55" stroke-linejoin="round"/>`;
}
function bow(x, y, s = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">
    <path d="M0 0C-4 6 -6 14 -3 20L1 17L4 20C3 13 2 6 0 0Z" fill="url(#rb-satin)" stroke="${T.gold}" stroke-width=".5"/>
    <path d="M0 0C4 6 8 13 6 19L2 16.4L-1 19C0 12 -1 6 0 0Z" fill="url(#rb-satin)" stroke="${T.gold}" stroke-width=".5" transform="scale(-1 1)"/>
    <path d="M0 0C-6 -7 -15 -6 -14 -1C-13 4 -6 3 0 0Z" fill="url(#rb-satin)" stroke="${T.gold}" stroke-width=".5"/>
    <path d="M0 0C6 -7 15 -6 14 -1C13 4 6 3 0 0Z" fill="url(#rb-satin)" stroke="${T.gold}" stroke-width=".5"/>
    <ellipse rx="2.6" ry="2.2" fill="${T.blush}" stroke="${T.gold}" stroke-width=".5"/></g>`;
}
const RIBBON_DEFS = `<linearGradient id="rb-satin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#F8E4E2"/><stop offset=".7" stop-color="#FFF8F6"/><stop offset="1" stop-color="#EBC9C6"/></linearGradient>
  <radialGradient id="md-disc" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".75" stop-color="#FCF6F3"/><stop offset="1" stop-color="#F1E3E2"/></radialGradient>
  <linearGradient id="lt-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D98A8F"/><stop offset=".5" stop-color="#EDB3B3"/><stop offset="1" stop-color="#FBE2DE"/></linearGradient>
  <linearGradient id="lt-m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E7A3A5"/><stop offset=".55" stop-color="#F6CFCC"/><stop offset="1" stop-color="#FFF3F0"/></linearGradient>
  <linearGradient id="lt-c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F0BDBB"/><stop offset=".6" stop-color="#FDECE8"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
  <linearGradient id="lt-leaf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7E9C80"/><stop offset="1" stop-color="#C5D6BF"/></linearGradient>`;

// lace medallion holding the monogram; r = outer radius
function medallion(r = 36) {
  let s = '';
  const k = 22;
  for (let i = 0; i < k; i++) { const a = R(i * 360 / k); s += `<circle cx="${f(Math.cos(a) * r * 0.9)}" cy="${f(Math.sin(a) * r * 0.9)}" r="${f(r * 0.13)}" fill="${T.pearl}" stroke="${T.gold}" stroke-width=".5"/>`; }
  s += `<circle r="${f(r * 0.9)}" fill="${T.pearl}" stroke="${T.gold}" stroke-width=".9"/>`;
  for (let i = 0; i < k; i++) { const a = R(i * 360 / k + 360 / k / 2); s += `<circle cx="${f(Math.cos(a) * r * 0.8)}" cy="${f(Math.sin(a) * r * 0.8)}" r="${f(r * 0.028)}" fill="${T.gold}"/>`; }
  s += `<circle r="${f(r * 0.76)}" fill="#F3D6D2" stroke="none"/>`;
  s += `<circle r="${f(r * 0.72)}" fill="url(#md-disc)" stroke="${T.gold}" stroke-width=".7"/><circle r="${f(r * 0.66)}" fill="none" stroke="${T.gold}" stroke-width=".3"/>`;
  return s;
}

// lace rosette watermark (white lace + gold hairlines), radius 150
function rosette() {
  const B = (L, w) => blade(L, w, 0, 0.6);
  let s = `<svg viewBox="-160 -160 320 320" aria-hidden="true"><g fill="none">`;
  for (let i = 0; i < 40; i++) { const a = R(i * 9); s += `<circle cx="${f(Math.cos(a) * 146)}" cy="${f(Math.sin(a) * 146)}" r="7.4" stroke="#FFFFFF" stroke-width="1.1"/>`; }
  s += `<circle r="139" stroke="#FFFFFF" stroke-width="1.4"/><circle r="135" stroke="${T.gold}" stroke-width=".5" stroke-opacity=".7"/>`;
  for (let i = 0; i < 80; i++) { const a = R(i * 4.5); s += `<circle cx="${f(Math.cos(a) * 129)}" cy="${f(Math.sin(a) * 129)}" r="1.5" fill="#FFFFFF"/>`; }
  for (let i = 0; i < 24; i++) s += `<path d="${B(58, 20)}" transform="rotate(${i * 15}) translate(64 0)" fill="#FFFFFF" fill-opacity=".22" stroke="#FFFFFF" stroke-width="1"/>`;
  for (let i = 0; i < 24; i++) s += `<path d="${B(40, 10)}" transform="rotate(${i * 15 + 7.5}) translate(70 0)" stroke="${T.gold}" stroke-width=".5" stroke-opacity=".6"/>`;
  s += `<circle r="62" stroke="#FFFFFF" stroke-width="1.2"/><circle r="58" stroke="${T.gold}" stroke-width=".4" stroke-opacity=".7"/>`;
  for (let i = 0; i < 12; i++) s += `<path d="${B(30, 14)}" transform="rotate(${i * 30}) translate(22 0)" fill="#FFFFFF" fill-opacity=".25" stroke="#FFFFFF" stroke-width="1"/>`;
  s += `<circle r="18" stroke="#FFFFFF" stroke-width="1"/><circle r="5" fill="#FFFFFF" fill-opacity=".5"/></g></svg>`;
  return s;
}

// jasmine wreath (radius r) with sage leaves, rosebuds and a satin bow at the bottom; ribbon tails run down `tail`
function wreath(r = 60, tail = 80) {
  let s = '';
  s += `<circle r="${r}" fill="none" stroke="${T.gold}" stroke-width=".8"/><circle r="${r - 3.2}" fill="none" stroke="${T.gold}" stroke-width=".35"/>`;
  const n = Math.round((2 * Math.PI * r) / 5.2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360, ar = R(a), x = Math.cos(ar) * r, y = Math.sin(ar) * r;
    if (a > 76 && a < 104) continue;
    if (i % 2 === 0) s += leaf(x, y, 9, a + 90 + (i % 4 ? 38 : -142), i % 4 ? T.sage : '#B9CBB3');
  }
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360, ar = R(a), x = Math.cos(ar) * r, y = Math.sin(ar) * r;
    if (a > 74 && a < 106) continue;
    if (i % 7 === 3) { s += rosebud(x, y, 3); continue; }
    s += bud(x, y, 7.6, a + 90 - 38) + bud(x, y, 7.6, a - 90 - 38);
  }
  for (let i = 0; i < 8; i++) { const a = R(i * 45 + 22.5); if (i === 2 || i === 1) continue; s += jasmine(Math.cos(a) * r, Math.sin(a) * r, 5, i * 20); }
  s += `<g class="rb-tails">${ribbon({ x: -2, y: r + 2 }, { x: -18, y: r + tail }, 4.4, 5)}${ribbon({ x: 2, y: r + 2 }, { x: 16, y: r + tail * 0.86 }, 4.4, -5)}</g>`;
  s += bow(0, r + 1, 1.15);
  return s;
}

// perch branch for the closing pair: a gold twig with sage leaves and jasmine, a gentle smile curve, width ~2*hw
function branch(hw = 120) {
  let s = '';
  const yAt = (x) => 6 * (1 - (x / hw) ** 2) * -1 + 6;
  let d = '';
  for (let x = -hw; x <= hw; x += 4) d += `${d ? 'L' : 'M'}${f(x)} ${f(yAt(x))}`;
  s += `<path d="${d}" fill="none" stroke="${T.goldDeep}" stroke-width="1.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${T.goldHi}" stroke-width=".5" stroke-linecap="round" transform="translate(0 -.5)"/>`;
  for (let x = -hw + 8; x <= hw - 6; x += 13) {
    const up = Math.round(x / 13) % 2 ? 1 : -1, y = yAt(x);
    s += leaf(x, y, 11, (x < 0 ? 200 : -20) + up * 34, Math.abs(x) % 26 < 13 ? T.sage : '#B9CBB3');
  }
  for (const x of [-hw + 2, -hw * 0.62, hw * 0.62, hw - 2]) s += jasmine(x, yAt(x) + 2, 4.4, x);
  for (const x of [-hw * 0.82, -hw * 0.4, hw * 0.4, hw * 0.82]) s += bud(x, yAt(x), 7, x < 0 ? 120 : 60);
  return s;
}

// a small drifting feather
function feather() {
  return `<svg viewBox="-2 -12 52 24" aria-hidden="true"><path d="M0 0C10 -9 30 -10 48 -2C36 2 18 7 2 2Z" fill="${T.pearl}" stroke="${T.gold}" stroke-width=".5"/><path d="M0 0C14 -2 30 -3 47 -2" fill="none" stroke="${T.gold}" stroke-width=".5"/><path d="M14 -2l4 -5M22 -3l4 -5.4M30 -3l3.6 -4.6M18 -2l3 3.4M26 -2.6l3 3.4" stroke="${T.gold}" stroke-width=".3" stroke-opacity=".6"/></svg>`;
}


// ===================== compositions and motion (scene.js, per page) =====================
export { create, pose, place, beak, POSES, C, blade, T, garland, ribbon, bow, medallion, rosette, wreath, branch, feather, jasmine, bud, leaf, rosebud, RIBBON_DEFS };

// --- motion primitives (GSAP tweens on a plain pose object; the composition's apply() writes it each tick)
// a wing cycle: the down-stroke (42 %, power2.in) is quicker than the recovery (58 %, sine.out); each beat 12 % slower
export function flaps(gsap, b, n, period = 0.5, top = -84, bottom = -222) {
  const tl = gsap.timeline();
  for (let i = 0; i < n; i++) {
    const per = period * (1 + i * 0.12);
    tl.to(b.p, { wing: bottom, fan: 0.8, far: 10, duration: per * 0.42, ease: 'power2.in' })
      .to(b.p, { wing: top, fan: 1, far: -4, duration: per * 0.58, ease: 'sine.out' });
  }
  return tl;
}
// slow hovering breath: wings flex, the body rises and falls (bob 0 keeps the beaks still, so the garland need not redraw)
export function breathe(gsap, b, { delay = 0, period = 3.8, bob = 1 } = {}) {
  return gsap.timeline({ repeat: -1, yoyo: true, delay })
    .fromTo(b.p, { wing: -96, fan: 0.94, bob: -1.2 * bob, tail: 0.74 }, { wing: -114, fan: 0.84, bob: 1.6 * bob, tail: 0.66, duration: period / 2, ease: 'sine.inOut' });
}
export function bowLoop(gsap, b, { every = 9, depth = 14, delay = 3, base = {} } = {}) {
  return gsap.timeline({ repeat: -1, repeatDelay: every, delay })
    .to(b.p, { head: (base.head || 0) + depth, pitch: (base.pitch || 0) + depth * 0.35, duration: 1.3, ease: 'sine.inOut' })
    .to(b.p, { head: base.head || 0, pitch: base.pitch || 0, duration: 1.5, ease: 'sine.inOut' }, '+=0.7');
}
export function perchBreath(gsap, b, delay = 0) {
  return gsap.timeline({ repeat: -1, yoyo: true, delay }).to(b.p, { breath: 1, duration: 2.4, ease: 'sine.inOut' });
}

const SVGNS = 'http://www.w3.org/2000/svg';
let clipN = 0;
function svgIn(host, vb, cls) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', vb); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  host.appendChild(s);
  return s;
}
function layer(svg, html, cls = '') {
  const g = document.createElementNS(SVGNS, 'g');
  if (cls) g.setAttribute('class', cls);
  g.innerHTML = html;
  svg.appendChild(g);
  return g;
}

// Build one page's doves into host (an empty .dv-stage). Returns the controller:
//   enter(gsap)  once on the first pg:reveal; the idle loops start from its onComplete
//   live(on)     adds or removes the per-tick apply() on gsap.ticker and pauses or resumes the idle timelines
//   finish()     jumps the entrance to its end (pg:leave mid-entrance)
//   still()      reduced motion: the final pose, garland drawn, heart shown; no ticker, no tweens
// page: 'invite' (crown: hover pair, lace medallion, jasmine garland beak to beak), 'date' (pair carrying the card on satin
// ribbons; opts.card is the .scratch element), 'reception' (pair perched on a jasmine wreath, ribbon tails to the pill),
// 'closing' (pair on a jasmine branch bowing until their beaks meet, a gold heart; opts.backdrop replaces the lace moon).
export function doveScene(page, host, opts = {}) {
  const birds = [], ticks = [], idles = [];
  const O = { medallion, garland, branch, wreath: (r, t) => `<g transform="scale(.42)" opacity=".75">${rosette().replace(/<\/?svg[^>]*>/g, '')}</g>` + wreath(r, t), ...opts.orn };
  let tl = null, ticking = false, isLive = true, gsapRef = null, started = false, entering = false, lifting = null, liftAt = -9;
  const bird = (svg, { x, y, s, flip = false, pose: ps = 'hover' }) => {
    const d = create(svg, { x, y, s, flip });
    const p = Object.assign({ x, y }, POSES[ps]);
    const b = { d, p, apply() { place(d, p.x, p.y, s, flip); pose(d, p); } };
    b.apply(); birds.push(b);
    return b;
  };
  const apply = () => { birds.forEach((b) => b.apply()); ticks.forEach((fn) => fn()); };
  const tickOn = (on) => { if (!gsapRef || on === ticking) return; ticking = on; gsapRef.ticker[on ? 'add' : 'remove'](apply); };
  const sync = () => tickOn(started && (isLive || entering));
  const fin = {};
  let build = () => null;

  if (page === 'invite') {
    const svg = svgIn(host, '0 0 350 176', 'dv-svg');
    layer(svg, O.medallion(40), 'dv-med').setAttribute('transform', 'translate(175 58)');
    const gar = layer(svg, '', 'dv-gar');
    const L = bird(svg, { x: 86, y: 128, s: 0.86 }), R = bird(svg, { x: 264, y: 128, s: 0.86, flip: true });
    const st = { draw: 1 };
    let last = '';
    ticks.push(() => {
      const a = beak(L.d), b = beak(R.d);
      const key = [a.x, a.y, b.x, b.y].map((v) => v.toFixed(1)).join();
      if (key !== last) { last = key; gar.innerHTML = O.garland(a, b, 24, 1.18); }
    });
    const cp = document.createElementNS(SVGNS, 'clipPath'); cp.id = `dv-gar-clip-${++clipN}`;
    const r1 = document.createElementNS(SVGNS, 'rect'), r2 = document.createElementNS(SVGNS, 'rect');
    [r1, r2].forEach((r) => { r.setAttribute('y', 0); r.setAttribute('height', 176); cp.appendChild(r); });
    svg.appendChild(cp); gar.setAttribute('clip-path', `url(#${cp.id})`);
    ticks.push(() => { const w = 60 * st.draw; r1.setAttribute('x', 115); r1.setAttribute('width', w); r2.setAttribute('x', 235 - w); r2.setAttribute('width', w); });
    build = (gsap) => {
      st.draw = 0; L.p.x = -90; L.p.y = 40; R.p.x = 430; R.p.y = 40;
      return gsap.timeline()
        .to(L.p, { x: 86, duration: 2.6, ease: 'power2.out' }, 0).to(L.p, { y: 128, duration: 2.6, ease: 'sine.inOut' }, 0)
        .to(R.p, { x: 264, duration: 2.6, ease: 'power2.out' }, 0.12).to(R.p, { y: 128, duration: 2.6, ease: 'sine.inOut' }, 0.12)
        .add(flaps(gsap, L, 4, 0.55), 0).add(flaps(gsap, R, 4, 0.55), 0.12)
        .to([L.p, R.p], { wing: -98, fan: 0.94, pitch: -8, duration: 0.8, ease: 'sine.out' }, 2.5)
        .to(st, { draw: 1, duration: 1.8, ease: 'power1.inOut' }, 2.7);
    };
    fin.idle = (gsap) => [breathe(gsap, L, { bob: 0 }), breathe(gsap, R, { delay: 0.25, bob: 0 }),
      bowLoop(gsap, L, { delay: 1, base: { head: 4, pitch: -8 } }), bowLoop(gsap, R, { delay: 1, base: { head: 4, pitch: -8 } })];
  }

  if (page === 'date') {
    const svg = svgIn(host, '0 0 330 124', 'dv-svg');
    const rib = layer(svg, '', 'dv-rib');
    const L = bird(svg, { x: 72, y: 80, s: 0.7 }), R = bird(svg, { x: 258, y: 80, s: 0.7, flip: true });
    const anchor = [{ x: 104, y: 128 }, { x: 226, y: 128 }];
    let last = '';
    ticks.push(() => {
      const a = beak(L.d), b = beak(R.d);
      const key = [a.x, a.y, b.x, b.y].map((v) => v.toFixed(1)).join();
      if (key !== last) { last = key; rib.innerHTML = ribbon(a, anchor[0], 4.2, 2.4) + ribbon(b, anchor[1], 4.2, -2.4) + bow(anchor[0].x, anchor[0].y - 5, 0.7) + bow(anchor[1].x, anchor[1].y - 5, 0.7); }
    });
    build = (gsap) => gsap.timeline()
      .fromTo(svg, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 2.2, ease: 'power2.out' }, 0)
      .fromTo(opts.card || svg, { y: 18 }, { y: 0, duration: 2.2, ease: 'power2.out' }, 0)
      .add(flaps(gsap, L, 5, 0.5, -108, -186), 0).add(flaps(gsap, R, 5, 0.5, -108, -186), 0.08)
      .to([L.p, R.p], { wing: -98, fan: 0.94, duration: 0.7, ease: 'sine.out' }, 2.6);
    fin.idle = (gsap) => [breathe(gsap, L, { period: 3.4 }), breathe(gsap, R, { delay: 0.3, period: 3.4 }),
      bowLoop(gsap, L, { every: 10, depth: 10, delay: 2, base: { head: 4, pitch: -8 } }), bowLoop(gsap, R, { every: 10, depth: 10, delay: 2, base: { head: 4, pitch: -8 } })];
  }

  if (page === 'reception') {
    const svg = svgIn(host, '-130 -178 260 358', 'dv-svg');
    const w = layer(svg, O.wreath(74, 100), 'dv-wr');
    const L = bird(svg, { x: -36, y: -86, s: 0.74, pose: 'perch' }), R = bird(svg, { x: 36, y: -86, s: 0.74, flip: true, pose: 'perch' });
    build = (gsap) => {
      L.p.x = -250; L.p.y = -92; R.p.x = 250; R.p.y = -98;
      Object.assign(L.p, POSES.glide); Object.assign(R.p, POSES.glide);
      return gsap.timeline()
        .fromTo(w, { opacity: 0, scale: 0.9, transformOrigin: '50% 40%' }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0)
        .add(flaps(gsap, L, 3, 0.56, -100), 0).add(flaps(gsap, R, 3, 0.56, -100), 0.2)
        .to(L.p, { x: -36, duration: 2.5, ease: 'power2.out' }, 0).to(L.p, { y: -86, duration: 2.5, ease: 'power1.inOut' }, 0)
        .to(R.p, { x: 36, duration: 2.5, ease: 'power2.out' }, 0.2).to(R.p, { y: -86, duration: 2.5, ease: 'power1.inOut' }, 0.2)
        .to([L.p, R.p], { wing: -96, fan: 1, pitch: -12, legs: 1, tail: 1, duration: 0.5, ease: 'sine.out' }, 1.9)
        .to([L.p, R.p], { ...POSES.perch, duration: 1.1, ease: 'power2.inOut' }, 2.6);
    };
    fin.idle = (gsap) => [perchBreath(gsap, L), perchBreath(gsap, R, 0.4), bowLoop(gsap, L, { every: 8, depth: 12, delay: 0.6 }), bowLoop(gsap, R, { every: 8, depth: 12, delay: 1.1 }),
      gsap.timeline({ repeat: -1, yoyo: true }).to(w, { rotation: 1.2, duration: 4.2, ease: 'sine.inOut', svgOrigin: '0 -74' })];
  }

  if (page === 'closing') {
    const svg = svgIn(host, '-150 -150 300 230', 'dv-svg');
    layer(svg, opts.backdrop || `<g transform="translate(0 -40) scale(.68)" opacity=".8">${rosette().replace(/<\/?svg[^>]*>/g, '')}</g>`, 'dv-moon');
    layer(svg, O.branch(132), 'dv-br').setAttribute('transform', 'translate(0 22)');
    const hw = layer(svg, '', 'dv-hw'); hw.setAttribute('transform', 'translate(0 -76)');
    const heart = layer(hw, `<path d="M0 6C-7 0 -10 -4 -10 -8A5 5 0 0 1 0 -10A5 5 0 0 1 10 -8C10 -4 7 0 0 6Z" fill="none" stroke="${T.gold}" stroke-width=".9"/><path d="M0 3.6C-4.6 -.4 -6.6 -3 -6.6 -5.8A3.2 3.2 0 0 1 0 -7A3.2 3.2 0 0 1 6.6 -5.8C6.6 -3 4.6 -.4 0 3.6Z" fill="#EBB9B4"/>`, 'dv-ht');
    const L = bird(svg, { x: -46, y: -6, s: 0.86, pose: 'perch' }), R = bird(svg, { x: 46, y: -6, s: 0.86, flip: true, pose: 'perch' });
    const kiss = { head: 26, pitch: 8 };
    Object.assign(L.p, kiss); Object.assign(R.p, kiss);
    build = (gsap) => {
      L.p.x = -250; L.p.y = -34; R.p.x = 250; R.p.y = -42;
      Object.assign(L.p, POSES.glide); Object.assign(R.p, POSES.glide);
      return gsap.timeline()
        .add(flaps(gsap, L, 3, 0.56, -100), 0).add(flaps(gsap, R, 3, 0.56, -100), 0.16)
        .to(L.p, { x: -46, duration: 2.4, ease: 'power2.out' }, 0).to(L.p, { y: -6, duration: 2.4, ease: 'power1.inOut' }, 0)
        .to(R.p, { x: 46, duration: 2.4, ease: 'power2.out' }, 0.16).to(R.p, { y: -6, duration: 2.4, ease: 'power1.inOut' }, 0.16)
        .to([L.p, R.p], { wing: -80, fan: 1, pitch: -14, legs: 1, tail: 1, duration: 0.5, ease: 'sine.out' }, 1.8)
        .to([L.p, R.p], { ...POSES.perch, duration: 1.1, ease: 'power2.inOut' }, 2.5)
        .to([L.p, R.p], { ...kiss, duration: 1.6, ease: 'sine.inOut' }, 3.8)
        .fromTo(heart, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.6)' }, 4.8);
    };
    fin.idle = (gsap) => [perchBreath(gsap, L), perchBreath(gsap, R, 0.4), gsap.timeline({ repeat: -1, yoyo: true }).to(heart, { y: -3, duration: 2.6, ease: 'sine.inOut' })];
    fin.lift = (gsap) => gsap.timeline().to([L.p, R.p], { wing: -100, fan: 1, duration: 0.4, ease: 'sine.out' }).to([L.p, R.p], { ...POSES.perch, ...kiss, duration: 0.8, ease: 'sine.inOut' });
  }
  if (page === 'side') {
    // desktop side margin: one dove perched on a jasmine sprig, facing the card (mirror the right one with CSS)
    const svg = svgIn(host, '-130 -100 260 200', 'dv-svg');
    layer(svg, O.branch(100), 'dv-br').setAttribute('transform', 'translate(0 34)');
    const L = bird(svg, { x: 0, y: 6, s: 1.15, pose: 'perch' });
    build = (gsap) => gsap.timeline().fromTo(host, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    fin.idle = (gsap) => [perchBreath(gsap, L), bowLoop(gsap, L, { every: 9, depth: 10, delay: 2 })];
  }
  apply();

  // builds the entrance paused at its first frame, so the start pose shows (and not the finished one) while the page fades in
  const prime = (gsap) => {
    gsapRef = gsap;
    tl = (build(gsap) || gsap.timeline()).pause(0);
    tl.eventCallback('onComplete', () => {
      entering = false;
      if (fin.idle) idles.push(...fin.idle(gsap));
      idles.forEach((t) => t.paused(!isLive));
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
    live(on) { isLive = on; idles.forEach((t) => t.paused(!on)); sync(); if (!on) apply(); },
    finish() { if (started && entering) { tl.progress(1); apply(); } },
    lift(gsap) {
      if (!fin.lift || !started || entering || !isLive || gsap.ticker.time - liftAt < 1.2) return null;
      liftAt = gsap.ticker.time;
      lifting?.kill();
      lifting = fin.lift(gsap);
      return lifting;
    },
    still() { apply(); },
    destroy() { tl?.kill(); idles.forEach((t) => t.kill()); lifting?.kill(); started = false; entering = false; sync(); },
    apply,
  };
}
