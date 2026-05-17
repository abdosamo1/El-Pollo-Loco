class YouWin extends DrawableObject {
    constructor(world) {
        super();
        this.world = world;
        this.loadImage('./img/You won, you lost/You won A.png');
        this.x = 0;
        this.y = 0;
        this.width = 720;
        this.height = 480;

        this.addWinButtons();
    }

    addWinButtons() {
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
        const gameOverButtonsDiv = document.getElementById('gameover-screen-buttons');
        if (gameOverButtonsDiv) {
            gameOverButtonsDiv.style.display = 'none';
        }
        if (this.world) {
            this.world.restart();
        }
    }

    showMainScreen() {
        const gameOverButtonsDiv = document.getElementById('gameover-screen-buttons');
        if (gameOverButtonsDiv) {
            gameOverButtonsDiv.style.display = 'none';
        }
        const startButtonsDiv = document.getElementById('start-screen-buttons');
        if (startButtonsDiv) {
            startButtonsDiv.style.display = 'flex';
        }
        if (this.world) {
            this.world.showMainScreen();
        }
    }
}
