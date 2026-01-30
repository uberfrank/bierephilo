// Game Flow Engine Module
// Handles game flow, screen navigation, mode selection, and gameplay loop
'use strict';

// ==================== GAME INITIALIZATION ====================

// Initialize game - reset state and show mode selection
function initializeGame() {
    resetGameState();
    switchGameScreen('gameModeScreen');
}

// ==================== MODE SELECTION ====================

// Setup game mode selection
function setupModeSelection() {
    const gameModeButtons = document.querySelectorAll('.game-mode-btn');
    gameModeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setGameMode(mode);

            // Update all questions count
            const data = getQuestionsData();
            if (data) {
                const totalQuestions = data.questions.length;
                const countElement = document.getElementById('allQuestionsCount');
                if (countElement) {
                    countElement.textContent = `${totalQuestions} ${getTranslation('questionsSection.questions')}`;
                }
            }

            const modeName = mode === 'random' ? getTranslation('game.randomMode') : mode === 'by-topic' ? getTranslation('game.byTopicMode') : getTranslation('game.customMode');
            showToast(`${modeName} ${getTranslation('messages.modeSelected')}`);

            // By-topic mode skips question count - uses all questions from topic
            if (mode === 'by-topic') {
                setQuestionCount('all');
                switchGameScreen('topicCategoryScreen');
            } else {
                switchGameScreen('questionCountScreen');
            }
        });
    });
}

// ==================== QUESTION COUNT SELECTION ====================

// Setup question count selection
function setupQuestionCountSelection() {
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
                setQuestionCount('all');
                if (sampleSliderContainer) {
                    sampleSliderContainer.style.display = 'none';
                }
            } else {
                setQuestionCount(parseInt(sampleSlider.value));
                if (sampleSliderContainer) {
                    sampleSliderContainer.style.display = 'block';
                }
            }
        });
    });

    // Sample slider
    if (sampleSlider && sampleValue) {
        sampleSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            sampleValue.textContent = value;
            setQuestionCount(parseInt(value));
        });
    }

    // Back to mode
    document.getElementById('backToMode')?.addEventListener('click', () => {
        switchGameScreen('gameModeScreen');
    });

    // Continue to tags (or start game for fully random)
    continueToTags?.addEventListener('click', () => {
        const state = getGameState();
        if (state.mode === 'random') {
            // For fully random, skip tag selection and start game
            startGameplay();
        } else if (state.mode === 'by-topic') {
            // For by-topic, go to topic category selection
            switchGameScreen('topicCategoryScreen');
        } else {
            // For custom, go to tag selection
            renderTagSelection();
            switchGameScreen('tagSelectionScreen');
        }
    });
}

// ==================== TAG SELECTION ====================

