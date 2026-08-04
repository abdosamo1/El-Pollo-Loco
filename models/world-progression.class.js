/** Level-progression aids mixed into {@link World}: bottle respawning and the endboss warning banner. */
Object.assign(World.prototype, {

    /**
     * Spawns a fresh collectable bottle every {@link World#BOTTLE_RESPAWN_INTERVAL}
     * so players can't permanently run out of throwable ammo.
     * @returns {void}
     */
    checkBottleRespawn() {
        if (Date.now() - this.lastBottleSpawnTime < this.BOTTLE_RESPAWN_INTERVAL) return;
        this.spawnBottle();
        this.lastBottleSpawnTime = Date.now();
    },

    /**
     * Creates a new bottle pickup on the ground ahead of the character,
     * at least {@link World#MIN_BOTTLE_SPACING}px from every other bottle.
     * @returns {void}
     */
    spawnBottle() {
        const x = this.findClearBottleSpawnX();
        const bottle = new CollectableItems(x, 330, true);
        bottle.world = this;
        this.level.collectables.push(bottle);
    },

    /**
     * Finds a spawn x-position that keeps a minimum distance from every
     * existing bottle, nudging forward until a clear spot is found.
     * @returns {number} A horizontal position clear of other bottles.
     */
    findClearBottleSpawnX() {
        let x = this.character.x + 400 + Math.random() * 200;
        while (this.isTooCloseToOtherBottle(x)) {
            x += this.MIN_BOTTLE_SPACING;
        }
        return x;
    },

    /**
     * Checks whether a candidate x-position is too close to any existing bottle.
     * @param {number} x - Candidate horizontal position for a new bottle.
     * @returns {boolean} True if an existing bottle is within {@link World#MIN_BOTTLE_SPACING}px of x.
     */
    isTooCloseToOtherBottle(x) {
        return this.level.collectables.some(collectable =>
            collectable.isBottle && Math.abs(collectable.x - x) < this.MIN_BOTTLE_SPACING
        );
    },

    /**
     * Shows a warning once the character has walked far ahead without
     * defeating every regular chicken, since the endboss can't spawn otherwise.
     * @returns {void}
     */
    checkEndbossWarning() {
        const nearLevelEnd = this.character.x > this.level.level_end_x - 800;
        const shouldWarn = nearLevelEnd && this.hasRegularEnemiesAlive() && !this.endBossSpawned;
        this.setEndbossWarningVisible(shouldWarn);
    },

    /**
     * Shows or hides the endboss warning HTML element.
     * @param {boolean} visible - Whether the warning should be shown.
     * @returns {void}
     */
    setEndbossWarningVisible(visible) {
        const warning = document.getElementById('endboss-warning');
        if (warning) {
            warning.style.display = visible ? 'block' : 'none';
        }
    }

});
