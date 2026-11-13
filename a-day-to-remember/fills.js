// r13 page fills (shared by both birds unless noted), from the frame designer's orn-c.js, in the same gold-line and
// pastel-enamel hand as the frame. Markup strings; colours are proto.css classes. Imports only the sibling border.js.
import { f, leaf, petalD, pearl, dot, lotus, bud, rosette, floret, pad, stem, kolamPath, lotusFan, eyeDrop } from './border.js';

const TAU = Math.PI * 2;
const ring = (r1, r2, k, rot = 0) => Array.from({ length: k }, (_, i) => {
  const a = ((i * 360) / k + rot) * Math.PI / 180, b = (180 / k) * Math.PI / 180;
  const p = (rr, aa) => `${f(Math.cos(aa) * rr)} ${f(Math.sin(aa) * rr)}`;
  return `M${p(r1, a - b)}C${p(r1 + (r2 - r1) * 0.7, a - b * 1.05)} ${p(r2, a - b * 0.55)} ${p(r2, a)}C${p(r2, a + b * 0.55)} ${p(r1 + (r2 - r1) * 0.7, a + b * 1.05)} ${p(r1, a + b)}`;
}).join('');
const dots = (r, k, rr = 1.3, rot = 0) => Array.from({ length: k }, (_, i) => { const a = (i * TAU) / k + rot * Math.PI / 180; return `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" r="${rr}"/>`; }).join('');

// fine gold-line lotus mandala watermark (shown at 10 to 17 % opacity behind a fill; turns once per 180 s on live pages)
export function mandala(n = 16) {
  return `<svg class="orn wmk" viewBox="-200 -200 400 400" aria-hidden="true" focusable="false"><g class="wm">
    <circle r="197"/><circle r="191" stroke-width=".5"/>
    <path d="${ring(152, 188, 32)}"/><path d="${ring(120, 162, n, 360 / n / 2)}"/>
    <path d="${ring(84, 130, n)}"/><path d="${ring(50, 94, n / 2, 360 / n)}"/>
    <circle r="48"/><circle r="34" stroke-width=".6"/><path d="${ring(12, 34, 8)}"/>
  </g><g class="wm-dot">${dots(172, 32, 1.5)}${dots(108, n, 1.6, 360 / n / 2)}${dots(41, 8, 1.4)}</g></svg>`;
}

// enamel lotus medallion: two rings of 16 petals with veins, a pearl disc with double gold rims, eight mango leaves.
// Dove closing: the backdrop behind the bowing pair (no monogram). viewBox -100..100.
export function medallion({ inner = true } = {}) {
  const pet = (r1, r2, k, cls, rot = 0) => Array.from({ length: k }, (_, i) => `<path class="${cls} ln-g" transform="rotate(${f((i * 360) / k + rot)})" d="M0 ${-r1}C${f(-(r2 - r1) * 0.42)} ${f(-r1 - (r2 - r1) * 0.3)} ${f(-(r2 - r1) * 0.26)} ${f(-r1 - (r2 - r1) * 0.86)} 0 ${-r2}C${f((r2 - r1) * 0.26)} ${f(-r1 - (r2 - r1) * 0.86)} ${f((r2 - r1) * 0.42)} ${f(-r1 - (r2 - r1) * 0.3)} 0 ${-r1}Z"/>`).join('');
  const g = `<circle class="wm" r="97" opacity=".55"/><g class="wm-dot" opacity=".8">${dots(92, 48, 0.9)}</g>
    ${pet(56, 88, 16, 'en-pink-l', 11.25)}${pet(50, 80, 16, 'en-pink')}<path class="vein-r" d="${ring(50, 80, 16)}"/>
    ${inner ? `<circle class="disc" r="52"/><circle class="rim" r="51"/><circle class="rim thin" r="47"/><g class="gdot">${dots(49, 32, 0.7)}</g>` : ''}
    ${Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45})">${leaf(0, -84, -90, 9, 2.6)}</g>`).join('')}`;
  return g;
}
export const medallionSVG = (o) => `<svg class="orn medal" viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">${medallion(o)}</svg>`;

