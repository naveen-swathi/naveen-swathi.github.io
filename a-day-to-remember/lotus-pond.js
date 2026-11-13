// r16 date page: a painted lotus pond (three lotuses on stems, lily pads, water, ripples) and a richer gold mandala.
// Self-contained: no imports. Vector only; every surface is a gradient fill (no line art). Colours: blush/ivory petals with
// deeper tips, golden stamens, jade pads, pale water. Layers are separate SVGs/HTML so idle motion is compositor-only.
const f = (n) => Math.round(n * 100) / 100;
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

// ---------- shared gradients (inserted once per document) ----------
export const pondDefs = () => `<svg class="lp-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <linearGradient id="lp-pf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFF9F3"/><stop offset=".3" stop-color="#FCE6E4"/><stop offset=".62" stop-color="#F2C0C8"/><stop offset=".86" stop-color="#E49CAE"/><stop offset="1" stop-color="#D3829A"/></linearGradient>
  <linearGradient id="lp-pb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F9E9E5"/><stop offset=".34" stop-color="#F3CDD1"/><stop offset=".7" stop-color="#E5A4B3"/><stop offset=".9" stop-color="#D2849A"/><stop offset="1" stop-color="#BF6D88"/></linearGradient>
  <linearGradient id="lp-ps" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9C3F66" stop-opacity="0"/><stop offset=".45" stop-color="#9C3F66" stop-opacity=".05"/><stop offset="1" stop-color="#9C3F66" stop-opacity=".26"/></linearGradient>
  <linearGradient id="lp-pl" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".7" stop-color="#FFFFFF" stop-opacity=".18"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".55"/></linearGradient>
  <radialGradient id="lp-pod" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#F6E6A6"/><stop offset=".55" stop-color="#E2C46C"/><stop offset="1" stop-color="#B08A3E"/></radialGradient>
  <radialGradient id="lp-podt" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#F4EDB8"/><stop offset=".6" stop-color="#E3D58C"/><stop offset="1" stop-color="#C8B566"/></radialGradient>
  <radialGradient id="lp-glo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF3C8" stop-opacity=".9"/><stop offset=".6" stop-color="#FCE4A8" stop-opacity=".35"/><stop offset="1" stop-color="#FCE4A8" stop-opacity="0"/></radialGradient>
  <radialGradient id="lp-stm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4C8"/><stop offset=".5" stop-color="#F2D27A"/><stop offset="1" stop-color="#C99B40"/></radialGradient>
  <linearGradient id="lp-stem" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5D8A74"/><stop offset=".38" stop-color="#93C1A9"/><stop offset=".55" stop-color="#B7DAC7"/><stop offset=".8" stop-color="#7DAC94"/><stop offset="1" stop-color="#557F6B"/></linearGradient>
  <linearGradient id="lp-sep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B5D9C6"/><stop offset="1" stop-color="#6E9E87"/></linearGradient>
  <radialGradient id="lp-pad" cx=".4" cy=".34" r=".72"><stop offset="0" stop-color="#DAEEE2"/><stop offset=".45" stop-color="#B1D8C5"/><stop offset=".8" stop-color="#92C3AD"/><stop offset="1" stop-color="#76AA94"/></radialGradient>
  <radialGradient id="lp-padf" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#E2F2E8"/><stop offset=".4" stop-color="#B9DDCB"/><stop offset=".78" stop-color="#94C5AF"/><stop offset="1" stop-color="#6EA28C"/></radialGradient>
  <linearGradient id="lp-lfu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93C2AB"/><stop offset=".6" stop-color="#6F9F89"/><stop offset="1" stop-color="#5A8873"/></linearGradient>
  <radialGradient id="lp-lft" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#7FB29B"/><stop offset=".35" stop-color="#A3CFBA"/><stop offset=".8" stop-color="#C9E6D7"/><stop offset="1" stop-color="#DDF0E5"/></radialGradient>
  <radialGradient id="lp-water" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#FDFEFB"/><stop offset=".45" stop-color="#EEF6F1" stop-opacity=".97"/><stop offset=".78" stop-color="#D9EBE3" stop-opacity=".82"/><stop offset="1" stop-color="#D3E7DE" stop-opacity="0"/></radialGradient>
  <radialGradient id="lp-deep" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#B9D9CD" stop-opacity=".75"/><stop offset=".6" stop-color="#C6E0D6" stop-opacity=".35"/><stop offset="1" stop-color="#C6E0D6" stop-opacity="0"/></radialGradient>
  <radialGradient id="lp-goldr" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#F7DC94" stop-opacity=".7"/><stop offset=".5" stop-color="#F3D188" stop-opacity=".28"/><stop offset="1" stop-color="#F3D188" stop-opacity="0"/></radialGradient>
  <radialGradient id="lp-pinkr" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#EDB3BE" stop-opacity=".55"/><stop offset="1" stop-color="#EDB3BE" stop-opacity="0"/></radialGradient>
  <radialGradient id="lp-shad" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5E8E7A" stop-opacity=".32"/><stop offset="1" stop-color="#5E8E7A" stop-opacity="0"/></radialGradient>
</defs></svg>`;

