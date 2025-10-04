class Chicken extends MovableObject {

    x = 150 + Math.random() * 500; 
    y = 325;
    width = 100;
    height = 100;

    constructor() {
        super();
        this.loadImages('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
    }

}