// r13w Western look: fills-western.js. Page fills and their motion (westernMotion). Markup strings; colours from western.css.
import { f, pearl, dot } from './border.js';
import { ribbon, bow } from './dove.js';
import { R, G, rose, peony, rosebud, rleaf, eleaf, eucSprig, willow, waxflower, berries } from './border-western.js';
const pop = (m) => `<g class="w-pop">${m}</g>`;

// lace doily watermark (replaces the mandala at 10 to 22 %; grafted from the Heirloom design): a scalloped edge, a ring of
// eyelets, 24 lace fans, a chain ring, 12 heart petals and an eight-petal centre. viewBox -200..200. Keeps the .lace /
// .lace-dot groups that closingWreath() and receptionWreath() reuse.
export function lace() {
  const N = 48, R0 = 186, R1 = 199, TAU = Math.PI * 2, p = (r, a) => `${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`;
  let edge = `M${p(R0, 0)}`;
  for (let i = 0; i < N; i++) { const a0 = (i * TAU) / N, a1 = ((i + 1) * TAU) / N; edge += `Q${p(R1, (a0 + a1) / 2)} ${p(R0, a1)}`; }
  const ring = (r, n, rr, rot = 0) => Array.from({ length: n }, (_, i) => { const a = (i * TAU) / n + rot; return `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" r="${rr}"/>`; }).join('');
  const fans = Array.from({ length: 24 }, (_, k) => `<path transform="rotate(${k * 15})" d="M-14 -112Q-17 -150 0 -172Q17 -150 14 -112M-9 -116Q-11 -143 0 -158Q11 -143 9 -116M-4 -120Q-5 -134 0 -144Q5 -134 4 -120"/>`).join('');
  const hearts = Array.from({ length: 12 }, (_, k) => `<path transform="rotate(${k * 30})" d="M0 -50C-14 -62 -20 -82 -9 -92C-4 -96 0 -93 0 -88C0 -93 4 -96 9 -92C20 -82 14 -62 0 -50Z"/>`).join('');
  const inner = Array.from({ length: 8 }, (_, k) => `<path transform="rotate(${k * 45})" d="M0 -8C-5 -14 -5 -26 0 -32C5 -26 5 -14 0 -8Z"/>`).join('');
  return `<svg class="orn w-lace" viewBox="-200 -200 400 400" aria-hidden="true" focusable="false"><g class="lace">
    <path d="${edge}Z"/><circle r="181" stroke-width=".5"/>${fans}<circle r="108"/><circle r="99" stroke-width=".5"/>${hearts}<circle r="46"/><circle r="40" stroke-width=".5"/>${inner}</g>
    <g class="lace-dot">${ring(176, 48, 1.7, TAU / 96)}${ring(103.5, 36, 1.4)}${ring(43, 16, 1.1)}</g></svg>`;
}

