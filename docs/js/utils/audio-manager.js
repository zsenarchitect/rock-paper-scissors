// Audio Manager
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.isEnabled = GameConfig.audio.enabled;
        this.volume = GameConfig.audio.volume;
        this.overlapSounds = GameConfig.audio.overlapSounds;
        
        // Initialize audio context
        this.initializeAudioContext();
        
        // Preload sounds
        this.preloadSounds();
        
        logger.info('Audio manager initialized');
    }

    // Initialize audio context
    initializeAudioContext() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Resume context on user interaction
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
            logger.info('Audio context initialized');
        } catch (error) {
            logger.error('Failed to initialize audio context', error);
            this.isEnabled = false;
        }
    }

    // Preload all sounds
    async preloadSounds() {
        if (!this.isEnabled) return;
        
        const soundEffects = GameConfig.audio.soundEffects;
        
        for (const [name, path] of Object.entries(soundEffects)) {
            try {
                await this.loadSound(name, path);
                logger.debug(`Sound loaded: ${name}`);
            } catch (error) {
                logger.warn(`Failed to load sound: ${name}`, error);
            }
        }
        
        logger.info('Sound preloading complete');
    }

    // Load individual sound
    async loadSound(name, path) {
        return new Promise((resolve, reject) => {
            // Use the path directly since config now includes .mp3 extension
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = this.volume;
            
            audio.addEventListener('canplaythrough', () => {
                this.sounds.set(name, audio);
                logger.debug(`Sound loaded successfully: ${name} -> ${path}`);
                resolve(audio);
            });
            
            audio.addEventListener('error', (error) => {
                logger.warn(`Failed to load sound: ${name} from ${path}`, error);
                reject(error);
            });
            
            audio.src = path;
        });
    }

    /**
     * Try to load a sound file, with fallback to alternative format
     */
    tryLoadSound(name, actualPath, originalPath, resolve, reject) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = this.volume;
        
        audio.addEventListener('canplaythrough', () => {
            this.sounds.set(name, audio);
            logger.debug(`Sound loaded successfully: ${name} -> ${actualPath}`);
            resolve(audio);
        });
        
        audio.addEventListener('error', (error) => {
            // Try alternative file format
            const alternativePath = this.findAlternativeSoundFile(originalPath);
            if (alternativePath && alternativePath !== actualPath) {
                logger.debug(`Trying alternative format: ${name} -> ${alternativePath}`);
                this.tryLoadSound(name, alternativePath, originalPath, resolve, reject);
            } else {
                logger.warn(`Failed to load sound: ${name} from ${actualPath}`, error);
                reject(error);
            }
        });
        
        audio.src = actualPath;
    }

    /**
     * Find the actual sound file (WAV or MP3)
     * @param {string} basePath - Base path without extension
     * @returns {string|null} - Actual file path or null if not found
     */
    findSoundFile(basePath) {
        // Remove extension if present
        const baseName = basePath.replace(/\.(wav|mp3)$/i, '');
        
        // Try WAV first, then MP3
        const extensions = ['wav', 'mp3'];
        
        // Return the first extension to try (WAV)
        // The actual file existence will be checked when loading
        return `${baseName}.${extensions[0]}`;
    }

    /**
     * Try to find an alternative sound file if the primary one fails
     * @param {string} basePath - Base path without extension
     * @returns {string|null} - Alternative file path or null if not found
     */
    findAlternativeSoundFile(basePath) {
        // Remove extension if present
        const baseName = basePath.replace(/\.(wav|mp3)$/i, '');
        
        // Try MP3 if WAV failed, or WAV if MP3 failed
        const extensions = ['mp3', 'wav'];
        
        for (const ext of extensions) {
            const fullPath = `${baseName}.${ext}`;
            return fullPath;
        }
        
        return null;
    }

    // Play sound with throttling to reduce CPU usage
    playSound(soundName, volume = null) {
        if (!this.isEnabled) return;
        
        const sound = this.sounds.get(soundName);
        if (!sound) {
            // Silently fail for missing sounds to reduce console spam
            return;
        }
        
        try {
            // Don't clone audio to reduce memory usage
            const audioToPlay = sound;
            
            // Set volume
            if (volume !== null) {
                audioToPlay.volume = volume;
            } else {
                audioToPlay.volume = this.volume;
            }
            
            // Reset to beginning
            audioToPlay.currentTime = 0;
            
            // Play sound
            const playPromise = audioToPlay.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Silently handle errors to reduce console spam
                });
            }
        } catch (error) {
            // Silently handle errors to reduce console spam
        }
    }

    // Play conversion sound
    playConversionSound(entityType) {
        const soundMap = {
            'Rock': 'rockConvert',
            'Paper': 'paperConvert',
            'Scissors': 'scissorsConvert'
        };
        
        const soundName = soundMap[entityType];
        if (soundName) {
            this.playSound(soundName);
        }
    }

    // Play UI sound
    playUISound(soundName) {
        this.playSound(soundName);
    }

    // Play error sound
    playErrorSound() {
        this.playSound('error', 0.8); // Slightly louder for errors
    }

    // Play click sound
    playClickSound() {
        this.playSound('click');
    }

    // Play vote sound
    playVoteSound() {
        this.playSound('vote');
    }

    // Play victory sound
    playVictorySound() {
        this.playSound('victory', 1.0); // Full volume for victory
    }

    // Set master volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update all loaded sounds
        for (const sound of this.sounds.values()) {
            sound.volume = this.volume;
        }
        
        logger.info(`Volume set to: ${this.volume}`);
    }

    // Enable/disable audio
    setEnabled(enabled) {
        this.isEnabled = enabled;
        logger.info(`Audio ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Get audio status
    getStatus() {
        return {
            enabled: this.isEnabled,
            volume: this.volume,
            contextState: this.audioContext ? this.audioContext.state : 'unavailable',
            loadedSounds: Array.from(this.sounds.keys())
        };
    }

    // Stop all sounds
    stopAllSounds() {
        for (const sound of this.sounds.values()) {
            sound.pause();
            sound.currentTime = 0;
        }
        
        logger.info('All sounds stopped');
    }

    // Create sound effect for debugging
    createDebugSound(frequency = 440, duration = 0.1) {
        if (!this.audioContext || !this.isEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
            logger.debug(`Debug sound played: ${frequency}Hz for ${duration}s`);
        } catch (error) {
            logger.warn('Failed to create debug sound', error);
        }
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
