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
        console.log('Starting to load all content...');
        await loadAllContent();
        console.log('Finished loading all content');
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
        console.log('Loading projects section...');
        
        // Load section header first
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

        // Load project items
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsGrid = document.getElementById('homeProjectsGrid');
        
        console.log('Projects found:', projectsSnapshot.size);
        
        if (projectsGrid) {
            // Always clear and rebuild
            projectsGrid.innerHTML = '';
            
            if (projectsSnapshot.size > 0) {
                console.log('Loading projects from Firebase...');
                let count = 0;
                projectsSnapshot.forEach(docSnapshot => {
                    if (count < 4) { // Limit to 4 for homepage
                        const project = docSnapshot.data();
                        const projectId = docSnapshot.id;
                        const projectItem = document.createElement('div');
                        projectItem.className = 'project-item stagger-item architectural-hover';
                        
                        // Make project clickable
                        projectItem.style.cursor = 'pointer';
                        projectItem.onclick = () => {
                            window.location.href = `project-detail.html?id=${projectId}`;
                        };
                        
                        // Get the main image (first image from array or fallback to single image field)
                        const mainImage = (project.images && project.images.length > 0) 
                            ? project.images[0] 
                            : (project.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80');
                        
                        projectItem.innerHTML = `
                            <div class="project-image">
                                <img src="${mainImage}" alt="${project.alt || project.name || 'Project'}">
                            </div>
                            <h3 class="project-caption">${project.name || 'Project'}</h3>
                        `;
                        projectsGrid.appendChild(projectItem);
                        count++;
                    }
                });
                console.log('Loaded', count, 'projects from Firebase');
                
                // Apply stagger animation to make projects visible
                const items = projectsGrid.querySelectorAll('.stagger-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            } else {
                console.log('No projects in Firebase, loading default content...');
                // Load default content
                projectsGrid.innerHTML = `
                    <div class="project-item stagger-item architectural-hover">
                        <div class="project-image">
                            <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Eltham 139 - Modern living space with vaulted ceiling">
                        </div>
                        <h3 class="project-caption">Preston</h3>
                    </div>
                    <div class="project-item stagger-item architectural-hover">
                        <div class="project-image">
                            <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Southbank - Modern kitchen with dark cabinetry">
                        </div>
                        <h3 class="project-caption">Southbank</h3>
                    </div>
                    <div class="project-item stagger-item architectural-hover">
                        <div class="project-image">
                            <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Hawthorn - Charming white house exterior">
                        </div>
                        <h3 class="project-caption">Hawthorn</h3>
                    </div>
                `;
                console.log('Loaded default projects content');
                
                // Apply stagger animation to make projects visible
                const items = projectsGrid.querySelectorAll('.stagger-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        }
        
        console.log('Projects section loaded successfully');
    } catch (error) {
        console.error('Error loading projects section:', error);
        // Fallback: ensure default content is shown
        const projectsGrid = document.getElementById('homeProjectsGrid');
        if (projectsGrid && projectsGrid.innerHTML === '') {
            projectsGrid.innerHTML = `
                <div class="project-item stagger-item architectural-hover">
                    <div class="project-image">
                        <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Eltham 139 - Modern living space with vaulted ceiling">
                    </div>
                    <h3 class="project-caption">Preston</h3>
                </div>
                <div class="project-item stagger-item architectural-hover">
                    <div class="project-image">
                        <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Southbank - Modern kitchen with dark cabinetry">
                    </div>
                    <h3 class="project-caption">Southbank</h3>
                </div>
                <div class="project-item stagger-item architectural-hover">
                    <div class="project-image">
                        <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Hawthorn - Charming white house exterior">
                    </div>
                    <h3 class="project-caption">Hawthorn</h3>
                </div>
            `;
            
            // Apply stagger animation to make projects visible
            const items = projectsGrid.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
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
        console.log('Loading services section...');
        
        // Load section header first
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

        // Load service items
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const servicesGrid = document.getElementById('homeServicesGrid');
        
        console.log('Services found:', servicesSnapshot.size);
        
        if (servicesGrid) {
            // Always clear and rebuild
            servicesGrid.innerHTML = '';
            
            if (servicesSnapshot.size > 0) {
                console.log('Loading services from Firebase...');
                let count = 0;
                servicesSnapshot.forEach(docSnapshot => {
                    if (count < 3) { // Limit to 3 for homepage
                        const service = docSnapshot.data();
                        const serviceId = docSnapshot.id;
                        const serviceCard = document.createElement('div');
                        serviceCard.className = 'service-card stagger-item architectural-hover';
                        
                        // Make service clickable
                        serviceCard.style.cursor = 'pointer';
                        serviceCard.onclick = () => {
                            window.location.href = `service-detail.html?id=${serviceId}`;
                        };
                        
                        // Get the main image (first image from array or fallback to single image field)
                        const mainImage = (service.images && service.images.length > 0) 
                            ? service.images[0] 
                            : (service.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80');
                        
                        serviceCard.innerHTML = `
                            <div class="service-image">
                                <img src="${mainImage}" alt="${service.alt || service.name || 'Service'}">
                            </div>
                            <h3 class="service-name">${service.name || 'Service'}</h3>
                            <a href="service-detail.html?id=${serviceId}" class="service-link" onclick="event.stopPropagation();">Learn more →</a>
                        `;
                        servicesGrid.appendChild(serviceCard);
                        count++;
                    }
                });
                console.log('Loaded', count, 'services from Firebase');
                
                // Apply stagger animation to make services visible
                const items = servicesGrid.querySelectorAll('.stagger-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            } else {
                console.log('No services in Firebase, loading default content...');
                // Load default content
                servicesGrid.innerHTML = `
                    <div class="service-card stagger-item architectural-hover">
                        <div class="service-image">
                            <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Site preparation - Construction site">
                        </div>
                        <h3 class="service-name">Site preparation</h3>
                        <a href="#site-preparation" class="service-link">Learn more →</a>
                    </div>
                    <div class="service-card stagger-item architectural-hover">
                        <div class="service-image">
                            <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Final finishes - Interior finishing">
                        </div>
                        <h3 class="service-name">Final finishes</h3>
                        <a href="#final-finishes" class="service-link">Learn more →</a>
                    </div>
                    <div class="service-card stagger-item architectural-hover">
                        <div class="service-image">
                            <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Custom Renovation - Luxury renovation">
                        </div>
                        <h3 class="service-name">Custom Renovation</h3>
                        <a href="#custom-renovation" class="service-link">Learn more →</a>
                    </div>
                `;
                console.log('Loaded default services content');
                
                // Apply stagger animation to make services visible
                const items = servicesGrid.querySelectorAll('.stagger-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        }
        
        console.log('Services section loaded successfully');
    } catch (error) {
        console.error('Error loading services section:', error);
        // Fallback: ensure default content is shown
        const servicesGrid = document.getElementById('homeServicesGrid');
        if (servicesGrid && servicesGrid.innerHTML === '') {
            servicesGrid.innerHTML = `
                <div class="service-card stagger-item architectural-hover">
                    <div class="service-image">
                        <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Site preparation - Construction site">
                    </div>
                    <h3 class="service-name">Site preparation</h3>
                    <a href="#site-preparation" class="service-link">Learn more →</a>
                </div>
                <div class="service-card stagger-item architectural-hover">
                    <div class="service-image">
                        <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Final finishes - Interior finishing">
                    </div>
                    <h3 class="service-name">Final finishes</h3>
                    <a href="#final-finishes" class="service-link">Learn more →</a>
                </div>
                <div class="service-card stagger-item architectural-hover">
                    <div class="service-image">
                        <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Custom Renovation - Luxury renovation">
                    </div>
                    <h3 class="service-name">Custom Renovation</h3>
                    <a href="#custom-renovation" class="service-link">Learn more →</a>
                </div>
            `;
            
            // Apply stagger animation to make services visible
            const items = servicesGrid.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
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
            // Only clear existing content if we have data to replace it with
            newsGrid.innerHTML = '';
            
            // Limit to 4 news items on homepage to avoid overload
            let count = 0;
            const maxNews = 4;
            
            newsSnapshot.forEach(docSnapshot => {
                if (count < maxNews) {
                    const news = docSnapshot.data();
                    const newsId = docSnapshot.id;
                    const newsCard = document.createElement('article');
                    newsCard.className = 'news-card stagger-item architectural-hover';
                    
                    // Make news clickable
                    newsCard.style.cursor = 'pointer';
                    newsCard.onclick = () => {
                        window.location.href = `news-detail.html?id=${newsId}`;
                    };
                    
                    // Get the main image (first image from array or fallback to single image field)
                    const mainImage = (news.images && news.images.length > 0) 
                        ? news.images[0] 
                        : (news.image || '');
                    
                    newsCard.innerHTML = `
                        <div class="news-image">
                            <img src="${mainImage}" alt="${news.alt || news.title}">
                        </div>
                        <div class="news-content">
                            <span class="news-date">${news.date || ''}</span>
                            <h3 class="news-article-title">${news.title || ''}</h3>
                            <a href="news-detail.html?id=${newsId}" class="news-link" onclick="event.stopPropagation();">${news.linkText || 'Read more'}</a>
                        </div>
                    `;
                    newsGrid.appendChild(newsCard);
                    count++;
                }
            });
            
            // Apply stagger animation to make news visible
            const items = newsGrid.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        } else {
            // If no news in Firestore, ensure default HTML content is visible
            const newsGrid = document.querySelector('.news-grid');
            if (newsGrid) {
                const items = newsGrid.querySelectorAll('.stagger-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        }
    } catch (error) {
        console.error('Error loading news section:', error);
        // Ensure default content is visible even on error
        const newsGrid = document.querySelector('.news-grid');
        if (newsGrid) {
            const items = newsGrid.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
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

// Load Contact Information and Site Settings
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
            
            // Apply logo font if specified
            if (data.logoFont) {
                applyLogoFont(data.logoFont);
            }
        }
    } catch (error) {
        console.error('Error loading contact info:', error);
    }
}

// Apply logo font to all logo elements
function applyLogoFont(fontName) {
    // Load the Google Font
    loadGoogleFont(fontName);
    
    // Apply font to logo elements
    const logoElements = document.querySelectorAll('.logo, .footer-logo, header .logo a');
    logoElements.forEach(element => {
        element.style.fontFamily = `'${fontName}', sans-serif`;
    });
}

// Load Google Font dynamically
function loadGoogleFont(fontName) {
    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href*="${fontName.replace(/\s/g, '+')}"]`);
    if (existingLink) return;
    
    // Create and load font link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s/g, '+')}:wght@400;500;600;700;800&display=swap`;
    document.head.appendChild(link);
}

// Export for testing
export { loadAllContent };
