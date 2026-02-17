// ./src/script.js

document.addEventListener('DOMContentLoaded', function () {
  /* ===========================
   *  MENU MOBILE / OVERLAY
   * =========================== */
  const mobileMenu    = document.getElementById('mobile-menu');
  const mobilePanel   = document.getElementById('mobile-panel');
  const mobileContent = document.getElementById('mobile-content');
  const backdrop      = document.getElementById('mobile-backdrop');
  const openMenuBtn   = document.getElementById('open-menu');
  const closeMenuBtn  = document.getElementById('close-menu');
  const icon          = document.getElementById('menu-icon');
  const mainContent   = document.getElementById('main-content');

  const linksInMenu   = mobileContent ? mobileContent.querySelectorAll('a') : [];

  // Rendre le menu plus accessible : aria-expanded / aria-hidden + focus management
  function setIcon(isOpen) {
    if (!icon) return;
    icon.classList.toggle('fa-bars', !isOpen);
    icon.classList.toggle('fa-times', isOpen);
  }

  function trapFocus(e) {
    if (!mobileMenu || mobileMenu.classList.contains('hidden')) return;
    const focusables = mobileMenu.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (e.key === 'Escape') closeMenu();
  }

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
    if (openMenuBtn) openMenuBtn.setAttribute('aria-expanded', 'true');
    setIcon(true);
    // focus sur le bouton fermer
    if (closeMenuBtn) closeMenuBtn.focus();
    document.addEventListener('keydown', trapFocus);
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
    if (openMenuBtn) {
      openMenuBtn.setAttribute('aria-expanded', 'false');
      openMenuBtn.focus();
    }
    setIcon(false);
    document.removeEventListener('keydown', trapFocus);
  }

  if (openMenuBtn) {
    openMenuBtn.addEventListener('click', () => {
      const isHidden   = mobileMenu ? mobileMenu.classList.contains('hidden') : true;
      const isOpenFlag = mobileMenu ? mobileMenu.classList.contains('open')   : false;
      if (isHidden || !isOpenFlag) openMenu(); else closeMenu();
    });
  }

  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  linksInMenu.forEach((a) => a.addEventListener('click', closeMenu));

  if (mobilePanel) {
    mobilePanel.addEventListener('click', (e) => {
      if (mobileContent && mobileContent.contains(e.target)) {
        const isLinkClick = !!e.target.closest('a');
        if (!isLinkClick) closeMenu();
      } else {
        closeMenu();
      }
    });
  }

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ==================================================
   *  ANIMATION DES ICONES (feature-icon) AU SCROLL
   * ================================================== */
  const featureIcons = document.querySelectorAll('.feature-icon');

  function checkScroll() {
    featureIcons.forEach((iconEl) => {
      const iconPosition = iconEl.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      if (iconPosition < screenPosition) iconEl.classList.add('visible');
    });
  }
  window.addEventListener('scroll', checkScroll);
  checkScroll();

  /* ===========================
   *  CAROUSEL avec Play/Pause
   *  + ARIA améliorée
   * =========================== */
  const carousel = document.querySelector('.carousel');
  if (carousel) {
    const carouselInner = carousel.querySelector('.carousel-inner');
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const toggleBtn = document.getElementById('carousel-toggle');

    let currentIndex = 0;
    const itemCount = carouselItems.length;

    // Respecte les préférences "réduire les animations"
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let autoPlay = !prefersReducedMotion;  // OFF si l’utilisateur préfère moins de mouvement
    let autoInterval = null;
    const AUTOPLAY_MS = 3100;

    function updateIndicators() {
      indicators.forEach((el, i) => {
        const isActive = i === currentIndex;
        el.classList.toggle('active', isActive);
        el.classList.toggle('bg-teal-500/80', isActive);
        el.classList.toggle('bg-gray-300', !isActive);
        el.setAttribute('aria-selected', String(isActive));
        if (isActive) {
          el.setAttribute('aria-current', 'true');
        } else {
          el.removeAttribute('aria-current');
        }
      });
    }

    function updateSlidesAria() {
      carouselItems.forEach((slide, i) => {
        const isActive = i === currentIndex;
        slide.setAttribute('aria-hidden', String(!isActive));
        // si l’utilisateur navigue au clavier, on peut autoriser le focus sur la diapo active uniquement
        slide.tabIndex = isActive ? 0 : -1;
      });
      // Met à jour le live region selon l’état autoplay (annonce quand c’est en pause)
      if (carouselInner) carouselInner.setAttribute('aria-live', autoPlay ? 'off' : 'polite');
    }

    function updateCarousel() {
      if (!carouselInner) return;
      carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateIndicators();
      updateSlidesAria();
    }

    function goTo(index) {
      currentIndex = (index + itemCount) % itemCount;
      updateCarousel();
    }

    function next() { goTo(currentIndex + 1); }
    function prev() { goTo(currentIndex - 1); }

function startAutoPlay() {
  stopAutoPlay();
  autoInterval = setInterval(next, AUTOPLAY_MS);

  if (toggleBtn) {
    const iconImg = document.getElementById('carousel-icon'); // <-- ton <img>
    toggleBtn.setAttribute('aria-pressed', 'true');
    toggleBtn.setAttribute('aria-label', 'Mettre en pause le carrousel');
    if (iconImg) iconImg.src = './src/images/pause.svg';
  }

  autoPlay = true;
  updateSlidesAria();
}

function stopAutoPlay() {
  if (autoInterval) clearInterval(autoInterval);
  autoInterval = null;

  if (toggleBtn) {
    const iconImg = document.getElementById('carousel-icon');
    toggleBtn.setAttribute('aria-pressed', 'false');
    toggleBtn.setAttribute('aria-label', 'Lancer la lecture du carrousel');
    if (iconImg) iconImg.src = './src/images/play.svg';
  }

  autoPlay = false;
  updateSlidesAria();
}

    // boutons précédent / suivant
    if (prevBtn) prevBtn.addEventListener('click', () => {
      prev();
      if (autoPlay) startAutoPlay(); // reset le timer
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      next();
      if (autoPlay) startAutoPlay();
    });

    // indicateurs cliquables
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        goTo(index);
        if (autoPlay) startAutoPlay();
      });
      // activation clavier (Enter/Space) gérée nativement par <button>
    });

    // Play/Pause
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        autoPlay = !autoPlay;
        if (autoPlay) startAutoPlay(); else stopAutoPlay();
      });
    }

    // clavier global
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { prev(); if (autoPlay) startAutoPlay(); }
      if (e.key === 'ArrowRight') { next(); if (autoPlay) startAutoPlay(); }
    });

    // init
    updateCarousel();
    if (autoPlay) setTimeout(startAutoPlay, 100);
  }
  // Scroll vers le haut au clic sur le logo
document.querySelectorAll('.logo').forEach(logo => {
  logo.addEventListener('click', (e) => {
    e.preventDefault(); // évite de suivre un lien si tu mets <a>
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

  /* ===========================
   *  Apparition des sections au scroll
   * =========================== */
  (function setupRevealOnScroll() {
    const prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sélectionne les éléments marqués pour l’animation
    const revealEls = document.querySelectorAll('[data-reveal]');

    // Si l’utilisateur préfère moins d’animations → on les montre directement
    if (prefersReduced) {
      revealEls.forEach(el => el.classList.add('is-visible'));
      return;
    }

    // Ajoute l’état initial
    revealEls.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // si tu veux animer une seule fois, on unobserve après
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -10% 0px', // lance un peu avant le centre
      threshold: 0.1
    });

    revealEls.forEach(el => io.observe(el));
  })();


// Ancrage avec offset (téléportation sans animation)
(() => {
  const header = document.querySelector('header');
  const getOffset = () => (header?.offsetHeight || 0) + 8; // petit espace sous le header

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const y = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
      // téléportation instantanée
      window.scrollTo(0, y);
    });
  });
})();



});
