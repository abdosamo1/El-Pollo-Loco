class SmallChicken extends MovableObject {
    groundY = 375;
    y = 375;
    width = 50;
    height = 50;
    SmallChicken_Walk = [
        './img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];
    currentImage = 0;

    constructor() {
        super();
        this.loadImage('img/3_enemies_chicken/chicken_small/1_walk/1_w.png');
        this.loadImages(this.SmallChicken_Walk);
        this.x = 200 + Math.random() * 500;
        this.speed = 0.15 + Math.random() * 0.25;

        this.animate();
        this.applyGravity();
    }

    animate() {
        
        setStopableInterval(() => {
            if (!this.world?.gameStarted) return;
            this.moveLeft();
        }, 100 / 12);

        setStopableInterval(() => {
            if (!this.world?.gameStarted) return;
            if (!this.aboveGround()) {
                this.jump(5);
            }
        }, 100 / 12);

        setStopableInterval(() => {
            if (!this.world?.gameStarted) return;
            this.playAnimation(this.SmallChicken_Walk);
        }, 100);
    }

    aboveGround() {
        return this.y < this.groundY;
    }

}