// ---------- petals ----------
// a lotus petal pointing up from its base (0,0): broad belly, pointed tip. w is the half width.
const side = (h, w, m) => `C${f(m * w * .62)} ${f(-h * .06)} ${f(m * w * 1.16)} ${f(-h * .3)} ${f(m * w * .98)} ${f(-h * .56)}C${f(m * w * .84)} ${f(-h * .76)} ${f(m * w * .34)} ${f(-h * .92)} 0 ${f(-h)}`;
const sideBack = (h, w, m) => `C${f(m * w * .34)} ${f(-h * .92)} ${f(m * w * .84)} ${f(-h * .76)} ${f(m * w * .98)} ${f(-h * .56)}C${f(m * w * 1.16)} ${f(-h * .3)} ${f(m * w * .62)} ${f(-h * .06)} 0 0`;
const petalD = (h, w) => `M0 0${side(h, w, -1)}${sideBack(h, w, 1)}Z`;
const halfR = (h, w) => `M0 0${side(h, w, 1)}Q${f(w * .16)} ${f(-h * .5)} 0 0Z`;
const halfL = (h, w) => `M0 0${side(h, w, -1)}Q${f(-w * .2)} ${f(-h * .5)} 0 0Z`;
function petal(h, w, back) {
  return `<path fill="url(#${back ? 'lp-pb' : 'lp-pf'})" d="${petalD(h, w)}"/><path fill="url(#lp-ps)" d="${halfR(h, w)}"/><path fill="url(#lp-pl)" d="${halfL(h, w)}"/>`
    + `<path class="lp-vn" d="M0 ${f(-h * .06)}Q${f(w * .1)} ${f(-h * .5)} 0 ${f(-h * .92)}M${f(-w * .1)} ${f(-h * .1)}Q${f(-w * .62)} ${f(-h * .46)} ${f(-w * .5)} ${f(-h * .78)}M${f(w * .1)} ${f(-h * .1)}Q${f(w * .62)} ${f(-h * .46)} ${f(w * .5)} ${f(-h * .78)}"/>`;
}

// petal sets: a open angle, k height and wk half width (in units of the flower size h), back = behind the golden heart
const SET = [
  { a: -96, k: .6, w: .2, b: 1 }, { a: 96, k: .6, w: .2, b: 1 },
  { a: -66, k: .8, w: .24, b: 1 }, { a: 66, k: .8, w: .24, b: 1 },
  { a: -38, k: .94, w: .26, b: 1 }, { a: 38, k: .94, w: .26, b: 1 },
  { a: -13, k: 1, w: .26, b: 1 }, { a: 13, k: 1, w: .26, b: 1 },
  { a: 0, k: 0, w: 0, heart: 1 },
  { a: -88, k: .6, w: .23 }, { a: 88, k: .6, w: .23 },
  { a: -63, k: .66, w: .26 }, { a: 63, k: .66, w: .26 },
  { a: -38, k: .6, w: .27 }, { a: 38, k: .6, w: .27 },
];
// open 0 = closed bud, 1 = fully open. The bud narrows each petal (sx) and nearly closes the angles.
const pose = (a, o) => `rotate(${f(a * lerp(.06, 1, o))}) scale(${f(lerp(.78, 1, o))} ${f(lerp(1.04, 1, o))})`;

