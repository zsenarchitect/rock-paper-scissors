// Physics Engine
class PhysicsEngine {
    constructor() {
        this.gravity = 0;
        this.friction = 0.98;
        this.bounce = 0.8;
        this.boundaries = {
            left: 0,
            right: GameConfig.game.canvasWidth,
            top: 0,
            bottom: GameConfig.game.canvasHeight
        };
        
        logger.info('Physics engine initialized');
    }

    // Update entity physics
    updateEntity(entity, deltaTime) {
        if (!entity.isAlive) return;
        
        // Apply gravity
        entity.velocity.y += this.gravity * deltaTime / 1000;
        
        // Apply friction
        entity.velocity = MathUtils.multiply(entity.velocity, this.friction);
        
        // Update position
        const movement = MathUtils.multiply(entity.velocity, deltaTime / 1000);
        entity.position = MathUtils.add(entity.position, movement);
        
        // Handle boundary collisions
        this.handleBoundaryCollision(entity);
    }

    // Handle boundary collisions
    handleBoundaryCollision(entity) {
        const radius = entity.radius;
        
        // Left boundary
        if (entity.position.x - radius < this.boundaries.left) {
            entity.position.x = this.boundaries.left + radius;
            entity.velocity.x *= -this.bounce;
        }
        
        // Right boundary
        if (entity.position.x + radius > this.boundaries.right) {
            entity.position.x = this.boundaries.right - radius;
            entity.velocity.x *= -this.bounce;
        }
        
        // Top boundary
        if (entity.position.y - radius < this.boundaries.top) {
            entity.position.y = this.boundaries.top + radius;
            entity.velocity.y *= -this.bounce;
        }
        
        // Bottom boundary
        if (entity.position.y + radius > this.boundaries.bottom) {
            entity.position.y = this.boundaries.bottom - radius;
            entity.velocity.y *= -this.bounce;
        }
    }

    // Handle entity-to-entity collisions
    handleEntityCollision(entity1, entity2) {
        if (!entity1.isAlive || !entity2.isAlive) return;
        
        const distance = MathUtils.distance(entity1.position, entity2.position);
        const collisionRadius = entity1.radius + entity2.radius;
        
        if (distance < collisionRadius) {
            // Calculate collision normal
            const normal = MathUtils.normalize(
                MathUtils.subtract(entity2.position, entity1.position)
            );
            
            // Separate entities
            const overlap = collisionRadius - distance;
            const separation = MathUtils.multiply(normal, overlap / 2);
            
            entity1.position = MathUtils.subtract(entity1.position, separation);
            entity2.position = MathUtils.add(entity2.position, separation);
            
            // Calculate relative velocity
            const relativeVelocity = MathUtils.subtract(entity2.velocity, entity1.velocity);
            const velocityAlongNormal = MathUtils.dot(relativeVelocity, normal);
            
            // Do not resolve if velocities are separating
            if (velocityAlongNormal > 0) return;
            
            // Calculate restitution
            const restitution = Math.min(entity1.bounce || this.bounce, entity2.bounce || this.bounce);
            
            // Calculate impulse scalar
            const impulseScalar = -(1 + restitution) * velocityAlongNormal;
            const impulse = MathUtils.multiply(normal, impulseScalar);
            
            // Apply impulse
            entity1.velocity = MathUtils.subtract(entity1.velocity, impulse);
            entity2.velocity = MathUtils.add(entity2.velocity, impulse);
        }
    }

    // Apply force to entity
    applyForce(entity, force) {
        if (!entity.isAlive) return;
        
        entity.velocity = MathUtils.add(entity.velocity, force);
    }

    // Apply impulse to entity
    applyImpulse(entity, impulse) {
        if (!entity.isAlive) return;
        
        entity.velocity = MathUtils.add(entity.velocity, impulse);
    }

    // Set entity velocity
    setVelocity(entity, velocity) {
        if (!entity.isAlive) return;
        
        entity.velocity = velocity;
    }

    // Add velocity to entity
    addVelocity(entity, velocity) {
        if (!entity.isAlive) return;
        
        entity.velocity = MathUtils.add(entity.velocity, velocity);
    }

    // Get entity speed
    getSpeed(entity) {
        return MathUtils.magnitude(entity.velocity);
    }

    // Set entity speed
    setSpeed(entity, speed) {
        if (!entity.isAlive) return;
        
        const currentSpeed = this.getSpeed(entity);
        if (currentSpeed > 0) {
            const normalized = MathUtils.normalize(entity.velocity);
            entity.velocity = MathUtils.multiply(normalized, speed);
        }
    }

    // Limit entity speed
    limitSpeed(entity, maxSpeed) {
        if (!entity.isAlive) return;
        
        const currentSpeed = this.getSpeed(entity);
        if (currentSpeed > maxSpeed) {
            this.setSpeed(entity, maxSpeed);
        }
    }

    // Update boundaries
    updateBoundaries(width, height) {
        this.boundaries = {
            left: 0,
            right: width,
            top: 0,
            bottom: height
        };
    }

    // Get physics statistics
    getPhysicsStats(entities) {
        let totalSpeed = 0;
        let totalVelocity = 0;
        let activeEntities = 0;
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            
            const speed = this.getSpeed(entity);
            const velocity = MathUtils.magnitude(entity.velocity);
            
            totalSpeed += speed;
            totalVelocity += velocity;
            activeEntities++;
        }
        
        return {
            averageSpeed: activeEntities > 0 ? totalSpeed / activeEntities : 0,
            averageVelocity: activeEntities > 0 ? totalVelocity / activeEntities : 0,
            activeEntities,
            totalEntities: entities.length
        };
    }

    // Debug: Draw velocity vectors
    drawVelocityVectors(ctx, entities) {
        if (!GameConfig.debug.enabled) return;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            
            const speed = this.getSpeed(entity);
            if (speed > 0) {
                const endPoint = MathUtils.add(
                    entity.position,
                    MathUtils.multiply(MathUtils.normalize(entity.velocity), 20)
                );
                
                ctx.beginPath();
                ctx.moveTo(entity.position.x, entity.position.y);
                ctx.lineTo(endPoint.x, endPoint.y);
                ctx.stroke();
                
                // Draw speed indicator
                ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
                ctx.font = '10px Arial';
                ctx.fillText(
                    speed.toFixed(1),
                    entity.position.x + 15,
                    entity.position.y - 5
                );
            }
        }
        
        ctx.restore();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}
