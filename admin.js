// Firebase Admin Panel JavaScript
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { cloudinaryConfig } from './cloudinary-config.js';

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
const auth = getAuth(app);
const db = getFirestore(app);

// Global variables
let currentUser = null;
let projects = [];
let services = [];
let newsItems = [];
let bookings = [];
let heroSlides = [];
let sliderSettings = {};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners first
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Check authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            showAdminPanel();
            loadDashboardStats(); // Load dashboard stats first
            loadContent();
            loadBookings(); // Load bookings after authentication
        } else {
            showLoginForm();
        }
    });
});

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showStatus('Login successful!', 'success');
    } catch (error) {
        showStatus('Login failed: ' + error.message, 'error');
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        showStatus('Logged out successfully!', 'success');
    } catch (error) {
        showStatus('Logout failed: ' + error.message, 'error');
    }
}

// UI functions
function showLoginForm() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
}

function showAdminPanel() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
}

function showStatus(message, type) {
    // Try to find status element in both login screen and admin panel
    const loginStatusEl = document.getElementById('loginStatus');
    const adminStatusEl = document.getElementById('statusMessage');
    
    const statusEl = loginStatusEl && !loginStatusEl.closest('.hidden') ? loginStatusEl : adminStatusEl;
    
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.classList.remove('hidden');
        
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 3000);
    }
}

// Upload Progress Management
let uploadProgressContainer = null;
let uploadItems = new Map();

function createUploadProgressContainer() {
    if (uploadProgressContainer) {
        return uploadProgressContainer;
    }

    const container = document.createElement('div');
    container.className = 'upload-progress-container';
    container.innerHTML = `
        <div class="upload-progress-header">
            <h3 class="upload-progress-title">Uploading Images</h3>
            <button class="upload-progress-close" onclick="hideUploadProgress()">&times;</button>
        </div>
        <div class="upload-items-list"></div>
    `;
    
    document.body.appendChild(container);
    uploadProgressContainer = container;
    return container;
}

function addUploadItem(file, uploadId) {
    const container = createUploadProgressContainer();
    const itemsList = container.querySelector('.upload-items-list');
    
    const item = document.createElement('div');
    item.className = 'upload-item';
    item.id = `upload-item-${uploadId}`;
    
    // Create preview
    const preview = document.createElement('img');
    preview.className = 'upload-preview';
    preview.src = URL.createObjectURL(file);
    
    const filename = document.createElement('p');
    filename.className = 'upload-filename';
    filename.textContent = file.name;
    
    const status = document.createElement('span');
    status.className = 'upload-status';
    status.innerHTML = '<div class="upload-spinner"></div>';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'upload-progress-bar';
    progressBar.innerHTML = '<div class="upload-progress-fill uploading"></div>';
    
    const progressText = document.createElement('div');
    progressText.className = 'upload-progress-text';
    progressText.textContent = 'Preparing...';
    
    const header = document.createElement('div');
    header.className = 'upload-item-header';
    header.appendChild(preview);
    header.appendChild(filename);
    header.appendChild(status);
    
    item.appendChild(header);
    item.appendChild(progressBar);
    item.appendChild(progressText);
    
    itemsList.appendChild(item);
    uploadItems.set(uploadId, {
        element: item,
        progressFill: item.querySelector('.upload-progress-fill'),
        progressText: progressText,
        status: status,
        file: file
    });
    
    return item;
}

function updateUploadProgress(uploadId, progress, status = 'uploading') {
    const uploadItem = uploadItems.get(uploadId);
    if (!uploadItem) return;
    
    const { progressFill, progressText, status: statusEl } = uploadItem;
    
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;
    
    if (status === 'uploading') {
        progressFill.className = 'upload-progress-fill uploading';
        statusEl.innerHTML = '<div class="upload-spinner"></div>';
    } else if (status === 'success') {
        progressFill.className = 'upload-progress-fill';
        progressFill.style.width = '100%';
        progressText.textContent = 'Complete';
        statusEl.innerHTML = '<span class="upload-success-icon">✓</span>';
    } else if (status === 'error') {
        progressFill.className = 'upload-progress-fill error';
        progressText.textContent = 'Failed';
        statusEl.innerHTML = '<span class="upload-error-icon">✗</span>';
    }
}

function removeUploadItem(uploadId) {
    const uploadItem = uploadItems.get(uploadId);
    if (uploadItem) {
        uploadItem.element.remove();
        uploadItems.delete(uploadId);
        
        // Clean up object URL
        URL.revokeObjectURL(uploadItem.file);
        
        // Hide container if no more items
        if (uploadItems.size === 0) {
            hideUploadProgress();
        }
    }
}

function hideUploadProgress() {
    if (uploadProgressContainer) {
        uploadProgressContainer.remove();
        uploadProgressContainer = null;
        uploadItems.clear();
    }
}

