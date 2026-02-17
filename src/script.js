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
 *  CAROUSEL infini (sans bug)
 *  + Play/Pause + ARIA
 * =========================== */
const carousel = document.querySelector('.carousel');
if (carousel) {
  const carouselInner = carousel.querySelector('.carousel-inner');
  const originalItems = Array.from(carousel.querySelectorAll('.carousel-item'));
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const indicators = Array.from(document.querySelectorAll('.carousel-indicator'));
  const toggleBtn = document.getElementById('carousel-toggle');

  if (!carouselInner || originalItems.length === 0) {
    console.warn('Carousel: éléments manquants (.carousel-inner / .carousel-item)');
  } else {
    // IMPORTANT pour éviter de "voir" le jump invisible
    carousel.classList.add('overflow-hidden');

    // 1) Clones pour boucle infinie
    const firstClone = originalItems[0].cloneNode(true);
    const lastClone  = originalItems[originalItems.length - 1].cloneNode(true);
    firstClone.setAttribute('data-clone', 'true');
    lastClone.setAttribute('data-clone', 'true');

    carouselInner.insertBefore(lastClone, originalItems[0]);
    carouselInner.appendChild(firstClone);

    // Liste complète (avec clones)
    const items = Array.from(carousel.querySelectorAll('.carousel-item'));
    const realCount = originalItems.length;

    // On démarre sur la 1ère vraie slide (index 1 car index 0 = clone du dernier)
    let currentIndex = 1;

    // Réduire animations
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let autoPlay = !prefersReducedMotion;
    let autoInterval = null;
    const AUTOPLAY_MS = 3100;

    // Anti-bug multi-clic pendant transition
    let isAnimating = false;
    const TRANSITION_MS = 500; // doit correspondre à duration-500
    let unlockTimer = null;

    const setTransition = (enabled) => {
      // enabled: true => utilise la transition Tailwind
      // enabled: false => repositionnement instantané
      carouselInner.style.transition = enabled ? '' : 'none';
    };

    const getRealIndex = () => (currentIndex - 1 + realCount) % realCount;

    function updateIndicators() {
      const idx = getRealIndex();
      indicators.forEach((el, i) => {
        const isActive = i === idx;
        el.classList.toggle('active', isActive);
        el.classList.toggle('bg-teal-500/80', isActive);
        el.classList.toggle('bg-gray-300', !isActive);
        el.setAttribute('aria-selected', String(isActive));
        if (isActive) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });
    }

    function updateSlidesAria() {
      // Clones toujours cachés, et on expose au focus seulement la slide réelle active
      items.forEach((slide) => {
        if (slide.getAttribute('data-clone') === 'true') {
          slide.setAttribute('aria-hidden', 'true');
          slide.tabIndex = -1;
        }
      });

      const activeReal = getRealIndex();
      originalItems.forEach((slide, i) => {
        const isActive = i === activeReal;
        slide.setAttribute('aria-hidden', String(!isActive));
        slide.tabIndex = isActive ? 0 : -1;
      });

      carouselInner.setAttribute('aria-live', autoPlay ? 'off' : 'polite');
    }

    function updateCarousel() {
      carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateIndicators();
      updateSlidesAria();
    }

    function lockControls(locked) {
      // optionnel: évite spam clics + améliore feeling
      if (prevBtn) prevBtn.disabled = locked;
      if (nextBtn) nextBtn.disabled = locked;
      // (les indicateurs restent cliquables, mais on les bloque aussi via isAnimating)
      isAnimating = locked;
    }

    function goToInternal(index) {
      if (isAnimating) return;

      // borne sécurité (0..items.length-1)
      const max = items.length - 1;
      if (index < 0) index = 0;
      if (index > max) index = max;

      lockControls(true);
      clearTimeout(unlockTimer);

      currentIndex = index;
      setTransition(true);
      updateCarousel();

      // fallback si transitionend ne se déclenche pas (rare)
      unlockTimer = setTimeout(() => {
        lockControls(false);
      }, TRANSITION_MS + 80);
    }

    function next() { goToInternal(currentIndex + 1); }
    function prev() { goToInternal(currentIndex - 1); }

    // 2) Après transition: si clone => jump invisible + unlock
    carouselInner.addEventListener('transitionend', (e) => {
      if (e.propertyName && e.propertyName !== 'transform') return;

      // clone du 1er (tout à droite)
      if (currentIndex === items.length - 1) {
        setTransition(false);
        currentIndex = 1;
        updateCarousel();
        carouselInner.offsetHeight; // force reflow
        setTransition(true);
      }

      // clone du dernier (tout à gauche)
      if (currentIndex === 0) {
        setTransition(false);
        currentIndex = realCount;
        updateCarousel();
        carouselInner.offsetHeight;
        setTransition(true);
      }

      clearTimeout(unlockTimer);
      lockControls(false);
    });

    // Autoplay + icônes
    function startAutoPlay() {
      stopAutoPlay();
      autoInterval = setInterval(next, AUTOPLAY_MS);

      if (toggleBtn) {
        const iconImg = document.getElementById('carousel-icon');
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.setAttribute('aria-label', 'Mettre en pause le carrousel');
        if (iconImg) iconImg.src = '/src/images/pause.svg';
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
        if (iconImg) iconImg.src = '/src/images/play.svg';
      }

      autoPlay = false;
      updateSlidesAria();
    }

    // Flèches
    if (prevBtn) prevBtn.addEventListener('click', () => {
      prev();
      if (autoPlay) startAutoPlay(); // reset timer
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      next();
      if (autoPlay) startAutoPlay();
    });

    // Indicateurs
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        if (isAnimating) return;
        goToInternal(index + 1); // +1 car index 0 interne = clone
        if (autoPlay) startAutoPlay();
      });
    });

    // Play/Pause
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        autoPlay ? stopAutoPlay() : startAutoPlay();
      });
    }

    // Clavier global
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { prev(); if (autoPlay) startAutoPlay(); }
      if (e.key === 'ArrowRight') { next(); if (autoPlay) startAutoPlay(); }
    });

    // Init: se placer sur la vraie slide 1 sans transition
    setTransition(false);
    updateCarousel();
    requestAnimationFrame(() => setTransition(true));

    if (autoPlay) setTimeout(startAutoPlay, 100);
  }
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