// ornate divider (replaces the mango rule on invite, reception and save the date). Peacock: a feather eye between leaves.
export function divider(bird = 'peacock', w = 150) {
  const c = w / 2;
  const mid = bird === 'peacock' ? eyeDrop(c, 0.2, 4.2, 180) : lotus(c, 2.4, 0.5);
  return `<svg class="orn divider" viewBox="0 -9 ${w} 18" aria-hidden="true" focusable="false">
    <path class="hair" d="M0 0H${f(c - 26)}M${f(c + 26)} 0H${w}"/>
    ${dot(c - 30, 0, 1)}${dot(c + 30, 0, 1)}${dot(c - 35, 0, 0.7)}${dot(c + 35, 0, 0.7)}
    ${leaf(c - 4, 1, 196, 17, 4.6)}${leaf(c + 4, 1, -16, 17, 4.6)}${mid}</svg>`;
}

// date (dove variant): an enamel lotus that opens with the reveal. Petals carry data-a (open angle); open 0..1.
const DL = [
  { a: -78, h: 40, w: 15, c: 'en-pink-l' }, { a: 78, h: 40, w: 15, c: 'en-pink-l' },
  { a: -56, h: 50, w: 17, c: 'en-pink-l' }, { a: 56, h: 50, w: 17, c: 'en-pink-l' },
  { a: -34, h: 58, w: 18, c: 'en-pink' }, { a: 34, h: 58, w: 18, c: 'en-pink' },
  { a: -14, h: 62, w: 18, c: 'en-pink' }, { a: 14, h: 62, w: 18, c: 'en-pink' },
  { a: 0, h: 64, w: 19, c: 'en-pink-d' },
];
export function dateLotus(open = 1) {
  const pet = DL.map((p) => `<g class="dl-p" data-a="${p.a}" transform="rotate(${f(p.a * open)})"><path class="${p.c} ln-g2" d="${petalD(p.h, p.w)}"/><path class="vein" d="M0 -6L0 ${f(-p.h * 0.8)}M0 -10L${f(-p.w * 0.35)} ${f(-p.h * 0.6)}M0 -10L${f(p.w * 0.35)} ${f(-p.h * 0.6)}"/></g>`).join('');
  return `<svg class="orn dlotus" viewBox="-110 -84 220 116" aria-hidden="true" focusable="false">
    <path class="kline" d="M-96 26C-60 2 60 2 96 26" opacity=".6"/>
    <g class="dl-pads">${leaf(-14, 8, 186, 70, 15)}${leaf(14, 8, -6, 70, 15)}${pad(-62, 20, 28, 7)}${pad(64, 20, 26, 6.5)}
    ${stem(-80, 22, 24, -4)}${bud(-84, -2, 1.1, -14)}${stem(84, 22, 20, 3)}${bud(87, 2, 0.9, 16)}</g>
    <g transform="translate(0 6)">${pet}<path class="en-jade ln-g2" d="M-24 2C-14 16 14 16 24 2C12 7 -12 7 -24 2Z"/>
    <circle class="gfill" cy="-4" r="4"/><g class="gdot" transform="translate(0 -4)">${dots(9, 10, 0.9)}</g></g></svg>`;
}
// the bloom: petals rotate out to their open angles, outer pair first (1.6 s power2.out, 0.06 s stagger)
export function lotusBloom(gsap, svg, { from = 0.1 } = {}) {
  const ps = [...svg.querySelectorAll('.dl-p')].sort((a, b) => Math.abs(b.dataset.a) - Math.abs(a.dataset.a));
  const tl = gsap.timeline();
  ps.forEach((g, i) => {
    const o = { v: from }, a = +g.dataset.a;
    const set = () => g.setAttribute('transform', `rotate(${f(a * o.v)})`);
    set();
    tl.to(o, { v: 1, duration: 1.6, ease: 'power2.out', onUpdate: set }, i * 0.06);
  });
  return tl;
}

