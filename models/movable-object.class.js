class MovableObject {
    x;
    y;
    img;
    width;
    height;
    speed = 0.15;
    otherDirection = false;
    imageCache = {};
    currentImage = 0;
    speedY = 0;
    acceleration = 1;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arrPaths) {
        arrPaths.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    applyGravity() {
        setInterval(() => {
            if (this.aboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 100 / 12);
    }

    aboveGround() {
        return this.y < 125;
    }

    playAnimation(arr) {
        let i = this.currentImage % arr.length;
        let path = arr[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }
    
    moveRight() {
        setInterval(() => {
            this.x += this.speed;
        }, 100 / 12);
    }
    moveLeft() {
        setInterval(() => {
            this.x -= this.speed;
        }, 100 / 12);
    }
}   