// Mobile Site JavaScript
// Optimized for touch interactions and mobile performance

'use strict';

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const ctaButton = document.getElementById('ctaButton');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

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
        e.preventDefault();

        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));

        // Add active class to clicked link
        link.classList.add('active');

        // Close mobile menu
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');

        // Smooth scroll to section
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
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

// Contact Form Handling
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Simulate form submission
    console.log('Form submitted:', data);

    // Show success message
    formSuccess.classList.add('show');
    contactForm.reset();

    // Show toast notification
    showToast('Message sent successfully!');

    // Hide success message after 5 seconds
    setTimeout(() => {
        formSuccess.classList.remove('show');
    }, 5000);
});

// CTA Button Click
ctaButton.addEventListener('click', () => {
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = contactSection.offsetTop - headerHeight;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });

    showToast('Let\'s get in touch!');
});

// Toast Notification Function
function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow to header on scroll
    if (currentScroll > 10) {
        header.style.boxShadow = '0 2px 16px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for section animations
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

// Form input validation with visual feedback
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

// Prevent zoom on double-tap for better UX
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Performance optimization: Debounce scroll events
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

// Update active nav link based on scroll position
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

// Page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';

    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    // Show welcome toast
    setTimeout(() => {
        showToast('Welcome to Bierephilo! 🍺');
    }, 500);
});

// Service Worker Registration (PWA support)
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
            showToast('Add Bierephilo to your home screen for easy access!', 5000);
        }
    }, 30000);
});

// Handle install prompt
window.addEventListener('appinstalled', () => {
    console.log('PWA installed');
    showToast('App installed successfully!');
    deferredPrompt = null;
});

// Online/Offline status
window.addEventListener('online', () => {
    showToast('You are back online!');
});

window.addEventListener('offline', () => {
    showToast('You are offline. Some features may be limited.');
});

// Console welcome message
console.log('%c🍺 Bierephilo', 'font-size: 24px; color: #2196F3; font-weight: bold;');
console.log('%cWelcome to the console! Happy philosophical pondering!', 'font-size: 14px; color: #666;');

// ==================== PHILOSOPHICAL QUESTIONS FEATURE ====================

// Questions state
let questionsData = null;
let currentLanguage = 'en';
let currentCategory = 'all';
let searchQuery = '';
let currentPage = 1;
const questionsPerPage = 10;

// Load questions data
async function loadQuestions() {
    try {
        const response = await fetch('questions_philosophiques.json');
        if (!response.ok) throw new Error('Failed to load questions');
        questionsData = await response.json();
        initializeQuestions();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('questionsList').innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">⚠️</div>
                <p class="no-results-text">Failed to load questions</p>
                <p>Please refresh the page to try again.</p>
            </div>
        `;
    }
}

// Initialize questions interface
function initializeQuestions() {
    renderCategoryButtons();
    renderQuestions();
    setupQuestionListeners();
}

// Render category filter buttons
function renderCategoryButtons() {
    const container = document.getElementById('categoryButtons');
    if (!container || !questionsData) return;

    const categories = questionsData.categories;
    const buttons = categories.map(cat => {
        const count = questionsData.questions.filter(q =>
            q.tags.some(tag => tag === `categorie:${cat.id}`)
        ).length;

        return `
            <button class="category-btn" data-category="${cat.id}">
                <span>${cat.nom[currentLanguage]}</span>
                <span class="category-count">(${count})</span>
            </button>
        `;
    }).join('');

    container.innerHTML = buttons;
}

// Get filtered questions
function getFilteredQuestions() {
    if (!questionsData) return [];

    let filtered = questionsData.questions;

    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(q =>
            q.tags.some(tag => tag === `categorie:${currentCategory}`)
        );
    }

    // Filter by search query
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(q => {
            const questionText = q.question[currentLanguage].toLowerCase();
            const tagsText = q.tags.join(' ').toLowerCase();
            return questionText.includes(query) || tagsText.includes(query);
        });
    }

    return filtered;
}

// Render questions
function renderQuestions() {
    const container = document.getElementById('questionsList');
    const countElement = document.getElementById('questionCount');
    if (!container || !questionsData) return;

    const filteredQuestions = getFilteredQuestions();
    const totalQuestions = filteredQuestions.length;

    // Update count
    if (countElement) {
        countElement.textContent = `Showing ${totalQuestions} question${totalQuestions !== 1 ? 's' : ''}`;
    }

    // No results
    if (totalQuestions === 0) {
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🤔</div>
                <p class="no-results-text">No questions found</p>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        renderPagination(0);
        return;
    }

    // Pagination
    const totalPages = Math.ceil(totalQuestions / questionsPerPage);
    if (currentPage > totalPages) currentPage = 1;

    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    // Render question cards
    const cardsHTML = paginatedQuestions.map(q => renderQuestionCard(q)).join('');
    container.innerHTML = cardsHTML;

    // Render pagination
    renderPagination(totalPages);

    // Scroll to questions section
    if (currentPage > 1 || searchQuery || currentCategory !== 'all') {
        const questionsSection = document.getElementById('questions');
        if (questionsSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = questionsSection.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Render a single question card
function renderQuestionCard(question) {
    const categoryTag = question.tags.find(tag => tag.startsWith('categorie:'));
    const categoryId = categoryTag ? categoryTag.split(':')[1] : '';
    const category = questionsData.categories.find(c => c.id === categoryId);
    const categoryName = category ? category.nom[currentLanguage] : '';

    const difficultyTag = question.tags.find(tag => tag.startsWith('difficulte:'));
    const difficulty = difficultyTag ? difficultyTag.split(':')[1] : '';

    const themeTag = question.tags.find(tag => tag.startsWith('theme:'));
    const theme = themeTag ? themeTag.split(':')[1].replace(/_/g, ' ') : '';

    return `
        <div class="question-card" data-id="${question.id}">
            <div class="question-number">Question #${question.id}</div>
            <div class="question-text">${question.question[currentLanguage]}</div>
            <div class="question-tags">
                ${categoryName ? `<span class="tag">${categoryName}</span>` : ''}
                ${difficulty ? `<span class="tag difficulty">${difficulty}</span>` : ''}
                ${theme ? `<span class="tag">${theme}</span>` : ''}
            </div>
        </div>
    `;
}

// Render pagination
function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let buttons = [];

    // Previous button
    buttons.push(`
        <button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
            ‹ Prev
        </button>
    `);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        buttons.push(`<button class="page-btn" data-page="1">1</button>`);
        if (startPage > 2) {
            buttons.push(`<span class="page-btn" disabled>...</span>`);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        buttons.push(`
            <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            buttons.push(`<span class="page-btn" disabled>...</span>`);
        }
        buttons.push(`<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`);
    }

    // Next button
    buttons.push(`
        <button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
            Next ›
        </button>
    `);

    container.innerHTML = buttons.join('');
}

