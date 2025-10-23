// Firebase Integration for Projects Page
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

// Load all projects when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadAllProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
        // Page will show default content if Firebase fails
    }
});

// Load all projects
async function loadAllProjects() {
    try {
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsGrid = document.getElementById('allProjectsGrid');
        
        if (projectsGrid && !projectsSnapshot.empty) {
            projectsGrid.innerHTML = ''; // Clear existing/loading content
            
            projectsSnapshot.forEach(doc => {
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
            });
            
            // Apply stagger animation
            const items = document.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        } else if (projectsGrid && projectsSnapshot.empty) {
            projectsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #666;">No projects available at the moment.</p>';
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        const projectsGrid = document.getElementById('allProjectsGrid');
        if (projectsGrid) {
            projectsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #666;">Error loading projects. Please try again later.</p>';
        }
    }
}

// Export for testing
export { loadAllProjects };

