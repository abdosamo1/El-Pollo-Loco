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
    winButtonsShown = false;
    isFullscreen = false;
    fullscreenObjectScale = 0.8;
    healthBar = new StatusBar('health');
    coinBar = new StatusBar('coin');
    bottleBar = new StatusBar('bottle');
    endBossBar = null;
    youWinScreen = null;
    youWin = false;
    Coins = new CollectableItems();
    CoinsCollected = 0;

    throwableObjects = [];
    endBossSpawned = false;

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
        this.youWin = false;
        this.characterDied = false;
        this.deathDelay = 0;
        this.healthBar.setPercentage(100);
        this.coinBar.setPercentage(0);
        this.bottleBar.setPercentage(0);
        this.endBossBar = null;
        this.youWinScreen = null;
        this.camera_x = 0;
        this.character = new Character();
        this.level = createLevel1();
        this.throwableObjects = [];
        this.endBossSpawned = false;
        this.gameStarted = true;
        this.startScreen = null;
        this.startButtonsShown = false;
        this.gameOverButtonsShown = false;
        this.winButtonsShown = false;
        this.hideAllButtons();
        this.setWorld();
        this.run();
    }

    showMainScreen() {
        this.gameOver = false;
        this.youWin = false;
        this.gameStarted = false;
        this.startScreen = new startGame(this);
        this.characterDied = false;
        this.deathDelay = 0;
        this.healthBar.setPercentage(100);
        this.coinBar.setPercentage(0);
        this.bottleBar.setPercentage(0);
        this.camera_x = 0;
        this.character = new Character();
        this.level = createLevel1();
        this.throwableObjects = [];
        this.endBossBar = null;
        this.youWinScreen = null;
        this.endBossSpawned = false;
        this.hideAllButtons();
        this.setWorld();
        this.startButtonsShown = false;
        this.gameOverButtonsShown = false;
        this.winButtonsShown = false;
    }


    checkCollisions() {
        if (this.gameOver || this.characterDied) return;
        this.level.enemies.forEach((enemy) => {
            if (enemy.isDead()) return;
            this.character.isColliding(enemy) ? this.handleCollision(this.character, enemy, this) : null;
        });
    }

    handleCollision(character, enemy, world) {
        this.character.isAbove(enemy) && this.character.speedY <= 0 ? this.killEnemy(enemy) :
            this.damgeCharacter(enemy);
    }

    killEnemy(enemy) {
        enemy.energy = 0;
        enemy.speed = 0;
        enemy.deathTime = Date.now();

        this.dropCoin(enemy);
        this.character.jump(15);
        this.maybeSpawnEndboss();
        return;
    }

    dropCoin(enemy) {
        if (this.coinBar.percentage >= 100) return;
        if (Math.random() >= 0.7) return;

        const droppedCoin = new CollectableItems(enemy.x + enemy.width / 2, enemy.y, false, true);
        droppedCoin.world = this;
        this.level.collectables.push(droppedCoin);
    }

    maybeSpawnEndboss() {
        if (this.endBossSpawned) return;
        const regularEnemiesAlive = this.level.enemies.some(enemy => !(enemy instanceof Endboss) && !enemy.isDead());
        if (!regularEnemiesAlive) {
            const spawnDistance = Math.max(720, this.canvas ? this.canvas.width : 720);
            const endboss = new Endboss(this.character.x + spawnDistance);
            endboss.world = this;
            this.level.enemies.push(endboss);
            this.endBossSpawned = true;
            this.endBossBar = new StatusBar('endboss');
            this.endBossBar.x = 520;
            this.endBossBar.y = 20;
            this.endBossBar.setPercentage(endboss.energy);
        }
    }

    damgeCharacter(enemy) {
        enemy instanceof Endboss ? this.character.hit(50) : this.character.hit(5);
        this.healthBar.setPercentage(this.character.energy / 10);
        if (this.character.energy === 0) {
            this.characterDied = true;
            this.deathDelay = 0;
        }
    }

    run() {
        this.gameInterval = setStopableInterval(() => this.runGameLogic(), 100);
    }

    runGameLogic() {
        if (this.gameOver || this.youWin) return;
        if (this.characterDied) {
            this.deathDelay += 200;
            if (this.deathDelay >= 1000) {
                this.endGame();
            }
            return;
        }
        this.checkCollisions();
        this.checkCollectables();
        this.checkThrowObjects();
        this.checkThrowableCollisions();
        this.updateBossBar();
        this.cleanDeadEnemies();
    }

    checkCollectables() {
        this.level.collectables = this.level.collectables.filter(collectable => {
            if (collectable.canBeCollected && this.character.isColliding(collectable)) {
                if (collectable.isBottle) {
                    // Bottles können nur gesammelt werden, wenn nicht 100%
                    if (this.bottleBar.percentage < 100) {
                        this.bottleBar.setPercentage(Math.min(100, this.bottleBar.percentage + 10));
                        collectable.getCollected();
                        return false;
                    }
                } else {
                    this.coinBar.setPercentage(Math.min(100, this.coinBar.percentage + 10));
                    collectable.getCollected();
                    return false;
                }
            }
            return true;
        });
    }

    cleanDeadEnemies() {
        const now = Date.now();
        this.level.enemies = this.level.enemies.filter(enemy => {
            if (!enemy.isDead()) return true;
            if (!enemy.deathTime) enemy.deathTime = now;
            return now - enemy.deathTime < 4000;
        });
    }

    updateBossBar() {
        if (!this.endBossBar) return;
        const endboss = this.level.enemies.find(enemy => enemy instanceof Endboss);
        if (!endboss) return;
        this.endBossBar.setPercentage(endboss.energy);
    }

    winGame() {
        this.youWin = true;
        this.youWinScreen = new YouWin(this);
        this.gameOver = false;
        this.characterDied = false;
        stopGame();
        const startButtons = document.getElementById('start-screen-buttons');
        if (startButtons) {
            startButtons.style.display = 'none';
        }
    }

    endGame() {
        this.gameOver = true;
        stopGame();
    }

    checkThrowObjects() {
        if (this.keyboard.D && this.bottleBar.percentage > 0) {
            const direction = this.character.otherDirection;
            const bottle = new ThrowableObject(this.character.otherDirection ? this.character.x : this.character.x + 100, this.character.y + 100, direction);
            bottle.world = this;
            this.throwableObjects.push(bottle);
            this.bottleBar.setPercentage(this.bottleBar.percentage - 10);
        }
    }

    checkThrowableCollisions() {
        this.throwableObjects = this.throwableObjects.filter(bottle => {
            if (bottle.isSplashing) {
                return !bottle.splashDone;
            }
            const hitEndboss = this.level.enemies.find(enemy =>
                enemy instanceof Endboss && !enemy.isDead() && bottle.isColliding(enemy)
            );
            if (hitEndboss) {
                hitEndboss.hit(20);
                bottle.startSplash();
                if (hitEndboss.isDead()) {
                    hitEndboss.speed = 0;
                    hitEndboss.deathTime = Date.now();
                    this.coinBar.setPercentage(Math.min(100, this.coinBar.percentage + 30));
                    this.winGame();
                }
                return true;
            }
            return true;
        });
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => enemy.world = this);
        this.level.clouds.forEach(cloud => cloud.world = this);
        this.level.collectables.forEach(collectable => collectable.world = this);
    }

    hideAllButtons() {
        const startButtons = document.getElementById('start-screen-buttons');
        if (startButtons) {
            startButtons.style.display = 'none';
        }
        const gameOverButtons = document.getElementById('gameover-screen-buttons');
        if (gameOverButtons) {
            gameOverButtons.style.display = 'none';
        }
        const winScore = document.getElementById('win-score');
        if (winScore) {
            winScore.style.display = 'none';
        }
    }

    draw() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.startScreen) {
            this.ctx.drawImage(this.startScreen.img, 0, 0, this.canvas.width, this.canvas.height);
            this.drawStartScreen();
            requestAnimationFrame(() => this.draw());
            return;
        }

        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
        this.isFullscreen = isFullscreen;

        if (isFullscreen) {
            const scale = Math.max(1, Math.floor(Math.min(this.canvas.width / 720, this.canvas.height / 480)));
            const offsetX = (this.canvas.width - 720 * scale) / 2;
            const offsetY = (this.canvas.height - 480 * scale) / 2;

            if (this.youWin || this.gameOver) {
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                const centerX = (this.canvas.width - 720 * scale) / 2;
                const centerY = (this.canvas.height - 480 * scale) / 2;
                this.ctx.setTransform(scale, 0, 0, scale, centerX, centerY);
                this.youWin ? this.drawWinScreen() : this.drawGameOverScreen();
            } else {
                this.ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
                this.startGame(false, true);

                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.addToMap(this.healthBar);
                this.addToMap(this.coinBar);
                this.addToMap(this.bottleBar);
                if (this.endBossBar) {
                    const originalX = this.endBossBar.x;
                    this.endBossBar.x = this.canvas.width - this.endBossBar.width - 20;
                    this.addToMap(this.endBossBar);
                    this.endBossBar.x = originalX;
                }
            }
        } else {
            const scale = Math.max(1, Math.floor(Math.min(this.canvas.width / 720, this.canvas.height / 480)));
            const offsetX = (this.canvas.width - 720 * scale) / 2;
            const offsetY = (this.canvas.height - 480 * scale) / 2;
            this.ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
            this.youWin ? this.drawWinScreen() :
                this.gameOver ? this.drawGameOverScreen() : this.startGame();
        }

        requestAnimationFrame(() => this.draw());
    }

    startGame(skipBackground = false, skipStatusBars = false) {
        this.ctx.translate(this.camera_x, 0); // camera movement

        if (!skipBackground) {
            this.addObjectsToMap(this.level.backgroundObjects);
            this.addObjectsToMap(this.level.clouds);
        }
        this.addObjectsToMap(this.level.collectables);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);

        this.ctx.translate(-this.camera_x, 0); // reset camera

        if (!skipStatusBars) {
            this.addToMap(this.healthBar);
            this.addToMap(this.coinBar);
            this.addToMap(this.bottleBar);
            if (this.endBossBar) {
                this.addToMap(this.endBossBar);
            }
        }
    }

    drawStartScreen() {
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

    drawWinScreen() {
        if (this.youWinScreen) {
            this.addToMap(this.youWinScreen);
        }
        if (!this.winButtonsShown) {
            const gameOverButtons = document.getElementById('gameover-screen-buttons');
            if (gameOverButtons) {
                gameOverButtons.style.display = 'flex';
            }
            this.winButtonsShown = true;
        }
        const winScore = document.getElementById('win-score');
        if (winScore && this.coinBar) {
            winScore.innerText = `Level Completed - Your Score is: ${this.coinBar.percentage}%`;
            winScore.style.display = 'block';
        }
    }


    addObjectsToMap(objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    }

    addToMap(object) {
        const scale = this.isFullscreen && (object instanceof Character || object instanceof Chicken || object instanceof Endboss)
            ? this.fullscreenObjectScale
            : 1;
        if (object.otherDirection) {
            this.flipImage(object);
        }
        object.drawImage(this.ctx, scale);
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