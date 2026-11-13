import { FACTS } from './shared/facts.js';
import { heartPath, knotSVG } from './decor.js';
import { frameSVG, crestTop, frameIntro } from './border.js';
import * as F from './fills.js';
import { initPages } from './pages.js';
import { initBirds } from './birds.js';
import { initScratch } from './scratch.js';
import { initDeepams } from './deepam.js';
import { createBlossoms, mulberry32 } from './blossoms.js';
import { initThenNow } from './thennow.js';
import { initDate, initBlessings, initClosing } from './pages-fx.js';
import { initExtras } from './extras.js';
import { initGate } from './gate-seal.js';
import { mountPond } from './lotus-pond.js';
import { initDemo } from './demo.js';
import { initLoops } from './loops.js';
import { buildPeeks, placePeeks, phoneMQ } from './peek.js';

const WEST = document.documentElement.dataset.look === 'western';
const [WB, WF] = WEST ? await Promise.all([import('./border-western.js'), import('./fills-western.js')]) : [];

const $ = (s, r = document) => r.querySelector(s);
const params = new URLSearchParams(location.search);
const VIDEO = params.get('video') === '1';
const DEMO = VIDEO || params.get('demo') === '1';
const AUTO = params.get('autoplay') === '1' || DEMO;
const BIRD = document.documentElement.dataset.bird === 'dove' ? 'dove' : 'peacock';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches || params.get('rm') === '1';
if (RM) document.documentElement.classList.add('rm');
const PHONE = phoneMQ().matches;
history.scrollRestoration = 'manual';
scrollTo(0, 0);

const get = (p) => p.split('.').reduce((o, k) => o?.[k], FACTS);
document.querySelectorAll('[data-fact]').forEach((el) => { el.textContent = get(el.dataset.fact); });
document.querySelectorAll('.parents').forEach((el) => {
  const [a, b] = el.textContent.split(' & ');
  el.innerHTML = [a, '&', b].map((t) => `<span class="ln"><span class="li${t === '&' ? ' amp' : ''}">${t}</span></span>`).join('');
});
FACTS.venue.lines.forEach((l) => {
  $('#v-lines').append(Object.assign(document.createElement('span'), { textContent: l }));
});
$('#directions').href = FACTS.venue.directions;
$('#cl-num').innerHTML = FACTS.date.short.split(' · ').join('<i>·</i>');
$('#lg-heart').setAttribute('d', heartPath());
const POND = !WEST && BIRD === 'dove' ? $('#date .grow.v-dove') : null;
POND?.replaceChildren();
const ORN = WEST ? {
  gable: WF.wreathCrown, divider: () => WF.divider(), ikolam: WF.posy, dlotus: () => WF.dateRose(RM ? 1 : 0.1), lkolam: () => WF.ledge(300),
  threshold: WF.threshold, mandala: WF.lace, cornerfan: WF.cornerSpray, jas: WF.strip,
} : {
  gable: F.gable, divider: () => F.divider(BIRD), ikolam: F.inviteKolam, dlotus: () => F.dateLotus(RM ? 1 : 0.1), lkolam: () => F.lampKolam(300),
  threshold: F.threshold, mandala: () => F.mandala(), cornerfan: F.cornerFan,
};
const inactive = `${BIRD === 'peacock' ? '.v-dove' : '.v-peacock'}, ${WEST ? '.v-south' : '.v-west'}`;
document.querySelectorAll('[data-orn]').forEach((el) => { if (!el.closest(inactive)) el.innerHTML = ORN[el.dataset.orn](); });
if (!WEST) document.querySelectorAll('.ik-wm, .wm-wrap').forEach((host) => {
  const svg = host.querySelector('svg');
  if (!svg) return;
  svg.classList.add('wm-gilt');
  F.glow(host, { rings: PHONE ? 2 : 5 });
  host.insertAdjacentHTML('beforeend', F.glints(0.9, PHONE ? F.PHONE_SPOTS : F.PAGE_SPOTS));
});
if (!WEST) document.body.insertAdjacentHTML('afterbegin', F.goldDefs());
if (WEST) { document.body.insertAdjacentHTML('afterbegin', WB.westDefs()); $('#invite .gable-wrap')?.classList.add('w-crown'); }
document.querySelectorAll('[data-deco="knot"]').forEach((el) => { el.innerHTML = WEST ? WF.knot() : knotSVG(); });

