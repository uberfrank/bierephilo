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

            switchGameScreen('questionCountScreen');
            const modeName = mode === 'random' ? getTranslation('game.randomMode') : mode === 'by-tags' ? getTranslation('game.byTagsMode') : getTranslation('game.customMode');
            showToast(`${modeName} ${getTranslation('messages.modeSelected')}`);
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
        } else {
            // For by-tags and custom, go to tag selection
            renderTagSelection();
            switchGameScreen('tagSelectionScreen');
        }
    });
}

// ==================== TAG SELECTION ====================

// Render tag selection screen
function renderTagSelection() {
    const container = document.getElementById('tagCategories');
    const titleElement = document.getElementById('tagScreenTitle');
    const data = getQuestionsData();
    const state = getGameState();

    if (!container || !data) return;

    // Update title based on mode
    if (titleElement) {
        const titleKey = state.mode === 'custom' ? 'game.tagSelectionCustomTitle' : 'game.tagSelectionTitle';
        titleElement.textContent = getTranslation(titleKey);
        titleElement.setAttribute('data-i18n', titleKey);
    }

    // Show/hide custom sliders container
    const customSlidersContainer = document.getElementById('customTagSliders');
    if (customSlidersContainer) {
        customSlidersContainer.style.display = state.mode === 'custom' ? 'block' : 'none';
        customSlidersContainer.innerHTML = '';
    }

    // Render categories as checkboxes
    const categories = data.categories;
    const html = categories.map(category => {
        const categoryTag = `categorie:${category.id}`;
        const count = data.questions.filter(q =>
            q.tags.includes(categoryTag)
        ).length;

        const isChecked = state.selectedTags.includes(categoryTag);

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
    const state = getGameState();

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const tag = e.target.dataset.tag;

            if (e.target.checked) {
                addSelectedTag(tag);

                // For custom mode, add slider
                if (state.mode === 'custom') {
                    addCustomTagSlider(tag);
                }
            } else {
                removeSelectedTag(tag);

                // For custom mode, remove slider
                if (state.mode === 'custom') {
                    removeCustomTagSliderUI(tag);
                    removeCustomTagCount(tag);
                }
            }
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
    // Back to count screen
    document.getElementById('backToCount')?.addEventListener('click', () => {
        switchGameScreen('questionCountScreen');
    });

    // Start game button
    document.getElementById('startGame')?.addEventListener('click', () => {
        if (!hasSelectedTags()) {
            showToast(getTranslation('messages.selectAtLeastOneTag'));
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
    setupTagSelectionNavigation();
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
