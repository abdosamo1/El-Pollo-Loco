class Chicken extends MovableObject {
    y = 325;
    width = 100;
    height = 100;
    WALK_IMAGES = [
        './img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];
    DEAD_IMAGES = [
        './img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];
    currentImage = 0;

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

    animate() {
        setStopableInterval(() => this.chickenMovement(), 100 / 12);
        setStopableInterval(() => this.playChickenAnimation(), 100);
    }

    chickenMovement() {
        if (!this.world?.gameStarted || this.isDead()) return;

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

    playChickenAnimation() {
        if (!this.world?.gameStarted) return;
        this.isDead() ? this.playAnimation(this.DEAD_IMAGES) : this.playAnimation(this.WALK_IMAGES);
    }

}