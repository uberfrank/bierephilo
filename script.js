// Mobile Site JavaScript
// Optimized for touch interactions and mobile performance

'use strict';

// ==================== MULTILINGUAL SUPPORT ====================

// Global language state
let currentLanguage = 'en';
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

    // Reload questions if questions data exists
    if (questionsData) {
        await loadQuestions();
    }

    // Update global language buttons
    document.querySelectorAll('.global-lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Save language preference
    localStorage.setItem('preferredLanguage', lang);
}

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.nav-link');
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

// Toast Notification Function
function showToast(message, duration = 3000) {
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

// Page load animation and initialization
window.addEventListener('load', async () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';

    // Load saved language preference or default to 'en'
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    currentLanguage = savedLanguage;

    // Load translations
    translations = await loadTranslations(currentLanguage);

    // Update UI with translations
    updateUIText();

    // Update global language buttons
    document.querySelectorAll('.global-lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
    });

    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    // Show welcome toast
    setTimeout(() => {
        showToast(getTranslation('messages.welcome'));
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

// Console welcome message
console.log('%c🍺 Bierephilo', 'font-size: 24px; color: #2196F3; font-weight: bold;');
console.log('%cWelcome to the console! Happy philosophical pondering!', 'font-size: 14px; color: #666;');

// Global language toggle
document.querySelectorAll('.global-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        changeLanguage(lang);
    });
});

// ==================== PHILOSOPHICAL QUESTIONS FEATURE ====================

// Questions state
let questionsData = null;
let currentCategory = 'all';
let searchQuery = '';
let currentPage = 1;
const questionsPerPage = 10;

