// Entity Manager
class EntityManager {
    constructor() {
        this.entities = new Map();
        this.entityTypes = new Map();
        this.spawnPoints = [];
        this.maxEntities = GameConfig.game.maxEntities;
        
        logger.info('Entity manager initialized');
    }

    // Initialize entity types
    initialize() {
        this.entityTypes.set('Rock', RockEntity);
        this.entityTypes.set('Paper', PaperEntity);
        this.entityTypes.set('Scissors', ScissorsEntity);
        
        logger.info('Entity types registered', Array.from(this.entityTypes.keys()));
    }

    // Create entity
    createEntity(type, position, team, id = null) {
        const EntityClass = this.entityTypes.get(type);
        if (!EntityClass) {
            logger.error(`Unknown entity type: ${type}`);
            return null;
        }
        
        const entityId = id || this.generateEntityId(type, team);
        const entity = new EntityClass(entityId, type, position, team);
        
        this.entities.set(entityId, entity);
        
        logger.debug(`Entity created: ${entityId}`, {
            type,
            team,
            position
        });
        
        return entity;
    }

    // Generate unique entity ID
    generateEntityId(type, team) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${type.toLowerCase()}_${team}_${timestamp}_${random}`;
    }

    // Update all entities
    update(deltaTime, gameState) {
        for (const entity of this.entities.values()) {
            if (entity.isAlive) {
                entity.update(deltaTime, gameState);
            }
        }
    }

    // Get entity by ID
    getEntity(id) {
        return this.entities.get(id);
    }

    // Get all entities
    getAllEntities() {
        return Array.from(this.entities.values());
    }

    // Get entities by team
    getEntitiesByTeam(team) {
        return Array.from(this.entities.values()).filter(e => e.team === team);
    }

    // Get entities by type
    getEntitiesByType(type) {
        return Array.from(this.entities.values()).filter(e => e.type === type);
    }

    // Get alive entities
    getAliveEntities() {
        return Array.from(this.entities.values()).filter(e => e.isAlive);
    }

    // Remove entity
    removeEntity(id) {
        const entity = this.entities.get(id);
        if (entity) {
            this.entities.delete(id);
            logger.debug(`Entity removed: ${id}`);
            return true;
        }
        return false;
    }

    // Clear all entities
    clear() {
        this.entities.clear();
        logger.info('All entities cleared');
    }

    // Get entity count
    getEntityCount() {
        return this.entities.size;
    }

    // Get alive entity count
    getAliveEntityCount() {
        return this.getAliveEntities().length;
    }

    // Get team counts
    getTeamCounts() {
        const counts = { 1: 0, 2: 0, 3: 0 };
        for (const entity of this.entities.values()) {
            if (entity.isAlive) {
                counts[entity.team]++;
            }
        }
        return counts;
    }

    // Get type counts
    getTypeCounts() {
        const counts = { Rock: 0, Paper: 0, Scissors: 0 };
        for (const entity of this.entities.values()) {
            if (entity.isAlive) {
                counts[entity.type]++;
            }
        }
        return counts;
    }

    // Find nearest entity
    findNearestEntity(position, excludeId = null) {
        let nearest = null;
        let nearestDistance = Infinity;
        
        for (const entity of this.entities.values()) {
            if (!entity.isAlive || entity.id === excludeId) continue;
            
            const distance = MathUtils.distance(position, entity.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = entity;
            }
        }
        
        return nearest;
    }

    // Find entities in radius
    findEntitiesInRadius(position, radius) {
        const entities = [];
        
        for (const entity of this.entities.values()) {
            if (!entity.isAlive) continue;
            
            const distance = MathUtils.distance(position, entity.position);
            if (distance <= radius) {
                entities.push({ entity, distance });
            }
        }
        
        return entities.sort((a, b) => a.distance - b.distance);
    }

    // Spawn entity at random position
    spawnRandomEntity(type, team, canvasWidth, canvasHeight) {
        const position = {
            x: MathUtils.random(50, canvasWidth - 50),
            y: MathUtils.random(50, canvasHeight - 50)
        };
        
        return this.createEntity(type, position, team);
    }

    // Spawn entities for team
    spawnTeamEntities(team, count, canvasWidth, canvasHeight) {
        const symbols = GameConfig.game.symbols;
        const symbol = symbols[team - 1];
        const entities = [];
        
        for (let i = 0; i < count; i++) {
            const entity = this.spawnRandomEntity(symbol, team, canvasWidth, canvasHeight);
            if (entity) {
                entities.push(entity);
            }
        }
        
        logger.info(`Spawned ${entities.length} entities for team ${team}`, {
            team,
            symbol,
            count: entities.length
        });
        
        return entities;
    }

    // Get performance metrics
    getPerformanceMetrics() {
        const aliveEntities = this.getAliveEntities();
        const teamCounts = this.getTeamCounts();
        const typeCounts = this.getTypeCounts();
        
        return {
            totalEntities: this.entities.size,
            aliveEntities: aliveEntities.length,
            teamCounts,
            typeCounts,
            averageHealth: aliveEntities.reduce((sum, e) => sum + e.health, 0) / aliveEntities.length || 0,
            averageConversions: aliveEntities.reduce((sum, e) => sum + e.conversions, 0) / aliveEntities.length || 0
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EntityManager;
}
