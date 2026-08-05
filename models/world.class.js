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
    throwInputLocked = false;
    lastThrowTime = 0;
    endBossSpawned = false;
    lastBottleSpawnTime = 0;
    BOTTLE_RESPAWN_INTERVAL = 8000;
    MIN_BOTTLE_SPACING = 32;
    COLLECT_ALIGNMENT_TOLERANCE = 40;

    /**
     * Creates a new World instance, owning the game loop, canvas rendering, level state, and all gameplay rules.
     * @constructor
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
        [this.healthBar, this.coinBar, this.bottleBar, this.endBossBar]
            .filter(Boolean)
            .forEach((bar) => {
                if (typeof bar.updatePositionForViewport === 'function') {
                    bar.updatePositionForViewport();
                }
            });
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
        soundManager.playBackgroundMusic();
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
        soundManager.playBackgroundMusic();
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
        soundManager.stopAllMusic();
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
        this.resetThrowState();
    }

    /**
     * Resets all throw-related state to its initial values.
     * @returns {void}
     */
    resetThrowState() {
        this.throwableObjects = [];
        this.throwInputLocked = false;
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
        this.deathDelay += 20;
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
     * Collects any coin/bottle the character is touching, updating the
     * matching HUD bar and removing collected items from the level.
     * @returns {void}
     */
    checkCollectables() {
        this.level.collectables = this.level.collectables.filter(collectable => this.tryCollect(collectable));
    }

    /**
     * Attempts to collect one item the character is touching. Requires the
     * character to be horizontally aligned with the item, not just clipping
     * its hitbox with an outstretched edge.
     * @param {CollectableItems} collectable - Candidate item to collect.
     * @returns {boolean} True to keep the item in the level, false to remove it.
     */
    tryCollect(collectable) {
        if (!collectable.canBeCollected || !this.character.isColliding(collectable)) return true;
        if (!this.isCharacterAlignedWith(collectable)) return true;
        return collectable.isBottle ? this.tryCollectBottle(collectable) : this.collectCoin(collectable);
    }

    /**
     * Checks whether the character's horizontal center is close enough to the item's center to collect it.
     * @param {CollectableItems} collectable - Candidate item to check alignment with.
     * @returns {boolean} True if the character's and item's horizontal centers are close enough.
     */
    isCharacterAlignedWith(collectable) {
        const characterCenterX = this.character.x + this.character.width / 2;
        const itemCenterX = collectable.x + collectable.width / 2;
        return Math.abs(characterCenterX - itemCenterX) < this.COLLECT_ALIGNMENT_TOLERANCE;
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
        soundManager.playBottleCollectedSound();
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
        soundManager.playCoinCollectedSound();
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
     * Ends the game in a win state, stops all loops and music, and shows the win screen.
     * @returns {void}
     */
    winGame() {
        this.youWin = true;
        this.youWinScreen = new YouWin(this);
        this.gameOver = false;
        this.characterDied = false;
        this.setEndbossWarningVisible(false);
        soundManager.stopAllMusic();
        soundManager.playWinSound();
        stopGame();
        this.hideStartScreenButtons();
        if (typeof updatePauseButtonVisibility === 'function') updatePauseButtonVisibility();
    }

    /**
     * Hides the start-screen button bar if it is currently visible.
     * @returns {void}
     */
    hideStartScreenButtons() {
        const startButtons = document.getElementById('start-screen-buttons');
        if (startButtons) startButtons.style.display = 'none';
    }

    /**
     * Ends the game in a loss state and stops the loop.
     * @returns {void}
     */
    endGame() {
        this.gameOver = true;
        this.setEndbossWarningVisible(false);
        soundManager.stopAllMusic();
        soundManager.playLoseSound();
        stopGame();
        if (typeof updatePauseButtonVisibility === 'function') updatePauseButtonVisibility();
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
}