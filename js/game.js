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

function maybeStartTutorialHints() {
    if (tutorialHintShownThisSession) return;
    tutorialHintShownThisSession = true;
    tutorialHintStep = 0;
    setPause(true);
    showTutorialHintStep();
}

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

function setPause(paused, isAuto = false) {
    isPaused = paused;
    autoPausedByPortrait = isAuto ? paused : false;
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.textContent = isPaused ? '▶' : '⏸';
        pauseButton.title = isPaused ? 'Resume game' : 'Pause game';
    }
}

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas , keyboard);
    updateCanvasSize();
    updatePortraitOverlay();
    updatePauseButtonVisibility();
    window.addEventListener('resize', () => {
        updateCanvasSize();
        updatePortraitOverlay();
    });
    window.addEventListener('orientationchange', updatePortraitOverlay);
    document.addEventListener('fullscreenchange', () => {
        const isCurrentlyFullscreen = document.fullscreenElement !== null;
        if (!isCurrentlyFullscreen) {
            const canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer) {
                canvasContainer.classList.remove('pseudo-fullscreen');
            }
            document.body.classList.remove('fullscreen-active');
            document.documentElement.classList.remove('fullscreen-active');
        }
        updateCanvasSize();
        updatePortraitOverlay();
    });
    document.addEventListener('webkitfullscreenchange', () => {
        const isCurrentlyFullscreen = document.webkitFullscreenElement !== null;
        if (!isCurrentlyFullscreen) {
            const canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer) {
                canvasContainer.classList.remove('pseudo-fullscreen');
            }
            document.body.classList.remove('fullscreen-active');
            document.documentElement.classList.remove('fullscreen-active');
        }
        updateCanvasSize();
        updatePortraitOverlay();
    });
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

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

function updatePortraitOverlay() {
    const container = document.getElementById('canvas-container');
    const overlay = document.getElementById('portrait-overlay');
    if (!overlay || !container) return;

    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait) {
        overlay.classList.add('active');
        container.classList.add('portrait-active');
        if (overlay.paused) {
            overlay.play().catch(() => {});
        }
        if (!isPaused && world && world.gameStarted && !world.gameOver && !world.youWin) {
            setPause(true, true);
        }
    } else {
        overlay.classList.remove('active');
        container.classList.remove('portrait-active');
        if (autoPausedByPortrait) {
            setPause(false, true);
        }
    }
}

function updatePauseButtonVisibility() {
    const pauseButton = document.getElementById('pause-button');
    const mobileControls = document.getElementById('mobile-controls');
    if (!pauseButton) return;

    const shouldShow = world && world.gameStarted && !world.gameOver && !world.youWin;
    pauseButton.style.display = shouldShow ? 'block' : 'none';
    if (mobileControls) {
        mobileControls.style.display = shouldShow ? 'flex' : 'none';
    }

    if (!shouldShow) {
        isPaused = false;
        pauseButton.textContent = '⏸';
        pauseButton.title = 'Pause game';
    }
}

function showOverlay(type) {
    type === 'tutorial' ?
        document.getElementById("tutorial-screen").classList.add("show-tutorial"):
        document.getElementById("impressum-screen").classList.add("show-impressum");
}

function closeOverlay() {
    document.getElementById("tutorial-screen").classList.remove("show-tutorial");
    document.getElementById("impressum-screen").classList.remove("show-impressum");
}

function toggleFullscreen() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;

    // We check standard API and Webkit API
    const isFullscreenSupported = document.fullscreenEnabled || 
                                 document.webkitFullscreenEnabled || 
                                 document.mozFullScreenEnabled || 
                                 document.msFullscreenEnabled;

    const isFullscreen = document.fullscreenElement || 
                         document.webkitFullscreenElement || 
                         document.mozFullScreenElement || 
                         document.msFullscreenElement ||
                         canvasContainer.classList.contains('pseudo-fullscreen');

    if (isFullscreen) {
        // EXIT FULLSCREEN
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        canvasContainer.classList.remove('pseudo-fullscreen');
        document.body.classList.remove('fullscreen-active');
        document.documentElement.classList.remove('fullscreen-active');
        
        setTimeout(() => {
            updateCanvasSize();
            updatePortraitOverlay();
        }, 150);
    } else {
        // ENTER FULLSCREEN
        if (isFullscreenSupported) {
            // Note: Mobile Chrome supports requestFullscreen but it can fail on some devices or user agents
            const requestMethod = canvasContainer.requestFullscreen || 
                                  canvasContainer.webkitRequestFullscreen || 
                                  canvasContainer.mozRequestFullScreen || 
                                  canvasContainer.msRequestFullscreen;

            if (requestMethod) {
                // Binding the method to prevent 'Illegal invocation' errors in some browsers
                Promise.resolve(requestMethod.call(canvasContainer))
                    .then(() => {
                        document.body.classList.add('fullscreen-active');
                        document.documentElement.classList.add('fullscreen-active');
                    })
                    .catch(() => {
                        // If browser blocks native element fullscreen, use pseudo fallback
                        enterPseudoFullscreen(canvasContainer);
                    });
            } else {
                enterPseudoFullscreen(canvasContainer);
            }
        } else {
            // iOS Safari iPhone Fallback
            enterPseudoFullscreen(canvasContainer);
        }
    }
}

function enterPseudoFullscreen(canvasContainer) {
    canvasContainer.classList.add('pseudo-fullscreen');
    document.body.classList.add('fullscreen-active');
    document.documentElement.classList.add('fullscreen-active');
    updateCanvasSize();
    updatePortraitOverlay();
}

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


function setStopableInterval(intervalFunction, delay) {
    let intervalId = setInterval(() => {
        if (!isPaused) {
            intervalFunction();
        }
    }, delay);
    intervalIds.push(intervalId);
    return intervalId;
}

function stopGame() {
    intervalIds.forEach(id => clearInterval(id));
    intervalIds = [];
}