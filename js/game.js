let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas , keyboard);
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    document.addEventListener('fullscreenchange', updateCanvasSize);
    document.addEventListener('webkitfullscreenchange', updateCanvasSize);
}

function updateCanvasSize() {
    const container = document.getElementById('canvas-container');
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);

    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
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

// Close tutorial when clicking outside
document.addEventListener('click', (e) => {
    const tutorialScreen = document.getElementById("tutorial-screen");
    const tutorialButton = document.getElementById("tutorial-button");
    if (tutorialScreen.classList.contains("show-tutorial") && !tutorialScreen.contains(e.target) && e.target !== tutorialButton) {
        closeTutorial();
    }
});


function setStopableInterval(intervalFunction, delay) {
    let intervalId = setInterval(intervalFunction, delay);
    intervalIds.push(intervalId);
    return intervalId;
}

function stopGame() {
    intervalIds.forEach(id => clearInterval(id));
    intervalIds = [];
}