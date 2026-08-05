/**
 * Builds level 1: a fixed layout of chickens, small chickens, bottles/coins, clouds, and background layers.
 * @returns {Level} The constructed level instance.
 */
function createLevel1() {
    return new Level(
        buildLevel1Enemies(),
        buildLevel1Clouds(),
        buildLevel1BackgroundPathsForSet(1),
        buildLevel1BackgroundPathsForSet(2),
        buildLevel1Collectables()
    );
}

/**
 * Creates and returns all bottle collectables evenly spaced across level 1.
 * @returns {CollectableItems[]} The bottle pickups placed across level 1.
 */
function buildLevel1Collectables() {
    const startX = 700, spacing = 300, groundY = 330;
    return Array.from({ length: 13 }, (_, i) => new CollectableItems(startX + spacing * i, groundY, true));
}

/**
 * Creates and returns the full mix of chickens and small chickens for level 1.
 * @returns {(Chicken|SmallChicken)[]} The regular and small chicken enemies placed across level 1.
 */
function buildLevel1Enemies() {
    const startX = 700, spacing = 300;
    const chickenSlots = [0, 1, 2, 4, 7, 9, 10, 13, 15, 16, 17];
    const smallSlots = [3, 5, 6, 8, 11, 12];
    return [
        ...chickenSlots.map(i => new Chicken(startX + spacing * i)),
        ...smallSlots.map(i => new SmallChicken(startX + spacing * i)),
    ];
}

/**
 * Creates evenly spaced cloud objects for the level 1 background.
 * @returns {Cloud[]} The background clouds placed across level 1.
 */
function buildLevel1Clouds() {
    return Array.from({ length: 4 }, (_, i) => new Cloud(i * 1400));
}


/**
 * Returns the background image paths for level 1's tiled background layers, with the 'number' placeholder replaced by the given set number.
 * @param {number} setNumber - The set number to replace the 'number' placeholder with.
 * @returns {string[]} The background image paths with the 'number' placeholder replaced.
 */
function buildLevel1BackgroundPathsForSet(setNumber) {
    return [
        './assets/img/5_background/layers/air.png',
        `./assets/img/5_background/layers/3_third_layer/${setNumber}.png`,
        `./assets/img/5_background/layers/2_second_layer/${setNumber}.png`,
        `./assets/img/5_background/layers/1_first_layer/${setNumber}.png`,
    ];
}

