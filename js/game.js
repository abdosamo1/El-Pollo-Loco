let canvas;
let world;
let keyboard = new Keyboard();

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

