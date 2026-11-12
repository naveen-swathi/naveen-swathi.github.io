// Option 5 "Real dove": a white rock dove painted in filled, tonal vector shapes (no outlines), with its nest, boughs and
// South Indian wedding flowers. One rig per bird (sit, perch, fly, nuzzle poses), posed by writing transforms on <g> groups.
// Units: body ~100 long (beak tip ~ +55, tail tip ~ -76), facing right, origin at the body centre, y down.

const NS = 'http://www.w3.org/2000/svg';
export const f = (n) => Math.round(n * 100) / 100;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const mk = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
// deterministic noise so every render is the same
export function rng(seed = 7) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export const P = {
  hi: '#FFFFFF', hi2: '#FFFDF9', base: '#F7F1EA', g1: '#E7DED5', g2: '#D2C5BA', g3: '#B5A59A', blush: '#EFC6C9', blush2: '#F1D3D3',
  sky: '#E3ECE8', tip: '#C9BDB4', eye: '#2A1A1E', ring: '#EFE0DA', bill: '#D7A0A2', billTip: '#B57E84', cere: '#F6ECEA',
  foot: '#D9858C', scale: '#C97479', gold: '#B08A3E',
  jas: '#FFFDF8', jas2: '#EFE6D8', jasC: '#E6D39A', budTip: '#F4C3CD',
  pk1: '#F4C3CD', pk2: '#E89DB0', pk3: '#C9708A',
  fr1: '#FFF7EA', fr2: '#F7DDA0', fr3: '#F1BE5C', mar1: '#F0AA35', mar2: '#D9811F',
  leaf: '#7FAE95', vein: '#4F806B', barkHi: '#B9997C', bark: '#8C6A52', bark2: '#6A4E3D',
  twig1: '#C4A684', twig2: '#9C7B5F', grass: '#D9C4A0', cup1: '#5E4636', cup2: '#8C6A52', rib: '#F4C3CD', rib2: '#E89DB0', heart: '#EBB9B4',
};

// ---------- shared defs: one hidden 0x0 svg in <body>; ids prefixed rd- ----------
const lin = (id, stops, x1 = 0, y1 = 0, x2 = 1, y2 = 0) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
const rad = (id, stops, cx = 0.5, cy = 0.5, r = 0.5, fx, fy) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;