const probe = $('#probe');
const unit = () => probe.getBoundingClientRect().width / 1000;
const mq760 = matchMedia('(min-width: 760px)');
const sideMandalas = () => document.querySelectorAll('.side-wm').forEach((el) => {
  el.innerHTML = mq760.matches ? (WEST ? WF.lace() : F.mandala()) : '';
  if (!WEST && mq760.matches) F.glitter(el, { scale: 1.1 });
});
sideMandalas();
mq760.addEventListener('change', sideMandalas);

const frameEl = $('#frame');
let frameDims = '';
const buildFrame = () => {
  const u = unit();
  const W = frameEl.clientWidth / u;
  const H = frameEl.clientHeight / u;
  if (!u || !W || !H) return;
  const key = `${Math.round(W)}x${Math.round(H)}`;
  if (frameEl.firstChild && Math.abs(W - frameDims.W) <= 1 && Math.abs(H - frameDims.H) <= 1) return;
  frameDims = { W, H, key };
  const art = WEST ? WB.frameSVG(W, H) : frameSVG(W, H, { bird: BIRD });
  const crest = WEST ? WB.crestTop() : crestTop(BIRD);
  frameEl.innerHTML = art + `<div class="fr-crest t"><div class="fr-c-in">${crest}</div></div><i class="fr-glint l"></i><i class="fr-glint r"></i>`;
};
buildFrame();
let frameTimer = 0;
addEventListener('resize', () => { clearTimeout(frameTimer); frameTimer = setTimeout(buildFrame, 150); });

const cord = () => {
  const s = $('.scratch');
  s.style.setProperty('--cord', `${Math.max(16, s.offsetTop - 36 * unit())}px`);
};
cord();
addEventListener('resize', cord);
document.fonts?.ready.then(cord);
new ResizeObserver(cord).observe($('#date .pg'));

const gsap = window.gsap;
gsap.registerPlugin(window.DrawSVGPlugin);
const pond = POND ? mountPond(POND, { gsap, F, rm: RM, phone: PHONE }) : null;
const rng = VIDEO ? mulberry32(1212) : Math.random;
const wineInk = () => getComputedStyle(document.documentElement).getPropertyValue('--wine').trim() || '#7A2145';
const gilt = (sel, ink = wineInk()) => {
  if (RM) return;
  document.querySelectorAll(sel).forEach((el) => {
    el.style.setProperty('--ink', ink);
    el.classList.add('gilt');
    el.addEventListener('animationend', () => el.classList.remove('gilt'), { once: true });
  });
};
$('#phone').inert = true;
if (!DEMO) $('#open').focus({ preventScroll: true });