function heart(h) {
  const y = -h * .47, rx = h * .17, ry = h * .06;
  const fil = (front) => {
    let o = '';
    const N = 26;
    for (let i = 0; i < N; i++) {
      const p = (i / N) * TAU + .12, c = Math.cos(p), sn = Math.sin(p);
      if ((sn > 0) !== front) continue;
      const len = 1 + ((i * 7) % 5) * .05;
      const x0 = c * rx * .8, y0 = y + sn * ry * .8, x1 = c * rx * 1.5 * len, y1 = y + sn * ry * 1.7 - h * (.075 + (1 - Math.abs(c)) * .05) * len;
      o += `<path class="lp-fil" d="M${f(x0)} ${f(y0)}Q${f(c * rx * 1.25)} ${f(y0 - h * .02)} ${f(x1)} ${f(y1)}"/><ellipse fill="url(#lp-stm)" cx="${f(x1)}" cy="${f(y1)}" rx="${f(h * .02)}" ry="${f(h * .026)}"/>`;
    }
    return o;
  };
  let seeds = '';
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + .3; seeds += `<circle class="lp-seed" cx="${f(Math.cos(a) * rx * .55)}" cy="${f(y - h * .012 + Math.sin(a) * ry * .5)}" r="${f(h * .012)}"/>`; }
  return `<g class="lp-heart"><ellipse fill="url(#lp-glo)" cx="0" cy="${f(y - h * .04)}" rx="${f(rx * 2.2)}" ry="${f(h * .15)}"/>${fil(false)}`
    + `<path fill="url(#lp-pod)" d="M${f(-rx)} ${f(y)}C${f(-rx * .85)} ${f(y + h * .14)} ${f(rx * .85)} ${f(y + h * .14)} ${f(rx)} ${f(y)}Z"/>`
    + `<ellipse fill="url(#lp-podt)" cx="0" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}"/><circle class="lp-seed" cy="${f(y - h * .012)}" r="${f(h * .013)}"/>${seeds}${fil(true)}</g>`;
}

// the golden heart grows out of the bud as it opens (hidden inside a closed bud)
const heartPose = (h, o) => { const k = Math.min(1, Math.max(0, (o - .2) / .55)); return `transform="translate(0 ${f(-h * .3)}) scale(${f(lerp(.35, 1, k))}) translate(0 ${f(h * .3)})" opacity="${f(k)}"`; };
const setHeart = (g, o) => { const h = +g.dataset.h, m = heartPose(h, o).match(/transform="([^"]*)" opacity="([^"]*)"/); g.setAttribute('transform', m[1]); g.setAttribute('opacity', m[2]); };

// one lotus head at (x,y) with size h; open 0..1. Petals carry data-a for the bloom.
function flower(x, y, h, open, id) {
  const ps = SET.map((p) => p.heart ? `<g class="lp-hz" data-h="${h}" ${heartPose(h, open)}>${heart(h)}</g>`
    : `<g class="lp-pt" data-a="${p.a}" transform="${pose(p.a, open)}">${petal(h * p.k, h * p.w, p.b)}</g>`).join('');
  const sep = `<path fill="url(#lp-stem)" d="M${f(-h * .03)} ${f(h * .1)}C${f(-h * .05)} ${f(h * .02)} ${f(-h * .1)} ${f(-h * .02)} ${f(-h * .085)} ${f(-h * .05)}L${f(h * .085)} ${f(-h * .05)}C${f(h * .1)} ${f(-h * .02)} ${f(h * .05)} ${f(h * .02)} ${f(h * .03)} ${f(h * .1)}Z"/>`;
  return `<g class="lp-head" data-id="${id}" data-open="${open}" transform="translate(${x} ${y})">${sep}${ps}</g>`;
}

// tapered stem from the water (bx,by) to the head (tx,ty), bowing by c
function stem(bx, by, tx, ty, c, w0 = 3, w1 = 1.9) {
  const mx = (bx + tx) / 2 + c, my = (by + ty) / 2;
  return `<path fill="url(#lp-stem)" d="M${f(bx - w0)} ${by}Q${f(mx - (w0 + w1) / 2)} ${f(my)} ${f(tx - w1)} ${ty}L${f(tx + w1)} ${ty}Q${f(mx + (w0 + w1) / 2)} ${f(my)} ${f(bx + w0)} ${by}Z"/>`;
}

