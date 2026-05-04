class CollectableItems extends MovableObject {

    coins = [
        './img/8_coin/coin_1.png',
        './img/8_coin/coin_2.png'
    ];

    salsaBottle = './img/6_salsa_bottle/salsa_bottle.png';    

    bottleRotation = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];



    constructor(x, y, isBottle = false) {
        super();
        this.x = x;
        this.y = y;
        this.width = 90;
        this.height = 90;
        this.isBottle = isBottle;
        this.currentImage = 0;

        if (isBottle) {
            this.loadImage(this.salsaBottle);
        } else {
            this.loadImages(this.coins);
            this.loadImage(this.coins[0]);
        }

        if (!isBottle) {
            this.animate();
        }
    }

    animate() {
        setStopableInterval(() => {
            this.playAnimation(this.coins);
        }, 200);
    }

    getCollected() {
        this.energy = 0;
    }
}