/** The victory overlay screen and its restart/main-menu button wiring. */
class YouWin extends DrawableObject {
    
    /**
     * creates a new YouWin instance with the victory image and button wiring.
     *  @param {World} world - The game world, used to restart or return to the main screen. 
     * */
    constructor(world) {
        super();
        this.world = world;
        this.loadImage('./assets/img/You won, you lost/You won A.png');
        this.x = (720 - 360) / 2;
        this.y = (480 - 240) / 2;
        this.width = 360;
        this.height = 240;

        this.addWinButtons();
    }

    /**
     * Wires up the restart and main-screen buttons' click handlers.
     * @returns {void}
     */
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

    /**
     * Hides the win-screen buttons and restarts the game world.
     * @returns {void}
     */
    restartGame() {
        const gameOverButtonsDiv = document.getElementById('gameover-screen-buttons');
        if (gameOverButtonsDiv) {
            gameOverButtonsDiv.style.display = 'none';
        }
        if (this.world) {
            this.world.restart();
        }
    }

    /**
     * Hides the win-screen buttons, shows the start-screen buttons, and
     * returns the world to its main screen state.
     * @returns {void}
     */
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
