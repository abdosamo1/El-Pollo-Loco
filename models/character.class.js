/** The player-controlled character (Pepe): movement, jumping, animation, and stomp detection. */
class Character extends MovableObject {
    x = 100;
    y = 125;
    width = 150;
    height = 300;
    speed = 3;
    // Tighter left/right than the sprite's outer bounds so enemies must be
    // visually closer to Pepe's body before a hit/hurt registers.
    offset = { top: 110, left: 50, right: 40, bottom: 35 };

    IMAGES_WALKING = [
        './img/2_character_pepe/2_walk/W-21.png',
        './img/2_character_pepe/2_walk/W-22.png',
        './img/2_character_pepe/2_walk/W-23.png',
        './img/2_character_pepe/2_walk/W-24.png',
        './img/2_character_pepe/2_walk/W-25.png',
        './img/2_character_pepe/2_walk/W-26.png'
    ];
    IMAGES_JUMPING = [
        './img/2_character_pepe/3_jump/J-31.png',
        './img/2_character_pepe/3_jump/J-32.png',
        './img/2_character_pepe/3_jump/J-33.png',
        './img/2_character_pepe/3_jump/J-34.png',
        './img/2_character_pepe/3_jump/J-35.png',
        './img/2_character_pepe/3_jump/J-36.png',
        './img/2_character_pepe/3_jump/J-37.png',
        './img/2_character_pepe/3_jump/J-38.png',
        './img/2_character_pepe/3_jump/J-39.png'
    ];
    IMAGES_DEAD = [
        './img/2_character_pepe/5_dead/D-51.png',
        './img/2_character_pepe/5_dead/D-52.png',
        './img/2_character_pepe/5_dead/D-53.png',
        './img/2_character_pepe/5_dead/D-54.png',
        './img/2_character_pepe/5_dead/D-55.png',
        './img/2_character_pepe/5_dead/D-56.png',
        './img/2_character_pepe/5_dead/D-57.png'
    ];
    IMAGES_HURT = [
        './img/2_character_pepe/4_hurt/H-41.png',
        './img/2_character_pepe/4_hurt/H-42.png',
        './img/2_character_pepe/4_hurt/H-43.png'
    ];    