// Load questions data
async function loadQuestions() {
    try {
        const response = await fetch(`questions-${currentLanguage}.json`);
        if (!response.ok) throw new Error('Failed to load questions');
        questionsData = await response.json();
        initializeQuestions();
    } catch (error) {
        console.error('Error loading questions:', error);
        const questionsList = document.getElementById('questionsList');
        if (questionsList) {
            questionsList.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">⚠️</div>
                    <p class="no-results-text">${getTranslation('messages.failedToLoad')}</p>
                    <p>${getTranslation('messages.refreshPage')}</p>
                </div>
            `;
        }
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
                <span>${cat.nom}</span>
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
            const questionText = q.question.toLowerCase();
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
        const questionWord = totalQuestions !== 1 ? getTranslation('questionsSection.questions') : getTranslation('questionsSection.question');
        countElement.textContent = `${getTranslation('questionsSection.showing')} ${totalQuestions} ${questionWord}`;
    }

    // No results
    if (totalQuestions === 0) {
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🤔</div>
                <p class="no-results-text">${getTranslation('questionsSection.noResults')}</p>
                <p>${getTranslation('questionsSection.noResultsDesc')}</p>
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
    const categoryName = category ? category.nom : '';

    const difficultyTag = question.tags.find(tag => tag.startsWith('difficulte:'));
    const difficulty = difficultyTag ? difficultyTag.split(':')[1] : '';

    const themeTag = question.tags.find(tag => tag.startsWith('theme:'));
    const theme = themeTag ? themeTag.split(':')[1].replace(/_/g, ' ') : '';

    return `
        <div class="question-card" data-id="${question.id}">
            <div class="question-number">${getTranslation('questionsSection.questionNumber')}${question.id}</div>
            <div class="question-text">${question.question}</div>
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
            ‹ ${getTranslation('questionsSection.prev')}
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
            ${getTranslation('questionsSection.next')} ›
        </button>
    `);

    container.innerHTML = buttons.join('');
}

// Setup event listeners for questions interface
function setupQuestionListeners() {
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

    const message = `${getTranslation('questionsSection.questionNumber')}${question.id}\n\n${question.question}\n\nCategory: ${category ? category.nom : 'Unknown'}`;

    showToast(`${getTranslation('questionsSection.questionNumber')}${question.id} - ${getTranslation('messages.questionDetails')}`);
    console.log(message);
    console.log('Full question data:', question);
}

// Load questions when page loads
if (document.getElementById('questionsList')) {
    loadQuestions();
}

// ==================== GAME FEATURE ====================

// Game state
let gameState = {
    mode: null,              // 'random', 'by-tags', 'custom'
    questionCount: 'all',    // 'all' or number
    selectedTags: [],        // Array of selected tag strings
    customTagCounts: {},     // For custom mode: { tag: count }
    mug: [],                 // Array of questions in the virtual mug
    currentRound: 0,         // Current round number
    totalRounds: 0,          // Total rounds played
    roundQuestions: [],      // Questions drawn in current round
    selectedDrawCount: 1     // Number of questions to draw (1-5)
};

// Helper function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

// Initialize game - reset state and show mode selection
function initializeGame() {
    gameState = {
        mode: null,
        questionCount: 'all',
        selectedTags: [],
        customTagCounts: {},
        mug: [],
        currentRound: 0,
        totalRounds: 0,
        roundQuestions: [],
        selectedDrawCount: 1
    };

    switchGameScreen('gameModeScreen');
}

// Game mode selection
const gameModeButtons = document.querySelectorAll('.game-mode-btn');
gameModeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        gameState.mode = mode;

        // Update all questions count
        if (questionsData) {
            const totalQuestions = questionsData.questions.length;
            const countElement = document.getElementById('allQuestionsCount');
            if (countElement) {
                countElement.textContent = `${totalQuestions} ${getTranslation('questionsSection.questions')}`;
            }
        }

        switchGameScreen('questionCountScreen');
        const modeName = mode === 'random' ? getTranslation('game.randomMode') : mode === 'by-tags' ? getTranslation('game.byTagsMode') : getTranslation('game.customMode');
        showToast(`${modeName} ${getTranslation('messages.modeSelected')}`);
    });
});

// Question count selection
const countOptionButtons = document.querySelectorAll('.count-option-btn');
const sampleSlider = document.getElementById('sampleSlider');
const sampleValue = document.getElementById('sampleValue');
const sampleSliderContainer = document.getElementById('sampleSliderContainer');
const continueToTags = document.getElementById('continueToTags');

countOptionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const count = btn.dataset.count;

        // Update selected state
        countOptionButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        if (count === 'all') {
            gameState.questionCount = 'all';
            sampleSliderContainer.style.display = 'none';
        } else {
            gameState.questionCount = parseInt(sampleSlider.value);
            sampleSliderContainer.style.display = 'block';
        }
    });
});

// Sample slider
if (sampleSlider && sampleValue) {
    sampleSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        sampleValue.textContent = value;
        gameState.questionCount = parseInt(value);
    });
}

// Back to mode
document.getElementById('backToMode')?.addEventListener('click', () => {
    switchGameScreen('gameModeScreen');
});

// Continue to tags (or start game for fully random)
continueToTags?.addEventListener('click', () => {
    if (gameState.mode === 'random') {
        // For fully random, skip tag selection and start game
        startGameplay();
    } else {
        // For by-tags and custom, go to tag selection
        renderTagSelection();
        switchGameScreen('tagSelectionScreen');
    }
});

// Render tag selection screen
function renderTagSelection() {
    const container = document.getElementById('tagCategories');
    const titleElement = document.getElementById('tagScreenTitle');

    if (!container || !questionsData) return;

    // Update title based on mode
    if (titleElement) {
        const titleKey = gameState.mode === 'custom' ? 'game.tagSelectionCustomTitle' : 'game.tagSelectionTitle';
        titleElement.textContent = getTranslation(titleKey);
        titleElement.setAttribute('data-i18n', titleKey);
    }

    // Show/hide custom sliders container
    const customSlidersContainer = document.getElementById('customTagSliders');
    if (customSlidersContainer) {
        customSlidersContainer.style.display = gameState.mode === 'custom' ? 'block' : 'none';
        customSlidersContainer.innerHTML = '';
    }

    // Render categories as checkboxes
    const categories = questionsData.categories;
    const html = categories.map(category => {
        const categoryTag = `categorie:${category.id}`;
        const count = questionsData.questions.filter(q =>
            q.tags.includes(categoryTag)
        ).length;

        const isChecked = gameState.selectedTags.includes(categoryTag);

        return `
            <div class="tag-category">
                <label class="tag-checkbox-label">
                    <input type="checkbox" class="tag-checkbox" data-tag="${categoryTag}" ${isChecked ? 'checked' : ''}>
                    <span class="tag-checkbox-text">${category.nom}</span>
                    <span class="tag-count">(${count})</span>
                </label>
            </div>
        `;
    }).join('');

    container.innerHTML = html;

    // Setup checkbox listeners
    setupTagCheckboxes();
}

// Setup tag checkbox listeners
function setupTagCheckboxes() {
    const checkboxes = document.querySelectorAll('.tag-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const tag = e.target.dataset.tag;

            if (e.target.checked) {
                if (!gameState.selectedTags.includes(tag)) {
                    gameState.selectedTags.push(tag);
                }

                // For custom mode, add slider
                if (gameState.mode === 'custom') {
                    addCustomTagSlider(tag);
                }
            } else {
                gameState.selectedTags = gameState.selectedTags.filter(t => t !== tag);

                // For custom mode, remove slider
                if (gameState.mode === 'custom') {
                    removeCustomTagSlider(tag);
                }
            }
        });
    });
}

// Add custom tag slider
function addCustomTagSlider(tag) {
    const container = document.getElementById('customTagSliders');
    if (!container || !questionsData) return;

    // Get tag info
    const categoryId = tag.split(':')[1];
    const category = questionsData.categories.find(c => c.id === categoryId);
    if (!category) return;

    const maxCount = questionsData.questions.filter(q => q.tags.includes(tag)).length;
    const defaultCount = Math.min(5, maxCount);
    gameState.customTagCounts[tag] = defaultCount;

    const sliderHtml = `
        <div class="custom-tag-slider" data-tag="${tag}">
            <div class="custom-tag-slider-header">
                <span class="custom-tag-name">${category.nom}</span>
                <span class="custom-tag-value" id="value-${tag.replace(/:/g, '-')}">${defaultCount}</span>
            </div>
            <input type="range" class="slider" id="slider-${tag.replace(/:/g, '-')}"
                   min="1" max="${maxCount}" value="${defaultCount}" step="1">
            <div class="slider-markers">
                <span>1</span>
                <span>${maxCount}</span>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', sliderHtml);

    // Setup slider listener
    const slider = document.getElementById(`slider-${tag.replace(/:/g, '-')}`);
    const valueSpan = document.getElementById(`value-${tag.replace(/:/g, '-')}`);

    if (slider && valueSpan) {
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            valueSpan.textContent = value;
            gameState.customTagCounts[tag] = value;
        });
    }
}

