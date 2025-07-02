// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    const openMenuBtn = document.getElementById('open-menu');
    const closeMenuBtn = document.getElementById('close-menu');

openMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
})

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    }
    

    // Feature Icons Animation on Scroll
    const featureIcons = document.querySelectorAll('.feature-icon');
    
    function checkScroll() {
        featureIcons.forEach(icon => {
            const iconPosition = icon.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (iconPosition < screenPosition) {
                icon.classList.add('visible');
            }
        });
    }
    
    window.addEventListener('scroll', checkScroll);
    // Initial check in case elements are already in view when page loads
    checkScroll();

    // Carousel Functionality
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
            carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update indicators
            indicators.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + itemCount) % itemCount;
                updateCarousel();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % itemCount;
                updateCarousel();
            });
        }
        
        // Allow clicking on indicators
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });
        
        // Auto-advance carousel every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % itemCount;
            updateCarousel();
        }, 5000);
    }
});