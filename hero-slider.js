// Hero Background Slider Management
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDl_lGXfhPrgB5MtFAfOwkDp1ralQw6Flc",
    authDomain: "atelia-a0e81.firebaseapp.com",
    projectId: "atelia-a0e81",
    storageBucket: "atelia-a0e81.firebasestorage.app",
    messagingSenderId: "364749141331",
    appId: "1:364749141331:web:547dcb0e8592413cd01da6",
    measurementId: "G-086T2JDMSC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class HeroSlider {
    constructor() {
        this.slides = [];
        this.currentSlideIndex = 0;
        this.sliderContainer = document.getElementById('heroBackgroundSlider');
        this.slideInterval = null;
        this.slideDuration = 5000; // 5 seconds per slide
        this.settings = { enabled: true, duration: 5 };
        
        this.init();
    }

    async init() {
        try {
            await this.loadSlides();
            this.renderSlides();
            if (this.settings.enabled !== false) {
                this.startSlider();
            }
        } catch (error) {
            console.error('Error initializing hero slider:', error);
        }
    }

    async loadSlides() {
        try {
            // Use Cloudinary CDN URLs for optimized image delivery
            this.slides = [
                { id: 1, imageUrl: 'https://res.cloudinary.com/dclyw4klj/image/upload/v1762287336/atelia/services/m0rssae3bwxsia7nifrc.jpg', order: 1 },
                { id: 2, imageUrl: 'https://res.cloudinary.com/dclyw4klj/image/upload/v1762288032/ee26cb46103027.5847f4469f45c_whm6bp.jpg', order: 2 },
                { id: 3, imageUrl: 'https://res.cloudinary.com/dclyw4klj/image/upload/v1762288031/Demardi_Donvale__Tatjana-Plitt_075_pvk1gj.webp', order: 3 },
                { id: 4, imageUrl: 'https://res.cloudinary.com/dclyw4klj/image/upload/v1762288031/ad98c846103027.5847f4469d5fb_o6uyt1.jpg', order: 4 }
            ];

            console.log('Loaded hero slides from Cloudinary:', this.slides.length);
        } catch (error) {
            console.error('Error loading hero slides:', error);
        }
    }

async loadSettings() {
    // Settings are now hardcoded for local images
    this.settings = { enabled: true, duration: 5 };
    this.slideDuration = 5000; // 5 seconds in milliseconds
}

    renderSlides() {
        if (!this.sliderContainer) {
            console.error('Slider container not found!');
            return;
        }

        // Clear existing slides
        this.sliderContainer.innerHTML = '';

        if (this.slides.length === 0) {
            console.log('No slides to render');
            return;
        }

        // Create slide elements
        this.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'hero-slide';
            slideElement.style.backgroundImage = `url('${slide.imageUrl}')`;
            
            console.log(`Loading slide ${index + 1}: ${slide.imageUrl}`);
            
            if (index === 0) {
                slideElement.classList.add('active');
            }
            
            this.sliderContainer.appendChild(slideElement);
        });

        console.log(`✓ Successfully rendered ${this.slides.length} hero slides`);
        console.log('✓ Slider will change every 5 seconds');
    }

    startSlider() {
        if (this.slides.length <= 1) return;

        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.slideDuration);
    }

    stopSlider() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    nextSlide() {
        const slideElements = this.sliderContainer.querySelectorAll('.hero-slide');
        if (slideElements.length === 0) return;

        // Remove active class from current slide
        slideElements[this.currentSlideIndex].classList.remove('active');

        // Move to next slide
        this.currentSlideIndex = (this.currentSlideIndex + 1) % slideElements.length;

        // Add active class to new slide
        slideElements[this.currentSlideIndex].classList.add('active');
    }

    previousSlide() {
        const slideElements = this.sliderContainer.querySelectorAll('.hero-slide');
        if (slideElements.length === 0) return;

        // Remove active class from current slide
        slideElements[this.currentSlideIndex].classList.remove('active');

        // Move to previous slide
        this.currentSlideIndex = this.currentSlideIndex === 0 
            ? slideElements.length - 1 
            : this.currentSlideIndex - 1;

        // Add active class to new slide
        slideElements[this.currentSlideIndex].classList.add('active');
    }

    goToSlide(index) {
        const slideElements = this.sliderContainer.querySelectorAll('.hero-slide');
        if (slideElements.length === 0 || index < 0 || index >= slideElements.length) return;

        // Remove active class from current slide
        slideElements[this.currentSlideIndex].classList.remove('active');

        // Set new slide index
        this.currentSlideIndex = index;

        // Add active class to new slide
        slideElements[this.currentSlideIndex].classList.add('active');
    }

    // Pause slider on hover
    pauseOnHover() {
        if (this.sliderContainer) {
            this.sliderContainer.addEventListener('mouseenter', () => {
                this.stopSlider();
            });

            this.sliderContainer.addEventListener('mouseleave', () => {
                this.startSlider();
            });
        }
    }

    // Refresh slides (useful for admin updates)
    async refreshSlides() {
        this.stopSlider();
        await this.loadSlides();
        this.loadSettings();
        this.renderSlides();
        this.currentSlideIndex = 0;
        if (this.settings.enabled !== false) {
            this.startSlider();
        }
    }
}

// Initialize the hero slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.heroSlider = new HeroSlider();
});

// Export for admin use
export { HeroSlider };