// foliage that follows a circle of radius r from the bottom (90 deg) up both sides to the top; size shrinks upward
function ringFoliage(r, { from = 90, to = -78, step = 10, size = 1, skip = [] } = {}) {
  let s = '';
  [1, -1].forEach((side) => {
    let k = 0;
    for (let a = from; side > 0 ? a >= to : a <= 180 - to; a += side > 0 ? -step : step, k++) {
      const aa = side > 0 ? a : a, t = Math.abs(aa - from) / Math.abs(to - from), sz = size * (1 - 0.35 * t);
      if (skip.some(([lo, hi]) => aa > lo && aa < hi)) continue;
      const x = Math.cos(R(aa)) * r, y = Math.sin(R(aa)) * r, dir = aa - 90 * side;
      const out = k % 2 ? 1 : -1;
      if (k % 3 === 2) s += G(x, y, dir + out * 30, 1, willow(0, 0, 0, 14 * sz, { bend: out, L: 8 * sz, w: 1.7 * sz }));
      else s += eleaf(x, y, dir + out * 46, 5.4 * sz, k % 4 === 1 ? 'wf-eu2' : 'wf-eu');
      if (k % 2 === 0) s += rleaf(x, y, dir - out * 62, 9 * sz, 3.4 * sz);
    }
  });
  return s;
}
// a round floral wreath: fine gold double ring, eucalyptus and sage foliage, and flower clusters at the given angles
// clusters: [[angle, scale, kind]] kind 'main' (peony + two roses + buds) or 'small' (rose + buds)
export function floralRing(r, { clusters = [[90, 1, 'main']], disc = 0, rings = true, size = 1, skip = [] } = {}) {
  let s = disc ? `<circle class="disc" r="${f(disc)}"/><circle class="rim" r="${f(disc - 1)}"/><circle class="rim thin" r="${f(disc - 3.2)}"/>` : '';
  if (rings) s += `<circle class="rim thin" r="${f(r + 3.4)}" opacity=".8"/><circle class="wf-st" r="${f(r)}" fill="none"/>`;
  s += ringFoliage(r, { size, skip });
  clusters.forEach(([a, k, kind]) => {
    const x = Math.cos(R(a)) * r, y = Math.sin(R(a)) * r, tan = a - 90;
    const u = r * 0.2 * k;
    if (kind === 'main') {
      s += eucSprig(x, y, tan + 180 - 18, u * 3.4, u * 0.36, { bend: -1 }) + eucSprig(x, y, tan + 18, u * 3.4, u * 0.36, { bend: 1, first: 0 });
      s += rleaf(x, y, tan + 200, u * 1.8, u * 0.62) + rleaf(x, y, tan - 20, u * 1.8, u * 0.62);
      s += rosebud(x + Math.cos(R(tan + 180)) * u * 2.4, y + Math.sin(R(tan + 180)) * u * 2.4, u * 0.075, tan - 90 - 40)
        + rosebud(x + Math.cos(R(tan)) * u * 2.4, y + Math.sin(R(tan)) * u * 2.4, u * 0.075, tan + 90 + 40 - 180);
      s += waxflower(x + Math.cos(R(tan + 150)) * u * 1.6, y + Math.sin(R(tan + 150)) * u * 1.6, u * 0.24) + waxflower(x + Math.cos(R(tan + 30)) * u * 1.7, y + Math.sin(R(tan + 30)) * u * 1.7, u * 0.2);
      s += berries(x + Math.cos(R(tan - 160)) * u * 1.9, y + Math.sin(R(tan - 160)) * u * 1.9, u * 0.12) + berries(x + Math.cos(R(tan - 25)) * u * 1.95, y + Math.sin(R(tan - 25)) * u * 1.95, u * 0.11);
      s += rose(x + Math.cos(R(tan + 180)) * u * 1.25, y + Math.sin(R(tan + 180)) * u * 1.25, u * 0.62, 'ro', a)
        + rose(x + Math.cos(R(tan)) * u * 1.25, y + Math.sin(R(tan)) * u * 1.25, u * 0.56, 'rd', -a);
      s += peony(x, y, u * 0.86, a / 3);
    } else {
      s += eucSprig(x, y, tan + 180 - 12, u * 2.4, u * 0.32, { bend: -1 }) + eucSprig(x, y, tan + 12, u * 2.4, u * 0.32, { bend: 1, first: 0 });
      s += rleaf(x, y, tan + 210, u * 1.4, u * 0.5) + rleaf(x, y, tan - 30, u * 1.4, u * 0.5);
      s += rosebud(x + Math.cos(R(tan)) * u * 1.3, y + Math.sin(R(tan)) * u * 1.3, u * 0.06, tan + 60 - 90 + 90);
      s += waxflower(x + Math.cos(R(tan + 160)) * u * 1.1, y + Math.sin(R(tan + 160)) * u * 1.1, u * 0.2);
      s += rose(x, y, u * 0.6, kind === 'rd' ? 'rd' : 'pe', a);
    }
  });
  return s;
}

// invite crown for the peacock look (replaces the gable): a floral wreath around the monogram with eucalyptus sprays
// running out along the top. viewBox 0 0 290 150; wreath centre (145, 66), r 44. Monogram: left 50 %, top 44 %, width 17.6 %.
export function wreathCrown() {
  const fol = (s) => `${willow(145 + s * 46, 62, s > 0 ? 8 : 172, 78, { bend: s > 0 ? 3 : -3, L: 11, w: 2.2 })}${eucSprig(145 + s * 42, 54, s > 0 ? -12 : 192, 100, 6, { bend: s > 0 ? -5 : 5 })}`
    + `${eucSprig(145 + s * 48, 70, s > 0 ? 16 : 164, 64, 5, { bend: s > 0 ? 3 : -3, first: 0 })}${rleaf(145 + s * 50, 58, s > 0 ? -30 : 210, 20, 6.6)}${rleaf(145 + s * 52, 66, s > 0 ? 22 : 158, 18, 6)}`;
  const flo = (s) => pop(rose(145 + s * 62, 56, 8.4, s > 0 ? 'rd' : 'ro', s * 30)) + pop(rosebud(145 + s * 112, 34, 0.9, s * 78)) + pop(waxflower(145 + s * 86, 44, 3))
    + pop(berries(145 + s * 96, 50, 1.1)) + pop(waxflower(145 + s * 100, 60, 2.4));
  return `<svg class="orn w-crown-svg" viewBox="0 0 290 150" aria-hidden="true" focusable="false"><defs><clipPath id="wcWipe"><rect class="wc-wipe" x="0" y="-20" width="290" height="190"/></clipPath></defs>
    <g class="wc-sprays" clip-path="url(#wcWipe)">${fol(-1)}${fol(1)}</g>${flo(-1)}${flo(1)}
    <g class="wc-ring"><g transform="translate(145 66)">${floralRing(46, { disc: 35, clusters: [[90, 1.1, 'main'], [-90, 0.6, 'small']], skip: [[-118, -62]] })}</g></g></svg>`;
}
// dove crown medallion (the doveScene invite option): same wreath, r = the lace medallion's radius
export const doveWreath = (r = 40) => floralRing(r * 0.98, { disc: r * 0.8, clusters: [[-90, 0.8, 'main'], [90, 0.5, 'small']], size: 0.95, skip: [[-122, -58]] });

