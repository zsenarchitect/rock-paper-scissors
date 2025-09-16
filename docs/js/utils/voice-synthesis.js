// Voice Synthesis Utility for Commentary System
class VoiceSynthesis {
    constructor() {
        this.synthesis = null;
        this.voices = [];
        this.selectedVoice = null;
        this.isSupported = false;
        this.isEnabled = true;
        this.volume = 0.8;
        this.rate = 1.0;
        this.pitch = 1.0;
        
        // Voice queue for managing multiple speech requests
        this.speechQueue = [];
        this.isSpeaking = false;
        
        // Statistics
        this.stats = {
            totalSpeeches: 0,
            successfulSpeeches: 0,
            failedSpeeches: 0,
            averageSpeechLength: 0
        };
        
        this.initialize();
    }
    
    async initialize() {
        // Check if speech synthesis is supported
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            this.isSupported = true;
            
            // Load available voices
            await this.loadVoices();
            
            // Select appropriate voice
            this.selectVoice();
            
            logger.info('Voice synthesis initialized', {
                supported: true,
                voicesAvailable: this.voices.length,
                selectedVoice: this.selectedVoice?.name
            });
        } else {
            logger.warn('Speech synthesis not supported in this browser');
            this.isSupported = false;
        }
    }
    
    async loadVoices() {
        return new Promise((resolve) => {
            // Load voices immediately if available
            this.voices = this.synthesis.getVoices();
            
            if (this.voices.length > 0) {
                resolve();
            } else {
                // Wait for voices to load
                const onVoicesChanged = () => {
                    this.voices = this.synthesis.getVoices();
                    this.synthesis.removeEventListener('voiceschanged', onVoicesChanged);
                    resolve();
                };
                
                this.synthesis.addEventListener('voiceschanged', onVoicesChanged);
                
                // Timeout after 3 seconds
                setTimeout(() => {
                    this.synthesis.removeEventListener('voiceschanged', onVoicesChanged);
                    resolve();
                }, 3000);
            }
        });
    }
    
    selectVoice() {
        if (this.voices.length === 0) return;
        
        // Prefer English voices, especially male voices for sports commentary
        const preferredVoices = this.voices.filter(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.toLowerCase().includes('male') || 
             voice.name.toLowerCase().includes('david') ||
             voice.name.toLowerCase().includes('alex') ||
             voice.name.toLowerCase().includes('daniel'))
        );
        
        if (preferredVoices.length > 0) {
            this.selectedVoice = preferredVoices[0];
        } else {
            // Fallback to any English voice
            const englishVoices = this.voices.filter(voice => voice.lang.startsWith('en'));
            this.selectedVoice = englishVoices.length > 0 ? englishVoices[0] : this.voices[0];
        }
        
        logger.info('Voice selected', { 
            name: this.selectedVoice?.name,
            lang: this.selectedVoice?.lang 
        });
    }
    
    async speak(text) {
        if (!this.isSupported || !this.isEnabled || !text) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            try {
                // Create speech utterance
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Configure voice
                if (this.selectedVoice) {
                    utterance.voice = this.selectedVoice;
                }
                
                // Configure speech parameters
                utterance.volume = this.volume;
                utterance.rate = this.rate;
                utterance.pitch = this.pitch;
                
                // Set up event handlers
                utterance.onstart = () => {
                    this.isSpeaking = true;
                    this.stats.totalSpeeches++;
                    logger.debug('Speech started', { text: text.substring(0, 50) + '...' });
                };
                
                utterance.onend = () => {
                    this.isSpeaking = false;
                    this.stats.successfulSpeeches++;
                    this.updateAverageSpeechLength(text.length);
                    logger.debug('Speech completed');
                    resolve();
                };
                
                utterance.onerror = (event) => {
                    this.isSpeaking = false;
                    this.stats.failedSpeeches++;
                    logger.error('Speech synthesis error', { 
                        error: event.error,
                        text: text.substring(0, 50) + '...'
                    });
                    reject(new Error(`Speech synthesis error: ${event.error}`));
                };
                
                // Speak the text
                this.synthesis.speak(utterance);
                
            } catch (error) {
                this.stats.failedSpeeches++;
                logger.error('Failed to create speech utterance', { error: error.message });
                reject(error);
            }
        });
    }
    
    async speakQueued(text) {
        return new Promise((resolve) => {
            this.speechQueue.push({ text, resolve });
            this.processSpeechQueue();
        });
    }
    
    async processSpeechQueue() {
        if (this.isSpeaking || this.speechQueue.length === 0) return;
        
        const { text, resolve } = this.speechQueue.shift();
        
        try {
            await this.speak(text);
            resolve();
        } catch (error) {
            logger.error('Queued speech failed', { error: error.message });
            resolve(); // Continue processing queue even if one fails
        }
        
        // Process next item in queue
        if (this.speechQueue.length > 0) {
            setTimeout(() => this.processSpeechQueue(), 100);
        }
    }
    
    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.speechQueue = [];
            logger.info('Speech synthesis stopped');
        }
    }
    
    pause() {
        if (this.synthesis) {
            this.synthesis.pause();
            logger.info('Speech synthesis paused');
        }
    }
    
    resume() {
        if (this.synthesis) {
            this.synthesis.resume();
            logger.info('Speech synthesis resumed');
        }
    }
    
    updateAverageSpeechLength(length) {
        const total = this.stats.averageSpeechLength * (this.stats.successfulSpeeches - 1) + length;
        this.stats.averageSpeechLength = total / this.stats.successfulSpeeches;
    }
    
    // Voice configuration methods
    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.selectedVoice = voice;
            logger.info('Voice changed', { name: voiceName });
        } else {
            logger.warn('Voice not found', { name: voiceName });
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        logger.info('Voice volume updated', { volume: this.volume });
    }
    
    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(10, rate));
        logger.info('Voice rate updated', { rate: this.rate });
    }
    
    setPitch(pitch) {
        this.pitch = Math.max(0, Math.min(2, pitch));
        logger.info('Voice pitch updated', { pitch: this.pitch });
    }
    
    // Utility methods
    getAvailableVoices() {
        return this.voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            default: voice.default
        }));
    }
    
    isSupported() {
        return this.isSupported;
    }
    
    enable() {
        this.isEnabled = true;
        logger.info('Voice synthesis enabled');
    }
    
    disable() {
        this.isEnabled = false;
        this.stop();
        logger.info('Voice synthesis disabled');
    }
    
    getStatistics() {
        return {
            ...this.stats,
            isSupported: this.isSupported,
            isEnabled: this.isEnabled,
            isSpeaking: this.isSpeaking,
            queueLength: this.speechQueue.length,
            selectedVoice: this.selectedVoice?.name,
            volume: this.volume,
            rate: this.rate,
            pitch: this.pitch
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceSynthesis;
}
