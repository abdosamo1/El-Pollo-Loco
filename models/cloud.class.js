class Cloud extends MovableObject {
    x = 0;
    y = 20;
    width = 720 * 2;
    height = 300;
    speed = 0.15;

    constructor() {
        super();
        this.loadImage('img/5_background/layers/4_clouds/full.png');
        this.animate();
    }

    animate() {
        this.moveLeft();
    }


}