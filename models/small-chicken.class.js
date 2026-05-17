class SmallChicken extends Chicken {
    groundY = 375;
    y = 375;
    width = 50;
    height = 50;

    WALK_IMAGES = [
        './img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    DEAD_IMAGES = [
        './img/3_enemies_chicken/chicken_small/2_dead/dead.png'
    ];

    currentImage = 0;

    constructor(startX = 600 + Math.random() * 600) {
        super(startX);
        this.loadImage(this.WALK_IMAGES[0]);
        this.loadImages(this.WALK_IMAGES);
        this.loadImages(this.DEAD_IMAGES);
        this.applyGravity();
    }

    animate() {
        super.animate();
        setStopableInterval(() => {
            if (!this.world?.gameStarted || this.isDead()) return;
            if (!this.aboveGround()) {
                this.jump(5);
            }
        }, 100 / 12);
    }

    aboveGround() {
        return this.y < this.groundY;
    }

}