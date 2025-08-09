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
    document.body.classList.add('overflow-hidden');
    setIcon(true);
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('overflow-hidden');
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
      // Si on a cliqué dans la colonne de contenu :
      if (mobileContent && mobileContent.contains(e.target)) {
        const isLinkClick = !!e.target.closest('a');
        if (!isLinkClick) {
          // clic dans la zone blanche du contenu (mais pas sur un lien) -> fermer
          closeMenu();
        }
      } else {
        // clic dans la zone blanche en dehors de la colonne de contenu -> fermer
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
   *  CAROUSEL
   * =========================== */
  const carousel = document.querySelector('.carousel');
  if (carousel) {
    const carouselInner = document.querySelector('.carousel-inner');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicators = document.querySelectorAll('.carousel-indicator');

    let currentIndex = 0;
    const itemCount = carouselItems.length;

    function updateCarousel() {
      if (!carouselInner) return;
      carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + itemCount) % itemCount;
      updateCarousel();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % itemCount;
      updateCarousel();
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
      });
    });

    setInterval(() => {
      currentIndex = (currentIndex + 1) % itemCount;
      updateCarousel();
    }, 5000);
  }
});
