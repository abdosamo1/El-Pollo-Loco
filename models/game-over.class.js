    class GameOver extends DrawableObject {
    constructor(world) {
        super();
        this.world = world;
        this.loadImage('./img/You won, you lost/Game Over.png');
        this.x = (720 - 360) / 2;
        this.y = (480 - 240) / 2;
        this.width = 360;
        this.height = 240;

        this.addGameOverButtons();
    }

    addGameOverButtons() {
        this.restartButton = document.getElementById('restart-button');
        if (this.restartButton) {
            this.restartButton.onclick = () => {
                this.restartGame();
            };
        }

        this.mainScreenButton = document.getElementById('main-screen-button');
        if (this.mainScreenButton) {
            this.mainScreenButton.onclick = () => {
                this.showMainScreen();
            };
        }
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
