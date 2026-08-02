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
