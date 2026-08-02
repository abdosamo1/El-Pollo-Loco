let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];
let isPaused = false;
let autoPausedByPortrait = false;

const tutorialHints = [
    { text: "Use the arrow keys (◀ ▶) or the on-screen buttons to move Pepe left and right.", position: "hint-step-1" },
    { text: "Press Space (or ▲) to jump. Jump on chickens to defeat them, but watch out - don't get hit!", position: "hint-step-2" },
    { text: "Collect bottles and press 'D' (or 🧴) to throw them at your enemies.", position: "hint-step-3" },
    { text: "Defeat every chicken to make the Endboss appear. Beat him to win the game!", position: "hint-step-4" },
];
let tutorialHintShownThisSession = false;
let tutorialHintStep = 0;

/**
 * Shows the first-run tutorial hint sequence once per session, pausing the game while it's shown.
 * @returns {void}
 */
function maybeStartTutorialHints() {
    if (tutorialHintShownThisSession) return;
    tutorialHintShownThisSession = true;
    tutorialHintStep = 0;
    setPause(true);
    showTutorialHintStep();
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

/**
 * Sets the paused state and updates the pause button's icon/title.
 * @param {boolean} paused - Whether the game should be paused.
 * @param {boolean} [isAuto=false] - True if this pause was triggered automatically
 * (e.g. by portrait mode) rather than by the user, so it can be auto-resumed later.
 * @returns {void}
 */
function setPause(paused, isAuto = false) {
    isPaused = paused;
    autoPausedByPortrait = isAuto ? paused : false;
    const pauseButton = document.getElementById('pause-button');
    const pauseIcon = document.getElementById('pause-icon');
    if (pauseButton) {
        pauseButton.title = isPaused ? 'Resume game' : 'Pause game';
    }
    if (pauseIcon) {
        pauseIcon.classList.toggle('playing', isPaused);
    }
}

/**
 * Entry point called on page load: creates the world, sizes the canvas, and
 * wires up resize/orientation/fullscreen event listeners.
 * @returns {void}
 */
function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);
    updateCanvasSize();
    updatePortraitOverlay();
    updatePauseButtonVisibility();
    bindResizeListeners();
    bindFullscreenListeners();
    bindContextMenuBlocker();
}

/**
 * Re-fits the canvas and portrait overlay on window resize/orientation change.
 * @returns {void}
 */
function bindResizeListeners() {
    window.addEventListener('resize', () => {
        updateCanvasSize();
        updatePortraitOverlay();
    });
    window.addEventListener('orientationchange', updatePortraitOverlay);
}

/**
 * Listens for standard and WebKit fullscreen change events.
 * @returns {void}
 */
function bindFullscreenListeners() {
    document.addEventListener('fullscreenchange', () => handleFullscreenChange(document.fullscreenElement));
    document.addEventListener('webkitfullscreenchange', () => handleFullscreenChange(document.webkitFullscreenElement));
}

/**
 * Cleans up the pseudo-fullscreen classes when native fullscreen is exited,
 * then re-fits the canvas.
 * @param {Element|null} fullscreenElement - The current native fullscreen element, if any.
 * @returns {void}
 */
function handleFullscreenChange(fullscreenElement) {
    if (!fullscreenElement) {
        exitPseudoFullscreenClasses();
    }
    updateCanvasSize();
    updatePortraitOverlay();
}

/**
 * Removes the CSS classes used by the pseudo-fullscreen fallback.
 * @returns {void}
 */
function exitPseudoFullscreenClasses() {
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        canvasContainer.classList.remove('pseudo-fullscreen');
    }
    document.body.classList.remove('fullscreen-active');
    document.documentElement.classList.remove('fullscreen-active');
}

/**
 * Prevents the browser's native right-click context menu on the page.
 * @returns {void}
 */
function bindContextMenuBlocker() {
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

/**
 * Resizes the canvas to match its container and repositions HUD status bars.
 * @returns {void}
 */
function updateCanvasSize() {
    const container = document.getElementById('canvas-container');
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);

    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;

    if (world && typeof world.updateStatusBarPositions === 'function') {
        world.updateStatusBarPositions();
    }
}

/**
 * Shows/hides the portrait-mode overlay video based on viewport orientation,
 * auto-pausing the game while in portrait and auto-resuming when leaving it.
 * @returns {void}
 */
