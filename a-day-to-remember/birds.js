import { pkDefs, peacockScene, peacockMotion, setPose } from './peacock.js';
import { initDoveBirds } from './birds-dove.js';

const $ = (s, r = document) => r.querySelector(s);
const PAGES = ['invite', 'date', 'reception', 'closing'];
const LAMP = '<span class="dp" data-deepam></span>';
const CANDLE = '<span class="dp" data-deepam data-h="56"></span>';

// Builds the active bird variant into the page containers. Returns { bloom, lift, live(id) }.
export function initBirds({ gsap, RM, bird, pages, WF = null }) {
  if (bird === 'dove') return initDoveBirds({ gsap, RM, pages, WF });
  return initPeacock({ gsap, RM, WF });
}

function initPeacock({ gsap, RM, WF }) {
  document.body.insertAdjacentHTML('afterbegin', pkDefs());
  const ctls = {};
  const wms = {};
  PAGES.forEach((id) => {
    const sec = $(`#${id}`);
    const stage = $('.pk-stage', sec);
    stage.innerHTML = peacockScene(id, { lamp: id === 'invite' ? (WF ? CANDLE : LAMP) : '', branch: WF && id === 'reception' ? WF.westBranch() : '' });
    const pair = $('.pair', stage);
    if (pair) stage.style.setProperty('--par', pair.style.getPropertyValue('--ar'));
    const c = peacockMotion(id, stage, gsap);
    ctls[id] = c;
    const wm = WF && id === 'invite' ? WF.westernMotion(id, sec, gsap, { bird: 'peacock' }) : null;
    wms[id] = wm;
    if (RM) { c.still(); wm?.still(); return; }
    c.prime();
    wm?.prime();
    sec.addEventListener('pg:reveal', () => { c.enter(); wm?.enter(); }, { once: true });
    sec.addEventListener('pg:leave', () => { c.finish(); wm?.finish(); });
  });

  // desktop and tablet (760 px and up): a tall peacock in each side margin, facing the card
  const mq = matchMedia('(min-width: 880px) and (min-height: 501px)');
  let sides = [];
  let revealed = false;
  const buildSides = () => {
    sides.forEach((c) => c.anims.forEach((a) => a.cancel()));
    sides = [];
    document.querySelectorAll('.side').forEach((el) => { el.innerHTML = ''; });
    if (!mq.matches) return;
    document.querySelectorAll('.side').forEach((el) => {
      el.innerHTML = peacockScene('side');
      const c = peacockMotion('side', el, gsap);
      sides.push(c);
      const bd = $('.pk', el);
      if (RM) { setPose(bd, 0.62); return; }
      bd.style.opacity = 0;
      if (revealed) c.enter();
    });
  };
  buildSides();
  mq.addEventListener('change', buildSides);
  if (!RM) $('#invite').addEventListener('pg:reveal', () => { revealed = true; sides.forEach((c) => c.enter()); }, { once: true });

  return {
    bloom() { if (!RM) ctls.date.bloom(); },
    lift() {},
    live(id) { PAGES.forEach((p) => { ctls[p].live(p === id); wms[p]?.live(p === id); }); },
  };
}
