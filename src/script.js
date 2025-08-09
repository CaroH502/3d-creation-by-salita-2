// script.js

document.addEventListener('DOMContentLoaded', function () {
  /* ===========================
   *  MENU MOBILE / OVERLAY
   * =========================== */
  const mobileMenu   = document.getElementById('mobile-menu');     // conteneur plein écran (overlay + panneau)
  const mobilePanel  = document.getElementById('mobile-panel');    // panneau blanc full width
  const mobileContent= document.getElementById('mobile-content');  // colonne étroite (menu + CTA)
  const backdrop     = document.getElementById('mobile-backdrop'); // overlay sombre
  const openMenuBtn  = document.getElementById('open-menu');       // bouton burger dans le header
  const closeMenuBtn = document.getElementById('close-menu');      // bouton X dans le panneau
  const icon         = document.getElementById('menu-icon');       // <i class="fas fa-bars | fa-times">

  // Tous les liens à l'intérieur du contenu (entrées + CTA)
  const linksInMenu  = mobileContent ? mobileContent.querySelectorAll('a') : [];

  function setIcon(isOpen) {
    if (!icon) return;
    icon.classList.toggle('fa-bars', !isOpen);
    icon.classList.toggle('fa-times', isOpen);
  }

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('open');
    document.body.classList.add('overflow-hidden'); // bloque le scroll BG
    setIcon(true);
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('overflow-hidden'); // réactive le scroll BG
    setIcon(false);
  }

  // Bouton burger = toggle
  if (openMenuBtn) {
    openMenuBtn.addEventListener('click', () => {
      const isHidden   = mobileMenu ? mobileMenu.classList.contains('hidden') : true;
      const isOpenFlag = mobileMenu ? mobileMenu.classList.contains('open')   : false;
      if (isHidden || !isOpenFlag) openMenu(); else closeMenu();
    });
  }

  // Bouton X dans le panneau
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);

  // Clic overlay sombre => ferme
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // Clic sur un lien (entrées + CTA) => ferme
  linksInMenu.forEach((a) => a.addEventListener('click', closeMenu));

  // Clic sur le panneau blanc : si ce n’est PAS un lien (menu/CTA), on ferme
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

  // Touche ESC => ferme
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
  let autoPlay = true;           // autoplay ON par défaut
  let autoInterval = null;
  const AUTOPLAY_MS =3100;

  function updateIndicators() {
    indicators.forEach((el, i) => {
      el.classList.toggle('active', i === currentIndex);
      el.classList.toggle('bg-teal-500/80', i === currentIndex);
      el.classList.toggle('bg-gray-300', i !== currentIndex);
    });
  }

  function updateCarousel() {
    if (!carouselInner) return;
    carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateIndicators();
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
      const iconEl = toggleBtn.querySelector('i');
      const textEl = toggleBtn.querySelector('span');
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.setAttribute('aria-label', 'Mettre en pause le carrousel');
      if (iconEl) iconEl.className = 'fas fa-pause';
    }
  }

  function stopAutoPlay() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = null;
    if (toggleBtn) {
      const iconEl = toggleBtn.querySelector('i');
      const textEl = toggleBtn.querySelector('span');
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.setAttribute('aria-label', 'Lancer la lecture du carrousel');
      if (iconEl) iconEl.className = 'fas fa-play';
    }
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
  });

  // Play/Pause
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      autoPlay = !autoPlay;
      if (autoPlay) startAutoPlay(); else stopAutoPlay();
    });
  }

  // clavier (accessibilité)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prev(); if (autoPlay) startAutoPlay(); }
    if (e.key === 'ArrowRight') { next(); if (autoPlay) startAutoPlay(); }
  });

  // init
  updateCarousel();
  setTimeout(() => { if (autoPlay) startAutoPlay(); }, 100);
}

});
