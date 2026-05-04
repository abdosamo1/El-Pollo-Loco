class Endboss extends MovableObject {
    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ]
    currentImage = 0;

    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.x = 4500;
        this.width = 300;
        this.height = 400;
        this.y = 50;
        this.speed = 0.5;
        this.animate();
    }
    animate() {
        setStopableInterval(() => this.playEndBossAnimations(), 200);
        setStopableInterval(() => this.moveEndBoss(), 100 / 12);
    }

    playEndBossAnimations() {
        if (!this.isGameStarted()) return;
        this.playAnimation(this.IMAGES_WALKING);
    }

    moveEndBoss() {
        if (!this.world?.gameStarted || !this.world.character) return;
        if (this.x > this.world.character.x) {
            this.moveLeft();
            this.otherDirection = false;
        } else {
            this.moveRight();
            this.otherDirection = true;
        }
    }
}