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
        this.startX = startX;
        this.x = startX;
        this.fullscreenY = 450;
        this.width = 300;
        this.height = 400;
        this.energy = 100;
        this.y = 50;
        this.speed = 0.5;
        this.isAttacking = false;
        this.isAlert = false;
        this.attackPhase = 'idle';
        this.attackTimer = 0;
        this.animate();
    }

    animate() {
        setStopableInterval(() => this.playEndBossAnimations(), 200);
        setStopableInterval(() => this.moveEndBoss(), 100 / 12);
    }

    playEndBossAnimations() {
        if (!this.isGameStarted()) return;

        this.updateState();

        this.isHurt() ? this.playAnimation(this.IMAGES_HURT) :
            this.isDead() ? this.playAnimation(this.IMAGES_DEAD) :
                this.isAttacking ? this.playAnimation(this.IMAGES_ATTACK) :
                    this.isAlert ? this.playAnimation(this.IMAGES_ALERT) : this.playAnimation(this.IMAGES_WALKING);
    }

    updateState() {
        if (!this.world.character || this.attackPhase !== 'idle' || this.isHurt() || this.isDead()) return;
        const distance = Math.abs(this.world.character.x - this.x);

        distance < 200 ? this.startAttack() :
            distance < 300 ? this.startAlert() : this.startWalking();
    }

    startAttack() {
        if (this.attackPhase !== 'idle') return;
        this.attackPhase = 'attacking';
        this.isAttacking = true;
        this.isAlert = false;
        this.attackTimer = 0;
        this.attackDirection = this.world.character.x > this.x ? 1 : -1;
        this.attackTargetX = this.x + this.attackDirection * 40;
        this.alertTargetX = this.world.character.x - this.attackDirection * 300;
        this.startY = this.y;
    }

    startAlert() {
        this.isAlert = true,
            this.isAttacking = false,
            this.attackPhase = 'idle'
    }

    startWalking() {
        this.isAlert = false,
            this.isAttacking = false,
            this.attackPhase = 'idle'
    }

    moveEndBoss() {
        if (!this.world?.gameStarted || !this.world.character || this.isHurt() || this.isDead()) return;

        if (this.attackPhase !== 'idle') {
            this.performAttack();
            return;
        }

        const distance = Math.abs(this.world.character.x - this.x);

        distance > 300 ? this.moveToCharacter() :
            distance > 200 ? this.bossAllerted() : this.startAttack();
    }


    bossAllerted() {
        this.isAlert = true;
        this.isAttacking = false;
        if (this.world.character.x > this.x) {
            this.x += 1.5;
            this.otherDirection = true;
        } else {
            this.x -= 1.5;
            this.otherDirection = false;
        }
    }

    moveToCharacter() {
        this.isAlert = false;
        this.isAttacking = false;
        if (this.world.character.x > this.x) {
            this.moveRight();
            this.otherDirection = true;
        } else {
            this.moveLeft();
            this.otherDirection = false;
        }
    }

    performAttack() {
        this.attackTimer += 8.333;
        const attackStage = this.attackTimer;

        if (attackStage < 500) {
            this.y = this.startY - Math.sin((attackStage / 500) * Math.PI) * 15;
            this.x += this.attackDirection * 2.5;
        } else if (attackStage < 1300) {
            this.y = this.startY;
            this.isAlert = true;
            const targetX = this.alertTargetX;
            if (Math.abs(this.x - targetX) > 2) {
                this.x += this.x < targetX ? 2.5 : -2.5;
                this.otherDirection = this.x < targetX;
            }
        } else {
            this.attackPhase = 'idle';
            this.isAttacking = false;
            this.isAlert = true;
            this.attackTimer = 0;
            this.y = this.startY;
        }
    }
}
