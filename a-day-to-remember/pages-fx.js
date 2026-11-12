const $ = (s, r = document) => r.querySelector(s);
const rise = (gsap, els, extra = {}) => gsap.fromTo(els, { yPercent: 108, opacity: 0, filter: 'blur(5px)' },
  { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', clearProps: 'filter', ...extra });
const once = (el, name, fn) => el.addEventListener(name, fn, { once: true });

export function initDate({ gsap, RM, scratch, blossoms, gilt }) {
  const sec = $('#date');
  const card = $('.scratch');
  let sway = null;
  let touched = false;
  let reveal = null;
  const startSway = (amp = 0.6, half = 2.6) => {
    sway?.kill();
    sway = gsap.timeline()
      .to(card, { rotation: -amp, duration: 0.5, ease: 'sine.out' })
      .to(card, { rotation: amp, duration: half, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  };
  if (!RM) {
    sec.addEventListener('pg:rest', () => {
      if (scratch.done) { if (!reveal) gsap.delayedCall(0.3, () => { if (sec.classList.contains('live') && !reveal) startSway(0.4, 3); }); return; }
      if (!touched) gsap.delayedCall(0.3, () => { if (!scratch.done && !touched) startSway(); });
    });
    sec.addEventListener('pg:leave', () => { sway?.kill(); reveal?.kill(); reveal = null; gsap.set(card, { rotation: 0 }); });
  }
  return {
    onTouch(state) {
      if (RM || scratch.done) return;
      if (state === 'down') { touched = true; sway?.kill(); gsap.to(card, { rotation: 0, duration: 0.2, overwrite: true }); }
      else { touched = false; gsap.delayedCall(0.6, () => { if (!scratch.done && !touched) startSway(); }); }
    },
    onReveal() {
      if (RM) return;
      sway?.kill();
      reveal = gsap.timeline({ onComplete: () => { reveal = null; startSway(0.4, 3); } })
        .to(card, { rotation: 2.4, duration: 0.25, ease: 'sine.inOut', overwrite: true })
        .to(card, { rotation: -1.6, duration: 0.5, ease: 'sine.inOut' })
        .to(card, { rotation: 1, duration: 0.45, ease: 'sine.inOut' })
        .to(card, { rotation: -0.5, duration: 0.4, ease: 'sine.inOut' })
        .to(card, { rotation: 0, duration: 0.5, ease: 'sine.inOut' });
      gsap.delayedCall(0.2, () => gilt('.rv-day'));
      gsap.delayedCall(0.3, () => { blossoms.burst(26, { window: 1.4 }); blossoms.setTarget(8); });
      rise(gsap, '#after .li', { delay: 1 });
    },
  };
}

export function initBlessings({ gsap, RM, VIDEO, deepams, blossoms }) {
  const sec = $('#blessings');
  const row = $('.lamps', sec);
  const lamps = [...sec.querySelectorAll('.lamp')];
  const dps = lamps.map((l) => $('.dp', l));
  const lit = Array(5).fill(false);
  const wm = $('.wm-wrap', sec);
  const pulli = [...sec.querySelectorAll('.lk-p')];
  let all = false;
  let lastTouch = -9999;
  let auto = null;
  const mark = (i) => { lamps[i].setAttribute('aria-pressed', 'true'); lamps[i].setAttribute('aria-label', `Lamp ${i + 1} of 5, lit`); };
  if (RM) { lamps.forEach((_, i) => { lit[i] = true; mark(i); }); return; }
  const hint = $('.bl-hint', sec);
  gsap.set(lamps, { opacity: 0, y: 6 });
  wm?.classList.add('turn');

  function complete() {
    all = true;
    gsap.to($('.pool', sec), { opacity: 1, duration: 1.2, ease: 'power1.inOut' });
    gsap.to(hint, { yPercent: -108, opacity: 0, duration: 0.4, ease: 'power2.in' });
    rise(gsap, $('.bl-after', sec), { delay: 0.3 });
    wm?.classList.add('breathe');
    blossoms.burst(10, { mix: { jasmine: 0.6, rose: 0.3, marigold: 0.1 }, life: 4.5 });
  }
  function kolamPulse(i) {
    if (!pulli.length) return;
    const x = lamps[i].getBoundingClientRect();
    const cx = x.left + x.width / 2;
    pulli.map((p) => { const r = p.getBoundingClientRect(); return { p, d: Math.abs(r.left + r.width / 2 - cx) }; })
      .sort((a, b) => a.d - b.d).slice(0, 3)
      .forEach(({ p }) => gsap.fromTo(p, { scale: 1 }, { scale: 1.6, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut', overwrite: true }));
  }
  function light(i, auto) {
    if (lit[i]) return;
    lit[i] = true;
    if (!auto) lastTouch = performance.now();
    deepams.ignite(dps[i], { slow: true });
    deepams.embers(dps[i], 3);
    kolamPulse(i);
    mark(i);
    if (!all && lit.every(Boolean)) complete();
  }
  const idx = (x) => { const r = row.getBoundingClientRect(); return Math.min(4, Math.max(0, Math.floor(((x - r.left) / r.width) * 5))); };

  let down = false;
  row.addEventListener('pointerdown', (e) => {
    down = true;
    const i = idx(e.clientX);
    if (lit[i]) { const c = lamps[i].getBoundingClientRect(); deepams.lean(dps[i], e.clientX < c.left + c.width / 2 ? 1 : -1); } else light(i);
  });
  row.addEventListener('pointermove', (e) => { if (down) { const i = idx(e.clientX); if (!lit[i]) light(i); } });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => row.addEventListener(n, () => { down = false; }));
  lamps.forEach((l, i) => l.addEventListener('click', (e) => { if (e.detail === 0) light(i); }));

  once(sec, 'pg:reveal', () => {
    gsap.to(lamps, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, delay: 0.6, ease: 'power2.out' });
    if (!VIDEO) rise(gsap, hint, { delay: 1.4 });
  });
  sec.addEventListener('pg:rest', () => {
    if (all || auto) return;
    auto = gsap.delayedCall(VIDEO ? 0.6 : document.documentElement.classList.contains('demo') ? 4 : 12, () => {
      auto = null;
      if (all || !sec.classList.contains('live') || (!VIDEO && performance.now() - lastTouch < 1500)) return;
      [2, 1, 3, 0, 4].filter((i) => !lit[i]).forEach((i, k) => gsap.delayedCall(k * 0.22, () => light(i, true)));
    });
  });
  sec.addEventListener('pg:leave', () => { auto?.kill(); auto = null; });
}

export function initReception({ gsap, RM }) {
  const sec = $('#reception');
  const map = $('.r-map', sec);
  if (RM) return;
  once(sec, 'pg:reveal', () => {
    gsap.delayedCall(1.3, () => {
      gsap.fromTo($('.pin svg', map), { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)' });
      map.classList.add('on', 'ping');
      gsap.delayedCall(3.2, () => { map.classList.remove('ping'); map.classList.add('rest'); });
    });
  });
}

export function initClosing({ gsap, RM, VIDEO, deepams, blossoms, gilt, onShower = () => {} }) {
  const sec = $('#closing');
  const dps = [...sec.querySelectorAll('.cl-row .dp')];
  const hint = $('.cl-hint', sec);
  if (RM) return;
  once(sec, 'pg:reveal', () => {
    gsap.fromTo('.cl-lock', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.35 });
    gsap.to('.cl-halo', { opacity: 1, duration: 1, delay: 0.6, onComplete: () => $('.cl-halo').classList.add('on') });
    gsap.delayedCall(0.6, () => deepams.ignite(dps[0]));
    gsap.delayedCall(0.75, () => deepams.ignite(dps[1]));
    gsap.delayedCall(1, () => gilt('#cl-num'));
    gsap.delayedCall(1.4, () => { blossoms.burst(30, { window: 2.4 }); blossoms.setTarget(10); });
    if (!VIDEO) gsap.to(hint, { opacity: 1, duration: 0.8, delay: 3 });
  });
  if (VIDEO) return;
  const pg = $('.pg', sec);
  let d0 = null;
  let last = 0;
  pg.addEventListener('pointerdown', (e) => { d0 = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  pg.addEventListener('pointerup', (e) => {
    if (!d0 || e.target.closest('a, button')) { d0 = null; return; }
    const ok = Math.hypot(e.clientX - d0.x, e.clientY - d0.y) <= 8 && performance.now() - d0.t <= 600;
    d0 = null;
    const now = performance.now();
    if (!ok || now - last < 300) return;
    last = now;
    blossoms.burst(7, { from: { x: e.clientX, y: e.clientY - 20 } });
    onShower();
    gsap.to(hint, { opacity: 0, duration: 0.4, overwrite: true });
  });
}