// Load Dashboard Statistics
async function loadDashboardStats() {
    try {
        // Count projects
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsCount = projectsSnapshot.size;
        document.getElementById('totalProjects').textContent = projectsCount;
        
        // Count services
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const servicesCount = servicesSnapshot.size;
        document.getElementById('totalServices').textContent = servicesCount;
        
        // Count news items
        const newsSnapshot = await getDocs(collection(db, 'news'));
        const newsCount = newsSnapshot.size;
        document.getElementById('totalNews').textContent = newsCount;
        
        // Count bookings
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        const bookingsCount = bookingsSnapshot.size;
        document.getElementById('totalBookings').textContent = bookingsCount;
        
        // Load recent bookings (last 5)
        const recentBookingsQuery = query(
            collection(db, 'bookings'), 
            orderBy('timestamp', 'desc')
        );
        const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
        
        const recentBookingsList = document.getElementById('recentBookingsList');
        if (recentBookingsList) {
            if (recentBookingsSnapshot.empty) {
                recentBookingsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No bookings yet.</p>';
            } else {
                recentBookingsList.innerHTML = '';
                let count = 0;
                recentBookingsSnapshot.forEach(doc => {
                    if (count < 5) { // Show only last 5
                        const booking = doc.data();
                        const bookingDate = booking.timestamp ? new Date(booking.timestamp.toDate()).toLocaleDateString() : 'N/A';
                        
                        const bookingItem = document.createElement('div');
                        bookingItem.className = 'recent-booking-item';
                        bookingItem.innerHTML = `
                            <div class="recent-booking-header">
                                <span class="recent-booking-name">${booking.name || 'N/A'}</span>
                                <span class="recent-booking-date">${bookingDate}</span>
                            </div>
                            <div class="recent-booking-service">${booking.service || 'General Inquiry'} - ${booking.email || ''}</div>
                        `;
                        
                        // Make it clickable to go to bookings section
                        bookingItem.style.cursor = 'pointer';
                        bookingItem.addEventListener('click', () => {
                            document.querySelector('[data-section="bookings"]').click();
                        });
                        
                        recentBookingsList.appendChild(bookingItem);
                        count++;
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Expose function globally for refresh
window.loadDashboardStats = loadDashboardStats;

// Load content from Firestore
async function loadContent() {
    try {
        // Load hero section
        const heroDoc = await getDoc(doc(db, 'content', 'hero'));
        if (heroDoc.exists()) {
            const data = heroDoc.data();
            document.getElementById('heroHeadline').value = data.headline || '';
            document.getElementById('heroButtonText').value = data.buttonText || '';
            
            // Update preview
            const currentHeadline = document.getElementById('currentHeroHeadline');
            const currentButton = document.getElementById('currentHeroButton');
            if (currentHeadline) currentHeadline.textContent = data.headline || 'N/A';
            if (currentButton) currentButton.textContent = data.buttonText || 'N/A';
        }

        // Load hero slides
        await loadHeroSlides();
        
        // Load slider settings
        await loadSliderSettings();

        // Load projects section
        const projectsDoc = await getDoc(doc(db, 'content', 'projects'));
        if (projectsDoc.exists()) {
            const data = projectsDoc.data();
            document.getElementById('projectsTitle').value = data.title || '';
            document.getElementById('projectsDescription').value = data.description || '';
            document.getElementById('projectsCTA').value = data.cta || '';
        }

        // Load projects list
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        projects = [];
        projectsSnapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        renderProjectsList();

        // Load testimonials section
        const testimonialsDoc = await getDoc(doc(db, 'content', 'testimonials'));
        if (testimonialsDoc.exists()) {
            const data = testimonialsDoc.data();
            document.getElementById('testimonialsEnabled').checked = data.enabled !== false; // Default to true
            document.getElementById('testimonialsTitle').value = data.title || '';
            document.getElementById('testimonialsDescription').value = data.description || '';
            document.getElementById('testimonialsCTA').value = data.cta || '';
            document.getElementById('testimonialsVideoUrl').value = data.videoUrl || '';
            document.getElementById('testimonialsVideoTitle').value = data.videoTitle || '';
        } else {
            // Set defaults if no data exists
            document.getElementById('testimonialsEnabled').checked = true;
        }

        // Load about section
        const aboutDoc = await getDoc(doc(db, 'content', 'about'));
        if (aboutDoc.exists()) {
            const data = aboutDoc.data();
            document.getElementById('aboutTitle').value = data.title || '';
            document.getElementById('aboutDescription1').value = data.description1 || '';
            document.getElementById('aboutDescription2').value = data.description2 || '';
            document.getElementById('aboutCTA').value = data.cta || '';
        }

        // Load services section
        const servicesDoc = await getDoc(doc(db, 'content', 'services'));
        if (servicesDoc.exists()) {
            const data = servicesDoc.data();
            document.getElementById('servicesTitle').value = data.title || '';
            document.getElementById('servicesTagline').value = data.tagline || '';
            document.getElementById('servicesCTA').value = data.cta || '';
        }

        // Load services list
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        services = [];
        servicesSnapshot.forEach(doc => {
            services.push({ id: doc.id, ...doc.data() });
        });
        renderServicesList();

        // Load news section
        const newsDoc = await getDoc(doc(db, 'content', 'news'));
        if (newsDoc.exists()) {
            const data = newsDoc.data();
            document.getElementById('newsTitle').value = data.title || '';
            document.getElementById('newsTagline').value = data.tagline || '';
            document.getElementById('newsCTA').value = data.cta || '';
        }

        // Load news list
        const newsSnapshot = await getDocs(collection(db, 'news'));
        newsItems = [];
        newsSnapshot.forEach(doc => {
            newsItems.push({ id: doc.id, ...doc.data() });
        });
        renderNewsList();

        // Load CTA section
        const ctaDoc = await getDoc(doc(db, 'content', 'cta'));
        if (ctaDoc.exists()) {
            const data = ctaDoc.data();
            document.getElementById('ctaHeadline').value = data.headline || '';
            document.getElementById('ctaDescription').value = data.description || '';
            document.getElementById('ctaButtonText').value = data.buttonText || '';
        }

        // Load site settings
        const settingsDoc = await getDoc(doc(db, 'content', 'settings'));
        if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            document.getElementById('siteName').value = data.siteName || '';
            document.getElementById('siteTagline').value = data.siteTagline || '';
            document.getElementById('siteFavicon').value = data.siteFavicon || '';
            document.getElementById('siteLogo').value = data.siteLogo || '';
            document.getElementById('logoFont').value = data.logoFont || 'Poppins';
            document.getElementById('seoTitle').value = data.seoTitle || '';
            document.getElementById('seoDescription').value = data.seoDescription || '';
            document.getElementById('seoKeywords').value = data.seoKeywords || '';
            document.getElementById('contactPhone').value = data.contactPhone || '';
            document.getElementById('contactEmail').value = data.contactEmail || '';
            document.getElementById('contactAddress').value = data.contactAddress || '';
            document.getElementById('socialInstagram').value = data.socialInstagram || '';
            document.getElementById('socialLinkedIn').value = data.socialLinkedIn || '';
            document.getElementById('socialFacebook').value = data.socialFacebook || '';
            document.getElementById('socialTwitter').value = data.socialTwitter || '';
            document.getElementById('hoursWeekday').value = data.hoursWeekday || '';
            document.getElementById('hoursWeekend').value = data.hoursWeekend || '';
            
            // Update logo preview with loaded font
            updateLogoPreview(data.logoFont || 'Poppins');
        }

        // Setup logo font selector change listener
        const logoFontSelect = document.getElementById('logoFont');
        if (logoFontSelect) {
            logoFontSelect.addEventListener('change', function() {
                updateLogoPreview(this.value);
            });
        }

    } catch (error) {
        console.error('Error loading content:', error);
        showStatus('Error loading content: ' + error.message, 'error');
    }
}

// Save functions
async function saveHero() {
    try {
        const headline = document.getElementById('heroHeadline').value;
        const buttonText = document.getElementById('heroButtonText').value;
        
        await setDoc(doc(db, 'content', 'hero'), {
            headline: headline,
            buttonText: buttonText
        });
        
        // Update preview
        const currentHeadline = document.getElementById('currentHeroHeadline');
        const currentButton = document.getElementById('currentHeroButton');
        if (currentHeadline) currentHeadline.textContent = headline;
        if (currentButton) currentButton.textContent = buttonText;
        
        showStatus('Hero section saved! Refresh the homepage to see changes.', 'success');
    } catch (error) {
        showStatus('Error saving hero section: ' + error.message, 'error');
    }
}

async function saveProjects() {
    try {
        await setDoc(doc(db, 'content', 'projects'), {
            title: document.getElementById('projectsTitle').value,
            description: document.getElementById('projectsDescription').value,
            cta: document.getElementById('projectsCTA').value
        });
        showStatus('Projects section saved!', 'success');
    } catch (error) {
        showStatus('Error saving projects section: ' + error.message, 'error');
    }
}

async function saveTestimonials() {
    try {
        const enabled = document.getElementById('testimonialsEnabled').checked;
        const videoUrl = document.getElementById('testimonialsVideoUrl').value;
        
        // Convert YouTube URL to embed URL
        const embedUrl = convertYouTubeUrl(videoUrl);
        
        await setDoc(doc(db, 'content', 'testimonials'), {
            enabled: enabled,
            title: document.getElementById('testimonialsTitle').value,
            description: document.getElementById('testimonialsDescription').value,
            cta: document.getElementById('testimonialsCTA').value,
            videoUrl: videoUrl,
            embedUrl: embedUrl,
            videoTitle: document.getElementById('testimonialsVideoTitle').value
        });
        showStatus('Testimonials section saved! Refresh the homepage to see changes.', 'success');
    } catch (error) {
        showStatus('Error saving testimonials section: ' + error.message, 'error');
    }
}

// Helper function to convert YouTube URL to embed URL
function convertYouTubeUrl(url) {
    if (!url) return '';
    
    // If it's already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
        return url;
    }
    
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    
    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('watch?v=')[1]?.split('&')[0];
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    // Format: https://www.youtube.com/v/VIDEO_ID
    else if (url.includes('youtube.com/v/')) {
        videoId = url.split('youtube.com/v/')[1]?.split('?')[0];
    }
    
    // Return embed URL if video ID found
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Return original URL if can't parse
    return url;
}

// Expose functions globally
window.saveTestimonials = saveTestimonials;

async function saveAbout() {
    try {
        await setDoc(doc(db, 'content', 'about'), {
            title: document.getElementById('aboutTitle').value,
            description1: document.getElementById('aboutDescription1').value,
            description2: document.getElementById('aboutDescription2').value,
            cta: document.getElementById('aboutCTA').value
        });
        showStatus('About section saved!', 'success');
    } catch (error) {
        showStatus('Error saving about section: ' + error.message, 'error');
    }
}

async function saveServices() {
    try {
        await setDoc(doc(db, 'content', 'services'), {
            title: document.getElementById('servicesTitle').value,
            tagline: document.getElementById('servicesTagline').value,
            cta: document.getElementById('servicesCTA').value
        });
        showStatus('Services section saved!', 'success');
    } catch (error) {
        showStatus('Error saving services section: ' + error.message, 'error');
    }
}

async function saveNews() {
    try {
        await setDoc(doc(db, 'content', 'news'), {
            title: document.getElementById('newsTitle').value,
            tagline: document.getElementById('newsTagline').value,
            cta: document.getElementById('newsCTA').value
        });
        showStatus('News section saved!', 'success');
    } catch (error) {
        showStatus('Error saving news section: ' + error.message, 'error');
    }
}

async function saveCTA() {
    try {
        await setDoc(doc(db, 'content', 'cta'), {
            headline: document.getElementById('ctaHeadline').value,
            description: document.getElementById('ctaDescription').value,
            buttonText: document.getElementById('ctaButtonText').value
        });
        showStatus('CTA section saved!', 'success');
    } catch (error) {
        showStatus('Error saving CTA section: ' + error.message, 'error');
    }
}

async function saveSettings() {
    try {
        const logoFont = document.getElementById('logoFont').value;
        
        await setDoc(doc(db, 'content', 'settings'), {
            siteName: document.getElementById('siteName').value,
            siteTagline: document.getElementById('siteTagline').value,
            siteFavicon: document.getElementById('siteFavicon').value,
            siteLogo: document.getElementById('siteLogo').value,
            logoFont: logoFont,
            seoTitle: document.getElementById('seoTitle').value,
            seoDescription: document.getElementById('seoDescription').value,
            seoKeywords: document.getElementById('seoKeywords').value,
            contactPhone: document.getElementById('contactPhone').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactAddress: document.getElementById('contactAddress').value,
            socialInstagram: document.getElementById('socialInstagram').value,
            socialLinkedIn: document.getElementById('socialLinkedIn').value,
            socialFacebook: document.getElementById('socialFacebook').value,
            socialTwitter: document.getElementById('socialTwitter').value,
            hoursWeekday: document.getElementById('hoursWeekday').value,
            hoursWeekend: document.getElementById('hoursWeekend').value
        });
        showStatus('Site settings saved! Refresh the homepage to see changes.', 'success');
    } catch (error) {
        showStatus('Error saving settings: ' + error.message, 'error');
    }
}

// Update logo preview with selected font
function updateLogoPreview(fontName) {
    const preview = document.getElementById('logoPreview');
    const siteName = document.getElementById('siteName').value || 'Atelia Built.';
    
    if (preview) {
        preview.style.fontFamily = `'${fontName}', sans-serif`;
        preview.textContent = siteName;
        
        // Load the font if not already loaded
        loadGoogleFont(fontName);
    }
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

// Change admin password
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const statusEl = document.getElementById('passwordChangeStatus');
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        statusEl.textContent = 'Please fill in all password fields';
        statusEl.className = 'status error';
        statusEl.classList.remove('hidden');
        setTimeout(() => statusEl.classList.add('hidden'), 3000);
        return;
    }
    
    if (newPassword.length < 6) {
        statusEl.textContent = 'New password must be at least 6 characters';
        statusEl.className = 'status error';
        statusEl.classList.remove('hidden');
        setTimeout(() => statusEl.classList.add('hidden'), 3000);
        return;
    }
    
    if (newPassword !== confirmPassword) {
        statusEl.textContent = 'New passwords do not match';
        statusEl.className = 'status error';
        statusEl.classList.remove('hidden');
        setTimeout(() => statusEl.classList.add('hidden'), 3000);
        return;
    }
    
    try {
        const user = auth.currentUser;
        
        if (!user || !user.email) {
            statusEl.textContent = 'No user logged in';
            statusEl.className = 'status error';
            statusEl.classList.remove('hidden');
            setTimeout(() => statusEl.classList.add('hidden'), 3000);
            return;
        }
        
        // Show loading state
        statusEl.textContent = 'Changing password...';
        statusEl.className = 'status info';
        statusEl.classList.remove('hidden');
        
        // Reauthenticate user with current password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPassword);
        
        // Success
        statusEl.textContent = 'Password changed successfully! ✓';
        statusEl.className = 'status success';
        
        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        setTimeout(() => statusEl.classList.add('hidden'), 5000);
        
    } catch (error) {
        console.error('Password change error:', error);
        
        let errorMessage = 'Failed to change password';
        
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = 'Current password is incorrect';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'New password is too weak';
        } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = 'Please log out and log back in, then try again';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        statusEl.textContent = errorMessage;
        statusEl.className = 'status error';
        statusEl.classList.remove('hidden');
        setTimeout(() => statusEl.classList.add('hidden'), 5000);
    }
}

// Project management
function renderProjectsList() {
    const container = document.getElementById('projectsList');
    container.innerHTML = '';
    
    projects.forEach((project, index) => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'modern-project-card';
        
        // Get main image for thumbnail
        const images = project.images || [];
        const mainImage = images.length > 0 ? images[0] : (project.image || '');
        
        // Render image thumbnails
        const imagesHtml = images.map((img, idx) => `
            <div class="image-thumbnail">
                <img src="${img}" alt="Image ${idx + 1}">
                <button onclick="removeProjectImage('${project.id}', ${idx})" class="remove-image-btn" title="Remove image">×</button>
                ${idx === 0 ? '<span class="main-badge">Main</span>' : ''}
            </div>
        `).join('');
        
        projectDiv.innerHTML = `
            <div class="project-card-header">
                <div class="project-card-preview">
                    ${mainImage ? `<img src="${mainImage}" alt="${project.name || 'Project'}">` : '<div class="no-image-placeholder">📷</div>'}
                </div>
                <div class="project-card-info">
                    <h3>${project.name || 'New Project'}</h3>
                    <div class="project-card-meta">
                        ${project.location ? `<span>📍 ${project.location}</span>` : ''}
                        ${project.year ? `<span>📅 ${project.year}</span>` : ''}
                        ${images.length > 0 ? `<span>🖼️ ${images.length} ${images.length === 1 ? 'image' : 'images'}</span>` : ''}
                    </div>
                </div>
                <div class="project-card-actions">
                    <button onclick="toggleProjectDetails('${project.id}')" class="btn-icon" title="Expand/Collapse">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <button onclick="deleteProject('${project.id}')" class="btn-icon btn-danger-icon" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div id="projectDetails_${project.id}" class="project-card-details" style="display: none;">
                <div class="project-tabs">
                    <button class="tab-btn active" onclick="switchProjectTab('${project.id}', 'basic')">📋 Basic Info</button>
                    <button class="tab-btn" onclick="switchProjectTab('${project.id}', 'team')">👥 Team</button>
                    <button class="tab-btn" onclick="switchProjectTab('${project.id}', 'media')">🎬 Media</button>
                </div>
                
                <!-- Basic Info Tab -->
                <div id="projectTab_${project.id}_basic" class="tab-content active">
                    <div class="compact-form">
                        <div class="form-row">
                            <div class="form-field">
                                <label>Project Name</label>
                                <input type="text" id="projectName_${project.id}" value="${project.name || ''}" placeholder="Warrandyte North 54">
                            </div>
                            <div class="form-field">
                                <label>Year</label>
                                <input type="text" id="projectYear_${project.id}" value="${project.year || ''}" placeholder="2023">
                            </div>
                        </div>
                        <div class="form-field">
                            <label>Location</label>
                            <input type="text" id="projectLocation_${project.id}" value="${project.location || ''}" placeholder="Warrandyte North, VIC">
                        </div>
                        <div class="form-field">
                            <label>Description</label>
                            <textarea id="projectDescription_${project.id}" rows="3" placeholder="Project description...">${project.description || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Team Tab -->
                <div id="projectTab_${project.id}_team" class="tab-content">
                    <div class="compact-form">
                        <div class="form-field">
                            <label>Builder</label>
                            <input type="text" id="projectBuilder_${project.id}" value="${project.builder || ''}" placeholder="Demardi">
                        </div>
                        <div class="form-field">
                            <label>Interior Designer</label>
                            <input type="text" id="projectDesigner_${project.id}" value="${project.designer || ''}" placeholder="Hilltop House">
                        </div>
                        <div class="form-field">
                            <label>Photographer</label>
                            <input type="text" id="projectPhotographer_${project.id}" value="${project.photographer || ''}" placeholder="Tatjana Plitt">
                        </div>
                    </div>
                </div>
                
                <!-- Media Tab -->
                <div id="projectTab_${project.id}_media" class="tab-content">
                    <div class="compact-form">
                        <div class="media-section">
                            <div class="media-header">
                                <h4>Images (${images.length})</h4>
                                <button onclick="uploadProjectImages('${project.id}')" class="btn-small btn-success">
                                    📷 Upload Images
                                </button>
                            </div>
                            <div class="images-grid">
                                ${imagesHtml || '<div class="no-images-placeholder">No images yet. Click "Upload Images" to add photos.</div>'}
                            </div>
                        </div>
                        
                        <div class="form-field" style="margin-top: 20px;">
                            <label>YouTube Video URL (optional)</label>
                            <input type="url" id="projectVideoUrl_${project.id}" value="${project.videoUrl || ''}" placeholder="https://www.youtube.com/watch?v=...">
                        </div>
                        <div class="form-field">
                            <label>Video Title</label>
                            <input type="text" id="projectVideoTitle_${project.id}" value="${project.videoTitle || ''}" placeholder="Client Testimonial">
                        </div>
                    </div>
                </div>
                
                <div class="project-card-footer">
                    <button onclick="updateProject('${project.id}')" class="btn btn-success">💾 Save Changes</button>
                    <button onclick="toggleProjectDetails('${project.id}')" class="btn">Cancel</button>
                </div>
            </div>
        `;
        container.appendChild(projectDiv);
    });
}

// Toggle project details expansion
function toggleProjectDetails(projectId) {
    const details = document.getElementById(`projectDetails_${projectId}`);
    if (details) {
        const isVisible = details.style.display !== 'none';
        details.style.display = isVisible ? 'none' : 'block';
    }
}

// Switch between project tabs
function switchProjectTab(projectId, tabName) {
    // Hide all tabs for this project
    const allTabs = document.querySelectorAll(`[id^="projectTab_${projectId}_"]`);
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const card = document.querySelector(`#projectDetails_${projectId}`).closest('.modern-project-card');
    const allBtns = card.querySelectorAll('.tab-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`projectTab_${projectId}_${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate corresponding button
    const btnIndex = tabName === 'basic' ? 0 : tabName === 'team' ? 1 : 2;
    if (allBtns[btnIndex]) {
        allBtns[btnIndex].classList.add('active');
    }
}

async function addProject() {
    try {
        await addDoc(collection(db, 'projects'), {
            name: 'New Project',
            location: '',
            year: '',
            builder: '',
            designer: '',
            photographer: '',
            description: '',
            videoUrl: '',
            videoTitle: '',
            images: [],
            // Keep old fields for backward compatibility
            image: '',
            alt: ''
        });
        loadContent();
        showStatus('Project added!', 'success');
    } catch (error) {
        showStatus('Error adding project: ' + error.message, 'error');
    }
}

async function updateProject(projectId) {
    try {
        // Get current project to preserve images array
        const currentProject = projects.find(p => p.id === projectId);
        
        await updateDoc(doc(db, 'projects', projectId), {
            name: document.getElementById(`projectName_${projectId}`).value,
            location: document.getElementById(`projectLocation_${projectId}`).value,
            year: document.getElementById(`projectYear_${projectId}`).value,
            builder: document.getElementById(`projectBuilder_${projectId}`).value,
            designer: document.getElementById(`projectDesigner_${projectId}`).value,
            photographer: document.getElementById(`projectPhotographer_${projectId}`).value,
            description: document.getElementById(`projectDescription_${projectId}`).value,
            videoUrl: document.getElementById(`projectVideoUrl_${projectId}`).value,
            videoTitle: document.getElementById(`projectVideoTitle_${projectId}`).value,
            images: currentProject.images || [],
            // Update old image field with first image for backward compatibility
            image: (currentProject.images && currentProject.images[0]) || '',
            alt: document.getElementById(`projectName_${projectId}`).value
        });
        showStatus('Project updated!', 'success');
        loadContent(); // Reload to reflect changes
    } catch (error) {
        showStatus('Error updating project: ' + error.message, 'error');
    }
}

async function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            await deleteDoc(doc(db, 'projects', projectId));
            loadContent();
            showStatus('Project deleted!', 'success');
        } catch (error) {
            showStatus('Error deleting project: ' + error.message, 'error');
        }
    }
}

