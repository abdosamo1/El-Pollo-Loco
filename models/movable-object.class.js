class MovableObject {
    x;
    y;
    img;
    width;
    height;

    loadImages(path) {
        this.img= new Image();
        this.img.src = path;
    }

    moveRight() {
        this.x += 5;
    }

    moveLeft() {
        this.x -= 5;
    }
}   