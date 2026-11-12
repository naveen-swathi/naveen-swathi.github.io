const LAMP = '<img class="dp-lamp" src="img/diya.webp" alt="" width="240" height="131" decoding="async">';
const markup = (lamp) => `<i class="dp-gl"><i class="dp-glow"></i></i>${lamp}<i class="dp-fl"><svg class="dp-flame" viewBox="0 0 20 44" aria-hidden="true"><use href="#flame"/></svg></i>`;

export function initDeepams({ gsap, RM, rng = Math.random, vessel = null }) {
  const parts = (el) => ({ fl: el.querySelector('.dp-fl'), gl: el.querySelector('.dp-gl') });

  function mountAll(root = document) {
    root.querySelectorAll('[data-deepam]').forEach((el) => {
      if (el.firstChild) return;
      el.innerHTML = markup(vessel ? vessel(el) : LAMP);
      if (vessel) el.classList.add('cn');
      el.style.setProperty('--fd', `${(1.4 + rng() * 0.8).toFixed(2)}s`);
      el.style.setProperty('--gd', `${(2.6 + rng() * 1.0).toFixed(2)}s`);
      el.querySelector('.dp-flame').style.animationDelay = `${(-rng() * 2).toFixed(2)}s`;
      el.querySelector('.dp-glow').style.animationDelay = `${(-rng() * 3).toFixed(2)}s`;
      if (RM || el.hasAttribute('data-lit')) el.classList.add('lit');
    });
  }

  function ignite(el, { slow = false } = {}) {
    return new Promise((resolve) => {
      el.classList.add('lit');
      if (RM) { resolve(); return; }
      const { fl, gl } = parts(el);
      const s = slow ? 1.35 : 1;
      gsap.killTweensOf([fl, gl]);
      gsap.timeline({ onComplete: resolve })
        .fromTo(fl, { scale: 0.1, opacity: 0 }, { scaleX: 1.15, scaleY: 1.3, opacity: 1, duration: 0.22 * s, ease: 'power2.out' }, 0)
        .to(fl, { scale: 1, duration: slow ? 0.6 : 0.45, ease: 'power2.inOut' })
        .fromTo(gl, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: slow ? 1.2 : 1, ease: 'power2.out' }, 0);
    });
  }

  function extinguish(el) {
    const { fl, gl } = parts(el);
    if (RM) { el.classList.remove('lit'); return; }
    gsap.killTweensOf([fl, gl]);
    gsap.to([fl, gl], { opacity: 0, duration: 0.3, onComplete: () => { el.classList.remove('lit'); gsap.set([fl, gl], { clearProps: 'all' }); } });
  }

  function lean(el, dir) {
    if (RM || !el.classList.contains('lit')) return;
    const { fl } = parts(el);
    gsap.killTweensOf(fl, 'skewX,scaleY');
    gsap.timeline()
      .to(fl, { skewX: dir * 14, scaleY: 0.84, duration: 0.12, ease: 'power2.out' })
      .to(fl, { skewX: 0, scaleY: 1, duration: 1.1, ease: 'elastic.out(1, .35)' });
  }

  function embers(el, n = 3) {
    if (RM) return;
    const { gl } = parts(el);
    for (let i = 0; i < n; i++) {
      const e = document.createElement('i');
      e.style.cssText = 'position:absolute;left:-1px;top:-1px;width:2px;height:2px;border-radius:50%;background:rgba(255,200,110,.9);pointer-events:none';
      gl.append(e);
      gsap.to(e, { y: -(16 + rng() * 14), x: (rng() - 0.5) * 12, opacity: 0, duration: 0.7 + rng() * 0.2, delay: i * 0.08, ease: 'power1.out', onComplete: () => e.remove() });
    }
  }

  return { mountAll, ignite, extinguish, lean, embers };
}
