let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas , keyboard);
}

function showTutorial() {
    document.getElementById("tutorial-screen").classList.add("show-tutorial");
}

function closeTutorial() {
    document.getElementById("tutorial-screen").classList.remove("show-tutorial");
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