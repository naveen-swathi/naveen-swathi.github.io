// r13w Western look: border-western.js (defs, botanical primitives, frame, crest). (?look=western), "Garden": roses, peonies and eucalyptus in line-and-wash vector with champagne-gold
// filigree. Same contract as border.js / fills.js: markup strings, design units (1 du = 1 px at 390 x 844), colours from
// proto.css classes and the shared gradients in westDefs(). No images, no filters, no randomness.
import { f, pearl, dot } from './border.js';

export const R = (a) => (a * Math.PI) / 180;
export const G = (x, y, rot, s, inner, cls = '') => `<g${cls ? ` class="${cls}"` : ''} transform="translate(${f(x)} ${f(y)})${rot ? ` rotate(${f(rot)})` : ''}${s != null && s !== 1 ? ` scale(${f(s)})` : ''}">${inner}</g>`;

// ---------- shared gradients (mount once in <body>, never display:none) ----------
export function westDefs() {
  const lin = (id, stops, v = true) => `<linearGradient id="${id}" x1="0" y1="${v ? 1 : 0}" x2="${v ? 0 : 1}" y2="0">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const rad = (id, stops) => `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;
  return `<svg class="w-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    ${lin('wg-pe', [[0, '#E3A6AB'], [0.5, '#F3CDCA'], [1, '#FDF0EC']])}
    ${rad('wg-pec', [[0, '#D88E97'], [1, '#EDBDBD']])}
    ${lin('wg-ro', [[0, '#E6C3B3'], [0.5, '#F6E4D8'], [1, '#FFFAF4']])}
    ${rad('wg-roc', [[0, '#DDB09F'], [1, '#F1D9CA']])}
    ${lin('wg-rd', [[0, '#CC8790'], [0.55, '#E6B1B2'], [1, '#F7DAD5']])}
    ${rad('wg-rdc', [[0, '#B9727E'], [1, '#DB9EA3']])}
    ${lin('wg-eu', [[0, '#93AFA8'], [1, '#D2E1DB']], false)}
    ${lin('wg-eu2', [[0, '#AFC4C2'], [1, '#E1EBE8']], false)}
    ${lin('wg-sg', [[0, '#91A889'], [1, '#CDDAC2']], false)}
    ${lin('wg-cn', [[0, '#E2D4C0'], [0.34, '#FFFDF8'], [0.62, '#FAF2E6'], [1, '#DCCBB3']], false)}
    ${lin('wg-au', [[0, '#8C7140'], [0.45, '#EADBB0'], [0.7, '#C1A66E'], [1, '#8C7140']], false)}
    ${lin('wg-rb', [[0, '#FFFFFF'], [0.45, '#F7E3E0'], [0.7, '#FFF8F5'], [1, '#E9C8C5']])}
  </defs></svg>`;
}

// ---------- botanical primitives (each drawn pointing up, -y, from its base unless noted) ----------
// a cupped rose petal from inner radius r1 to outer r2, half width w, with the heart-notch at the lip
const cupD = (r1, r2, w) => `M${f(-w * 0.38)} ${f(-r1)}C${f(-w * 1.08)} ${f(-r1 - (r2 - r1) * 0.32)} ${f(-w * 0.98)} ${f(-r2 * 0.97)} ${f(-w * 0.34)} ${f(-r2)}`
  + `Q0 ${f(-r2 * 0.95)} ${f(w * 0.34)} ${f(-r2)}C${f(w * 0.98)} ${f(-r2 * 0.97)} ${f(w * 1.08)} ${f(-r1 - (r2 - r1) * 0.32)} ${f(w * 0.38)} ${f(-r1)}Z`;
// a ruffled peony petal: the lip has three soft scallops
const ruffD = (r1, r2, w) => `M${f(-w * 0.4)} ${f(-r1)}C${f(-w * 1.12)} ${f(-r1 - (r2 - r1) * 0.3)} ${f(-w * 1.06)} ${f(-r2 * 0.9)} ${f(-w * 0.64)} ${f(-r2 * 0.96)}`
  + `Q${f(-w * 0.4)} ${f(-r2 * 1.04)} ${f(-w * 0.16)} ${f(-r2 * 0.95)}Q0 ${f(-r2 * 1.03)} ${f(w * 0.16)} ${f(-r2 * 0.95)}Q${f(w * 0.4)} ${f(-r2 * 1.04)} ${f(w * 0.64)} ${f(-r2 * 0.96)}`
  + `C${f(w * 1.06)} ${f(-r2 * 0.9)} ${f(w * 1.12)} ${f(-r1 - (r2 - r1) * 0.3)} ${f(w * 0.4)} ${f(-r1)}Z`;
