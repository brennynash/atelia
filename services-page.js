// Firebase Integration for Services Page
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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

// Load all services when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadAllServices();
    } catch (error) {
        console.error('Error loading services:', error);
        // Page will show default content if Firebase fails
    }
});

// Load all services
async function loadAllServices() {
    try {
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const servicesGrid = document.getElementById('allServicesGrid');
        
        if (servicesGrid && !servicesSnapshot.empty) {
            servicesGrid.innerHTML = ''; // Clear existing/loading content
            
            servicesSnapshot.forEach(doc => {
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
            });
            
            // Apply stagger animation
            const items = document.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        } else if (servicesGrid && servicesSnapshot.empty) {
            servicesGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #666;">No services available at the moment.</p>';
        }
    } catch (error) {
        console.error('Error loading services:', error);
        const servicesGrid = document.getElementById('allServicesGrid');
        if (servicesGrid) {
            servicesGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #666;">Error loading services. Please try again later.</p>';
        }
    }
}

// Export for testing
export { loadAllServices };