function gradients() {
  let s = '';
  // body-level gradients exist in two handedness variants so a mirrored bird keeps the key light at the upper left
  for (const side of ['l', 'r']) {
    const X = (x) => (side === 'l' ? x : 1 - x);
    s += rad(`rd-body-${side}`, [[0, P.hi], [0.3, P.hi2], [0.58, P.base], [0.8, P.g1], [1, P.g2]], X(0.36), 0.12, 0.98);
    s += rad(`rd-head-${side}`, [[0, P.hi], [0.45, P.hi2], [0.78, P.base], [1, P.g1]], X(0.38), 0.22, 0.85);
    s += rad(`rd-neck-${side}`, [[0, P.hi], [0.5, P.hi2], [0.85, P.base], [1, P.g1]], X(0.3), 0.2, 0.95);
    s += rad(`rd-breast-${side}`, [[0, P.hi], [0.45, P.hi2], [0.75, '#F5EEE7'], [1, P.g1]], X(0.62), 0.22, 0.9);
    // one continuous skin in the bird's own units, so body, neck and breast pieces meet without seams
    s += `<radialGradient id="rd-skin-${side}" gradientUnits="userSpaceOnUse" cx="${side === 'l' ? -4 : 20}" cy="-40" r="80">${[[0, P.hi], [0.38, P.hi], [0.56, P.hi2], [0.72, P.base], [0.86, P.g1], [1, '#D6C9BE']].map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;
    s += rad(`rd-wingf-${side}`, [[0, P.hi], [0.55, P.base], [1, P.g1]], X(0.55), 0.1, 1);
  }
  s += lin('rd-bounce', [[0, P.blush, 0], [0.62, P.blush2, 0], [0.88, P.blush2, 0.32], [1, P.blush, 0.55]], 0, 0, 0, 1);
  s += `<linearGradient id="rd-bounce-u" gradientUnits="userSpaceOnUse" x1="0" y1="-4" x2="0" y2="23"><stop offset="0" stop-color="${P.blush2}" stop-opacity="0"/><stop offset=".6" stop-color="${P.blush2}" stop-opacity=".28"/><stop offset="1" stop-color="${P.blush}" stop-opacity=".6"/></linearGradient>`;
  s += rad('rd-shade', [[0, P.g2, 0.45], [1, P.g2, 0]]);
  s += rad('rd-hl', [[0, P.hi, 0.95], [1, P.hi, 0]]);
  s += lin('rd-skyb', [[0, P.sky, 0.85], [0.35, P.sky, 0]], 0, 0, 0, 1);
  s += rad('rd-cheek', [[0, P.blush, 0.55], [1, P.blush, 0]]);
  s += rad('rd-ao', [[0, '#6A4E3D', 0.3], [0.6, '#6A4E3D', 0.12], [1, '#6A4E3D', 0]]);
  s += rad('rd-pocket', [[0, '#B5A59A', 0.5], [1, '#B5A59A', 0]]);
  // feathers are drawn along +x (base at 0, tip at L): gradients run base -> tip
  s += lin('rd-fc', [[0, '#D3C6BA'], [0.3, '#E9E0D7'], [0.7, '#FAF6F1'], [1, P.hi]]);
  s += lin('rd-fco', [[0, '#E4DAD0'], [0.4, '#F4EFE9'], [0.8, P.hi], [1, P.hi]]);
  s += lin('rd-fg', [[0, '#CFC1B5'], [0.35, '#E6DCD2'], [0.75, '#F9F5F0'], [1, P.hi]]);
  s += lin('rd-fs', [[0, '#DDD2C7'], [0.35, '#F2ECE5'], [0.8, P.hi], [1, '#F2ECE6']]);
  s += lin('rd-fp', [[0, '#DCD1C6'], [0.25, '#F3EDE6'], [0.62, P.hi], [0.86, '#F0E9E2'], [1, P.tip]]);
  s += lin('rd-fpw', [[0, '#D9CEC3'], [0.3, '#EFE8E1'], [0.7, '#FBF8F4'], [1, '#D8CDC3']], 0, 0, 0, 1);
  s += lin('rd-ft', [[0, '#D6CABF'], [0.3, '#EFE8E0'], [0.75, P.hi], [0.93, '#EEE7E0'], [1, '#D8CCC1']]);
  s += lin('rd-ff', [[0, '#C9BCB0'], [0.45, '#DED3C9'], [1, '#ECE5DE']]);
  s += lin('rd-ffs', [[0, '#CDBFB3'], [0.6, '#E2D8CE'], [1, '#EAE2DA']]);
  s += lin('rd-arm', [[0, P.hi], [0.6, P.hi2], [1, '#EDE5DD']], 0, 0, 0, 1);
  s += lin('rd-fpf', [[0, '#D8CCC1'], [0.3, '#EEE7E0'], [0.62, '#FBF8F4'], [0.84, '#EDE5DD'], [1, '#CDC1B7']]);
  s += lin('rd-fsc', [[0, '#E9E1D9'], [0.45, '#FAF7F3'], [1, P.hi]]);
  s += lin('rd-ftc', [[0, P.hi, 0], [0.3, P.hi, 0.55], [0.8, P.hi, 0.4], [1, P.hi, 0]]);
  s += lin('rd-wsoft', [[0, '#C9BBAE', 0.32], [1, '#C9BBAE', 0]], 0, 0, 0, 1);
  s += rad('rd-cere', [[0, P.hi], [0.55, '#FBF5F2', 0.9], [1, P.cere, 0]]);
  s += rad('rd-cuplin', [[0, '#F3E3D2'], [0.45, '#E6D2B4'], [0.8, P.grass], [1, '#BFA27F']], 0.5, 0.75, 0.75);
  s += lin('rd-tint', [[0, '#F7DCE0'], [0.55, '#F6E6E4'], [1, '#DDEDE6']], 0, 0, 0, 1);
  s += lin('rd-bill', [[0, '#E6BBBB'], [0.55, P.bill], [1, P.billTip]]);
  s += lin('rd-billlo', [[0, '#D9AAAA'], [1, '#B98488']]);
  s += rad('rd-iris', [[0, '#5A3A40'], [0.6, '#2A1A1E'], [1, '#1A0F12']], 0.4, 0.38, 0.6);
  s += lin('rd-foot', [[0, '#E6A1A6'], [0.5, P.foot], [1, P.scale]], 0, 0, 0, 1);
  // flowers
  s += lin('rd-jasp', [[0, '#E9DEC9'], [0.35, '#F7F2E8'], [0.7, P.jas], [1, P.hi]], 0, 1, 0, 0);
  s += lin('rd-jasbud', [[0, '#E8DCC4'], [0.45, P.jas], [0.8, '#FBE6E9'], [1, P.budTip]], 0, 1, 0, 0);
  s += lin('rd-pkp', [[0, P.pk3], [0.3, P.pk2], [0.7, P.pk1], [1, '#FADDE3']], 0, 1, 0, 0);
  s += lin('rd-pkb', [[0, '#C46A84'], [0.5, P.pk2], [1, P.pk1]], 0, 1, 0, 0);
  s += lin('rd-frp', [[0, P.fr3], [0.28, P.fr2], [0.6, P.fr1], [1, P.hi]], 0, 1, 0, 0);
  s += rad('rd-mar', [[0, '#C8701A'], [0.45, P.mar2], [0.8, P.mar1], [1, '#F6C255']]);
  s += lin('rd-leaf', [[0, '#9CC4AE'], [0.5, P.leaf], [1, '#5F927A']], 0, 0, 0, 1);
  s += lin('rd-leaf2', [[0, '#B3D2BF'], [1, '#86B39B']], 0, 0, 0, 1);
  // bough, nest, ribbon, heart
  s += lin('rd-bark', [[0, P.barkHi], [0.35, '#A2826A'], [0.7, P.bark], [1, P.bark2]], 0, 0, 0, 1);
  s += rad('rd-cup', [[0, '#4A372B'], [0.55, P.cup1], [1, P.cup2]], 0.5, 0.35, 0.6);
  s += lin('rd-nestw', [[0, '#B39272'], [0.5, P.twig2], [1, '#7A5C47']], 0, 0, 0, 1);
  s += lin('rd-rib', [[0, '#FBE3E7'], [0.4, P.rib], [0.75, '#F8D3DA'], [1, P.rib2]], 0, 0, 1, 1);
  s += lin('rd-heart', [[0, '#F6D3CF'], [0.6, P.heart], [1, '#DDA19E']], 0, 0, 0.6, 1);
  return s;
}

// ---------- flower and leaf glyphs (drawn once as <g> in defs, reused with <use>) ----------
// all glyphs are drawn at radius 10 around (0, 0); a leaf runs along +x from 0 to 10
function glyphs() {
  let s = '';
  // jasmine (sambac, malli): six rounded outer petals, four inner ones, a small cream heart
  const jp = (L, w) => `M0 0C${f(-w)} ${f(-L * 0.25)} ${f(-w * 1.05)} ${f(-L * 0.85)} 0 ${f(-L)}C${f(w * 1.05)} ${f(-L * 0.85)} ${f(w)} ${f(-L * 0.25)} 0 0Z`;
  s += '<g id="rd-jas">';
  for (let i = 0; i < 6; i++) s += `<path d="${jp(10, 4.6)}" fill="url(#rd-jasp)" transform="rotate(${i * 60 + 8})"/>`;
  for (let i = 0; i < 4; i++) s += `<path d="${jp(6.2, 3.2)}" fill="url(#rd-jasp)" transform="rotate(${i * 90 + 40})"/>`;
  s += `<circle r="1.9" fill="${P.jasC}"/><circle r=".9" cx="-.3" cy="-.3" fill="#F3E7B8"/></g>`;
  // jasmine bud (mullai) pointing up, with a pink tip and a green calyx
  s += `<g id="rd-jbud"><path d="M0 0C-2.6 -3 -3 -7 0 -12C3 -7 2.6 -3 0 0Z" fill="url(#rd-jasbud)"/><path d="M-1.6 .6C-1.4 -1.6 1.4 -1.6 1.6 .6C.8 1.6 -.8 1.6 -1.6 .6Z" fill="#8DB59F"/></g>`;
  // pink blossom (Tabebuia / cherry-like): five cupped, softly notched petals, a deep throat and gold stamens
  const pp = 'M0 0C-3.4 -1.6 -6.4 -5.2 -5.6 -8.6C-5 -10.4 -2.6 -10.6 -1.1 -9.4C-.5 -10.2 .5 -10.2 1.1 -9.4C2.6 -10.6 5 -10.4 5.6 -8.6C6.4 -5.2 3.4 -1.6 0 0Z';
  s += '<g id="rd-pk">';
  for (let i = 0; i < 5; i++) s += `<path d="${pp}" fill="url(#rd-pkp)" transform="rotate(${i * 72})"/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M0 -1.4C-1.4 -3 -1.2 -5 0 -6C1.2 -5 1.4 -3 0 -1.4Z" fill="#FBE4E9" opacity=".55" transform="rotate(${i * 72})"/>`;
  s += `<circle r="2.4" fill="${P.pk3}"/><g stroke="#C9A04E" stroke-width=".35" stroke-linecap="round">`;
  for (let i = 0; i < 7; i++) { const a = (i * 51 + 10) * Math.PI / 180; s += `<path d="M0 0L${f(Math.cos(a) * 3.6)} ${f(Math.sin(a) * 3.6)}"/>`; }
  s += '</g><g fill="#E6C66E">';
  for (let i = 0; i < 7; i++) { const a = (i * 51 + 10) * Math.PI / 180; s += `<circle cx="${f(Math.cos(a) * 3.8)}" cy="${f(Math.sin(a) * 3.8)}" r=".55"/>`; }
  s += '</g></g>';
  s += `<g id="rd-pkbud"><path d="M0 0C-3 -2 -3.6 -7 0 -10C3.6 -7 3 -2 0 0Z" fill="url(#rd-pkb)"/><path d="M0 -10C-1 -7 -1 -3 0 0" stroke="#F7CCD5" stroke-width=".5" fill="none" opacity=".7"/><path d="M-2 .6C-1.6 -1.6 1.6 -1.6 2 .6C1 1.6 -1 1.6 -2 .6Z" fill="#8DB59F"/></g>`;
  // frangipani: five overlapping, twisted obovate petals around a golden yolk
  const fp = 'M0 0C-1.2 -2.6 -3.6 -6.4 -2.6 -9C-1.6 -11 2.8 -11 4.6 -8.6C6 -6.6 4 -3 0 0Z';
  s += '<g id="rd-fr">';
  for (let i = 0; i < 5; i++) s += `<path d="${fp}" fill="url(#rd-frp)" transform="rotate(${i * 72})"/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M0 0C.4 -2 1.8 -4 3 -5" stroke="#EBCB86" stroke-width=".5" fill="none" opacity=".6" transform="rotate(${i * 72})"/>`;
  s += `<circle r="1.6" fill="${P.fr3}"/></g>`;
  // marigold: three ruffled rings
  const ring = (r, n, amp) => { let d = ''; for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r : r - amp; d += `${i ? 'L' : 'M'}${f(Math.cos(a) * rr)} ${f(Math.sin(a) * rr)}`; } return d + 'Z'; };
  s += `<g id="rd-mari"><path d="${ring(10, 16, 1.6)}" fill="${P.mar2}"/><path d="${ring(8.2, 14, 1.4)}" fill="url(#rd-mar)" transform="rotate(9)"/><path d="${ring(6, 12, 1.2)}" fill="${P.mar1}" transform="rotate(4)"/><path d="${ring(3.8, 9, 1)}" fill="#F6BE50"/><circle r="1.6" fill="#E59A2A"/></g>`;
  // leaves along +x
  s += `<g id="rd-leaf"><path d="M0 0C2.6 -2.8 6.6 -3 10 0C6.6 2.8 2.6 2.6 0 0Z" fill="url(#rd-leaf)"/><path d="M.6 0C3.6 -.4 6.6 -.3 9.2 0" stroke="${P.vein}" stroke-width=".35" fill="none" opacity=".75"/></g>`;
  s += `<g id="rd-leafl"><path d="M0 0C2.6 -2.6 6.6 -2.8 10 0C6.6 2.6 2.6 2.4 0 0Z" fill="url(#rd-leaf2)"/><path d="M.6 0C3.6 -.3 6.6 -.2 9.2 0" stroke="#6E9F87" stroke-width=".3" fill="none" opacity=".6"/></g>`;
  // drifting petals
  s += `<g id="rd-ppk"><path d="M0 -4C2.6 -3 3 1.6 0 4C-3 1.6 -2.6 -3 0 -4Z" fill="${P.pk1}"/><path d="M0 -3C1 -1 1 1 0 3" stroke="${P.pk2}" stroke-width=".4" fill="none" opacity=".6"/></g>`;
  s += `<g id="rd-pjs"><path d="M0 -4C2.4 -3 2.8 1.6 0 4C-2.8 1.6 -2.4 -3 0 -4Z" fill="${P.jas}"/><path d="M0 -4C1.4 -2 1.4 1 0 4" stroke="${P.jas2}" stroke-width=".7" fill="none"/></g>`;
  return s;
}

