const level1 = new Level(
    [
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new SmallChicken(),
        new SmallChicken(),
        new SmallChicken(),
        new SmallChicken(),
        new Endboss()
    ],
    Array.from({ length: 4 }, (_, i) => new Cloud(i * 1400)),
    [
        'img/5_background/layers/air.png',
        'img/5_background/layers/3_third_layer/set.png',
        'img/5_background/layers/2_second_layer/set.png',
        'img/5_background/layers/1_first_layer/set.png',
    ]
);