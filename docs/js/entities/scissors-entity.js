// Scissors Entity
class ScissorsEntity extends BaseEntity {
    constructor(id, position, team) {
        super(id, 'Scissors', position, team);
        
        // Scissors-specific properties
        this.attackPower = 1.1;
        this.defensePower = 0.9;
        this.speed = GameConfig.game.movementSpeed * 1.2; // Fastest
        this.radius = 14; // Smallest
        
        // Scissors-specific behavior
        this.aggression = 0.9; // Highest aggression
        this.patience = 0.4; // Low patience
        this.grouping = 0.3; // Prefers to be alone
        
        logger.debug(`Scissors entity created: ${id}`, {
            position,
            team,
            attackPower: this.attackPower,
            defensePower: this.defensePower
        });
    }

    // Scissors-specific AI behavior
    updateAI(deltaTime, gameState) {
        if (!this.strategy) {
            this.strategy = new ScissorsStrategy();
        }
        
        const decision = this.strategy.decide(this, gameState);
        this.applyDecision(decision, deltaTime);
    }

    // Scissors-specific rendering
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // Apply transformations
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // Set color and alpha
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        
        // Draw scissors shape (X shape)
        ctx.beginPath();
        // First blade
        ctx.moveTo(-this.radius, -this.radius);
        ctx.lineTo(this.radius * 0.3, -this.radius * 0.3);
        ctx.lineTo(this.radius, this.radius);
        ctx.lineTo(this.radius * 0.3, this.radius * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Second blade
        ctx.beginPath();
        ctx.moveTo(this.radius, -this.radius);
        ctx.lineTo(this.radius * 0.3, -this.radius * 0.3);
        ctx.lineTo(-this.radius, this.radius);
        ctx.lineTo(-this.radius * 0.3, this.radius * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Draw scissors handle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw team indicator
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.team.toString(), 0, 3);
        
        // Draw conversion indicator
        if (this.isConverting) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Scissors Strategy
class ScissorsStrategy {
    constructor() {
        this.name = 'ScissorsStrategy';
        this.aggression = 0.9;
        this.patience = 0.4;
        this.grouping = 0.3;
    }

    decide(entity, gameState) {
        const nearbyEntities = this.getNearbyEntities(entity, gameState.entities);
        const enemies = nearbyEntities.filter(e => e.team !== entity.team && e.isAlive);
        const allies = nearbyEntities.filter(e => e.team === entity.team && e.isAlive);
        const targets = enemies.filter(e => e.type === 'Paper');
        
        // Priority 1: Attack Paper (Scissors beats Paper)
        if (targets.length > 0) {
            const closestTarget = this.getClosestEntity(entity, targets);
            if (closestTarget) {
                return {
                    action: 'attack',
                    target: closestTarget,
                    direction: MathUtils.subtract(closestTarget.position, entity.position)
                };
            }
        }
        
        // Priority 2: Avoid Rock (Rock beats Scissors)
        const rockEnemies = enemies.filter(e => e.type === 'Rock');
        if (rockEnemies.length > 0) {
            const closestRock = this.getClosestEntity(entity, rockEnemies);
            if (closestRock) {
                const distance = MathUtils.distance(entity.position, closestRock.position);
                if (distance < GameConfig.game.avoidanceRadius) {
                    return {
                        action: 'avoid',
                        target: closestRock,
                        direction: MathUtils.subtract(entity.position, closestRock.position)
                    };
                }
            }
        }
        
        // Priority 3: Avoid allies (prefer to be alone)
        if (allies.length > 0) {
            const closestAlly = this.getClosestEntity(entity, allies);
            if (closestAlly) {
                const distance = MathUtils.distance(entity.position, closestAlly.position);
                if (distance < 40) { // Too close to ally
                    return {
                        action: 'move',
                        direction: MathUtils.subtract(entity.position, closestAlly.position),
                        speed: entity.speed * 0.8
                    };
                }
            }
        }
        
        // Priority 4: Hunt for enemies aggressively
        if (enemies.length > 0) {
            const closestEnemy = this.getClosestEntity(entity, enemies);
            if (closestEnemy) {
                return {
                    action: 'move',
                    direction: MathUtils.subtract(closestEnemy.position, entity.position),
                    speed: entity.speed * 1.1 // Faster movement
                };
            }
        }
        
        // Default: Fast random movement
        return {
            action: 'move',
            direction: {
                x: MathUtils.random(-1, 1),
                y: MathUtils.random(-1, 1)
            },
            speed: entity.speed * 0.8
        };
    }

    getNearbyEntities(entity, allEntities) {
        const nearby = [];
        const maxDistance = 80; // Scissors have shorter vision but faster reaction
        
        for (const other of allEntities) {
            if (other.id === entity.id || !other.isAlive) continue;
            
            const distance = MathUtils.distance(entity.position, other.position);
            if (distance <= maxDistance) {
                nearby.push(other);
            }
        }
        
        return nearby;
    }

    getClosestEntity(entity, entities) {
        let closest = null;
        let closestDistance = Infinity;
        
        for (const other of entities) {
            const distance = MathUtils.distance(entity.position, other.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = other;
            }
        }
        
        return closest;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScissorsEntity, ScissorsStrategy };
}
