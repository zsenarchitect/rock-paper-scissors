// Collision System
class CollisionSystem {
    constructor() {
        this.spatialGrid = new Map();
        this.gridSize = 50;
        this.collisionPairs = [];
        
        logger.info('Collision system initialized');
    }

    // Check collision between two entities
    checkCollision(entity1, entity2) {
        if (!entity1.isAlive || !entity2.isAlive) return false;
        if (entity1.id === entity2.id) return false;
        
        const distance = MathUtils.distance(entity1.position, entity2.position);
        const collisionRadius = entity1.radius + entity2.radius;
        
        return distance <= collisionRadius;
    }

    // Check collision with conversion radius
    checkConversionCollision(entity1, entity2) {
        if (!entity1.isAlive || !entity2.isAlive) return false;
        if (entity1.id === entity2.id) return false;
        if (entity1.team === entity2.team) return false;
        
        const distance = MathUtils.distance(entity1.position, entity2.position);
        const conversionRadius = GameConfig.game.conversionRadius;
        
        return distance <= conversionRadius;
    }

    // Check collision with avoidance radius
    checkAvoidanceCollision(entity1, entity2) {
        if (!entity1.isAlive || !entity2.isAlive) return false;
        if (entity1.id === entity2.id) return false;
        
        const distance = MathUtils.distance(entity1.position, entity2.position);
        const avoidanceRadius = GameConfig.game.avoidanceRadius;
        
        return distance <= avoidanceRadius;
    }

    // Update spatial grid
    updateSpatialGrid(entities) {
        this.spatialGrid.clear();
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            
            const gridX = Math.floor(entity.position.x / this.gridSize);
            const gridY = Math.floor(entity.position.y / this.gridSize);
            const key = `${gridX},${gridY}`;
            
            if (!this.spatialGrid.has(key)) {
                this.spatialGrid.set(key, []);
            }
            
            this.spatialGrid.get(key).push(entity);
        }
    }

    // Get entities in same grid cell
    getEntitiesInCell(gridX, gridY) {
        const key = `${gridX},${gridY}`;
        return this.spatialGrid.get(key) || [];
    }

    // Get entities in nearby cells
    getNearbyEntities(entity) {
        const gridX = Math.floor(entity.position.x / this.gridSize);
        const gridY = Math.floor(entity.position.y / this.gridSize);
        const nearby = [];
        
        // Check 3x3 grid around entity
        for (let x = gridX - 1; x <= gridX + 1; x++) {
            for (let y = gridY - 1; y <= gridY + 1; y++) {
                const entities = this.getEntitiesInCell(x, y);
                nearby.push(...entities);
            }
        }
        
        // Remove duplicates and self
        return nearby.filter(e => e.id !== entity.id);
    }

    // Check all collisions using spatial partitioning
    checkAllCollisions(entities) {
        this.updateSpatialGrid(entities);
        this.collisionPairs = [];
        
        const checked = new Set();
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            
            const nearby = this.getNearbyEntities(entity);
            
            for (const other of nearby) {
                if (!other.isAlive) continue;
                if (checked.has(`${other.id}-${entity.id}`)) continue;
                
                if (this.checkCollision(entity, other)) {
                    this.collisionPairs.push({ entity1: entity, entity2: other });
                    checked.add(`${entity.id}-${other.id}`);
                }
            }
        }
        
        return this.collisionPairs;
    }

    // Check conversion collisions
    checkConversionCollisions(entities) {
        const conversionPairs = [];
        const checked = new Set();
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            
            const nearby = this.getNearbyEntities(entity);
            
            for (const other of nearby) {
                if (!other.isAlive) continue;
                if (checked.has(`${other.id}-${entity.id}`)) continue;
                
                if (this.checkConversionCollision(entity, other)) {
                    conversionPairs.push({ entity1: entity, entity2: other });
                    checked.add(`${entity.id}-${other.id}`);
                }
            }
        }
        
        return conversionPairs;
    }

    // Check avoidance collisions
    checkAvoidanceCollisions(entities) {
        const avoidancePairs = [];
        const checked = new Set();
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            
            const nearby = this.getNearbyEntities(entity);
            
            for (const other of nearby) {
                if (!other.isAlive) continue;
                if (checked.has(`${other.id}-${entity.id}`)) continue;
                
                if (this.checkAvoidanceCollision(entity, other)) {
                    avoidancePairs.push({ entity1: entity, entity2: other });
                    checked.add(`${entity.id}-${other.id}`);
                }
            }
        }
        
        return avoidancePairs;
    }

    // Get collision statistics
    getCollisionStats() {
        return {
            totalCollisions: this.collisionPairs.length,
            spatialGridSize: this.spatialGrid.size,
            gridSize: this.gridSize
        };
    }

    // Debug: Draw collision bounds
    drawCollisionBounds(ctx, entities) {
        if (!GameConfig.debug.enabled) return;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            
            // Draw collision radius
            ctx.beginPath();
            ctx.arc(entity.position.x, entity.position.y, entity.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw conversion radius
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(entity.position.x, entity.position.y, GameConfig.game.conversionRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw avoidance radius
            ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(entity.position.x, entity.position.y, GameConfig.game.avoidanceRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        }
        
        ctx.restore();
    }

    // Debug: Draw spatial grid
    drawSpatialGrid(ctx, canvasWidth, canvasHeight) {
        if (!GameConfig.debug.enabled) return;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= canvasWidth; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= canvasHeight; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollisionSystem;
}
