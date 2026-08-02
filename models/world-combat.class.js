/** Combat/gameplay rules mixed into {@link World}: collisions, kills, endboss spawning, and bottle throwing. */
Object.assign(World.prototype, {

    /**
     * Checks the character against every living enemy and handles any collision found.
     * @returns {void}
     */
    checkCollisions() {
        if (this.gameOver || this.characterDied) return;
        this.level.enemies.forEach((enemy) => {
            if (enemy.isDead()) return;
            this.character.isColliding(enemy) ? this.handleCollision(this.character, enemy, this) : null;
        });
    },

    /**
     * Resolves a character/enemy collision as either a stomp-kill (falling
     * onto a regular enemy while airborne) or damage to the character. The
     * endboss can never be stomp-killed, only defeated with thrown bottles.
     * Requires the character to actually be airborne, so standing/walking
     * into a short enemy (e.g. a small chicken) is never mistaken for a stomp.
     * @param {Character} character - The player character.
     * @param {MovableObject} enemy - The enemy collided with.
     * @param {World} world - The game world (unused directly; kept for signature clarity).
     * @returns {void}
     */
    handleCollision(character, enemy, world) {
        const isStomp = !(enemy instanceof Endboss) && this.character.aboveGround() &&
            this.character.isAbove(enemy) && this.character.speedY <= 0;
        isStomp ? this.killEnemy(enemy) : this.damgeCharacter(enemy);
    },

    /**
     * Kills an enemy (stomp), bounces the character, and defeats the enemy.
     * @param {MovableObject} enemy - The enemy to kill.
     * @returns {void}
     */
    killEnemy(enemy) {
        this.defeatEnemy(enemy);
        this.character.jump(15);
    },

    /**
     * Marks an enemy as dead, makes it drop a possible coin, and checks
     * whether the endboss should spawn.
     * @param {MovableObject} enemy - The enemy to defeat.
     * @returns {void}
     */
    defeatEnemy(enemy) {
        enemy.energy = 0;
        enemy.speed = 0;
        enemy.deathTime = Date.now();
        this.dropCoin(enemy);
        this.maybeSpawnEndboss();
    },

    /**
     * Randomly drops a collectable coin at a defeated enemy's position
     * (skipped if the coin bar is already full).
     * @param {MovableObject} enemy - The enemy the coin drops from.
     * @returns {void}
     */
    dropCoin(enemy) {
        if (this.coinBar.percentage >= 100) return;
        if (Math.random() >= 0.7) return;

        const droppedCoin = new CollectableItems(enemy.x + enemy.width / 2, enemy.y, false, true);
        droppedCoin.world = this;
        this.level.collectables.push(droppedCoin);
    },

    /**
     * Spawns the endboss once all regular enemies are defeated (only once per run).
     * @returns {void}
     */
    maybeSpawnEndboss() {
        if (this.endBossSpawned || this.hasRegularEnemiesAlive()) return;
        this.spawnEndboss();
    },

    /**
     * @returns {boolean} True if any non-endboss enemy is still alive.
     */
    hasRegularEnemiesAlive() {
        return this.level.enemies.some(enemy => !(enemy instanceof Endboss) && !enemy.isDead());
    },

    /**
     * Creates the endboss ahead of the character and sets up its HUD bar.
     * @returns {void}
     */
    spawnEndboss() {
        const spawnDistance = Math.max(720, this.canvas ? this.canvas.width : 720);
        const endboss = new Endboss(this.character.x + spawnDistance);
        endboss.world = this;
        this.level.enemies.push(endboss);
        this.endBossSpawned = true;
        this.endBossBar = new StatusBar('endboss');
        this.endBossBar.x = 520;
        this.endBossBar.setPercentage(endboss.energy);
    },

    /**
     * Applies damage to the character from a side-collision with an enemy,
     * knocks the character back on a fresh hit, and updates the health bar / death state.
     * @param {MovableObject} enemy - The enemy that hit the character.
     * @returns {void}
     */
    damgeCharacter(enemy) {
        const damage = enemy instanceof Endboss ? 50 : 5;
        const wasHit = this.character.hit(damage);
        if (wasHit) {
            this.character.applyKnockback(enemy);
        }
        this.healthBar.setPercentage(this.character.energy / 10);
        if (this.character.energy === 0) {
            this.characterDied = true;
            this.deathDelay = 0;
        }
    },

    /**
     * Throws a new bottle when the throw key/button is held, bottles are
     * available, and the throw cooldown has elapsed.
     * @returns {void}
     */
    checkThrowObjects() {
        if (this.canThrow()) {
            this.throwBottle();
        }
    },

    /**
     * @returns {boolean} True if the throw input is active, bottles are
     * available, and the throw cooldown has elapsed.
     */
    canThrow() {
        const cooldownElapsed = Date.now() - this.lastThrowTime >= 500;
        return (this.keyboard.D || this.keyboard.mobileD) && this.bottleBar.percentage > 0 && cooldownElapsed;
    },

    /**
     * Spawns a thrown bottle at the character's position and consumes one bottle charge.
     * @returns {void}
     */
    throwBottle() {
        const direction = this.character.otherDirection;
        const bottle = new ThrowableObject(direction ? this.character.x : this.character.x + 30, this.character.y + 120, direction);
        bottle.world = this;
        this.throwableObjects.push(bottle);
        this.bottleBar.setPercentage(this.bottleBar.percentage - 10);
        this.lastThrowTime = Date.now();
    },

    /**
     * Checks in-flight bottles against every living enemy, killing regular
     * chickens on contact and damaging the endboss; removes finished splash bottles.
     * @returns {void}
     */
    checkThrowableCollisions() {
        this.throwableObjects = this.throwableObjects.filter(bottle => this.updateThrowable(bottle));
    },

    /**
     * Advances one thrown bottle's collision state for this tick.
     * @param {ThrowableObject} bottle - The bottle to update.
     * @returns {boolean} True to keep the bottle in the world.
     */
    updateThrowable(bottle) {
        if (bottle.isSplashing) return !bottle.splashDone;
        const hitEnemy = this.findHitEnemy(bottle);
        if (hitEnemy) {
            this.applyBottleHit(bottle, hitEnemy);
        }
        return true;
    },

    /**
     * @param {ThrowableObject} bottle - The bottle to test.
     * @returns {MovableObject|undefined} The living enemy this bottle is touching, if any.
     */
    findHitEnemy(bottle) {
        return this.level.enemies.find(enemy => !enemy.isDead() && bottle.isColliding(enemy));
    },

    /**
     * Splashes the bottle and either damages the endboss or instantly
     * defeats a regular chicken/small chicken.
     * @param {ThrowableObject} bottle - The bottle that hit.
     * @param {MovableObject} hitEnemy - The enemy that was hit.
     * @returns {void}
     */
    applyBottleHit(bottle, hitEnemy) {
        bottle.startSplash();
        hitEnemy instanceof Endboss ? this.damageEndbossWithBottle(hitEnemy) : this.defeatEnemy(hitEnemy);
    },

    /**
     * Applies bottle damage to the endboss and defeats it once its energy runs out.
     * @param {Endboss} hitEndboss - The endboss that was hit.
     * @returns {void}
     */
    damageEndbossWithBottle(hitEndboss) {
        hitEndboss.hit(20);
        if (hitEndboss.isDead()) {
            this.defeatEndboss(hitEndboss);
        }
    },

    /**
     * Finalizes the endboss's defeat and wins the game.
     * @param {Endboss} hitEndboss - The defeated endboss.
     * @returns {void}
     */
    defeatEndboss(hitEndboss) {
        hitEndboss.speed = 0;
        hitEndboss.deathTime = Date.now();
        this.coinBar.setPercentage(Math.min(100, this.coinBar.percentage + 30));
        this.winGame();
    }

});
