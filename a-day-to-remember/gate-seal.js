const $ = (s, r = document) => r.querySelector(s);
const F_END = 92;

export function initGate({ gsap, RM, AUTO, pages }) {
  const gate = $('#gate');
  const grp = $('.s-grp');
  const seal = $('.seal');
  const disc = $('.s-disc');
  const draw = $('.s-draw');
  const ghost = $('.s-ghost');
  const foil = $('.foil');
  const foilFill = $('.foil b');
  const logo = [...document.querySelectorAll('[data-seal-target]')].find((e) => e.getClientRects().length);
  const phone = $('#phone');
  const body = document.body;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = new URL('img/seal-600.webp', import.meta.url).href;
  const ready = img.decode ? img.decode().catch(() => {}) : new Promise((res) => { img.onload = res; img.onerror = res; });

  addEventListener('keydown', () => gate.classList.add('kb'), { once: true });

  const fitRing = () => {
    const rg = $('.s-ring');
    if (!rg) return removeEventListener('resize', fitRing);
    const w = rg.getBoundingClientRect().width || 260;
    draw.style.strokeWidth = ((260 / w) * 1.1).toFixed(2);
  };
  fitRing();
  addEventListener('resize', fitRing);

  const stopIdle = () => { gate.classList.add('go'); };

  let started = false;
  let finished = false;
  let tl = null;
  const startPages = () => {
    if (started) return;
    started = true;
    body.classList.add('s-frame');
    pages.start();
  };

  const setFlood = (v) => seal.style.setProperty('--f', `${v}%`);
  const flood = { v: -10 };
  const rise = { p: 0 };
  const up = { s: 1 };
  let from = null;

  const place = () => {
    const t = logo.getBoundingClientRect();
    const dx = t.left + t.width / 2 - (from.left + from.width / 2);
    const dy = t.top + t.height / 2 - (from.top + from.height / 2);
    const s = t.width / from.width;
    const p = rise.p;
    gsap.set(grp, { x: dx * p, y: dy * p, scale: (1 + (s - 1) * p) * up.s, transformOrigin: '50% 50%' });
  };

  function build(done, tap) {
    tl = gsap.timeline({ paused: true, onComplete: () => { finished = true; done(); } });
    gsap.set(draw, { drawSVG: '0% 0%' });
    tl.to('.g-open', { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0)
      .set(draw, { opacity: 1 }, 0.2)
      .fromTo(draw, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.1, ease: 'sine.inOut' }, 0.2)
      .to(draw, { stroke: getComputedStyle(document.documentElement).getPropertyValue('--hair-c').trim() || 'rgba(180,138,60,.55)', duration: 0.4 }, 1.3)
      .to('.seal .base, .seal .hi, .seal .sh', { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.2)
      .fromTo('.seal .base', { scale: 1.012 }, { scale: 1, duration: 1.1, ease: 'power2.out' }, 0.2)
      .fromTo('.seal .hi', { x: 0, y: 0 }, { x: -1.5, y: -1.5, duration: 1.1, ease: 'power2.out' }, 0.2)
      .fromTo('.seal .sh', { x: 0, y: 0 }, { x: 1.5, y: 1.5, duration: 1.1, ease: 'power2.out' }, 0.2)
      .add(() => { if (tap) navigator.vibrate?.(12); }, 1.3);
    tl.fromTo('.s-press', { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'power2.out' }, 0.2)
      .to('.s-press', { opacity: 0, duration: 0.6, ease: 'power1.out' }, 0.4)
      .fromTo('.s-ripple', { scale: 1, opacity: 0.55 }, { scale: 1.18, opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, 1.3);
    tl.set(foil, { opacity: 1 }, 1.3)
      .set('.melt', { opacity: 0.55 }, 1.3)
      .to('.melt', { opacity: 0, duration: 0.2, ease: 'power1.in' }, 1.95)
      .to(flood, { v: F_END, duration: 0.8, ease: 'power1.inOut', onUpdate: () => setFlood(flood.v) }, 1.3)
      .fromTo(foilFill, { backgroundPosition: '100% 0%' }, { backgroundPosition: '0% 0%', duration: 0.6, ease: 'power1.inOut' }, 1.7)
      .add(() => {
        from = seal.getBoundingClientRect();
        const g = gate.getBoundingClientRect();
        gsap.set(ghost, { left: from.left - g.left, top: from.top - g.top, width: from.width, height: from.height });
      }, 2.8)
      .set(ghost, { opacity: 0.55 }, 2.8)
      .to(ghost, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 2.85)
      .to('.lift', { opacity: 1, x: 1, y: 3, duration: 0.25, ease: 'power2.out' }, 2.8)
      .to('.lift', { opacity: 0, duration: 0.5, ease: 'power1.in' }, 3.2)
      .to(up, { keyframes: [{ s: 1.03, duration: 0.25, ease: 'power2.out' }, { s: 1, duration: 0.25, ease: 'power1.inOut' }] }, 2.8)
      .to(rise, { p: 1, duration: 1.1, ease: 'power3.inOut', onUpdate: place }, 2.8)
      .to(disc, { opacity: 0, duration: 0.8, ease: 'power1.in' }, 2.8)
      .to('.s-light', { opacity: 0, duration: 1.1, ease: 'power1.inOut' }, 2.8)
      .fromTo(phone, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 2.9)
      .add(startPages, 2.6)
      .to('.g-skip', { opacity: 0, duration: 0.3 }, 2.8)
      .to(logo, { opacity: 1, duration: 0.15, ease: 'none' }, 3.78)
      .to(grp, { opacity: 0, duration: 0.12, ease: 'none' }, 3.88)
      .add(() => {}, 4.0);
  }

  return {
    ready,
    play(done, { tap = false } = {}) {
      if (RM) {
        gsap.to(gate, { opacity: 0, duration: 0.7 });
        gsap.fromTo(phone, { opacity: 0 }, { opacity: 1, duration: 0.7, onComplete: () => { finished = true; done(); } });
        body.classList.add('s-frame');
        return;
      }
      stopIdle();
      build(done, tap);
      addEventListener('resize', () => { if (!finished && tl && tl.time() >= 2.8) this.skip(done); });
      Promise.race([ready, new Promise((res) => setTimeout(res, 1200))]).then(() => { if (!finished && tl) tl.play(0); });
    },
    skip(done) {
      if (RM || finished) return;
      finished = true;
      stopIdle();
      tl?.kill();
      startPages();
      gsap.to(logo, { opacity: 1, duration: 0.35 });
      gsap.fromTo(phone, { opacity: gsap.getProperty(phone, 'opacity') }, { opacity: 1, duration: 0.35 });
      gsap.to(gate, { opacity: 0, duration: 0.35, onComplete: done });
    },
  };
}