// Upload multiple images for a project
// Custom lightweight image upload
async function uploadToCloudinary(file, folder, uploadId = null, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', folder);
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const progress = (e.loaded / e.total) * 100;
                onProgress(progress);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data.secure_url);
            } else {
                reject(new Error('Upload failed'));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
        });
        
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`);
        xhr.send(formData);
    });
}

function uploadProjectImages(projectId) {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;
        
        // Validate files
        const maxSize = 5 * 1024 * 1024; // 5MB
        const invalidFiles = files.filter(f => f.size > maxSize);
        
        if (invalidFiles.length > 0) {
            showStatus('Some files are too large (max 5MB per file)', 'error');
            return;
        }
        
        if (files.length > 10) {
            showStatus('Maximum 10 images at a time', 'error');
            return;
        }
        
        // Create upload progress items
        const uploadIds = files.map((file, index) => {
            const uploadId = `project-${projectId}-${Date.now()}-${index}`;
            addUploadItem(file, uploadId);
            return uploadId;
        });
        
        try {
            // Get current project
            const currentProject = projects.find(p => p.id === projectId);
            const currentImages = currentProject.images || [];
            
            // Upload all files with progress tracking
            const uploadPromises = files.map(async (file, index) => {
                const uploadId = uploadIds[index];
                try {
                    const url = await uploadToCloudinary(file, 'atelia/projects', uploadId, (progress) => {
                        updateUploadProgress(uploadId, progress, 'uploading');
                    });
                    updateUploadProgress(uploadId, 100, 'success');
                    return url;
                } catch (error) {
                    updateUploadProgress(uploadId, 0, 'error');
                    throw error;
                }
            });
            
            const uploadedUrls = await Promise.all(uploadPromises);
            
            // Add new images to array
            const updatedImages = [...currentImages, ...uploadedUrls];
            
            // Update Firestore
            await updateDoc(doc(db, 'projects', projectId), {
                images: updatedImages,
                // Update old image field with first image for backward compatibility
                image: updatedImages[0] || ''
            });
            
            // Reload content to show new images
            await loadContent();
            showStatus(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully!`, 'success');
            
            // Remove progress items after a delay
            setTimeout(() => {
                uploadIds.forEach(id => removeUploadItem(id));
            }, 2000);
            
        } catch (err) {
            console.error('Error uploading images:', err);
            showStatus('Error uploading images: ' + err.message, 'error');
            
            // Remove failed upload items
            uploadIds.forEach(id => removeUploadItem(id));
        }
    };
    
    // Trigger file picker
    input.click();
}

