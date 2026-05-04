class ThrowableObject extends CollectableItems {

    

    constructor(x, y, direction = false) {
        super();
        this.loadImage(this.salsaBottle);
        this.loadImages(this.bottleRotation);
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 100;
        this.otherDirection = direction;
        this.throw();
    }

    throw() {
        const direction = this.otherDirection;
        this.speedY = 10;
        this.applyGravity();
        setInterval(() => {
            direction ? this.x -= 5 : this.x += 5;
        }, 10);

        setInterval(() => {
            this.playAnimation(this.bottleRotation);
        }, 100);
    }
}