// Setup event listeners for questions interface
function setupQuestionListeners() {
    // Language toggle
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLanguage) return;

            currentLanguage = lang;
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            renderCategoryButtons();
            renderQuestions();
        });
    });

    // Category filter - All Categories button
    const allCategoriesBtn = document.querySelector('.filter-btn[data-category="all"]');
    if (allCategoriesBtn) {
        allCategoriesBtn.addEventListener('click', () => {
            if (currentCategory === 'all') return;
            currentCategory = 'all';
            currentPage = 1;

            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            allCategoriesBtn.classList.add('active');

            renderQuestions();
        });
    }

    // Category buttons (delegated event handling)
    const categoryContainer = document.getElementById('categoryButtons');
    if (categoryContainer) {
        categoryContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-btn');
            if (!btn) return;

            const category = btn.dataset.category;
            if (category === currentCategory) return;

            currentCategory = category;
            currentPage = 1;

            if (allCategoriesBtn) allCategoriesBtn.classList.remove('active');
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            renderQuestions();
        });
    }

    // Search
    const searchInput = document.getElementById('questionSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = e.target.value;
                currentPage = 1;
                renderQuestions();
            }, 300); // Debounce search
        });
    }

    // Pagination (delegated event handling)
    const paginationContainer = document.getElementById('pagination');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.page-btn[data-page]');
            if (!btn || btn.disabled) return;

            const page = parseInt(btn.dataset.page);
            if (page === currentPage || isNaN(page)) return;

            currentPage = page;
            renderQuestions();
        });
    }

    // Question card clicks (delegated event handling)
    const questionsList = document.getElementById('questionsList');
    if (questionsList) {
        questionsList.addEventListener('click', (e) => {
            const card = e.target.closest('.question-card');
            if (!card) return;

            const questionId = parseInt(card.dataset.id);
            const question = questionsData.questions.find(q => q.id === questionId);
            if (question) {
                showQuestionDetail(question);
            }
        });
    }
}

// Show question detail (could be expanded to show in a modal)
function showQuestionDetail(question) {
    const categoryTag = question.tags.find(tag => tag.startsWith('categorie:'));
    const categoryId = categoryTag ? categoryTag.split(':')[1] : '';
    const category = questionsData.categories.find(c => c.id === categoryId);

    const message = `Question #${question.id}\n\n${question.question[currentLanguage]}\n\nCategory: ${category ? category.nom[currentLanguage] : 'Unknown'}`;

    showToast(`Question #${question.id} - Click for details`);
    console.log(message);
    console.log('Full question data:', question);
}

// Update CTA button to scroll to questions
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const questionsSection = document.getElementById('questions');
        if (!questionsSection) return;

        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = questionsSection.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        showToast('Explore 168 philosophical questions!');
    });
}

// Load questions when page loads
if (document.getElementById('questionsList')) {
    loadQuestions();
}
