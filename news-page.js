// Firebase Integration for News Page
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

// Load all news when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadAllNews();
    } catch (error) {
        console.error('Error loading news:', error);
        // Page will show default content if Firebase fails
    }
});

// Load all news
async function loadAllNews() {
    try {
        const newsSnapshot = await getDocs(collection(db, 'news'));
        const newsGrid = document.getElementById('allNewsGrid');
        
        if (newsGrid && !newsSnapshot.empty) {
            newsGrid.innerHTML = ''; // Clear existing/loading content
            
            newsSnapshot.forEach(doc => {
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
            });
            
            // Apply stagger animation
            const items = document.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        } else if (newsGrid && newsSnapshot.empty) {
            newsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #666;">No news articles available at the moment.</p>';
        }
    } catch (error) {
        console.error('Error loading news:', error);
        const newsGrid = document.getElementById('allNewsGrid');
        if (newsGrid) {
            newsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #666;">Error loading news. Please try again later.</p>';
        }
    }
}

// Export for testing
export { loadAllNews };

