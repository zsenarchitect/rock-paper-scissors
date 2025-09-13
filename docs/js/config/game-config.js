// Game Configuration
const GameConfig = {
    // Game Settings
    game: {
        symbols: ['Rock', 'Paper', 'Scissors'],
        countPerSymbol: 40,
        canvasWidth: 800,
        canvasHeight: 600,
        fps: 60,
        battleDuration: 300000, // 5 minutes in milliseconds
        conversionRadius: 20,
        avoidanceRadius: 30,
        movementSpeed: 2,
        maxEntities: 200
    },

    // Visual Settings
    visual: {
        particleEffects: true,
        trailEffects: true,
        celebrationEffects: true,
        showDebugOverlay: false,
        showCollisionBounds: false,
        showEntityPaths: false
    },

    // Audio Settings
    audio: {
        enabled: true,
        volume: 0.7,
        overlapSounds: true,
        soundEffects: {
            rockConvert: 'sounds/effects/rock-convert',
            paperConvert: 'sounds/effects/paper-convert',
            scissorsConvert: 'sounds/effects/scissors-convert',
            click: 'sounds/ui/click',
            vote: 'sounds/ui/vote',
            victory: 'sounds/ui/victory',
            error: 'sounds/ui/error'
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
