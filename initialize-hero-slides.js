// Initialize Hero Slider with Default Images
// This script can be run in the browser console to add default hero slides

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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

// Default hero slides with high-quality architectural images
const defaultSlides = [
    {
        title: "Modern Architecture",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80",
        alt: "Modern architectural design with clean lines and natural lighting",
        order: 0
    },
    {
        title: "Luxury Kitchen",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80",
        alt: "Luxury kitchen with dark cabinetry and modern appliances",
        order: 1
    },
    {
        title: "Elegant Exterior",
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80",
        alt: "Elegant home exterior with beautiful landscaping",
        order: 2
    },
    {
        title: "Luxury Bathroom",
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80",
        alt: "Luxury bathroom with marble finishes and modern fixtures",
        order: 3
    }
];

async function initializeHeroSlides() {
    try {
        console.log('Initializing hero slides...');
        
        for (const slide of defaultSlides) {
            await addDoc(collection(db, 'heroSlides'), {
                ...slide,
                createdAt: new Date()
            });
            console.log(`Added slide: ${slide.title}`);
        }
        
        console.log('Hero slides initialized successfully!');
        console.log('You can now visit the admin panel to manage the slides.');
        
    } catch (error) {
        console.error('Error initializing hero slides:', error);
    }
}

// Export for use in browser console
window.initializeHeroSlides = initializeHeroSlides;

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined') {
    console.log('Hero slider initialization script loaded.');
    console.log('Run initializeHeroSlides() in the console to add default slides.');
}
