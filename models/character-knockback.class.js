/** Hit-recovery behavior mixed into {@link Character}: knockback slide, hop, and hurt animation. */
Object.assign(Character.prototype, {

    /**
     * Starts a hit recovery: a short hop combined with a smooth knockback
     * slide away from whatever hit the character, locking out movement
     * input until the slide finishes and the character has landed. The
     * endboss knocks Pepe higher and further back than regular enemies.
     * @param {MovableObject} source - The enemy/object the character was hit by.
     * @returns {void}
     */
    applyKnockback(source) {
        this.isRecoveringFromHit = true;
        this.isKnockedBack = true;
        this.knockbackDirection = this.x < source.x ? -1 : 1;
        this.currentHurtImage = 0;
        const { distance, jumpHeight } = this.resolveKnockbackStrength(source);
        this.jump(jumpHeight);
        this.startKnockbackSlide(distance);
    },

    /**
     * @param {MovableObject} source - The enemy/object the character was hit by.
     * @returns {{distance: number, jumpHeight: number}} The knockback slide
     * distance and hop height to use for this hit.
     */
    resolveKnockbackStrength(source) {
        return source instanceof Endboss
            ? { distance: this.ENDBOSS_KNOCKBACK_DISTANCE, jumpHeight: this.ENDBOSS_KNOCKBACK_JUMP_HEIGHT }
            : { distance: this.KNOCKBACK_DISTANCE, jumpHeight: this.KNOCKBACK_JUMP_HEIGHT };
    },

    /**
     * Slides the character back in small steps at the same tick rate as
     * gravity (instead of a few large jumps), over {@link Character#KNOCKBACK_DURATION}ms,
     * for a smooth, non-stuttering motion.
     * @param {number} distance - Total horizontal distance to cover.
     * @returns {void}
     */
    startKnockbackSlide(distance) {
        const totalSteps = Math.round(this.KNOCKBACK_DURATION / this.KNOCKBACK_TICK_DELAY);
        const stepDistance = distance / totalSteps;
        let stepsLeft = totalSteps;
        const intervalId = setStopableInterval(() => {
            this.x += this.knockbackDirection * stepDistance;
            stepsLeft--;
            if (stepsLeft <= 0) {
                clearInterval(intervalId);
                this.isKnockedBack = false;
            }
        }, this.KNOCKBACK_TICK_DELAY);
    },

    /**
     * Advances through the hurt sprite frames once, then holds the last
     * frame instead of looping (looping made the hurt pose flicker for the
     * whole knockback duration).
     * @returns {void}
     */
    playHurtAnimation() {
        const lastIndex = this.IMAGES_HURT.length - 1;
        if (this.currentHurtImage < lastIndex) {
            this.currentHurtImage++;
        }
        this.img = this.imageCache[this.IMAGES_HURT[this.currentHurtImage]];
    },

    /**
     * @returns {boolean} True while recovering from a hit (knockback slide +
     * landing), overriding the base timer-based hurt window.
     */
    isHurt() {
        return this.isRecoveringFromHit;
    }

});