// the doves' garland (doveScene invite option): eucalyptus, rosebuds and waxflowers on a gold thread, a rose at the low point
export function swag(p0, p1, sag, size = 1) {
  const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2 + sag * 2;
  const q = (t) => ({ x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * mx + t * t * p1.x, y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * my + t * t * p1.y });
  const N = Math.max(8, Math.round(Math.hypot(p1.x - p0.x, p1.y - p0.y) / (4.2 * size)));
  let d = '', lv = '', fl = '';
  for (let i = 0; i <= N; i++) {
    const t = i / N, p = q(t), p2 = q(Math.min(1, t + 0.01)), a = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
    d += `${i ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`;
    if (i > 0 && i < N) {
      const side = i % 2 ? 1 : -1;
      lv += eleaf(p.x, p.y, a + side * 55 + (t < 0.5 ? 0 : 180) * 0, 3.1 * size, i % 3 ? 'wf-eu' : 'wf-eu2');
      if (i % 4 === 2 && Math.abs(t - 0.5) > 0.1) fl += rosebud(p.x, p.y + 1, 0.5 * size, a + 90 + side * 20, i % 8 === 2 ? 'rd' : 'pe');
      else if (i % 4 === 0 && Math.abs(t - 0.5) > 0.1) fl += waxflower(p.x, p.y + 1.2, 2 * size);
    }
  }
  const m = q(0.5);
  return `<path class="wf-st" d="${d}"/>${lv}${fl}${rleaf(m.x, m.y, 200, 9 * size, 3.4 * size)}${rleaf(m.x, m.y, -20, 9 * size, 3.4 * size)}${rose(m.x, m.y + 1, 5.2 * size, 'ro', 8)}`;
}

// the invite posy (dove look, the free space under the text; replaces the kolam): roses, a peony and eucalyptus,
// stems gathered by a satin bow. The flower head is drawn 1.3x about the bow. viewBox -108 -160 216 240.
export function posy() {
  const C = [0, -30];
  const stems = [-12, -7, -2, 3, 8, 13].map((x) => `<path class="w-stem" d="M${f(x * 0.5)} 30C${f(x * 0.6)} 40 ${f(x * 1.1)} 54 ${f(x * 1.6)} 66"/>`).join('');
  let back = '';
  for (let a = -176; a <= 4; a += 16) { const r = 50 + (Math.abs(a + 90) < 40 ? 6 : 0); back += eleaf(C[0] + Math.cos(R(a)) * r * 0.86, C[1] + Math.sin(R(a)) * r * 0.86, a, 9.6, (a / 16) % 2 ? 'wf-eu' : 'wf-eu2'); }
  for (let a = -166; a <= -14; a += 22) back += rleaf(C[0] + Math.cos(R(a)) * 36, C[1] + Math.sin(R(a)) * 36, a, 32, 10);
  const drape = eucSprig(-20, 4, 150, 78, 7, { bend: -9 }) + eucSprig(20, 4, 30, 78, 7, { bend: 9, first: 0 })
    + willow(-14, 10, 118, 66, { bend: -3, L: 14, w: 2.8 }) + willow(14, 10, 62, 66, { bend: 3, L: 14, w: 2.8 })
    + willow(-6, -44, -112, 74, { bend: 4, L: 14, w: 2.8 }) + willow(6, -44, -68, 74, { bend: -4, L: 14, w: 2.8 })
    + eucSprig(-30, -40, -150, 64, 6.4, { bend: 6 }) + eucSprig(30, -40, -30, 64, 6.4, { bend: -6 });
  const fl = [rosebud(-60, -70, 1.15, -50), rosebud(62, -66, 1.1, 48), rosebud(-4, -104, 1, -4, 'pe'), rosebud(-70, 22, 1, -120, 'pe'), rosebud(70, 26, 1, 122),
    waxflower(-50, -2, 3.8), waxflower(52, 0, 3.4), waxflower(-24, -74, 3.2), waxflower(28, -80, 3), waxflower(-62, -36, 2.8), waxflower(64, -38, 2.8),
    berries(-66, -50, 1.4), berries(68, -18, 1.3), berries(-42, 16, 1.2), berries(12, -92, 1.1), berries(44, 20, 1.1)].map(pop).join('')
    + rose(-30, -46, 16, 'ro', 10) + rose(32, -42, 15, 'rd', -16) + rose(-38, -12, 14, 'pe', 30) + rose(40, -8, 13.5, 'ro', -40) + rose(2, -68, 14, 'pe', 20)
    + peony(0, -28, 27, 6) + rose(-16, 9, 12, 'rd', 0) + rose(18, 11, 11.5, 'pe', 50);
  const dg = (id, c) => `<linearGradient id="wp-${id}" x1="0" y1="1" x2="0" y2="0">${c.map((k, i) => `<stop offset="${[0, 0.5, 1][i]}" stop-color="${k}"/>`).join('')}</linearGradient>`;
  const dr = (id, c) => `<radialGradient id="wp-${id}" cx="50%" cy="50%" r="50%">${c.map((k, i) => `<stop offset="${i}" stop-color="${k}"/>`).join('')}</radialGradient>`;
  const tone = `<defs>${dg('pe', ['#DB8E97', '#EDB4B6', '#FAE0DC'])}${dr('pec', ['#CE7A86', '#E5A6AB'])}${dg('ro', ['#E0B5A0', '#F2D9C8', '#FBEEE2'])}${dr('roc', ['#D49C88', '#EBCBB8'])}${dg('rd', ['#BD6A78', '#DE9EA2', '#F2CCC8'])}${dr('rdc', ['#A85866', '#D08C94'])}</defs>`;
  return `<svg class="orn w-posy" viewBox="-108 -160 216 240" aria-hidden="true" focusable="false">${tone}<g class="ps-all"><g transform="translate(0 36) scale(1.3) translate(0 -36)">${stems}${drape}${back}${fl}</g>
    <g transform="translate(0 36)"><g class="ps-tails">${ribbon({ x: -2, y: 2 }, { x: -18, y: 40 }, 5, 4)}${ribbon({ x: 2, y: 2 }, { x: 16, y: 36 }, 5, -4)}</g>${bow(0, 0, 1.3)}</g></g></svg>`;
}

