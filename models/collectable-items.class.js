/** A collectable pickup: a coin, a ground/dropped bottle, or the base class for {@link ThrowableObject}. */
class CollectableItems extends MovableObject {

    coins = [
        './assets/img/8_coin/coin_1.png',
        './assets/img/8_coin/coin_2.png'
    ];

    salsaBottles = [
        './assets/img/6_salsa_bottle/salsa_bottle.png',
        './assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
        './assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png',
    ];

    bottleRotation = [
        './assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        './assets/img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        './assets/img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        './assets/img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];



    /**
     * creates a new CollectableItems instance at the specified position,
     *  with optional type and drop behavior.
     * @param {number} x - Horizontal position.
     * @param {number} y - Vertical position.
     * @param {boolean} [isBottle=false] - True for a bottle pickup, false for a coin.
     * @param {boolean} [isDropped=false] - True if this item was dropped by a
     * defeated enemy and should fall/bounce into place before becoming collectable.
     */
    constructor(x, y, isBottle = false, isDropped = false) {
        super();
        this.x = x;
        this.y = y;
        this.width = 90;
        this.height = 90;
        this.offset = { top: 15, left: 20, right: 20, bottom: 12 };
        this.isBottle = isBottle;
        this.isDropped = isDropped;
        this.canBeCollected = !isDropped;
        this.currentImage = 0;
        this.setupBehavior();
    }

    /**
     * Loads the correct sprites and starts the matching animation/drop behavior.
     * @returns {void}
     */
    setupBehavior() {
        this.isBottle ? this.loadBottleImages() : this.loadCoinsImages();
        if (!this.isBottle && !this.isDropped) {
            this.animate();
        }
        if (this.isDropped) {
            this.startMovement();
        }
    }

    /**
     * Starts the recurring interval that cycles the pickup's idle animation.
     * @returns {void}
     */
    animate() {
        setStopableInterval(() => {
            this.playAnimation(this.isBottle ? this.bottleRotation : this.coins);
        }, 200);
    }

    /**
     * Starts a dropped item's fall: applies gravity/drift and keeps animating
     * until it lands.
     * @returns {void}
     */
    startMovement() {
        this.speedY = 10;
        this.speed = 5;
        this.acceleration = 0.5;
        this.animate();
        const movementInterval = setStopableInterval(() => this.updateDroppedItem(movementInterval), 1000 / 60);
    }

    /**
     * Per-tick physics update for a falling dropped item.
     * @param {number} intervalId - Id of the interval driving this update, cleared on landing.
     * @returns {void}
     */
    updateDroppedItem(intervalId) {
        this.moveRight();
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
        if (this.hasLanded()) {
            this.finishLanding(intervalId);
        }
    }

    /**
     * Checks if the dropped item has reached the ground.
     * @returns {boolean} True if the dropped item has reached the ground.
     */
    hasLanded() {
        return this.speedY <= 0 && this.y >= 350;
    }

    /**
     * Snaps a dropped item to its resting position and marks it collectable.
     * @param {number} intervalId - Id of the falling-physics interval to stop.
     * @returns {void}
     */
    finishLanding(intervalId) {
        clearInterval(intervalId);
        this.speed = 0;
        this.speedY = 0;
        this.y = 350;
        this.canBeCollected = true;
    }

    /**
     * Marks the item as collected by zeroing its energy (removed by the world).
     * @returns {void}
     */
    getCollected() {
        this.energy = 0;
    }

    /**
     * Loads bottle sprites, picking a random ground-bottle variant when placed on the ground.
     * @returns {void}
     */
    loadBottleImages() {
        this.loadImages(this.salsaBottles);
        this.y === 330 ? (() => {
            const groundIndex = Math.random() < 0.5 ? 1 : 2;
            this.loadImage(this.salsaBottles[groundIndex]);
        })() : this.loadImage(this.salsaBottles[0]);
    }

    /**
     * Loads coin sprites.
     * @returns {void}
     */
    loadCoinsImages() {
        this.loadImages(this.coins);
        this.loadImage(this.coins[0]);
    }
}