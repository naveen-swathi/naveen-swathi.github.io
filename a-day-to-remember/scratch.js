const $ = (s) => document.querySelector(s);

export function initScratch({ gsap, RM, onReveal, onTouch }) {
  const wrap = $('#scratch');
  const cv = $('#foil');
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const finger = $('#finger');
  const BRUSH = 38;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let done = false;
  let touched = false;

  function paintFoil() {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = wrap.clientWidth;
    h = wrap.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(0, 0, w, h);
    ['#a87a25', '#ecd28a', '#c99a3b', '#f4e0a0', '#b88a2e', '#e3c273', '#9a7222'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 420; i++) {
      const y = rnd() * h;
      const x = rnd() * w;
      ctx.strokeStyle = rnd() > 0.5 ? `rgba(255,245,210,${0.03 + rnd() * 0.07})` : `rgba(90,58,10,${0.03 + rnd() * 0.06})`;
      ctx.lineWidth = 0.6 + rnd();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20 + rnd() * 90, y + (rnd() - 0.5) * 3);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,244,204,.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(6.5, 6.5, w - 13, h - 13);
    ctx.strokeStyle = 'rgba(100,68,12,.5)';
    ctx.strokeRect(10.5, 10.5, w - 21, h - 21);
    ctx.strokeStyle = '#000';
  }

  const line = (a, b) => {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = BRUSH;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  function clearedFraction() {
    const { data, width, height } = ctx.getImageData(0, 0, cv.width, cv.height);
    const step = Math.max(4, Math.round(8 * dpr));
    let n = 0;
    let c = 0;
    for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) { n++; if (data[(y * width + x) * 4 + 3] < 128) c++; }
    return c / n;
  }

  function finish() {
    if (done) return;
    done = true;
    wrap.classList.add('revealed');
    const rc = $('#reveal-card');
    if (document.activeElement === $('#tap-reveal')) rc.focus({ preventScroll: true });
    $('#tap-reveal').disabled = true;
    const hide = () => { cv.style.display = 'none'; };
    gsap.to(['#hint', '#tap-reveal'], { opacity: 0, duration: 0.8, ease: 'power2.out' });
    if (RM) hide(); else gsap.to(cv, { opacity: 0, duration: 1.2, ease: 'power2.inOut', onComplete: hide });
    onReveal?.();
  }

  const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  let last = null;
  let moved = 0;
  let t0 = 0;
  let lastCheck = 0;
  cv.addEventListener('pointerdown', (e) => {
    if (done) return;
    cv.setPointerCapture(e.pointerId);
    last = pt(e);
    moved = 0;
    t0 = performance.now();
    touched = true;
    onTouch?.('down');
  });
  cv.addEventListener('pointermove', (e) => {
    if (!last || done) return;
    const p = pt(e);
    moved += Math.hypot(p.x - last.x, p.y - last.y);
    line(last, p);
    last = p;
    const now = performance.now();
    if (now - lastCheck > 150) { lastCheck = now; if (clearedFraction() > 0.4) finish(); }
  });
  const up = (e) => {
    if (!last) return;
    last = null;
    onTouch?.('up');
    if (e?.type === 'pointercancel') return;
    if (moved < 8 && performance.now() - t0 < 600) finish();
    else if (clearedFraction() > 0.4) finish();
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  $('#tap-reveal').addEventListener('click', finish);

  function auto(seconds) {
    return new Promise((resolve) => {
      if (done) { resolve(); return; }
      onTouch?.('down');
      const rows = 6;
      const pts = [];
      for (let i = 0; i < rows; i++) {
        const y = h * (0.1 + (0.8 * i) / (rows - 1));
        const xs = [w * 0.07, w * 0.93];
        if (i % 2) xs.reverse();
        pts.push({ x: xs[0], y }, { x: xs[1], y });
      }
      const lens = [0];
      for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
      const total = lens.at(-1);
      const at = (p) => {
        const d = p * total;
        let i = 1;
        while (i < lens.length - 1 && lens[i] < d) i++;
        const f = (d - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
        return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f };
      };
      const proxy = { p: 0 };
      let prev = at(0);
      gsap.set(finger, { x: prev.x, y: prev.y });
      gsap.to(finger, { opacity: 1, duration: 0.4 });
      gsap.to(proxy, {
        p: 1, duration: seconds, ease: 'sine.inOut',
        onUpdate: () => {
          const cur = at(proxy.p);
          line(prev, cur);
          prev = cur;
          gsap.set(finger, { x: cur.x, y: cur.y });
        },
        onComplete: () => { gsap.to(finger, { opacity: 0, duration: 0.3 }); finish(); resolve(); },
      });
    });
  }

  document.fonts?.ready.then(() => { if (!touched && !done) paintFoil(); });
  paintFoil();
  addEventListener('resize', () => { if (!touched && !done) paintFoil(); });
  return { auto, finish, get done() { return done; } };
}