// lamps stand on a kolam line: two hairlines, a run of loops, enamel pulli (blessings)
export function lampKolam(w = 300) {
  const N = Math.floor((w - 40) / 16);
  const off = (w - (N - 1) * 16) / 2;
  return `<svg class="orn lkolam" viewBox="0 -12 ${w} 24" aria-hidden="true" focusable="false">
    <path class="hair" d="M0 -6H${w}M0 6H${w}"/>
    <path class="kline loops" transform="translate(${f(off)} 0)" d="${kolamPath(N, 1, 16)}"/>
    ${Array.from({ length: N }, (_, i) => `<circle class="${['en-pink', 'en-teal-l', 'en-lav'][i % 3]} ln-g lk-p" cx="${f(off + i * 16)}" cy="0" r="1.8"/>`).join('')}</svg>`;
}

// invite gable (peacock variant): the mukhappu in gold, a string of jade leaves and peach florets under the eave,
// and an apex finial (a feather eye). The monogram sits over it in HTML (.logo, the Seal's target).
export function gable() {
  const slats = [44, 64, 84].flatMap((d) => [-d, d].map((x) => `M${150 + x} ${f(12 + d * 0.675)}V100`)).join('');
  let lv = '';
  for (let i = 0; i <= 12; i++) { const x = 30 + i * 20; lv += `<g class="gb-i">${i % 2 ? leaf(x, 107, 90, 11, 3.2, 'en-jade') : floret(x, 109, 2.3, 'en-peach')}</g>`; }
  return `<svg class="orn gable" viewBox="0 0 300 125" aria-hidden="true" focusable="false">
    <path class="g1 gd" pathLength="1" d="M150 4L8 100Q3 102.5 2 94.5"/><path class="g1 gd" pathLength="1" d="M150 4L292 100Q297 102.5 298 94.5"/>
    <path class="g2 gd" pathLength="1" d="M150 11.5L18 100.5"/><path class="g2 gd" pathLength="1" d="M150 11.5L282 100.5"/>
    <g class="g3"><path class="g1" d="M18 100.5H282M10 106H290"/><path class="g2" d="${slats}"/></g><g class="gb-eave">${lv}</g>
    <g class="gb-fin">${eyeDrop(150, -9.5, 4.6, -90)}${rosette(150, 4, 5.5, 8, 22.5)}</g></svg>`;
}
// invite threshold: two pairs of gold rails and a centre kolam loop (both birds)
export function threshold() {
  const d9 = [-4, 0, 4].flatMap((x) => [-4, 0, 4].map((y) => `<circle class="gdot" cx="${150 + x}" cy="${9 + y}" r=".9"/>`)).join('');
  return `<svg class="orn thresh" viewBox="0 0 300 18" aria-hidden="true" focusable="false"><path class="g1" d="M135 6H0M165 6H300M135 12H0M165 12H300"/><path class="kline" d="M150 9C146 1 154 1 150 9C158 5 158 13 150 9C154 17 146 17 150 9C142 13 142 5 150 9Z"/>${d9}</svg>`;
}
// the invite 4 x 3 sikku kolam with enamel pulli and blush-tinted loops (dove variant)
export function inviteKolam() {
  const P = 20, m = 4, n = 3;
  const ds = []; for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) ds.push(`<circle class="${(i + j) % 2 ? 'en-teal-l' : 'en-pink'} ln-g" cx="${i * P}" cy="${j * P}" r="2.2"/>`);
  return `<svg class="orn ikol" viewBox="${-P / 2 - 6} ${-P / 2 - 6} ${m * P + 12} ${n * P + 12}" aria-hidden="true" focusable="false"><path class="kline loops" pathLength="1" d="${kolamPath(m, n, P)}"/>${ds.join('')}</svg>`;
}
// small lotus fan for the four inner corners of the save-the-date card
export const cornerFan = () => `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">${lotusFan(2, 2, 0.62)}<path class="scroll thin" d="M18 4C26 3 32 4 38 6M4 18C3 26 4 32 6 38"/></svg>`;

