/** The end-level boss chicken: alerts, walks toward, and attacks the character. */
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

    /** @param {number} startX - Horizontal spawn position, ahead of the character. */
    constructor(startX) {
        super();
        this.loadAllImages();
        this.startX = startX;
        this.x = startX;
        this.fullscreenY = 450;
        this.width = 300;
        this.height = 400;
        this.offset = { top: 60, left: 20, right: 20, bottom: 15 };
        this.energy = 100;
        this.y = 50;
        this.speed = 0.5;
        this.laodAllStates();
        this.animate();
    }

    /**
     * Resets the attack/alert state machine to idle.
     * @returns {void}
     */
    laodAllStates() {
        this.isAttacking = false;
        this.isAlert = false;
        this.attackPhase = 'idle';
        this.attackTimer = 0;
    }


    /**
     * Preloads every sprite sheet used by the boss.
     * @returns {void}
     */
    loadAllImages() {
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
    }

    /**
     * Starts the recurring intervals that drive the boss's animation and movement.
     * @returns {void}
     */
    animate() {
        setStopableInterval(() => this.playEndBossAnimations(), 200);
        setStopableInterval(() => this.moveEndBoss(), 100 / 12);
    }

    /**
     * Updates the attack/alert state, then plays the animation matching the
     * boss's current state (hurt, dead, attacking, alert, or walking).
     * @returns {void}
     */
    playEndBossAnimations() {
        if (!this.isGameStarted()) return;

        this.updateState();

        this.isHurt() ? this.playAnimation(this.IMAGES_HURT) :
            this.isDead() ? this.playAnimation(this.IMAGES_DEAD) :
                this.isAttacking ? this.playAnimation(this.IMAGES_ATTACK) :
                    this.isAlert ? this.playAnimation(this.IMAGES_ALERT) : this.playAnimation(this.IMAGES_WALKING);
    }

    /**
     * Chooses attack/alert/idle-walk behavior based on distance to the
     * character, unless already mid-attack, hurt, or dead.
     * @returns {void}
     */
    updateState() {
        if (!this.world.character || this.attackPhase !== 'idle' || this.isHurt() || this.isDead()) return;
        const distance = Math.abs(this.world.character.x - this.x);

        distance < 200 ? this.startAttack() :
            distance < 300 ? this.startAlert() : this.startWalking();
    }

    /**
     * Begins the multi-phase attack sequence (lunge, then retreat to a
     * safe distance) if not already attacking.
     * @returns {void}
     */
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

    /** Switches the boss to the alert (aware, not yet attacking) state. @returns {void} */
    startAlert() {
        this.isAlert = true,
            this.isAttacking = false,
            this.attackPhase = 'idle'
    }

    /** Switches the boss to the idle-walking state. @returns {void} */
    startWalking() {
        this.isAlert = false,
            this.isAttacking = false,
            this.attackPhase = 'idle'
    }

    /**
     * Per-tick movement update: continues an in-progress attack, or otherwise
     * walks toward, gets alerted by, or attacks the character based on distance.
     * @returns {void}
     */
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
    


    /**
     * Moves the boss toward the character at alert speed while marking it as alert.
     * @returns {void}
     */
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

    /**
     * Walks the boss toward the character at normal speed.
     * @returns {void}
     */
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

    /**
     * Advances the current attack phase (lunge, retreat, then idle) based on
     * elapsed attack time.
     * @returns {void}
     */
    performAttack() {
        this.attackTimer += 8.333;
        const attackStage = this.attackTimer;

        if (attackStage < 500) {
            this.performLungePhase(attackStage);
        } else if (attackStage < 1300) {
            this.performRetreatPhase();
        } else {
            this.finishAttack();
        }
    }

    /**
     * Lunges the boss toward its attack target with a small vertical arc.
     * @param {number} attackStage - Milliseconds elapsed into the attack.
     * @returns {void}
     */
    performLungePhase(attackStage) {
        this.y = this.startY - Math.sin((attackStage / 500) * Math.PI) * 15;
        this.x += this.attackDirection * 2.5;
    }

    /**
     * Retreats the boss back to its alert distance after lunging.
     * @returns {void}
     */
    performRetreatPhase() {
        this.y = this.startY;
        this.isAlert = true;
        const targetX = this.alertTargetX;
        if (Math.abs(this.x - targetX) > 2) {
            this.x += this.x < targetX ? 2.5 : -2.5;
            this.otherDirection = this.x < targetX;
        }
    }

    /**
     * Ends the attack sequence, returning the boss to an alert idle state.
     * @returns {void}
     */
    finishAttack() {
        this.attackPhase = 'idle';
        this.isAttacking = false;
        this.isAlert = true;
        this.attackTimer = 0;
        this.y = this.startY;
    }
}
