class Character extends MovableObject {
    x = 50;
    y = 125;
    width = 150;
    height = 300;
    speed = 3;

    IMAGES_WALKING = [
        './img/2_character_pepe/2_walk/W-21.png',
        './img/2_character_pepe/2_walk/W-22.png',
        './img/2_character_pepe/2_walk/W-23.png',
        './img/2_character_pepe/2_walk/W-24.png',
        './img/2_character_pepe/2_walk/W-25.png',
        './img/2_character_pepe/2_walk/W-26.png'
    ];
    IMAGES_JUMPING = [
        './img/2_character_pepe/3_jump/J-31.png',
        './img/2_character_pepe/3_jump/J-32.png',
        './img/2_character_pepe/3_jump/J-33.png',
        './img/2_character_pepe/3_jump/J-34.png',
        './img/2_character_pepe/3_jump/J-35.png',
        './img/2_character_pepe/3_jump/J-36.png',
        './img/2_character_pepe/3_jump/J-37.png',
        './img/2_character_pepe/3_jump/J-38.png',
        './img/2_character_pepe/3_jump/J-39.png'
    ];
    IMAGES_DEAD = [
        './img/2_character_pepe/5_dead/D-51.png',
        './img/2_character_pepe/5_dead/D-52.png',
        './img/2_character_pepe/5_dead/D-53.png',
        './img/2_character_pepe/5_dead/D-54.png',
        './img/2_character_pepe/5_dead/D-55.png',
        './img/2_character_pepe/5_dead/D-56.png',
        './img/2_character_pepe/5_dead/D-57.png'
    ];
    IMAGES_HURT = [
        './img/2_character_pepe/4_hurt/H-41.png',
        './img/2_character_pepe/4_hurt/H-42.png',
        './img/2_character_pepe/4_hurt/H-43.png'
    ];    

    IMAGES_IDLE = [
        './img/2_character_pepe/1_idle/idle/I-1.png',
        './img/2_character_pepe/1_idle/idle/I-2.png',
        './img/2_character_pepe/1_idle/idle/I-3.png',
        './img/2_character_pepe/1_idle/idle/I-4.png',
        './img/2_character_pepe/1_idle/idle/I-5.png',
        './img/2_character_pepe/1_idle/idle/I-6.png',
        './img/2_character_pepe/1_idle/idle/I-7.png',
        './img/2_character_pepe/1_idle/idle/I-8.png',
        './img/2_character_pepe/1_idle/idle/I-9.png',
        './img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    IMAGES_LONG_IDLE = [
        './img/2_character_pepe/1_idle/long_idle/I-11.png',
        './img/2_character_pepe/1_idle/long_idle/I-12.png',
        './img/2_character_pepe/1_idle/long_idle/I-13.png',
        './img/2_character_pepe/1_idle/long_idle/I-14.png',
        './img/2_character_pepe/1_idle/long_idle/I-15.png',
        './img/2_character_pepe/1_idle/long_idle/I-16.png',
        './img/2_character_pepe/1_idle/long_idle/I-17.png',
        './img/2_character_pepe/1_idle/long_idle/I-18.png',
        './img/2_character_pepe/1_idle/long_idle/I-19.png',
        './img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];

    world;
    idleTicks = 0;
    LONG_IDLE_THRESHOLD = 500;

    constructor() {
        super();
        this.loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.animate();
        this.applyGravity();
    }

    animate() {
        setStopableInterval(() => this.movment(), 100 / 12);
        setStopableInterval(() => this.playPepeAnimation(), 1000 / 12);
    }

    movment() {
        if (!this.isGameStarted()) return;
        let moved = false;
        if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
            this.moveRight();
            this.otherDirection = false;
            moved = true;
        }
        if (this.world.keyboard.LEFT && this.x > -this.world.level.level_end_x) {
            this.moveLeft();
            this.otherDirection = true;
            moved = true;
        }
        if (this.world.keyboard.SPACE && !this.aboveGround()) {
            this.jump();
            moved = true;
        }
        if (moved || this.aboveGround()) {
            this.idleTicks = 0;
        } else {
            this.idleTicks++;
        }
        this.world.camera_x = -this.x + 100;
    }

    playPepeAnimation() {
        if (!this.isGameStarted()) return;
        if (this.isDead()) {
            this.playAnimation(this.IMAGES_DEAD);
        } else if (this.isHurt()) {
            this.playAnimation(this.IMAGES_HURT);
        } else if (this.aboveGround()) {
            this.playAnimation(this.IMAGES_JUMPING);
        } else {
            this.isWalking() ? this.playAnimation(this.IMAGES_WALKING) 
            : this.longStanding() ? this.playAnimation(this.IMAGES_LONG_IDLE)
            : this.playAnimation(this.IMAGES_IDLE);
        }
    }

    isAbove(object) {
        return this.y + this.height < object.y + 30;
    }

    isWalking() {
        return this.world?.keyboard.RIGHT || this.world?.keyboard.LEFT;
    }

    longStanding() {
        return this.idleTicks > this.LONG_IDLE_THRESHOLD;
    }
}