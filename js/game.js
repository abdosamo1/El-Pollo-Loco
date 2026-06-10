let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];
let isPaused = false;
let autoPausedByPortrait = false;

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
        updateCanvasSize();
        updatePortraitOverlay();
    });
    document.addEventListener('webkitfullscreenchange', () => {
        updateCanvasSize();
        updatePortraitOverlay();
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
    if (!pauseButton) return;

    const shouldShow = world && world.gameStarted && !world.gameOver && !world.youWin;
    pauseButton.style.display = shouldShow ? 'block' : 'none';

    if (!shouldShow) {
        isPaused = false;
        pauseButton.textContent = '⏸';
        pauseButton.title = 'Pause game';
    }
}

function showTutorial() {
    document.getElementById("tutorial-screen").classList.add("show-tutorial");
}

function closeTutorial() {
    document.getElementById("tutorial-screen").classList.remove("show-tutorial");
}

function toggleFullscreen() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;

    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        canvasContainer.requestFullscreen?.();
    }
}

function togglePause() {
    setPause(!isPaused, false);
}

// Close tutorial when clicking outside
document.addEventListener('click', (e) => {
    const tutorialScreen = document.getElementById("tutorial-screen");
    const tutorialButton = document.getElementById("tutorial-button");
    if (tutorialScreen.classList.contains("show-tutorial") && !tutorialScreen.contains(e.target) && e.target !== tutorialButton) {
        closeTutorial();
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