class Chicken extends MovableObject {
;
    y = 325;
    width = 100;
    height = 100;
    Chicken_Walk = [
        './img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];
    currentImage = 0;

    constructor() {
        super();
        this.loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        this.loadImages(this.Chicken_Walk);

        this.x = 200 + Math.random() * 500;
        this.speed = 0.15 + Math.random() * 0.25;

        this.animate();
    }

    animate() {
        
        setInterval(() => {
            if (!this.world?.gameStarted) return;
            this.moveLeft();
        }, 100 / 12);

        setInterval(() => {
            if (!this.world?.gameStarted) return;
            this.playAnimation(this.Chicken_Walk);
        }, 100);
    }

}