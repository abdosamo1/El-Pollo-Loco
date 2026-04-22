class startGame extends DrawableObject {
    constructor(world) {
        super();
        this.world = world;
        this.loadImage('./img/9_intro_outro_screens/start/startscreen_2.png');
        this.x = 0;
        this.y = 0;
        this.width = 720;
        this.height = 480;
        
        this.addStartButton();
    }

    addStartButton() {
        this.startButton = document.getElementById('start-button');
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });
    }

    startGame() {
        if (this.startButton) {
            this.startButtonsDiv = document.getElementById('start-screen-buttons');
            this.startButtonsDiv.style.display = 'none';
        }
        if (this.world) {
            this.world.start();
        }
    }
}