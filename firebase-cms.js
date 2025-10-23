// Firebase CMS Integration for Main Landing Page
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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

// Load all content when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadAllContent();
    } catch (error) {
        console.error('Error loading content:', error);
        // Page will show default content if Firebase fails
    }
});

async function loadAllContent() {
    // Load all sections in parallel for better performance
    await Promise.all([
        loadHeroSection(),
        loadProjectsSection(),
        loadTestimonialsSection(),
        loadAboutSection(),
        loadServicesSection(),
        loadNewsSection(),
        loadCTASection(),
        loadContactInfo()
    ]);
}

// Load Hero Section
async function loadHeroSection() {
    try {
        const heroDoc = await getDoc(doc(db, 'content', 'hero'));
        if (heroDoc.exists()) {
            const data = heroDoc.data();
            
            const headline = document.querySelector('.hero-headline');
            const button = document.querySelector('.discovery-call-btn');
            
            if (headline && data.headline) {
                headline.textContent = data.headline;
            }
            if (button && data.buttonText) {
                button.textContent = data.buttonText;
            }
        }
    } catch (error) {
        console.error('Error loading hero section:', error);
    }
}

// Load Projects Section
async function loadProjectsSection() {
    try {
        // Load section header
        const projectsDoc = await getDoc(doc(db, 'content', 'projects'));
        if (projectsDoc.exists()) {
            const data = projectsDoc.data();
            
            const title = document.querySelector('.projects-title');
            const description = document.querySelector('.projects-description p');
            const cta = document.querySelector('.view-projects-link');
            
            if (title && data.title) title.textContent = data.title;
            if (description && data.description) description.textContent = data.description;
            if (cta && data.cta) cta.textContent = data.cta;
        }

        // Load project items (limited to 4 for homepage)
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsGrid = document.querySelector('.projects-grid');
        
        if (projectsGrid && !projectsSnapshot.empty) {
            projectsGrid.innerHTML = ''; // Clear existing
            
            // Limit to 4 projects on homepage to avoid overload
            let count = 0;
            const maxProjects = 4;
            
            projectsSnapshot.forEach(doc => {
                if (count < maxProjects) {
                    const project = doc.data();
                    const projectItem = document.createElement('div');
                    projectItem.className = 'project-item stagger-item architectural-hover';
                    projectItem.innerHTML = `
                        <div class="project-image">
                            <img src="${project.image || ''}" alt="${project.alt || project.name}">
                        </div>
                        <h3 class="project-caption">${project.name || ''}</h3>
                    `;
                    projectsGrid.appendChild(projectItem);
                    count++;
                }
            });
        }
        // If no projects in Firestore, keep the default HTML content
    } catch (error) {
        console.error('Error loading projects section:', error);
    }
}

