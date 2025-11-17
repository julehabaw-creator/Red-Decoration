/* =========================================================
   SCRIPT.JS — RED DECORATION LANDING PAGE
   Struktur: Helper • Product Observer • Carousel • Anchors • Navbar Scroll
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------
     Helper Functions
  ---------------------------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  /* ----------------------------
     Reveal Product Cards (on scroll)
  ---------------------------- */
  (() => {
    const cards = $$('.product-card');
    const scrollContainer = $('.snap-container');
    if (!scrollContainer) return console.warn('Elemen .snap-container tidak ditemukan.');

    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting && en.intersectionRatio > 0.45) {
          en.target.classList.add('visible');
          const car = en.target.querySelector('.carousel');
          if (car?._api?.updatePosition) car._api.updatePosition(false);
        } else {
          en.target.classList.remove('visible');
        }
      });
    }, {
      root: scrollContainer,
      threshold: [0.45]
    });

    cards.forEach(c => io.observe(c));
  })();

  /* ----------------------------
     Carousel Functionality
  ---------------------------- */
  (() => {
    const carousels = $$('.carousel');
    carousels.forEach(car => {
      const track = $('.track', car);
      const slides = $$('.slide', car);
      const prev = $('.prev', car);
      const next = $('.next', car);
      const dotsWrap = $('.dots', car);
      if (!track || !slides.length) return;

      const count = slides.length;
      const dots = [];

      // Generate dots
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        if (i === 0) dot.classList.add('active');
        dotsWrap.appendChild(dot);
        dots.push(dot);
        dot.addEventListener('click', () => { goTo(i); restart(); });
      }

      const visibleSlides = () => (window.innerWidth <= 640 ? 1 : (window.innerWidth <= 1000 ? 2 : 3));
      let visible = visibleSlides();
      let index = 0;
      let timer = null;
      const autoplay = car.dataset.autoplay === 'true';
      const interval = Number(car.dataset.interval) || 3400;

      function update(noAnim = false) {
        visible = visibleSlides();
        const slideWidth = 100 / visible;
        const center = Math.floor(visible / 2);
        let offset = Math.min(Math.max(index - center, 0), count - visible);
        const translate = offset * slideWidth;
        track.style.transition = noAnim ? 'none' : '';
        track.style.transform = `translateX(-${translate}%)`;
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
      }

      const goTo = i => { index = i; update(); };
      const nextSlide = () => { index = (index + 1) % count; update(); };
      const prevSlide = () => { index = (index - 1 + count) % count; update(); };

      const start = () => { if (!autoplay) return; stop(); timer = setInterval(nextSlide, interval); };
      const stop = () => { if (timer) clearInterval(timer); timer = null; };
      const restart = () => { stop(); setTimeout(start, 300); };

      next?.addEventListener('click', () => { nextSlide(); restart(); });
      prev?.addEventListener('click', () => { prevSlide(); restart(); });

      // Swipe (touch)
      let startX = 0;
      car.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; stop(); }, { passive: true });
      car.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) (diff > 0 ? nextSlide() : prevSlide());
        restart();
      }, { passive: true });

      // Hover pause
      car.addEventListener('mouseenter', stop);
      car.addEventListener('mouseleave', start);
      window.addEventListener('resize', () => update(true));

      update(true);
      start();

      car._api = { updatePosition: update, start, stop, goTo };
    });
  })();

  /* ----------------------------
     Smooth Scroll Menu Anchors
  ---------------------------- */
  (() => {
    const links = $$('.menu a[href^="#"]');
    const pageWrap = $('.page-wrap');
    const snapContainer = $('.snap-container');
    if (!snapContainer) return console.warn('Elemen .snap-container tidak ditemukan.');

    links.forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href');
      const target = $(id);
      if (!target) return;

      const navh = window.innerWidth <= 640
        ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navh-mobile')) || 150
        : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navh')) || 88;

      const offset = pageWrap.classList.contains('layout-top') ? navh + 6 : 20;
      const containerTop = snapContainer.getBoundingClientRect().top;
      const elTop = target.getBoundingClientRect().top;
      const scrollTop = snapContainer.scrollTop;

      const targetTop = id === '#home'
        ? 0
        : elTop - containerTop + scrollTop - offset;

      snapContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
    }));
  })();

  /* ----------------------------
     Navbar Layout Switch (on scroll)
  ---------------------------- */
  (() => {
    const pageWrap = $('.page-wrap');
    const scrollContainer = $('.snap-container');
    const firstCategory = $('#home-decoration');
    if (!pageWrap || !scrollContainer || !firstCategory) return console.warn('Elemen untuk observer navbar tidak ditemukan.');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        pageWrap.className = entry.isIntersecting
          ? 'page-wrap layout-split'
          : 'page-wrap layout-top';
      });
    }, {
      root: scrollContainer,
      threshold: 0.1
    });

    observer.observe(firstCategory);
  })();

});