function updatePortraitOverlay() {
    const container = document.getElementById('canvas-container');
    const overlay = document.getElementById('portrait-overlay');
    if (!overlay || !container) return;

    const isPortrait = window.innerHeight > window.innerWidth;
    isPortrait ? enterPortraitMode(overlay, container) : exitPortraitMode(overlay, container);
}

/**
 * Activates the portrait overlay and auto-pauses an in-progress game.
 * @param {HTMLVideoElement} overlay - The portrait overlay video element.
 * @param {HTMLElement} container - The canvas container element.
 * @returns {void}
 */
function enterPortraitMode(overlay, container) {
    overlay.classList.add('active');
    container.classList.add('portrait-active');
    if (overlay.paused) {
        overlay.play().catch(() => {});
    }
    if (!isPaused && world && world.gameStarted && !world.gameOver && !world.youWin) {
        setPause(true, true);
    }
}

/**
 * Deactivates the portrait overlay and resumes a game that was auto-paused by it.
 * @param {HTMLVideoElement} overlay - The portrait overlay video element.
 * @param {HTMLElement} container - The canvas container element.
 * @returns {void}
 */
function exitPortraitMode(overlay, container) {
    overlay.classList.remove('active');
    container.classList.remove('portrait-active');
    if (autoPausedByPortrait) {
        setPause(false, true);
    }
}

/**
 * Shows or hides the pause button and mobile controls based on whether a
 * game is actively running, and resets the pause icon when hidden.
 * @returns {void}
 */
function updatePauseButtonVisibility() {
    const pauseButton = document.getElementById('pause-button');
    if (!pauseButton) return;

    const shouldShow = world && world.gameStarted && !world.gameOver && !world.youWin;
    pauseButton.style.display = shouldShow ? 'block' : 'none';
    updateMobileControlsVisibility(shouldShow);
    if (!shouldShow) {
        resetPauseButtonState(pauseButton);
    }
}

/**
 * Shows or hides the mobile control buttons.
 * @param {boolean} shouldShow - Whether the controls should be visible.
 * @returns {void}
 */
function updateMobileControlsVisibility(shouldShow) {
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        mobileControls.style.display = shouldShow ? 'flex' : 'none';
    }
}

/**
 * Resets the pause button/icon back to their default (not-paused) look.
 * @param {HTMLElement} pauseButton - The pause button element.
 * @returns {void}
 */
function resetPauseButtonState(pauseButton) {
    isPaused = false;
    const pauseIcon = document.getElementById('pause-icon');
    if (pauseIcon) pauseIcon.classList.remove('playing');
    pauseButton.title = 'Pause game';
}

/**
 * Shows the tutorial or impressum overlay.
 * @param {'tutorial'|'impressum'} type - Which overlay to show.
 * @returns {void}
 */
function showOverlay(type) {
    type === 'tutorial' ?
        document.getElementById("tutorial-screen").classList.add("show-tutorial"):
        document.getElementById("impressum-screen").classList.add("show-impressum");
}

/**
 * Hides both the tutorial and impressum overlays.
 * @returns {void}
 */
function closeOverlay() {
    document.getElementById("tutorial-screen").classList.remove("show-tutorial");
    document.getElementById("impressum-screen").classList.remove("show-impressum");
}

/**
 * Toggles native fullscreen (falling back to pseudo-fullscreen when the
 * native Fullscreen API is unavailable or blocked, e.g. on iOS).
 * @returns {void}
 */
function toggleFullscreen() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    isCurrentlyFullscreen(canvasContainer)
        ? exitFullscreen(canvasContainer)
        : enterFullscreen(canvasContainer);
}

/**
 * @param {HTMLElement} canvasContainer - The fullscreen-able container element.
 * @returns {boolean} True if the page is currently in native or pseudo fullscreen.
 */
function isCurrentlyFullscreen(canvasContainer) {
    return !!(document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        canvasContainer.classList.contains('pseudo-fullscreen'));
}

/**
 * @returns {boolean} True if any vendor-prefixed Fullscreen API is available.
 */
function isFullscreenSupported() {
    return document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled;
}

/**
 * Exits native/pseudo fullscreen and re-fits the canvas afterward.
 * @param {HTMLElement} canvasContainer - The fullscreen-able container element.
 * @returns {void}
 */