const birds = initBirds({ gsap, RM, bird: BIRD, pages: null, WF });
const deepams = initDeepams({ gsap, RM, rng, vessel: WEST ? (el) => WF.candle(+el.dataset.h || 48) : null });
deepams.mountAll();
const blossoms = createBlossoms({ gsap, RM, VIDEO, rng });
blossoms.gate(true);
blossoms.setPage('gate');
blossoms.setTarget(0);
let hold = true;
let held = null;
const onLive = (id) => { birds.live(id); blossoms.setPage(id); if (id === 'date' && scratch.done) blossoms.setTarget(8); };
const loops = initLoops({ RM });
const PEEK = !WEST && PHONE;
if (PEEK) buildPeeks(F, [...document.querySelectorAll('.page > .pg')]);
const tn = initThenNow({ gsap, RM, blossoms });
const dateFx = initDate({ gsap, RM, scratch: { get done() { return scratch.done; } }, blossoms, gilt });
const scratch = initScratch({ gsap, RM, onReveal: () => { dateFx.onReveal(); birds.bloom(); pond?.bloom(); }, onTouch: dateFx.onTouch });
const dp = (s) => $(s, $('#invite'));
const pages = initPages({
  gsap, RM, VIDEO,
  hooks: {
    blockSwipe: (t) => !!t?.closest?.('#foil') && !scratch.done,
    live: (id, el) => { if (hold) held = id; else onLive(id); loops.thaw(el); },
    leaving: (from, to, fromEl, toEl) => { birds.hold(true); loops.freeze(fromEl, toEl); blossoms.pause(); },
    layout: (pgs) => { if (PEEK) placePeeks(pgs, unit()); },
    cross: blossoms.cross,
    invite: (tl) => {
      if (BIRD === 'peacock') {
        tl.add(() => deepams.ignite(dp('.pair .dp')), 2.3);
      } else {
        if (!WEST) {
          tl.fromTo('.ikol circle', { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.035, ease: 'back.out(2)' }, 1.0)
            .to('.ikol .kline', { strokeDashoffset: 0, autoRound: false, duration: 3.0, ease: 'sine.inOut' }, 1.3)
            .add(() => gsap.set('.ikol .kline', { strokeDasharray: tl.reversed() ? '1 2' : 'none' }), 4.3)
            .to('.ikol .kline.loops', { fillOpacity: 0.55, duration: 0.6 }, 4.3);
        }
        tl.fromTo('.thresh-wrap .dp', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.6)
          .fromTo('.thresh-wrap svg', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.2)
          .add(() => { deepams.ignite(dp('.dp.t2')); deepams.ignite(dp('.dp.t3')); }, 2.3)
          .add(() => { deepams.ignite(dp('.dp.t1')); deepams.ignite(dp('.dp.t4')); }, 2.5);
      }
      tl.add(() => gilt('.names .nm'), 2.6);
    },
  },
});
blossoms.setScrollSource(() => pages.y);
pages.pages.forEach((el) => el.addEventListener('pg:rest', () => {
  birds.hold(false);
  blossoms.resume();
}));
if (RM && PEEK) {
  const pgs = [...document.querySelectorAll('.page > .pg')];
  let pt = 0;
  const again = () => { clearTimeout(pt); pt = setTimeout(() => placePeeks(pgs, unit()), 150); };
  pgs.forEach((pg) => new ResizeObserver(again).observe(pg));
  document.fonts?.ready.then(again);
  addEventListener('resize', again);
  placePeeks(pgs, unit());
}
initBlessings({ gsap, RM, VIDEO, deepams, blossoms });
initClosing({ gsap, RM, VIDEO, deepams, blossoms, gilt, onShower: birds.lift });
initExtras({ gsap, RM, blossoms });
const onImg = (im) => new Promise((res) => {
  if (im.complete && im.naturalWidth > 1) { res(); return; }
  im.addEventListener('load', res, { once: true });
  im.addEventListener('error', res, { once: true });
});
// After the opening and the load event: the page images, two at a time.
const ready = Promise.race([(async () => {
  if (document.readyState !== 'complete') await new Promise((res) => addEventListener('load', res, { once: true }));
  const queue = [...document.querySelectorAll('img[data-src]')].filter((im) => !im.closest(WEST ? '.v-south' : '.v-west'));
  const lane = async () => { for (let im; (im = queue.shift());) { im.src = im.dataset.src; await onImg(im); } };
  await Promise.all([lane(), lane()]);
})(), new Promise((res) => setTimeout(res, 25000))]);