export function ensureDefs() {
  if (document.getElementById('rd-defs')) return;
  const host = mk('svg', { id: 'rd-defs', width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false', style: 'position:absolute;width:0;height:0;overflow:hidden' });
  document.body.appendChild(host);
  mk('defs', {}, host).innerHTML = gradients() + glyphs();
}

// <use> of a glyph at (x, y), radius r (glyph radius 10), rotation a
export const use = (id, x, y, r = 10, a = 0, extra = '') => `<use href="#rd-${id}" transform="translate(${f(x)} ${f(y)}) rotate(${f(a)}) scale(${f(r / 10)})"${extra}/>`;

// ---------- tapered strokes drawn as filled shapes ----------
const cub = (c, t) => { const u = 1 - t; return [u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6], u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7]]; };
const cubD = (c, t) => { const u = 1 - t; return [3 * u * u * (c[2] - c[0]) + 6 * u * t * (c[4] - c[2]) + 3 * t * t * (c[6] - c[4]), 3 * u * u * (c[3] - c[1]) + 6 * u * t * (c[5] - c[3]) + 3 * t * t * (c[7] - c[5])]; };
export const quad2cub = (x0, y0, cx, cy, x1, y1) => [x0, y0, x0 + (cx - x0) * 2 / 3, y0 + (cy - y0) * 2 / 3, x1 + (cx - x1) * 2 / 3, y1 + (cy - y1) * 2 / 3, x1, y1];
// c: cubic [x0 y0 x1 y1 x2 y2 x3 y3]; width w0 at the start, w1 at the end; off shifts the centre line along the normal
export function taper(c, w0, w1, n = 12, off = 0, t0 = 0, t1 = 1) {
  const L = [], Rr = [];
  for (let i = 0; i <= n; i++) {
    const t = lerp(t0, t1, i / n), [x, y] = cub(c, t), [dx, dy] = cubD(c, t), l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    const hw = lerp(w0, w1, i / n) / 2;
    L.push([x + nx * (hw + off), y + ny * (hw + off)]); Rr.push([x - nx * (hw - off), y - ny * (hw - off)]);
  }
  const e = L[L.length - 1], r = Rr[Rr.length - 1];
  return 'M' + L.map((p) => p.map(f).join(' ')).join('L') + `Q${f((e[0] + r[0]) / 2 + (e[0] - L[L.length - 2][0]) * 0.8)} ${f((e[1] + r[1]) / 2 + (e[1] - L[L.length - 2][1]) * 0.8)} ` + Rr.reverse().map((p) => p.map(f).join(' ')).join('L') + 'Z';
}
export const at = (c, t) => cub(c, t);
export const angAt = (c, t) => { const [dx, dy] = cubD(c, t); return Math.atan2(dy, dx) * 180 / Math.PI; };

// a living bough: bark body with shade and light, small nodes and side twigs
export function bough(c, w0, w1, { seed = 3, knots = 3 } = {}) {
  const r = rng(seed);
  let s = `<path d="${taper(c, w0 * 1.08, w1 * 1.1, 24, w0 * 0.08)}" fill="${P.bark2}" opacity=".55"/>`;
  s += `<path d="${taper(c, w0, w1, 24)}" fill="url(#rd-bark)"/>`;
  s += `<path d="${taper(c, w0 * 0.22, w1 * 0.2, 24, -w0 * 0.24)}" fill="${P.barkHi}" opacity=".75"/>`;
  s += `<path d="${taper(c, w0 * 0.1, w1 * 0.08, 24, -w0 * 0.3)}" fill="#D8C0A6" opacity=".6"/>`;
  let d = '';
  for (let i = 0; i < knots * 4; i++) {
    const t = 0.05 + r() * 0.9, [x, y] = cub(c, t), a = angAt(c, t) * Math.PI / 180, w = lerp(w0, w1, t);
    const ox = -Math.sin(a) * w * (r() - 0.3) * 0.4, oy = Math.cos(a) * w * (r() - 0.3) * 0.4, len = w * (0.5 + r());
    d += `M${f(x + ox)} ${f(y + oy)}l${f(Math.cos(a) * len)} ${f(Math.sin(a) * len)}`;
  }
  s += `<path d="${d}" stroke="${P.bark2}" stroke-width="${f(Math.max(0.3, w0 * 0.07))}" stroke-linecap="round" fill="none" opacity=".45"/>`;
  return s;
}
// a thin side twig ending at (x1, y1)
export const twig = (x0, y0, cx, cy, x1, y1, w = 1.4, fill = P.bark) => `<path d="${taper(quad2cub(x0, y0, cx, cy, x1, y1), w, w * 0.35, 8)}" fill="${fill}"/>`;

