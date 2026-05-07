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



    constructor(x, y, isBottle = false, isDropped = false) {
        super();
        this.x = x;
        this.y = y;
        this.width = 90;
        this.height = 90;
        this.isBottle = isBottle;
        this.isDropped = isDropped;
        this.canBeCollected = !isDropped;
        this.currentImage = 0;

        isBottle ? this.loadImage(this.salsaBottle) : this.loadImages(this.coins);
        !isBottle ? this.loadImage(this.coins[0]) : null;

        if (!isBottle && !isDropped) {
            this.animate();
        }

        if (isDropped) {
            this.startMovement();
        }
    }

    animate() {
        setStopableInterval(() => {
            this.playAnimation(this.coins);
        }, 200);
    }

    startMovement() {
        this.speedY = 10;
        this.speed = 5;
        this.acceleration = 0.5;
        this.animate();
        
        const movementInterval = setStopableInterval(() => {
            // Horizontal movement
            this.moveRight();
            
            // Apply gravity
            this.y -= this.speedY;
            this.speedY -= this.acceleration;
            
            // Stop when landed
            if (this.speedY <= 0 && this.y >= 350) {
                clearInterval(movementInterval);
                this.speed = 0;
                this.speedY = 0;
                this.y = 350;
                this.canBeCollected = true;
            }
        }, 1000 / 60);
    }

    getCollected() {
        this.energy = 0;
    }
}