// the date rose (dove look; replaces the enamel lotus): one large garden rose laid across eucalyptus and rose leaves,
// with a smaller rose and buds. It waits as a tight bud and blooms when the date is scratched. viewBox -150 -66 300 120.
const RS = [[0.36, 1], [0.46, 1], [0.6, 1], [0.78, 1]]; // closed scale per ring (outer..inner); open is 1
const ringScale = (k, v) => f(RS[k][0] + (1 - RS[k][0]) * v);
export function setRose(svg, v, ring = null) {
  svg.querySelectorAll('.w-big .w-pt').forEach((g) => {
    const k = +g.dataset.ring; if (ring !== null && k !== ring) return;
    const vv = typeof v === 'function' ? v(k) : v;
    g.setAttribute('transform', `${k < 3 ? `rotate(${g.dataset.a}) ` : ''}scale(${ringScale(k, vv)})`);
  });
}
export function dateRose(open = 1) {
  const side = (s) => eucSprig(s * 16, 6, s > 0 ? -4 : 184, 132, 7, { bend: s > 0 ? -6 : 6 }) + willow(s * 18, 14, s > 0 ? 14 : 166, 112, { bend: s > 0 ? 4 : -4, L: 14, w: 2.8 })
    + eucSprig(s * 12, 20, s > 0 ? 34 : 146, 86, 6, { bend: s > 0 ? 5 : -5, first: 0 }) + eucSprig(s * 10, -14, s > 0 ? -38 : 218, 92, 6.2, { bend: s > 0 ? -5 : 5 })
    + willow(s * 6, -20, s > 0 ? -66 : 246, 70, { bend: s > 0 ? 3 : -3, L: 13, w: 2.6 })
    + rleaf(s * 30, 18, s > 0 ? 22 : 158, 34, 11) + rleaf(s * 32, -14, s > 0 ? -30 : 210, 30, 10) + rleaf(s * 20, -34, s > 0 ? -70 : 250, 26, 9)
    + waxflower(s * 82, -10, 4) + waxflower(s * 104, 16, 3.4) + waxflower(s * 124, -2, 3) + waxflower(s * 40, -58, 3.2) + berries(s * 112, -14, 1.5) + berries(s * 68, 28, 1.3) + berries(s * 54, -52, 1.2);
  const big = rose(0, 0, 44, 'pe', 8, { bloom: true }).replace('<g transform', '<g class="w-big" transform');
  let svg = `<svg class="orn w-drose" viewBox="-150 -92 300 166" aria-hidden="true" focusable="false">${side(-1)}${side(1)}
    ${rosebud(-28, -58, 1.2, -24)}${rosebud(30, -60, 1.15, 26, 'pe')}${rosebud(-80, -34, 1.1, -70)}${rosebud(82, -30, 1.05, 66, 'pe')}${rosebud(-34, 40, 1, -160)}${rosebud(36, 42, 1, 160)}
    ${rose(-58, 16, 18, 'ro', -20)}${rose(60, 18, 17, 'rd', 30)}
    ${rleaf(-12, 32, 116, 26, 8.6)}${rleaf(14, 34, 64, 26, 8.6)}${big}SHEATH</svg>`;
  if (open >= 1) return svg.replace('SHEATH', '');
  svg = svg.replace('SHEATH', `<g class="w-sheath">${rosebud(0, 23, 3.5, 0, 'pe')}</g>`);
  return svg.replace(/<g class="w-pt" data-ring="(\d)" data-a="([-\d.]+)" transform="rotate\(([-\d.]+)\)">/g, (m, k, a) => `<g class="w-pt" data-ring="${k}" data-a="${a}" transform="rotate(${a}) scale(${ringScale(+k, open)})">`)
    .replace('<g class="w-pt" data-ring="3" data-a="0">', `<g class="w-pt" data-ring="3" data-a="0" transform="scale(${ringScale(3, open)})">`);
}
// the bloom (called where fills.lotusBloom is): outer petals unfurl first, 1.6 s power2.out, 0.12 s per ring
export function roseBloom(gsap, svg, { from = 0.1 } = {}) {
  const tl = gsap.timeline(), sh = svg.querySelector('.w-sheath');
  if (sh) tl.to(sh, { opacity: 0, duration: 0.7, ease: 'power1.in' }, 0.05);
  [0, 1, 2, 3].forEach((k) => { const o = { v: from }; tl.to(o, { v: 1, duration: 1.6, ease: 'power2.out', onUpdate: () => setRose(svg, o.v, k) }, k * 0.12); });
  return tl;
}

