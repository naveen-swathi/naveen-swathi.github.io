export function createPetals(gsap) {
  const box = document.querySelector('#petals');
  return {
    shower(n = 5) {
      const W = box.clientWidth;
      const H = box.clientHeight;
      for (let i = 0; i < n; i++) {
        const el = document.createElement('img');
        el.className = 'petal';
        el.alt = '';
        el.src = `img/petal-${1 + (i % 4)}.png`;
        if (i % 3 === 1) el.style.filter = 'sepia(.9) saturate(2.6) hue-rotate(-14deg) drop-shadow(0 1px 1.5px rgba(58,36,23,.38))';
        box.append(el);
        const x0 = W * (0.1 + Math.random() * 0.8);
        const sway = 18 + Math.random() * 22;
        const dur = 7 + Math.random() * 3;
        const delay = 0.3 + Math.random() * 1.6;
        gsap.set(el, { x: x0, y: -24, scale: 0.7 + Math.random() * 0.3, rotation: Math.random() * 360 });
        gsap.to(el, { y: H + 30, duration: dur, delay, ease: 'none', onComplete: () => el.remove() });
        gsap.to(el, { x: `+=${Math.random() > 0.5 ? sway : -sway}`, duration: dur / 2.4, delay, ease: 'sine.inOut', yoyo: true, repeat: 2 });
        gsap.to(el, { rotation: `+=${40 + Math.random() * 90}`, duration: dur, delay, ease: 'sine.inOut' });
        gsap.timeline({ delay }).to(el, { opacity: 0.92, duration: 1.2 }).to(el, { opacity: 0, duration: 1.6 }, dur - 1.6);
      }
    },
  };
}
