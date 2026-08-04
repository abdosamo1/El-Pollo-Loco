let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];
let isPaused = false;
let autoPausedByPortrait = false;
const level1 = createLevel1();
var soundManager = new SoundManager();


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
    this.PauseSoundsState();
}

/**
 * Pauses or resumes all game sounds based on the current pause state.
 * @returns {void}
 */
function PauseSoundsState() {
    if (soundManager.isMuted) return;

    isPaused ? soundManager.AllSounds.forEach(sound => sound.pause()) :
        (world && world.endBossSpawned ? soundManager.playBossMusic() : soundManager.playBackgroundMusic(),
        soundManager.resumeSnoreSound());
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
    updateMuteButtonIcon();
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
 * Prevents the browser's native right-click/long-press context menu on the
 * mobile control buttons, without affecting the rest of the page.
 * @returns {void}
 */
function bindContextMenuBlocker() {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;
    mobileControls.addEventListener('contextmenu', (e) => {
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
 * Toggles the paused state via the pause button.
 * @returns {void}
 */
function togglePause() {
    setPause(!isPaused, false);
}

/**
 * Toggles mute for all game audio and updates the mute button's icon/title.
 * @returns {void}
 */
function toggleMute() {
    soundManager.toggleMute();
    updateMuteButtonIcon();
}

/**
 * Reflects the current mute state in the mute button's icon and title.
 * @returns {void}
 */
function updateMuteButtonIcon() {
    const muteButton = document.getElementById('mute-button');
    const muteIcon = document.getElementById('mute-icon');
    if (muteButton) {
        muteButton.title = soundManager.isMuted ? 'Unmute' : 'Mute';
    }
    if (muteIcon) {
        muteIcon.classList.toggle('muted', soundManager.isMuted);
    }
}

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