// Render tag selection screen for custom mode
function renderTagSelection() {
    const container = document.getElementById('tagCategories');
    const titleElement = document.getElementById('tagScreenTitle');
    const data = getQuestionsData();
    const state = getGameState();

    if (!container || !data) return;

    // Update title
    if (titleElement) {
        titleElement.textContent = getTranslation('game.tagSelectionCustomTitle');
        titleElement.setAttribute('data-i18n', 'game.tagSelectionCustomTitle');
    }

    // Hide sliders container for custom mode (sample size comes at the end)
    const customSlidersContainer = document.getElementById('customTagSliders');
    if (customSlidersContainer) {
        customSlidersContainer.style.display = 'none';
    }

    // Build topic sections for all four categories
    const topicTypes = [
        { key: 'branch', prefix: 'branche', translationKey: 'branches', icon: '🌳' },
        { key: 'movement', prefix: 'mouvement', translationKey: 'movements', icon: '🏛️' },
        { key: 'theme', prefix: 'theme', translationKey: 'themes', icon: '💡' },
        { key: 'difficulty', prefix: 'difficulte', translationKey: 'difficulties', icon: '📊' }
    ];

    let html = '';

    topicTypes.forEach(topicType => {
        const topics = getTopicsForCategory(topicType.key, data);

        html += `<div class="topic-type-section">
            <div class="topic-type-header" data-section="${topicType.key}">
                <span class="topic-type-icon">${topicType.icon}</span>
                <span class="topic-type-title">${getTranslation('topicCategories.' + topicType.key)}</span>
                <span class="topic-type-toggle">▼</span>
            </div>
            <div class="topic-type-content" id="section-${topicType.key}">`;

        topics.forEach(topic => {
            const tag = `${topicType.prefix}:${topic}`;
            const count = data.questions.filter(q => q.tags.includes(tag)).length;
            const isChecked = state.selectedTags.includes(tag);
            const translationKey = `${topicType.translationKey}.${topic}`;
            const topicName = getTranslation(translationKey) || topic.replace(/_/g, ' ');

            html += `
                <div class="tag-category">
                    <label class="tag-checkbox-label">
                        <input type="checkbox" class="tag-checkbox" data-tag="${tag}" ${isChecked ? 'checked' : ''}>
                        <span class="tag-checkbox-text">${topicName}</span>
                        <span class="tag-count">(${count})</span>
                    </label>
                </div>`;
        });

        html += `</div></div>`;
    });

    container.innerHTML = html;

    // Setup section toggle listeners
    setupTopicSectionToggles();

    // Setup checkbox listeners
    setupTagCheckboxes();

    // Update selected count display
    updateSelectedTopicsCount();
}

// Setup topic section toggle listeners
function setupTopicSectionToggles() {
    const headers = document.querySelectorAll('.topic-type-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.dataset.section;
            const content = document.getElementById(`section-${section}`);
            const toggle = header.querySelector('.topic-type-toggle');

            if (content) {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                if (toggle) {
                    toggle.textContent = isHidden ? '▼' : '▶';
                }
            }
        });
    });
}

// Update selected topics count display
function updateSelectedTopicsCount() {
    const state = getGameState();
    const data = getQuestionsData();
    if (!data) return;

    // Calculate total questions from selected topics
    let totalQuestions = 0;
    const uniqueQuestions = new Set();

    state.selectedTags.forEach(tag => {
        data.questions.forEach(q => {
            if (q.tags.includes(tag)) {
                uniqueQuestions.add(q.id);
            }
        });
    });

    totalQuestions = uniqueQuestions.size;

    // Update the start button text to show count
    const startBtn = document.getElementById('startGame');
    if (startBtn && state.selectedTags.length > 0) {
        startBtn.textContent = `${getTranslation('game.continueButton')} (${totalQuestions} ${getTranslation('questionsSection.questions')})`;
    } else if (startBtn) {
        startBtn.textContent = getTranslation('game.continueButton');
    }
}

// Setup tag checkbox listeners
function setupTagCheckboxes() {
    const checkboxes = document.querySelectorAll('.tag-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const tag = e.target.dataset.tag;

            if (e.target.checked) {
                addSelectedTag(tag);
            } else {
                removeSelectedTag(tag);
            }

            // Update the count display
            updateSelectedTopicsCount();
        });
    });
}

// Add custom tag slider UI
function addCustomTagSlider(tag) {
    const container = document.getElementById('customTagSliders');
    const data = getQuestionsData();

    if (!container || !data) return;

    // Get tag info
    const categoryId = tag.split(':')[1];
    const category = data.categories.find(c => c.id === categoryId);
    if (!category) return;

    const maxCount = data.questions.filter(q => q.tags.includes(tag)).length;
    const defaultCount = Math.min(5, maxCount);
    setCustomTagCount(tag, defaultCount);

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
            setCustomTagCount(tag, value);
        });
    }
}

// Remove custom tag slider UI
function removeCustomTagSliderUI(tag) {
    const container = document.getElementById('customTagSliders');
    if (!container) return;

    const slider = container.querySelector(`[data-tag="${tag}"]`);
    if (slider) {
        slider.remove();
    }
}

