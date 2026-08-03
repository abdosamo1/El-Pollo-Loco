/** The end-level boss chicken: alerts, walks toward, and attacks the character. */
class Endboss extends MovableObject {
    HURT_DURATION = 0.2;
    HURT_VISUAL_DURATION = 0.6;

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
    lastHurtVisualHit = 0;

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

        if (!this.world.characterDied) {
            this.updateState();
        } else if (!this.isAttacking && !this.isDead()) {
            return;
        }

        this.isHurtVisualActive() ? this.playAnimation(this.IMAGES_HURT) :
            this.isDead() ? this.playAnimation(this.IMAGES_DEAD) :
                this.isAttacking ? this.playAnimation(this.IMAGES_ATTACK) :
                    this.isAlert ? this.playAnimation(this.IMAGES_ALERT) : this.playAnimation(this.IMAGES_WALKING);
    }

    /**
     * Applies damage and records a slightly longer visual hurt window.
     * @param {number} damage - Amount of health to remove.
     * @returns {boolean} True if damage was applied.
     */
    hit(damage) {
        const wasHit = super.hit(damage);
        if (wasHit) this.lastHurtVisualHit = Date.now();
        return wasHit;
    }

    /** @returns {boolean} True while the hurt animation should stay visible. */
    isHurtVisualActive() {
        return (Date.now() - this.lastHurtVisualHit) / 1000 < this.HURT_VISUAL_DURATION;
    }

    /**
     * Chooses attack/alert/idle-walk behavior based on distance to the
     * character, unless already mid-attack, hurt, or dead.
     * @returns {void}
     */
    updateState() {
        if (!this.world.character || this.attackPhase !== 'idle' || this.isHurt() || this.isDead()) return;
        const distance = Math.abs(this.world.character.x - this.x);
        const attackRange = this.getAttackRange();
        const alertRange = this.getAlertRange();

        distance < attackRange ? this.startAttack() :
            distance < alertRange ? this.startAlert() : this.startWalking();
    }

    /** @returns {boolean} True once the boss has dropped to half health. */
    isEnraged() {
        return this.energy <= 50 && !this.isDead();
    }

    /** @returns {number} Distance at which the boss starts attacking. */
    getAttackRange() {
        return this.isEnraged() ? 260 : 200;
    }

    /** @returns {number} Distance at which the boss enters alert mode. */
    getAlertRange() {
        return this.isEnraged() ? 380 : 300;
    }

    /** @returns {number} The boss's walk speed for the current phase. */
    getWalkSpeed() {
        return this.isEnraged() ? 1.1 : this.speed;
    }

    /** @returns {number} The boss's alert/run speed for the current phase. */
    getAlertSpeed() {
        return this.isEnraged() ? 2.4 : 1.5;
    }

    /** @returns {number} The boss's lunge and retreat speed for the current phase. */
    getAttackSpeed() {
        return this.isEnraged() ? 3.4 : 2.5;
    }

    /** @returns {number} How far the boss retreats after attacking. */
    getRetreatDistance() {
        return this.isEnraged() ? 220 : 300;
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
        this.alertTargetX = this.world.character.x - this.attackDirection * this.getRetreatDistance();
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
        if (!this.isMovementActive() || !this.world.character || this.isDead()) return;

        if (this.attackPhase !== 'idle') {
            this.performAttack();
            return;
        }

        const distance = Math.abs(this.world.character.x - this.x);
        const attackRange = this.getAttackRange();
        const alertRange = this.getAlertRange();

        distance > alertRange ? this.moveToCharacter() :
            distance > attackRange ? this.bossAllerted() : this.startAttack();
    }
    


    /**
     * Moves the boss toward the character at alert speed while marking it as alert.
     * @returns {void}
     */
    bossAllerted() {
        this.isAlert = true;
        this.isAttacking = false;
        const alertSpeed = this.getAlertSpeed();
        if (this.world.character.x > this.x) {
            this.x += alertSpeed;
            this.otherDirection = true;
        } else {
            this.x -= alertSpeed;
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
        const walkSpeed = this.getWalkSpeed();
        if (this.world.character.x > this.x) {
            this.x += walkSpeed;
            this.otherDirection = true;
        } else {
            this.x -= walkSpeed;
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
        this.x += this.attackDirection * this.getAttackSpeed();
    }

    /**
     * Retreats the boss back to its alert distance after lunging.
     * @returns {void}
     */
    performRetreatPhase() {
        this.y = this.startY;
        this.isAlert = true;
        const targetX = this.alertTargetX;
        const retreatSpeed = this.getAttackSpeed();
        if (Math.abs(this.x - targetX) > 2) {
            this.x += this.x < targetX ? retreatSpeed : -retreatSpeed;
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
