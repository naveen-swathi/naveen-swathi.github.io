// r13 shared ornament kit and the "Mullai kodi" frame (from the frame designer's Border A, with the bird-variant details).
// Everything returns SVG markup strings. Geometry is in design units (du): 1 du = 1 CSS px at 390 x 844 and scales with --u.
// Colours are CSS classes (proto.css), so one markup serves all three palettes. No images, no filters, no randomness.

export const f = (n) => +(+n).toFixed(2);
const TAU = Math.PI * 2;

// ---------- primitives ----------
// teardrop centred on (cx, cy), round end at +x, point toward -x
export function drop(cx, cy, rx, ry, tip) {
  const L = cx - rx - tip;
  return `M${f(L)} ${f(cy)}C${f(cx - rx * 0.92)} ${f(cy - ry * 0.5)} ${f(cx - rx * 0.6)} ${f(cy - ry)} ${f(cx)} ${f(cy - ry)}`
    + `C${f(cx + rx * 0.56)} ${f(cy - ry)} ${f(cx + rx)} ${f(cy - ry * 0.56)} ${f(cx + rx)} ${f(cy)}`
    + `C${f(cx + rx)} ${f(cy + ry * 0.56)} ${f(cx + rx * 0.56)} ${f(cy + ry)} ${f(cx)} ${f(cy + ry)}`
    + `C${f(cx - rx * 0.6)} ${f(cy + ry)} ${f(cx - rx * 0.92)} ${f(cy + ry * 0.5)} ${f(L)} ${f(cy)}Z`;
}
// teardrop with its point toward -x and round end at +x (peacock eye shape)
export function tear(rx, ry, cx = 0) {
  return `M${f(cx - rx * 1.45)} 0C${f(cx - rx * .8)} ${f(-ry * .5)} ${f(cx - rx * .6)} ${f(-ry)} ${f(cx + rx * .08)} ${f(-ry)}`
    + `C${f(cx + rx * .72)} ${f(-ry)} ${f(cx + rx)} ${f(-ry * .52)} ${f(cx + rx)} 0`
    + `C${f(cx + rx)} ${f(ry * .52)} ${f(cx + rx * .72)} ${f(ry)} ${f(cx + rx * .08)} ${f(ry)}`
    + `C${f(cx - rx * .6)} ${f(ry)} ${f(cx - rx * .8)} ${f(ry * .5)} ${f(cx - rx * 1.45)} 0Z`;
}
export const leafD = (L, w) => `M0 0C${f(L * 0.28)} ${f(-w)} ${f(L * 0.72)} ${f(-w * 0.95)} ${f(L)} 0C${f(L * 0.7)} ${f(w * 0.72)} ${f(L * 0.3)} ${f(w * 0.8)} 0 0Z`;
// mango leaf from (x, y) toward angle ang
export const leaf = (x, y, ang, L = 12, w = 3.6, cls = 'en-jade') => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path class="${cls} ln-g" d="${leafD(L, w)}"/><path class="rib" d="M${f(L * 0.08)} 0L${f(L * 0.86)} ${f(-w * 0.12)}"/></g>`;
// petal pointing up from (0,0)
export const petalD = (h, w) => `M0 0C${f(-w)} ${f(-h * 0.28)} ${f(-w * 0.62)} ${f(-h * 0.86)} 0 ${f(-h)}C${f(w * 0.62)} ${f(-h * 0.86)} ${f(w)} ${f(-h * 0.28)} 0 0Z`;
export const pearl = (x, y, r = 1.7) => `<circle class="pearl" cx="${f(x)}" cy="${f(y)}" r="${r}"/>`;
export const dot = (x, y, r = 0.8, cls = 'gdot') => `<circle class="${cls}" cx="${f(x)}" cy="${f(y)}" r="${r}"/>`;
export const floret = (x, y, r = 3.2, cls = 'en-peach') => `<g transform="translate(${f(x)} ${f(y)})">${Array.from({ length: 6 }, (_, k) => `<ellipse class="${cls} ln-g" rx="${f(r * 0.42)}" ry="${f(r * 0.7)}" cy="${f(-r * 0.62)}" transform="rotate(${k * 60})"/>`).join('')}<circle class="gfill" r="${f(r * 0.32)}"/></g>`;
export const pad = (x, y, rx = 11, ry = 3.6) => `<g transform="translate(${f(x)} ${f(y)})"><path class="en-jade ln-g" d="M${-rx} 0A${rx} ${ry} 0 1 0 ${rx} 0A${rx} ${ry} 0 0 0 ${f(rx * 0.12)} ${f(-ry)}L0 0L${f(-rx * 0.12)} ${f(-ry)}A${rx} ${ry} 0 0 0 ${-rx} 0Z"/><path class="vein" d="M0 0L${f(-rx * 0.6)} ${f(ry * 0.4)}M0 0L${f(rx * 0.6)} ${f(ry * 0.4)}M0 0V${f(ry * 0.8)}"/></g>`;
export const stem = (x, y, h, lean = 0) => `<path class="vine-s thin" d="M${f(x)} ${f(y)}C${f(x + lean * 0.3)} ${f(y - h * 0.4)} ${f(x + lean)} ${f(y - h * 0.7)} ${f(x + lean)} ${f(y - h)}"/>`;

// front-view lotus on (x, y) opening upward; open 0..1 folds the petals together
export function lotus(x, y, s = 1, ang = 0, open = 1) {
  const P = [
    { a: -62, h: 12, w: 5.2, c: 'en-pink-l' }, { a: 62, h: 12, w: 5.2, c: 'en-pink-l' },
    { a: -38, h: 15, w: 5.8, c: 'en-pink' }, { a: 38, h: 15, w: 5.8, c: 'en-pink' },
    { a: -17, h: 17, w: 6, c: 'en-pink' }, { a: 17, h: 17, w: 6, c: 'en-pink' },
    { a: 0, h: 18.5, w: 6.4, c: 'en-pink-d' },
  ];
  const pet = P.map((p) => `<path class="${p.c} ln-g" transform="rotate(${f(p.a * open)})" d="${petalD(p.h, p.w)}"/>`).join('');
  const veins = P.filter((p) => Math.abs(p.a) < 30).map((p) => `<path class="vein" transform="rotate(${f(p.a * open)})" d="M0 -2.5L0 ${f(-p.h * 0.72)}"/>`).join('');
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${ang}) scale(${s})">${pet}${veins}<path class="en-jade ln-g" d="M-8 1.2C-5 5.5 5 5.5 8 1.2C4.5 2.8 -4.5 2.8 -8 1.2Z"/>${dot(0, -1, 1.1)}</g>`;
}
export const bud = (x, y, s = 1, ang = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${ang}) scale(${s})"><path class="en-pink ln-g" d="${petalD(13, 5)}"/><path class="en-pink-d ln-g" d="M0 0C-2.4 -3 -2.6 -8 0 -12.4C2.6 -8 2.4 -3 0 0Z"/><path class="en-jade ln-g" d="M-4.6 -1.2C-3 2.4 3 2.4 4.6 -1.2C2 0 -2 0 -4.6 -1.2Z"/></g>`;

