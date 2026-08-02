/** Owns the game loop, canvas rendering, level state, and all gameplay rules. */
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
    lastThrowTime = 0;
    endBossSpawned = false;
    lastBottleSpawnTime = 0;
    BOTTLE_RESPAWN_INTERVAL = 8000;

    /**
     * @param {HTMLCanvasElement} canvas - Canvas element to render the game onto.
     * @param {Keyboard} keyboard - Shared keyboard input state.
     */
    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.startScreen = new startGame(this);
        this.gameOverScreen = new GameOver(this);

        this.updateStatusBarPositions();
        this.draw();
        this.setWorld();
    }

    /**
     * Repositions the coin/bottle/endboss HUD bars for narrow vs. wide viewports.
     * @returns {void}
     */
    updateStatusBarPositions() {
        const windowWidth = window.innerWidth;
        const narrow = windowWidth <= 1020;

        this.healthBar.y = 24;
        this.coinBar.y = narrow ? 54 : 72;
        this.bottleBar.y = narrow ? 84: 120;

        if (this.endBossBar) {
            this.endBossBar.y = 40;
        }
    }

    /**
     * Starts the game loop for the first time (no-op if already started).
     * @returns {void}
     */
    start() {
        if (this.gameStarted) return;
        this.gameStarted = true;
        this.startScreen = null;
        this.gameOver = false;
        this.lastBottleSpawnTime = Date.now();
        this.run();
        if (typeof updatePauseButtonVisibility === 'function') updatePauseButtonVisibility();
    }

    /**
     * Resets all game state and starts a fresh run from level 1.
     * @returns {void}
     */
    restart() {
        this.resetGameFlags();
        this.resetLevelObjects();
        this.gameStarted = true;
        this.startScreen = null;
        this.resetButtonShownFlags();
        this.hideAllButtons();
        this.setWorld();
        this.run();
        if (typeof updatePauseButtonVisibility === 'function') updatePauseButtonVisibility();
    }

    /**
     * Resets all game state and shows the start screen without starting the game loop.
     * @returns {void}
     */
    showMainScreen() {
        this.resetGameFlags();
        this.resetLevelObjects();
        this.gameStarted = false;
        this.startScreen = new startGame(this);
        this.resetButtonShownFlags();
        this.hideAllButtons();
        this.setWorld();
        if (typeof updatePauseButtonVisibility === 'function') updatePauseButtonVisibility();
    }

    /**
     * Resets the top-level run/win/death flags shared by restart and showMainScreen.
     * @returns {void}
     */
    resetGameFlags() {
        this.gameOver = false;
        this.youWin = false;
        this.characterDied = false;
        this.deathDelay = 0;
        this.camera_x = 0;
    }

    /**
     * Recreates the character, level, HUD bars, and thrown-object state for a fresh run.
     * @returns {void}
     */
    resetLevelObjects() {
        this.character = new Character();
        this.healthBar.setPercentage(100);
        this.coinBar.setPercentage(0);
        this.bottleBar.setPercentage(0);
        this.endBossBar = null;
        this.youWinScreen = null;
        this.level = createLevel1();
        this.throwableObjects = [];
        this.lastThrowTime = 0;
        this.lastBottleSpawnTime = Date.now();
        this.endBossSpawned = false;
    }

    /**
     * Resets the "has this overlay's buttons been shown" flags.
     * @returns {void}
     */
    resetButtonShownFlags() {
        this.startButtonsShown = false;
        this.gameOverButtonsShown = false;
        this.winButtonsShown = false;
    }


    /**
     * Checks the character against every living enemy and handles any collision found.
     * @returns {void}
     */
    checkCollisions() {
        if (this.gameOver || this.characterDied) return;
        this.level.enemies.forEach((enemy) => {
            if (enemy.isDead()) return;
            this.character.isColliding(enemy) ? this.handleCollision(this.character, enemy, this) : null;
        });
    }

    /**
     * Resolves a character/enemy collision as either a stomp-kill (falling
     * onto a regular enemy) or damage to the character. The endboss can
     * never be stomp-killed, only defeated with thrown bottles.
     * @param {Character} character - The player character.
     * @param {MovableObject} enemy - The enemy collided with.
     * @param {World} world - The game world (unused directly; kept for signature clarity).
     * @returns {void}
     */
    handleCollision(character, enemy, world) {
        const isStomp = !(enemy instanceof Endboss) && this.character.isAbove(enemy) && this.character.speedY <= 0;
        isStomp ? this.killEnemy(enemy) : this.damgeCharacter(enemy);
    }

    /**
     * Kills an enemy (stomp), bounces the character, and defeats the enemy.
     * @param {MovableObject} enemy - The enemy to kill.
     * @returns {void}
     */
    killEnemy(enemy) {
        this.defeatEnemy(enemy);
        this.character.jump(15);
    }

    /**
     * Marks an enemy as dead, makes it drop a possible coin, and checks
     * whether the endboss should spawn.
     * @param {MovableObject} enemy - The enemy to defeat.
     * @returns {void}
     */
    defeatEnemy(enemy) {
        enemy.energy = 0;
        enemy.speed = 0;
        enemy.deathTime = Date.now();
        this.dropCoin(enemy);
        this.maybeSpawnEndboss();
    }

    /**
     * Randomly drops a collectable coin at a defeated enemy's position
     * (skipped if the coin bar is already full).
     * @param {MovableObject} enemy - The enemy the coin drops from.
     * @returns {void}
     */
    dropCoin(enemy) {
        if (this.coinBar.percentage >= 100) return;
        if (Math.random() >= 0.7) return;

        const droppedCoin = new CollectableItems(enemy.x + enemy.width / 2, enemy.y, false, true);
        droppedCoin.world = this;
        this.level.collectables.push(droppedCoin);
    }

    /**
     * Spawns the endboss once all regular enemies are defeated (only once per run).
     * @returns {void}
     */
    maybeSpawnEndboss() {
        if (this.endBossSpawned || this.hasRegularEnemiesAlive()) return;
        this.spawnEndboss();
    }

    /**
     * @returns {boolean} True if any non-endboss enemy is still alive.
     */
    hasRegularEnemiesAlive() {
        return this.level.enemies.some(enemy => !(enemy instanceof Endboss) && !enemy.isDead());
    }

    /**
     * Creates the endboss ahead of the character and sets up its HUD bar.
     * @returns {void}
     */
    spawnEndboss() {
        const spawnDistance = Math.max(720, this.canvas ? this.canvas.width : 720);
        const endboss = new Endboss(this.character.x + spawnDistance);
        endboss.world = this;
        this.level.enemies.push(endboss);
        this.endBossSpawned = true;
        this.endBossBar = new StatusBar('endboss');
        this.endBossBar.x = 520;
        this.endBossBar.setPercentage(endboss.energy);
    }

    /**
     * Applies damage to the character from a side-collision with an enemy
     * and updates the health bar / death state accordingly.
     * @param {MovableObject} enemy - The enemy that hit the character.
     * @returns {void}
     */
    damgeCharacter(enemy) {
        enemy instanceof Endboss ? this.character.hit(50) : this.character.hit(5);
        this.healthBar.setPercentage(this.character.energy / 10);
        if (this.character.energy === 0) {
            this.characterDied = true;
            this.deathDelay = 0;
        }
    }

    /**
     * Starts the main game-logic loop at the same tick rate as gravity, so
     * falling characters can't tunnel through short hitboxes between checks.
     * @returns {void}
     */
    run() {
        this.gameInterval = setStopableInterval(() => this.runGameLogic(), 1000 / 25);
    }

    /**
     * Runs one tick of gameplay logic: death-delay countdown, or collisions,
     * collectables, throwing, boss-bar updates, and cleanup of dead enemies.
     * @returns {void}
     */
    runGameLogic() {
        if (this.gameOver || this.youWin) return;
        if (this.characterDied) {
            this.handleDeathDelay();
            return;
        }
        this.runActiveGameplayChecks();
    }

    /**
     * Counts down the delay before showing the game-over screen after death.
     * @returns {void}
     */
    handleDeathDelay() {
        this.deathDelay += 1000 / 25;
        if (this.deathDelay >= 1000) {
            this.endGame();
        }
    }

    /**
     * Runs every per-tick gameplay check while the character is alive.
     * @returns {void}
     */
    runActiveGameplayChecks() {
        this.checkCollisions();
        this.checkCollectables();
        this.checkThrowObjects();
        this.checkThrowableCollisions();
        this.updateBossBar();
        this.cleanDeadEnemies();
        this.checkBottleRespawn();
        this.checkEndbossWarning();
    }

    /**
     * Spawns a fresh collectable bottle every {@link World#BOTTLE_RESPAWN_INTERVAL}
     * so players can't permanently run out of throwable ammo.
     * @returns {void}
     */
    checkBottleRespawn() {
        if (Date.now() - this.lastBottleSpawnTime < this.BOTTLE_RESPAWN_INTERVAL) return;
        this.spawnBottle();
        this.lastBottleSpawnTime = Date.now();
    }

    /**
     * Creates a new bottle pickup ahead of the character's current position.
     * @returns {void}
     */
    spawnBottle() {
        const x = this.character.x + 400 + Math.random() * 200;
        const y = 150 + Math.random() * 180;
        const bottle = new CollectableItems(x, y, true);
        bottle.world = this;
        this.level.collectables.push(bottle);
    }

    /**
     * Shows a warning once the character has walked far ahead without
     * defeating every regular chicken, since the endboss can't spawn otherwise.
     * @returns {void}
     */
    checkEndbossWarning() {
        const nearLevelEnd = this.character.x > this.level.level_end_x - 800;
        const shouldWarn = nearLevelEnd && this.hasRegularEnemiesAlive() && !this.endBossSpawned;
        this.setEndbossWarningVisible(shouldWarn);
    }

    /**
     * Shows or hides the endboss warning HTML element.
     * @param {boolean} visible - Whether the warning should be shown.
     * @returns {void}
     */
    setEndbossWarningVisible(visible) {
        const warning = document.getElementById('endboss-warning');
        if (warning) {
            warning.style.display = visible ? 'block' : 'none';
        }
    }

    /**
     * Collects any coin/bottle the character is touching, updating the
     * matching HUD bar and removing collected items from the level.
     * @returns {void}
     */
    checkCollectables() {
        this.level.collectables = this.level.collectables.filter(collectable => this.tryCollect(collectable));
    }

    /**
     * Attempts to collect one item the character is touching.
     * @param {CollectableItems} collectable - Candidate item to collect.
     * @returns {boolean} True to keep the item in the level, false to remove it.
     */
    tryCollect(collectable) {
        if (!collectable.canBeCollected || !this.character.isColliding(collectable)) return true;
        return collectable.isBottle ? this.tryCollectBottle(collectable) : this.collectCoin(collectable);
    }

    /**
     * Collects a bottle into the bottle bar, unless it's already full.
     * @param {CollectableItems} collectable - The bottle pickup.
     * @returns {boolean} True to keep the item (bar full), false to remove it (collected).
     */
    tryCollectBottle(collectable) {
        if (this.bottleBar.percentage >= 100) return true;
        this.bottleBar.setPercentage(Math.min(100, this.bottleBar.percentage + 10));
        collectable.getCollected();
        return false;
    }

    /**
     * Collects a coin into the coin bar.
     * @param {CollectableItems} collectable - The coin pickup.
     * @returns {boolean} Always false, since coins are always removed once collected.
     */
    collectCoin(collectable) {
        this.coinBar.setPercentage(Math.min(100, this.coinBar.percentage + 10));
        collectable.getCollected();
        return false;
    }

    /**
     * Removes dead enemies from the level 4 seconds after their death, so
     * the death sprite has time to display first.
     * @returns {void}
     */
    cleanDeadEnemies() {
        const now = Date.now();
        this.level.enemies = this.level.enemies.filter(enemy => {
            if (!enemy.isDead()) return true;
            if (!enemy.deathTime) enemy.deathTime = now;
            return now - enemy.deathTime < 4000;
        });
    }

    /**
     * Syncs the endboss HUD bar with the boss's current energy, if spawned.
     * @returns {void}
     */
    updateBossBar() {
        if (!this.endBossBar) return;
        const endboss = this.level.enemies.find(enemy => enemy instanceof Endboss);
        if (!endboss) return;
        this.endBossBar.setPercentage(endboss.energy);
    }

    /**
     * Ends the game in a win state, stops the loop, and shows the win screen/buttons.
     * @returns {void}
     */
    winGame() {
        this.youWin = true;
        this.youWinScreen = new YouWin(this);
        this.gameOver = false;
        this.characterDied = false;
        this.setEndbossWarningVisible(false);
        stopGame();
        const startButtons = document.getElementById('start-screen-buttons');
        if (startButtons) {
            startButtons.style.display = 'none';
        }
        if (typeof updatePauseButtonVisibility === 'function') updatePauseButtonVisibility();
    }

    /**
     * Ends the game in a loss state and stops the loop.
     * @returns {void}
     */
    endGame() {
        this.gameOver = true;
        this.setEndbossWarningVisible(false);
        stopGame();
        if (typeof updatePauseButtonVisibility === 'function') updatePauseButtonVisibility();
    }

    /**
     * Throws a new bottle when the throw key/button is held, bottles are
     * available, and the throw cooldown has elapsed.
     * @returns {void}
     */
    checkThrowObjects() {
        if (this.canThrow()) {
            this.throwBottle();
        }
    }

    /**
     * @returns {boolean} True if the throw input is active, bottles are
     * available, and the throw cooldown has elapsed.
     */
    canThrow() {
        const cooldownElapsed = Date.now() - this.lastThrowTime >= 500;
        return (this.keyboard.D || this.keyboard.mobileD) && this.bottleBar.percentage > 0 && cooldownElapsed;
    }

    /**
     * Spawns a thrown bottle at the character's position and consumes one bottle charge.
     * @returns {void}
     */
    throwBottle() {
        const direction = this.character.otherDirection;
        const bottle = new ThrowableObject(direction ? this.character.x : this.character.x + 100, this.character.y + 100, direction);
        bottle.world = this;
        this.throwableObjects.push(bottle);
        this.bottleBar.setPercentage(this.bottleBar.percentage - 10);
        this.lastThrowTime = Date.now();
    }

    /**
     * Checks in-flight bottles against every living enemy, killing regular
     * chickens on contact and damaging the endboss; removes finished splash bottles.
     * @returns {void}
     */
    checkThrowableCollisions() {
        this.throwableObjects = this.throwableObjects.filter(bottle => this.updateThrowable(bottle));
    }

    /**
     * Advances one thrown bottle's collision state for this tick.
     * @param {ThrowableObject} bottle - The bottle to update.
     * @returns {boolean} True to keep the bottle in the world.
     */
    updateThrowable(bottle) {
        if (bottle.isSplashing) return !bottle.splashDone;
        const hitEnemy = this.findHitEnemy(bottle);
        if (hitEnemy) {
            this.applyBottleHit(bottle, hitEnemy);
        }
        return true;
    }

    /**
     * @param {ThrowableObject} bottle - The bottle to test.
     * @returns {MovableObject|undefined} The living enemy this bottle is touching, if any.
     */
    findHitEnemy(bottle) {
        return this.level.enemies.find(enemy => !enemy.isDead() && bottle.isColliding(enemy));
    }

    /**
     * Splashes the bottle and either damages the endboss or instantly
     * defeats a regular chicken/small chicken.
     * @param {ThrowableObject} bottle - The bottle that hit.
     * @param {MovableObject} hitEnemy - The enemy that was hit.
     * @returns {void}
     */
    applyBottleHit(bottle, hitEnemy) {
        bottle.startSplash();
        hitEnemy instanceof Endboss ? this.damageEndbossWithBottle(hitEnemy) : this.defeatEnemy(hitEnemy);
    }

    /**
     * Applies bottle damage to the endboss and defeats it once its energy runs out.
     * @param {Endboss} hitEndboss - The endboss that was hit.
     * @returns {void}
     */
    damageEndbossWithBottle(hitEndboss) {
        hitEndboss.hit(20);
        if (hitEndboss.isDead()) {
            this.defeatEndboss(hitEndboss);
        }
    }

    /**
     * Finalizes the endboss's defeat and wins the game.
     * @param {Endboss} hitEndboss - The defeated endboss.
     * @returns {void}
     */
    defeatEndboss(hitEndboss) {
        hitEndboss.speed = 0;
        hitEndboss.deathTime = Date.now();
        this.coinBar.setPercentage(Math.min(100, this.coinBar.percentage + 30));
        this.winGame();
    }

    /**
     * Backreferences this world on the character, enemies, clouds, and
     * collectables so they can read shared game state.
     * @returns {void}
     */
    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => enemy.world = this);
        this.level.clouds.forEach(cloud => cloud.world = this);
        this.level.collectables.forEach(collectable => collectable.world = this);
    }

    /**
     * Hides the start/game-over/win-score/endboss-warning HTML overlay elements.
     * @returns {void}
     */
    hideAllButtons() {
        this.hideElement('start-screen-buttons');
        this.hideElement('gameover-screen-buttons');
        this.hideElement('win-score');
        this.hideElement('endboss-warning');
    }

    /**
     * Hides a single HTML element by id, if it exists.
     * @param {string} id - The element's id.
     * @returns {void}
     */
    hideElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Renders one frame: start screen, or the scaled/fullscreen-aware game
     * world, win screen, or game-over screen, then schedules the next frame.
     * @returns {void}
     */
    draw() {
        this.clearCanvas();
        if (this.startScreen) {
            this.drawStartScreenFrame();
            return;
        }
        this.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        const { scale, offsetX, offsetY } = this.computeRenderTransform();
        this.isFullscreen
            ? this.drawFullscreenFrame(scale, offsetX, offsetY)
            : this.drawWindowedFrame(scale, offsetX, offsetY);
        requestAnimationFrame(() => this.draw());
    }

    /**
     * Resets the canvas transform and clears the previous frame.
     * @returns {void}
     */
    clearCanvas() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draws the start screen image/buttons and schedules the next frame.
     * @returns {void}
     */
    drawStartScreenFrame() {
        this.ctx.drawImage(this.startScreen.img, 0, 0, this.canvas.width, this.canvas.height);
        this.drawStartScreen();
        requestAnimationFrame(() => this.draw());
    }

    /**
     * Computes the uniform scale and centering offsets that fit the fixed
     * 720x480 game world into the current canvas size.
     * @returns {{scale: number, offsetX: number, offsetY: number}}
     */
    computeRenderTransform() {
        const scale = Math.min(this.canvas.width / 720, this.canvas.height / 480);
        const offsetX = (this.canvas.width - 720 * scale) / 2;
        const offsetY = (this.canvas.height - 480 * scale) / 2;
        return { scale, offsetX, offsetY };
    }

    /**
     * Renders a frame while in native/pseudo fullscreen.
     * @param {number} scale - Uniform render scale.
     * @param {number} offsetX - Horizontal centering offset.
     * @param {number} offsetY - Vertical centering offset.
     * @returns {void}
     */
    drawFullscreenFrame(scale, offsetX, offsetY) {
        if (this.youWin || this.gameOver) {
            this.drawEndScreenCentered(scale, offsetX, offsetY);
        } else {
            this.drawActiveGameplay(scale, offsetX, offsetY);
        }
    }

    /**
     * Renders the win/game-over screen centered on the canvas.
     * @param {number} scale - Uniform render scale.
     * @param {number} offsetX - Horizontal centering offset.
     * @param {number} offsetY - Vertical centering offset.
     * @returns {void}
     */
    drawEndScreenCentered(scale, offsetX, offsetY) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        this.youWin ? this.drawWinScreen() : this.drawGameOverScreen();
    }

    /**
     * Renders a frame in a normal (non-fullscreen) window.
     * @param {number} scale - Uniform render scale.
     * @param {number} offsetX - Horizontal centering offset.
     * @param {number} offsetY - Vertical centering offset.
     * @returns {void}
     */
    drawWindowedFrame(scale, offsetX, offsetY) {
        if (this.youWin) {
            this.ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
            this.drawWinScreen();
        } else if (this.gameOver) {
            this.ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
            this.drawGameOverScreen();
        } else {
            this.drawActiveGameplay(scale, offsetX, offsetY);
        }
    }

    /**
     * Renders the scaled level content followed by the un-scaled HUD bars.
     * @param {number} scale - Uniform render scale.
     * @param {number} offsetX - Horizontal centering offset.
     * @param {number} offsetY - Vertical centering offset.
     * @returns {void}
     */
    drawActiveGameplay(scale, offsetX, offsetY) {
        this.ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        this.startGame(false, true);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.drawStatusBars();
    }

    /**
     * Draws the health/coin/bottle HUD bars and the endboss bar, if present.
     * @returns {void}
     */
    drawStatusBars() {
        this.addToMap(this.healthBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);
        if (this.endBossBar) {
            this.drawEndBossBarAtRightEdge();
        }
    }

    /**
     * Temporarily repositions the endboss bar to the canvas's right edge to draw it.
     * @returns {void}
     */
    drawEndBossBarAtRightEdge() {
        const originalX = this.endBossBar.x;
        this.endBossBar.x = this.canvas.width - this.endBossBar.width - 20;
        this.addToMap(this.endBossBar);
        this.endBossBar.x = originalX;
    }

    /**
     * Draws the level content (background, collectables, enemies, thrown
     * bottles, HUD bars, and the character) with the camera translation applied.
     * @param {boolean} [skipBackground=false] - Skip drawing background layers/clouds.
     * @param {boolean} [skipStatusBars=false] - Skip drawing the HUD bars (drawn separately instead).
     * @returns {void}
     */
    startGame(skipBackground = false, skipStatusBars = false) {
        this.ctx.translate(this.camera_x, 0); // camera movement
        this.drawBackgroundLayers(skipBackground);
        this.drawLevelObjects();
        this.drawInlineStatusBars(skipStatusBars);
        this.addToMap(this.character);
        this.ctx.translate(-this.camera_x, 0); // reset camera
    }

    /**
     * Draws the tiled background layers and clouds, unless skipped.
     * @param {boolean} skipBackground - True to skip drawing the background.
     * @returns {void}
     */
    drawBackgroundLayers(skipBackground) {
        if (skipBackground) return;
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
    }

    /**
     * Draws the collectables, enemies, and thrown bottles.
     * @returns {void}
     */
    drawLevelObjects() {
        this.addObjectsToMap(this.level.collectables);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
    }

    /**
     * Draws the HUD bars using the currently-applied (camera-relative) transform, unless skipped.
     * @param {boolean} skipStatusBars - True to skip drawing the HUD bars here.
     * @returns {void}
     */
    drawInlineStatusBars(skipStatusBars) {
        if (skipStatusBars) return;
        this.addToMap(this.healthBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);
        if (this.endBossBar) {
            this.addToMap(this.endBossBar);
        }
    }

    /**
     * Shows the start-screen HTML buttons once (on first draw of the start screen).
     * @returns {void}
     */
    drawStartScreen() {
        if (!this.startButtonsShown) {
            const startButtons = document.getElementById('start-screen-buttons');
            if (startButtons) {
                startButtons.style.display = 'flex';
            }
            this.startButtonsShown = true;
        }
    }

    /**
     * Draws the game-over image and shows its HTML buttons once.
     * @returns {void}
     */
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

    /**
     * Draws the win-screen image, shows its HTML buttons once, and updates
     * the final score text.
     * @returns {void}
     */
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


    /**
     * Draws each object in a list onto the canvas.
     * @param {DrawableObject[]} objects - Objects to draw.
     * @returns {void}
     */
    addObjectsToMap(objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    }

    /**
     * Draws a single object, applying fullscreen/HUD scaling and a
     * horizontal flip when the object faces the opposite direction.
     * @param {DrawableObject} object - Object to draw.
     * @returns {void}
     */
    addToMap(object) {
        const scale = this.resolveDrawScale(object);
        if (object.otherDirection) this.flipImage(object);
        object.drawImage(this.ctx, scale);
        if (object.otherDirection) this.flipImageBack(object);
    }

    /**
     * Determines the render scale for an object based on fullscreen state and type.
     * @param {DrawableObject} object - Object being drawn.
     * @returns {number} The scale factor to draw the object at.
     */
    resolveDrawScale(object) {
        if (this.isFullscreen && (object instanceof Character || object instanceof Chicken || object instanceof Endboss)) {
            return this.fullscreenObjectScale;
        }
        const uiScale = Math.min(1, this.canvas.width / 720, this.canvas.height / 480);
        return object instanceof StatusBar ? uiScale : 1;
    }

    /**
     * Mirrors the canvas horizontally around the object so it can be drawn
     * facing the opposite direction; pair with {@link World#flipImageBack}.
     * @param {DrawableObject} object - Object being flipped.
     * @returns {void}
     */
    flipImage(object) {
        this.ctx.save();
        this.ctx.translate(object.width, 0);
        this.ctx.scale(-1, 1);
        object.x = object.x * -1;
    }

    /**
     * Restores the canvas transform and object position after {@link World#flipImage}.
     * @param {DrawableObject} object - Object that was flipped.
     * @returns {void}
     */
    flipImageBack(object) {
        object.x = object.x * -1;
        this.ctx.restore();
    }
}