// blessings: a horizontal rose-and-eucalyptus garland in place of the jasmine strip image. viewBox -140 -16 280 32
export const strip = () => `<svg class="orn w-strip jas" viewBox="-140 -16 280 32" aria-hidden="true" focusable="false">
  ${[-1, 1].map((s) => eucSprig(s * 8, 0, s > 0 ? 0 : 180, 128, 4.2, { bend: s * 2.2 }) + willow(s * 10, 2, s > 0 ? 6 : 174, 96, { bend: -s * 1.6 }) + rleaf(s * 16, 2, s > 0 ? -22 : 202, 14, 4.8) + rleaf(s * 18, 3, s > 0 ? 24 : 156, 13, 4.4)
    + rosebud(s * 30, 2, 0.62, s * 96, 'pe') + waxflower(s * 46, -3, 2.6) + waxflower(s * 78, 3, 2.3) + berries(s * 62, 4, 0.8) + rose(s * 104, 0, 5.4, s > 0 ? 'rd' : 'ro', s * 30) + waxflower(s * 120, -2, 1.9)).join('')}
  ${rose(-12, 1, 7.6, 'ro', 10)}${rose(12, 1, 7.2, 'rd', -20)}${peony(0, -1, 9.6, 4)}</svg>`;

// blessings: the candle ledge (replaces the lamp kolam): two gold hairlines with a string of pearls (.lk-p pulse when a
// candle is lit) and sprays at both ends. viewBox 0 -14 w 28
function swags(w) {
  const xs = [30, 90, 150, 210, 270].map((x) => x * w / 300);
  let o = '';
  for (let i = 0; i < xs.length - 1; i++) {
    const a = { x: xs[i], y: 5 }, b = { x: xs[i + 1], y: 5 }, mx = (a.x + b.x) / 2;
    o += `<path class="wf-st" d="M${f(a.x)} 5Q${f(mx)} 26 ${f(b.x)} 5"/>`;
    for (let k = 1; k < 9; k++) { const t = k / 9, x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x, y = (1 - t) * (1 - t) * 5 + 2 * (1 - t) * t * 26 + t * t * 5; o += eleaf(x, y, (k % 2 ? 60 : 120) + (t - 0.5) * 60, 2.6, k % 2 ? 'wf-eu' : 'wf-eu2'); }
  }
  xs.forEach((x, i) => { o += (i % 2 ? rosebud(x, 6, 0.5, 180, 'pe') : waxflower(x, 6.5, 2.2)); });
  return `<g class="w-swags">${o}${rose(w / 2 - w / 10, 15.5, 3.6, 'pe', 10)}${rose(w / 2 + w / 10, 15.5, 3.6, 'ro', -10)}</g>`;
}
export function ledge(w = 300) {
  const N = Math.floor((w - 70) / 9), off = (w - (N - 1) * 9) / 2;
  return `<svg class="orn w-ledge lkolam" viewBox="0 -14 ${w} 42" aria-hidden="true" focusable="false">
    <path class="hair" d="M18 -4.5H${w - 18}M18 4.5H${w - 18}"/>
    ${Array.from({ length: N }, (_, i) => `<circle class="pearl lk-p" cx="${f(off + i * 9)}" cy="0" r="${i % 2 ? 1.4 : 2}"/>`).join('')}
    ${swags(w)}
    ${[0, 1].map((m) => `<g transform="${m ? `translate(${w} 0) scale(-1 1)` : ''}">${eucSprig(24, 0, 172, 30, 3.4, { bend: -2 })}${willow(22, 2, 194, 24)}${rose(22, 0, 5.2, m ? 'rd' : 'ro', 20)}${rosebud(12, -6, 0.5, -70, 'pe')}</g>`).join('')}</svg>`;
}