// ---------- pads, leaves, water ----------
// a floating pad in perspective: an ellipse with a wedge notch, a shadow sliver under it and fine veins
function pad(cx, cy, rx, ry, notch = -60, front = false) {
  const n = (notch * Math.PI) / 180, d = .16;
  const p = (a, k = 1) => `${f(cx + Math.cos(a) * rx * k)} ${f(cy + Math.sin(a) * ry * k)}`;
  const body = `M${f(cx + Math.cos(n) * rx * .08)} ${f(cy + Math.sin(n) * ry * .08)}L${p(n + d)}A${rx} ${ry} 0 1 1 ${p(n - d)}Z`;
  let veins = '';
  for (let i = 1; i < 9; i++) { const a = n + d + (i / 9) * (TAU - 2 * d); veins += `M${f(cx)} ${f(cy)}L${p(a, .9)}`; }
  return `<g class="lp-pad"><ellipse fill="url(#lp-shad)" cx="${f(cx + rx * .04)}" cy="${f(cy + ry * .5)}" rx="${f(rx * 1.08)}" ry="${f(ry * 1.05)}"/>`
    + `<path fill="#6E9F8A" opacity=".55" transform="translate(0 ${f(ry * .16)})" d="${body}"/>`
    + `<path fill="url(#${front ? 'lp-padf' : 'lp-pad'})" d="${body}"/><path class="lp-pv" d="${veins}"/>`
    + `<path class="lp-rim" d="M${p(Math.PI * 1.08)}A${rx} ${ry} 0 0 1 ${p(Math.PI * 1.75)}"/></g>`;
}

// a lotus leaf held above the water on its stalk: a shallow cup, inside lit, outside in shade, with a wavy rim
function leaf(cx, cy, r, tilt = 0, by = 200) {
  const ry = r * .28, depth = r * .5;
  const rim = (k0, k1, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const a = k0 + (i / n) * (k1 - k0); const k = 1 + Math.sin(i * 2.1 + r) * .03; return `${f(cx + Math.cos(a) * r * k)} ${f(cy + Math.sin(a) * ry * k)}`; });
  const top = rim(0, TAU, 36);
  let veins = '';
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + .2; veins += `M${f(cx)} ${f(cy + ry * .12)}L${f(cx + Math.cos(a) * r * .9)} ${f(cy + Math.sin(a) * ry * .9)}`; }
  return `<g class="lp-leaf" transform="rotate(${tilt} ${cx} ${cy})">${stem(cx + 2, by, cx, cy + depth - 1, -3, 2, 1.5)}`
    + `<path fill="url(#lp-lfu)" d="M${f(cx - r)} ${f(cy)}C${f(cx - r * .7)} ${f(cy + depth * .55)} ${f(cx - r * .2)} ${f(cy + depth)} ${f(cx)} ${f(cy + depth)}C${f(cx + r * .2)} ${f(cy + depth)} ${f(cx + r * .7)} ${f(cy + depth * .55)} ${f(cx + r)} ${f(cy)}Z"/>`
    + `<path fill="url(#lp-lft)" d="M${top.join('L')}Z"/><path class="lp-pv" d="${veins}"/>`
    + `<path class="lp-rim" d="M${rim(Math.PI * .1, Math.PI * .9, 10).join('L')}"/></g>`;
}

// ---------- the scene ----------
// viewBox 0 0 360 240; water line about y 166. Three flowers: A the tall one in front, B half-open behind left, C a bud behind right.
export const FLOWERS = {
  A: { base: [180, 207], head: [180, 104], h: 74, bow: -5, closed: .1, open: 1 },
  B: { base: [112, 186], head: [116, 128], h: 52, bow: 6, closed: .42, open: .9 },
  C: { base: [256, 183], head: [252, 112], h: 42, bow: -5, closed: 0, open: .5 },
};
export const VB = { w: 360, h: 240 };
const pct = ([x, y]) => `${f((x / VB.w) * 100)}% ${f((y / VB.h) * 100)}%`;