// a natural flower cluster around (x, y): leaves behind, blooms in a dome, buds at the rim. kinds cycles through the blooms.
export function cluster(x, y, s = 1, kinds = ['pk', 'pk', 'fr', 'jas'], { seed = 5, dir = 0, leaves = 4, buds = 3 } = {}) {
  const r = rng(seed);
  let o = '';
  for (let i = 0; i < leaves; i++) { const a = dir + 200 + (i / Math.max(1, leaves - 1)) * 140 + (r() - 0.5) * 20; o += use(i % 2 ? 'leafl' : 'leaf', Math.cos(a * Math.PI / 180) * 4, Math.sin(a * Math.PI / 180) * 4 + 3, 15 + r() * 4, a); }
  const pos = [[0, 0, 7.4], [-8.6, 2.4, 6.2], [8.4, 1.6, 6.4], [-3.6, -7.4, 5.8], [5, -7, 5.2], [-1, 6.4, 5]];
  const n = Math.min(pos.length, kinds.length + 1);
  for (let i = n - 1; i >= 0; i--) { const [px, py, rr] = pos[i], k = kinds[i % kinds.length]; o += use(k, px, py, k === 'jas' ? rr * 0.9 : k === 'mari' ? rr * 0.8 : rr, r() * 72); }
  for (let i = 0; i < buds; i++) { const a = dir - 90 + (i - (buds - 1) / 2) * 42 + (r() - 0.5) * 14, R = 10 + r() * 2; o += use(i % 2 ? 'jbud' : 'pkbud', Math.cos(a * Math.PI / 180) * R, Math.sin(a * Math.PI / 180) * R, 4.6, a + 90); }
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${o}</g>`;
}
// a carried sprig: stem along +x from the beak, two leaves, two pink blooms and a bud (for the groom); 'jas' variant for the bride
export function sprig(kind = 'pk') {
  let o = twig(0, 0, 8, -1, 16, -5, 1.1, P.twig2) + use('leaf', 5, -1, 8, -38) + use('leafl', 9, -2, 7, 28);
  if (kind === 'pk') o += use('pkbud', 17, -4, 4.4, 70) + use('pk', 15, -7, 5.4, 12) + use('pk', 10, -8.6, 4, 40);
  else o += use('jbud', 16, -4, 4, 60) + use('jas', 15, -7, 4.4, 10) + use('jbud', 11, -8, 3.6, 20);
  return o;
}

// ---------- the nest: back (cup and back rim) under the doves, front wall and jasmine rim over them ----------
// origin at the centre of the rim ellipse; w = width, d = depth (rim to bottom)
export function nestBack(w, d, { seed = 11 } = {}) {
  const r = rng(seed), rx = w / 2, ry = d * 0.3;
  let o = `<ellipse cx="0" cy="${f(d * 0.62)}" rx="${f(rx * 1.05)}" ry="${f(d * 0.42)}" fill="url(#rd-ao)"/>`;
  // back rim: a woven crescent above the cup
  o += `<path d="M${f(-rx - 2)} ${f(1)}C${f(-rx - 1)} ${f(-ry * 1.3)} ${f(rx + 1)} ${f(-ry * 1.3)} ${f(rx + 2)} 1C${f(rx * 0.6)} ${f(-ry * 0.9)} ${f(-rx * 0.6)} ${f(-ry * 0.9)} ${f(-rx - 2)} 1Z" fill="url(#rd-nestw)"/>`;
  for (let i = 0; i < 26; i++) {
    const a0 = Math.PI * (1 + r() * 0.75), a1 = a0 + Math.PI * (0.18 + r() * 0.2), k = 1 + r() * 0.35;
    const p0 = [Math.cos(a0) * rx * 1.02, Math.sin(a0) * ry * k * 1.05], p1 = [Math.cos(Math.min(a1, Math.PI * 2)) * rx * 1.02, Math.sin(Math.min(a1, Math.PI * 2)) * ry * k * 1.05];
    const mid = (a0 + Math.min(a1, Math.PI * 2)) / 2, cm = [Math.cos(mid) * rx * 1.08, Math.sin(mid) * ry * k * 1.3];
    o += `<path d="${taper(quad2cub(p0[0], p0[1], cm[0], cm[1], p1[0], p1[1]), 1.6 + r(), 0.6, 8)}" fill="${[P.twig1, P.twig2, '#B4936F'][i % 3]}"/>`;
  }
  // the cup is lined with dry grass and lit by a blush bounce; only a thin crescent under the back rim is dark
  o += `<ellipse cx="0" cy="${f(ry * 0.1)}" rx="${f(rx * 0.9)}" ry="${f(ry * 0.98)}" fill="url(#rd-cuplin)"/>`;
  o += `<path d="M${f(-rx * 0.88)} ${f(-ry * 0.05)}C${f(-rx * 0.6)} ${f(-ry * 0.95)} ${f(rx * 0.6)} ${f(-ry * 0.95)} ${f(rx * 0.88)} ${f(-ry * 0.05)}C${f(rx * 0.55)} ${f(-ry * 0.6)} ${f(-rx * 0.55)} ${f(-ry * 0.6)} ${f(-rx * 0.88)} ${f(-ry * 0.05)}Z" fill="${P.cup1}" opacity=".45"/>`;
  let gl = '';
  for (let i = 0; i < 10; i++) { const x0 = (r() - 0.5) * rx * 1.5, y0 = (r() - 0.2) * ry * 0.8; gl += `M${f(x0)} ${f(y0)}q${f(4 + r() * 6)} ${f(-1 - r() * 2)} ${f(9 + r() * 8)} ${f(r() * 2)}`; }
  o += `<path d="${gl}" stroke="#C9AE86" stroke-width=".5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  o += `<ellipse cx="0" cy="${f(ry * 0.35)}" rx="${f(rx * 0.62)}" ry="${f(ry * 0.55)}" fill="${P.blush}" opacity=".3"/>`;
  return o;
}
export function nestFront(w, d, { seed = 12, jas = 9, pink = true } = {}) {
  const r = rng(seed), rx = w / 2, ry = d * 0.3;
  // wall silhouette: front lip (lower half of the rim ellipse) down to a rounded bottom
  let o = `<path d="M${f(-rx - 2.5)} 0C${f(-rx * 0.92)} ${f(d * 0.8)} ${f(-rx * 0.35)} ${f(d * 1.02)} 0 ${f(d * 1.02)}C${f(rx * 0.35)} ${f(d * 1.02)} ${f(rx * 0.92)} ${f(d * 0.8)} ${f(rx + 2.5)} 0C${f(rx * 0.7)} ${f(ry * 1.4)} ${f(-rx * 0.7)} ${f(ry * 1.4)} ${f(-rx - 2.5)} 0Z" fill="url(#rd-nestw)"/>`;
  // woven twigs: arcs that follow the bowl, crossing slightly; darker deep in the weave, lighter near the lip
  const wall = (t, v) => { // t across (-1..1), v down (0 lip .. 1 bottom)
    const top = ry * Math.sqrt(Math.max(0, 1 - t * t)) * 0.95, bot = d * (0.98 - 0.55 * t * t);
    return [t * rx * (1 - v * 0.12), lerp(top, bot, v)];
  };
  const tones = ['#7A5C47', P.twig2, '#AE8D6C', P.twig1, '#D2B795'];
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < 14; i++) {
      const v = clamp(0.1 + r() * 0.85), t0 = -1.05 + r() * 1.2, t1 = t0 + 0.5 + r() * 0.7, tilt = (r() - 0.5) * 0.3;
      const a = wall(clamp(t0, -1, 1), clamp(v - tilt)), b = wall(clamp(t1, -1, 1), clamp(v + tilt)), m = wall(clamp((t0 + t1) / 2, -1, 1), clamp(v + 0.06));
      o += `<path d="${taper(quad2cub(a[0], a[1], m[0], m[1] + 1.2, b[0], b[1]), 1.1 + r() * 1.3, 0.5, 8)}" fill="${tones[clamp(Math.round(layer + r() * 2.2 - v * 1.6), 0, 4)]}"/>`;
    }
  }
  // dry grass wisps
  let g = '';
  for (let i = 0; i < 9; i++) { const v = 0.15 + r() * 0.7, t = -0.9 + r() * 1.8, a = wall(t, v), b = wall(clamp(t + 0.25 + r() * 0.2, -1, 1), clamp(v + 0.1)); g += `M${f(a[0])} ${f(a[1])}Q${f((a[0] + b[0]) / 2)} ${f((a[1] + b[1]) / 2 + 2)} ${f(b[0])} ${f(b[1])}`; }
  o += `<path d="${g}" stroke="${P.grass}" stroke-width=".55" fill="none" stroke-linecap="round" opacity=".9"/>`;
  // front lip: light twigs along the rim
  for (let i = 0; i < 7; i++) {
    const t0 = -1 + i * 0.27 + r() * 0.06, t1 = Math.min(1, t0 + 0.42), a = wall(t0, 0.02), b = wall(t1, 0.02), m = wall((t0 + t1) / 2, 0.1);
    o += `<path d="${taper(quad2cub(a[0], a[1], m[0], m[1], b[0], b[1]), 2.2, 1, 8)}" fill="${i % 2 ? P.twig1 : '#D5BC9C'}"/>`;
  }
  // shade under the lip where the cup turns in, and a warm bottom shade
  o += `<path d="M${f(-rx)} ${f(ry * 0.2)}C${f(-rx * 0.6)} ${f(ry * 1.9)} ${f(rx * 0.6)} ${f(ry * 1.9)} ${f(rx)} ${f(ry * 0.2)}C${f(rx * 0.6)} ${f(ry * 1.5)} ${f(-rx * 0.6)} ${f(ry * 1.5)} ${f(-rx)} ${f(ry * 0.2)}Z" fill="${P.bark2}" opacity=".18"/>`;
  // jasmine along the rim, pink-tipped buds between, and a pink bloom or two
  for (let i = 0; i < jas; i++) {
    const t = -0.92 + (i / (jas - 1)) * 1.84, [x, y] = wall(t, 0.05);
    o += i % 2 ? use('jbud', x, y + 0.5, 4.4, -70 + t * 40 + (r() - 0.5) * 30) : use('jas', x, y, 4.4 + r() * 0.8, r() * 60);
  }
  if (pink) { const [x1, y1] = wall(-0.78, 0.18), [x2, y2] = wall(0.7, 0.2); o += use('leaf', x1 - 2, y1 + 1, 9, 160) + use('pk', x1, y1, 5) + use('leafl', x2 + 2, y2 + 1, 8, 20) + use('pk', x2, y2, 4.6, 30); }
  return o;
}