// r14 gold leaf and glitter for the mandalas (BUILD-r14.md section 4).
// One shared gradient (objectBoundingBox, so every ring and path gets a light-to-deep sweep of its own).
export const goldDefs = () => `<svg class="defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <linearGradient id="wm-gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" style="stop-color:var(--leaf-1, #A07A2E)"/><stop offset=".28" style="stop-color:var(--leaf-2, #C99B40)"/>
    <stop offset=".46" style="stop-color:var(--leaf-3, #E8C675)"/><stop offset=".62" style="stop-color:var(--leaf-2, #C99B40)"/>
    <stop offset=".82" style="stop-color:var(--leaf-4, #DDB55F)"/><stop offset="1" style="stop-color:var(--leaf-1, #A07A2E)"/>
  </linearGradient></defs></svg>`;

// Glints sit on the mandala's dot rings (viewBox -200..200: r 172, 108, 41). Fixed list, so ?video=1 frames repeat.
const SPOTS = [
  [172, 14, 18, 0], [172, 62, 13, 2.1], [172, 104, 14, 1.3], [172, 150, 12, 0.6], [172, 196, 18, 2.6], [172, 244, 13, 1.7], [172, 288, 15, 0.7], [172, 330, 12, 3.0],
  [108, 34, 13, 1.0], [108, 82, 15, 1.9], [108, 160, 12, 0.4], [108, 214, 14, 2.4], [108, 262, 15, 2.9], [41, 30, 12, 1.1], [41, 120, 11, 2.2], [41, 210, 11, 3.0],
];
export const PAGE_SPOTS = SPOTS.filter((_, k) => k % 3 === 0);
export const PHONE_SPOTS = [0, 6, 12].map((k) => SPOTS[k]);
export function glints(scale = 1, list = SPOTS) {
  return list.map(([r, a, s, d], k) => {
    const x = 50 + (r / 4) * Math.cos((a * Math.PI) / 180);
    const y = 50 + (r / 4) * Math.sin((a * Math.PI) / 180);
    return `<i class="gl" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--s:${(s * scale).toFixed(1)}px;--d:${d}s;--t:${(2.4 + (k % 4) * 0.45).toFixed(2)}s"></i>`;
  }).join('');
}

// Living glow for a mandala host (a positioned box holding one svg): a breathing halo and a slow light wedge behind the lines,
// and a bright run of light travelling along the five main rings (stroke-dashoffset on clones of the gold lines, no filters).
const RUNS = [[5.6, -1], [7.4, 1], [6.6, -1], [8.2, 1], [6.0, -1]];
export function glow(host, { rings = 5 } = {}) {
  const svg = host.querySelector('svg');
  if (!svg || host.querySelector('.wm-halo')) return;
  const pick = [...svg.querySelectorAll('g.wm > *')].filter((e) => !e.getAttribute('stroke-width')).slice(0, rings);
  const clone = (cls) => pick.map((e, i) => {
    const c = e.cloneNode(false);
    c.setAttribute('pathLength', '1');
    c.setAttribute('class', cls);
    c.style.setProperty('--rt', `${RUNS[i][0]}s`);
    c.style.setProperty('--rd', `${RUNS[i][1] * 0.25}`);
    c.style.setProperty('--rl', `-${(i * 1.3).toFixed(1)}s`);
    return c.outerHTML;
  }).join('');
  svg.insertAdjacentHTML('beforeend', `<g class="wm-run">${clone('wm-run-g')}${clone('wm-run-c')}</g>`);
  host.insertAdjacentHTML('afterbegin', '<i class="wm-halo"></i><i class="wm-sweep"></i>');
}

// Wraps an existing mandala host: the svg turns slowly inside .wm-turn, the glints ride with it.
export function glitter(host, { scale = 1, list, rings } = {}) {
  const svg = host.querySelector('svg');
  if (!svg || host.querySelector('.wm-turn')) return;
  const turn = document.createElement('div');
  turn.className = 'wm-turn';
  svg.replaceWith(turn);
  turn.append(svg);
  turn.insertAdjacentHTML('beforeend', glints(scale, list));
  svg.classList.add('wm-gilt');
  glow(host, { rings });
}
