class Endboss extends MovableObject {
    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ]

    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ]

    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ]

    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ]

    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ]
    currentImage = 0;

    constructor(startX) {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.x = startX;
        this.width = 300;
        this.height = 400;
        this.energy = 100;
        this.y = 50;
        this.speed = 0.5;
        this.isAttacking = false;
        this.isAlert = false;
        this.animate();
    }
    animate() {
        setStopableInterval(() => this.playEndBossAnimations(), 200);
        setStopableInterval(() => this.moveEndBoss(), 100 / 12);
    }

    playEndBossAnimations() {
        if (!this.isGameStarted()) return;
        
        // Update state basierend auf Charakter-Distanz
        this.updateState();
        
        if (this.isHurt()) {
            this.playAnimation(this.IMAGES_HURT);
        } else if (this.isDead()) {
            this.win();
        } else if (this.isAttacking) {
            this.playAnimation(this.IMAGES_ATTACK);
        } else if (this.isAlert) {
            this.playAnimation(this.IMAGES_ALERT);
        } else {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }
    
    updateState() {
        if (!this.world.character) return;
        const distance = Math.abs(this.world.character.x - this.x);
        
        if (distance < 200) {
            this.isAttacking = true;
            this.isAlert = false;
        } else if (distance < 300) {
            this.isAttacking = false;
            this.isAlert = true;
        } else {
            this.isAttacking = false;
            this.isAlert = false;
        }
    }

    moveEndBoss() {
        if (!this.world?.gameStarted || !this.world.character || this.isAttacking) return;
        if (this.x > this.world.character.x) {
            this.moveLeft();
            this.otherDirection = false;
        } else {
            this.moveRight();
            this.otherDirection = true;
        }
    }
}