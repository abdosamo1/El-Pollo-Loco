class DrawableObject {
    x;
    y;
    img;
    width;
    height;
    imageCache = {};
    currentImage = 0;

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

    drawImage(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}