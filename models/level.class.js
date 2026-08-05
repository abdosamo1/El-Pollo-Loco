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
     * @param {string[]} backgroundPathsSet1 - Background layer image paths for set 1.
     * @param {string[]|CollectableItems[]} [backgroundPathsSet2OrCollectables=[]] - Optional set 2 paths, or collectables in 4-arg calls.
     * @param {CollectableItems[]} [collectables=[]] - Collectable items placed in the level (5-arg call).
     */
    constructor(enemies, clouds, backgroundPathsSet1, backgroundPathsSet2OrCollectables = [], collectables = []) {
        this.enemies = enemies;
        this.clouds = clouds;

        const usesTwoBackgroundSets = Array.isArray(backgroundPathsSet2OrCollectables) &&
            backgroundPathsSet2OrCollectables.length > 0 &&
            typeof backgroundPathsSet2OrCollectables[0] === 'string';

        const backgroundPathsSet2 = usesTwoBackgroundSets ? backgroundPathsSet2OrCollectables : backgroundPathsSet1;
        this.collectables = usesTwoBackgroundSets ? collectables : backgroundPathsSet2OrCollectables;
        this.createBackgroundsObjects(backgroundPathsSet1, backgroundPathsSet2);

    }

    /**
     * Tiles the given background image paths repeatedly across the level's
     * width, alternating between two background sets for variety.
     * @param {string[]} backgroundPathsSet1 - Background layer image paths for set 1.
     * @param {string[]} backgroundPathsSet2 - Background layer image paths for set 2.
     * @returns {void}
     */
    createBackgroundsObjects(backgroundPathsSet1, backgroundPathsSet2) {
        for (let i = -10; i <= 10; i++) {
            const selectedSet = i % 2 === 0 ? backgroundPathsSet1 : backgroundPathsSet2;
            const x = 720 * i;
            selectedSet.forEach(path => this.addBackgroundLayer(path, x));
        }
    }

    /**
     * Adds one background layer at the specified x position.
     * @param {string} path - Background image path.
     * @param {number} x - Horizontal position of the tile.
     * @returns {void}
     */
    addBackgroundLayer(path, x) {
        this.backgroundObjects.push(new BackgroundObject(path, x));
    }

}