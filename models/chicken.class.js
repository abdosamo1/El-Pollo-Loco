/** A regular walking chicken enemy that patrols back and forth. */
class Chicken extends MovableObject {
    y = 325;
    width = 100;
    height = 100;
    offset = { top: 10, left: 8, right: 8, bottom: 5 };
    WALK_IMAGES = [
        './assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        './assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        './assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];
    DEAD_IMAGES = [
        './assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];
    currentImage = 0;

    /**
     * creates a new Chicken instance with a random starting position and patrol behavior.
     * @param {number} [startX] - Starting horizontal position; also the right
     * patrol boundary.
     */
    constructor(startX = 500 + Math.random() * 500) {
        super();
        this.loadImage(this.WALK_IMAGES[0]);
        this.loadImages(this.WALK_IMAGES);
        this.loadImages(this.DEAD_IMAGES);
        this.fullscreenY = 500;
        this.x = startX;
        this.patrolStartX = startX;
        this.movingLeft = true;
        this.speed = 0.5;
        this.animate();
    }

    /**
     * Starts the recurring intervals that drive patrol movement and animation.
     * @returns {void}
     */
    animate() {
        setStopableInterval(() => this.chickenMovement(), 100 / 12);
        setStopableInterval(() => this.playChickenAnimation(), 100);
    }

    /**
     * Moves the chicken left/right between its patrol bounds, flipping
     * direction at the edges. No-op if the game hasn't started or it's dead.
     * @returns {void}
     */
    chickenMovement() {
        if (!this.isMovementActive() || this.isDead()) return;

        if ((this.movingLeft && this.x <= -50) || (!this.movingLeft && this.x >= this.patrolStartX)) {
            this.movingLeft = !this.movingLeft;
        }

        if (this.movingLeft) {
            this.otherDirection = false;
            this.moveLeft();
        } else {
            this.otherDirection = true;
            this.moveRight();
        }
    }

    /**
     * Plays the death animation if dead, otherwise the walking animation.
     * @returns {void}
     */
    playChickenAnimation() {
        if (!this.world?.gameStarted) return;
        if (this.world.characterDied && !this.isDead()) return;
        this.isDead() ? this.playAnimation(this.DEAD_IMAGES) : this.playAnimation(this.WALK_IMAGES);
    }

}