// Setup tag selection navigation
function setupTagSelectionNavigation() {
    // Back to mode screen (custom mode skips count screen)
    document.getElementById('backToCount')?.addEventListener('click', () => {
        switchGameScreen('gameModeScreen');
    });

    // Continue to sample size selection
    document.getElementById('startGame')?.addEventListener('click', () => {
        if (!hasSelectedTags()) {
            showToast(getTranslation('messages.selectAtLeastOneTag'));
            return;
        }

        // Go to sample size screen for custom mode
        setupCustomSampleScreen();
        switchGameScreen('customSampleScreen');
    });
}

// Setup custom sample screen
function setupCustomSampleScreen() {
    const data = getQuestionsData();
    const state = getGameState();
    if (!data) return;

    // Calculate total available questions from selected topics
    const uniqueQuestions = new Set();
    state.selectedTags.forEach(tag => {
        data.questions.forEach(q => {
            if (q.tags.includes(tag)) {
                uniqueQuestions.add(q.id);
            }
        });
    });
    const totalAvailable = uniqueQuestions.size;

    // Update the "All Questions" count
    const allCountEl = document.getElementById('customAllQuestionsCount');
    if (allCountEl) {
        allCountEl.textContent = `${totalAvailable} ${getTranslation('questionsSection.questions')}`;
    }

    // Update slider max
    const slider = document.getElementById('customSampleSlider');
    const sliderMax = document.getElementById('customSliderMax');
    if (slider) {
        slider.max = totalAvailable;
        slider.value = Math.min(20, totalAvailable);
    }
    if (sliderMax) {
        sliderMax.textContent = totalAvailable;
    }

    // Update selected info text
    const infoEl = document.getElementById('customSelectedInfo');
    if (infoEl) {
        infoEl.textContent = `${state.selectedTags.length} ${getTranslation('game.topicsSelected') || 'topics selected'}`;
    }

    // Update sample value display
    const sampleValue = document.getElementById('customSampleValue');
    if (sampleValue && slider) {
        sampleValue.textContent = slider.value;
    }

    // Set default to all questions
    setQuestionCount('all');
}

// Setup custom sample screen navigation
function setupCustomSampleNavigation() {
    const allBtn = document.getElementById('customAllBtn');
    const sampleBtn = document.getElementById('customSampleBtn');
    const sliderContainer = document.getElementById('customSampleSliderContainer');
    const slider = document.getElementById('customSampleSlider');
    const sampleValue = document.getElementById('customSampleValue');

    // All questions button
    allBtn?.addEventListener('click', () => {
        allBtn.classList.add('selected');
        sampleBtn?.classList.remove('selected');
        if (sliderContainer) sliderContainer.style.display = 'none';
        setQuestionCount('all');
    });

    // Sample button
    sampleBtn?.addEventListener('click', () => {
        sampleBtn.classList.add('selected');
        allBtn?.classList.remove('selected');
        if (sliderContainer) sliderContainer.style.display = 'block';
        if (slider) setQuestionCount(parseInt(slider.value));
    });

    // Slider
    slider?.addEventListener('input', (e) => {
        const value = e.target.value;
        if (sampleValue) sampleValue.textContent = value;
        setQuestionCount(parseInt(value));
    });

    // Back to tag selection
    document.getElementById('backToTagSelection')?.addEventListener('click', () => {
        switchGameScreen('tagSelectionScreen');
    });

    // Start game
    document.getElementById('startCustomGame')?.addEventListener('click', () => {
        startGameplay();
    });
}

// ==================== TOPIC CATEGORY SELECTION ====================

// Setup topic category selection
function setupTopicCategorySelection() {
    const categoryButtons = document.querySelectorAll('.topic-category-btn');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            setTopicCategory(category);
            renderTopicSelection(category);
            switchGameScreen('topicSelectionScreen');
        });
    });

    // Back to mode screen from category (by-topic mode skips count screen)
    document.getElementById('backToCountFromCategory')?.addEventListener('click', () => {
        switchGameScreen('gameModeScreen');
    });
}

// ==================== TOPIC SELECTION ====================