// ---------- jasmine strings, ribbons, heart ----------
export function swagPts(x0, y0, x1, y1, sag, step = 3.2) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag * 2, q = (t) => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1];
  const pts = []; let acc = step, prev = q(0);
  for (let i = 1; i <= 120; i++) { const p = q(i / 120); acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]); if (acc >= step) { acc = 0; pts.push([p[0], p[1], Math.atan2(p[1] - prev[1], p[0] - prev[0]) * 180 / Math.PI]); } prev = p; }
  return pts;
}
// a tied jasmine string: buds in pairs across the thread, an open flower every few
export function jasString(x0, y0, x1, y1, sag, size = 1) {
  const pts = swagPts(x0, y0, x1, y1, sag, 3.1 * size);
  let o = `<path d="M${f(x0)} ${f(y0)}Q${f((x0 + x1) / 2)} ${f((y0 + y1) / 2 + sag * 2)} ${f(x1)} ${f(y1)}" stroke="#DCCFB8" stroke-width=".5" fill="none"/>`;
  pts.forEach(([x, y, a], i) => {
    if (i % 5 === 2) { o += use('jas', x, y + 0.6, 3.4 * size, i * 23); return; }
    o += use('jbud', x, y, 3.6 * size, a - 130 + (i % 2) * 8) + use('jbud', x, y, 3.6 * size, a + 130 - (i % 2) * 8);
  });
  return o;
}
// a short hanging strand (thoranam drop): buds down a thread, a marigold and a pink bloom at the end
export function strand(x, y, len, size = 1) {
  let o = `<path d="M${f(x)} ${f(y)}L${f(x)} ${f(y + len)}" stroke="#DCCFB8" stroke-width=".45"/>`;
  for (let v = 3; v < len - 2; v += 3.4 * size) { const k = Math.round(v / 3.4); o += k % 4 === 2 ? use('jas', x, y + v, 3 * size, k * 30) : use('jbud', x, y + v, 3.2 * size, 180 + (k % 2 ? 26 : -26)); }
  return o + use('mari', x, y + len + 2.4 * size, 3.8 * size) + use('pkbud', x, y + len + 6.4 * size, 3.6 * size, 180);
}
// satin ribbon from (x0, y0) down to (x1, y1) with a quarter twist, ending in a small bow
export function ribbon(x0, y0, x1, y1, w = 2.6, wave = 2) {
  const n = 18, L = [], R2 = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = lerp(x0, x1, t) + Math.sin(t * Math.PI * 1.6) * wave, y = lerp(y0, y1, t), hw = (w / 2) * (0.55 + 0.45 * Math.abs(Math.cos(t * Math.PI * 1.3)));
    L.push([x - hw, y]); R2.push([x + hw, y]);
  }
  return `<path d="M${L.map((p) => p.map(f).join(' ')).join('L')}L${R2.reverse().map((p) => p.map(f).join(' ')).join('L')}Z" fill="url(#rd-rib)"/>`;
}
export function bow(x, y, s = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><path d="M-.6 0C-3 4 -4.2 8 -3 11.6L-.6 9.8L1.4 11.4C1.2 7 .8 3.6 -.6 0Z" fill="${P.rib2}"/><path d="M.6 0C2.6 3.6 4.4 7.6 3.6 11L1.6 9.4L-.2 10.8C.2 6.6 0 3.4 .6 0Z" fill="url(#rd-rib)"/>`
    + `<path d="M0 0C-3.6 -4.6 -9 -4.2 -8.6 -.6C-8.2 2.6 -3.6 1.8 0 0Z" fill="url(#rd-rib)"/><path d="M0 0C3.6 -4.6 9 -4.2 8.6 -.6C8.2 2.6 3.6 1.8 0 0Z" fill="url(#rd-rib)"/>`
    + `<path d="M-1.4 -.6C-4 -2.6 -6.6 -2.4 -7.2 -1.2" stroke="${P.rib2}" stroke-width=".5" fill="none" opacity=".7"/><path d="M1.4 -.6C4 -2.6 6.6 -2.4 7.2 -1.2" stroke="${P.rib2}" stroke-width=".5" fill="none" opacity=".7"/><ellipse rx="1.9" ry="1.6" fill="${P.rib2}"/></g>`;
}
export const heart = (s = 1) => `<g transform="scale(${f(s)})"><path d="M0 7.4C-8.4 1.4 -11.8 -3 -11.8 -7.2A6.1 6.1 0 0 1 0 -9.4A6.1 6.1 0 0 1 11.8 -7.2C11.8 -3 8.4 1.4 0 7.4Z" fill="${P.gold}"/><path d="M0 6C-7.4 .8 -10.4 -3.2 -10.4 -6.9A5.3 5.3 0 0 1 0 -8.1A5.3 5.3 0 0 1 10.4 -6.9C10.4 -3.2 7.4 .8 0 6Z" fill="url(#rd-heart)"/><path d="M-6.4 -7.2C-4.6 -8.2 -2.6 -7.6 -1.6 -6" stroke="#FFF4F1" stroke-width="1" fill="none" stroke-linecap="round" opacity=".8"/></g>`;


// ---------- feather shapes (along +x, base at 0, tip at L) ----------
// round: 0 pointed .. 1 broad rounded tip; bend: tip y offset as a fraction of L
export function fth(L, w, round = 0.7, bend = 0) {
  const h = w / 2, b = bend * L, k = 0.55 + round * 0.3;
  return `M0 ${f(-h * 0.4)}C${f(L * 0.28)} ${f(-h * 1.02)} ${f(L * 0.62)} ${f(-h * 1.02 + b * 0.4)} ${f(L * 0.86)} ${f(-h * k + b * 0.85)}`
    + `C${f(L * (0.96 + round * 0.03))} ${f(-h * 0.5 * round + b)} ${f(L * (0.96 + round * 0.03))} ${f(h * 0.5 * round + b)} ${f(L * 0.86)} ${f(h * k + b * 0.85)}`
    + `C${f(L * 0.62)} ${f(h * 1.02 + b * 0.4)} ${f(L * 0.28)} ${f(h * 1.02)} 0 ${f(h * 0.4)}Z`;
}
// primary with an emarginated (narrowed) outer half: the fingered look of a spread wing
export function prim(L, w, em = 0, bend = -0.03) {
  const h = w / 2, b = bend * L, n = 1 - em * 0.42;
  return `M0 ${f(-h * 0.45)}C${f(L * 0.25)} ${f(-h)} ${f(L * 0.48)} ${f(-h + b * 0.3)} ${f(L * 0.58)} ${f(-h * (0.5 + 0.5 * n) + b * 0.45)}`
    + `C${f(L * 0.72)} ${f(-h * n + b * 0.6)} ${f(L * 0.9)} ${f(-h * n * 0.9 + b * 0.9)} ${f(L)} ${f(b)}`
    + `C${f(L * 0.9)} ${f(h * n * 0.95 + b * 0.9)} ${f(L * 0.72)} ${f(h * n + b * 0.6)} ${f(L * 0.58)} ${f(h * (0.5 + 0.5 * n) + b * 0.45)}`
    + `C${f(L * 0.48)} ${f(h + b * 0.3)} ${f(L * 0.25)} ${f(h)} 0 ${f(h * 0.45)}Z`;
}

// ---------- open-wing rig (leading edge along +x from the shoulder, feathers hang toward -y; angles in local degrees) ----------
// s: position along the arm (0 shoulder .. 1 wrist), L length, o open angle, c closed angle
const PRIM = [[1, 46, -5, -4, 0.9], [0.97, 53, -13, -5, 0.8], [0.93, 56, -21, -6.5, 0.6], [0.89, 56, -30, -8, 0.35], [0.84, 53, -39, -9.5, 0.1], [0.79, 50, -48, -11, 0], [0.74, 47, -56, -12.5, 0], [0.69, 44, -64, -14, 0], [0.64, 41, -71, -15.5, 0]].map(([s, L, o, c, em]) => ({ s, L, o, c, em }));
const SEC = [0.6, 0.53, 0.46, 0.39, 0.32, 0.25, 0.18, 0.11].map((s, i) => ({ s, L: 34 - i * 0.9, o: -79 - i * 3.6, c: -22 - i * 2.4 }));
const GC = [0.66, 0.6, 0.54, 0.48, 0.42, 0.36, 0.3, 0.24, 0.18, 0.12].map((s, i) => ({ s, L: 21 - i * 0.3, o: -76 - i * 4, c: -32 - i * 2.4 }));
const PC = [1, 0.94, 0.88, 0.82, 0.76, 0.7].map((s, i) => ({ s, L: 14 - i * 0.5, o: -10 - i * 11, c: -8 - i * 2 }));
const MC = [0.62, 0.55, 0.48, 0.41, 0.34, 0.27, 0.2, 0.13].map((s, i) => ({ s, L: 12.5, o: -68 - i * 5, c: -40 - i * 2 }));

// each feather is shaded base (dark, tucked under the row in front) to tip (light): rows separate by tone, never by an edge line
function buildOpenWing(parent, far) {
  const g = mk('g', { class: far ? 'rd-wing rd-far' : 'rd-wing' }, parent);
  const parts = [];
  const add = (spec, grad, shape) => spec.forEach((p) => { const e = mk('g', {}, g); mk('path', { d: shape(p), fill: `url(#${grad})` }, e); parts.push({ e, ...p }); });
  const G = (n, ff) => (far ? ff : n);
  add(SEC.slice().reverse(), G('rd-fs', 'rd-ffs'), (p) => fth(p.L, 13.5, 0.95, 0));
  add(PRIM.slice().reverse(), G('rd-fp', 'rd-ff'), (p) => prim(p.L, 11.6, p.em));
  add(GC.slice().reverse(), G('rd-fco', 'rd-ffs'), (p) => fth(p.L, 11, 0.9, 0));
  if (!far) {
    add(PC.slice().reverse(), 'rd-fco', (p) => fth(p.L, 7, 0.8, -0.02));
    add(MC.slice().reverse(), 'rd-fco', (p) => fth(p.L, 8.6, 0.95, 0));
  }
  const arm = mk('path', { d: '', fill: `url(#${far ? 'rd-ffs' : 'rd-arm'})` }, g);
  const alula = far ? null : mk('path', { d: fth(12, 4.6, 0.4, -0.04), fill: 'url(#rd-fc)' }, g);
  return { g, parts, arm, alula, far };
}

function setOpenWing(w, ang, fan, sx, sh) {
  const E = 44 * (0.72 + 0.28 * fan);
  setT(w.g, `translate(${sh[0]} ${sh[1]}) rotate(${f(ang)})${sx !== 1 ? ` scale(${f(sx)} 1)` : ''}`);
  if (Math.abs((w.__fan ?? -9) - fan) < 0.002) return;
  w.__fan = fan;
  for (const p of w.parts) p.e.setAttribute('transform', `translate(${f(p.s * E)} 0) rotate(${f(lerp(p.c, p.o, fan))})`);
  // the arm with marginal/lesser coverts: a band along the leading edge whose lower edge is scalloped
  let d = `M-6 -3.2C${f(E * 0.2)} -6.2 ${f(E * 0.66)} -5 ${f(E * 1.04)} -1.4C${f(E * 1.09)} .6 ${f(E * 1.02)} 2.4 ${f(E * 0.92)} 2.6`;
  const n = 7;
  for (let i = 0; i < n; i++) { const x0 = E * (0.92 - (i / n) * 0.96), x1 = E * (0.92 - ((i + 1) / n) * 0.96), y = 3.2 + i * 0.5; d += `Q${f((x0 + x1) / 2)} ${f(y + 4.4)} ${f(x1)} ${f(y)}`; }
  d += 'C-6 6 -8.6 -.4 -6 -3.2Z';
  w.arm.setAttribute('d', d);
  if (w.alula) w.alula.setAttribute('transform', `translate(${f(E * 0.93)} -1.4) rotate(${f(lerp(-8, -2, fan))})`);
}

// ---------- folded wing (static art in body coordinates, drawn back to front) ----------
function foldedWing() {
  const r = rng(19);
  let s = '';
  const F = (bx, by, a, L, w, grad, round = 0.85) => {
    a += (r() - 0.5) * 3; L *= 0.95 + r() * 0.1;
    return `<path d="${fth(L, w, round)}" fill="url(#${grad})" transform="translate(${f(bx)} ${f(by)}) rotate(${f(a)})"/>`;
  };
  // silhouette fill that closes every gap between feathers
  s += `<path d="M28 -19C14 -22 -6 -19 -28 -13C-42 -9 -54 -6.4 -63 -4.4C-55 -1.4 -44 1.6 -32 3.4C-16 5.6 4 7.6 16 5.6C25 3.6 29 -6 28 -19Z" fill="url(#rd-wingf-@)"/>`;
  // primaries: a pointed stack, longest lowest, lying over two thirds of the tail
  for (let i = 0; i < 5; i++) s += `<path d="${prim(55 - i * 5.4, 7.6 - i * 0.2, 0.6, -0.01)}" fill="url(#rd-fpf)" transform="translate(${f(-8 + i * 0.6)} ${f(-9.4 + i * 1.25)}) rotate(${f(176.4 + i * 1.3)})"/>`;
  // secondaries along the lower edge: their rounded tips make the scalloped trailing edge
  for (let i = 5; i >= 0; i--) s += F(11 - i * 5.2, -2.2 - i * 0.5, 165 + i * 2.2, 20.5 - i * 0.2, 10.4, 'rd-fs', 0.95);
  // tertials: three broad feathers over the primaries' bases
  for (let i = 0; i < 3; i++) s += F(-2 - i * 4.6, -9 - i * 1.5, 174 - i * 1.2, 22 + i * 4, 10 - i * 0.6, 'rd-fs', 0.8);
  // greater coverts, then median, then lesser: rounded scales that get smaller toward the shoulder
  for (let i = 6; i >= 0; i--) s += F(21 - i * 4.3, -7.6 - i * 0.45, 160 + i * 2.6, 11.6 + i * 0.75, 8 + i * 0.25, 'rd-fg', 0.95);
  for (let i = 5; i >= 0; i--) s += F(23.4 - i * 4.1, -11.4 - i * 0.42, 157 + i * 3, 7.6 + i * 0.6, 6 + i * 0.25, 'rd-fc', 0.98);
  for (let j = 1; j >= 0; j--) for (let i = 4; i >= 0; i--) s += F(25.4 - i * 3.8 - j * 1.8, -14.6 + j * 1.7 - i * 0.35, 152 + i * 3, 4.6 + i * 0.45, 4 + i * 0.25, 'rd-fc', 1);
  // scapulars: long soft feathers from the back lying over the wing's upper edge
  for (let i = 4; i >= 0; i--) s += F(24 - i * 6.4, -19 + i * 1.3, 172 + i * 1.6, 12 + i * 1.6, 10.4, 'rd-fsc', 0.98);
  // light across the top of the wing, and the pocket shadow where it tucks under the breast feathers
  s += `<path d="M26 -19C10 -20 -10 -16 -30 -10C-14 -12 6 -14 24 -14Z" fill="url(#rd-hl)" opacity=".6"/>`;
  s += `<ellipse cx="24" cy="-1" rx="5" ry="12" transform="rotate(20 24 -1)" fill="url(#rd-pocket)"/>`;
  return s;
}

// ---------- the bird ----------
const TAIL = [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ k, L: 40 - Math.abs(k) * 1.6 }));
const setT = (el, v) => { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } };
const setO = (el, v) => { if (!el) return; const o = String(f(v)); if (el.__o !== o) { el.__o = o; el.style.opacity = o; el.style.visibility = v < 0.01 ? 'hidden' : 'visible'; } };

