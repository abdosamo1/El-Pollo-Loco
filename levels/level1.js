/**
 * Builds level 1: a fixed layout of chickens, small chickens, bottles/coins, clouds, and background layers.
 * @returns {Level} The constructed level instance.
 */
function createLevel1() {
    return new Level(
        buildLevel1Enemies(),
        buildLevel1Clouds(),
        buildLevel1BackgroundPaths(),
        buildLevel1Collectables()
    );
}

/**
 * @returns {CollectableItems[]} The bottle pickups placed across level 1.
 */
function buildLevel1Collectables() {
    const startX = 700;
    const spacing = 300;
    const groundY = 330;
    return [
        new CollectableItems(startX + spacing * 0, groundY, true),
        new CollectableItems(startX + spacing * 1, groundY, true),
        new CollectableItems(startX + spacing * 2, groundY, true),
        new CollectableItems(startX + spacing * 3, groundY, true),
        new CollectableItems(startX + spacing * 4, groundY, true),
        new CollectableItems(startX + spacing * 5, groundY, true),
        new CollectableItems(startX + spacing * 6, groundY, true),
        new CollectableItems(startX + spacing * 7, groundY, true),
        new CollectableItems(startX + spacing * 8, groundY, true),
        new CollectableItems(startX + spacing * 9, groundY, true),
        new CollectableItems(startX + spacing * 10, groundY, true),
        new CollectableItems(startX + spacing * 11, groundY, true),
        new CollectableItems(startX + spacing * 12, groundY, true),
    ];
}

/**
 * @returns {(Chicken|SmallChicken)[]} The regular and small chicken enemies placed across level 1.
 */
function buildLevel1Enemies() {
    const startX = 700;
    const spacing = 300;
    return [
        new Chicken(startX + spacing * 0),
        new Chicken(startX + spacing * 1),
        new Chicken(startX + spacing * 2),
        new Chicken(startX + spacing * 4),
        new Chicken(startX + spacing * 7),
        new Chicken(startX + spacing * 9),
        new Chicken(startX + spacing * 10),
        new Chicken(startX + spacing * 13),
        new Chicken(startX + spacing * 15),
        new Chicken(startX + spacing * 16),
        new Chicken(startX + spacing * 17),
        new SmallChicken(startX + spacing * 3),
        new SmallChicken(startX + spacing * 5),
        new SmallChicken(startX + spacing * 6),
        new SmallChicken(startX + spacing * 8),
        new SmallChicken(startX + spacing * 11),
        new SmallChicken(startX + spacing * 12),
    ];
}

/**
 * @returns {Cloud[]} The background clouds placed across level 1.
 */
function buildLevel1Clouds() {
    return Array.from({ length: 4 }, (_, i) => new Cloud(i * 1400));
}

/**
 * @returns {string[]} The tiled background layer image paths for level 1.
 */
function buildLevel1BackgroundPaths() {
    return [
        'img/5_background/layers/air.png',
        'img/5_background/layers/3_third_layer/set.png',
        'img/5_background/layers/2_second_layer/set.png',
        'img/5_background/layers/1_first_layer/set.png',
    ];
}

const level1 = createLevel1();