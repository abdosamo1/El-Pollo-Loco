class World {
    
    character = new Character();
    clouds = [
        new Cloud()
    ];
    enimies = [
        new Chicken(),
        new Chicken(),
        new Chicken()
    ];
    backgroundObjects = [
        new BackgroundObject('./img/5_background/layers/air.png'),
        new BackgroundObject('./img/5_background/layers/3_third_layer/1.png'),
        new BackgroundObject('./img/5_background/layers/2_second_layer/1.png'),
        new BackgroundObject('./img/5_background/layers/1_first_layer/1.png')
    ];
    ctx;

    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.addObjectsToMap(this.backgroundObjects);
        this.addObjectsToMap(this.clouds);
        this.addToMap(this.character);
        this.addObjectsToMap(this.enimies);
    

        requestAnimationFrame(() => this.draw());
    }

    addObjectsToMap(objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    }

    addToMap(object){
        this.ctx.drawImage(object.img, object.x, object.y, object.width, object.height);
    }
}