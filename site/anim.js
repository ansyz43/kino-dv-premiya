// Кинематографичные анимации (GSAP + ScrollTrigger)
// Без pin/scrub-блокировки скролла — только мягкие reveal'ы и parallax.
(function () {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  // ─── 1. Hero entry — заголовок, sub, кнопки, правая колонка ───
  const heroTl = gsap.timeline({
    defaults: { ease: 'expo.out' },
    onComplete: () => {
      gsap.set([
        '.hero-eyebrow', '.hero-title > span', '.hero-sub',
        '.hero-actions > *', '.hero-aside-tag',
        '.hero-stats', '.hero-stats > .stat-item', '.hero-aside-meta',
      ], { clearProps: 'all' });
    },
  });
  heroTl
    .from('.hero-eyebrow', { y: 20, autoAlpha: 0, duration: 0.6 })
    .from('.hero-title > span', {
      y: 80, autoAlpha: 0, filter: 'blur(20px)',
      duration: 1.0, stagger: 0.08,
    }, '-=0.35')
    .from('.hero-sub', { y: 30, autoAlpha: 0, duration: 0.7 }, '-=0.55')
    .from('.hero-actions > *', {
      y: 30, autoAlpha: 0, duration: 0.55, stagger: 0.08,
    }, '-=0.4')
    .from('.hero-aside-tag', { y: 20, autoAlpha: 0, duration: 0.5 }, '-=0.85')
    .from('.hero-stats', { x: 60, autoAlpha: 0, duration: 0.8 }, '-=0.7')
    .from('.hero-stats > .stat-item', {
      y: 24, autoAlpha: 0, duration: 0.5, stagger: 0.07,
    }, '-=0.5')
    .from('.hero-aside-meta', { autoAlpha: 0, duration: 0.4 }, '-=0.2');

  // ─── 2. Counter-up через IntersectionObserver (надёжнее ScrollTrigger) ───
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const obj = { v: 0 };
        el.textContent = '0' + suffix;
        gsap.to(obj, {
          v: target,
          duration: 1.25,
          ease: 'power2.out',
          delay: 0.1,
          onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
          onComplete: () => { el.textContent = target + suffix; },
        });
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => io.observe(el));
  }

  // ─── 3. Reveal для каждой секции (eyebrow → title → body → дети) ───
  const sections = document.querySelectorAll(
    'section, .submit-section'
  );
  sections.forEach((sec) => {
    if (sec.classList.contains('hero')) return; // hero делаем отдельно
    const eyebrow = sec.querySelector('.section-eyebrow');
    const title = sec.querySelector('.section-title');
    const body = sec.querySelector('.section-body');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec,
        start: 'top 75%',
        once: true,
      },
      defaults: { ease: 'expo.out', duration: 0.7 },
    });

    if (eyebrow) tl.from(eyebrow, { y: 20, autoAlpha: 0, duration: 0.42 });
    if (title) tl.from(title, { y: 40, autoAlpha: 0, filter: 'blur(14px)', duration: 0.77 }, '-=0.2');
    if (body) tl.from(body, { y: 24, autoAlpha: 0, duration: 0.63 }, '-=0.42');
  });

  // ─── 4. Stagger reveal для решёток (карточки номинаций, новости, программа, партнёры) ───
  const grids = [
    { sel: '.nom-grid', items: '.nom-card' },
    { sel: '.news-grid', items: '.news-card' },
    { sel: '.partner-logos', items: '.partner-item' },
    { sel: '.about-pillars', items: '.pillar' },
    { sel: '.prog-grid', items: '.prog-event' },
  ];
  grids.forEach(({ sel, items }) => {
    const grid = document.querySelector(sel);
    if (!grid) return;
    gsap.from(grid.querySelectorAll(items), {
      y: 50,
      autoAlpha: 0,
      duration: 0.63,
      ease: 'power3.out',
      stagger: 0.055,
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
    });
  });

  // ─── 5. Mouse-parallax на hero rays/glow ───
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    const layers = [
      { el: heroBg.querySelector('.layer-glow'), depth: 18 },
      { el: heroBg.querySelector('.layer-ray2'), depth: 10 },
      { el: heroBg.querySelector('.layer-ray'), depth: 6 },
      { el: heroBg.querySelector('.layer-grid'), depth: 3 },
    ].filter((l) => l.el);

    let raf = null;
    window.addEventListener('mousemove', (e) => {
      if (window.scrollY > window.innerHeight) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        layers.forEach(({ el, depth }) => {
          gsap.to(el, {
            x: x * depth,
            y: y * depth,
            duration: 1.0,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        });
      });
    });
  }

  // ─── 6. 3D-tilt при hover на карточках номинаций и новостей ───
  function attachTilt(card, max = 6) {
    let bound = card.getBoundingClientRect();
    function onMove(e) {
      bound = card.getBoundingClientRect();
      const px = (e.clientX - bound.left) / bound.width - 0.5;
      const py = (e.clientY - bound.top) / bound.height - 0.5;
      gsap.to(card, {
        rotationY: px * max * 2,
        rotationX: -py * max * 2,
        transformPerspective: 800,
        transformOrigin: 'center',
        duration: 0.5,
        ease: 'power2.out',
      });
    }
    function onLeave() {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out' });
    }
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  }
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.nom-card, .news-card').forEach((c) => attachTilt(c, 5));
  }
})();
