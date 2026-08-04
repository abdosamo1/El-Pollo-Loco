/** A thrown salsa bottle: flies in an arc, then splashes on impact or landing. */
class ThrowableObject extends CollectableItems {

    bottleSplash = [
        './assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        './assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        './assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        './assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        './assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        './assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    /**
     * Creates a new ThrowableObject instance at the specified position, 
     * with an optional throw direction.
     * @param {number} x - Starting horizontal position.
     * @param {number} y - Starting vertical position.
     * @param {boolean} [direction=false] - True to throw left, false to throw right.
     */
    constructor(x, y, direction = false) {
        super();
        this.loadImage(this.salsaBottles[0]);
        this.loadImages(this.bottleRotation);
        this.loadImages(this.bottleSplash);
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 100;
        this.offset = { top: 15, left: 20, right: 20, bottom: 10 };
        this.otherDirection = direction;
        this.isSplashing = false;
        this.splashDone = false;
        this.throw();
    }

    /**
     * Launches the bottle: applies gravity, moves it horizontally, and
     * cycles through the rotation/splash animation frames.
     * @returns {void}
     */
    throw() {
        const direction = this.otherDirection;
        this.speedY = 13;
        this.applyGravity();
        this.moveInterval = setStopableInterval(() => {
            if (!this.isMovementActive()) return;
            if (this.isSplashing) return;
            direction ? this.x -= 3 : this.x += 3;
        }, 10);

        this.animationInterval = setStopableInterval(() => {
            this.playAnimation(this.isSplashing ? this.bottleSplash : this.bottleRotation);
        }, 100);
    }

    /**
     * Stops horizontal movement and starts the splash animation; the bottle
     * is marked done (removable) after the splash finishes playing.
     * @returns {void}
     */
    startSplash() {
        if (this.isSplashing) return;
        this.isSplashing = true;
        this.speed = 0;
        this.speedY = 0;
        soundManager.playBottleSplashSound();
        clearInterval(this.moveInterval);
        setTimeout(() => {
            this.splashDone = true;
        }, 1000);
    }

    /**
     * Checks if the bottle is still airborne (not yet splashed).
     * @returns {boolean} True while the bottle hasn't splashed yet (keeps it airborne).
     */
    aboveGround() {
        return !this.isSplashing;
    }
}