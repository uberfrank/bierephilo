// Pregame Questions Selection Module
// Handles question browsing, filtering, search, and pagination
'use strict';

// ==================== QUESTIONS STATE ====================

// Questions state
let questionsData = null;
let currentCategory = 'all';
let searchQuery = '';
let currentPage = 1;
const questionsPerPage = 10;

// ==================== DATA LOADING ====================

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

// Get questions data (for use by other modules)
function getQuestionsData() {
    return questionsData;
}

// ==================== INITIALIZATION ====================

// Initialize questions interface
function initializeQuestions() {
    renderCategoryButtons();
    renderQuestions();
    setupQuestionListeners();
}

// ==================== CATEGORY RENDERING ====================

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

// ==================== FILTERING ====================

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

// ==================== QUESTIONS RENDERING ====================

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

// ==================== PAGINATION ====================

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

// ==================== EVENT LISTENERS ====================

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

// ==================== QUESTION DETAIL ====================

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

// ==================== AUTO-INITIALIZATION ====================

// Load questions when page loads (if questions list or game section exists)
if (document.getElementById('questionsList') || document.getElementById('game')) {
    // Wait for UX module to initialize first
    window.addEventListener('load', () => {
        // Small delay to ensure translations are loaded
        setTimeout(() => {
            loadQuestions();
        }, 100);
    });
}
