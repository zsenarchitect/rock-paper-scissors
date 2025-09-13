/**
 * Cute Cursor - OpenAI Agent Style
 * Interactive and adorable cursor with personality
 */

class CuteCursor {
    constructor() {
        this.cursor = null;
        this.trails = [];
        this.isVisible = true;
        this.lastX = 0;
        this.lastY = 0;
        this.velocity = { x: 0, y: 0 };
        this.mood = 'idle';
        this.moodTimer = null;
        this.trailTimer = null;
        
        this.init();
    }

    init() {
        this.createCursor();
        this.bindEvents();
        this.startMoodCycle();
        this.startTrailEffect();
    }

    createCursor() {
        // Create cursor element
        this.cursor = document.createElement('div');
        this.cursor.className = 'cute-cursor idle';
        document.body.appendChild(this.cursor);

        // Create trail container
        this.trailContainer = document.createElement('div');
        this.trailContainer.style.position = 'fixed';
        this.trailContainer.style.top = '0';
        this.trailContainer.style.left = '0';
        this.trailContainer.style.width = '100%';
        this.trailContainer.style.height = '100%';
        this.trailContainer.style.pointerEvents = 'none';
        this.trailContainer.style.zIndex = '9998';
        document.body.appendChild(this.trailContainer);
    }

    bindEvents() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            this.updatePosition(e.clientX, e.clientY);
            this.updateVelocity(e.clientX, e.clientY);
            this.createTrail(e.clientX, e.clientY);
        });

        // Mouse enter/leave
        document.addEventListener('mouseenter', () => {
            this.show();
        });

        document.addEventListener('mouseleave', () => {
            this.hide();
        });

        // Click events
        document.addEventListener('mousedown', (e) => {
            this.setMood('click');
            this.createClickEffect(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', () => {
            this.setMood('idle');
        });

        // Hover events
        document.addEventListener('mouseover', (e) => {
            this.handleHover(e.target);
        });

        document.addEventListener('mouseout', (e) => {
            this.handleUnhover(e.target);
        });

        // Drag events
        document.addEventListener('dragstart', () => {
            this.setMood('drag');
        });

        document.addEventListener('dragend', () => {
            this.setMood('idle');
        });

        // Special interactions
        this.bindSpecialInteractions();
    }

    bindSpecialInteractions() {
        // Button interactions
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('button, .vote-btn, .room-card')) {
                this.setMood('excited');
                this.cursor.classList.add('button-hover');
            } else if (e.target.matches('a, [href]')) {
                this.setMood('happy');
                this.cursor.classList.add('link-hover');
            } else if (e.target.matches('input, textarea, [contenteditable]')) {
                this.setMood('hover');
                this.cursor.classList.add('text-hover');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('button, .vote-btn, .room-card, a, [href], input, textarea, [contenteditable]')) {
                this.cursor.classList.remove('button-hover', 'link-hover', 'text-hover');
            }
        });

        // Game canvas interactions
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.addEventListener('mouseenter', () => {
                this.setMood('excited');
            });
            gameCanvas.addEventListener('mouseleave', () => {
                this.setMood('idle');
            });
        }
    }

    updatePosition(x, y) {
        if (!this.cursor) return;
        
        this.cursor.style.left = x + 'px';
        this.cursor.style.top = y + 'px';
        
        this.lastX = x;
        this.lastY = y;
    }

    updateVelocity(x, y) {
        const deltaX = x - this.lastX;
        const deltaY = y - this.lastY;
        
        this.velocity.x = deltaX;
        this.velocity.y = deltaY;
        
        // Add some personality based on movement speed
        const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (speed > 10) {
            this.setMood('excited');
        } else if (speed < 1) {
            this.setMood('sleepy');
        }
    }

    createTrail(x, y) {
        if (this.trailTimer) return;
        
        this.trailTimer = setTimeout(() => {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = x + 'px';
            trail.style.top = y + 'px';
            
            this.trailContainer.appendChild(trail);
            
            // Remove trail after animation
            setTimeout(() => {
                if (trail.parentNode) {
                    trail.parentNode.removeChild(trail);
                }
            }, 500);
            
            this.trailTimer = null;
        }, 50);
    }

    createClickEffect(x, y) {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.border = '2px solid rgba(255, 107, 157, 0.6)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '10000';
        ripple.style.animation = 'ripple 0.6s ease-out';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    setMood(mood) {
        if (this.mood === mood) return;
        
        this.mood = mood;
        this.cursor.className = `cute-cursor ${mood}`;
        
        // Clear any existing mood timer
        if (this.moodTimer) {
            clearTimeout(this.moodTimer);
        }
        
        // Return to idle after a short time
        if (mood !== 'idle' && mood !== 'sleepy') {
            this.moodTimer = setTimeout(() => {
                this.setMood('idle');
            }, 1000);
        }
    }

    startMoodCycle() {
        // Random mood changes for personality
        setInterval(() => {
            if (this.mood === 'idle' && Math.random() < 0.1) {
                const moods = ['wink', 'happy', 'excited'];
                const randomMood = moods[Math.floor(Math.random() * moods.length)];
                this.setMood(randomMood);
            }
        }, 3000);
    }

    startTrailEffect() {
        // Create occasional sparkles
        setInterval(() => {
            if (this.isVisible && Math.random() < 0.3) {
                this.createSparkle();
            }
        }, 2000);
    }

    createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.left = (this.lastX + (Math.random() - 0.5) * 100) + 'px';
        sparkle.style.top = (this.lastY + (Math.random() - 0.5) * 100) + 'px';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = '#ffd93d';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '9997';
        sparkle.style.animation = 'sparkle 1s ease-out forwards';
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 1000);
    }

    handleHover(element) {
        // Special reactions to different elements
        if (element.matches('.room-card')) {
            this.setMood('excited');
        } else if (element.matches('.vote-btn')) {
            this.setMood('happy');
        } else if (element.matches('#gameCanvas')) {
            this.setMood('excited');
        }
    }

    handleUnhover(element) {
        // Return to normal state
        if (this.mood === 'excited' || this.mood === 'happy') {
            this.setMood('idle');
        }
    }

    show() {
        this.isVisible = true;
        if (this.cursor) {
            this.cursor.style.display = 'block';
        }
    }

    hide() {
        this.isVisible = false;
        if (this.cursor) {
            this.cursor.style.display = 'none';
        }
    }

    // Public methods for external control
    setLoading() {
        this.setMood('loading');
    }

    setSuccess() {
        this.setMood('success');
    }

    setError() {
        this.setMood('error');
    }

    destroy() {
        if (this.cursor && this.cursor.parentNode) {
            this.cursor.parentNode.removeChild(this.cursor);
        }
        if (this.trailContainer && this.trailContainer.parentNode) {
            this.trailContainer.parentNode.removeChild(this.trailContainer);
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
        }
    }
    
    @keyframes sparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize cute cursor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cuteCursor = new CuteCursor();
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CuteCursor;
}
