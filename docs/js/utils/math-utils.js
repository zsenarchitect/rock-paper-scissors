// Math Utilities
class MathUtils {
    // Vector2D class for position and velocity
    static Vector2D(x = 0, y = 0) {
        return { x, y };
    }

    // Vector operations
    static add(v1, v2) {
        return { x: v1.x + v2.x, y: v1.y + v2.y };
    }

    static subtract(v1, v2) {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    }

    static multiply(v, scalar) {
        return { x: v.x * scalar, y: v.y * scalar };
    }

    static divide(v, scalar) {
        return { x: v.x / scalar, y: v.y / scalar };
    }

    static magnitude(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    static normalize(v) {
        const mag = this.magnitude(v);
        if (mag === 0) return { x: 0, y: 0 };
        return { x: v.x / mag, y: v.y / mag };
    }

    static distance(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    // Random number generation
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Clamping
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static clampVector(v, minX, maxX, minY, maxY) {
        return {
            x: this.clamp(v.x, minX, maxX),
            y: this.clamp(v.y, minY, maxY)
        };
    }

    // Angle calculations
    static angle(v) {
        return Math.atan2(v.y, v.x);
    }

    static angleBetween(v1, v2) {
        const dot = this.dot(v1, v2);
        const mag1 = this.magnitude(v1);
        const mag2 = this.magnitude(v2);
        if (mag1 === 0 || mag2 === 0) return 0;
        return Math.acos(dot / (mag1 * mag2));
    }

    static rotate(v, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x * cos - v.y * sin,
            y: v.x * sin + v.y * cos
        };
    }

    // Interpolation
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static lerpVector(v1, v2, factor) {
        return {
            x: this.lerp(v1.x, v2.x, factor),
            y: this.lerp(v1.y, v2.y, factor)
        };
    }

    // Collision detection
    static circleCollision(pos1, radius1, pos2, radius2) {
        const distance = this.distance(pos1, pos2);
        return distance < (radius1 + radius2);
    }

    static pointInCircle(point, center, radius) {
        const distance = this.distance(point, center);
        return distance <= radius;
    }

    static pointInRect(point, rect) {
        return point.x >= rect.x && 
               point.x <= rect.x + rect.width &&
               point.y >= rect.y && 
               point.y <= rect.y + rect.height;
    }

    // Smooth movement
    static smoothStep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }

    static smootherStep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    // Color utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static interpolateColor(color1, color2, factor) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color1;
        
        const r = Math.round(this.lerp(rgb1.r, rgb2.r, factor));
        const g = Math.round(this.lerp(rgb1.g, rgb2.g, factor));
        const b = Math.round(this.lerp(rgb1.b, rgb2.b, factor));
        
        return this.rgbToHex(r, g, b);
    }

    // Performance utilities
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Array utilities
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    static weightedRandom(weights) {
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * total;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) return i;
        }
        
        return weights.length - 1;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathUtils;
}
