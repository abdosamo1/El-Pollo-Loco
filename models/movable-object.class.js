class MovableObject extends DrawableObject {
    
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 1;
    lastHit = 0;
    energy = 1000;
    groundY = 125;
    offset = { top: 0, left: 0, right: 0, bottom: 0 };

    isColliding(object) {
        const thisOffset = this.offset;
        const objectOffset = object.offset ?? { top: 0, left: 0, right: 0, bottom: 0 };
        return this.x + thisOffset.left < object.x + object.width - objectOffset.right &&
            this.x + this.width - thisOffset.right > object.x + objectOffset.left &&
            this.y + thisOffset.top < object.y + object.height - objectOffset.bottom &&
            this.y + this.height - thisOffset.bottom > object.y + objectOffset.top;
    }

    hit(damge){
        if (this.isHurt()) return;
        this.energy -= damge;
        this.energy < 6 ? this.energy = 0 :
            this.lastHit = new Date().getTime();
    }

    isHurt(){
        let timepassed = new Date().getTime() - this.lastHit; // difference in ms
        timepassed = timepassed / 1000; // difference in s
        return timepassed < 1.5;
    }

    isDead(){
        return this.energy == 0;
    }

    applyGravity() {
        setInterval(() => {
            if (!this.isGameStarted()) return;
            if (this.aboveGround() || this.speedY > 0) {
                let nextY = this.y - this.speedY;
                if (nextY > this.groundY && !(this instanceof ThrowableObject)) {
                    this.y = this.groundY;
                    this.speedY = 0;
                } else {
                    this.y = nextY;
                    this.speedY -= this.acceleration;
                }
            }
        }, 1000 / 25);
    }

    aboveGround() {
        return this instanceof ThrowableObject ? true : this.y < this.groundY;
    }

    isGameStarted() {
        return this.world?.gameStarted ?? false;
    }

    playAnimation(arr) {
        let i = this.currentImage % arr.length;
        let path = arr[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump(height = 20) {
        this.speedY = height;
    }
}   