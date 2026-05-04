class SmallChicken extends MovableObject {
    groundY = 375;
    y = 375;
    width = 50;
    height = 50;

    SMALLCHICKEN_WALK = [
        './img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];
    
    SMALLCHICKEN_DEAD = [
        './img/3_enemies_chicken/chicken_small/2_dead/dead.png'
    ];


    currentImage = 0;

    constructor(startX = 600 + Math.random() * 600) {
        super();
        this.loadImage('img/3_enemies_chicken/chicken_small/1_walk/1_w.png');
        this.loadImages(this.SMALLCHICKEN_WALK);
        this.loadImages(this.SMALLCHICKEN_DEAD);
        this.x = startX;
        this.speed = 0.5;

        this.animate();
        this.applyGravity();
    }

    animate() {

        setStopableInterval(() => {
            if (!this.world?.gameStarted || this.isDead()) return;
            this.moveLeft();
        }, 100 / 12);

        setStopableInterval(() => {
            if (!this.world?.gameStarted || this.isDead()) return;
            if (!this.aboveGround()) {
                this.jump(5);
            }
        }, 100 / 12);

        setStopableInterval(() => {
            if (!this.world?.gameStarted) return;
            this.playSmallChickenAnimation();
        }, 100);
    }

    playSmallChickenAnimation() {
        this.isDead() ? this.playAnimation(this.SMALLCHICKEN_DEAD) : this.playAnimation(this.SMALLCHICKEN_WALK);
    }

    aboveGround() {
        return this.y < this.groundY;
    }

}