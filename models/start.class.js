/** The start-screen overlay and its start-button wiring. */
class startGame extends DrawableObject {
    /** @param {World} world - The game world to start when the start button is clicked. */
    constructor(world) {
        super();
        this.world = world;
        this.loadImage('./img/9_intro_outro_screens/start/startscreen_2.png');
        this.x = 0;
        this.y = 0;
        this.width = 720;
        this.height = 480;
        
        this.addStartButtons();
    }

    /**
     * Wires up the start button's click handler.
     * @returns {void}
     */
    addStartButtons() {
        this.startButton = document.getElementById('start-button');
        if (this.startButton) {
            this.startButton.onclick = () => {
                this.startGame();
            };
        }
    }

    /**
     * Hides the start-screen buttons, starts the world, and triggers the
     * first-run tutorial hints if applicable.
     * @returns {void}
     */
    startGame() {
        if (this.startButton) {
            this.startButtonsDiv = document.getElementById('start-screen-buttons');
            this.startButtonsDiv.style.display = 'none';
        }
        if (this.world) {
            this.world.start();
        }
        if (typeof maybeStartTutorialHints === 'function') {
            maybeStartTutorialHints();
        }
    }
}