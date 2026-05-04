class Level {
    enemies;
    clouds;
    collectables = [];
    backgroundObjects = [];
    level_end_x = 500 * 10; // end of level in x direction

    constructor(enemies, clouds, backgroundPaths, collectables = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.collectables = collectables;
        this.createBackgroundsObjects(backgroundPaths);

    }

    createBackgroundsObjects(arrPaths) {
        for (let i = -10; i <= 10; i++) {
            const set = i % 2 === 0 ? '1' : '2';
            const x = 719 * i;
            arrPaths.forEach(path => {
                if (path.includes('set')) {
                    const realPath = path.replace('set', `${set}`);
                    this.backgroundObjects.push(new BackgroundObject(realPath, x));
                } else {
                    this.backgroundObjects.push(new BackgroundObject(path, x));
                }
            });
        }
    }

}