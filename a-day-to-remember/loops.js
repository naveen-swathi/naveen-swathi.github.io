// The engine owns the play state of CSS loops while paged: pause at move start, play the live page's at rest.
// Only animations this module paused are played again, so loops paused by design stay paused.
export function initLoops({ RM }) {
  const mine = new WeakSet();
  const hosts = () => [document.getElementById('frame'), document.getElementById('music'), document.getElementById('nx'), ...document.querySelectorAll('.side-wm, .side')].filter(Boolean);
  const pause = (els) => els.flatMap((el) => el.getAnimations({ subtree: true })).forEach((a) => { if (a.playState === 'running') { a.pause(); mine.add(a); } });
  const play = (els) => els.flatMap((el) => el.getAnimations({ subtree: true })).forEach((a) => { if (mine.has(a) && a.playState === 'paused') { mine.delete(a); a.play(); } });
  return {
    freeze(...pages) { if (!RM) pause([...pages, ...hosts()]); },
    thaw(page) {
      if (RM) return;
      requestAnimationFrame(() => {
        play([page, ...hosts()]);
        pause([...document.querySelectorAll('.page:not(.live)')]);
      });
    },
  };
}
