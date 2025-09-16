// Game Configuration
const GameConfig = {
    // Game Settings
    game: {
        symbols: ['Rock', 'Paper', 'Scissors'],
        countPerSymbol: 15, // Reduced from 40 to 15 for better performance
        canvasWidth: 800,
        canvasHeight: 600,
        fps: 30, // Reduced from 60 to 30 FPS
        battleDuration: 300000, // 5 minutes in milliseconds
        conversionRadius: 20,
        avoidanceRadius: 30,
        movementSpeed: 2,
        maxEntities: 100 // Reduced from 200 to 100
    },

    // Visual Settings
    visual: {
        particleEffects: false, // Disabled for performance
        trailEffects: false, // Disabled for performance
        celebrationEffects: false, // Disabled for performance
        showDebugOverlay: false,
        showCollisionBounds: false,
        showEntityPaths: false,
        drawGrid: false // Disabled grid drawing for performance
    },

    // Audio Settings
    audio: {
        enabled: true,
        volume: 0.7,
        overlapSounds: true,
        soundEffects: {
            rockConvert: 'assets/sounds/effects/rock-convert.mp3',
            paperConvert: 'assets/sounds/effects/paper-convert.mp3',
            scissorsConvert: 'assets/sounds/effects/scissors-convert.mp3',
            click: 'assets/sounds/ui/click.mp3',
            vote: 'assets/sounds/ui/vote.mp3',
            victory: 'assets/sounds/ui/victory.mp3',
            error: 'assets/sounds/ui/error.mp3'
        }
    },

    // AI Settings
    ai: {
        enabled: true,
        strategyEvolution: true,
        mutationRate: 0.1,
        crossoverRate: 0.8,
        populationSize: 50,
        generations: 100,
        fitnessThreshold: 0.8
    },

    // OpenAI Commentary Settings
    openai: {
        enabled: true,
        model: 'gpt-3.5-turbo',
        maxTokens: 150,
        temperature: 0.8,
        rateLimitDelay: 1000, // 1 second between requests
        fallbackEnabled: true,
        voiceSynthesis: true,
        commentaryCooldown: 3000 // 3 seconds between commentaries
    },

    // Room Settings
    rooms: {
        default: 'restaurant',
        themes: {
            restaurant: {
                name: 'Restaurant Wars',
                teams: ['McDonald\'s', 'Burger King', 'KFC'],
                colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
                sprites: ['mcdonalds.png', 'burger-king.png', 'kfc.png']
            },
            ideology: {
                name: 'Ideology Clash',
                teams: ['Liberal', 'Conservative', 'Progressive'],
                colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
                sprites: ['liberal.png', 'conservative.png', 'progressive.png']
            },
            brand: {
                name: 'Brand Battle',
                teams: ['Coca-Cola', 'Pepsi', 'Sprite'],
                colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
                sprites: ['coca-cola.png', 'pepsi.png', 'sprite.png']
            }
        }
    },

    // Voting Settings
    voting: {
        enabled: true,
        maxVotesPerUser: 10,
        voteCooldown: 1000, // 1 second
        realTimeUpdates: true,
        showVoteCount: true
    },

    // Analytics Settings
    analytics: {
        enabled: true,
        trackPerformance: true,
        trackUserBehavior: true,
        trackBattleStats: true,
        exportData: true
    },

    // Debug Settings
    debug: {
        enabled: false,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        showFPS: true,
        showEntityCount: true,
        showCollisionCount: true,
        showPerformanceMetrics: true,
        traceFunctionCalls: false
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}
