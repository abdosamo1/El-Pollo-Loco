const mobileButtons = [
        document.getElementById('mobile-left'),
        document.getElementById('mobile-right'),
        document.getElementById('mobile-up'),
        document.getElementById('mobile-throw')
    ];



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
 * Checks whether the page is currently in native or pseudo fullscreen.
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
 * Checks whether any vendor-prefixed Fullscreen API is available in this browser.
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
        document.exitFullscreen().catch(() => { });
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
        enterPseudoFullscreen(canvasContainer);
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
        .then(() => applyFullscreenClasses())
        .catch(() => enterPseudoFullscreen(canvasContainer));
}

/**
 * Adds the fullscreen CSS classes to body and html.
 * @returns {void}
 */
function applyFullscreenClasses() {
    document.body.classList.add('fullscreen-active');
    document.documentElement.classList.add('fullscreen-active');
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
    PauseSoundsState();
}

/**
 * Restarts the game world, unpausing it if necessary.
 * @returns {void}
 */
function restartGame() {
    if (world) {
        setPause(false, false);
        world.restart();
    }
}


/**
     * Hides the win-screen buttons, shows the start-screen buttons, and
     * returns the world to its main screen state.
     * @returns {void}
     */
function showMainScreen() {
    const gameOverButtonsDiv = document.getElementById('gameover-screen-buttons');
    if (gameOverButtonsDiv) {
        gameOverButtonsDiv.style.display = 'none';
    }
    const startButtonsDiv = document.getElementById('start-screen-buttons');
    if (startButtonsDiv) {
        startButtonsDiv.style.display = 'flex';
    }
    if (world) {
        world.showMainScreen();
    }
}

/**
 * shows the in-game buttons when the user clicks the "▼" button, 
 * and hides them after 5 seconds or when the user interacts with the game.
 * @returns {void}
 */
function showButtons() {
    const inGameButtonsDiv = document.getElementById('in-game-buttons');
    const showButtonsButton = document.getElementById('show-in-game-buttons');
    if (!inGameButtonsDiv || !showButtonsButton) return;
    inGameButtonsDiv.classList.add('is-open');
    showButtonsButton.classList.add('is-hidden');
    if (inGameButtonsHideTimeout) {
        clearTimeout(inGameButtonsHideTimeout);
    }
    inGameButtonsHideTimeout = setTimeout(() => {
        inGameButtonsDiv.classList.remove('is-open');
        showButtonsButton.classList.remove('is-hidden');
    }, 5000);
}

/**
 * Shows or hides the pause button and mobile controls based on whether a
 * game is actively running, and resets the pause icon when hidden.
 * @returns {void}
 */
function updateButtonsVisibility() {
    const shouldShow = world && world.gameStarted && !world.gameOver && !world.youWin;
    const pauseButton = document.getElementById('pause-button');

    updatePauseButtonVisibility(shouldShow);
    updateMobileControlsVisibility(shouldShow);
    InGameRestartButtonVisibility(shouldShow);
    updateHomeScreenButtonsVisibility(!shouldShow);
    if (!shouldShow) {
        resetPauseButtonState(pauseButton);
    }
}

/**
 * shows or hides the home screen buttons based on the provided flag.
 * @param {boolean} shouldShow - Whether the home screen buttons should be visible.
 * @returns {void}
 */
function updateHomeScreenButtonsVisibility(shouldShow) {
    const homeScreenButton = document.getElementById('go-home');
    if (!homeScreenButton) return;
    homeScreenButton.style.display = shouldShow ? 'none' : 'flex';
}

/**
 * Shows or hides the pause button based on the provided flag.
 * @param {boolean} shouldShow - Whether the pause button should be visible.
 * @returns {void}
 */
function updatePauseButtonVisibility(shouldShow) {
    if (typeof shouldShow === 'boolean') {
        const pauseButton = document.getElementById('pause-button');
        if (!pauseButton) return;
        pauseButton.style.display = shouldShow ? 'flex' : 'none';
        return;
    }
    updateButtonsVisibility();
}

/**
 * Shows or hides the in-game restart button based on the provided flag.
 * @param {boolean} shouldShow - Whether the in-game restart button should be visible.
 * @returns {void}
 */
function InGameRestartButtonVisibility(shouldShow) {
    const inGameRestartButton = document.getElementById('inGame-restart');
    if (!inGameRestartButton) return;
    inGameRestartButton.style.display = shouldShow ? 'flex' : 'none';
}

/**
 * Shows or hides the mobile control buttons.
 * @param {boolean} shouldShow - Whether the controls should be visible.
 * @returns {void}
 */
function updateMobileControlsVisibility(shouldShow) {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;

    mobileControls.style.display = shouldShow ? 'flex' : 'none';
    mobileButtons.forEach((button) => {
        button.style.display = shouldShow ? 'flex' : 'none';
    });
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