// Rock Entity
class RockEntity extends BaseEntity {
    constructor(id, position, team) {
        super(id, 'Rock', position, team);
        
        // Rock-specific properties
        this.attackPower = 1.2;
        this.defensePower = 1.0;
        this.speed = GameConfig.game.movementSpeed * 0.9; // Slightly slower
        this.radius = 18; // Slightly larger
        
        // Rock-specific behavior
        this.aggression = 0.8; // High aggression
        this.patience = 0.6; // Medium patience
        this.grouping = 0.7; // Prefers to group
        
        logger.debug(`Rock entity created: ${id}`, {
            position,
            team,
            attackPower: this.attackPower,
            defensePower: this.defensePower
        });
    }

    // Rock-specific AI behavior
    updateAI(deltaTime, gameState) {
        if (!this.strategy) {
            this.strategy = new RockStrategy();
        }
        
        const decision = this.strategy.decide(this, gameState);
        this.applyDecision(decision, deltaTime);
    }

    // Rock-specific rendering
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
        
        // Draw rock shape (more angular)
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(this.radius * 0.7, -this.radius * 0.3);
        ctx.lineTo(this.radius * 0.7, this.radius * 0.3);
        ctx.lineTo(0, this.radius);
        ctx.lineTo(-this.radius * 0.7, this.radius * 0.3);
        ctx.lineTo(-this.radius * 0.7, -this.radius * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Draw rock texture
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
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

// Rock Strategy
class RockStrategy {
    constructor() {
        this.name = 'RockStrategy';
        this.aggression = 0.8;
        this.patience = 0.6;
        this.grouping = 0.7;
    }

    decide(entity, gameState) {
        const nearbyEntities = this.getNearbyEntities(entity, gameState.entities);
        const enemies = nearbyEntities.filter(e => e.team !== entity.team && e.isAlive);
        const allies = nearbyEntities.filter(e => e.team === entity.team && e.isAlive);
        const targets = enemies.filter(e => e.type === 'Scissors');
        
        // Priority 1: Attack Scissors (Rock beats Scissors)
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
        
        // Priority 2: Avoid Paper (Paper beats Rock)
        const paperEnemies = enemies.filter(e => e.type === 'Paper');
        if (paperEnemies.length > 0) {
            const closestPaper = this.getClosestEntity(entity, paperEnemies);
            if (closestPaper) {
                const distance = MathUtils.distance(entity.position, closestPaper.position);
                if (distance < GameConfig.game.avoidanceRadius) {
                    return {
                        action: 'avoid',
                        target: closestPaper,
                        direction: MathUtils.subtract(entity.position, closestPaper.position)
                    };
                }
            }
        }
        
        // Priority 3: Group with allies
        if (allies.length > 0) {
            const closestAlly = this.getClosestEntity(entity, allies);
            if (closestAlly) {
                const distance = MathUtils.distance(entity.position, closestAlly.position);
                if (distance > 50) { // Don't get too close
                    return {
                        action: 'move',
                        direction: MathUtils.subtract(closestAlly.position, entity.position),
                        speed: entity.speed * 0.8
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
            speed: entity.speed * 0.5
        };
    }

    getNearbyEntities(entity, allEntities) {
        const nearby = [];
        const maxDistance = 100;
        
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
    module.exports = { RockEntity, RockStrategy };
}