// the divider (invite, reception, save the date): gold hairlines, eucalyptus sprigs and a small blush rose
export function divider(w = 150) {
  const c = w / 2;
  return `<svg class="orn divider" viewBox="0 -10 ${w} 20" aria-hidden="true" focusable="false">
    <path class="hair" d="M0 0H${f(c - 30)}M${f(c + 30)} 0H${w}"/>${dot(c - 33, 0, 1)}${dot(c + 33, 0, 1)}${dot(c - 38, 0, 0.7)}${dot(c + 38, 0, 0.7)}
    ${eucSprig(c - 4, 0.5, 184, 24, 2.6, { bend: 1 })}${eucSprig(c + 4, 0.5, -4, 24, 2.6, { bend: -1, first: 0 })}${rleaf(c, 1, 160, 9, 3.2)}${rleaf(c, 1, 20, 9, 3.2)}${rose(c, 0, 4.4, 'pe', 10)}</svg>`;
}

// save-the-date inner corners: a gold filigree curl and a rosebud spray (40 x 40)
export const cornerSpray = () => `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <path class="scroll thin" d="M16 4C25 3 31 4 38 6M4 16C3 25 4 31 6 38"/><path class="scroll" d="M4 13C4 7 7 4 13 4M9 9c3 0 5 2 5 5c0 2 -2 3 -3 2"/>
  ${eleaf(10, 10, 20, 3.4)}${eleaf(10, 10, 70, 3.4, 'wf-eu2')}${rleaf(11, 11, 45, 9, 3.2)}${rosebud(12, 12, 0.62, 135, 'pe')}${pearl(16, 4, 0.9)}${pearl(4, 16, 0.9)}</svg>`;

// then, now & forever: a satin lover's knot under the main print (replaces the kolam knot; same tk-line / tk-dots hooks)
export const knot = () => `<svg viewBox="-34 -13 68 27" aria-hidden="true" focusable="false">
  <path class="tk-line" pathLength="1" d="M0 0C-6 -9 -21 -11 -23 -2C-25 7 -9 6 0 0C9 -6 25 -7 23 2C21 11 6 9 0 0"/>
  <path class="tk-line" pathLength="1" d="M0 0C-3 5 -8 9 -14 12M0 0C3 5 8 9 14 12"/>
  <path class="tk-glint" pathLength="1" d="M0 0C-6 -9 -21 -11 -23 -2C-25 7 -9 6 0 0C9 -6 25 -7 23 2C21 11 6 9 0 0"/>
  <g class="tk-dots">${pearl(0, 0, 2)}${pearl(-14, 12, 1.2)}${pearl(14, 12, 1.2)}</g></svg>`;

// dove closing backdrop (replaces the enamel lotus medallion): a floral wreath, flowers at ten and two o'clock so the
// perched pair and branch never cover them. viewBox units -100..100 (placed by dove.js at translate(0 -44) scale(1.02))
export const closingWreath = () => `<g class="w-cw">${lace().replace(/<\/?svg[^>]*>/g, '').replace('<g class="lace">', '<g class="lace" opacity=".35" transform="scale(.48)">').replace('<g class="lace-dot">', '<g class="lace-dot" opacity=".35" transform="scale(.48)">')}
  ${floralRing(74, { disc: 0, clusters: [[-140, 1.05, 'main'], [-40, 1.05, 'main'], [-90, 0.5, 'small']], size: 1.15 })}</g>`;

// perch branch (dove closing and desktop sides; replaces the jasmine branch): a gold twig with rose leaves, eucalyptus,
// roses at both ends and waxflowers. Same curve as dove.js branch().
export function roseBranch(hw = 120) {
  const yAt = (x) => 6 * (1 - (x / hw) ** 2) * -1 + 6;
  let d = '', s = '';
  for (let x = -hw; x <= hw; x += 4) d += `${d ? 'L' : 'M'}${f(x)} ${f(yAt(x))}`;
  for (let x = -hw + 10; x <= hw - 10; x += 14) {
    const up = Math.round(x / 14) % 2 ? 1 : -1, y = yAt(x);
    s += Math.abs(x) % 28 < 14 ? eleaf(x, y, (x < 0 ? 200 : -20) + up * 40, 4.2, 'wf-eu') : rleaf(x, y, (x < 0 ? 200 : -20) + up * 36, 11, 4);
  }
  s += eucSprig(-hw + 4, yAt(-hw) , 200, 30, 3.6, { bend: 2 }) + eucSprig(hw - 4, yAt(hw), -20, 30, 3.6, { bend: -2 });
  for (const x of [-hw * 0.6, hw * 0.6]) s += waxflower(x, yAt(x) + 3, 2.8);
  for (const x of [-hw * 0.82, hw * 0.82]) s += rosebud(x, yAt(x), 0.7, x < 0 ? -60 : 60, 'pe');
  s += rose(-hw + 6, yAt(-hw) + 1, 7.4, 'ro', 10) + rose(hw - 6, yAt(hw) + 1, 7, 'rd', -20);
  return `<path d="${d}" class="wf-st" stroke-width="1.5"/><path d="${d}" fill="none" stroke="var(--gold-hi)" stroke-width=".5" transform="translate(0 -.5)"/>${s}`;
}

