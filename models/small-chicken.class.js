/** A smaller, faster-hopping chicken variant that also bounces on the ground. */
class SmallChicken extends Chicken {
    groundY = 375;
    y = 375;
    width = 50;
    height = 50;
    offset = { top: 5, left: 4, right: 4, bottom: 3 };
    currentImage = 0;

    WALK_IMAGES = [
        './assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    DEAD_IMAGES = [
        './assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png'
    ];


    /**
     *  creates a new SmallChicken instance with a random starting position and patrol behavior.
     *  @param {number} [startX] - Starting horizontal position. */
    constructor(startX = 600 + Math.random() * 600) {
        super(startX);
        this.loadImage(this.WALK_IMAGES[0]);
        this.loadImages(this.WALK_IMAGES);
        this.loadImages(this.DEAD_IMAGES);
        this.applyGravity();
    }

    /**
     * Extends the base patrol animation with a repeated small hop.
     * @returns {void}
     */
    animate() {
        super.animate();
        setStopableInterval(() => {
            if (!this.isMovementActive() || this.isDead()) return;
            if (!this.aboveGround()) {
                this.jump(5);
            }
        }, 100 / 12);
    }

    /**
     * Checks if the small chicken is above its (lower) ground level.
     * @returns {boolean} True if the small chicken is above its (lower) ground level.
     */
    aboveGround() {
        return this.y < this.groundY;
    }

}