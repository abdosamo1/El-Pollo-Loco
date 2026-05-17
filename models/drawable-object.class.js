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

    drawImage(ctx, scale = 1) {
        if (scale === 1) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            return;
        }
        const scaledWidth = this.width * scale;
        const scaledHeight = this.height * scale;
        const offsetX = this.x + (this.width - scaledWidth) / 2;
        const offsetY = this.y + (this.height - scaledHeight);
        ctx.drawImage(this.img, offsetX, offsetY, scaledWidth, scaledHeight);
    }
}