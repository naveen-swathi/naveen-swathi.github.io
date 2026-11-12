import { FACTS } from './shared/facts.js';
import { heartPath } from './decor.js';

const $ = (s, r = document) => r.querySelector(s);
const pad = (n) => String(n).padStart(2, '0');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function buildCalendar() {
  const y = +FACTS.date.year;
  const m = MONTHS.indexOf(FACTS.date.month);
  const lead = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  let html = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<span class="wd" aria-hidden="true">${d}</span>`).join('');
  html += '<span></span>'.repeat(lead);
  for (let d = 1; d <= days; d++) {
    html += d === +FACTS.date.day
      ? `<span class="dy hit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${heartPath()}"/></svg><span>${d}</span></span>`
      : `<span class="dy">${d}</span>`;
  }
  $('#cal').innerHTML = html;
}

function countdown() {
  const start = new Date(FACTS.date.iso).getTime();
  const end = new Date(FACTS.date.endIso).getTime();
  const ist = (t) => new Date(t + 5.5 * 3600e3).toISOString().slice(0, 10);
  const els = { d: $('[data-u="d"]'), h: $('[data-u="h"]'), m: $('[data-u="m"]'), s: $('[data-u="s"]') };
  const state = $('#cd-state');
  const set = (d, h, m, s) => { els.d.textContent = pad(d); els.h.textContent = pad(h); els.m.textContent = pad(m); els.s.textContent = pad(s); };
  const cap = $('#cd-cap');
  const step = () => {
    const now = Date.now();
    if (now >= end) { set(0, 0, 0, 0); state.textContent = 'Celebrated with love'; return; }
    if (now >= start) { set(0, 0, 0, 0); state.textContent = 'Celebrating now'; return; }
    const t = Math.floor((start - now) / 1000);
    set(Math.floor(t / 86400), Math.floor((t % 86400) / 3600), Math.floor((t % 3600) / 60), t % 60);
    state.textContent = ist(now) === FACTS.date.iso.slice(0, 10) ? 'Today' : '';
  };
  const tick = () => { step(); cap.hidden = state.textContent !== ''; };
  tick();
  setInterval(tick, 1000);
}

function calendarLinks() {
  const start = new Date(FACTS.date.iso);
  const end = new Date(FACTS.date.endIso);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const title = `${FACTS.couple.short} · ${FACTS.event}`;
  const where = [FACTS.venue.name, ...FACTS.venue.lines.map((l) => l.replace(/,$/, ''))].join(', ');
  const note = `We warmly invite you to our ${FACTS.event}. With love, ${FACTS.couple.short}`;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${fmt(start)}/${fmt(end)}`, details: note, location: where });
  $('#gcal').href = `https://calendar.google.com/calendar/render?${q}`;
  const esc = (t) => t.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Naveen and Swathi//Reception//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:reception-${FACTS.date.iso.slice(0, 10)}@naveen-swathi`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(title)}`, `LOCATION:${esc(where)}`, `DESCRIPTION:${esc(note)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  $('#ics').href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const btn = $('#addcal');
  btn.addEventListener('click', () => {
    const open = $('#calmenu').hidden;
    $('#calmenu').hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (!open) return;
    // On short screens the menu opens below the fold: move to the page's deep step once relayout has run.
    setTimeout(() => {
      if ($('#calmenu').getBoundingClientRect().bottom <= innerHeight) return;
      dispatchEvent(new CustomEvent('pg:deep', { detail: btn.closest('.page') }));
    }, 150);
  });
}

function heartTap({ gsap, RM, blossoms }) {
  const hit = $('.cal .hit');
  if (RM || !hit) return;
  let d0 = null;
  let last = 0;
  hit.addEventListener('pointerdown', (e) => { d0 = { x: e.clientX, y: e.clientY }; });
  hit.addEventListener('pointerup', (e) => {
    const ok = d0 && Math.hypot(e.clientX - d0.x, e.clientY - d0.y) <= 8;
    d0 = null;
    const now = performance.now();
    if (!ok || now - last < 1200) return;
    last = now;
    gsap.timeline().to(hit, { scale: 1.22, duration: 0.18, ease: 'power2.out' }).to(hit, { scale: 1, duration: 0.32, ease: 'power2.in' });
    const r = hit.getBoundingClientRect();
    const pc = document.querySelector('#petals');
    pc.classList.add('over-card');
    setTimeout(() => pc.classList.remove('over-card'), 2200);
    blossoms.burst(8, { from: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
  });
}

export function initExtras({ gsap, RM, blossoms }) {
  buildCalendar();
  heartTap({ gsap, RM, blossoms });
  countdown();
  calendarLinks();
}
