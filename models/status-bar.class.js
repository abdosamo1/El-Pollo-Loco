/** A HUD status bar (health, coins, bottles, or endboss health) rendered from percentage-tiered sprites. */
class StatusBar extends DrawableObject {
    static instances = new Set();
    static viewportListenerAttached = false;

    HEALTHBAR_IMAGES = [
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png'
    ];

    COINBAR_IMAGES = [
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png'
    ];

    BOTTLEBAR_IMAGES = [
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png'
    ];

    ENDBOSSBAR_IMAGES = [
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
    ];

    percentage = 0;

    /** 
     * creates a new StatusBar instance of the specified type, with its initial percentage and position set.
     * @param {'health'|'coin'|'bottle'|'endboss'} type - Which status bar this instance represents. 
     * */
    constructor(type) {
        super();
        this.type = String(type).toLowerCase();
        this.loadImages(this.resolveImageSet());
        this.setPercentage(this.type == 'health' ? 100 : 0);
        this.x = 20;
        this.updatePositionForViewport();
        this.width = 160;
        this.height = 48;
        StatusBar.instances.add(this);
        StatusBar.attachViewportListener();
    }

    /**
     * Attaches one global viewport listener so all status bars can recalculate Y on resize/orientation changes.
     * @returns {void}
     */
    static attachViewportListener() {
        if (StatusBar.viewportListenerAttached) return;

        const refreshAllStatusBars = () => {
            StatusBar.instances.forEach((statusBar) => statusBar.updatePositionForViewport());
        };

        window.addEventListener('resize', refreshAllStatusBars);
        window.addEventListener('orientationchange', refreshAllStatusBars);
        StatusBar.viewportListenerAttached = true;
    }

    /**
     * Resolves the correct sprite set for this bar's type.
     * @returns {string[]} The tiered sprite set matching this bar's type.
     */
    resolveImageSet() {
        if (this.type == 'health') return this.HEALTHBAR_IMAGES;
        if (this.type == 'coin') return this.COINBAR_IMAGES;
        if (this.type == 'bottle') return this.BOTTLEBAR_IMAGES;
        if (this.type == 'endboss' || this.type == 'endbos') return this.ENDBOSSBAR_IMAGES;
        return this.BOTTLEBAR_IMAGES;
    }

    /**
     * Resolves the correct y position for this bar's type and detectes if mobile device to adjust position accordingly.
     * @returns {number} The HUD y position matching this bar's type.
     */
    resolveYPosition() {
        if (this.mobileAndTabletCheck()) {
            switch (this.type) {
                case 'health': return 8;
                case 'coin': return 48;
                case 'bottle': return 88;
                case 'endboss': return 8;
                default: return 8;
            }
        } else {
            switch (this.type) {
                case 'health': return 24;
                case 'coin': return 72;
                case 'bottle': return 120;
                case 'endboss': return 24;
                default: return 24;
            }
        }
    }

    /**
     * Recomputes the Y position based on current viewport characteristics.
     * @returns {void}
     */
    updatePositionForViewport() {
        this.y = this.resolveYPosition();
    }

    /**
     * Checks if the device is mobile or tablet to adjust the status bar position accordingly.
     * @returns {boolean} True if the device is mobile or tablet, false otherwise.
     */
    mobileAndTabletCheck() {
        return window.innerWidth <= 1000 || window.innerHeight <= 600;
    }
    

    /**
     * Updates the bar's percentage and swaps in the matching tiered sprite.
     * @param {number} percentage - New percentage value (0-100).
     * @returns {void}
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        const images = this.resolveImageSet();
        this.img = this.imageCache[images[this.resolveImageIndex()]];
    }

    /**
     * Maps the current percentage to one of the 6 sprite tiers (0/1/20/40/60/80/100).
     * @returns {number} Index into the tiered image array.
     */
    resolveImageIndex() {
        const percentage = Math.max(0, Math.min(100, this.percentage));
        return percentage == 100 ? 5 :
            percentage >= 80 ? 4 :
                percentage >= 60 ? 3 :
                    percentage >= 40 ? 2 :
                        percentage >= 1 ? 1 :
                            0;
    }
}