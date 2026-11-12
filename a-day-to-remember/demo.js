// Autopilot. In video mode the opening is held about 2.4 s after the recorder's networkidle (it starts the screencast then).
// ?demo=1 walks the whole site; ?video=1 skips the countdown, holds the revealed date 4.8 s and sets window.__demoDone.
// r14: pages move with the paged engine (nav.go), so the autopilot steps page by page instead of scrolling.
export function initDemo({ gsap, openGate, scratch, pages, nav, tn, ready, VIDEO, RM }) {
  const proxy = { v: 0 };
  let stopped = false;
  const stop = () => { stopped = true; gsap.killTweensOf(proxy); };
  ['wheel', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, stop, { once: true, passive: true }));

  const wait = (s) => new Promise((r) => gsap.delayedCall(RM ? 0.2 : s, r));
  const over = (el) => (nav?.rest ? nav.rest(el).over : 0);

  const HOLD = VIDEO
    ? { invite: 4.4, blessings: 4.4, reception: 4.4, savedate: 3.4, closing: 6.6 }
    : { invite: 4.4, blessings: 6, reception: 4.4, savedate: 5, closing: 6.6 };

  (async () => {
    await ready;
    await wait(VIDEO ? 2.5 : 1);
    openGate();
    await wait(VIDEO ? 2.4 : 3.4);
    for (const el of pages) {
      if (stopped) return;
      const id = el.id;
      if (id !== 'invite') await nav.goPage(el);
      if (stopped) return;
      if (id === 'date') {
        await wait(1.2);
        await scratch.auto(VIDEO ? 3.2 : 2.6);
        await wait(VIDEO ? 4.8 : 3.6);
      } else if (id === 'thennow' && tn) {
        await wait(1.2);
        await tn.play({ video: VIDEO });
        await wait(1.6);
      } else {
        await wait(HOLD[id] ?? 3.5);
      }
      if (!VIDEO && id !== 'thennow' && over(el) > 20) {
        await nav.goPage(el, true);
        await wait(2);
      }
    }
    window.__demoDone = true;
  })();
}
