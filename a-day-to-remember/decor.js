export function heartPath() {
  return 'M12 21.2C5.6 15.9 2 12.4 2 8.2 2 5.2 4.3 3 7.1 3c1.9 0 3.6 1 4.9 2.7C13.3 4 15 3 16.9 3 19.7 3 22 5.2 22 8.2c0 4.2-3.6 7.7-10 13z';
}

function kolamPath(m, n, P) {
  const pts = [];
  let x = 1, y = 0, dx = 1, dy = 1;
  do {
    pts.push([x, y]);
    x += dx; y += dy;
    if (x === -1 || x === 2 * m - 1) dx = -dx;
    if (y === -1 || y === 2 * n - 1) dy = -dy;
  } while (x !== 1 || y !== 0 || dx !== 1 || dy !== 1);
  if (pts.length !== 4 * m * n) throw new Error(`kolam ${m}x${n} is not a single line`);
  const o = 0.14;
  const q = pts.map(([a, b]) => {
    const px = a === -1 ? -0.5 - o : a === 2 * m - 1 ? m - 0.5 + o : a / 2;
    const py = b === -1 ? -0.5 - o : b === 2 * n - 1 ? n - 0.5 + o : b / 2;
    return [px * P, py * P];
  });
  const f = (v) => +v.toFixed(2);
  const L = q.length;
  let d = `M${f(q[0][0])} ${f(q[0][1])}`;
  for (let i = 0; i < L; i++) {
    const p0 = q[(i + L - 1) % L], p1 = q[i], p2 = q[(i + 1) % L], p3 = q[(i + 2) % L];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  const cx = (m - 1) * P / 2, cy = (n - 1) * P / 2;
  const dots = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) dots.push([i * P, j * P]);
  dots.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy));
  return { d: `${d}Z`, dots: dots.map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.5"/>`).join('') };
}

function kolamMarkup(m, n, c) {
  const P = 20;
  const { d, dots } = kolamPath(m, n, P);
  return `<svg viewBox="${-P / 2 - 6} ${-P / 2 - 6} ${m * P + 12} ${n * P + 12}" aria-hidden="true"><path class="${c}-line" pathLength="1" d="${d}"/><path class="${c}-glint" pathLength="1" d="${d}"/><g class="${c}-dots">${dots}</g></svg>`;
}

export const knotSVG = () => kolamMarkup(2, 1, 'tk');
