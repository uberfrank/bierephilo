// UX Module - User Experience & Interface
// Handles translations, navigation, notifications, animations, PWA support
'use strict';

// ==================== MULTILINGUAL SUPPORT ====================

// Global language state
let currentLanguage = 'fr';
let translations = {};

// Load translations
async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations-${lang}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        return await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

// Get nested translation value
function getTranslation(key) {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key; // Return key if translation not found
        }
    }

    return value || key;
}

// Update all UI text with translations
function updateUIText() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);

        if (translation) {
            element.textContent = translation;
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getTranslation(key);

        if (translation) {
            element.placeholder = translation;
        }
    });

    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', currentLanguage);
    document.documentElement.setAttribute('data-lang', currentLanguage);
}

// Change language
async function changeLanguage(lang) {
    if (lang === currentLanguage) return;

    currentLanguage = lang;

    // Load translations
    translations = await loadTranslations(lang);
    if (!translations) {
        console.error('Failed to load translations, reverting to previous language');
        return;
    }

    // Update UI
    updateUIText();

    // Reload questions if questions data exists and loadQuestions is available
    if (typeof questionsData !== 'undefined' && questionsData && typeof loadQuestions === 'function') {
        await loadQuestions();
    }

    // Update global language buttons
    document.querySelectorAll('.global-lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Save language preference
    localStorage.setItem('preferredLanguage', lang);
}

// ==================== TOAST NOTIFICATION ====================

// Toast Notification Function
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) return;

    // If message is a translation key (starts with lowercase letter and contains dots), translate it
    if (message && /^[a-z].*\./.test(message)) {
        message = getTranslation(message);
    }
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ==================== UTILITY FUNCTIONS ====================

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Helper function to switch game screens
function switchGameScreen(screenId) {
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(screen => screen.classList.remove('active'));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // Scroll to game section
        const gameSection = document.getElementById('game');
        if (gameSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = gameSection.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// ==================== NAVIGATION & MENU ====================

// Initialize navigation and menu functionality
function initializeNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!menuToggle || !mainNav) return;

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');

        // Update ARIA attributes for accessibility
        const isExpanded = mainNav.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only handle hash links for smooth scrolling
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();

                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));

                // Add active class to clicked link
                link.classList.add('active');

                // Close mobile menu
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');

                // Smooth scroll to section
                const targetSection = document.querySelector(href);

                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            } else {
                // For page links, just close the menu
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        }
    });
}

// ==================== HEADER & SCROLL EFFECTS ====================

function initializeScrollEffects() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add shadow to header on scroll
        if (currentScroll > 10) {
            header.style.boxShadow = '0 2px 16px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }
    });
}

// ==================== SECTION ANIMATIONS ====================

function initializeSectionAnimations() {
    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply initial styles and observe sections
    sections.forEach(section => {
        if (!section.classList.contains('hero')) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
        sectionObserver.observe(section);
    });
}

// ==================== TOUCH INTERACTIONS ====================

function initializeTouchInteractions() {
    // Touch gesture support for cards
    const cards = document.querySelectorAll('.card');
    let touchStartX = 0;
    let touchStartY = 0;

    cards.forEach(card => {
        card.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        card.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Detect swipe (minimum 50px movement)
            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 200);
            }
        }, { passive: true });
    });

    // Prevent zoom on double-tap for better UX
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// ==================== FORM VALIDATION ====================

function initializeFormValidation() {
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');

    formInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() !== '') {
                input.style.borderColor = '#4CAF50';
            } else if (input.hasAttribute('required')) {
                input.style.borderColor = '#f44336';
            }
        });

        input.addEventListener('focus', () => {
            input.style.borderColor = '#2196F3';
        });

        input.addEventListener('input', () => {
            if (input.style.borderColor === 'rgb(244, 67, 54)') {
                input.style.borderColor = '#e0e0e0';
            }
        });
    });
}

// ==================== ACTIVE NAV TRACKING ====================

function initializeActiveNavTracking() {
    const navLinks = document.querySelectorAll('.nav-link');

    const updateActiveNavLink = debounce(() => {
        const sections = document.querySelectorAll('.section');
        const scrollPosition = window.pageYOffset + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, 100);

    window.addEventListener('scroll', updateActiveNavLink);
}

// ==================== PWA SUPPORT ====================

function initializePWA() {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }

    // Add to Home Screen prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Show install prompt after 30 seconds
        setTimeout(() => {
            if (deferredPrompt) {
                showToast(getTranslation('messages.addToHomeScreen'), 5000);
            }
        }, 30000);
    });

    // Handle install prompt
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed');
        showToast(getTranslation('messages.appInstalled'));
        deferredPrompt = null;
    });

    // Online/Offline status
    window.addEventListener('online', () => {
        showToast(getTranslation('messages.backOnline'));
    });

    window.addEventListener('offline', () => {
        showToast(getTranslation('messages.offline'));
    });
}

// ==================== LANGUAGE TOGGLE ====================

function initializeLanguageToggle() {
    document.querySelectorAll('.global-lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            changeLanguage(lang);
        });
    });
}

// ==================== PAGE INITIALIZATION ====================

async function initializeUX() {
    // Load saved language preference or default to 'en'
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
    currentLanguage = savedLanguage;

    // Load translations
    translations = await loadTranslations(currentLanguage);

    // Update UI with translations
    updateUIText();

    // Update global language buttons
    document.querySelectorAll('.global-lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
    });

    // Initialize all UX components
    initializeNavigation();
    initializeScrollEffects();
    initializeSectionAnimations();
    initializeTouchInteractions();
    initializeFormValidation();
    initializeActiveNavTracking();
    initializePWA();
    initializeLanguageToggle();

    // Console welcome message
    console.log('%c🍺 Bierephilo', 'font-size: 24px; color: #2196F3; font-weight: bold;');
    console.log('%cWelcome to the console! Happy philosophical pondering!', 'font-size: 14px; color: #666;');
}

// Page load animation and initialization
window.addEventListener('load', async () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';

    await initializeUX();

    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    // Show welcome toast
    setTimeout(() => {
        showToast(getTranslation('messages.welcome'));
    }, 500);
});
