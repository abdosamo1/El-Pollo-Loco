    class GameOver extends DrawableObject {
    constructor(world) {
        super();
        this.world = world;
        this.loadImage('./img/9_intro_outro_screens/game_over/game over.png');
        this.x = 0;
        this.y = 0;
        this.width = 720;
        this.height = 480;

        this.addGameOverButtons();
    }

    addGameOverButtons() {
        this.restartButton = document.getElementById('restart-button');
        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });

        this.mainScreenButton = document.getElementById('main-screen-button');
        this.mainScreenButton.addEventListener('click', () => {
            this.showMainScreen();
        });
    }

    restartGame() {
        if (this.restartButton) {
            this.gameOverButtonsDiv = document.getElementById('gameover-screen-buttons');
            this.gameOverButtonsDiv.style.display = 'none';
        }
        if (this.world) {
            this.world.restart();
        }
    }

    showMainScreen() {
        if (this.mainScreenButton) {
            this.gameOverButtonsDiv = document.getElementById('gameover-screen-buttons');
            this.gameOverButtonsDiv.style.display = 'none';
            this.startScreenButtonsDiv = document.getElementById('start-screen-buttons');
            this.startScreenButtonsDiv ? this.startScreenButtonsDiv.style.display = 'flex' : null;
        }
        if (this.world) {
            this.world.showMainScreen();
        }
    }
}
