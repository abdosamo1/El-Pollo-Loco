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
    tutorialHintStep = 0;
    setPause(true);
    showTutorialHintStep();
}

/**
 * Checks localStorage to determine if the tutorial hints have already been shown.
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
 * Persists a flag in localStorage so the tutorial is not shown again on this computer.
 * @returns {void}
 */
function markTutorialHintsShown() {
    try {
        localStorage.setItem(TUTORIAL_HINTS_STORAGE_KEY, 'true');
    } catch {}
}

/**
 * Renders the current hint step's text into the overlay and updates the navigation buttons.
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
    updateHintNavButtons();
}

/**
 * Updates the previous and next navigation buttons to reflect the current step.
 * @returns {void}
 */
function updateHintNavButtons() {
    const prev = document.getElementById('tutorial-hint-prev');
    const next = document.getElementById('tutorial-hint-next');
    if (prev) prev.style.visibility = tutorialHintStep === 0 ? 'hidden' : 'visible';
    if (next) {
        const isLast = tutorialHintStep === tutorialHints.length - 1;
        next.textContent = isLast ? 'End Tutorial' : '→';
        next.onclick = isLast ? endTutorialHintSession : showNextTutorialHint;
        next.style.visibility = 'visible';
        next.classList.toggle('end-tutorial-button', isLast);
        next.classList.toggle('next-hint-button', !isLast);
    }
}

/**
 * Navigates to the previous hint if not already on the first one.
 * @returns {void}
 */
function showPreviousTutorialHint() {
    if (tutorialHintStep > 0) {
        tutorialHintStep--;
        showTutorialHintStep();
    }
}

/**
 * Navigates to the next hint if not already on the last one.
 * @returns {void}
 */
function showNextTutorialHint() {
    if (tutorialHintStep < tutorialHints.length - 1) {
        tutorialHintStep++;
        showTutorialHintStep();
    }
}

/**
 * Closes the hint overlay, saves the shown flag, and resumes the game.
 * @returns {void}
 */
function endTutorialHintSession() {
    const overlay = document.getElementById('tutorial-hint-overlay');
    if (overlay) overlay.classList.remove('show-hint');
    markTutorialHintsShown();
    setPause(false);
}