const lipD = (r2, w, k = 0.88) => `M${f(-w * 0.62)} ${f(-r2 * k)}Q0 ${f(-r2 * (k - 0.1))} ${f(w * 0.62)} ${f(-r2 * k)}`;

// garden rose, front view. tone: 'ro' ivory-champagne, 'rd' dusty rose, 'pe' blush. Petal groups carry data for the bloom.
export function rose(x, y, r, tone = 'ro', rot = 0, { bloom = false } = {}) {
  const c = `wf-${tone}`;
  const ring = (k, n, r1, r2, w, off, lip) => Array.from({ length: n }, (_, i) => {
    const a = off + (i * 360) / n + (i % 2 ? 5 : -4);
    return `<g class="w-pt"${bloom ? ` data-ring="${k}" data-a="${f(a)}"` : ''} transform="rotate(${f(a)})"><path class="${c}" d="${cupD(r1, r2, w)}"/>${lip ? `<path class="wf-ln" d="${lipD(r2, w)}"/>` : ''}</g>`;
  }).join('');
  const sp = `M${f(-r * 0.05)} ${f(-r * 0.2)}C${f(r * 0.2)} ${f(-r * 0.22)} ${f(r * 0.25)} ${f(r * 0.06)} ${f(r * 0.04)} ${f(r * 0.13)}C${f(-r * 0.15)} ${f(r * 0.18)} ${f(-r * 0.21)} ${f(-r * 0.03)} ${f(-r * 0.06)} ${f(-r * 0.09)}C${f(r * 0.03)} ${f(-r * 0.12)} ${f(r * 0.09)} ${f(-r * 0.04)} ${f(r * 0.04)} ${f(r * 0.03)}`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">${ring(0, 5, r * 0.12, r, r * 0.62, 0, true)}${ring(1, 5, r * 0.1, r * 0.75, r * 0.47, 36, true)}${ring(2, 4, r * 0.08, r * 0.5, r * 0.33, 18, true)}`
    + `<g class="w-pt"${bloom ? ' data-ring="3" data-a="0"' : ''}><circle class="${c}c" r="${f(r * 0.24)}"/><path class="wf-ln" d="${sp}"/></g></g>`;
}
// peony, front view: four rings of ruffled petals around a deep blush heart
export function peony(x, y, r, rot = 0) {
  const ring = (n, r1, r2, w, off, cls, lip) => Array.from({ length: n }, (_, i) => {
    const a = off + (i * 360) / n + ((i * 7) % 5) - 2;
    return `<g transform="rotate(${f(a)})"><path class="${cls}" d="${ruffD(r1, r2, w)}"/>${lip ? `<path class="wf-ln" d="${lipD(r2, w, 0.86)}"/>` : ''}</g>`;
  }).join('');
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">${ring(8, r * 0.14, r, r * 0.5, 0, 'wf-pe', true)}${ring(7, r * 0.12, r * 0.77, r * 0.42, 24, 'wf-pe', true)}`
    + `${ring(6, r * 0.1, r * 0.54, r * 0.33, 8, 'wf-pe', false)}${ring(5, r * 0.06, r * 0.32, r * 0.22, 30, 'wf-pec', false)}`
    + `<circle class="wf-pec" r="${f(r * 0.11)}"/>${[0, 72, 144, 216, 288].map((a) => `<path class="wf-ln" transform="rotate(${a})" d="M0 ${f(-r * 0.12)}q${f(r * 0.06)} ${f(-r * 0.08)} 0 ${f(-r * 0.17)}"/>`).join('')}</g>`;
}
// rosebud (side view) with sepals, pointing toward ang (0 = up)
export function rosebud(x, y, s = 1, ang = 0, tone = 'rd') {
  return G(x, y, ang, s, `<path class="wf-sg" d="M0 1C-1.6 -1 -4.2 -2 -5.6 -5.4C-3.6 -4.2 -2 -3.8 -.5 -2.8Z"/><path class="wf-sg" d="M0 1C1.6 -1 4.2 -2 5.6 -5.4C3.6 -4.2 2 -3.8 .5 -2.8Z"/>`
    + `<path class="wf-${tone}" d="M0 0C-4.6 -1.6 -5.4 -8.4 -1.2 -13.4C-.4 -12.2 .4 -12.2 1.2 -13.4C5.4 -8.4 4.6 -1.6 0 0Z"/><path class="wf-ln" d="M-3.4 -3.4C-1.4 -6 1.6 -8 1.3 -12.4"/>`
    + `<path class="wf-sg" d="M0 1.4C-1 -1.6 -1.1 -5 0 -8.4C1.1 -5 1 -1.6 0 1.4Z"/>`);
}
// rose / sage leaf from its base along +x
export function rleaf(x, y, ang, L = 12, w = 4.4, cls = 'wf-sg') {
  return G(x, y, ang, 1, `<path class="${cls}" d="M0 0C${f(L * 0.22)} ${f(-w)} ${f(L * 0.66)} ${f(-w * 1.04)} ${f(L)} 0C${f(L * 0.66)} ${f(w * 1.04)} ${f(L * 0.22)} ${f(w)} 0 0Z"/>`
    + `<path class="wf-vn" d="M${f(L * 0.05)} 0L${f(L * 0.9)} 0M${f(L * 0.3)} 0l${f(L * 0.16)} ${f(-w * 0.52)}M${f(L * 0.55)} 0l${f(L * 0.14)} ${f(-w * 0.44)}M${f(L * 0.3)} 0l${f(L * 0.16)} ${f(w * 0.52)}M${f(L * 0.55)} 0l${f(L * 0.14)} ${f(w * 0.44)}"/>`);
}
// silver-dollar eucalyptus leaf: nearly round, attached at its base, along +x
export function eleaf(x, y, ang, r = 4, cls = 'wf-eu') {
  return G(x, y, ang, 1, `<path class="${cls}" d="M0 0C${f(r * 0.1)} ${f(-r * 0.95)} ${f(r * 1.6)} ${f(-r * 1.08)} ${f(r * 2)} 0C${f(r * 1.6)} ${f(r * 1.08)} ${f(r * 0.1)} ${f(r * 0.95)} 0 0Z"/><path class="wf-vn" d="M${f(r * 0.2)} 0L${f(r * 1.35)} 0"/>`);
}
// a point on a gently bent stem from (0,0) to (len,0) bulging by `bend`, and its direction
const along = (len, bend, t) => ({ x: len * t, y: 4 * bend * t * (1 - t), a: Math.atan2(4 * bend * (1 - 2 * t), len) * 180 / Math.PI });
// eucalyptus sprig from (x, y) toward ang: alternate round leaves shrinking to the tip, the thin stem on top
export function eucSprig(x, y, ang, len, r0 = 4.2, { bend = 3, cls = 'wf-eu', first = 1 } = {}) {
  const n = Math.max(2, Math.round(len / (r0 * 1.55)));
  let lv = '';
  for (let i = 0; i < n; i++) {
    const t = (i + 0.6) / (n + 0.4), p = along(len, bend, t), side = (i + first) % 2 ? 1 : -1, r = r0 * (1 - 0.42 * t);
    lv += eleaf(p.x, p.y, p.a + side * (62 - 18 * t), r, cls);
  }
  const tip = along(len, bend, 1);
  lv += eleaf(tip.x, tip.y, tip.a - 24, r0 * 0.5, cls) + eleaf(tip.x, tip.y, tip.a + 24, r0 * 0.46, cls);
  return G(x, y, ang, 1, `${lv}<path class="wf-st" d="M0 0Q${f(len / 2)} ${f(2 * bend)} ${f(len)} 0"/>`);
}
// willow eucalyptus: narrow leaves in a herringbone
export function willow(x, y, ang, len, { bend = 2, L = 9, w = 1.9, cls = 'wf-eu2' } = {}) {
  const n = Math.max(2, Math.round(len / 6));
  let lv = '';
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, p = along(len, bend, t), side = i % 2 ? 1 : -1, l = L * (1 - 0.35 * t);
    lv += G(p.x, p.y, p.a + side * 34, 1, `<path class="${cls}" d="M0 0C${f(l * 0.3)} ${f(-w)} ${f(l * 0.7)} ${f(-w)} ${f(l)} 0C${f(l * 0.7)} ${f(w)} ${f(l * 0.3)} ${f(w)} 0 0Z"/>`);
  }
  return G(x, y, ang, 1, `${lv}<path class="wf-st" d="M0 0Q${f(len / 2)} ${f(2 * bend)} ${f(len)} 0"/>`);
}
// waxflower: five round petals and a gold heart
export const waxflower = (x, y, r = 3) => G(x, y, 0, 1, Array.from({ length: 5 }, (_, i) => { const a = R(i * 72 - 90); return `<circle class="wf-wx" cx="${f(Math.cos(a) * r * 0.55)}" cy="${f(Math.sin(a) * r * 0.55)}" r="${f(r * 0.42)}"/>`; }).join('') + `<circle class="gfill" r="${f(r * 0.24)}"/>`);
// a little cluster of dusty-blue berries
export const berries = (x, y, s = 1) => G(x, y, 0, s, [[0, 0, 1.7], [2.8, -1.5, 1.35], [1.9, 2.4, 1.25], [-2.4, 1.7, 1.15]].map(([a, b, r]) => `<circle class="wf-bl" cx="${a}" cy="${b}" r="${r}"/><circle class="wf-blt" cx="${f(a - r * 0.3)}" cy="${f(b - r * 0.3)}" r="${f(r * 0.28)}"/>`).join(''));

