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
    Chicken_Dead = [
        './img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];
    currentImage = 0;

    constructor(startX = 500 + Math.random() * 500) {
        super();
        this.loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        this.loadImages(this.Chicken_Walk);
        this.loadImages(this.Chicken_Dead);

        this.x = startX;
        this.speed = 0.5;

        this.animate();
    }

    animate() {

        setStopableInterval(() => this.chickenMovement(), 100 / 12);

        setStopableInterval(() => this.playChickenAnimation(), 100);
    }

    chickenMovement() {
        if (!this.world?.gameStarted || this.isDead()) return;
        this.moveLeft();
    }

    playChickenAnimation() {
        if (!this.world?.gameStarted) return;
        this.isDead() ? this.playAnimation(this.Chicken_Dead) : this.playAnimation(this.Chicken_Walk);
    }

}