// dove reception wreath (replaces the jasmine wreath): faint lace inside, the floral ring, a satin bow at its foot and
// two ribbon tails pointing to Get directions. The pair perches on its top.
export const receptionWreath = (r = 74, tail = 100) => `<g opacity=".55" transform="scale(.36)">${lace().replace(/<\/?svg[^>]*>/g, '')}</g>`
  + floralRing(r, { clusters: [[-150, 0.7, 'small'], [-30, 0.7, 'rd'], [142, 1.25, 'main'], [38, 1.25, 'main']], size: 1.15, skip: [[-112, -68]] })
  + `<g class="rb-tails">${ribbon({ x: -2, y: r + 2 }, { x: -18, y: r + tail }, 4.4, 5)}${ribbon({ x: 2, y: r + 2 }, { x: 16, y: r + tail * 0.86 }, 4.4, -5)}</g>${bow(0, r + 1, 1.15)}`;

// peacock reception: the vine across the page in eucalyptus and roses (same viewBox, path and hooks as peacock.vineBranch)
export function westBranch({ px = 228 } = {}) {
  const d = `M0 26C60 30 110 14 170 19S${px - 20} 21 ${px + 10} 20S330 12 400 22`;
  const yv = (x) => x < 170 ? 26 - (x / 170) * 7 + Math.sin(x / 27) * 2 : x < 258 ? 20 : 20 - (x - 258) / 142 * 2 + Math.sin(x / 20) * 1.5;
  let lv = '';
  for (let x = 8, i = 0; x < 396; x += 15, i++) {
    if (x > 200 && x < 262) continue;
    const y = yv(x), up = i % 2 ? -1 : 1;
    lv += eleaf(x, y, up > 0 ? -38 - (i % 3) * 8 : -142 + (i % 3) * 8, 7.2, i % 3 ? 'wf-eu' : 'wf-eu2');
    if (i % 2 === 0) lv += rleaf(x + 4, y, up > 0 ? 28 : 152, 18, 6.2);
    if (i % 4 === 1) lv += willow(x, y, up > 0 ? 160 : 20, 34, { bend: 2, L: 10, w: 2 });
  }
  const fl = [[72, 24, 11, 'pe'], [152, 19, 9, 'ro'], [312, 15, 11, 'rd'], [386, 21, 8, 'pe']].map(([x, y, r, t]) => rose(x, y, r, t, x)).join('');
  const sprig = (x, y, len, k = 0) => {
    let g = `<path class="wf-st" d="M${x} ${y}q${k % 2 ? 3 : -3} ${len * 0.5} 0 ${len}"/>`;
    for (let j = 1, n = Math.max(1, Math.round(len / 9)); j <= n; j++) { const yy = y + (len * j) / (n + 0.6); g += eleaf(x, yy, j % 2 ? 50 : 130, 4.4 - j * 0.2, j % 2 ? 'wf-eu' : 'wf-eu2'); }
    return `<g class="br-sp" style="--k:${k}" transform-origin="${x} ${y}">${g}${rosebud(x, y + len + 1, 0.8, 180, 'pe')}</g>`;
  };
  return `<svg class="branch" viewBox="0 0 400 80" aria-hidden="true" focusable="false"><path class="br-line wf-st" pathLength="1" d="${d}" stroke-width="1.6"/>`
    + `<g class="br-lv">${lv}</g>${sprig(40, 25, 34, 0)}${sprig(110, 18, 22, 1)}${sprig(298, 15, 46, 2)}${sprig(352, 15, 26, 3)}${fl}`
    + `${waxflower(100, 14, 3.4)}${waxflower(120, 24, 2.8)}${waxflower(338, 10, 3.2)}${berries(176, 24, 1.2)}${berries(290, 22, 1.2)}${berries(46, 18, 1)}</svg>`;
}

