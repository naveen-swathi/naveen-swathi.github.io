// Dove variant (BUILD-r13.md section 3). birds.js calls initDoveBirds() when html[data-bird="dove"].
// The doves and their ornaments are drawn by dove.js into the page containers (their markup is in index.html and stays
// hidden under ?bird=peacock); the enamel fills (kolam, lotus, mandalas, threshold) come from the shared base.
import { doveScene as doveSceneWestern } from './dove.js';
import { doveScene as doveSceneReal } from './real-scenes.js';
import { medallion } from './fills.js';

const $ = (s, r = document) => r.querySelector(s);
const PAGES = ['invite', 'date', 'reception', 'closing'];
const HOST = { invite: '.dv-crown', date: '.dv-carry', reception: '.dv-wreath', closing: '.dv-close' };

export function initDoveBirds({ gsap, RM, WF = null }) {
  // South look: the painted real doves (real-scenes.js); Western keeps the ornament-driven doves (dove.js)
  const doveScene = WF ? doveSceneWestern : doveSceneReal;
  const ctls = {};
  const wms = {};
  PAGES.forEach((id) => {
    const sec = $(`#${id}`);
    const host = $(HOST[id], sec);
    host.classList.add('dv-stage');
    const opts = WF ? { orn: WF.doveOrn } : {};
    if (id === 'date') opts.card = $('.scratch', sec);
    if (id === 'closing') opts.backdrop = `<g transform="translate(0 -44) scale(1.02)">${WF ? WF.closingWreath() : medallion()}</g>`;
    const c = doveScene(id, host, opts);
    ctls[id] = c;
    const wm = WF && (id === 'invite' || id === 'date') ? WF.westernMotion(id, sec, gsap, { bird: 'dove' }) : null;
    wms[id] = wm;
    if (RM) { c.still(); wm?.still(); return; }
    c.prime(gsap);
    wm?.prime();
    sec.addEventListener('pg:reveal', () => { c.enter(gsap); wm?.enter(); }, { once: true });
    sec.addEventListener('pg:leave', () => { c.finish(); wm?.finish(); });
  });

  // desktop and tablet: a dove on a jasmine sprig in each side margin, facing the card
  const mq = matchMedia('(min-width: 880px) and (min-height: 501px)');
  let sides = [];
  let revealed = false;
  const buildSides = () => {
    sides.forEach((c) => c.destroy());
    sides = [];
    document.querySelectorAll('.side').forEach((el) => { el.innerHTML = ''; });
    if (!mq.matches) return;
    document.querySelectorAll('.side').forEach((el) => {
      const host = document.createElement('div');
      host.className = 'dv-side dv-stage';
      el.appendChild(host);
      const c = doveScene('side', host, WF ? { orn: { branch: WF.roseBranch } } : {});
      sides.push(c);
      if (RM) { c.still(); return; }
      c.prime(gsap);
      if (revealed) c.enter(gsap);
    });
  };
  buildSides();
  mq.addEventListener('change', buildSides);
  if (!RM) $('#invite').addEventListener('pg:reveal', () => { revealed = true; sides.forEach((c) => c.enter(gsap)); }, { once: true });

  let bloomed = false;
  return {
    bloom() {
      if (RM || bloomed) return;
      if (WF) { bloomed = true; wms.date.bloom(); return; }
      bloomed = true;
    },
    lift() { ctls.closing.lift(gsap); },
    live(id) { if (!RM) PAGES.forEach((p) => { ctls[p].live(p === id); wms[p]?.live(p === id); }); },
  };
}