const music = $('#music');
let audio = null;
let userMuted = false;
if (FACTS.music && !VIDEO) {
  audio = new Audio(FACTS.music);
  audio.loop = true;
  audio.preload = 'auto';
  audio.addEventListener('error', () => { audio = null; music.hidden = true; }, { once: true });
}
const setMusic = (on) => { music.classList.toggle('on', on); music.setAttribute('aria-pressed', String(on)); };
const startMusic = () => { if (audio && audio.paused && !userMuted) audio.play().then(() => setMusic(true)).catch(() => {}); };
// Mobile browsers only allow sound from a completed tap (touchend/click), not from the first touch that opens the seal.
const unlock = (e) => { if (!opened || e.target.closest?.('#music')) return; startMusic(); if (audio && !audio.paused) ['touchend', 'click', 'keydown'].forEach((ev) => removeEventListener(ev, unlock, true)); };
['touchend', 'click', 'keydown'].forEach((ev) => addEventListener(ev, unlock, true));
music.addEventListener('click', () => {
  if (!audio) return;
  if (audio.paused) { userMuted = false; audio.play().then(() => setMusic(true)).catch(() => {}); } else { userMuted = true; audio.pause(); setMusic(false); }
});

const gate = $('#gate');
const gt = initGate({ gsap, RM, AUTO, pages });
$('#open .lbl').textContent = RM ? 'Begin' : 'Tap to begin';

let opened = false;
let t0 = 0;
const done = () => {
  gate.remove();
  blossoms.gate(false);
  hold = false;
  onLive(held ?? 'invite');
  document.querySelector('meta[name=theme-color]').content = getComputedStyle(document.documentElement).getPropertyValue('--theme').trim();
  document.body.classList.add('fr-go');
  buildFrame();
  const fi = frameIntro(gsap, frameEl);
  if (RM) fi.progress(1);
  $('#phone').inert = false;
  scrollTo(0, 0);
  setTimeout(() => { document.body.classList.remove('locked', 'opening', 's-fade'); scrollTo(0, 0); }, RM ? 0 : 700);
  const h1 = $('h1.names');
  h1.tabIndex = -1;
  h1.focus({ preventScroll: true });
  window.__opened = performance.now() - t0;
};
function openGate(e) {
  if (opened) return;
  opened = true;
  t0 = performance.now();
  music.hidden = !audio;
  startMusic();
  document.body.classList.add('s-fade');
  if (!RM) document.body.classList.replace('locked', 'opening');
  gt.play(done, { tap: !AUTO && !!e?.isTrusted });
}
const skip = () => { openGate(); gt.skip(done); };

const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'Home', 'End']);
addEventListener('keydown', (e) => {
  if (!document.body.matches('.locked, .opening') || !SCROLL_KEYS.has(e.key)) return;
  if (e.key === ' ' && e.target.closest?.('#gate button')) return;
  e.preventDefault();
}, true);
addEventListener('scroll', () => { if (document.body.matches('.locked, .opening') && scrollY) scrollTo(0, 0); }, { passive: true });

gate.addEventListener('contextmenu', (e) => e.preventDefault());
let down = null;
gate.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.g-skip')) return;
  if (!opened) { openGate(e); down = null; return; }
  down = { x: e.clientX, y: e.clientY, id: e.pointerId };
});
gate.addEventListener('pointerup', (e) => {
  const d = down;
  down = null;
  if (!d || d.id !== e.pointerId || !opened || RM || performance.now() - t0 <= 1200) return;
  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10) gt.skip(done);
});
gate.addEventListener('pointercancel', () => { down = null; });
$('#open').addEventListener('click', (e) => { e.stopPropagation(); openGate(e); });
$('.g-skip').addEventListener('click', (e) => { e.stopPropagation(); skip(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#gate')) skip(); });
if (RM) pages.start();
if (window.__tapped) openGate();
if (AUTO && !DEMO) {
  Promise.race([Promise.all([document.fonts?.ready, gt.ready]), new Promise((res) => setTimeout(res, 8000))]).then(() => setTimeout(openGate, 800));
}

if (DEMO) initDemo({ gsap, openGate, scratch, pages: pages.pages, nav: pages, tn, ready, VIDEO, RM });
window.__booted = true;
