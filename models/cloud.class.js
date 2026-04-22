class Cloud extends MovableObject {
    x = 0;
    y = 20;
    width = 720 * 2;
    height = 300;
    speed = 0.15;

    constructor(startX = 0) {
        super();
        this.x = startX;
        this.loadImage('img/5_background/layers/4_clouds/full.png');
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (!this.world?.gameStarted) return;
            this.moveLeft();
        }, 100 / 12);
    }
}