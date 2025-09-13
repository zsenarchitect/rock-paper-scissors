// Paper Entity
class PaperEntity extends BaseEntity {
    constructor(id, position, team) {
        super(id, 'Paper', position, team);
        
        // Paper-specific properties
        this.attackPower = 1.0;
        this.defensePower = 1.1;
        this.speed = GameConfig.game.movementSpeed * 1.1; // Slightly faster
        this.radius = 16; // Standard size
        
        // Paper-specific behavior
        this.aggression = 0.6; // Medium aggression
        this.patience = 0.8; // High patience
        this.grouping = 0.5; // Prefers to spread out
        
        logger.debug(`Paper entity created: ${id}`, {
            position,
            team,
            attackPower: this.attackPower,
            defensePower: this.defensePower
        });
    }

    // Paper-specific AI behavior
    updateAI(deltaTime, gameState) {
        if (!this.strategy) {
            this.strategy = new PaperStrategy();
        }
        
        const decision = this.strategy.decide(this, gameState);
        this.applyDecision(decision, deltaTime);
    }

    // Paper-specific rendering
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
        
        // Draw paper shape (rectangular)
        ctx.beginPath();
        ctx.rect(-this.radius, -this.radius * 0.6, this.radius * 2, this.radius * 1.2);
        ctx.fill();
        
        // Draw paper texture
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw paper lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = -this.radius; i <= this.radius; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, -this.radius * 0.6);
            ctx.lineTo(i, this.radius * 0.6);
            ctx.stroke();
        }
        
        // Draw team indicator
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.team.toString(), 0, 4);
        
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

// Paper Strategy
class PaperStrategy {
    constructor() {
        this.name = 'PaperStrategy';
        this.aggression = 0.6;
        this.patience = 0.8;
        this.grouping = 0.5;
    }

    decide(entity, gameState) {
        const nearbyEntities = this.getNearbyEntities(entity, gameState.entities);
        const enemies = nearbyEntities.filter(e => e.team !== entity.team && e.isAlive);
        const allies = nearbyEntities.filter(e => e.team === entity.team && e.isAlive);
        const targets = enemies.filter(e => e.type === 'Rock');
        
        // Priority 1: Attack Rock (Paper beats Rock)
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
        
        // Priority 2: Avoid Scissors (Scissors beats Paper)
        const scissorsEnemies = enemies.filter(e => e.type === 'Scissors');
        if (scissorsEnemies.length > 0) {
            const closestScissors = this.getClosestEntity(entity, scissorsEnemies);
            if (closestScissors) {
                const distance = MathUtils.distance(entity.position, closestScissors.position);
                if (distance < GameConfig.game.avoidanceRadius) {
                    return {
                        action: 'avoid',
                        target: closestScissors,
                        direction: MathUtils.subtract(entity.position, closestScissors.position)
                    };
                }
            }
        }
        
        // Priority 3: Maintain distance from allies (spread out)
        if (allies.length > 0) {
            const closestAlly = this.getClosestEntity(entity, allies);
            if (closestAlly) {
                const distance = MathUtils.distance(entity.position, closestAlly.position);
                if (distance < 30) { // Too close to ally
                    return {
                        action: 'move',
                        direction: MathUtils.subtract(entity.position, closestAlly.position),
                        speed: entity.speed * 0.6
                    };
                }
            }
        }
        
        // Priority 4: Hunt for enemies
        if (enemies.length > 0) {
            const closestEnemy = this.getClosestEntity(entity, enemies);
            if (closestEnemy) {
                return {
                    action: 'move',
                    direction: MathUtils.subtract(closestEnemy.position, entity.position),
                    speed: entity.speed
                };
            }
        }
        
        // Default: Random movement
        return {
            action: 'move',
            direction: {
                x: MathUtils.random(-1, 1),
                y: MathUtils.random(-1, 1)
            },
            speed: entity.speed * 0.7
        };
    }

    getNearbyEntities(entity, allEntities) {
        const nearby = [];
        const maxDistance = 120; // Paper has better vision
        
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
    module.exports = { PaperEntity, PaperStrategy };
}
