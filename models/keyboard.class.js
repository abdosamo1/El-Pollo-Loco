class Keyboard {
    LEFT = false;
    RIGHT = false;
    UP = false;
    DOWN = false;
    SPACE = false;


    constructor() {
        this.init();
    }

    init() {    
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.LEFT = true;
                    break;
                case 'ArrowRight':
                    this.RIGHT = true;
                    break;
                case 'ArrowUp':
                    this.UP = true;
                    break;
                case 'ArrowDown':
                    this.DOWN = true;
                    break;
                case ' ':
                    this.SPACE = true;
                    break;
            }
        });
        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.LEFT = false;
                    break;
                case 'ArrowRight':
                    this.RIGHT = false;
                    break;
                case 'ArrowUp':
                    this.UP = false;
                    break;
                case 'ArrowDown':
                    this.DOWN = false;
                    break;
                case ' ':
                    this.SPACE = false;
            }
        });
    }
}