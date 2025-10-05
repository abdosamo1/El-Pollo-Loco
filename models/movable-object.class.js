class MovableObject {
    x;
    y;
    img;
    width;
    height;
    speed = 0.15;
    otherDirection = false;
    imageCache = {};

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