// body: the back slopes in one line from the nape to the tail; the breast swells forward and low; under-tail coverts run into the belly
const TORSO = 'M27 -31C19 -25 4 -21 -12 -15.6C-22 -12.4 -31 -9 -39 -6L-42 0C-40 3.4 -36 6 -30 8.4C-18 13.6 -4 18.6 10 19.4C24 19.6 36 13 42.4 2.4C45.2 -3.6 45.4 -10.4 43.4 -16.4C41.2 -22.4 37 -27.6 31.4 -31C30 -31.8 28.4 -31.8 27 -31Z';
const SIT_TORSO = 'M27 -31C18 -26.4 2 -23.6 -14 -20C-26 -17 -34 -13 -38.4 -7C-41.4 -1 -38.6 5.6 -30 9.6C-18 15.6 -2 19.6 12 19.8C26 19.8 37 13 42.4 2.4C45.2 -3.6 45.4 -10.4 43.4 -16.4C41.2 -22.4 37 -27.6 31.4 -31C30 -31.8 28.4 -31.8 27 -31Z';
const BREAST = 'M37.6 -26C42.4 -20 45.6 -10.4 44.4 -1.6C42.6 9 34 16.4 22.4 19.2C16 20.6 9.6 20.6 4.6 19.6C12 15.6 18 9.6 21.6 2.4C25 -4.6 27.2 -11.6 29.4 -17.6C31 -22 34 -25.6 37.6 -26Z';
// head and neck as one piece: small round head, the throat pinches in under the chin, the neck flows down into the body
const NECK = 'M44.2 -37.6C44.5 -41.8 41.2 -45 36.8 -45C32.2 -45 29.2 -42 29 -38C28.8 -34.8 27.8 -32 25.8 -28.6C22.6 -23.6 19.6 -17 20 -8L35 -5C40.4 -9 41.8 -16 40.2 -22C39.4 -25.4 39.2 -28.6 40.6 -31.2C41.6 -33 43.4 -34.2 43.9 -35.4C44.2 -36.1 44.2 -36.9 44.2 -37.6Z';
const BEAK = [49.8, -35.4];