function back() {
  return `<svg class="lp-l lp-back" viewBox="0 0 360 240" aria-hidden="true" focusable="false">
    <ellipse fill="url(#lp-water)" cx="180" cy="198" rx="178" ry="40"/>
    <ellipse fill="url(#lp-deep)" cx="186" cy="214" rx="150" ry="20"/>
    <ellipse fill="url(#lp-goldr)" cx="180" cy="190" rx="92" ry="12"/>
    <ellipse fill="url(#lp-pinkr)" cx="180" cy="216" rx="12" ry="15"/><ellipse fill="url(#lp-pinkr)" cx="117" cy="194" rx="8" ry="10" opacity=".7"/><ellipse fill="url(#lp-pinkr)" cx="251" cy="190" rx="6" ry="9" opacity=".6"/>
    <path class="lp-sky" d="M48 176H118M210 172H300M78 228H138M236 224H312M150 182H196"/>
    ${leaf(56, 150, 30, -6, 186)}${leaf(312, 158, 23, 6, 186)}
    ${pad(84, 182, 30, 7.5, -50)}${pad(292, 186, 34, 8, -130)}${pad(206, 176, 20, 5, -100)}${pad(150, 178, 16, 4.2, -40)}
  </svg>`;
}
function front() {
  return `<svg class="lp-l lp-front" viewBox="0 0 360 240" aria-hidden="true" focusable="false">
    ${pad(122, 214, 40, 10.5, -30, true)}${pad(250, 217, 44, 11.5, -150, true)}${pad(330, 205, 22, 6, -70, true)}${pad(36, 206, 24, 6.2, -110, true)}
    <path class="lp-sky" d="M170 230H196"/>
  </svg>`;
}
function plant(k, open) {
  const F = FLOWERS[k], o = open ? F.open : F.closed;
  return `<svg class="lp-l lp-f lp-f${k}" viewBox="0 0 360 240" style="transform-origin:${pct(F.base)}" aria-hidden="true" focusable="false">
    ${stem(F.base[0], F.base[1], F.head[0], F.head[1] + 2, F.bow, k === 'A' ? 3.2 : 2.5, k === 'A' ? 2.2 : 1.7)}${flower(F.head[0], F.head[1], F.h, o, k)}</svg>`;
}

// ripple rings (HTML, compositor-only): at each stem base and two loose ones
const RIPS = [['A', 0], ['A', 2.6], ['B', 1.1], ['C', 3.4], [[60, 196], 1.8], [[300, 200], 4.2]];

// The scene markup. state: 'closed' (before the reveal) or 'open' (after it, and the reduced-motion still).
export function lotusPond(state = 'closed') {
  const open = state === 'open';
  const ripples = RIPS.map(([k, d]) => {
    const p = typeof k === 'string' ? FLOWERS[k].base : k;
    return `<i class="lp-rip" style="left:${f((p[0] / VB.w) * 100)}%;top:${f((p[1] / VB.h) * 100)}%;--d:${-d}s"></i>`;
  }).join('');
  const [gx, gy] = FLOWERS.A.head;
  const html = `<div class="lp" data-state="${state}" aria-hidden="true">${back()}${ripples}
    <i class="lp-glow" style="left:${f((gx / VB.w) * 100)}%;top:${f(((gy - FLOWERS.A.h * .35) / VB.h) * 100)}%"><i></i></i>
    ${plant('C', open)}${plant('B', open)}${plant('A', open)}${front()}
    <i class="lp-drift"><svg viewBox="-8 -4 16 8"><path fill="url(#lp-pf)" d="M-7 0C-4 -3.6 4 -3.6 7 0C4 2.8 -4 2.8 -7 0Z"/><path fill="#FFFFFF" opacity=".5" d="M-5 -.6C-2 -2.4 2 -2.4 5 -.6C2 -1.4 -2 -1.4 -5 -.6Z"/></svg></i>
    <i class="lp-burst"></i><i class="lp-burst"></i><i class="lp-burst"></i></div>`;
  return html;
}