// meenakari rosette: gold rim, alternating enamel petals, jewel centre
export function rosette(x, y, r = 13, n = 8, rot = 0, cls = '') {
  const pr = r * 0.48;
  const petals = Array.from({ length: n }, (_, k) => `<path class="${k % 2 ? 'en-jade' : 'en-pink'} ln-gh" transform="rotate(${f(rot + (k * 360) / n)})" d="${drop(pr, 0, r * 0.3, r * 0.2, r * 0.18)}"/>`).join('');
  return `<g class="${cls}" transform="translate(${f(x)} ${f(y)})"><circle class="disc" r="${r}"/><circle class="rim" r="${f(r - 0.9)}"/>${petals}<circle class="jewel" r="${f(r * 0.2)}"/><circle class="shine" r="${f(r * 0.07)}" cx="${f(r * 0.05)}" cy="${f(-r * 0.06)}"/></g>`;
}

// a flat peacock feather eye (no gradients) pointing toward rot; used in the peacock variant's border and dividers
export function eyeDrop(x, y, rx, rot = -90) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})"><path class="en-jade ln-g" d="${tear(rx * 1.2, rx * 1.02, -rx * .06)}"/>`
    + `<path class="eye-g" d="${tear(rx, rx * .8)}"/><path class="en-peach" d="${tear(rx * .76, rx * .6, rx * .12)}"/>`
    + `<path class="en-teal-l" d="${tear(rx * .58, rx * .47, rx * .22)}"/><ellipse class="sapph" cx="${f(rx * .38)}" cy="0" rx="${f(rx * .24)}" ry="${f(rx * .26)}"/></g>`;
}

