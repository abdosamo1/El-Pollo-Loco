/** Tracks keyboard input state used to control the character. */
class Keyboard {
    LEFT = false;
    RIGHT = false;
    UP = false;
    DOWN = false;
    SPACE = false;
    D = false;
    mobileLeft = false;
    mobileRight = false;
    mobileUp = false;
    mobileD = false;

    /** Maps native key values to the tracked state property they control. */
    static KEY_TO_PROPERTY = {
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT',
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        ' ': 'SPACE',
        'd': 'D'
    };

    /**
     * Creates a new Keyboard instance and registers event listeners to track key state.
     * @returns {void}
     */
    constructor() {
        this.init();
    }

    /**
     * Registers window key event listeners that flip the tracked key states.
     * @returns {void}
     */
    init() {
        this.bindKeyDown();
        this.bindKeyUp();
    }

    /**
     * Listens for keydown events and marks the matching tracked key as pressed.
     * @returns {void}
     */
    bindKeyDown() {
        window.addEventListener('keydown', (e) => this.setKeyState(e.key, true));
    }

    /**
     * Listens for keyup events and marks the matching tracked key as released.
     * @returns {void}
     */
    bindKeyUp() {
        window.addEventListener('keyup', (e) => this.setKeyState(e.key, false));
    }

    /**
     * Updates the tracked state property for a given native key, if any.
     * @param {string} key - The native `KeyboardEvent.key` value.
     * @param {boolean} isPressed - True on keydown, false on keyup.
     * @returns {void}
     */
    setKeyState(key, isPressed) {
        const property = Keyboard.KEY_TO_PROPERTY[key];
        if (property) {
            this[property] = isPressed;
        }
    }
}