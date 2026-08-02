const tutorialHints = [
    { text: "Use the arrow keys (◀ ▶) or the on-screen buttons to move Pepe left and right.", position: "hint-step-1" },
    { text: "Press Space (or ▲) to jump. Jump on chickens to defeat them, but watch out - don't get hit!", position: "hint-step-2" },
    { text: "Collect bottles and press 'D' (or 🧴) to throw them at your enemies.", position: "hint-step-3" },
    { text: "Defeat every chicken to make the Endboss appear. Beat him to win the game!", position: "hint-step-4" },
];
const TUTORIAL_HINTS_STORAGE_KEY = 'elPolloLoco.tutorialHintsShown';
let tutorialHintStep = 0;

/**
 * Shows the first-run tutorial hint sequence once per computer (remembered via
 * localStorage), pausing the game while it's shown.
 * @returns {void}
 */
function maybeStartTutorialHints() {
    if (haveTutorialHintsBeenShown()) return;
    markTutorialHintsShown();
    tutorialHintStep = 0;
    setPause(true);
    showTutorialHintStep();
}

/**
 * @returns {boolean} True if the tutorial hints were already shown on this computer before.
 */
function haveTutorialHintsBeenShown() {
    try {
        return localStorage.getItem(TUTORIAL_HINTS_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

/**
 * Remembers that the tutorial hints have been shown, so they won't show again.
 * @returns {void}
 */
function markTutorialHintsShown() {
    try {
        localStorage.setItem(TUTORIAL_HINTS_STORAGE_KEY, 'true');
    } catch {
        // Ignore storage errors (e.g. private browsing mode).
    }
}

/**
 * Renders the current tutorial hint step's text and position into the hint overlay.
 * @returns {void}
 */
function showTutorialHintStep() {
    const overlay = document.getElementById('tutorial-hint-overlay');
    const box = document.getElementById('tutorial-hint-box');
    const text = document.getElementById('tutorial-hint-text');
    const stepLabel = document.getElementById('tutorial-hint-step');
    if (!overlay || !box || !text || !stepLabel) return;

    const hint = tutorialHints[tutorialHintStep];
    text.textContent = hint.text;
    stepLabel.textContent = `${tutorialHintStep + 1}/${tutorialHints.length}`;
    box.className = hint.position;
    overlay.classList.add('show-hint');
}

/**
 * Advances to the next tutorial hint, or closes the overlay and unpauses
 * the game once the last hint has been shown.
 * @returns {void}
 */
function closeTutorialHint() {
    tutorialHintStep++;
    if (tutorialHintStep < tutorialHints.length) {
        showTutorialHintStep();
    } else {
        const overlay = document.getElementById('tutorial-hint-overlay');
        if (overlay) overlay.classList.remove('show-hint');
        setPause(false);
    }
}

// Close the in-game tutorial hint when clicking outside its box
document.addEventListener('click', (e) => {
    const hintOverlay = document.getElementById('tutorial-hint-overlay');
    if (hintOverlay && hintOverlay.classList.contains('show-hint') && e.target === hintOverlay) {
        closeTutorialHint();
    }
});