// ---------- the art mandala behind the pond (viewBox -200..200) ----------
// Same family as fills.js mandala(): .wm gold-leaf lines and .wm-dot pulli, so the site's goldDefs()/glow()/glints() apply.
// The first five unstroked children of g.wm are the rings glow() lights; the rest is the richer ornament.
const ring = (r1, r2, k, rot = 0) => Array.from({ length: k }, (_, i) => {
  const a = ((i * 360) / k + rot) * Math.PI / 180, b = (180 / k) * Math.PI / 180;
  const p = (rr, aa) => `${f(Math.cos(aa) * rr)} ${f(Math.sin(aa) * rr)}`;
  return `M${p(r1, a - b)}C${p(r1 + (r2 - r1) * .7, a - b * 1.05)} ${p(r2, a - b * .55)} ${p(r2, a)}C${p(r2, a + b * .55)} ${p(r1 + (r2 - r1) * .7, a + b * 1.05)} ${p(r1, a + b)}`;
}).join('');
const dots = (r, k, rr = 1.3, rot = 0) => Array.from({ length: k }, (_, i) => { const a = (i * TAU) / k + rot * Math.PI / 180; return `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" r="${rr}"/>`; }).join('');
const petals = (r1, r2, k, rot = 0) => Array.from({ length: k }, (_, i) => `<path transform="rotate(${f((i * 360) / k + rot)})" d="M0 ${-r1}C${f(-(r2 - r1) * .42)} ${f(-r1 - (r2 - r1) * .3)} ${f(-(r2 - r1) * .26)} ${f(-r1 - (r2 - r1) * .86)} 0 ${-r2}C${f((r2 - r1) * .26)} ${f(-r1 - (r2 - r1) * .86)} ${f((r2 - r1) * .42)} ${f(-r1 - (r2 - r1) * .3)} 0 ${-r1}Z"/>`).join('');
const scallop = (r, k, d) => Array.from({ length: k }, (_, i) => {
  const a0 = (i / k) * TAU, a1 = ((i + 1) / k) * TAU, am = (a0 + a1) / 2;
  return `M${f(Math.cos(a0) * r)} ${f(Math.sin(a0) * r)}Q${f(Math.cos(am) * (r + d))} ${f(Math.sin(am) * (r + d))} ${f(Math.cos(a1) * r)} ${f(Math.sin(a1) * r)}`;
}).join('');
const chain = (r, k, rr) => Array.from({ length: k }, (_, i) => { const a = (i / k) * TAU; return `<circle class="wm fine" cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" r="${rr}"/>`; }).join('');
const rosettes = (r, k, s, rot = 0) => Array.from({ length: k }, (_, i) => {
  const a = (i / k) * TAU + rot * Math.PI / 180, x = Math.cos(a) * r, y = Math.sin(a) * r;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f((a * 180) / Math.PI + 90)})"><path class="lp-en1" d="${petalPath(s)}"/><path class="lp-en3" transform="rotate(180)" d="${petalPath(s * .7)}"/></g>`;
}).join('');
const petalPath = (s) => `M0 0C${f(-s * .5)} ${f(-s * .3)} ${f(-s * .4)} ${f(-s * .9)} 0 ${f(-s)}C${f(s * .4)} ${f(-s * .9)} ${f(s * .5)} ${f(-s * .3)} 0 0Z`;

export function artMandala() {
  return `<svg class="orn wmk lp-mand" viewBox="-200 -200 400 400" aria-hidden="true" focusable="false">
    <g class="lp-en"><g class="lp-en3">${petals(84, 128, 16)}</g><g class="lp-en1">${petals(88, 122, 16)}</g><g class="lp-en2">${petals(122, 160, 16, 11.25)}</g>
      <g class="lp-en1">${petals(52, 92, 8, 22.5)}</g><circle class="lp-en3" r="46"/>${rosettes(176, 16, 9, 11.25)}</g>
    <g class="wm">
      <circle r="197"/><path d="${ring(150, 186, 32)}"/><path d="${ring(120, 162, 16, 11.25)}"/><path d="${ring(84, 130, 16)}"/><circle r="48"/>
      <circle r="191" stroke-width=".5"/><path class="fine" d="${scallop(191, 64, 4)}"/><circle r="146" stroke-width=".45"/><circle r="140" stroke-width=".45"/>
      <path class="fine" d="${ring(88, 122, 16)}"/><path d="${ring(50, 94, 8, 22.5)}"/><path class="fine" d="${ring(56, 86, 8)}"/>
      ${chain(70, 24, 5.2)}<circle r="34" stroke-width=".6"/><path d="${ring(12, 34, 8)}"/><path class="fine" d="${ring(14, 28, 8, 22.5)}"/>
    </g>
    <g class="wm-dot">${dots(172, 32, 1.5)}${dots(143, 48, .8)}${dots(108, 16, 1.6, 11.25)}${dots(41, 8, 1.4)}${dots(194, 64, .7, 2.8)}</g></svg>`;
}

