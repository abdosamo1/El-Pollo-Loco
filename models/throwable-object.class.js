class ThrowableObject extends MovableObject {
    
    
    
    constructor(x, y) {
        super();
        this.loadImage('img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png');
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 100;
        this.throw();
    }
    throw() {
        this.speedY = 20;
        this.applyGravity();
        setInterval (() => {
            this.x += 5; // Move to the right
        }, 25);
    }
}