/** Holds a level's enemies, clouds, collectables, and tiled background layers. */
class Level {
    enemies;
    clouds;
    collectables = [];
    backgroundObjects = [];
    level_end_x = 500 * 10; // end of level in x direction

    /**
     * Creates a new level with the given enemies, clouds, background layers, and collectables.
     * @param {MovableObject[]} enemies - Enemies placed in the level.
     * @param {Cloud[]} clouds - Background clouds.
     * @param {string[]} backgroundPaths - Background layer image paths (may contain the 'set' placeholder).
     * @param {CollectableItems[]} [collectables=[]] - Collectable items placed in the level.
     */
    constructor(enemies, clouds, backgroundPaths, collectables = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.collectables = collectables;
        this.createBackgroundsObjects(backgroundPaths);

    }

    /**
     * Tiles the given background image paths repeatedly across the level's
     * width, alternating between two background sets for variety.
     * @param {string[]} arrPaths - Background layer image paths.
     * @returns {void}
     */
    createBackgroundsObjects(arrPaths) {
        for (let i = -10; i <= 10; i++) {
            const set = i % 2 === 0 ? '1' : '2';
            const x = 720 * i;
            arrPaths.forEach(path => this.addBackgroundLayer(path, x, set));
        }
    }

    /**
     * Resolves a single background path for the given tile set and adds it.
     * @param {string} path - Background image path, may contain the 'set' placeholder.
     * @param {number} x - Horizontal position of the tile.
     * @param {string} set - Which background set ('1' or '2') to substitute in.
     * @returns {void}
     */
    addBackgroundLayer(path, x, set) {
        this.backgroundObjects.push(new BackgroundObject(path, x));
    }

}