    IMAGES_IDLE = [
        './img/2_character_pepe/1_idle/idle/I-1.png',
        './img/2_character_pepe/1_idle/idle/I-2.png',
        './img/2_character_pepe/1_idle/idle/I-3.png',
        './img/2_character_pepe/1_idle/idle/I-4.png',
        './img/2_character_pepe/1_idle/idle/I-5.png',
        './img/2_character_pepe/1_idle/idle/I-6.png',
        './img/2_character_pepe/1_idle/idle/I-7.png',
        './img/2_character_pepe/1_idle/idle/I-8.png',
        './img/2_character_pepe/1_idle/idle/I-9.png',
        './img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    IMAGES_LONG_IDLE = [
        './img/2_character_pepe/1_idle/long_idle/I-11.png',
        './img/2_character_pepe/1_idle/long_idle/I-12.png',
        './img/2_character_pepe/1_idle/long_idle/I-13.png',
        './img/2_character_pepe/1_idle/long_idle/I-14.png',
        './img/2_character_pepe/1_idle/long_idle/I-15.png',
        './img/2_character_pepe/1_idle/long_idle/I-16.png',
        './img/2_character_pepe/1_idle/long_idle/I-17.png',
        './img/2_character_pepe/1_idle/long_idle/I-18.png',
        './img/2_character_pepe/1_idle/long_idle/I-19.png',
        './img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];

    world;
    idleTicks = 0;
    LONG_IDLE_THRESHOLD = 500;
    currentJumpImage = 0;
    jumpImageTick = 0;
    KNOCKBACK_DISTANCE = 200;
    KNOCKBACK_JUMP_HEIGHT = 10;
    ENDBOSS_KNOCKBACK_DISTANCE = 320;
    ENDBOSS_KNOCKBACK_JUMP_HEIGHT = 18;
    KNOCKBACK_DURATION = 1000;
    KNOCKBACK_TICK_DELAY = 1000 / 120;
    isRecoveringFromHit = false;
    isKnockedBack = false;
    knockbackDirection = 0;
    currentHurtImage = 0;

    constructor() {
        super();
        this.loadAllImages();
        this.animate();
        this.applyGravity();
    }

    /**
     * Preloads every sprite sheet used by the character.
     * @returns {void}
     */
    loadAllImages() {
        this.loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
    } 


    /**
     * Starts the recurring intervals that drive movement and animation.
     * @returns {void}
     */
    animate() {
        setStopableInterval(() => this.movment(), 100 / 12);
        setStopableInterval(() => this.playPepeAnimation(), 1000 / 12);
    }

    /**
     * Reads keyboard/mobile input, moves the character accordingly, updates
     * idle tracking, and re-centers the camera on the character. Movement
     * input is ignored while recovering from a hit (knockback slide + landing).
     * @returns {void}
     */
    movment() {
        if (!this.isGameStarted()) return;
        if (this.isRecoveringFromHit) {
            this.updateRecoveryState();
            this.updateCamera();
            return;
        }
        const moved = this.processMovementInput();
        this.updateIdleTicks(moved);
        this.updateCamera();
    }

    /**
     * Ends the post-hit recovery once the knockback slide has finished and
     * the character has landed back on the ground.
     * @returns {void}
     */
    updateRecoveryState() {
        if (!this.isKnockedBack && !this.aboveGround()) {
            this.isRecoveringFromHit = false;
        }
    }

    /**
     * Handles horizontal, jump, and throw input for the current tick.
     * @returns {boolean} True if the character moved, jumped, or threw a bottle.
     */
    processMovementInput() {
        const movedHorizontally = this.handleHorizontalInput();
        const jumped = this.handleJumpInput();
        return movedHorizontally || jumped || this.isThrowing();
    }

    /**
     * Moves the character left/right based on held keys/mobile buttons,
     * clamped to the level bounds.
     * @returns {boolean} True if the character moved.
     */
    handleHorizontalInput() {
        let moved = false;
        if ((this.world.keyboard.RIGHT || this.world.keyboard.mobileRight) && this.x < this.world.level.level_end_x) {
            this.moveRight();
            this.otherDirection = false;
            moved = true;
        }
        if ((this.world.keyboard.LEFT || this.world.keyboard.mobileLeft) && this.x > -this.world.level.level_end_x) {
            this.moveLeft();
            this.otherDirection = true;
            moved = true;
        }
        return moved;
    }

    /**
     * Starts a jump if the jump key/button is held and the character is grounded.
     * @returns {boolean} True if a jump was triggered.
     */
    handleJumpInput() {
        if ((this.world.keyboard.SPACE || this.world.keyboard.UP || this.world.keyboard.mobileUp) && !this.aboveGround()) {
            this.jump();
            soundManager.playJumpSound();
            return true;
        }
        return false;
    }

    /**
     * @returns {boolean} True if the throw key/button is held and a bottle is available.
     */
    isThrowing() {
        return this.world.keyboard.D && this.world.bottleBar.percentage > 0;
    }

    /**
     * Resets or increments the idle tick counter based on whether the
     * character moved or is airborne this tick.
     * @param {boolean} moved - Whether the character moved this tick.
     * @returns {void}
     */
    updateIdleTicks(moved) {
        if (moved || this.aboveGround()) {
            this.idleTicks = 0;
        } else {
            this.idleTicks++;
        }
    }

    /**
     * Re-centers the camera horizontally on the character.
     * @returns {void}
     */
    updateCamera() {
        this.world.camera_x = -this.x + 150;
    }

    /**
     * Picks and plays the correct animation for the character's current state
     * (dead, hurt, jumping, walking, long-idle, or idle).
     * @returns {void}
     */
    playPepeAnimation() {
        if (!this.isGameStarted()) return;
        if (this.isDead()) {
            this.playAnimation(this.IMAGES_DEAD);
        } else if (this.isHurt()) {
            this.playHurtAnimation();
        } else if (this.aboveGround()) {
            this.playJumpAnimation();
        } else {
            this.currentJumpImage = 0;
            this.jumpImageTick = 0;
            this.isWalking() ? this.playAnimation(this.IMAGES_WALKING) 
            : this.longStanding() ? this.playAnimation(this.IMAGES_LONG_IDLE)
            : this.playAnimation(this.IMAGES_IDLE);
        }
    }

    /**
     * Renders the appropriate jump sprite frame based on rising/peak/falling
     * vertical speed, animating through the jump sprite sheet.
     * @returns {void}
     */
    playJumpAnimation() {
        const i = this.speedY > 2 ? this.advanceRisingFrame()
            : this.speedY >= -2 ? this.getPeakFrame()
                : this.advanceFallingFrame();
        this.img = this.imageCache[this.IMAGES_JUMPING[i]];
    }

    /**
     * @returns {number} Next frame index for the rising (take-off) phase.
     */
    advanceRisingFrame() {
        return this.advanceJumpFrame(0, 3, 2);
    }

    /**
     * @returns {number} Frame index for the peak (top of the jump) phase.
     */
    getPeakFrame() {
        this.jumpImageTick = 0;
        return 4;
    }

    /**
     * @returns {number} Next frame index for the falling (landing) phase.
     */
    advanceFallingFrame() {
        return this.advanceJumpFrame(5, 8, 3);
    }

    /**
     * Advances a frame counter within [minIndex, maxIndex], holding each
     * frame for ticksPerFrame calls before moving to the next.
     * @param {number} minIndex - First frame index of this phase.
     * @param {number} maxIndex - Last frame index of this phase.
     * @param {number} ticksPerFrame - Calls to wait before advancing the frame.
     * @returns {number} The current frame index.
     */
    advanceJumpFrame(minIndex, maxIndex, ticksPerFrame) {
        if (this.currentJumpImage < minIndex || this.currentJumpImage > maxIndex) {
            this.currentJumpImage = minIndex;
            this.jumpImageTick = 0;
        }
        const index = this.currentJumpImage;
        this.jumpImageTick++;
        if (this.jumpImageTick >= ticksPerFrame) {
            if (this.currentJumpImage < maxIndex) this.currentJumpImage++;
            this.jumpImageTick = 0;
        }
        return index;
    }

    /**
     * Starts a jump and resets the jump animation frame counters.
     * @param {number} [height=20] - Initial vertical speed applied for the jump.
     * @returns {void}
     */
    jump(height = 20) {
        super.jump(height);
        this.currentJumpImage = 0;
        this.jumpImageTick = 0;
    }

    /**
     * Determines whether the character is falling onto the top portion of an
     * enemy (a valid stomp) rather than hitting it from the side.
     * @param {MovableObject} object - The enemy to check against.
     * @returns {boolean} True if the character counts as being above the enemy.
     */
    isAbove(object) {
        const characterBottom = this.y + this.height - this.offset.bottom;
        const enemyOffset = object.offset ?? { top: 0, bottom: 0 };
        const enemyTop = object.y + enemyOffset.top;
        const enemyBottom = object.y + object.height - enemyOffset.bottom;
        const stompTolerance = (enemyBottom - enemyTop) * 0.5;
        return characterBottom < enemyTop + stompTolerance;
    }

    /**
     * @returns {boolean} True if a left/right movement key is currently held.
     */
    isWalking() {
        return this.world?.keyboard.RIGHT || this.world?.keyboard.LEFT ||
            this.world?.keyboard.mobileRight || this.world?.keyboard.mobileLeft;
    }

    /**
     * @returns {boolean} True if the character has been idle long enough to
     * switch to the long-idle animation.
     */
    longStanding() {
        return this.idleTicks > this.LONG_IDLE_THRESHOLD;
    }
}