// the sikku kolam line through an m x n grid of pulli (P apart), closed and smoothed
export function kolamPath(m, n, P) {
  const pts = [];
  let x = 1, y = 0, dx = 1, dy = 1;
  do {
    pts.push([x, y]); x += dx; y += dy;
    if (x === -1 || x === 2 * m - 1) dx = -dx;
    if (y === -1 || y === 2 * n - 1) dy = -dy;
  } while (x !== 1 || y !== 0 || dx !== 1 || dy !== 1);
  const o = 0.14;
  const q = pts.map(([a, b]) => [(a === -1 ? -0.5 - o : a === 2 * m - 1 ? m - 0.5 + o : a / 2) * P, (b === -1 ? -0.5 - o : b === 2 * n - 1 ? n - 0.5 + o : b / 2) * P]);
  const L = q.length;
  let d = `M${f(q[0][0])} ${f(q[0][1])}`;
  for (let i = 0; i < L; i++) {
    const p0 = q[(i + L - 1) % L], p1 = q[i], p2 = q[(i + 1) % L], p3 = q[(i + 2) % L];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}

// ---------- the frame ----------
// Side band x 8..32 (vine centre 20), period 48: two interlaced gold strands with an over/under cut at each crossing,
// a mango leaf at each crossing, a pearl at each lens end and, in each lens, a jasmine bud (dove) or a feather eye (peacock).
function vinePattern(id, bird) {
  const c = 12, a = 6.2, P = 48;
  const strand = (sgn, y0, y1) => { let d = ''; for (let y = y0; y <= y1 + 0.01; y += 1) d += `${d ? 'L' : 'M'}${f(c + sgn * a * Math.cos((TAU * y) / P))} ${f(y)}`; return d; };
  const gap = (sgn, y) => `<path class="band-cut" d="${strand(sgn, y - 4, y + 4)}"/><path class="vine-s" d="${strand(sgn, y - 4.6, y + 4.6)}"/>`;
  const sprig = (y, side) => leaf(c + side * 1.2, y, side > 0 ? -32 : 212, 8.6, 2.7);
  const lens = bird === 'peacock' ? eyeDrop(c, 25.2, 2.6, -90) : `<g transform="translate(${c} 27.6)"><path class="en-pink ln-g" d="${petalD(7.4, 2.7)}"/></g>`;
  return `<pattern id="${id}" width="24" height="${P}" patternUnits="userSpaceOnUse" x="8" y="0">
    <path class="vine-s" d="${strand(1, -1, P + 1)}"/><path class="vine-s" d="${strand(-1, -1, P + 1)}"/>
    ${gap(1, 12)}${gap(-1, 36)}${sprig(12, -1)}${sprig(36, 1)}
    ${pearl(c, 0, 1.9)}${pearl(c, P, 1.9)}${lens}
    ${dot(c, 5.4)}${dot(c, 42.6)}${dot(c, 18.4, 0.6)}${dot(c, 30.8, 0.6)}
  </pattern>`;
}
// top and bottom bands: a bead chain of pearl, gold diamond and pulli, period 16
function beadPattern(id) {
  return `<pattern id="${id}" width="16" height="24" patternUnits="userSpaceOnUse" x="0" y="8">
    <path class="vine-s thin" d="M0 12H16"/>${pearl(4, 12, 2)}
    <path class="gfill" d="M12 8.8L14.6 12L12 15.2L9.4 12Z"/>${dot(8, 7.2, 0.6)}${dot(8, 16.8, 0.6)}
  </pattern>`;
}
// quarter lotus fan nested in the inner corner
export function lotusFan(x, y, s = 1) {
  const back = [18, 36, 54, 72].map((a) => `<path class="en-pink-l ln-g" transform="rotate(${a + 90})" d="${petalD(29, 6.4)}"/>`).join('');
  const front = [6, 26, 45, 64, 84].map((a) => `<path class="en-pink ln-g" transform="rotate(${a + 90})" d="${petalD(21, 6)}"/>`).join('');
  const veins = [26, 45, 64].map((a) => `<path class="vein" transform="rotate(${a + 90})" d="M0 -4L0 -16"/>`).join('');
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${back}${front}${veins}<path class="gfill" d="M0 0H7.4A7.4 7.4 0 0 1 0 7.4Z"/><path class="scroll thin" d="M9.6 0A9.6 9.6 0 0 1 0 9.6"/>${pearl(3, 3, 1.2)}</g>`;
}
// inside each corner: the lotus fan and two gold scrolls about 85 du along the rules, ending in curls with leaves and pearls
function cornerFlourish() {
  const r = 45, end = 124;
  return `<g class="cflo">
    <path class="scroll" d="M66 ${r}C84 ${r - 2} ${end - 26} ${r - 2} ${end} ${r}"/><path class="scroll" d="M${end} ${r}c5 0 7.4 -2.6 6 -5.4c-1.4 -2.6 -5.4 -2 -5.6 .6"/>
    <path class="scroll" d="M${r} 66C${r - 2} 84 ${r - 2} ${end - 26} ${r} ${end}"/><path class="scroll" d="M${r} ${end}c0 5 -2.6 7.4 -5.4 6c-2.6 -1.4 -2 -5.4 .6 -5.6"/>
    <path class="scroll thin" d="M86 ${r - 1}c1 -4.6 6 -7 10 -5.2"/><path class="scroll thin" d="M${r - 1} 86c-4.6 1 -7 6 -5.2 10"/>
    ${leaf(end - 18, r + 0.5, 160, 11, 3.2)}${leaf(r + 0.5, end - 18, 110, 11, 3.2)}
    ${leaf(76, r + 1, 14, 9, 2.8)}${leaf(r + 1, 76, 76, 9, 2.8)}
    ${pearl(end - 7, r, 1.3)}${pearl(r, end - 7, 1.3)}${dot(100, r + 4, 0.7)}${dot(r + 4, 100, 0.7)}
    ${lotusFan(39, 39, 1)}
  </g>`;
}

// rule as two halves drawn from the top centre outward (pathLength 1, so the intro can draw them)
function ruleHalves(cls, inset, W, H) {
  const cx = W / 2, x0 = inset, x1 = W - inset, y0 = inset, y1 = H - inset;
  return `<path class="${cls} fr-rule" pathLength="1" d="M${f(cx)} ${f(y0)}H${f(x0)}V${f(y1)}H${f(cx)}"/>`
    + `<path class="${cls} fr-rule" pathLength="1" d="M${f(cx)} ${f(y0)}H${f(x1)}V${f(y1)}H${f(cx)}"/>`;
}

// The main frame: a W x H du SVG (viewBox = the column in du, so it is pixel-true at every size). Rebuild on resize only.
// The top centre piece is a separate small SVG (crestTop) so the invite can fade it while the gable or the dove crown is up.
export function frameSVG(W, H, { bird = 'peacock' } = {}) {
  const id = `fr${Math.round(W)}x${Math.round(H)}${bird[0]}`;
  const cx = W / 2;
  const corners = [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]];
  const flo = cornerFlourish();
  return `<svg class="frame-svg" viewBox="0 0 ${f(W)} ${f(H)}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>${vinePattern(`${id}v`, bird)}${beadPattern(`${id}b`)}</defs>
    <g class="fr-band">
      <path class="band" d="M8 8H${f(W - 8)}V${f(H - 8)}H8Z M32 32V${f(H - 32)}H${f(W - 32)}V32Z" fill-rule="evenodd"/>
      <rect x="8" y="20" width="24" height="${f(H - 40)}" fill="url(#${id}v)"/>
      <g transform="translate(${f(W)} 0) scale(-1 1)"><rect x="8" y="20" width="24" height="${f(H - 40)}" fill="url(#${id}v)"/></g>
      <rect x="20" y="8" width="${f(W - 40)}" height="24" fill="url(#${id}b)"/>
      <g transform="translate(0 ${f(H - 40)})"><rect x="20" y="8" width="${f(W - 40)}" height="24" fill="url(#${id}b)"/></g>
      <rect class="edge" x="8" y="8" width="${f(W - 16)}" height="${f(H - 16)}"/>
      <rect class="edge" x="32" y="32" width="${f(W - 64)}" height="${f(H - 64)}"/>
    </g>
    ${ruleHalves('rule-o', 4.5, W, H)}${ruleHalves('rule-i', 36, W, H)}
    <rect class="rule-f" x="39" y="39" width="${f(W - 78)}" height="${f(H - 78)}"/>
    ${corners.map(([x, y, sx, sy], k) => `<g class="cf c${k + 1}" transform="translate(${f(x)} ${f(y)}) scale(${sx} ${sy})">${flo}</g>`).join('')}
    ${rosette(cx, 20, 10.5, 8, 22.5, 'rz rz-m')}${rosette(cx, H - 20, 10.5, 8, 22.5, 'rz rz-m')}
    ${corners.map(([x, y, sx, sy], k) => rosette(x + sx * 20, y + sy * 20, 14, 8, 22.5, `rz c${k + 1}`)).join('')}
  </svg>`;
}

// Top centre, hung under the inner rule (place its 0,0 at x = W/2, y = 36 du; viewBox is 160 x 52 du).
// Both: tendrils with mango leaves, pearls and buds along the rule. Dove: a lotus opening downward, pearl and gold drop.
// Peacock: a feather eye hanging from a small lotus cap, pearl and gold drop.
export function crestTop(bird = 'peacock') {
  const side = (s) => `<path class="scroll" d="M${s * 8} 3C${s * 22} 14 ${s * 40} 13 ${s * 54} 6C${s * 62} 2 ${s * 72} 3 ${s * 74} 8c${s * 1} 4 ${s * -3} 6 ${s * -5} 4"/>`
    + `<path class="scroll thin" d="M${s * 36} 12.5c${s * 4} 5 ${s * 10} 6.4 ${s * 15} 3.4"/>`
    + leaf(s * 14, 8, s > 0 ? 26 : 154, 16, 4.6) + leaf(s * 46, 10.5, s > 0 ? -18 : 198, 11, 3.3)
    + pearl(s * 60, 3.4, 1.4) + dot(s * 28, 15.5, 0.8) + bud(s * 66, 14, 0.55, s * 160);
  const pend = bird === 'peacock'
    ? `${lotus(0, 5, 0.62, 180)}<path class="vine-s thin" d="M0 14V17"/>${eyeDrop(0, 25.5, 5.4, -90)}<path class="vine-s thin" d="M0 33V36"/>${pearl(0, 38, 2.1)}<path class="gfill" d="M0 41l2.1 3.3l-2.1 3.3l-2.1 -3.3Z"/>`
    : `${lotus(0, 6, 1.05, 180)}<path class="vine-s thin" d="M0 24V30"/>${pearl(0, 32, 2.3)}<path class="gfill" d="M0 35.4l2.3 3.6l-2.3 3.6l-2.3 -3.6Z"/>`;
  return `<svg class="crest-svg" viewBox="-80 -2 160 52" aria-hidden="true" focusable="false"><g class="crest">${side(-1)}${side(1)}<path class="vine-s thin" d="M0 0V6"/>${pend}</g></svg>`;
}
// One-off intro, right after the Seal lands (about 1.6 s): bands fade in, both rules draw from the top centre outward,
// the corner rosettes pop, the corner flourishes and crests fade up. Returns the timeline; progress(1) is the finished frame.
export function frameIntro(gsap, root) {
  const q = (s) => [...root.querySelectorAll(s)];
  const tl = gsap.timeline();
  gsap.set(q('.fr-rule'), { strokeDasharray: '1 2', strokeDashoffset: 1.02 });
  tl.fromTo(q('.fr-band'), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'sine.out' }, 0)
    .to(q('.fr-rule'), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', autoRound: false, onComplete: () => gsap.set(q('.fr-rule'), { strokeDasharray: 'none' }) }, 0)
    .fromTo(q('.rz'), { scale: 0.6, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.06 }, 0.5)
    .fromTo(q('.cf'), { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'sine.out' }, 0.7)
    .fromTo(q('.fr-c-in'), { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.8);
  return tl;
}
