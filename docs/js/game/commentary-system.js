// Commentary System for Rock Paper Scissors Battle Royale
class CommentarySystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.openAIClient = new OpenAIClient();
        this.voiceSynthesis = new VoiceSynthesis();
        
        // Commentary state
        this.isEnabled = true;
        this.lastCommentaryTime = 0;
        this.commentaryCooldown = 3000; // 3 seconds between commentaries
        this.commentaryQueue = [];
        this.isProcessingQueue = false;
        
        // Event tracking for context
        this.lastEventTime = 0;
        this.consecutiveEvents = 0;
        this.battleIntensity = 0;
        
        // Commentary history for variety
        this.commentaryHistory = [];
        this.maxHistorySize = 10;
        
        // Statistics for commentary context
        this.commentaryStats = {
            totalCommentaries: 0,
            openAIGenerated: 0,
            fallbackUsed: 0,
            voiceSynthesized: 0
        };
        
        this.initialize();
    }
    
    initialize() {
        // Bind to game engine events
        this.bindToGameEvents();
        
        logger.info('Commentary system initialized', {
            enabled: this.isEnabled,
            openAIEnabled: this.openAIClient.isEnabled
        });
    }
    
    bindToGameEvents() {
        // Battle start event
        this.gameEngine.onBattleStart = () => {
            this.triggerCommentary('battleStart', {
                battleTime: 0,
                teamCounts: this.getCurrentTeamCounts(),
                totalConversions: 0
            });
        };
        
        // Battle end event
        this.gameEngine.onBattleEnd = (winner) => {
            this.triggerCommentary('victory', {
                battleTime: this.gameEngine.battleStats.battleTime,
                teamCounts: this.getCurrentTeamCounts(),
                totalConversions: this.gameEngine.battleStats.totalConversions,
                winner: winner
            });
        };
        
        // Entity conversion event
        this.gameEngine.onEntityConverted = (converter, converted) => {
            this.triggerCommentary('conversion', {
                battleTime: this.gameEngine.battleStats.battleTime,
                teamCounts: this.getCurrentTeamCounts(),
                totalConversions: this.gameEngine.battleStats.totalConversions,
                converter: converter,
                converted: converted
            });
        };
        
        // Entity elimination event
        this.gameEngine.onEntityDied = (entity) => {
            this.triggerCommentary('elimination', {
                battleTime: this.gameEngine.battleStats.battleTime,
                teamCounts: this.getCurrentTeamCounts(),
                totalConversions: this.gameEngine.battleStats.totalConversions,
                eliminated: entity
            });
        };
        
        // Periodic intense moments
        setInterval(() => {
            if (this.gameEngine.isRunning && this.shouldTriggerIntenseCommentary()) {
                this.triggerCommentary('intense', {
                    battleTime: this.gameEngine.battleStats.battleTime,
                    teamCounts: this.getCurrentTeamCounts(),
                    totalConversions: this.gameEngine.battleStats.totalConversions,
                    intensity: this.battleIntensity
                });
            }
        }, 10000); // Check every 10 seconds
    }
    
    async triggerCommentary(type, context) {
        if (!this.isEnabled) return;
        
        // Check cooldown
        const now = Date.now();
        if (now - this.lastCommentaryTime < this.commentaryCooldown) {
            this.queueCommentary(type, context);
            return;
        }
        
        await this.generateAndSpeakCommentary(type, context);
    }
    
    queueCommentary(type, context) {
        this.commentaryQueue.push({ type, context, timestamp: Date.now() });
        
        // Process queue if not already processing
        if (!this.isProcessingQueue) {
            this.processCommentaryQueue();
        }
    }
    
    async processCommentaryQueue() {
        if (this.isProcessingQueue || this.commentaryQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        while (this.commentaryQueue.length > 0) {
            const now = Date.now();
            if (now - this.lastCommentaryTime >= this.commentaryCooldown) {
                const commentary = this.commentaryQueue.shift();
                await this.generateAndSpeakCommentary(commentary.type, commentary.context);
            } else {
                // Wait for cooldown
                await new Promise(resolve => setTimeout(resolve, this.commentaryCooldown - (now - this.lastCommentaryTime)));
            }
        }
        
        this.isProcessingQueue = false;
    }
    
    async generateAndSpeakCommentary(type, context) {
        try {
            // Add type to context
            context.type = type;
            
            // Generate commentary
            const commentary = await this.openAIClient.generateCommentary(context);
            
            // Track statistics
            this.commentaryStats.totalCommentaries++;
            if (this.openAIClient.isEnabled) {
                this.commentaryStats.openAIGenerated++;
            } else {
                this.commentaryStats.fallbackUsed++;
            }
            
            // Add to history
            this.addToHistory(commentary);
            
            // Display commentary
            this.displayCommentary(commentary);
            
            // Synthesize voice
            if (this.voiceSynthesis.isSupported()) {
                await this.voiceSynthesis.speak(commentary);
                this.commentaryStats.voiceSynthesized++;
            }
            
            this.lastCommentaryTime = Date.now();
            
            logger.info('Commentary generated and spoken', {
                type,
                commentary: commentary.substring(0, 50) + '...',
                openAIGenerated: this.openAIClient.isEnabled
            });
            
        } catch (error) {
            logger.error('Failed to generate commentary', { error: error.message, type });
        }
    }
    
    displayCommentary(commentary) {
        // Create or update commentary display element
        let commentaryElement = document.getElementById('commentary-display');
        
        if (!commentaryElement) {
            commentaryElement = document.createElement('div');
            commentaryElement.id = 'commentary-display';
            commentaryElement.className = 'commentary-display';
            commentaryElement.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                font-family: 'Arial', sans-serif;
                font-size: 16px;
                font-weight: bold;
                text-align: center;
                z-index: 1000;
                max-width: 80%;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                border: 2px solid #ff6b6b;
                animation: commentarySlideIn 0.5s ease-out;
            `;
            
            // Add CSS animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes commentarySlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                @keyframes commentarySlideOut {
                    from {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(commentaryElement);
        }
        
        // Update commentary text
        commentaryElement.textContent = commentary;
        
        // Add slide-in animation
        commentaryElement.style.animation = 'commentarySlideIn 0.5s ease-out';
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            if (commentaryElement) {
                commentaryElement.style.animation = 'commentarySlideOut 0.5s ease-in';
                setTimeout(() => {
                    if (commentaryElement && commentaryElement.parentNode) {
                        commentaryElement.parentNode.removeChild(commentaryElement);
                    }
                }, 500);
            }
        }, 4000);
    }
    
    getCurrentTeamCounts() {
        const counts = { rock: 0, paper: 0, scissors: 0 };
        
        this.gameEngine.entities.forEach(entity => {
            switch (entity.type) {
                case 'rock':
                    counts.rock++;
                    break;
                case 'paper':
                    counts.paper++;
                    break;
                case 'scissors':
                    counts.scissors++;
                    break;
            }
        });
        
        return counts;
    }
    
    shouldTriggerIntenseCommentary() {
        const now = Date.now();
        const timeSinceLastEvent = now - this.lastEventTime;
        
        // Increase intensity based on recent activity
        if (timeSinceLastEvent < 5000) { // 5 seconds
            this.battleIntensity = Math.min(this.battleIntensity + 0.1, 1.0);
        } else {
            this.battleIntensity = Math.max(this.battleIntensity - 0.05, 0);
        }
        
        // Trigger intense commentary if intensity is high and enough time has passed
        return this.battleIntensity > 0.6 && timeSinceLastEvent > 15000; // 15 seconds
    }
    
    addToHistory(commentary) {
        this.commentaryHistory.unshift(commentary);
        if (this.commentaryHistory.length > this.maxHistorySize) {
            this.commentaryHistory.pop();
        }
    }
    
    // Public methods for external control
    enable() {
        this.isEnabled = true;
        logger.info('Commentary system enabled');
    }
    
    disable() {
        this.isEnabled = false;
        logger.info('Commentary system disabled');
    }
    
    setCooldown(milliseconds) {
        this.commentaryCooldown = milliseconds;
        logger.info('Commentary cooldown updated', { cooldown: milliseconds });
    }
    
    getStatistics() {
        return {
            ...this.commentaryStats,
            queueLength: this.commentaryQueue.length,
            isProcessing: this.isProcessingQueue,
            battleIntensity: this.battleIntensity
        };
    }
    
    clearQueue() {
        this.commentaryQueue = [];
        logger.info('Commentary queue cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommentarySystem;
}