// Remove custom tag slider
function removeCustomTagSlider(tag) {
    const container = document.getElementById('customTagSliders');
    if (!container) return;

    const slider = container.querySelector(`[data-tag="${tag}"]`);
    if (slider) {
        slider.remove();
    }

    delete gameState.customTagCounts[tag];
}

// Back to count screen
document.getElementById('backToCount')?.addEventListener('click', () => {
    switchGameScreen('questionCountScreen');
});

// Start game button
document.getElementById('startGame')?.addEventListener('click', () => {
    if (gameState.selectedTags.length === 0) {
        showToast(getTranslation('messages.selectAtLeastOneTag'));
        return;
    }

    startGameplay();
});

// Start gameplay - build mug and show gameplay screen
function startGameplay() {
    if (!questionsData) return;

    // Build question pool based on mode
    let pool = [];

    if (gameState.mode === 'random') {
        // Fully random - all questions
        pool = [...questionsData.questions];
    } else if (gameState.mode === 'by-tags') {
        // By tags - questions matching selected tags
        pool = questionsData.questions.filter(q =>
            gameState.selectedTags.some(tag => q.tags.includes(tag))
        );
    } else if (gameState.mode === 'custom') {
        // Custom - specific counts from each tag
        pool = [];
        gameState.selectedTags.forEach(tag => {
            const count = gameState.customTagCounts[tag] || 0;
            const tagQuestions = questionsData.questions.filter(q => q.tags.includes(tag));
            const shuffled = shuffleArray(tagQuestions);
            pool.push(...shuffled.slice(0, count));
        });
    }

    // Remove duplicates (a question might match multiple tags)
    const uniquePool = Array.from(new Set(pool.map(q => q.id)))
        .map(id => pool.find(q => q.id === id));

    // Apply question count limit
    if (gameState.questionCount !== 'all') {
        const shuffled = shuffleArray(uniquePool);
        gameState.mug = shuffled.slice(0, gameState.questionCount);
    } else {
        gameState.mug = shuffleArray(uniquePool);
    }

    // Reset game state
    gameState.currentRound = 0;
    gameState.totalRounds = 0;
    gameState.roundQuestions = [];
    gameState.selectedDrawCount = 1;

    // Show gameplay screen
    updateGameplayUI();
    switchGameScreen('gameplayScreen');
    showToast(`${getTranslation('messages.gameStarted')} ${gameState.mug.length} ${getTranslation('messages.questionsInMug')}`);
}

