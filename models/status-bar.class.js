class StatusBar extends DrawableObject {
    HELTHBAR_IMAGES = [
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png'
    ];

    percentage = 100;

    constructor() {
        super();
        this.loadImages(this.HELTHBAR_IMAGES);
        this.setPercentage(100);
        this.x = 20;
        this.y = 10;    
        this.width = 200;
        this.height = 60;
    }

    setPercentage(percentage) {
        this.percentage = percentage; 
        let path = this.HELTHBAR_IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }
    resolveImageIndex() {
        if (this.percentage == 100) {return 5;}
        else if (this.percentage > 80) {return 4;}
        else if (this.percentage > 60) {return 3;}
        else if (this.percentage > 40) {return 2;}
        else if (this.percentage > 20) {return 1;}
        else {return 0;}
    }
}