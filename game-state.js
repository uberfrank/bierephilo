// Game State Management Module
// Handles game state object, state mutations, and question pool management
'use strict';

// ==================== GAME STATE ====================

// Game state object
let gameState = {
    mode: null,              // 'random', 'by-tags', 'custom'
    questionCount: 'all',    // 'all' or number
    selectedTags: [],        // Array of selected tag strings
    customTagCounts: {},     // For custom mode: { tag: count }
    mug: [],                 // Array of questions in the virtual mug
    currentRound: 0,         // Current round number
    totalRounds: 0,          // Total rounds played
    roundQuestions: [],      // Questions drawn in current round
    selectedDrawCount: 3     // Number of questions to draw (1-5)
};

// ==================== STATE INITIALIZATION ====================

// Reset game state to initial values
function resetGameState() {
    gameState = {
        mode: null,
        questionCount: 'all',
        selectedTags: [],
        customTagCounts: {},
        mug: [],
        currentRound: 0,
        totalRounds: 0,
        roundQuestions: [],
        selectedDrawCount: 3
    };
}

// ==================== STATE GETTERS ====================

function getGameState() {
    return gameState;
}

function getMugCount() {
    return gameState.mug.length;
}

function getCurrentRound() {
    return gameState.currentRound;
}

function getTotalRounds() {
    return gameState.totalRounds;
}

function getSelectedDrawCount() {
    return gameState.selectedDrawCount;
}

function getRoundQuestions() {
    return gameState.roundQuestions;
}

function getSelectedTags() {
    return gameState.selectedTags;
}

function getCustomTagCounts() {
    return gameState.customTagCounts;
}

// ==================== STATE SETTERS ====================

function setGameMode(mode) {
    gameState.mode = mode;
}

function setQuestionCount(count) {
    gameState.questionCount = count;
}

function setSelectedDrawCount(count) {
    gameState.selectedDrawCount = count;
}

// ==================== TAG MANAGEMENT ====================

function addSelectedTag(tag) {
    if (!gameState.selectedTags.includes(tag)) {
        gameState.selectedTags.push(tag);
    }
}

function removeSelectedTag(tag) {
    gameState.selectedTags = gameState.selectedTags.filter(t => t !== tag);
}

function setCustomTagCount(tag, count) {
    gameState.customTagCounts[tag] = count;
}

function removeCustomTagCount(tag) {
    delete gameState.customTagCounts[tag];
}

// ==================== UTILITY FUNCTIONS ====================

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ==================== QUESTION POOL BUILDING ====================

// Build question pool based on mode and settings
function buildQuestionPool(questionsData) {
    if (!questionsData) return [];

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

    return uniquePool;
}

// ==================== MUG MANAGEMENT ====================

// Initialize the mug with questions
function initializeMug(questionsData) {
    const pool = buildQuestionPool(questionsData);

    // Apply question count limit
    if (gameState.questionCount !== 'all') {
        const shuffled = shuffleArray(pool);
        gameState.mug = shuffled.slice(0, gameState.questionCount);
    } else {
        gameState.mug = shuffleArray(pool);
    }

    // Reset round state
    gameState.currentRound = 0;
    gameState.totalRounds = 0;
    gameState.roundQuestions = [];
    gameState.selectedDrawCount = 3;

    return gameState.mug.length;
}

// Draw questions from the mug
function drawFromMug(count) {
    if (gameState.mug.length === 0) {
        return [];
    }

    const drawCount = Math.min(count, gameState.mug.length);
    const drawnQuestions = gameState.mug.splice(0, drawCount);

    // Update round state
    gameState.currentRound++;
    gameState.totalRounds++;
    gameState.roundQuestions = drawnQuestions;

    return drawnQuestions;
}

// Check if mug is empty
function isMugEmpty() {
    return gameState.mug.length === 0;
}

// ==================== STATISTICS ====================

// Get game statistics
function getGameStats() {
    return {
        totalRounds: gameState.totalRounds,
        questionsExplored: gameState.roundQuestions.length,
        questionsRemaining: gameState.mug.length
    };
}

// ==================== VALIDATION ====================

// Check if at least one tag is selected (for non-random modes)
function hasSelectedTags() {
    return gameState.selectedTags.length > 0;
}

// Check if game can start
function canStartGame() {
    if (gameState.mode === 'random') {
        return true;
    }
    return hasSelectedTags();
}
