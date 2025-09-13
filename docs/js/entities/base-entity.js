// Base Entity Class
class BaseEntity {
    constructor(id, type, position, team) {
        this.id = id;
        this.type = type;
        this.team = team;
        this.position = MathUtils.Vector2D(position.x, position.y);
        this.velocity = MathUtils.Vector2D(0, 0);
        this.radius = 15;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = GameConfig.game.movementSpeed;
        this.isAlive = true;
        this.isConverting = false;
        this.conversionTarget = null;
        this.lastUpdate = Date.now();
        
        // AI Strategy properties
        this.strategy = null;
        this.target = null;
        this.avoidTargets = [];
        this.behaviorState = 'wandering';
        
        // Visual properties
        this.color = this.getTeamColor();
        this.alpha = 1.0;
        this.rotation = 0;
        this.scale = 1.0;
        
        // Performance tracking
        this.conversions = 0;
        this.survivalTime = 0;
        this.distanceTraveled = 0;
        
        logger.debug(`Entity created: ${this.id} (${this.type}, Team ${this.team})`, {
            position: this.position,
            team: this.team
        });
    }

    // Get team color based on team number
    getTeamColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        return colors[this.team - 1] || '#999999';
    }

    // Update entity logic with performance optimizations
    update(deltaTime, gameState) {
        if (!this.isAlive) return;

        this.survivalTime += deltaTime;
        this.lastUpdate = Date.now();

        // Update AI behavior less frequently
        if (this.lastUpdate % 100 < 50) { // Only update AI every other frame
            this.updateAI(deltaTime, gameState);
        }

        // Update position based on velocity
        const movement = MathUtils.multiply(this.velocity, deltaTime / 1000);
        this.position = MathUtils.add(this.position, movement);
        this.distanceTraveled += MathUtils.magnitude(movement);

        // Keep entity within bounds
        this.clampToBounds();

        // Update visual properties less frequently
        if (this.lastUpdate % 60 < 30) { // Only update visuals every other frame
            this.updateVisuals(deltaTime);
        }
    }

    // AI behavior update
    updateAI(deltaTime, gameState) {
        if (!this.strategy) return;

        // Get decision from strategy
        const decision = this.strategy.decide(this, gameState);
        
        if (decision) {
            this.applyDecision(decision, deltaTime);
        }
    }

    // Apply AI decision
    applyDecision(decision, deltaTime) {
        switch (decision.action) {
            case 'move':
                this.move(decision.direction, decision.speed);
                break;
            case 'attack':
                this.attack(decision.target);
                break;
            case 'avoid':
                this.avoid(decision.target);
                break;
            case 'convert':
                this.convert(decision.target);
                break;
            case 'wait':
                this.wait();
                break;
        }
    }

    // Move in a direction
    move(direction, speed = this.speed) {
        const normalizedDirection = MathUtils.normalize(direction);
        this.velocity = MathUtils.multiply(normalizedDirection, speed);
    }

    // Attack target
    attack(target) {
        if (!target || !target.isAlive) return;
        
        const distance = MathUtils.distance(this.position, target.position);
        if (distance <= GameConfig.game.conversionRadius) {
            this.convert(target);
        } else {
            // Move towards target
            const direction = MathUtils.subtract(target.position, this.position);
            this.move(direction);
        }
    }

    // Avoid target
    avoid(target) {
        if (!target) return;
        
        const direction = MathUtils.subtract(this.position, target.position);
        const distance = MathUtils.magnitude(direction);
        
        if (distance < GameConfig.game.avoidanceRadius) {
            const normalizedDirection = MathUtils.normalize(direction);
            this.move(normalizedDirection);
        }
    }

    // Convert target to this entity's type
    convert(target) {
        if (!target || !target.isAlive) return;
        
        const distance = MathUtils.distance(this.position, target.position);
        if (distance <= GameConfig.game.conversionRadius) {
            this.isConverting = true;
            this.conversionTarget = target;
            
            // Start conversion process
            setTimeout(() => {
                this.completeConversion(target);
            }, 500); // Conversion takes 500ms
            
            logger.info(`Entity ${this.id} converting ${target.id}`, {
                converter: this.id,
                target: target.id,
                converterType: this.type,
                targetType: target.type
            });
        }
    }

    // Complete conversion
    completeConversion(target) {
        if (!target || !target.isAlive) return;
        
        // Convert target to this entity's type
        target.type = this.type;
        target.team = this.team;
        target.color = this.color;
        target.health = this.maxHealth;
        
        // Reset conversion state
        this.isConverting = false;
        this.conversionTarget = null;
        
        // Update stats
        this.conversions++;
        
        // Play conversion sound
        this.playConversionSound();
        
        logger.info(`Conversion completed: ${target.id} -> ${this.type}`, {
            converter: this.id,
            converted: target.id,
            newType: this.type
        });
    }

    // Wait (stop moving)
    wait() {
        this.velocity = MathUtils.Vector2D(0, 0);
    }

    // Play conversion sound
    playConversionSound() {
        if (typeof audioManager !== 'undefined') {
            audioManager.playConversionSound(this.type);
        }
    }

    // Clamp entity to canvas bounds
    clampToBounds() {
        this.position = MathUtils.clampVector(
            this.position,
            0, GameConfig.game.canvasWidth,
            0, GameConfig.game.canvasHeight
        );
    }

    // Update visual properties
    updateVisuals(deltaTime) {
        // Update rotation based on velocity
        if (MathUtils.magnitude(this.velocity) > 0) {
            this.rotation = MathUtils.angle(this.velocity);
        }
        
        // Update scale based on health
        const healthRatio = this.health / this.maxHealth;
        this.scale = MathUtils.lerp(0.8, 1.2, healthRatio);
        
        // Update alpha based on conversion state
        this.alpha = this.isConverting ? 0.7 : 1.0;
    }

    // Render entity
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
        
        // Draw entity circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw team indicator
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
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

    // Take damage
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    // Die
    die() {
        this.isAlive = false;
        this.health = 0;
        logger.info(`Entity died: ${this.id}`, {
            id: this.id,
            type: this.type,
            team: this.team,
            survivalTime: this.survivalTime,
            conversions: this.conversions
        });
    }

    // Get performance metrics
    getPerformanceMetrics() {
        return {
            id: this.id,
            type: this.type,
            team: this.team,
            survivalTime: this.survivalTime,
            conversions: this.conversions,
            distanceTraveled: this.distanceTraveled,
            isAlive: this.isAlive
        };
    }

    // Clone entity for AI training
    clone() {
        const cloned = new BaseEntity(this.id + '_clone', this.type, this.position, this.team);
        cloned.strategy = this.strategy;
        cloned.speed = this.speed;
        cloned.radius = this.radius;
        return cloned;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseEntity;
}
