class StatusBar extends DrawableObject {
    HELTHBAR_IMAGES = [
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png'
    ];

    COINBAR_IMAGES = [
        './img/7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png'
    ];

    BOTTLEBAR_IMAGES = [
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png'
    ];


    percentage = 0;

    constructor(type) {
        super();
        this.type = type;
        this.loadImages(type == 'health' ? this.HELTHBAR_IMAGES : type == 'coin' ? this.COINBAR_IMAGES : this.BOTTLEBAR_IMAGES);
        this.setPercentage(type == 'health' ? 100 : 0);
        this.x = 20;
        switch (type) {
            case 'health': this.y = 20; break;
            case 'coin': this.y = 70; break;
            case 'bottle': this.y = 120; break;    
        }
        this.width = 200;
        this.height = 60;
    }

    setPercentage(percentage) {
        this.percentage = percentage; 
        let path = 
            this.type == 'health' ? this.HELTHBAR_IMAGES[this.resolveImageIndex()]
            : this.type == 'coin' ? this.COINBAR_IMAGES[this.resolveImageIndex()]
            : this.BOTTLEBAR_IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }
    resolveImageIndex() {
        const percentage = Math.max(0, Math.min(100, this.percentage));
        return percentage == 100 ? 5 :
        percentage >= 80 ? 4 :
        percentage >= 60 ? 3 :
        percentage >= 40 ? 2 :
        percentage >= 20 ? 1 :
        0;
    }
}