// Update gameplay UI
function updateGameplayUI() {
    // Update mug count
    const mugCountElement = document.getElementById('mugCount');
    if (mugCountElement) {
        mugCountElement.textContent = gameState.mug.length;
    }

    // Update round number
    const roundElement = document.getElementById('currentRound');
    if (roundElement) {
        roundElement.textContent = gameState.currentRound;
    }

    // Render current round questions
    renderRoundQuestions();

    // Update draw buttons state
    updateDrawButtons();
}

// Render round questions
function renderRoundQuestions() {
    const container = document.getElementById('roundQuestions');
    if (!container) return;

    if (gameState.roundQuestions.length === 0) {
        container.innerHTML = `
            <div class="empty-round">
                <div class="empty-round-icon">🎲</div>
                <p>${getTranslation('game.emptyRound')}</p>
            </div>
        `;
        return;
    }

    const html = gameState.roundQuestions.map(question => {
        const categoryTag = question.tags.find(tag => tag.startsWith('categorie:'));
        const categoryId = categoryTag ? categoryTag.split(':')[1] : '';
        const category = questionsData.categories.find(c => c.id === categoryId);
        const categoryName = category ? category.nom : '';

        const difficultyTag = question.tags.find(tag => tag.startsWith('difficulte:'));
        const difficulty = difficultyTag ? difficultyTag.split(':')[1] : '';

        const themeTag = question.tags.find(tag => tag.startsWith('theme:'));
        const theme = themeTag ? themeTag.split(':')[1].replace(/_/g, ' ') : '';

        return `
            <div class="round-question-card">
                <div class="round-question-number">${getTranslation('questionsSection.questionNumber')}${question.id}</div>
                <div class="round-question-text">${question.question}</div>
                <div class="round-question-tags">
                    ${categoryName ? `<span class="tag">${categoryName}</span>` : ''}
                    ${difficulty ? `<span class="tag difficulty">${difficulty}</span>` : ''}
                    ${theme ? `<span class="tag">${theme}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Update draw buttons state
function updateDrawButtons() {
    const drawButtons = document.querySelectorAll('.draw-btn');
    const mugRemaining = gameState.mug.length;

    drawButtons.forEach(btn => {
        const count = parseInt(btn.dataset.count);

        // Disable if not enough questions in mug
        if (count > mugRemaining) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }

        // Update selected state
        if (count === gameState.selectedDrawCount) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

// Draw button selection
const drawButtons = document.querySelectorAll('.draw-btn');
drawButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const count = parseInt(btn.dataset.count);
        gameState.selectedDrawCount = count;
        updateDrawButtons();
    });
});

// Draw questions button
document.getElementById('drawQuestions')?.addEventListener('click', () => {
    if (gameState.mug.length === 0) {
        // Game complete
        showGameComplete();
        return;
    }

    // Draw questions from mug
    const drawCount = Math.min(gameState.selectedDrawCount, gameState.mug.length);
    const drawnQuestions = gameState.mug.splice(0, drawCount);

    // Start new round and replace previous draw
    gameState.currentRound++;
    gameState.totalRounds++;
    gameState.roundQuestions = drawnQuestions;

    // Update UI
    updateGameplayUI();

    const questionWord = drawCount > 1 ? getTranslation('questionsSection.questions') : getTranslation('questionsSection.question');
    showToast(`${getTranslation('messages.drew')} ${drawCount} ${questionWord}`);

    // Check if mug is empty
    if (gameState.mug.length === 0) {
        setTimeout(() => {
            showGameComplete();
        }, 2000);
    }
});

// Quit game button
document.getElementById('quitGame')?.addEventListener('click', () => {
    if (confirm(getTranslation('messages.quitConfirm'))) {
        initializeGame();
        showToast(getTranslation('messages.gameEnded'));
    }
});

// Show game complete screen
function showGameComplete() {
    const totalRoundsElement = document.getElementById('totalRounds');
    const totalQuestionsElement = document.getElementById('totalQuestionsPlayed');

    if (totalRoundsElement) {
        totalRoundsElement.textContent = gameState.totalRounds;
    }

    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = gameState.roundQuestions.length;
    }

    switchGameScreen('gameCompleteScreen');
    showToast(getTranslation('messages.congratulations'));
}

// Play again button
document.getElementById('playAgain')?.addEventListener('click', () => {
    initializeGame();
});