// Remove image from project
async function removeProjectImage(projectId, imageIndex) {
    if (confirm('Are you sure you want to remove this image?')) {
        try {
            // Get current project
            const currentProject = projects.find(p => p.id === projectId);
            const currentImages = currentProject.images || [];
            
            // Remove image at index
            const updatedImages = currentImages.filter((_, idx) => idx !== imageIndex);
            
            // Update Firestore
            await updateDoc(doc(db, 'projects', projectId), {
                images: updatedImages,
                // Update old image field with first image for backward compatibility
                image: updatedImages[0] || ''
            });
            
            // Reload content
            await loadContent();
            showStatus('Image removed!', 'success');
        } catch (error) {
            console.error('Error removing image:', error);
            showStatus('Error removing image: ' + error.message, 'error');
        }
    }
}

// Service management
function renderServicesList() {
    const container = document.getElementById('servicesList');
    container.innerHTML = '';
    
    services.forEach((service, index) => {
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'modern-project-card';
        
        // Get main image for thumbnail
        const images = service.images || [];
        const mainImage = images.length > 0 ? images[0] : (service.image || '');
        
        // Render image thumbnails
        const imagesHtml = images.map((img, idx) => `
            <div class="image-thumbnail">
                <img src="${img}" alt="Image ${idx + 1}">
                <button onclick="removeServiceImage('${service.id}', ${idx})" class="remove-image-btn" title="Remove image">×</button>
                ${idx === 0 ? '<span class="main-badge">Main</span>' : ''}
            </div>
        `).join('');
        
        // Render existing features
        const features = service.features || [];
        const featuresHtml = features.map((feat, idx) => `
            <div class="list-item-row">
                <input type="text" value="${feat}" 
                       id="serviceFeature_${service.id}_${idx}" 
                       placeholder="Feature description">
                <button onclick="removeServiceFeature('${service.id}', ${idx})" class="btn-small btn-danger-small" title="Remove">×</button>
            </div>
        `).join('');
        
        // Render existing process steps
        const process = service.process || [];
        const processHtml = process.map((step, idx) => `
            <div class="process-step-card">
                <div class="process-step-header">
                    <span class="step-number">${idx + 1}</span>
                    <button onclick="removeProcessStep('${service.id}', ${idx})" class="btn-small btn-danger-small" title="Remove">×</button>
                </div>
                <input type="text" value="${step.title || ''}" 
                       id="serviceProcessTitle_${service.id}_${idx}" 
                       placeholder="Step title (e.g., Consultation)">
                <textarea id="serviceProcessDesc_${service.id}_${idx}" 
                          placeholder="Step description" 
                          rows="2">${step.description || ''}</textarea>
            </div>
        `).join('');
        
        serviceDiv.innerHTML = `
            <div class="project-card-header">
                <div class="project-card-preview">
                    ${mainImage ? `<img src="${mainImage}" alt="${service.name || 'Service'}">` : '<div class="no-image-placeholder">🔧</div>'}
                </div>
                <div class="project-card-info">
                    <h3>${service.name || 'New Service'}</h3>
                    <div class="project-card-meta">
                        ${service.category ? `<span>🏷️ ${service.category}</span>` : ''}
                        ${features.length > 0 ? `<span>✓ ${features.length} ${features.length === 1 ? 'feature' : 'features'}</span>` : ''}
                        ${images.length > 0 ? `<span>🖼️ ${images.length} ${images.length === 1 ? 'image' : 'images'}</span>` : ''}
                    </div>
                </div>
                <div class="project-card-actions">
                    <button onclick="toggleServiceDetails('${service.id}')" class="btn-icon" title="Expand/Collapse">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <button onclick="deleteService('${service.id}')" class="btn-icon btn-danger-icon" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div id="serviceDetails_${service.id}" class="project-card-details" style="display: none;">
                <div class="project-tabs">
                    <button class="tab-btn active" onclick="switchServiceTab('${service.id}', 'basic')">📋 Basic Info</button>
                    <button class="tab-btn" onclick="switchServiceTab('${service.id}', 'content')">📝 Content</button>
                    <button class="tab-btn" onclick="switchServiceTab('${service.id}', 'media')">🎬 Media</button>
                </div>
                
                <!-- Basic Info Tab -->
                <div id="serviceTab_${service.id}_basic" class="tab-content active">
                    <div class="compact-form">
                        <div class="form-row">
                            <div class="form-field">
                                <label>Service Name</label>
                                <input type="text" id="serviceName_${service.id}" value="${service.name || ''}" placeholder="Site Preparation">
                            </div>
                            <div class="form-field">
                                <label>Category</label>
                                <input type="text" id="serviceCategory_${service.id}" value="${service.category || ''}" placeholder="Construction">
                            </div>
                        </div>
                        <div class="form-field">
                            <label>Short Description <small>(listing page)</small></label>
                            <textarea id="serviceShortDescription_${service.id}" rows="2" placeholder="Brief one-liner about the service">${service.shortDescription || ''}</textarea>
                        </div>
                        <div class="form-field">
                            <label>Full Description <small>(detail page)</small></label>
                            <textarea id="serviceFullDescription_${service.id}" rows="4" placeholder="Detailed description. Use double line breaks for paragraphs.">${service.fullDescription || service.description || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Content Tab -->
                <div id="serviceTab_${service.id}_content" class="tab-content">
                    <div class="compact-form">
                        <div class="content-section">
                            <div class="content-section-header">
                                <h4>✓ Features (${features.length})</h4>
                                <button onclick="addServiceFeature('${service.id}')" class="btn-small btn-success">
                                    + Add Feature
                                </button>
                            </div>
                            <div id="serviceFeaturesList_${service.id}" class="list-items-container">
                                ${featuresHtml || '<div class="empty-state">No features added yet. Click "Add Feature" to start.</div>'}
                            </div>
                        </div>
                        
                        <div class="content-section" style="margin-top: 24px;">
                            <div class="content-section-header">
                                <h4>⚙️ Process Steps (${process.length})</h4>
                                <button onclick="addProcessStep('${service.id}')" class="btn-small btn-success">
                                    + Add Step
                                </button>
                            </div>
                            <div id="serviceProcessList_${service.id}" class="process-steps-container">
                                ${processHtml || '<div class="empty-state">No process steps added yet. Click "Add Step" to start.</div>'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Media Tab -->
                <div id="serviceTab_${service.id}_media" class="tab-content">
                    <div class="compact-form">
                        <div class="media-section">
                            <div class="media-header">
                                <h4>Images (${images.length})</h4>
                                <button onclick="uploadServiceImages('${service.id}')" class="btn-small btn-success">
                                    📷 Upload Images
                                </button>
                            </div>
                            <div class="images-grid">
                                ${imagesHtml || '<div class="no-images-placeholder">No images yet. Click "Upload Images" to add photos.</div>'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="project-card-footer">
                    <button onclick="updateService('${service.id}')" class="btn btn-success">💾 Save Changes</button>
                    <button onclick="toggleServiceDetails('${service.id}')" class="btn">Cancel</button>
                </div>
            </div>
        `;
        container.appendChild(serviceDiv);
    });
}

// Toggle service details expansion
function toggleServiceDetails(serviceId) {
    const details = document.getElementById(`serviceDetails_${serviceId}`);
    if (details) {
        const isVisible = details.style.display !== 'none';
        details.style.display = isVisible ? 'none' : 'block';
    }
}

