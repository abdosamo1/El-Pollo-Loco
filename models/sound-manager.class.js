/** Central manager for all game audio: background/boss music and one-shot sound effects. */
class SoundManager {
    static MUTED_STORAGE_KEY = 'elPolloLoco.muted';

    backgroundMusic = new Audio('./assets/audio/background_music.mp3');
    bossMusic = new Audio('./assets/audio/boss_music.mp3');
    jumpSound = new Audio('./assets/audio/jump.mp3');
    enemyKilledSound = new Audio('./assets/audio/enemy_killed.mp3');
    winSound = new Audio('./assets/audio/win.mp3');
    loseSound = new Audio('./assets/audio/lose.mp3');
    bottleCollectedSound = new Audio('./assets/audio/bottle-collected.mp3');
    bottleSplashSound = new Audio('./assets/audio/bottle-splash.mp3');
    coinCollectedSound = new Audio('./assets/audio/coin-collected.mp3');
    hurtSound = new Audio('./assets/audio/pepe-hurt.mp3');
    snoreSound = new Audio('./assets/audio/snore.mp3');
    AllSounds = [this.backgroundMusic, this.bossMusic, this.jumpSound, this.enemyKilledSound, this.winSound,
        this.loseSound, this.snoreSound, this.bottleCollectedSound, this.bottleSplashSound, this.coinCollectedSound, this.hurtSound];
    isMuted = false;
    shouldResumeSnore = false;

    /**
     * Creates a new SoundManager instance, initializing audio elements and loading the saved mute preference.
     * @returns {void} 
     */
    constructor() {
        this.backgroundMusic.loop = true;
        this.bossMusic.loop = true;
        this.isMuted = this.loadMutedPreference();
        this.applyMuteState();
    }

    /**
     * Loads the saved mute preference from localStorage, returning false if unavailable.
     * @returns {boolean} The previously saved mute preference, or false if none/unavailable.
     */
    loadMutedPreference() {
        try {
            return localStorage.getItem(SoundManager.MUTED_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    }

    /**
     * Persists the current mute preference.
     * @returns {void}
     */
    saveMutedPreference() {
        try {
            localStorage.setItem(SoundManager.MUTED_STORAGE_KEY, String(this.isMuted));
        } catch {
            // Ignore storage errors (e.g. private browsing mode).
        }
    }

    /**
     * Toggles mute on/off, applies it to every sound, and saves the preference.
     * @returns {void}
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.applyMuteState();
        this.saveMutedPreference();
    }

    /**
     * Applies the current mute state to every audio element.
     * @returns {void}
     */
    applyMuteState() {
        this.AllSounds.forEach(sound => sound.muted = this.isMuted);
    }

    /**
     * Starts the looping background track from the beginning, stopping the boss track.
     * @returns {void}
     */
    playBackgroundMusic() {
        this.bossMusic.pause();
        this.bossMusic.currentTime = 0;
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.play().catch(() => {});
    }

    /**
     * Switches from the regular background track to the boss track.
     * @returns {void}
     */
    playBossMusic() {
        this.backgroundMusic.pause();
        this.bossMusic.currentTime = 0;
        this.bossMusic.play().catch(() => {});
    }

    /**
     * Stops both the background and boss music tracks.
     * @returns {void}
     */
    stopAllMusic() {
        this.backgroundMusic.pause();
        this.bossMusic.pause();
    }

    /**
     * Stops every sound and rewinds all audio back to the beginning.
     * @returns {void}
     */
    resetAllSounds() {
        this.AllSounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        this.shouldResumeSnore = false;
    }

    /**
     * Plays a one-shot sound effect from the start, allowing rapid replays.
     * @param {HTMLAudioElement} sound - The sound effect to play.
     * @returns {void}
     */
    playEffect(sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    /** Plays the jump sound effect. 
     * @returns {void} */
    playJumpSound() {
        this.playEffect(this.jumpSound);
    }

    /** Plays the enemy-defeated sound effect. 
     * @returns {void} */
    playEnemyKilledSound() {
        this.playEffect(this.enemyKilledSound);
    }

    /** Plays the win sound effect. 
     * @returns {void} */
    playWinSound() {
        this.playEffect(this.winSound);
    }

    /** Plays the lose sound effect. 
     * @returns {void} */
    playLoseSound() {
        this.playEffect(this.loseSound);
    }

    /** Plays the bottle-collected sound effect. 
     * @returns {void} 
    */
    playBottleCollectedSound() {
        this.playEffect(this.bottleCollectedSound);
    }

    /** Plays the bottle-splash sound effect. 
     * @returns {void} 
    */
    playBottleSplashSound() {
        this.playEffect(this.bottleSplashSound);
    }

    /** Plays the coin-collected sound effect. 
     * @returns {void} 
    */
    playCoinCollectedSound() {
        this.playEffect(this.coinCollectedSound);
    }

    /** Plays Pepe's hurt sound effect. 
     * @returns {void} 
    */
    playHurtSound() {
        this.playEffect(this.hurtSound);
    }

    /** Plays the snore sound effect. 
     * @returns {void} 
    */
    playSnoreSound() {
        this.shouldResumeSnore = true;
        this.playEffect(this.snoreSound);
    }

    /** Pauses the snore sound effect. 
     * @returns {void} 
    */
    pauseSnoreSound() {
        this.shouldResumeSnore = false;
        this.snoreSound.pause();
    }

    /** Resumes the snore sound effect if it should still be active. 
     * @returns {void} 
     */
    resumeSnoreSound() {
        if (!this.shouldResumeSnore || this.isMuted) return;
        this.snoreSound.currentTime = 0;
        this.snoreSound.play().catch(() => {});
    }
}



