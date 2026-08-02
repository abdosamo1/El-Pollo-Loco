/** A static, non-colliding background layer image tiled across the level. */
class BackgroundObject extends MovableObject {

    /**
     * @param {string} imgPath - Path to the background image.
     * @param {number} [x=0] - Horizontal position in the level.
     * @param {number} [y=0] - Vertical position in the level.
     * @param {number} [width=720] - Rendered width.
     * @param {number} [height=480] - Rendered height.
     */
    constructor(imgPath, x = 0, y = 0, width = 720, height = 480) {
        super();
        this.loadImage(imgPath);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Draws the background image, rounding coordinates to avoid seams between tiles.
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw onto.
     * @returns {void}
     */
    drawImage(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const width = Math.round(this.width) + 1;
        const height = Math.round(this.height);
        ctx.drawImage(this.img, x, y, width, height);
    }

}