// a pillar candle on a gold holder (the deepam's place). Box 30 wide; wick tip at the top centre (flame sits on it).
export function candle(h = 52) {
  const top = 6, b = top + h;
  return `<svg viewBox="0 0 30 ${b + 12}" aria-hidden="true" focusable="false">
    <path class="wf-cn" d="M7 ${top}V${b}H23V${top}Z"/>
    <path class="wf-cn" d="M7 ${top}c0 1.6 3.6 2.6 8 2.6s8 -1 8 -2.6c0 -1.4 -3.6 -2.2 -8 -2.2S7 ${top - 1.4} 7 ${top}Z"/>
    <path fill="#FFFDF8" stroke="#D9C9AE" stroke-width=".3" d="M17.6 ${top + 2.2}c.6 3 1.6 5 1.6 7.4c0 1.6 -1.6 1.6 -1.6 0c0 -2 -.6 -4.4 -.8 -7.2Z"/>
    <path stroke="#4A3B2C" stroke-width=".9" stroke-linecap="round" d="M15 ${top + 0.6}V${top - 3.2}"/>
    <path class="wf-au" d="M3 ${b}h24c0 1.8 -2.4 3 -5 3.4l-1.2 2.6h3.4c1.2 0 1.8 1.6 .6 2H5.2c-1.2 -.4 -.6 -2 .6 -2h3.4L8 ${b + 3.4}c-2.6 -.4 -5 -1.6 -5 -3.4Z"/>
    ${pearl(15, b + 1.6, 0.9)}</svg>`;
}
// invite threshold (dove look): gold rails with a low eucalyptus garland and a rose at the centre; four candles stand on it
export const threshold = () => `<svg class="orn thresh w-thresh" viewBox="0 0 300 30" aria-hidden="true" focusable="false"><path class="g1" d="M0 20H300M0 25H300"/>
  ${[-1, 1].map((s) => eucSprig(150 + s * 10, 20, s > 0 ? 0 : 180, 136, 6, { bend: s * 1.2 }) + willow(150 + s * 12, 21, s > 0 ? 4 : 176, 90, { bend: -s })).join('')}
  ${rleaf(150, 20, 200, 12, 4.4)}${rleaf(150, 20, -20, 12, 4.4)}${rose(150, 19, 6.4, 'pe', 0)}${waxflower(132, 17, 2.4)}${waxflower(168, 17, 2.4)}</svg>`;

// the dove's Western ornaments, passed as doveScene(page, host, { orn: doveOrn })
export const doveOrn = { medallion: doveWreath, garland: swag, wreath: receptionWreath, branch: roseBranch };

// motion for the Western fills (pattern grafted from the Heirloom design). birds.js creates one per page beside the bird
// controller: enter() once on the first pg:reveal, finish() on pg:leave, live(on) pauses the idles, still() under RM,
// bloom() opens the date rose. Every stagger comes from an index; every entrance ends inside its ?video=1 hold.
export function westernMotion(page, pg, gsap, { bird = 'dove' } = {}) {
  let tl = null, bl = null, isLive = true;
  const idles = [], all = (q) => [...pg.querySelectorAll(q)];
  const idle = (t) => { t.paused(!isLive); idles.push(t); return t; };
  const pops = (els, at, each) => els.forEach((el, i) => tl.fromTo(el, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', transformOrigin: '50% 50%' }, at + i * each));
  const build = () => {
    if (tl) return tl;
    tl = gsap.timeline({ paused: true });
    if (page === 'invite' && bird === 'peacock') {
      // wreath fades and rises 0-0.8; sprays wipe out from the centre 0.6-1.8; spray flowers pop from 1.2; ends ~2.1
      tl.fromTo(all('.wc-ring'), { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0);
      tl.fromTo(all('.wc-wipe'), { attr: { x: 145, width: 0 } }, { attr: { x: 0, width: 290 }, duration: 1.2, ease: 'power2.inOut' }, 0.6);
      pops(all('.w-crown-svg .w-pop'), 1.2, 0.04);
    }
    if (page === 'invite' && bird === 'dove') {
      // posy rises about its bow 1.0-2.2; buds, waxflowers and berries pop from 1.6 (0.03 s apart); ends ~2.6; tails sway
      tl.fromTo(all('.ps-all'), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', svgOrigin: '0 36' }, 1.0);
      pops(all('.w-posy .w-pop'), 1.6, 0.03);
      tl.call(() => all('.ps-tails').forEach((g) => idle(gsap.fromTo(g, { rotation: -2 }, { rotation: 2, duration: 2.5, ease: 'sine.inOut', repeat: -1, yoyo: true, svgOrigin: '0 38' }))), null, 2.6);
    }
    return tl;
  };
  return {
    prime() { build(); },
    enter() { return build().play(); },
    bloom({ breathe = true } = {}) {
      const svg = pg.querySelector('svg.w-drose');
      if (!svg || bl) return bl;
      bl = roseBloom(gsap, svg);
      if (breathe) bl.call(() => all('.w-drose .w-big').forEach((g) => idle(gsap.to(g, { scale: 1.025, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true, svgOrigin: '0 0' }))));
      return bl;
    },
    finish() { tl?.progress(1); bl?.progress(1); },
    live(on) { isLive = on; idles.forEach((t) => t.paused(!on)); },
    still() { all('svg.w-drose').forEach((svg) => { setRose(svg, 1); svg.querySelector('.w-sheath')?.setAttribute('opacity', 0); }); },
  };
}
