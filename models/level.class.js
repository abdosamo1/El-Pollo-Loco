class Level {
    enemies;
    clouds;
    backgroundObjects = [];

    constructor(enemies, clouds, backgroundPaths) {
        this.enemies = enemies;
        this.clouds = clouds;
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