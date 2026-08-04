/** Base class for anything that can be drawn onto the canvas. */
class DrawableObject {
    x;
    y;
    img;
    width;
    height;
    imageCache = {};
    currentImage = 0;

    /**
     * Loads a single image and sets it as the current image.
     * @param {string} path - Path to the image file.
     * @returns {void}
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Preloads multiple images into {@link DrawableObject#imageCache}.
     * @param {string[]} arrPaths - Paths to the images to preload.
     * @returns {void}
     */
    loadImages(arrPaths) {
        arrPaths.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
     * Draws the current image at this object's position, optionally scaled
     * and anchored to the bottom-center (used for hurt/shrink effects).
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw onto.
     * @param {number} [scale=1] - Uniform scale factor to apply.
     * @returns {void}
     */
    drawImage(ctx, scale = 1) {
        if (!this.img || !this.img.complete || this.img.naturalWidth === 0) {
            return;
        }
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