// Get topics for a category
function getTopicsForCategory(category, questionsData) {
    const tagPrefix = getTagPrefixForCategory(category);
    const topicsSet = new Set();

    questionsData.questions.forEach(q => {
        q.tags.forEach(tag => {
            if (tag.startsWith(`${tagPrefix}:`)) {
                topicsSet.add(tag.split(':')[1]);
            }
        });
    });

    return Array.from(topicsSet).sort();
}

// Get tag prefix for category (mirror of game-state.js function)
function getTagPrefixForCategory(category) {
    const prefixes = {
        'movement': 'mouvement',
        'branch': 'branche',
        'difficulty': 'difficulte',
        'theme': 'theme'
    };
    return prefixes[category] || category;
}

// Get translation key for topic
function getTopicTranslationKey(category, topic) {
    const categoryKeys = {
        'movement': 'movements',
        'branch': 'branches',
        'difficulty': 'difficulties',
        'theme': 'themes'
    };
    return `${categoryKeys[category]}.${topic}`;
}

// Render topic selection screen
function renderTopicSelection(category) {
    const container = document.getElementById('topicOptions');
    const data = getQuestionsData();

    if (!container || !data) return;

    const topics = getTopicsForCategory(category, data);
    const tagPrefix = getTagPrefixForCategory(category);
    const state = getGameState();

    const html = topics.map(topic => {
        const tagToMatch = `${tagPrefix}:${topic}`;
        const count = data.questions.filter(q => q.tags.includes(tagToMatch)).length;
        const isSelected = state.selectedTopic === topic;

        // Get translated topic name
        const translationKey = getTopicTranslationKey(category, topic);
        const topicName = getTranslation(translationKey) || topic.replace(/_/g, ' ');

        return `
            <div class="topic-option ${isSelected ? 'selected' : ''}" data-topic="${topic}">
                <span class="topic-name">${topicName}</span>
                <span class="topic-count">(${count})</span>
            </div>
        `;
    }).join('');

    container.innerHTML = html;

    // Setup topic option listeners
    setupTopicOptionListeners();
}

// Setup topic option click listeners
function setupTopicOptionListeners() {
    const topicOptions = document.querySelectorAll('.topic-option');

    topicOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            topicOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            option.classList.add('selected');

            // Update game state
            setSelectedTopic(option.dataset.topic);
        });
    });
}

// Setup topic selection navigation
function setupTopicSelectionNavigation() {
    // Back to category screen
    document.getElementById('backToCategory')?.addEventListener('click', () => {
        setSelectedTopic(null);
        switchGameScreen('topicCategoryScreen');
    });

    // Start game button from topic selection
    document.getElementById('startGameFromTopic')?.addEventListener('click', () => {
        if (!hasSelectedTopic()) {
            showToast(getTranslation('messages.selectAtLeastOneTopic'));
            return;
        }

        startGameplay();
    });
}

// ==================== GAMEPLAY ====================

// Start gameplay - build mug and show gameplay screen
function startGameplay() {
    const data = getQuestionsData();
    if (!data) return;

    const mugSize = initializeMug(data);

    // Show gameplay screen
    updateGameplayUI();
    switchGameScreen('gameplayScreen');
    showToast(`${getTranslation('messages.gameStarted')} ${mugSize} ${getTranslation('messages.questionsInMug')}`);
}

// Update gameplay UI
function updateGameplayUI() {
    const state = getGameState();

    // Update mug count
    const mugCountElement = document.getElementById('mugCount');
    if (mugCountElement) {
        mugCountElement.textContent = getMugCount();
    }

    // Update round number
    const roundElement = document.getElementById('currentRound');
    if (roundElement) {
        roundElement.textContent = getCurrentRound();
    }

    // Render current round questions
    renderRoundQuestions();

    // Update draw buttons state
    updateDrawButtons();
}

