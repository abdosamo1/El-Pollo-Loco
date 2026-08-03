/** A slow-moving decorative background cloud. */
class Cloud extends MovableObject {
    x = 0;
    y = 20;
    width = 720 * 2;
    height = 300;
    speed = 0.15;

    /** @param {number} [startX=0] - Starting horizontal position. */
    constructor(startX = 0) {
        super();
        this.x = startX;
        this.loadImage('img/5_background/layers/4_clouds/full.png');
        this.animate();
    }

    /**
     * Starts the recurring interval that drives the cloud's leftward drift.
     * @returns {void}
     */
    animate() {
        setStopableInterval(() => this.moveClouds(), 100 / 12);
    }

    /**
     * Moves the cloud left if the game has started.
     * @returns {void}
     */
    moveClouds() {
        if (!this.isMovementActive()) return;
        this.moveLeft();
    }
}