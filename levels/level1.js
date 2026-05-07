function createLevel1() {
    const startX = 700;
    const spacing = 300;

    const collectables = [
        new CollectableItems(startX + spacing * 0, 150, true),
        new CollectableItems(startX + spacing * 1, 180, true),
        new CollectableItems(startX + spacing * 2, 350, true),
        new CollectableItems(startX + spacing * 3, 250, true),
        new CollectableItems(startX + spacing * 4, 200, true),
        new CollectableItems(startX + spacing * 5, 300, true),
        new CollectableItems(startX + spacing * 6, 150, true),
        new CollectableItems(startX + spacing * 7, 350, true),
        new CollectableItems(startX + spacing * 8, 250, true),
        new CollectableItems(startX + spacing * 9, 200, true),
        new CollectableItems(startX + spacing * 0.5, 150, true),
        new CollectableItems(startX + spacing * 1.5, 180, true),
        new CollectableItems(startX + spacing * 2.5, 350, true),
        new CollectableItems(startX + spacing * 3.5, 250, true),
        new CollectableItems(startX + spacing * 4.5, 200, true),
        new CollectableItems(startX + spacing * 5.5, 300, true),
        new CollectableItems(startX + spacing * 6.5, 150, true),
        new CollectableItems(startX + spacing * 7.5, 350, true),
        new CollectableItems(startX + spacing * 8.5, 250, true),
        new CollectableItems(startX + spacing * 9.5, 200, true),
    ];

    return new Level(
        [
            new Chicken(startX + spacing * 0),
            new Chicken(startX + spacing * 1),
            new Chicken(startX + spacing * 2),
            new Chicken(startX + spacing * 4),
            new Chicken(startX + spacing * 7),
            new Chicken(startX + spacing * 9),
            new SmallChicken(startX + spacing * 3),
            new SmallChicken(startX + spacing * 5),
            new SmallChicken(startX + spacing * 6),
            new SmallChicken(startX + spacing * 8)
        ],
        Array.from({ length: 4 }, (_, i) => new Cloud(i * 1400)),
        [
            'img/5_background/layers/air.png',
            'img/5_background/layers/3_third_layer/set.png',
            'img/5_background/layers/2_second_layer/set.png',
            'img/5_background/layers/1_first_layer/set.png',
        ],
        collectables
    );
}

const level1 = createLevel1();