// Render round questions
function renderRoundQuestions() {
    const container = document.getElementById('roundQuestions');
    const roundQuestions = getRoundQuestions();
    const data = getQuestionsData();

    if (!container) return;

    if (!data) {
        container.innerHTML = `
            <div class="empty-round">
                <div class="empty-round-icon">⏳</div>
                <p>${getTranslation('game.loadingQuestions') || 'Loading questions...'}</p>
            </div>
        `;
        return;
    }

    if (roundQuestions.length === 0) {
        container.innerHTML = `
            <div class="empty-round">
                <div class="empty-round-icon">🎲</div>
                <p>${getTranslation('game.emptyRound')}</p>
            </div>
        `;
        return;
    }

    const html = roundQuestions.map(question => {
        const categoryTag = question.tags.find(tag => tag.startsWith('categorie:'));
        const categoryId = categoryTag ? categoryTag.split(':')[1] : '';
        const category = data.categories.find(c => c.id === categoryId);
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
    const mugRemaining = getMugCount();
    const selectedDrawCount = getSelectedDrawCount();

    drawButtons.forEach(btn => {
        const count = parseInt(btn.dataset.count);

        // Disable if not enough questions in mug
        if (count > mugRemaining) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }

        // Update selected state
        if (count === selectedDrawCount) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

// Setup draw controls
function setupDrawControls() {
    // Draw button selection - clicking these buttons should draw that many questions
    const drawButtons = document.querySelectorAll('.draw-btn');
    drawButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.count);
            setSelectedDrawCount(count);
            updateDrawButtons();

            // Actually draw the questions when clicking the number buttons
            if (isMugEmpty()) {
                showGameComplete();
                return;
            }

            const drawnQuestions = drawFromMug(count);
            updateGameplayUI();

            const questionWord = drawnQuestions.length > 1 ? getTranslation('questionsSection.questions') : getTranslation('questionsSection.question');
            showToast(`${getTranslation('messages.drew')} ${drawnQuestions.length} ${questionWord}`);

            if (isMugEmpty()) {
                setTimeout(() => {
                    showGameComplete();
                }, 2000);
            }
        });
    });

    // Draw questions button
    document.getElementById('drawQuestions')?.addEventListener('click', () => {
        if (isMugEmpty()) {
            // Game complete
            showGameComplete();
            return;
        }

        // Draw questions from mug
        const drawnQuestions = drawFromMug(getSelectedDrawCount());

        // Update UI
        updateGameplayUI();

        const questionWord = drawnQuestions.length > 1 ? getTranslation('questionsSection.questions') : getTranslation('questionsSection.question');
        showToast(`${getTranslation('messages.drew')} ${drawnQuestions.length} ${questionWord}`);

        // Check if mug is empty
        if (isMugEmpty()) {
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
}

// ==================== GAME COMPLETE ====================

// Show game complete screen
function showGameComplete() {
    const stats = getGameStats();
    const totalRoundsElement = document.getElementById('totalRounds');
    const totalQuestionsElement = document.getElementById('totalQuestionsPlayed');

    if (totalRoundsElement) {
        totalRoundsElement.textContent = stats.totalRounds;
    }

    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = stats.questionsExplored;
    }

    switchGameScreen('gameCompleteScreen');
    showToast(getTranslation('messages.congratulations'));
}

// Setup game complete actions
function setupGameCompleteActions() {
    // Play again button
    document.getElementById('playAgain')?.addEventListener('click', () => {
        initializeGame();
    });
}

// ==================== GAME ENGINE INITIALIZATION ====================

// Initialize all game flow components
function initializeGameFlow() {
    // Only initialize if game section exists
    if (!document.getElementById('game')) return;

    setupModeSelection();
    setupQuestionCountSelection();
    setupTopicCategorySelection();
    setupTopicSelectionNavigation();
    setupTagSelectionNavigation();
    setupCustomSampleNavigation();
    setupDrawControls();
    setupGameCompleteActions();
}

// Auto-initialize when DOM is ready
if (document.getElementById('game')) {
    window.addEventListener('load', () => {
        // Small delay to ensure other modules are loaded
        setTimeout(() => {
            initializeGameFlow();
        }, 150);
    });
}
