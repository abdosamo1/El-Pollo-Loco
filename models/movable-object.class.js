/** Base class for drawable objects that move, collide, take damage, and fall under gravity. */
class MovableObject extends DrawableObject {
    
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 1;
    lastHit = 0;
    energy = 1000;
    groundY = 125;
    offset = { top: 0, left: 0, right: 0, bottom: 0 };
    /** Seconds an object stays hurt/invincible after being hit; override per subclass. */
    HURT_DURATION = 1.5;

    /**
     * Checks whether this object's offset-adjusted hitbox overlaps another object's.
     * @param {MovableObject} object - The other object to test against.
     * @returns {boolean} True if the hitboxes overlap.
     */
    isColliding(object) {
        const thisOffset = this.offset;
        const objectOffset = object.offset ?? { top: 0, left: 0, right: 0, bottom: 0 };
        return this.x + thisOffset.left < object.x + object.width - objectOffset.right &&
            this.x + this.width - thisOffset.right > object.x + objectOffset.left &&
            this.y + thisOffset.top < object.y + object.height - objectOffset.bottom &&
            this.y + this.height - thisOffset.bottom > object.y + objectOffset.top;
    }

    /**
     * Applies damage unless the object is still in its hurt-invincibility window.
     * @param {number} damge - Amount of energy to subtract.
     * @returns {boolean} True if the damage was applied (was not already hurt).
     */
    hit(damge){
        if (this.isHurt()) return false;
        this.energy -= damge;
        this.energy < 6 ? this.energy = 0 :
            this.lastHit = new Date().getTime();
        return true;
    }

    /**
     * @returns {boolean} True if the object was hit within its hurt duration.
     */
    isHurt(){
        let timepassed = new Date().getTime() - this.lastHit; // difference in ms
        timepassed = timepassed / 1000; // difference in s
        return timepassed < this.HURT_DURATION;
    }

    /**
     * @returns {boolean} True if the object's energy has reached zero.
     */
    isDead(){
        return this.energy == 0;
    }

    /**
     * Starts a repeating interval that simulates gravity: while airborne or
     * still rising, moves the object vertically by its current speed and
     * decelerates it, clamping to the ground once it lands.
     * @returns {void}
     */
    applyGravity() {
        setInterval(() => {
            if (!this.isGameStarted()) return;
            if (this.aboveGround() || this.speedY > 0) {
                let nextY = this.y - this.speedY;
                if (nextY > this.groundY && !(this instanceof ThrowableObject)) {
                    this.y = this.groundY;
                    this.speedY = 0;
                } else {
                    this.y = nextY;
                    this.speedY -= this.acceleration;
                }
            }
        }, 1000 / 25);
    }

    /**
     * @returns {boolean} True if the object is above its resting ground level
     * (always true for {@link ThrowableObject}, which flies until it splashes).
     */
    aboveGround() {
        return this instanceof ThrowableObject ? true : this.y < this.groundY;
    }

    /**
     * @returns {boolean} True if this object's world has started the game.
     */
    isGameStarted() {
        return this.world?.gameStarted ?? false;
    }

    /**
     * Advances and renders the next frame of a looping image animation.
     * @param {string[]} arr - Array of image paths to cycle through.
     * @returns {void}
     */
    playAnimation(arr) {
        let i = this.currentImage % arr.length;
        let path = arr[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /** Moves the object one step to the right by its current speed. @returns {void} */
    moveRight() {
        this.x += this.speed;
    }

    /** Moves the object one step to the left by its current speed. @returns {void} */
    moveLeft() {
        this.x -= this.speed;
    }

    /**
     * Starts a jump by setting the initial upward vertical speed.
     * @param {number} [height=20] - Initial vertical speed applied for the jump.
     * @returns {void}
     */
    jump(height = 20) {
        this.speedY = height;
    }
}   