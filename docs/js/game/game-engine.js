// Game Engine
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.battleStartTime = 0;
        this.battleDuration = GameConfig.game.battleDuration;
        
        // Game state
        this.entities = new Map();
        this.entityManager = null;
        this.collisionSystem = null;
        this.physicsEngine = null;
        
        // Battle statistics
        this.battleStats = {
            totalConversions: 0,
            activePlayers: 0,
            battleTime: 0,
            teamCounts: { 1: 0, 2: 0, 3: 0 }
        };
        
        // Event callbacks
        this.onBattleStart = null;
        this.onBattleEnd = null;
        this.onEntityConverted = null;
        this.onEntityDied = null;
        
        // Performance tracking
        this.performanceMetrics = {
            fps: 0,
            frameCount: 0,
            lastFpsUpdate: 0,
            averageFrameTime: 0
        };
        
        logger.info('Game engine initialized', {
            canvas: canvas.id,
            width: canvas.width,
            height: canvas.height
        });
    }

    // Initialize game systems
    initialize() {
        try {
            // Initialize entity manager
            this.entityManager = new EntityManager();
            
            // Initialize collision system
            this.collisionSystem = new CollisionSystem();
            
            // Initialize physics engine
            this.physicsEngine = new PhysicsEngine();
            
            // Setup event listeners
            this.setupEventListeners();
            
            logger.info('Game engine systems initialized');
            return true;
        } catch (error) {
            logger.error('Failed to initialize game engine', error);
            return false;
        }
    }

    // Start the game
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.battleStartTime = Date.now();
        this.lastTime = performance.now();
        
        // Create initial entities
        this.createInitialEntities();
        
        // Start game loop
        this.gameLoop();
        
        logger.info('Game started', {
            battleStartTime: this.battleStartTime,
            entityCount: this.entities.size
        });
        
        if (this.onBattleStart) {
            this.onBattleStart();
        }
    }

    // Pause the game
    pause() {
        this.isPaused = !this.isPaused;
        logger.info(`Game ${this.isPaused ? 'paused' : 'resumed'}`);
    }

    // Stop the game
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        
        logger.info('Game stopped', {
            battleDuration: this.battleStats.battleTime,
            totalConversions: this.battleStats.totalConversions
        });
        
        if (this.onBattleEnd) {
            this.onBattleEnd(this.battleStats);
        }
    }

    // Reset the game
    reset() {
        this.stop();
        this.entities.clear();
        this.battleStats = {
            totalConversions: 0,
            activePlayers: 0,
            battleTime: 0,
            teamCounts: { 1: 0, 2: 0, 3: 0 }
        };
        
        logger.info('Game reset');
    }

    // Create initial entities
    createInitialEntities() {
        const symbols = GameConfig.game.symbols;
        const countPerSymbol = GameConfig.game.countPerSymbol;
        
        for (let team = 1; team <= 3; team++) {
            const symbol = symbols[team - 1];
            this.battleStats.teamCounts[team] = countPerSymbol;
            
            for (let i = 0; i < countPerSymbol; i++) {
                const entity = new BaseEntity(
                    `${symbol.toLowerCase()}_${team}_${i}`,
                    symbol,
                    this.getRandomPosition(),
                    team
                );
                
                this.entities.set(entity.id, entity);
            }
        }
        
        this.battleStats.activePlayers = this.entities.size;
        logger.info('Initial entities created', {
            totalEntities: this.entities.size,
            teamCounts: this.battleStats.teamCounts
        });
    }

    // Get random position within canvas
    getRandomPosition() {
        const margin = 50;
        return {
            x: MathUtils.random(margin, this.canvas.width - margin),
            y: MathUtils.random(margin, this.canvas.height - margin)
        };
    }

    // Main game loop
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        if (!this.isPaused) {
            // Update game state
            this.update(this.deltaTime);
            
            // Render game
            this.render();
        }
        
        // Check if battle should end
        this.checkBattleEnd();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    // Update game state
    update(deltaTime) {
        // Update battle time
        this.battleStats.battleTime = Date.now() - this.battleStartTime;
        
        // Update entities
        this.updateEntities(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update statistics
        this.updateStatistics();
        
        // Update entity manager
        if (this.entityManager) {
            this.entityManager.update(deltaTime, this.getGameState());
        }
    }

    // Update all entities
    updateEntities(deltaTime) {
        const gameState = this.getGameState();
        
        for (const entity of this.entities.values()) {
            if (entity.isAlive) {
                entity.update(deltaTime, gameState);
            }
        }
    }

    // Check collisions between entities
    checkCollisions() {
        if (!this.collisionSystem) return;
        
        const entities = Array.from(this.entities.values()).filter(e => e.isAlive);
        
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entity1 = entities[i];
                const entity2 = entities[j];
                
                if (this.collisionSystem.checkCollision(entity1, entity2)) {
                    this.handleCollision(entity1, entity2);
                }
            }
        }
    }

    // Handle collision between two entities
    handleCollision(entity1, entity2) {
        // Check if entities can convert each other
        if (this.canConvert(entity1, entity2)) {
            // Determine who converts whom based on Rock Paper Scissors rules
            const winner = this.getWinner(entity1, entity2);
            const loser = winner === entity1 ? entity2 : entity1;
            
            winner.convert(loser);
            this.battleStats.totalConversions++;
            
            if (this.onEntityConverted) {
                this.onEntityConverted(winner, loser);
            }
        }
    }

    // Check if entity1 can convert entity2
    canConvert(entity1, entity2) {
        if (entity1.team === entity2.team) return false;
        
        const rules = {
            'Rock': 'Scissors',
            'Paper': 'Rock',
            'Scissors': 'Paper'
        };
        
        return rules[entity1.type] === entity2.type;
    }

    // Get winner of Rock Paper Scissors
    getWinner(entity1, entity2) {
        if (this.canConvert(entity1, entity2)) return entity1;
        if (this.canConvert(entity2, entity1)) return entity2;
        return null; // Tie
    }

    // Update game statistics
    updateStatistics() {
        const aliveEntities = Array.from(this.entities.values()).filter(e => e.isAlive);
        this.battleStats.activePlayers = aliveEntities.length;
        
        // Count entities by team
        this.battleStats.teamCounts = { 1: 0, 2: 0, 3: 0 };
        for (const entity of aliveEntities) {
            this.battleStats.teamCounts[entity.team]++;
        }
    }

    // Update performance metrics
    updatePerformanceMetrics() {
        this.performanceMetrics.frameCount++;
        
        const now = Date.now();
        if (now - this.performanceMetrics.lastFpsUpdate >= 1000) {
            this.performanceMetrics.fps = this.performanceMetrics.frameCount;
            this.performanceMetrics.frameCount = 0;
            this.performanceMetrics.lastFpsUpdate = now;
        }
        
        this.performanceMetrics.averageFrameTime = this.deltaTime;
    }

    // Check if battle should end
    checkBattleEnd() {
        const aliveEntities = Array.from(this.entities.values()).filter(e => e.isAlive);
        const uniqueTeams = new Set(aliveEntities.map(e => e.team));
        
        // Battle ends when only one team remains or time limit reached
        if (uniqueTeams.size <= 1 || this.battleStats.battleTime >= this.battleDuration) {
            this.endBattle();
        }
    }

    // End the battle
    endBattle() {
        const aliveEntities = Array.from(this.entities.values()).filter(e => e.isAlive);
        const winner = aliveEntities.length > 0 ? aliveEntities[0].team : null;
        
        logger.info('Battle ended', {
            winner,
            battleDuration: this.battleStats.battleTime,
            totalConversions: this.battleStats.totalConversions,
            finalTeamCounts: this.battleStats.teamCounts
        });
        
        this.stop();
    }

    // Render the game
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw entities
        this.drawEntities();
        
        // Draw UI overlay
        this.drawUI();
        
        // Draw debug overlay if enabled
        if (GameConfig.debug.enabled) {
            this.drawDebugOverlay();
        }
    }

    // Draw background
    drawBackground() {
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    // Draw all entities
    drawEntities() {
        for (const entity of this.entities.values()) {
            if (entity.isAlive) {
                entity.render(this.ctx);
            }
        }
    }

    // Draw UI overlay
    drawUI() {
        // This will be handled by the main app
    }

    // Draw debug overlay
    drawDebugOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 200, 100);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`FPS: ${this.performanceMetrics.fps}`, 20, 30);
        this.ctx.fillText(`Entities: ${this.entities.size}`, 20, 50);
        this.ctx.fillText(`Conversions: ${this.battleStats.totalConversions}`, 20, 70);
        this.ctx.fillText(`Battle Time: ${Math.floor(this.battleStats.battleTime / 1000)}s`, 20, 90);
    }

    // Get current game state
    getGameState() {
        return {
            entities: Array.from(this.entities.values()),
            battleStats: this.battleStats,
            battleTime: this.battleStats.battleTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused
        };
    }

    // Add entity to game
    addEntity(entity) {
        this.entities.set(entity.id, entity);
        this.battleStats.activePlayers++;
        logger.debug(`Entity added: ${entity.id}`);
    }

    // Remove entity from game
    removeEntity(id) {
        const entity = this.entities.get(id);
        if (entity) {
            this.entities.delete(id);
            this.battleStats.activePlayers--;
            logger.debug(`Entity removed: ${id}`);
        }
    }

    // Get entity by ID
    getEntity(id) {
        return this.entities.get(id);
    }

    // Setup event listeners
    setupEventListeners() {
        // Canvas click events
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Handle canvas click
            this.handleCanvasClick(x, y);
        });
    }

    // Handle canvas click
    handleCanvasClick(x, y) {
        // Find closest entity
        let closestEntity = null;
        let closestDistance = Infinity;
        
        for (const entity of this.entities.values()) {
            if (!entity.isAlive) continue;
            
            const distance = MathUtils.distance({ x, y }, entity.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEntity = entity;
            }
        }
        
        if (closestEntity && closestDistance < 50) {
            logger.debug(`Clicked on entity: ${closestEntity.id}`);
            // Handle entity click
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
