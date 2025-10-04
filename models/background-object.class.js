class BackgroundObject extends MovableObject {
   
    constructor(imgPath, x = 0, y = 0, width = 720, height = 480) {
        super();
        this.loadImages(imgPath);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

}