/** The game-over overlay screen and its restart/main-menu button wiring. */
class GameOver extends DrawableObject {

    /** 
     * creates a new GameOver instance with the game-over image and button wiring.
     * @param {World} world - The game world, used to restart or return to the main screen. */
    constructor(world) {
        super();
        this.world = world;
        this.loadImage('./assets/img/You won, you lost/Game Over.png');
        this.x = (720 - 360) / 2;
        this.y = (480 - 240) / 2;
        this.width = 360;
        this.height = 240;

        this.addGameOverButtons();
    }

    /**
     * Wires up the restart and main-screen buttons' click handlers.
     * @returns {void}
     */
    addGameOverButtons() {
        this.addButton('restart-button');
        this.addButton('main-screen-button');

    }

    /**
     * adds a click handler to the button with the given ID, wiring it to show the main screen.
     * @param {string} id - The ID of the button element.
     */
    addButton(id) {
        this[id] = document.getElementById(id);
        if (this[id]) {
            this[id].onclick = () => {
                id === 'restart-button' ? this.restartGame() : this.showMainScreen();
            };
        }
    }

    /**
     * Hides the game-over buttons and restarts the game world.
     * @returns {void}
     */
    restartGame() {
        if (this.restartButton) {
            this.gameOverButtonsDiv = document.getElementById('gameover-screen-buttons');
            this.gameOverButtonsDiv.style.display = 'none';
        }
        if (this.world) {
            this.world.restart();
        }
    }

    /**
     * Hides the game-over buttons, shows the start-screen buttons, and
     * returns the world to its main screen state.
     * @returns {void}
     */
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