// Load Testimonials Section
async function loadTestimonialsSection() {
    try {
        const testimonialsDoc = await getDoc(doc(db, 'content', 'testimonials'));
        const testimonialsSection = document.getElementById('testimonials');
        
        if (testimonialsSection) {
            if (testimonialsDoc.exists()) {
                const data = testimonialsDoc.data();
                
                // Hide section if disabled
                if (data.enabled === false) {
                    testimonialsSection.style.display = 'none';
                    return;
                } else {
                    testimonialsSection.style.display = 'block';
                }
                
                // Update content
                const title = document.querySelector('.testimonials-title');
                const description = document.querySelector('.testimonials-description');
                const cta = document.querySelector('.view-testimonials-link');
                const iframe = document.querySelector('.testimonials-video iframe');
                
                if (title && data.title) title.textContent = data.title;
                if (description && data.description) description.textContent = data.description;
                if (cta && data.cta) cta.textContent = data.cta;
                
                // Update video
                if (iframe && data.embedUrl) {
                    iframe.src = data.embedUrl;
                    if (data.videoTitle) {
                        iframe.title = data.videoTitle;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading testimonials section:', error);
    }
}

// Load About Section
async function loadAboutSection() {
    try {
        const aboutDoc = await getDoc(doc(db, 'content', 'about'));
        if (aboutDoc.exists()) {
            const data = aboutDoc.data();
            
            const title = document.querySelector('.about-title');
            const descriptions = document.querySelectorAll('.about-description');
            const cta = document.querySelector('.learn-more-link');
            
            if (title && data.title) title.textContent = data.title;
            if (descriptions[0] && data.description1) descriptions[0].textContent = data.description1;
            if (descriptions[1] && data.description2) descriptions[1].textContent = data.description2;
            if (cta && data.cta) cta.textContent = data.cta;
        }
    } catch (error) {
        console.error('Error loading about section:', error);
    }
}

// Load Services Section
async function loadServicesSection() {
    try {
        // Load section header
        const servicesDoc = await getDoc(doc(db, 'content', 'services'));
        if (servicesDoc.exists()) {
            const data = servicesDoc.data();
            
            const title = document.querySelector('.services-title');
            const tagline = document.querySelector('.services-tagline');
            const cta = document.querySelector('.explore-services-btn');
            
            if (title && data.title) title.textContent = data.title;
            if (tagline && data.tagline) tagline.textContent = data.tagline;
            if (cta && data.cta) cta.textContent = data.cta;
        }

        // Load service items (limited to 3 for homepage)
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const servicesGrid = document.querySelector('.services-grid');
        
        if (servicesGrid && !servicesSnapshot.empty) {
            servicesGrid.innerHTML = ''; // Clear existing
            
            // Limit to 3 services on homepage to avoid overload
            let count = 0;
            const maxServices = 3;
            
            servicesSnapshot.forEach(doc => {
                if (count < maxServices) {
                    const service = doc.data();
                    const serviceCard = document.createElement('div');
                    serviceCard.className = 'service-card stagger-item architectural-hover';
                    serviceCard.innerHTML = `
                        <div class="service-image">
                            <img src="${service.image || ''}" alt="${service.alt || service.name}">
                        </div>
                        <h3 class="service-name">${service.name || ''}</h3>
                        <a href="#${service.name ? service.name.toLowerCase().replace(/\s+/g, '-') : ''}" class="service-link">Learn more →</a>
                    `;
                    servicesGrid.appendChild(serviceCard);
                    count++;
                }
            });
        }
        // If no services in Firestore, keep the default HTML content
    } catch (error) {
        console.error('Error loading services section:', error);
    }
}

// Load News Section
async function loadNewsSection() {
    try {
        // Load section header
        const newsDoc = await getDoc(doc(db, 'content', 'news'));
        if (newsDoc.exists()) {
            const data = newsDoc.data();
            
            const title = document.querySelector('.news-title');
            const tagline = document.querySelector('.news-tagline');
            const cta = document.querySelector('.explore-news-btn');
            
            if (title && data.title) title.textContent = data.title;
            if (tagline && data.tagline) tagline.textContent = data.tagline;
            if (cta && data.cta) cta.textContent = data.cta;
        }

        // Load news items (limited to 4 for homepage)
        const newsSnapshot = await getDocs(collection(db, 'news'));
        const newsGrid = document.querySelector('.news-grid');
        
        if (newsGrid && !newsSnapshot.empty) {
            newsGrid.innerHTML = ''; // Clear existing
            
            // Limit to 4 news items on homepage to avoid overload
            let count = 0;
            const maxNews = 4;
            
            newsSnapshot.forEach(doc => {
                if (count < maxNews) {
                    const news = doc.data();
                    const newsCard = document.createElement('article');
                    newsCard.className = 'news-card stagger-item architectural-hover';
                    newsCard.innerHTML = `
                        <div class="news-image">
                            <img src="${news.image || ''}" alt="${news.alt || news.title}">
                        </div>
                        <div class="news-content">
                            <span class="news-date">${news.date || ''}</span>
                            <h3 class="news-article-title">${news.title || ''}</h3>
                            <a href="#${news.title ? news.title.toLowerCase().replace(/\s+/g, '-') : ''}" class="news-link">${news.linkText || 'Learn more'}</a>
                        </div>
                    `;
                    newsGrid.appendChild(newsCard);
                    count++;
                }
            });
        }
        // If no news in Firestore, keep the default HTML content
    } catch (error) {
        console.error('Error loading news section:', error);
    }
}

// Load CTA Section
async function loadCTASection() {
    try {
        const ctaDoc = await getDoc(doc(db, 'content', 'cta'));
        if (ctaDoc.exists()) {
            const data = ctaDoc.data();
            
            const headline = document.querySelector('.cta-headline');
            const description = document.querySelector('.cta-description');
            const button = document.querySelector('.cta-button');
            
            if (headline && data.headline) headline.textContent = data.headline;
            if (description && data.description) description.textContent = data.description;
            if (button && data.buttonText) button.textContent = data.buttonText;
        }
    } catch (error) {
        console.error('Error loading CTA section:', error);
    }
}

// Load Contact Information
async function loadContactInfo() {
    try {
        const settingsDoc = await getDoc(doc(db, 'content', 'settings'));
        if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            
            // Update phone numbers in header
            const phoneElements = document.querySelectorAll('.phone-number');
            phoneElements.forEach(element => {
                if (data.contactPhone) {
                    element.textContent = data.contactPhone;
                }
            });
            
            // Update phone numbers in footer
            const footerPhoneElements = document.querySelectorAll('li strong');
            footerPhoneElements.forEach(element => {
                if (element.textContent.includes('Phone:')) {
                    const phoneLi = element.parentElement;
                    if (data.contactPhone) {
                        phoneLi.innerHTML = `<strong>Phone:</strong> ${data.contactPhone}`;
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading contact info:', error);
    }
}

// Export for testing
export { loadAllContent };