export function createDove(parent, { x = 0, y = 0, s = 1, flip = false, bride = false, carry = null, tq = 1 } = {}) {
  ensureDefs();
  const side = flip ? 'r' : 'l';
  const root = mk('g', { class: bride ? 'rd-dove rd-bride' : 'rd-dove' }, parent);
  const pos = mk('g', {}, root);
  const body = mk('g', {}, pos); // pitch, bob, breath
  const trunk = mk('g', {}, body); // sitting roundness
  const farHost = mk('g', {}, trunk); // open wings are built only when the bird first spreads them
  const foldFar = mk('g', {}, trunk);
  foldFar.innerHTML = `<path d="${prim(46, 7, 0.5, 0.01)}" fill="url(#rd-ff)" transform="translate(-12 -11.6) rotate(176.6)"/><path d="${prim(41, 6.4, 0.5, 0.01)}" fill="url(#rd-ffs)" transform="translate(-14 -10.6) rotate(177.4)"/>`;
  const tail = mk('g', {}, trunk);
  const tparts = TAIL.map((p) => { const e = mk('g', {}, tail); mk('path', { d: fth(p.L, 9.6, 0.7), fill: 'url(#rd-ft)' }, e); return { e, ...p }; });
  tparts.slice().sort((a, b) => Math.abs(b.k) - Math.abs(a.k)).forEach((p) => tail.appendChild(p.e));
  // a soft lighter centre so the closed tail reads as one narrow, slightly rounded fan with no line
  mk('path', { d: fth(36, 4.6, 0.8), fill: 'url(#rd-ftc)' }, tail);
  // legs and feet (perched only): coral, scaled, toes curled round the perch line at y ~ 27
  const legs = mk('g', {}, trunk);
  const foot = (x, dark) => `<g${dark ? ' opacity=".75"' : ''}><path d="${taper(quad2cub(x + 1, 15, x + 0.6, 21, x, 26), 3, 2.1, 6)}" fill="url(#rd-foot)"/>`
    + `<path d="${taper(quad2cub(x, 26, x + 5, 25.4, x + 9, 27.6), 1.9, 0.9, 6)}" fill="url(#rd-foot)"/><path d="${taper(quad2cub(x, 26.4, x + 3.6, 27.4, x + 6.4, 29.6), 1.8, 0.9, 6)}" fill="url(#rd-foot)"/>`
    + `<path d="${taper(quad2cub(x, 26.2, x - 3.4, 26, x - 5.6, 27.8), 1.8, 0.9, 6)}" fill="url(#rd-foot)"/>`
    + `<path d="M${f(x + 9)} 27.6l.8 .8M${f(x + 6.4)} 29.6l.5 .9M${f(x - 5.6)} 27.8l-.6 .9" stroke="#8A6F6A" stroke-width=".7" stroke-linecap="round"/></g>`;
  legs.innerHTML = foot(2, true) + foot(9, false);
  const torso = mk('g', {}, trunk);
  torso.innerHTML = `<g><path d="${TORSO}" fill="url(#rd-skin-${side})"/><path d="${TORSO}" fill="url(#rd-bounce-u)"/>`
    + `<ellipse cx="-30" cy="5" rx="10" ry="3.2" transform="rotate(-14 -30 5)" fill="url(#rd-shade)" opacity=".7"/></g>`
    + `<g><path d="${SIT_TORSO}" fill="url(#rd-skin-${side})"/><path d="${SIT_TORSO}" fill="url(#rd-bounce-u)"/></g>`;
  const foldW = mk('g', {}, trunk);
  foldW.innerHTML = foldedWing().replace('@', side);
  const nearHost = mk('g', {}, trunk);
  const breast = mk('g', {}, trunk);
  breast.innerHTML = `<path d="${BREAST}" fill="url(#rd-skin-${side})"/><path d="${BREAST}" fill="url(#rd-bounce-u)"/>`
    + `<ellipse cx="38" cy="-12" rx="5" ry="9" fill="url(#rd-hl)" opacity=".5"/>`
    // mantle: the back feathers run from the nape over the shoulder of the wing, so the wing has no step at the neck
    + `<path d="M29 -31.4C22 -27 14 -23.4 6 -21.4C10 -18.4 16 -17.4 22 -18.6C26 -20 28.6 -23.4 30.4 -27Z" fill="url(#rd-skin-${side})"/>`;
  // head and neck: one long neck piece reaching into the body, so a bow or a nuzzle never shows a seam
  const head = mk('g', {}, body);
  head.innerHTML = `<path d="${NECK}" fill="url(#rd-skin-${side})"/><path d="${NECK}" fill="url(#rd-bounce-u)"/>`
    + `<ellipse cx="35" cy="-41" rx="5.6" ry="3" fill="url(#rd-hl)"/><ellipse cx="37.6" cy="-28" rx="3.6" ry="2.4" fill="url(#rd-shade)" opacity=".75"/>`
    // bill: slim, starting a little below the eye line, a faint droop at the tip; the cere is a soft powdery swelling
    + `<path d="M43.4 -37.8C45.6 -38 47.8 -37.3 49.6 -36.1C50.1 -35.8 50.1 -35.3 49.6 -35.2C47.6 -35.3 45.5 -35.6 43.4 -35.9Z" fill="url(#rd-bill)"/>`
    + `<path d="M43.5 -35.9C45.4 -35.6 47.2 -35.4 48.8 -35.3C47.2 -34.6 45.4 -34.4 43.7 -34.8Z" fill="url(#rd-billlo)"/>`
    + `<ellipse cx="44.9" cy="-37.6" rx="2.1" ry="1.25" transform="rotate(10 44.9 -37.6)" fill="url(#rd-cere)"/>`
    // eye: narrow pale pinkish-grey ring, dark iris, a catch-light
    + `<ellipse cx="39.1" cy="-38.7" rx="2.35" ry="2.25" fill="${P.ring}"/><circle cx="39.25" cy="-38.75" r="1.6" fill="url(#rd-iris)"/>`
    + `<circle cx="39.8" cy="-39.35" r=".5" fill="${P.hi}"/><circle cx="38.8" cy="-38.1" r=".25" fill="${P.hi}" opacity=".5"/>`
    + (bride ? `<ellipse cx="28" cy="-37" rx="3" ry="7" transform="rotate(20 28 -37)" fill="url(#rd-shade)"/><path d="M31.4 -45C29.6 -42 28 -38 26.4 -32.4" stroke="#8DB59F" stroke-width=".5" fill="none"/>`
      + use('jbud', 30, -42.4, 4.4, 200) + use('jbud', 28.6, -38.6, 4.6, 204) + use('jbud', 27.4, -34.8, 4.6, 208) + use('jbud', 26.4, -31, 4.2, 212) + use('pk', 31.2, -45.4, 4.2, 12) + use('pkbud', 33.6, -46.4, 3, 60) : '');
  const carryG = mk('g', { transform: `translate(${BEAK[0] - 0.4} ${BEAK[1] + 0.2})` }, head);
  if (carry) carryG.innerHTML = carry;
  const beakPt = mk('circle', { cx: BEAK[0], cy: BEAK[1], r: 0, fill: 'none' }, head);
  const d = { tq, root, pos, body, trunk, farHost, nearHost, farW: null, nearW: null, foldFar, tail, tparts, legs, torso, foldW, breast, head, carryG, beakPt, x, y, s, flip, p: {} };
  place(d, x, y, s, flip);
  pose(d, POSES.perch);
  return d;
}

