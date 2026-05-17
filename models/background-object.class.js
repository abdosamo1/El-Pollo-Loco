class BackgroundObject extends MovableObject {

    constructor(imgPath, x = 0, y = 0, width = 720, height = 480) {
        super();
        this.loadImage(imgPath);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    drawImage(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const width = Math.round(this.width);
        const height = Math.round(this.height);
        ctx.drawImage(this.img, x, y, width, height);
    }

}