// ---------- the frame ("Garden") ----------
// Band 8..32 du (sage), gold edges at 8 and 32, a gold eucalyptus vine running in it; corner squares hold a rose cameo.
// Outer rule 4.5, inner rule 36, fine rule 39. Top-left and bottom-right: a peony, rose and eucalyptus cluster spilling
// over the band; top-right and bottom-left: champagne-gold filigree with a rosebud. Class hooks match border.js, so
// border.frameIntro() plays it unchanged (.fr-band, .fr-rule, .rz, .cf, .fr-c-in).
const P = 60;
function bandTile() {
  const c = 12, a = 2.6, xAt = (y) => c + a * Math.sin((2 * Math.PI * y) / P), xB = (y) => c - a * 0.9 * Math.sin((2 * Math.PI * y) / P);
  let d = '', e = '';
  for (let y = -1; y <= P + 1.01; y += 1.5) { d += `${d ? 'L' : 'M'}${f(xAt(y))} ${f(y)}`; e += `${e ? 'L' : 'M'}${f(xB(y))} ${f(y)}`; }
  const lf = (y, side, r = 3.9, cls = 'wf-eu') => eleaf(xAt(y), y, side > 0 ? 34 : 146, r, cls);
  return `<path class="vine-s thin" d="${e}" opacity=".7"/>${lf(5, -1)}${lf(10, 1, 3.3, 'wf-eu2')}${lf(20, 1)}${lf(36, -1, 3.6)}${lf(41, 1, 3.1, 'wf-eu2')}${lf(51, 1, 3.6)}<path class="vine-s w-vine" d="${d}"/>`
    + `${rosebud(xAt(28) + 0.4, 28, 0.5, 130, 'pe')}${waxflower(xAt(58.5) - 4.4, 58.5, 2.3)}${berries(xAt(45) - 4.6, 45, 0.5)}${dot(xAt(14.5) + 3.6, 14.5, 0.55)}`;
}
function bandPatterns(id, H, W) {
  const t = bandTile();
  const vy = 32 + (((H - 64) % P) + P) % P / 2, hx = 32 + (((W - 64) % P) + P) % P / 2;
  return `<pattern id="${id}v" width="24" height="${P}" patternUnits="userSpaceOnUse" x="8" y="${f(vy)}">${t}</pattern>`
    + `<pattern id="${id}h" width="${P}" height="24" patternUnits="userSpaceOnUse" x="${f(hx)}" y="8"><g transform="matrix(0 1 1 0 0 0)">${t}</g></pattern>`;
}
// rose cameo on the band corners and the band centres
function cameoArt(r = 9.5) {
  return `<circle class="disc" r="${r}"/><circle class="rim" r="${f(r - 0.8)}"/><circle class="rim thin" r="${f(r - 2.4)}"/>`
    + `${[45, 135, 225, 315].map((a) => eleaf(0, 0, a, r * 0.36, 'wf-eu')).join('')}${rose(0, 0, r * 0.5, 'pe', 10)}`;
}
const cameo = (x, y, s, cls) => `<g class="${cls}" transform="translate(${f(x)} ${f(y)})"><use href="#wfCam"${s !== 1 ? ` transform="scale(${f(s)})"` : ''}/></g>`;
// floral corner (top-left frame; the others are mirrored with scale)
function floralCorner() {
  return `<g class="cflo w-flo">
    <path class="scroll" d="M112 40.4C124 39.4 136 39.6 146 41c5 .8 7.6 -2 6.2 -4.8c-1.4 -2.6 -5.4 -2.2 -5.6 .4"/>
    <path class="scroll" d="M40.4 112C39.4 124 39.6 136 41 146c.8 5 -2 7.6 -4.8 6.2c-2.6 -1.4 -2.2 -5.4 .4 -5.6"/>
    <path class="scroll thin" d="M128 39.8c1.4 -4 6.4 -6 10 -3.8M39.8 128c-4 1.4 -6 6.4 -3.8 10"/>
    ${pearl(112, 40.4, 1.3)}${pearl(40.4, 112, 1.3)}${dot(152, 37.6, 0.7)}${dot(37.6, 152, 0.7)}
    ${eucSprig(54, 39, -3, 70, 4.3, { bend: -2 })}${eucSprig(39, 54, 93, 70, 4.3, { bend: 2, first: 0 })}
    ${willow(56, 50, 24, 40)}${willow(50, 56, 66, 40, { bend: -2 })}
    ${rleaf(50, 50, 45, 30, 9.5)}${rleaf(58, 40, -6, 19, 6.2, 'wf-sg')}${rleaf(40, 58, 96, 19, 6.2, 'wf-sg')}
    ${rose(76, 40.5, 10.5, 'ro', 14)}${rose(40.5, 76, 9.6, 'rd', -24)}
    ${rosebud(95, 41.5, 0.92, 92)}${rosebud(41.5, 95, 0.86, 178)}
    ${waxflower(63, 60, 3.4)}${waxflower(57, 67, 2.6)}${waxflower(70, 55, 2.3)}${berries(89, 50, 0.95)}${berries(50, 89, 0.9)}
    ${peony(45, 45, 18.5, 8)}
  </g>`;
}
// champagne-gold filigree corner (top corners): mirrored scrollwork about the diagonal, pearls, a small rose and eucalyptus
function filigreeCorner() {
  const half = `<path class="scroll" d="M47 47C55 42.4 63 41.2 73 41.6C88 42.4 98 41.2 107 40.6c6 -.4 9 -3.4 7.4 -6.2c-1.6 -2.6 -5.8 -2 -5.8 .8"/>
    <path class="scroll thin" d="M107 40.6C122 40.1 136 40.5 150 41.2"/>
    <path class="scroll" d="M53 52.6C61 50.4 67 54 67 60.4c0 4.2 -4.2 6.2 -6.8 4.2c-2 -1.6 -.8 -4.4 1.4 -3.8"/>
    <path class="scroll thin" d="M73 41.6C79 47 87 48.4 94 46c-6 -2 -13 -3 -21 -4.4ZM82 44.6c2 3.4 2 6.6 0 9.6"/>
    ${pearl(73, 41.6, 1.3)}${pearl(150, 41.2, 1)}${dot(82, 55.4, 0.8)}${dot(114, 34.2, 0.7)}${dot(96, 37.2, 0.6)}`;
  return `<g class="cflo w-fil">${half}<g transform="matrix(0 1 1 0 0 0)">${half}</g>
    <path class="scroll" d="M47 47C43 43 41.4 40 40.6 36.4"/>${pearl(47, 47, 1.7)}
    ${eucSprig(52, 52, 18, 26, 3.4, { bend: -1.4 })}${eucSprig(52, 52, 72, 26, 3.4, { bend: 1.4, first: 0 })}${rleaf(52, 52, 45, 16, 5.4)}
    ${rosebud(66, 66, 0.7, 135, 'pe')}${waxflower(62, 50, 2.2)}${waxflower(50, 62, 2.2)}${rose(53, 53, 7.6, 'ro', 18)}</g>`;
}
function ruleHalves(cls, inset, W, H) {
  const cx = W / 2, x0 = inset, x1 = W - inset, y0 = inset, y1 = H - inset;
  return `<path class="${cls} fr-rule" pathLength="1" d="M${f(cx)} ${f(y0)}H${f(x0)}V${f(y1)}H${f(cx)}"/>`
    + `<path class="${cls} fr-rule" pathLength="1" d="M${f(cx)} ${f(y0)}H${f(x1)}V${f(y1)}H${f(cx)}"/>`;
}
export function frameSVG(W, H) {
  const id = `wfr${Math.round(W)}x${Math.round(H)}`;
  const cx = W / 2;
  // each corner art and the cameo is drawn once as a <symbol> and placed with <use> (about 1590 nodes down to about 870)
  const corners = [[0, 0, 1, 1, 'wfFil'], [W, 0, -1, 1, 'wfFil'], [0, H, 1, -1, 'wfFlo'], [W, H, -1, -1, 'wfFlo']];
  return `<svg class="frame-svg w-frame" viewBox="0 0 ${f(W)} ${f(H)}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>${bandPatterns(id, H, W)}
    <symbol id="wfFil" overflow="visible">${filigreeCorner()}</symbol><symbol id="wfFlo" overflow="visible">${floralCorner()}</symbol><symbol id="wfCam" overflow="visible">${cameoArt(9.5)}</symbol></defs>
    <g class="fr-band">
      <path class="band" d="M8 8H${f(W - 8)}V${f(H - 8)}H8Z M32 32V${f(H - 32)}H${f(W - 32)}V32Z" fill-rule="evenodd"/>
      <rect x="8" y="32" width="24" height="${f(H - 64)}" fill="url(#${id}v)"/>
      <g transform="translate(${f(W)} 0) scale(-1 1)"><rect x="8" y="32" width="24" height="${f(H - 64)}" fill="url(#${id}v)"/></g>
      <rect x="32" y="8" width="${f(W - 64)}" height="24" fill="url(#${id}h)"/>
      <g transform="translate(0 ${f(H)}) scale(1 -1)"><rect x="32" y="8" width="${f(W - 64)}" height="24" fill="url(#${id}h)"/></g>
      <rect class="edge" x="8" y="8" width="${f(W - 16)}" height="${f(H - 16)}"/>
      <rect class="edge" x="32" y="32" width="${f(W - 64)}" height="${f(H - 64)}"/>
      <rect class="edge thin" x="10.6" y="10.6" width="${f(W - 21.2)}" height="${f(H - 21.2)}"/>
    </g>
    ${ruleHalves('rule-o', 4.5, W, H)}${ruleHalves('rule-i', 36, W, H)}
    <rect class="rule-f" x="39" y="39" width="${f(W - 78)}" height="${f(H - 78)}"/>
    ${corners.map(([x, y, sx, sy], k) => cameo(x + sx * 20, y + sy * 20, 1, `rz c${k + 1}`)).join('')}
    ${cameo(cx, H - 20, 8 / 9.5, 'rz rz-m')}
    ${corners.map(([x, y, sx, sy, id], k) => `<g class="cf c${k + 1}" transform="translate(${f(x)} ${f(y)}) scale(${sx} ${sy})"><use href="#${id}"/></g>`).join('')}
  </svg>`;
}
// top centre, hung under the inner rule (0,0 at x = W/2, y = 36 du; viewBox 160 x 52 like border.crestTop):
// a little swag: eucalyptus sprays along the rule, a rose between two buds, gold tendrils and a pearl drop
export function crestTop() {
  const side = (s) => `<path class="scroll" d="M${s * 9} 12C${s * 22} 21 ${s * 40} 20 ${s * 52} 11c${s * 4} -3 ${s * 9} -2 ${s * 9.6} 1.6c${s * .4} 2.6 ${s * -2.4} 3.8 ${s * -4} 2.2"/>`
    + eucSprig(s * 7, 5, s > 0 ? -4 : 184, 64, 3.6, { bend: s > 0 ? -1.6 : 1.6 }) + willow(s * 10, 9, s > 0 ? 14 : 166, 30, { bend: s > 0 ? 1.4 : -1.4 })
    + rosebud(s * 15, 8, 0.6, s * 68) + waxflower(s * 26, 13.4, 2.2) + dot(s * 40, 19.4, 0.8) + pearl(s * 59, 13.6, 1.3);
  return `<svg class="crest-svg" viewBox="-80 -2 160 52" aria-hidden="true" focusable="false"><g class="crest">${side(-1)}${side(1)}
    <path class="vine-s thin" d="M0 17V24"/>${pearl(0, 26.4, 2.1)}<path class="gfill" d="M0 29.6l2 3.2l-2 3.2l-2 -3.2Z"/>
    ${rleaf(-3, 9, 200, 12, 4.2)}${rleaf(3, 9, -20, 12, 4.2)}${rose(0, 8.4, 8.6, 'pe', 12)}</g></svg>`;
}

// =====================================================================================================
// page fills for the Western look. Same contract as fills.js. viewBoxes in design units.
// =====================================================================================================
