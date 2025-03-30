// DOM Elements
const sections = {
    home: document.getElementById('home-section'),
    events: document.getElementById('events-section'),
    myEvents: document.getElementById('my-events-section'),
    myBookings: document.getElementById('my-bookings-section')
};

const navLinks = {
    home: document.getElementById('home-link'),
    events: document.getElementById('events-link'),
    myEvents: document.getElementById('my-events-link'),
    myBookings: document.getElementById('my-bookings-link')
};

const loadingOverlay = document.getElementById('loading-overlay');
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');

// Global State
let currentUser = null;
const API_BASE_URL = 'http://localhost:8080/api';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthState();
    showSection('home');
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    navLinks.home.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('home');
    });

    navLinks.events.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('events');
    });

    navLinks.myEvents.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('myEvents');
    });

    navLinks.myBookings.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('myBookings');
    });

    // Hamburger menu
    hamburger.addEventListener('click', toggleMobileMenu);

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Section Management
function showSection(sectionKey) {
    // Hide all sections
    Object.values(sections).forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    sections[sectionKey].classList.remove('hidden');

    // Load section data if needed
    switch(sectionKey) {
        case 'events':
            loadEvents();
            break;
        case 'myEvents':
            if (currentUser) loadMyEvents();
            break;
        case 'myBookings':
            if (currentUser) loadMyBookings();
            break;
    }
}

// Mobile Menu
function toggleMobileMenu() {
    navLinksContainer.classList.toggle('active');
}

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        const modalId = modal.id;
        closeModal(modalId);
    });
}

// Loading State
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// API Helper
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Auth State Management
function checkAuthState() {
    const token = localStorage.getItem('token');
    const authButtons = document.querySelector('.auth-buttons');
    const userProfile = document.querySelector('.user-profile');

    if (token) {
        // Decode token to get user info (simple approach - in production, verify on server)
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = {
            id: payload.sub,
            email: payload.sub,
            role: payload.role
        };

        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        document.getElementById('username-display').textContent = currentUser.email;

        // Show/hide nav links based on role
        if (currentUser.role === 'ORGANIZER') {
            navLinks.myEvents.classList.remove('hidden');
        } else {
            navLinks.myEvents.classList.add('hidden');
        }
        navLinks.myBookings.classList.remove('hidden');
    } else {
        authButtons.classList.remove('hidden');
        userProfile.classList.add('hidden');
        navLinks.myEvents.classList.add('hidden');
        navLinks.myBookings.classList.add('hidden');
    }
}

// Export functions to other modules
window.app = {
    showLoading,
    hideLoading,
    fetchWithAuth,
    showSection,
    openModal,
    closeModal,
    checkAuthState,
    currentUser: () => currentUser
};