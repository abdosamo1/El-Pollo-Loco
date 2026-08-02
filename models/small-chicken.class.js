/** A smaller, faster-hopping chicken variant that also bounces on the ground. */
class SmallChicken extends Chicken {
    groundY = 375;
    y = 375;
    width = 50;
    height = 50;
    offset = { top: 5, left: 4, right: 4, bottom: 3 };

    WALK_IMAGES = [
        './img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    DEAD_IMAGES = [
        './img/3_enemies_chicken/chicken_small/2_dead/dead.png'
    ];

    currentImage = 0;

    /** @param {number} [startX] - Starting horizontal position. */
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
            if (!this.world?.gameStarted || this.isDead()) return;
            if (!this.aboveGround()) {
                this.jump(5);
            }
        }, 100 / 12);
    }

    /**
     * @returns {boolean} True if the small chicken is above its (lower) ground level.
     */
    aboveGround() {
        return this.y < this.groundY;
    }

}