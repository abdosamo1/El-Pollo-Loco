class World {

    startScreen = null;
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    gameStarted = false;
    gameOver = false;
    characterDied = false;
    deathDelay = 0;
    startButtonsShown = false;
    gameOverButtonsShown = false;
    healthBar = new StatusBar('health');
    coinBar = new StatusBar('coin');
    bottleBar = new StatusBar('bottle');

    throwableObjects = [];

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.startScreen = new startGame(this);
        this.gameOverScreen = new GameOver(this);


        this.draw();
        this.setWorld();
    }

    start() {
        if (this.gameStarted) return;
        this.gameStarted = true;
        this.startScreen = null;
        this.gameOver = false;
        this.run();
    }

    restart() {
        this.gameOver = false;
        this.characterDied = false;
        this.deathDelay = 0;
        this.healthBar.setPercentage(100);
        this.camera_x = 0;
        this.character = new Character();
        this.level = level1;
        this.throwableObjects = [];
        this.setWorld();
        this.run();
    }


    checkCollisions() {
        if (this.gameOver || this.characterDied) return;
        this.level.enemies.forEach((enemy) => {
            if (this.character.isColliding(enemy)) {
                this.character.hit();
                this.healthBar.setPercentage(this.character.energy / 10);
                if (this.character.energy === 0) {
                    this.characterDied = true;
                    this.deathDelay = 0;
                }
            }
        });
    }

    run() {
        this.gameInterval = setStopableInterval(() => this.runGameLogic(), 100);
    }

    runGameLogic() {
        if (this.gameOver) return;
        if (this.characterDied) {
            this.deathDelay += 200;
            if (this.deathDelay >= 1000) {
                this.endGame();
            }
            return;
        }
        this.checkCollisions();
        this.checkThrowObjects();
    }

    endGame() {
        this.gameOver = true;
        stopGame();
    }

    checkThrowObjects() {
        if (this.keyboard.D) {
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
            bottle.world = this;
            this.throwableObjects.push(bottle);
        }
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => enemy.world = this);
        this.level.clouds.forEach(cloud => cloud.world = this);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.startScreen ? this.drawStartScreen() :
            this.gameOver ? this.drawGameOverScreen() : this.startGame();

        requestAnimationFrame(() => this.draw());
    }

    startGame() {
        this.ctx.translate(this.camera_x, 0); // camera movement

        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);

        this.ctx.translate(-this.camera_x, 0); // reset camera

        this.addToMap(this.healthBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);
    }

    drawStartScreen() {
        this.addToMap(this.startScreen);
        if (!this.startButtonsShown) {
            const startButtons = document.getElementById('start-screen-buttons');
            if (startButtons) {
                startButtons.style.display = 'flex';
            }
            this.startButtonsShown = true;
        }
    }

    drawGameOverScreen() {
        this.addToMap(this.gameOverScreen);
        if (!this.gameOverButtonsShown) {
            const gameOverButtons = document.getElementById('gameover-screen-buttons');
            if (gameOverButtons) {
                gameOverButtons.style.display = 'flex';
            }
            this.gameOverButtonsShown = true;
        }
    }


    addObjectsToMap(objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    }

    addToMap(object) {
        if (object.otherDirection) {
            this.flipImage(object);
        }
        object.drawImage(this.ctx);
        if (object.otherDirection) {
            this.flipImageBack(object);
        }
    }

    flipImage(object) {
        this.ctx.save();
        this.ctx.translate(object.width, 0);
        this.ctx.scale(-1, 1);
        object.x = object.x * -1;
    }

    flipImageBack(object) {
        object.x = object.x * -1;
        this.ctx.restore();
    }
}