export function place(d, x, y, s, flip) {
  Object.assign(d, { x, y, s, flip });
  setT(d.pos, `translate(${f(x)} ${f(y)}) scale(${f((flip ? -s : s) * (d.tq || 1))} ${f(s)})`);
}

// p: wing (near leading-edge angle, deg), fan 0..1, far (offset deg), tail 0..1 spread, tailUp (deg), pitch, head (bow deg),
// neck (reach, units), rise (lift of the head, units), breath 0..1, legs 0..1, bob, sit 0..1
export function pose(d, p) {
  p = Object.assign(d.p, p);
  const fold = clamp((0.3 - p.fan) / 0.24) * clamp((-p.wing - 160) / 24);
  if (fold < 0.999 && !d.nearW) { d.farW = buildOpenWing(d.farHost, true); d.nearW = buildOpenWing(d.nearHost, false); }
  if (d.nearW) {
    setOpenWing(d.nearW, p.wing, p.fan, 1, [17, -15]);
    setOpenWing(d.farW, p.wing + 8 + (p.far || 0), Math.min(1, p.fan * 0.95), 0.8, [25, -23]);
  }
  setO(d.nearW?.g, 1 - fold); setO(d.farW?.g, 1 - fold); setO(d.foldW, fold); setO(d.foldFar, fold);
  const sp = 1.2 + 7.4 * p.tail;
  if (Math.abs((d.__tf ?? -9) - sp) >= 0.01) { d.__tf = sp; for (const t of d.tparts) t.e.setAttribute('transform', `rotate(${f(t.k * sp)})`); }
  const sit = p.sit || 0;
  // sitting: a low, rounded teardrop, a short tail tilted up, the folded wing tips crossing over it
  setO(d.torso.firstChild, 1 - clamp(sit * 2 - 0.6)); setO(d.torso.lastChild, clamp(sit * 2 - 0.6));
  setT(d.tail, `translate(${f(-38 + 3 * sit)} ${f(1 - 6 * sit)}) rotate(${f(180 + (p.tailUp || 0) + sit * 30)}) scale(${f(1 - 0.38 * sit)} ${f(1 - 0.08 * sit)})`);
  setT(d.trunk, sit ? `translate(${f(3 * sit)} ${f(1 * sit)}) scale(${f(1 - 0.22 * sit)} ${f(1 + 0.03 * sit)})` : '');
  const wt = sit ? `rotate(${f(7 * sit)} 24 -10)` : '';
  setT(d.foldW, wt); setT(d.foldFar, wt);
  const nk = p.neck || 0, rise = p.rise || 0;
  setT(d.head, `translate(${f(nk - 3 * sit)} ${f(nk * 0.35 + 2 * sit - rise)}) rotate(${f(p.head || 0)} 26 -16)`);
  const br = 1 + (p.breath || 0) * 0.02;
  setT(d.body, `translate(0 ${f(p.bob || 0)}) rotate(${f(p.pitch || 0)}) scale(${f(br)} ${f(2 - br)})`);
  setO(d.legs, (p.legs || 0) * (1 - sit));
  return d;
}

// fold a bird's open wings away for good once it has landed (keeps the DOM light)
export function dropOpenWings(d) {
  if (!d.nearW) return;
  d.nearW.g.remove(); d.farW.g.remove(); d.nearW = d.farW = null;
}

// beak tip in the coordinates of the owning svg
export function beak(d) {
  const m = d.beakPt.getCTM(), r = d.root.ownerSVGElement.getCTM();
  const pt = new DOMPoint(BEAK[0], BEAK[1]).matrixTransform(m);
  return r ? pt.matrixTransform(r.inverse()) : pt;
}

export const POSES = {
  hover: { wing: -98, fan: 0.94, far: -6, tail: 0.75, tailUp: 6, pitch: -8, head: 4, neck: 0, rise: 0, breath: 0, legs: 0, bob: 0, sit: 0 },
  up: { wing: -84, fan: 1, far: -4, tail: 0.85, tailUp: 8, pitch: -10, head: 2, legs: 0 },
  down: { wing: -222, fan: 0.86, far: 10, tail: 0.7, tailUp: 2, pitch: -2, head: 0, legs: 0 },
  glide: { wing: -150, fan: 1, far: -10, tail: 0.95, tailUp: 0, pitch: 2, head: -2, legs: 0, sit: 0 },
  flare: { wing: -92, fan: 1, far: -4, tail: 1, tailUp: -10, pitch: -16, head: -6, legs: 1 },
  perch: { wing: -194, fan: 0, far: 0, tail: 0.08, tailUp: -6, pitch: -8, head: 0, neck: 0, rise: 0, breath: 0, legs: 1, bob: 0, sit: 0 },
  bow: { wing: -194, fan: 0, tail: 0.12, tailUp: -2, pitch: 4, head: 18, legs: 1 },
  sit: { wing: -194, fan: 0, far: 0, tail: 0.04, tailUp: 0, pitch: -7, head: 0, neck: 0, rise: 0, breath: 0, legs: 0, bob: 0, sit: 1 },
  nuzzle: { wing: -194, fan: 0, tail: 0.04, tailUp: 0, pitch: -6, head: 16, neck: 4, rise: 5, legs: 0, sit: 1 },
};