// Switch between service tabs
function switchServiceTab(serviceId, tabName) {
    // Hide all tabs for this service
    const allTabs = document.querySelectorAll(`[id^="serviceTab_${serviceId}_"]`);
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const card = document.querySelector(`#serviceDetails_${serviceId}`).closest('.modern-project-card');
    const allBtns = card.querySelectorAll('.tab-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`serviceTab_${serviceId}_${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate corresponding button
    const btnIndex = tabName === 'basic' ? 0 : tabName === 'content' ? 1 : 2;
    if (allBtns[btnIndex]) {
        allBtns[btnIndex].classList.add('active');
    }
}

async function addService() {
    try {
        await addDoc(collection(db, 'services'), {
            name: 'New Service',
            category: '',
            shortDescription: '',
            fullDescription: '',
            features: [],
            process: [],
            images: [],
            // Keep old fields for backward compatibility
            image: '',
            alt: '',
            description: ''
        });
        loadContent();
        showStatus('Service added!', 'success');
    } catch (error) {
        showStatus('Error adding service: ' + error.message, 'error');
    }
}

async function updateService(serviceId) {
    try {
        // Get current service to preserve images array
        const currentService = services.find(s => s.id === serviceId);
        
        // Collect features
        const features = [];
        const featureInputs = document.querySelectorAll(`[id^="serviceFeature_${serviceId}_"]`);
        featureInputs.forEach(input => {
            if (input.value.trim()) {
                features.push(input.value.trim());
            }
        });
        
        // Collect process steps
        const process = [];
        const processTitleInputs = document.querySelectorAll(`[id^="serviceProcessTitle_${serviceId}_"]`);
        processTitleInputs.forEach((titleInput, idx) => {
            const descInput = document.getElementById(`serviceProcessDesc_${serviceId}_${idx}`);
            if (titleInput.value.trim() || (descInput && descInput.value.trim())) {
                process.push({
                    title: titleInput.value.trim(),
                    description: descInput ? descInput.value.trim() : ''
                });
            }
        });
        
        await updateDoc(doc(db, 'services', serviceId), {
            name: document.getElementById(`serviceName_${serviceId}`).value,
            category: document.getElementById(`serviceCategory_${serviceId}`).value,
            shortDescription: document.getElementById(`serviceShortDescription_${serviceId}`).value,
            fullDescription: document.getElementById(`serviceFullDescription_${serviceId}`).value,
            features: features,
            process: process,
            images: currentService.images || [],
            // Update old fields for backward compatibility
            image: (currentService.images && currentService.images[0]) || '',
            alt: document.getElementById(`serviceName_${serviceId}`).value,
            description: document.getElementById(`serviceShortDescription_${serviceId}`).value
        });
        showStatus('Service updated!', 'success');
        loadContent(); // Reload to reflect changes
    } catch (error) {
        showStatus('Error updating service: ' + error.message, 'error');
    }
}

async function deleteService(serviceId) {
    if (confirm('Are you sure you want to delete this service?')) {
        try {
            await deleteDoc(doc(db, 'services', serviceId));
            loadContent();
            showStatus('Service deleted!', 'success');
        } catch (error) {
            showStatus('Error deleting service: ' + error.message, 'error');
        }
    }
}

// Helper functions for service features
function addServiceFeature(serviceId) {
    const currentService = services.find(s => s.id === serviceId);
    const features = currentService.features || [];
    features.push('');
    currentService.features = features;
    renderServicesList();
}

function removeServiceFeature(serviceId, featureIndex) {
    const currentService = services.find(s => s.id === serviceId);
    const features = currentService.features || [];
    features.splice(featureIndex, 1);
    currentService.features = features;
    renderServicesList();
}

// Helper functions for service process steps
function addProcessStep(serviceId) {
    const currentService = services.find(s => s.id === serviceId);
    const process = currentService.process || [];
    process.push({ title: '', description: '' });
    currentService.process = process;
    renderServicesList();
}

function removeProcessStep(serviceId, stepIndex) {
    const currentService = services.find(s => s.id === serviceId);
    const process = currentService.process || [];
    process.splice(stepIndex, 1);
    currentService.process = process;
    renderServicesList();
}

// Upload multiple images for a service
function uploadServiceImages(serviceId) {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;
        
        // Validate files
        const maxSize = 5 * 1024 * 1024; // 5MB
        const invalidFiles = files.filter(f => f.size > maxSize);
        
        if (invalidFiles.length > 0) {
            showStatus('Some files are too large (max 5MB per file)', 'error');
            return;
        }
        
        if (files.length > 10) {
            showStatus('Maximum 10 images at a time', 'error');
            return;
        }
        
        // Create upload progress items
        const uploadIds = files.map((file, index) => {
            const uploadId = `service-${serviceId}-${Date.now()}-${index}`;
            addUploadItem(file, uploadId);
            return uploadId;
        });
        
        try {
            const currentService = services.find(s => s.id === serviceId);
            const currentImages = currentService.images || [];
            
            // Upload all files with progress tracking
            const uploadPromises = files.map(async (file, index) => {
                const uploadId = uploadIds[index];
                try {
                    const url = await uploadToCloudinary(file, 'atelia/services', uploadId, (progress) => {
                        updateUploadProgress(uploadId, progress, 'uploading');
                    });
                    updateUploadProgress(uploadId, 100, 'success');
                    return url;
                } catch (error) {
                    updateUploadProgress(uploadId, 0, 'error');
                    throw error;
                }
            });
            
            const uploadedUrls = await Promise.all(uploadPromises);
            
            // Add new images to array
            const updatedImages = [...currentImages, ...uploadedUrls];
            
            // Update Firestore
            await updateDoc(doc(db, 'services', serviceId), {
                images: updatedImages,
                image: updatedImages[0] || ''
            });
            
            // Reload content
            await loadContent();
            showStatus(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully!`, 'success');
            
            // Remove progress items after a delay
            setTimeout(() => {
                uploadIds.forEach(id => removeUploadItem(id));
            }, 2000);
            
        } catch (err) {
            console.error('Error uploading images:', err);
            showStatus('Error uploading images: ' + err.message, 'error');
            
            // Remove failed upload items
            uploadIds.forEach(id => removeUploadItem(id));
        }
    };
    
    // Trigger file picker
    input.click();
}

// Remove image from service
async function removeServiceImage(serviceId, imageIndex) {
    if (confirm('Are you sure you want to remove this image?')) {
        try {
            const currentService = services.find(s => s.id === serviceId);
            const currentImages = currentService.images || [];
            const updatedImages = currentImages.filter((_, idx) => idx !== imageIndex);
            
            await updateDoc(doc(db, 'services', serviceId), {
                images: updatedImages,
                image: updatedImages[0] || ''
            });
            
            await loadContent();
            showStatus('Image removed!', 'success');
        } catch (error) {
            console.error('Error removing image:', error);
            showStatus('Error removing image: ' + error.message, 'error');
        }
    }
}

// News management
function renderNewsList() {
    const container = document.getElementById('newsList');
    container.innerHTML = '';
    
    newsItems.forEach((news, index) => {
        const newsDiv = document.createElement('div');
        newsDiv.className = 'modern-project-card';
        
        // Get main image for thumbnail
        const images = news.images || [];
        const mainImage = images.length > 0 ? images[0] : (news.image || '');
        
        // Render image thumbnails
        const imagesHtml = images.map((img, idx) => `
            <div class="image-thumbnail">
                <img src="${img}" alt="Image ${idx + 1}">
                <button onclick="removeNewsImage('${news.id}', ${idx})" class="remove-image-btn" title="Remove image">×</button>
                ${idx === 0 ? '<span class="main-badge">Main</span>' : ''}
            </div>
        `).join('');
        
        // Render existing tags
        const tags = news.tags || [];
        const tagsHtml = tags.map((tag, idx) => `
            <div class="tag-chip">
                <span>#${tag}</span>
                <button onclick="removeNewsTag('${news.id}', ${idx})" class="tag-remove-btn" title="Remove tag">×</button>
            </div>
        `).join('');
        
        // Format date for display
        const displayDate = news.date ? new Date(news.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        
        newsDiv.innerHTML = `
            <div class="project-card-header">
                <div class="project-card-preview">
                    ${mainImage ? `<img src="${mainImage}" alt="${news.title || 'News'}">` : '<div class="no-image-placeholder">📰</div>'}
                </div>
                <div class="project-card-info">
                    <h3>${news.title || 'New Article'}</h3>
                    <div class="project-card-meta">
                        ${displayDate ? `<span>📅 ${displayDate}</span>` : ''}
                        ${news.category ? `<span>🏷️ ${news.category}</span>` : ''}
                        ${tags.length > 0 ? `<span>🏷 ${tags.length} ${tags.length === 1 ? 'tag' : 'tags'}</span>` : ''}
                        ${images.length > 0 ? `<span>🖼️ ${images.length} ${images.length === 1 ? 'image' : 'images'}</span>` : ''}
                    </div>
                </div>
                <div class="project-card-actions">
                    <button onclick="toggleNewsDetails('${news.id}')" class="btn-icon" title="Expand/Collapse">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <button onclick="deleteNews('${news.id}')" class="btn-icon btn-danger-icon" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div id="newsDetails_${news.id}" class="project-card-details" style="display: none;">
                <div class="project-tabs">
                    <button class="tab-btn active" onclick="switchNewsTab('${news.id}', 'basic')">📋 Basic Info</button>
                    <button class="tab-btn" onclick="switchNewsTab('${news.id}', 'content')">📝 Content</button>
                    <button class="tab-btn" onclick="switchNewsTab('${news.id}', 'media')">🎬 Media</button>
                </div>
                
                <!-- Basic Info Tab -->
                <div id="newsTab_${news.id}_basic" class="tab-content active">
                    <div class="compact-form">
                        <div class="form-field">
                            <label>Article Title</label>
                            <input type="text" id="newsTitle_${news.id}" value="${news.title || ''}" placeholder="Award-Winning Project Completed">
                        </div>
                        <div class="form-row">
                            <div class="form-field">
                                <label>Date</label>
                                <input type="date" id="newsDate_${news.id}" value="${news.date || ''}">
                            </div>
                            <div class="form-field">
                                <label>Category</label>
                                <input type="text" id="newsCategory_${news.id}" value="${news.category || ''}" placeholder="Awards, Projects">
                            </div>
                        </div>
                        <div class="form-field">
                            <label>Author</label>
                            <input type="text" id="newsAuthor_${news.id}" value="${news.author || ''}" placeholder="Atelia Built Team">
                        </div>
                        <div class="form-field">
                            <label>Excerpt <small>(listing page summary)</small></label>
                            <textarea id="newsExcerpt_${news.id}" rows="3" placeholder="Brief summary that appears on the news listing page">${news.excerpt || news.description || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Content Tab -->
                <div id="newsTab_${news.id}_content" class="tab-content">
                    <div class="compact-form">
                        <div class="form-field">
                            <label>Full Article Content</label>
                            <textarea id="newsContent_${news.id}" rows="12" placeholder="Full article content. Use double line breaks for paragraphs.

## For headings, use two hashtags
### For subheadings, use three hashtags
> Use > for quotes

Write naturally and use line breaks to separate paragraphs.">${news.content || ''}</textarea>
                            <small style="display: block; margin-top: 8px; color: #666;">
                                💡 Formatting tips: Double line breaks = new paragraph | ## = Heading | ### = Subheading | > = Quote
                            </small>
                        </div>
                        
                        <div class="content-section" style="margin-top: 24px;">
                            <div class="content-section-header">
                                <h4>🏷 Tags (${tags.length})</h4>
                            </div>
                            <div class="tags-container">
                                ${tagsHtml || '<div class="empty-state-small">No tags added yet</div>'}
                            </div>
                            <div class="add-tag-row">
                                <input type="text" id="newsNewTag_${news.id}" placeholder="Enter tag name" onkeypress="if(event.key==='Enter'){addNewsTag('${news.id}'); return false;}">
                                <button onclick="addNewsTag('${news.id}')" class="btn-small btn-success">+ Add Tag</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Media Tab -->
                <div id="newsTab_${news.id}_media" class="tab-content">
                    <div class="compact-form">
                        <div class="media-section">
                            <div class="media-header">
                                <h4>Images (${images.length})</h4>
                                <button onclick="uploadNewsImages('${news.id}')" class="btn-small btn-success">
                                    📷 Upload Images
                                </button>
                            </div>
                            <div class="images-grid">
                                ${imagesHtml || '<div class="no-images-placeholder">No images yet. Click "Upload Images" to add photos.</div>'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="project-card-footer">
                    <button onclick="updateNews('${news.id}')" class="btn btn-success">💾 Save Changes</button>
                    <button onclick="toggleNewsDetails('${news.id}')" class="btn">Cancel</button>
                </div>
            </div>
        `;
        container.appendChild(newsDiv);
    });
}

// Toggle news details expansion
function toggleNewsDetails(newsId) {
    const details = document.getElementById(`newsDetails_${newsId}`);
    if (details) {
        const isVisible = details.style.display !== 'none';
        details.style.display = isVisible ? 'none' : 'block';
    }
}

// Switch between news tabs
function switchNewsTab(newsId, tabName) {
    // Hide all tabs for this news
    const allTabs = document.querySelectorAll(`[id^="newsTab_${newsId}_"]`);
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const card = document.querySelector(`#newsDetails_${newsId}`).closest('.modern-project-card');
    const allBtns = card.querySelectorAll('.tab-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`newsTab_${newsId}_${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate corresponding button
    const btnIndex = tabName === 'basic' ? 0 : tabName === 'content' ? 1 : 2;
    if (allBtns[btnIndex]) {
        allBtns[btnIndex].classList.add('active');
    }
}

async function addNews() {
    try {
        const today = new Date().toISOString().split('T')[0];
        await addDoc(collection(db, 'news'), {
            date: today,
            title: 'New Article',
            category: '',
            author: '',
            excerpt: '',
            content: '',
            tags: [],
            images: [],
            // Keep old fields for backward compatibility
            image: '',
            alt: '',
            linkText: 'Read more',
            description: ''
        });
        loadContent();
        showStatus('News article added!', 'success');
    } catch (error) {
        showStatus('Error adding news article: ' + error.message, 'error');
    }
}

async function updateNews(newsId) {
    try {
        // Get current news to preserve images and tags arrays
        const currentNews = newsItems.find(n => n.id === newsId);
        
        await updateDoc(doc(db, 'news', newsId), {
            date: document.getElementById(`newsDate_${newsId}`).value,
            title: document.getElementById(`newsTitle_${newsId}`).value,
            category: document.getElementById(`newsCategory_${newsId}`).value,
            author: document.getElementById(`newsAuthor_${newsId}`).value,
            excerpt: document.getElementById(`newsExcerpt_${newsId}`).value,
            content: document.getElementById(`newsContent_${newsId}`).value,
            tags: currentNews.tags || [],
            images: currentNews.images || [],
            // Update old fields for backward compatibility
            image: (currentNews.images && currentNews.images[0]) || '',
            alt: document.getElementById(`newsTitle_${newsId}`).value,
            linkText: 'Read more',
            description: document.getElementById(`newsExcerpt_${newsId}`).value
        });
        showStatus('News article updated!', 'success');
        loadContent(); // Reload to reflect changes
    } catch (error) {
        showStatus('Error updating news article: ' + error.message, 'error');
    }
}

async function deleteNews(newsId) {
    if (confirm('Are you sure you want to delete this news article?')) {
        try {
            await deleteDoc(doc(db, 'news', newsId));
            loadContent();
            showStatus('News article deleted!', 'success');
        } catch (error) {
            showStatus('Error deleting news article: ' + error.message, 'error');
        }
    }
}

// Helper functions for news tags
function addNewsTag(newsId) {
    const tagInput = document.getElementById(`newsNewTag_${newsId}`);
    const tagValue = tagInput.value.trim();
    
    if (!tagValue) {
        showStatus('Please enter a tag name', 'error');
        return;
    }
    
    const currentNews = newsItems.find(n => n.id === newsId);
    const tags = currentNews.tags || [];
    
    if (!tags.includes(tagValue)) {
        tags.push(tagValue);
        currentNews.tags = tags;
        tagInput.value = '';
        renderNewsList();
    } else {
        showStatus('Tag already exists', 'error');
    }
}

function removeNewsTag(newsId, tagIndex) {
    const currentNews = newsItems.find(n => n.id === newsId);
    const tags = currentNews.tags || [];
    tags.splice(tagIndex, 1);
    currentNews.tags = tags;
    renderNewsList();
}

// Upload multiple images for a news article
function uploadNewsImages(newsId) {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;
        
        // Validate files
        const maxSize = 5 * 1024 * 1024; // 5MB
        const invalidFiles = files.filter(f => f.size > maxSize);
        
        if (invalidFiles.length > 0) {
            showStatus('Some files are too large (max 5MB per file)', 'error');
            return;
        }
        
        if (files.length > 10) {
            showStatus('Maximum 10 images at a time', 'error');
            return;
        }
        
        // Create upload progress items
        const uploadIds = files.map((file, index) => {
            const uploadId = `news-${newsId}-${Date.now()}-${index}`;
            addUploadItem(file, uploadId);
            return uploadId;
        });
        
        try {
            const currentNews = newsItems.find(n => n.id === newsId);
            const currentImages = currentNews.images || [];
            
            // Upload all files with progress tracking
            const uploadPromises = files.map(async (file, index) => {
                const uploadId = uploadIds[index];
                try {
                    const url = await uploadToCloudinary(file, 'atelia/news', uploadId, (progress) => {
                        updateUploadProgress(uploadId, progress, 'uploading');
                    });
                    updateUploadProgress(uploadId, 100, 'success');
                    return url;
                } catch (error) {
                    updateUploadProgress(uploadId, 0, 'error');
                    throw error;
                }
            });
            
            const uploadedUrls = await Promise.all(uploadPromises);
            
            // Add new images to array
            const updatedImages = [...currentImages, ...uploadedUrls];
            
            // Update Firestore
            await updateDoc(doc(db, 'news', newsId), {
                images: updatedImages,
                image: updatedImages[0] || ''
            });
            
            // Reload content
            await loadContent();
            showStatus(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully!`, 'success');
            
            // Remove progress items after a delay
            setTimeout(() => {
                uploadIds.forEach(id => removeUploadItem(id));
            }, 2000);
            
        } catch (err) {
            console.error('Error uploading images:', err);
            showStatus('Error uploading images: ' + err.message, 'error');
            
            // Remove failed upload items
            uploadIds.forEach(id => removeUploadItem(id));
        }
    };
    
    // Trigger file picker
    input.click();
}

// Remove image from news article
async function removeNewsImage(newsId, imageIndex) {
    if (confirm('Are you sure you want to remove this image?')) {
        try {
            const currentNews = newsItems.find(n => n.id === newsId);
            const currentImages = currentNews.images || [];
            const updatedImages = currentImages.filter((_, idx) => idx !== imageIndex);
            
            await updateDoc(doc(db, 'news', newsId), {
                images: updatedImages,
                image: updatedImages[0] || ''
            });
            
            await loadContent();
            showStatus('Image removed!', 'success');
        } catch (error) {
            console.error('Error removing image:', error);
            showStatus('Error removing image: ' + error.message, 'error');
        }
    }
}

// Cloudinary Upload Functions
// Legacy single image upload functions (kept for backward compatibility)
function uploadProjectImage(projectId) {
    openCustomUploader((imageUrl) => {
        document.getElementById(`projectImage_${projectId}`).value = imageUrl;
        showStatus('Image uploaded successfully!', 'success');
        loadContent(); // Refresh to show preview
    }, 'atelia/projects');
}

function uploadServiceImage(serviceId) {
    openCustomUploader((imageUrl) => {
        document.getElementById(`serviceImage_${serviceId}`).value = imageUrl;
        showStatus('Image uploaded successfully!', 'success');
        loadContent(); // Refresh to show preview
    }, 'atelia/services');
}

function uploadNewsImage(newsId) {
    openCustomUploader((imageUrl) => {
        document.getElementById(`newsImage_${newsId}`).value = imageUrl;
        showStatus('Image uploaded successfully!', 'success');
        loadContent(); // Refresh to show preview
    }, 'atelia/news');
}

// Custom lightweight uploader for single images
function openCustomUploader(onSuccess, folder = 'atelia') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file size
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            showStatus('File is too large (max 5MB)', 'error');
            return;
        }
        
        // Create upload progress item
        const uploadId = `custom-${Date.now()}`;
        addUploadItem(file, uploadId);
        
        try {
            const imageUrl = await uploadToCloudinary(file, folder, uploadId, (progress) => {
                updateUploadProgress(uploadId, progress, 'uploading');
            });
            
            updateUploadProgress(uploadId, 100, 'success');
            
            if (onSuccess) {
                onSuccess(imageUrl);
            }
            
            // Remove progress item after a delay
            setTimeout(() => {
                removeUploadItem(uploadId);
            }, 2000);
            
        } catch (err) {
            console.error('Upload error:', err);
            updateUploadProgress(uploadId, 0, 'error');
            showStatus('Upload failed: ' + err.message, 'error');
            
            // Remove failed upload item
            setTimeout(() => {
                removeUploadItem(uploadId);
            }, 3000);
        }
    };
    
    input.click();
}

// Bookings Management
async function loadBookings() {
    try {
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) return; // Exit if element doesn't exist
        
        const q = query(collection(db, 'bookings'), orderBy('timestamp', 'desc'));
        const bookingsSnapshot = await getDocs(q);
        bookings = [];
        bookingsSnapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        renderBookings();
        updateBookingsCount();
    } catch (error) {
        console.error('Error loading bookings:', error);
        const bookingsList = document.getElementById('bookingsList');
        if (bookingsList) {
            bookingsList.innerHTML = '<p style="text-align: center; color: #dc3545;">Error loading bookings. Please refresh or check your connection.</p>';
        }
    }
}

function renderBookings() {
    const container = document.getElementById('bookingsList');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px 0;">No bookings yet.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    bookings.forEach(booking => {
        const bookingCard = document.createElement('div');
        bookingCard.className = `booking-card ${!booking.read ? 'unread' : ''}`;
        
        const timestamp = booking.timestamp?.toDate ? booking.timestamp.toDate().toLocaleString() : 'N/A';
        
        bookingCard.innerHTML = `
            <div class="booking-header">
                <div class="booking-info">
                    <h4>${booking.name}</h4>
                    <div class="booking-meta">${timestamp}</div>
                </div>
                <span class="booking-status-badge ${booking.status || 'new'}">${(booking.status || 'new').toUpperCase()}</span>
            </div>
            <div class="booking-details">
                <div class="booking-detail-row">
                    <div class="booking-detail-label">Email:</div>
                    <div class="booking-detail-value"><a href="mailto:${booking.email}">${booking.email}</a></div>
                </div>
                <div class="booking-detail-row">
                    <div class="booking-detail-label">Phone:</div>
                    <div class="booking-detail-value"><a href="tel:${booking.phone}">${booking.phone}</a></div>
                </div>
                <div class="booking-detail-row">
                    <div class="booking-detail-label">Service:</div>
                    <div class="booking-detail-value">${booking.service}</div>
                </div>
                <div class="booking-detail-row">
                    <div class="booking-detail-label">Message:</div>
                    <div class="booking-detail-value">${booking.message}</div>
                </div>
            </div>
            <div class="booking-actions">
                ${!booking.read ? `<button onclick="markAsRead('${booking.id}')" class="btn btn-success">Mark as Read</button>` : ''}
                <button onclick="updateBookingStatus('${booking.id}', 'contacted')" class="btn">Mark Contacted</button>
                <button onclick="updateBookingStatus('${booking.id}', 'completed')" class="btn">Mark Completed</button>
                <button onclick="deleteBooking('${booking.id}')" class="btn btn-danger">Delete</button>
            </div>
        `;
        
        container.appendChild(bookingCard);
    });
}

function updateBookingsCount() {
    const unreadCount = bookings.filter(b => !b.read).length;
    const badge = document.getElementById('bookingsCount');
    if (badge) {
        badge.textContent = unreadCount > 0 ? unreadCount : '';
    }
}

async function markAsRead(bookingId) {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), {
            read: true
        });
        await loadBookings();
        showStatus('Booking marked as read', 'success');
    } catch (error) {
        showStatus('Error updating booking: ' + error.message, 'error');
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), {
            status: status,
            read: true
        });
        await loadBookings();
        showStatus(`Booking status updated to ${status}`, 'success');
    } catch (error) {
        showStatus('Error updating booking: ' + error.message, 'error');
    }
}

async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
        await deleteDoc(doc(db, 'bookings', bookingId));
        await loadBookings();
        showStatus('Booking deleted successfully', 'success');
    } catch (error) {
        showStatus('Error deleting booking: ' + error.message, 'error');
    }
}

async function refreshBookings() {
    await loadBookings();
    showStatus('Bookings refreshed', 'success');
}

// Copy to Clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.textContent || element.innerText;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showStatus('Copied to clipboard!', 'success');
        }).catch(err => {
            // Fallback to old method
            fallbackCopy(text);
        });
    } else {
        // Fallback for older browsers
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showStatus('Copied to clipboard!', 'success');
    } catch (err) {
        showStatus('Failed to copy. Please copy manually.', 'error');
    }
    
    document.body.removeChild(textarea);
}

// Make functions globally available
window.saveHero = saveHero;
window.saveProjects = saveProjects;
window.saveAbout = saveAbout;
window.saveServices = saveServices;
window.saveNews = saveNews;
window.saveCTA = saveCTA;
window.saveSettings = saveSettings;
window.changePassword = changePassword;
window.addProject = addProject;
window.updateProject = updateProject;
window.deleteProject = deleteProject;
window.uploadProjectImage = uploadProjectImage;
window.uploadProjectImages = uploadProjectImages;
window.removeProjectImage = removeProjectImage;
window.toggleProjectDetails = toggleProjectDetails;
window.switchProjectTab = switchProjectTab;
window.addService = addService;
window.updateService = updateService;
window.deleteService = deleteService;
window.uploadServiceImage = uploadServiceImage;
window.uploadServiceImages = uploadServiceImages;
window.removeServiceImage = removeServiceImage;
window.addServiceFeature = addServiceFeature;
window.removeServiceFeature = removeServiceFeature;
window.addProcessStep = addProcessStep;
window.removeProcessStep = removeProcessStep;
window.toggleServiceDetails = toggleServiceDetails;
window.switchServiceTab = switchServiceTab;
window.addNews = addNews;
window.updateNews = updateNews;
window.deleteNews = deleteNews;
window.uploadNewsImage = uploadNewsImage;
window.uploadNewsImages = uploadNewsImages;
window.removeNewsImage = removeNewsImage;
window.addNewsTag = addNewsTag;
window.removeNewsTag = removeNewsTag;
window.toggleNewsDetails = toggleNewsDetails;
window.switchNewsTab = switchNewsTab;
window.markAsRead = markAsRead;
window.updateBookingStatus = updateBookingStatus;
window.deleteBooking = deleteBooking;
window.refreshBookings = refreshBookings;
window.copyToClipboard = copyToClipboard;

// Hero Slider Management Functions
async function loadHeroSlides() {
    try {
        const slidesSnapshot = await getDocs(collection(db, 'heroSlides'));
        heroSlides = [];
        
        slidesSnapshot.forEach(doc => {
            const slideData = doc.data();
            heroSlides.push({
                id: doc.id,
                ...slideData
            });
        });

        // Sort slides by order
        heroSlides.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        console.log('Admin: Loaded hero slides:', heroSlides.length, heroSlides);
        renderHeroSlidesList();
    } catch (error) {
        console.error('Error loading hero slides:', error);
        showStatus('Error loading hero slides: ' + error.message, 'error');
    }
}

async function loadSliderSettings() {
    try {
        const settingsDoc = await getDoc(doc(db, 'content', 'sliderSettings'));
        if (settingsDoc.exists()) {
            sliderSettings = settingsDoc.data();
            
            // Update UI elements
            const durationInput = document.getElementById('sliderDuration');
            const enabledCheckbox = document.getElementById('sliderEnabled');
            
            if (durationInput) durationInput.value = sliderSettings.duration || 5;
            if (enabledCheckbox) enabledCheckbox.checked = sliderSettings.enabled !== false;
        }
    } catch (error) {
        console.error('Error loading slider settings:', error);
    }
}

function renderHeroSlidesList() {
    const container = document.getElementById('heroSlidesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (heroSlides.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No slides added yet. Click "Add New Slide" to get started.</p>';
        updateSliderPreview();
        return;
    }
    
    heroSlides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'item-card';
        slideDiv.innerHTML = `
            <h4>Slide ${index + 1} ${slide.title ? `- ${slide.title}` : ''}</h4>
            <div class="grid">
                <div class="form-group">
                    <label>Title:</label>
                    <input type="text" id="slideTitle_${slide.id}" value="${slide.title || ''}" placeholder="Optional title for this slide">
                </div>
                <div class="form-group">
                    <label>Image URL:</label>
                    <input type="text" id="slideImage_${slide.id}" value="${slide.imageUrl || ''}" readonly>
                    <button onclick="uploadHeroSlideImage('${slide.id}')" class="btn" style="margin-top: 10px;">Upload Image</button>
                    ${slide.imageUrl ? `<img src="${slide.imageUrl}" class="image-preview" alt="Preview">` : ''}
                </div>
                <div class="form-group">
                    <label>Order:</label>
                    <input type="number" id="slideOrder_${slide.id}" value="${slide.order || index}" min="0">
                    <small>Lower numbers appear first</small>
                </div>
                <div class="form-group">
                    <label>Alt Text:</label>
                    <input type="text" id="slideAlt_${slide.id}" value="${slide.alt || ''}" placeholder="Description for accessibility">
                </div>
            </div>
            <div class="btn-group">
                <button onclick="updateHeroSlide('${slide.id}')" class="btn btn-success">Update</button>
                <button onclick="deleteHeroSlide('${slide.id}')" class="btn btn-danger">Delete</button>
                ${index > 0 ? `<button onclick="moveSlideUp('${slide.id}')" class="btn">Move Up</button>` : ''}
                ${index < heroSlides.length - 1 ? `<button onclick="moveSlideDown('${slide.id}')" class="btn">Move Down</button>` : ''}
            </div>
        `;
        container.appendChild(slideDiv);
    });
    
    // Update the preview
    updateSliderPreview();
}

// Update the slider preview in admin panel
let previewSlideIndex = 0;
let previewInterval = null;

function updateSliderPreview() {
    const preview = document.getElementById('heroSliderPreview');
    if (!preview) return;
    
    // Clear existing interval
    if (previewInterval) {
        clearInterval(previewInterval);
        previewInterval = null;
    }
    
    console.log('Updating preview with slides:', heroSlides.length);
    
    if (heroSlides.length === 0) {
        preview.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #999; padding: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">No slides to preview</p>
                <small style="display: block; margin-bottom: 15px;">Add slides below to see the preview</small>
                <button onclick="addHeroSlide()" class="btn" style="margin-top: 10px;">Add Your First Slide</button>
            </div>
        `;
        return;
    }
    
    // Clear and set up preview
    preview.innerHTML = '';
    preview.style.background = '#000';
    
    // Check if slides have images
    const slidesWithImages = heroSlides.filter(s => s.imageUrl);
    if (slidesWithImages.length === 0) {
        preview.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #fff; padding: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">⚠️ No images uploaded yet</p>
                <small style="display: block;">Upload images to your slides below</small>
            </div>
        `;
        return;
    }
    
    // Create slide elements for preview
    const previewSlides = heroSlides.map((slide, index) => {
        const slideEl = document.createElement('div');
        slideEl.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${slide.imageUrl}');
            background-size: cover;
            background-position: center;
            opacity: ${index === 0 ? '1' : '0'};
            transition: opacity 1s ease-in-out;
        `;
        
        // Add overlay with slide info
        if (slide.title) {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: absolute;
                bottom: 40px;
                left: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                max-width: 80%;
            `;
            overlay.textContent = slide.title;
            slideEl.appendChild(overlay);
        }
        
        preview.appendChild(slideEl);
        return slideEl;
    });
    
    // Add slide counter
    const counter = document.createElement('div');
    counter.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10;
    `;
    counter.textContent = `1 / ${heroSlides.length}`;
    preview.appendChild(counter);
    
    // Add status indicator
    const status = document.createElement('div');
    status.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 11px;
        z-index: 10;
    `;
    status.textContent = '● LIVE PREVIEW';
    preview.appendChild(status);
    
    // Start preview slider if more than 1 slide
    if (heroSlides.length > 1) {
        previewSlideIndex = 0;
        previewInterval = setInterval(() => {
            // Hide current slide
            previewSlides[previewSlideIndex].style.opacity = '0';
            
            // Move to next slide
            previewSlideIndex = (previewSlideIndex + 1) % heroSlides.length;
            
            // Show next slide
            previewSlides[previewSlideIndex].style.opacity = '1';
            
            // Update counter
            counter.textContent = `${previewSlideIndex + 1} / ${heroSlides.length}`;
        }, 3000); // Change slide every 3 seconds
    }
}

async function addHeroSlide() {
    try {
        const newSlide = {
            title: '',
            imageUrl: '',
            alt: '',
            order: heroSlides.length,
            createdAt: new Date()
        };
        
        const docRef = await addDoc(collection(db, 'heroSlides'), newSlide);
        showStatus('New slide added! Please upload an image.', 'success');
        await loadHeroSlides();
    } catch (error) {
        console.error('Error adding hero slide:', error);
        showStatus('Error adding slide: ' + error.message, 'error');
    }
}

async function updateHeroSlide(slideId) {
    try {
        const title = document.getElementById(`slideTitle_${slideId}`).value;
        const imageUrl = document.getElementById(`slideImage_${slideId}`).value;
        const order = parseInt(document.getElementById(`slideOrder_${slideId}`).value) || 0;
        const alt = document.getElementById(`slideAlt_${slideId}`).value;
        
        if (!imageUrl) {
            showStatus('Please upload an image for this slide.', 'error');
            return;
        }
        
        await updateDoc(doc(db, 'heroSlides', slideId), {
            title: title,
            imageUrl: imageUrl,
            order: order,
            alt: alt,
            updatedAt: new Date()
        });
        
        showStatus('Slide updated successfully!', 'success');
        await loadHeroSlides();
    } catch (error) {
        console.error('Error updating hero slide:', error);
        showStatus('Error updating slide: ' + error.message, 'error');
    }
}

async function deleteHeroSlide(slideId) {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    
    try {
        await deleteDoc(doc(db, 'heroSlides', slideId));
        showStatus('Slide deleted successfully!', 'success');
        await loadHeroSlides();
    } catch (error) {
        console.error('Error deleting hero slide:', error);
        showStatus('Error deleting slide: ' + error.message, 'error');
    }
}

async function moveSlideUp(slideId) {
    const slideIndex = heroSlides.findIndex(slide => slide.id === slideId);
    if (slideIndex <= 0) return;
    
    try {
        // Swap orders
        const currentOrder = heroSlides[slideIndex].order || slideIndex;
        const previousOrder = heroSlides[slideIndex - 1].order || (slideIndex - 1);
        
        await updateDoc(doc(db, 'heroSlides', slideId), { order: previousOrder });
        await updateDoc(doc(db, 'heroSlides', heroSlides[slideIndex - 1].id), { order: currentOrder });
        
        showStatus('Slide moved up!', 'success');
        await loadHeroSlides();
    } catch (error) {
        console.error('Error moving slide up:', error);
        showStatus('Error moving slide: ' + error.message, 'error');
    }
}

async function moveSlideDown(slideId) {
    const slideIndex = heroSlides.findIndex(slide => slide.id === slideId);
    if (slideIndex >= heroSlides.length - 1) return;
    
    try {
        // Swap orders
        const currentOrder = heroSlides[slideIndex].order || slideIndex;
        const nextOrder = heroSlides[slideIndex + 1].order || (slideIndex + 1);
        
        await updateDoc(doc(db, 'heroSlides', slideId), { order: nextOrder });
        await updateDoc(doc(db, 'heroSlides', heroSlides[slideIndex + 1].id), { order: currentOrder });
        
        showStatus('Slide moved down!', 'success');
        await loadHeroSlides();
    } catch (error) {
        console.error('Error moving slide down:', error);
        showStatus('Error moving slide: ' + error.message, 'error');
    }
}

function uploadHeroSlideImage(slideId) {
    openCustomUploader((imageUrl) => {
        document.getElementById(`slideImage_${slideId}`).value = imageUrl;
        showStatus('Image uploaded successfully!', 'success');
        loadHeroSlides(); // Refresh to show preview
    }, 'atelia/hero-slider');
}

async function saveSliderSettings() {
    try {
        const duration = parseInt(document.getElementById('sliderDuration').value) || 5;
        const enabled = document.getElementById('sliderEnabled').checked;
        
        await setDoc(doc(db, 'content', 'sliderSettings'), {
            duration: duration,
            enabled: enabled,
            updatedAt: new Date()
        });
        
        showStatus('Slider settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving slider settings:', error);
        showStatus('Error saving settings: ' + error.message, 'error');
    }
}

async function refreshHeroSlider() {
    try {
        await loadHeroSlides();
        await loadSliderSettings();
        showStatus('Hero slider refreshed!', 'success');
    } catch (error) {
        console.error('Error refreshing hero slider:', error);
        showStatus('Error refreshing slider: ' + error.message, 'error');
    }
}

// Make hero slider functions globally available
window.addHeroSlide = addHeroSlide;
window.updateHeroSlide = updateHeroSlide;
window.deleteHeroSlide = deleteHeroSlide;
window.moveSlideUp = moveSlideUp;
window.moveSlideDown = moveSlideDown;
window.uploadHeroSlideImage = uploadHeroSlideImage;
window.saveSliderSettings = saveSliderSettings;
window.refreshHeroSlider = refreshHeroSlider;
