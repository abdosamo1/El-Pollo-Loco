/** Canvas rendering mixed into {@link World}: frame drawing, scaling, and sprite flipping. */
Object.assign(World.prototype, {

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
    },

    /**
     * Resets the canvas transform and clears the previous frame.
     * @returns {void}
     */
    clearCanvas() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    /**
     * Draws the start screen image/buttons and schedules the next frame.
     * @returns {void}
     */
    drawStartScreenFrame() {
        this.ctx.drawImage(this.startScreen.img, 0, 0, this.canvas.width, this.canvas.height);
        this.drawStartScreen();
        requestAnimationFrame(() => this.draw());
    },

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
    },

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
    },

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
    },

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
    },

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
        this.drawStatusBars();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    },

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
    },

    /**
     * Temporarily repositions the endboss bar to the canvas's right edge to draw it.
     * @returns {void}
     */
    drawEndBossBarAtRightEdge() {
        const originalX = this.endBossBar.x;
        this.endBossBar.x = this.canvas.width - this.endBossBar.width - 20;
        this.addToMap(this.endBossBar);
        this.endBossBar.x = originalX;
    },

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
    },

    /**
     * Draws the tiled background layers and clouds, unless skipped.
     * @param {boolean} skipBackground - True to skip drawing the background.
     * @returns {void}
     */
    drawBackgroundLayers(skipBackground) {
        if (skipBackground) return;
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
    },

    /**
     * Draws the collectables, enemies, and thrown bottles.
     * @returns {void}
     */
    drawLevelObjects() {
        this.addObjectsToMap(this.level.collectables);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
    },

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
    },

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
    },

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
    },

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
    },

    /**
     * Draws each object in a list onto the canvas.
     * @param {DrawableObject[]} objects - Objects to draw.
     * @returns {void}
     */
    addObjectsToMap(objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    },

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
    },

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
    },

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
    },

    /**
     * Restores the canvas transform and object position after {@link World#flipImage}.
     * @param {DrawableObject} object - Object that was flipped.
     * @returns {void}
     */
    flipImageBack(object) {
        object.x = object.x * -1;
        this.ctx.restore();
    }

});
