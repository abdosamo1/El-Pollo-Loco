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

function setStopableInterval(intervalFunction, delay) {
    let intervalId = setInterval(intervalFunction, delay);
    intervalIds.push(intervalId);
    return intervalId;
}

function stopGame() {
    intervalIds.forEach(id => clearInterval(id));
    intervalIds = [];
}