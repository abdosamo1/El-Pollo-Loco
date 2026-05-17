class ThrowableObject extends CollectableItems {

    bottleSplash = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    constructor(x, y, direction = false) {
        super();
        this.loadImage(this.salsaBottles[0]);
        this.loadImages(this.bottleRotation);
        this.loadImages(this.bottleSplash);
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 100;
        this.otherDirection = direction;
        this.isSplashing = false;
        this.splashDone = false;
        this.throw();
    }

    throw() {
        const direction = this.otherDirection;
        this.speedY = 10;
        this.applyGravity();
        this.moveInterval = setStopableInterval(() => {
            if (this.isSplashing) return;
            direction ? this.x -= 5 : this.x += 5;
        }, 10);

        this.animationInterval = setStopableInterval(() => {
            this.playAnimation(this.isSplashing ? this.bottleSplash : this.bottleRotation);
        }, 100);
    }

    startSplash() {
        if (this.isSplashing) return;
        this.isSplashing = true;
        this.speed = 0;
        this.speedY = 0;
        clearInterval(this.moveInterval);
        setTimeout(() => {
            this.splashDone = true;
        }, 1000);
    }

    aboveGround() {
        return !this.isSplashing;
    }
}