// ---------- motion ----------
// Idle (sway, ripples, drifting petal, glow breath) is CSS on the layers; this adds the reveal bloom and the still.
// pondMotion(gsap, el) with el the .lp element. bloom() is called on the date reveal; still() gives the open still.
const BLOOM = { A: { dur: 2.3, at: 0 }, B: { dur: 1.9, at: .35 }, C: { dur: 1.7, at: .75 } };
export function pondMotion(gsap, el) {
  const heads = [...el.querySelectorAll('.lp-head')];
  const setHead = (h, o) => h.querySelectorAll('.lp-pt').forEach((g) => g.setAttribute('transform', pose(+g.dataset.a, o)));
  let done = false;
  return {
    bloom() {
      if (done) return null;
      done = true;
      const tl = gsap.timeline({ onComplete: () => { el.dataset.state = 'open'; } });
      heads.forEach((h) => {
        const F = FLOWERS[h.dataset.id], B = BLOOM[h.dataset.id], o0 = +h.dataset.open;
        const ps = [...h.querySelectorAll('.lp-pt')].sort((a, b) => Math.abs(b.dataset.a) - Math.abs(a.dataset.a));
        ps.forEach((g, i) => {
          const o = { v: o0 }, a = +g.dataset.a;
          tl.to(o, { v: F.open, duration: B.dur, ease: 'power2.out', onUpdate: () => g.setAttribute('transform', pose(a, o.v)) }, B.at + i * .045);
        });
        const hz = h.querySelector('.lp-hz'), oh = { v: o0 };
        if (hz) tl.to(oh, { v: F.open, duration: B.dur, ease: 'power2.out', onUpdate: () => setHeart(hz, oh.v) }, B.at + .25);
        h.dataset.open = F.open;
      });
      tl.fromTo(el.querySelector('.lp-glow'), { opacity: .3, scale: .7 }, { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out' }, .2);
      tl.fromTo(el.querySelectorAll('.lp-burst'), { scale: .2, opacity: .95 }, { scale: 1.7, opacity: 0, duration: 2.6, ease: 'power2.out', stagger: .5 }, .1);
      return tl;
    },
    still() {
      done = true;
      heads.forEach((h) => { h.dataset.open = FLOWERS[h.dataset.id].open; setHead(h, +h.dataset.open); const hz = h.querySelector('.lp-hz'); if (hz) setHeart(hz, +h.dataset.open); });
      el.dataset.state = 'open';
      el.classList.add('lp-still');
    },
    live(on) { el.classList.toggle('lp-paused', !on); },
  };
}

// Builds the stage into a host (the date page's .grow): mandala clip, mandala, pond. Returns the motion controller.
// F (optional) is the site's fills.js module: its glow() and glints() light the mandala like the wing mandalas.
export function mountPond(host, { gsap, F, rm = false, state, phone = false } = {}) {
  host.innerHTML = `<div class="lp-stage"><div class="lp-wmc"><i class="lp-wm">${artMandala()}</i></div>${lotusPond(state || (rm ? 'open' : 'closed'))}</div>`;
  if (!document.querySelector('.lp-defs')) document.body.insertAdjacentHTML('afterbegin', pondDefs());
  const wm = host.querySelector('.lp-wm');
  wm.querySelector('svg').classList.add('wm-gilt');
  if (F) { F.glow(wm, { rings: phone ? 2 : 5 }); wm.insertAdjacentHTML('beforeend', F.glints(.8, phone ? MAND_SPOTS_PHONE : MAND_SPOTS)); }
  const ctl = pondMotion(gsap, host.querySelector('.lp'));
  if (rm) ctl.still();
  return ctl;
}
// glints on the upper part of the mandala only (the lower half fades into the water): [radius, angle, size, delay]
export const MAND_SPOTS = [
  [172, 196, 16, 0], [172, 228, 13, 2.1], [172, 262, 17, 1.2], [172, 296, 13, 0.5], [172, 330, 15, 2.7], [172, 352, 12, 1.6],
  [143, 214, 11, 3.0], [143, 316, 11, 0.9], [108, 202, 13, 1.9], [108, 248, 15, 0.3], [108, 292, 13, 2.4], [108, 338, 12, 1.0],
  [41, 250, 11, 2.2], [41, 300, 10, 0.7],
];
export const MAND_SPOTS_PHONE = MAND_SPOTS.filter((_, k) => k % 2 === 0).slice(0, 6);
