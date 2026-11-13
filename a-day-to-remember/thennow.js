const $ = (s, r = document) => r.querySelector(s);

// r14: Then, now & forever plays by itself only (BUILD-r14.md section 7). No scrubbing, no swipes, no label taps.
const SPEED = 1.25;

export function initThenNow({ gsap, RM, blossoms }) {
  if (RM) return { play: () => Promise.resolve() };
  const sec = $('#thennow');
  const stage = $('.tn-stage', sec);
  const thread = $('.tn-thread', sec);
  const bead = $('.bead', thread);
  const marks = [...thread.querySelectorAll('[data-k]')];
  const q = (s) => $(s, sec);
  const qa = (s) => [...sec.querySelectorAll(s)];
  let tl = null;
  let bursted = false;
  let ringGone = false;
  let devTl = null;
  const knot = q('.tn-knot');
  const fuse = q('.fuse');
  const statusEl = q('.tn-status');
  const html = document.documentElement;
  const resetKnot = () => {
    knot.classList.remove('drawn');
    gsap.set(knot.querySelectorAll('.tk-line'), { strokeDasharray: '1 2', strokeDashoffset: 1.02, autoRound: false });
    gsap.set(knot.querySelectorAll('.tk-dots circle'), { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
  };
  let nowTl = null;
  const nowImg = q('.pr-now .ph img');
  const resetNow = () => { nowTl?.kill(); nowTl = null; gsap.set(nowImg, { filter: 'blur(6px) saturate(.55) brightness(1.16)', scale: 1, transformOrigin: '50% 40%' }); gsap.set(q('.pr-now .sheen > i'), { xPercent: -120 }); };
  const undevelop = () => { devTl?.kill(); devTl = null; gsap.set([q('.pr-tog .dev'), q('.pr-tog .mono')], { opacity: 1 }); resetKnot(); resetNow(); };
  undevelop();
  let cur = 0;
  let driving = false;
  let played = false;
  let ap = null;
  let rw = null;
  let finishRun = null;
  let replayCall = null;
  const auto = { t: 0 };
  let kNow = -1;

  function build() {
    const W = stage.offsetWidth;
    const H = stage.offsetHeight;
    tl?.revert();
    tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    const pn = q('.pl-n');
    const ps = q('.pl-s');
    const now = q('.pr-now');
    const tog = q('.pr-tog');
    // childhood polaroids: pushed aside under the portrait, then dropped onto the lower corners of the colour print
    tl.fromTo(pn, { x: 0, y: 0, rotation: -5, scale: 1 }, { x: 0.14 * W, y: 0.12 * H, rotation: -2, scale: 0.8, duration: 0.38, ease: 'power2.inOut' }, 0.06)
      .fromTo(pn, { opacity: 1 }, { opacity: 0, duration: 0.14 }, 0.3)
      .set(pn, { zIndex: 5, x: -0.12 * W, y: 0.4 * H, rotation: -9, scale: 0.55, opacity: 0 }, 0.72)
      .fromTo(pn, { y: 0.4 * H, opacity: 0 }, { y: 0.5 * H, opacity: 1, duration: 0.16, ease: 'power3.out', immediateRender: false }, 0.8)
      .fromTo(ps, { x: 0, y: 0, rotation: 4, scale: 1 }, { x: -0.14 * W, y: -0.08 * H, rotation: 2, scale: 0.8, duration: 0.38, ease: 'power2.inOut' }, 0.06)
      .fromTo(ps, { opacity: 1 }, { opacity: 0, duration: 0.14 }, 0.3)
      .set(ps, { zIndex: 6, x: 0.12 * W, y: 0.13 * H, rotation: 8, scale: 0.55, opacity: 0 }, 0.72)
      .fromTo(ps, { y: 0.13 * H, opacity: 0 }, { y: 0.23 * H, opacity: 1, duration: 0.15, ease: 'power3.out', immediateRender: false }, 0.83)
      .fromTo(now, { x: 0.06 * W, y: 0.7 * H, rotation: 9, rotationX: 18 }, { x: 0, y: 0, rotation: -1.5, rotationX: 0, duration: 0.32, ease: 'power2.out' }, 0.14)
      .fromTo(now, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.14)
      .fromTo(now, { scale: 1 }, { x: -0.07 * W, y: -0.03 * H, rotation: -4.5, scale: 0.92, duration: 0.34, ease: 'power2.inOut', immediateRender: false }, 0.56)
      .fromTo(tog, { x: -0.06 * W, y: 0.72 * H, rotation: -8, rotationX: 18 }, { x: 0, y: 0, rotation: 2.5, rotationX: 0, duration: 0.32, ease: 'power2.out' }, 0.58)
      .fromTo(tog, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.58)
      .fromTo(q('.l0'), { yPercent: 0, opacity: 1 }, { yPercent: -40, opacity: 0, duration: 0.18 }, 0.06)
      .fromTo(qa('.l1 .li'), { yPercent: 108, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.14, stagger: 0.03, ease: 'power2.out' }, 0.3)
      .fromTo(q('.l1'), { yPercent: 0, opacity: 1 }, { yPercent: -40, opacity: 0, duration: 0.14 }, 0.58)
      .fromTo(qa('.l2 h2 .li'), { yPercent: 108, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.15, stagger: 0.03, ease: 'power2.out' }, 0.8)
      .fromTo(qa('.l2 .tn-sub .li'), { yPercent: 108, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.1, ease: 'power2.out' }, 0.9)
      .set({}, {}, 1);
    tl.progress(cur);
    place(cur);
  }

  function place(t) {
    bead.style.transform = `translateX(${(t * thread.clientWidth).toFixed(1)}px)`;
    const k = Math.round(2 * t);
    if (k !== kNow) { kNow = k; marks.forEach((m, i) => m.classList.toggle('on', i === k)); }
    if (!ringGone && t > 0.1) { ringGone = true; $('.ring', bead)?.remove(); }
    if (t < 0.58 && devTl) undevelop();
    // Now: the photo comes into focus from a warm haze, a light sweep crosses it, then a slow push-in while it is shown
    if (t >= 0.4 && t < 0.58 && !nowTl && !sec.classList.contains('idle')) {
      nowTl = gsap.timeline()
        .to(nowImg, { filter: 'blur(0px) saturate(1) brightness(1)', duration: 1.3, ease: 'power2.out' }, 0)
        .fromTo(q('.pr-now .sheen > i'), { xPercent: -120 }, { xPercent: 220, duration: 1.2, ease: 'power2.inOut' }, 0.5)
        .to(nowImg, { scale: 1.07, duration: 6, ease: 'sine.inOut' }, 0.2);
      nowTl.timeScale(SPEED);
    }
    if (t >= 0.98 && !devTl && !sec.classList.contains('idle')) {
      devTl = gsap.timeline().to(q('.pr-tog .dev'), { opacity: 0, duration: 0.9, ease: 'power1.inOut' }).to(q('.pr-tog .mono'), { opacity: 0, duration: 1.2, ease: 'power1.inOut' }, '>')
        .to(knot.querySelectorAll('.tk-dots circle'), { opacity: 1, scale: 1, duration: 0.3, stagger: 0.1, ease: 'back.out(2)' }, 0.9)
        .to(knot.querySelectorAll('.tk-line'), { strokeDashoffset: 0, autoRound: false, duration: 1.4, ease: 'sine.inOut' }, 1.0)
        .add(() => { knot.classList.add('drawn'); gsap.set(knot.querySelectorAll('.tk-line'), { strokeDasharray: 'none' }); }, 2.4);
      devTl.timeScale(SPEED);
    }
    if (t >= 0.98 && !bursted && !sec.classList.contains('idle')) {
      bursted = true;
      blossoms.burst(16, { life: 3.5 });
      gsap.fromTo(q('.pr-tog .sheen > i'), { xPercent: -120, x: 0 }, { xPercent: 220, duration: 1.2 / SPEED, ease: 'power2.inOut', overwrite: true });
    }
  }

  const render = (t) => { cur = t; tl.progress(t); place(t); };
  const say = (txt) => { statusEl.textContent = txt; };
  const hideFuse = () => { gsap.killTweensOf(fuse); gsap.to(fuse, { opacity: 0, duration: 0.2 }); };

  function cancelLoop() { replayCall?.kill(); replayCall = null; }

  // The r13 autoplay script, unchanged in shape; the whole timeline runs at SPEED (1.25x).
  function run({ lead = 0.4, video = false } = {}) {
    return new Promise((res) => {
      const hold1 = video ? 2.4 : 3.0;
      const tr1 = video ? 1.4 : 1.6;
      const hold2 = video ? 2.6 : 3.2;
      const tr2 = video ? 1.6 : 1.8;
      const tail = 2.6;
      const a = lead;
      const b = a + hold1;
      const c = b + tr1;
      const d = c + hold2;
      const e = d + tr2;
      const travel = (to, from, dur, at) => ap.fromTo(auto, { t: from }, { t: to, duration: dur, ease: 'power1.inOut', immediateRender: false, onUpdate: () => render(auto.t) }, at);
      const fuseRun = (seg, at, dur) => ap.set(fuse, { left: `${seg * 50}%`, scaleX: 0, opacity: 0 }, at)
        .to(fuse, { opacity: 1, duration: 0.2 }, at).to(fuse, { scaleX: 1, duration: dur, ease: 'none' }, at).to(fuse, { opacity: 0, duration: 0.2 }, at + dur);
      auto.t = 0;
      ap = gsap.timeline({ paused: true });
      ap.add(() => say('Then'), 0);
      fuseRun(0, a, hold1);
      ap.add(() => say('Now'), b);
      travel(0.5, 0, tr1, b);
      fuseRun(1, c, hold2);
      ap.add(() => say('Forever'), d);
      travel(1, 0.5, tr2, d);
      ap.add(() => {
        driving = false;
        ap = null;
        finishRun = null;
        if (!video) replayCall = gsap.delayedCall(4, () => { replayCall = null; if (!sec.classList.contains('idle') && !document.hidden) replay(); });
        res();
      }, e + tail);
      finishRun = res;
      ap.timeScale(SPEED).play(0);
    });
  }

  function stopAuto() {
    ap?.kill(); ap = null;
    rw?.kill(); rw = null;
    hideFuse();
    driving = false;
    const f = finishRun; finishRun = null;
    f?.();
  }

  function replay() {
    if (driving) return;
    cancelLoop();
    driving = true;
    rw = gsap.fromTo(auto, { t: cur }, {
      t: 0, duration: 1 / SPEED, ease: 'power2.inOut', onUpdate: () => render(auto.t),
      onComplete: () => { rw = null; undevelop(); bursted = false; run({ lead: 0 }); },
    });
  }

  function play({ video = false } = {}) {
    if (driving) return finishRun ? new Promise((r) => { const f = finishRun; finishRun = () => { f(); r(); }; }) : Promise.resolve();
    played = true;
    driving = true;
    render(0);
    return run({ lead: 0.4, video });
  }

  document.addEventListener('visibilitychange', () => { if (ap) ap.paused(document.hidden); });

  // Plays once the page has settled; leaving stops it and rewinds, so coming back plays it from the start.
  sec.addEventListener('pg:rest', () => { if (!played && !driving && !html.classList.contains('demo')) play(); });
  sec.addEventListener('pg:leave', () => { if (driving) stopAuto(); bursted = false; played = false; undevelop(); cancelLoop(); render(0); });
  sec.addEventListener('pg:reveal', () => {
    const ins = qa('.pl .in');
    const imgs = qa('.pl img').filter((im) => im.dataset.src && !(im.complete && im.naturalWidth > 1));
    let n = imgs.length;
    let ran = false;
    const go = () => {
      if (ran) return;
      ran = true;
      gsap.fromTo(ins, { y: -60, rotation: (i) => (i ? 12 : -12), opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.18, delay: 0.1 });
    };
    if (!n) { go(); return; }
    imgs.forEach((im) => { const one = () => { if (--n <= 0) go(); }; im.addEventListener('load', one, { once: true }); im.addEventListener('error', one, { once: true }); });
    setTimeout(go, 4000);
  }, { once: true });

  gsap.set(qa('.pl .in'), { opacity: 0 });
  build();
  let rb = 0;
  const rebuild = () => { cancelAnimationFrame(rb); rb = requestAnimationFrame(build); };
  addEventListener('resize', () => { cancelLoop(); rebuild(); });
  document.fonts?.ready.then(rebuild);
  return { rebuild, play, get t() { return cur; } };
}