function exitFullscreen(canvasContainer) {
    requestExitFullscreen();
    canvasContainer.classList.remove('pseudo-fullscreen');
    document.body.classList.remove('fullscreen-active');
    document.documentElement.classList.remove('fullscreen-active');
    setTimeout(() => {
        updateCanvasSize();
        updatePortraitOverlay();
    }, 150);
}

/**
 * Calls whichever vendor-prefixed exitFullscreen method is available.
 * @returns {void}
 */
function requestExitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

/**
 * Requests native fullscreen if supported, otherwise falls back to pseudo-fullscreen.
 * @param {HTMLElement} canvasContainer - The fullscreen-able container element.
 * @returns {void}
 */
function enterFullscreen(canvasContainer) {
    if (!isFullscreenSupported()) {
        enterPseudoFullscreen(canvasContainer); // e.g. iOS Safari
        return;
    }
    requestNativeFullscreen(canvasContainer);
}

/**
 * Calls whichever vendor-prefixed requestFullscreen method is available,
 * falling back to pseudo-fullscreen if none exist or the request is rejected.
 * @param {HTMLElement} canvasContainer - The fullscreen-able container element.
 * @returns {void}
 */
function requestNativeFullscreen(canvasContainer) {
    const requestMethod = canvasContainer.requestFullscreen ||
        canvasContainer.webkitRequestFullscreen ||
        canvasContainer.mozRequestFullScreen ||
        canvasContainer.msRequestFullscreen;
    if (!requestMethod) {
        enterPseudoFullscreen(canvasContainer);
        return;
    }
    Promise.resolve(requestMethod.call(canvasContainer))
        .then(() => {
            document.body.classList.add('fullscreen-active');
            document.documentElement.classList.add('fullscreen-active');
        })
        .catch(() => enterPseudoFullscreen(canvasContainer));
}

/**
 * Applies the CSS-based pseudo-fullscreen fallback (position:fixed, full viewport).
 * @param {HTMLElement} canvasContainer - The container element to expand.
 * @returns {void}
 */
function enterPseudoFullscreen(canvasContainer) {
    canvasContainer.classList.add('pseudo-fullscreen');
    document.body.classList.add('fullscreen-active');
    document.documentElement.classList.add('fullscreen-active');
    updateCanvasSize();
    updatePortraitOverlay();
}

/**
 * Toggles the paused state via the pause button.
 * @returns {void}
 */
function togglePause() {
    setPause(!isPaused, false);
}

// Close any overlay when clicking outside of it
document.addEventListener('click', (e) => {
    const tutorialScreen = document.getElementById("tutorial-screen");
    const impressumScreen = document.getElementById("impressum-screen");
    const tutorialButton = document.getElementById("tutorial-button");
    const impressumButton = document.getElementById("impressum-button");
    const clickedOutsideTutorial = tutorialScreen.classList.contains("show-tutorial") && !tutorialScreen.contains(e.target) && e.target !== tutorialButton;
    const clickedOutsideImpressum = impressumScreen.classList.contains("show-impressum") && !impressumScreen.contains(e.target) && e.target !== impressumButton;
    if (clickedOutsideTutorial || clickedOutsideImpressum) {
        closeOverlay();
    }
});

// Close the in-game tutorial hint when clicking outside its box
document.addEventListener('click', (e) => {
    const hintOverlay = document.getElementById('tutorial-hint-overlay');
    if (hintOverlay && hintOverlay.classList.contains('show-hint') && e.target === hintOverlay) {
        closeTutorialHint();
    }
});


/**
 * Starts a `setInterval` that skips its callback while the game is paused,
 * and tracks the interval id so {@link stopGame} can clear it later.
 * @param {Function} intervalFunction - Callback to run on each tick while unpaused.
 * @param {number} delay - Interval delay in milliseconds.
 * @returns {number} The interval id.
 */
function setStopableInterval(intervalFunction, delay) {
    let intervalId = setInterval(() => {
        if (!isPaused) {
            intervalFunction();
        }
    }, delay);
    intervalIds.push(intervalId);
    return intervalId;
}

/**
 * Clears every tracked interval, stopping all game loops.
 * @returns {void}
 */
function stopGame() {
    intervalIds.forEach(id => clearInterval(id));
    intervalIds = [];
}