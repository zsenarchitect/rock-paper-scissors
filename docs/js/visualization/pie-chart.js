// Pie Chart Visualization
class PieChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = [];
        this.animationFrame = null;
        this.animationProgress = 0;
        this.animationDuration = 300;
        
        // Chart properties
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.radius = Math.min(canvas.width, canvas.height) / 2 - 20;
        
        logger.info('Pie chart initialized');
    }

    // Update chart data
    updateData(data) {
        this.data = data;
        this.animateUpdate();
    }

    // Animate chart update
    animateUpdate() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.animationProgress = 0;
        this.animate();
    }

    // Animation loop
    animate() {
        this.animationProgress += 16; // ~60fps
        
        if (this.animationProgress < this.animationDuration) {
            this.draw();
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.draw();
        }
    }

    // Draw the pie chart
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.data.length === 0) return;
        
        // Calculate total value
        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;
        
        // Animation easing
        const progress = Math.min(this.animationProgress / this.animationDuration, 1);
        const easedProgress = this.easeOutCubic(progress);
        
        let currentAngle = -Math.PI / 2; // Start from top
        
        // Draw pie slices
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            const sliceAngle = (item.value / total) * 2 * Math.PI * easedProgress;
            
            this.drawSlice(
                this.centerX,
                this.centerY,
                this.radius,
                currentAngle,
                currentAngle + sliceAngle,
                item.color,
                item.name,
                item.value
            );
            
            currentAngle += sliceAngle;
        }
        
        // Draw center circle
        this.drawCenterCircle();
        
        // Draw legend
        this.drawLegend();
    }

    // Draw a pie slice
    drawSlice(x, y, radius, startAngle, endAngle, color, label, value) {
        this.ctx.save();
        
        // Draw slice
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.arc(x, y, radius, startAngle, endAngle);
        this.ctx.closePath();
        
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Draw slice border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw label
        const midAngle = (startAngle + endAngle) / 2;
        const labelX = x + Math.cos(midAngle) * (radius * 0.7);
        const labelY = y + Math.sin(midAngle) * (radius * 0.7);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(value.toString(), labelX, labelY);
        
        this.ctx.restore();
    }

    // Draw center circle
    drawCenterCircle() {
        this.ctx.save();
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw total in center
        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        this.ctx.fillStyle = '#333333';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(total.toString(), this.centerX, this.centerY);
        
        this.ctx.restore();
    }

    // Draw legend
    drawLegend() {
        const legendX = 10;
        const legendY = 10;
        const itemHeight = 20;
        const colorSize = 15;
        
        this.ctx.save();
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            const y = legendY + i * itemHeight;
            
            // Draw color box
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(legendX, y - colorSize / 2, colorSize, colorSize);
            
            // Draw label
            this.ctx.fillStyle = '#333333';
            this.ctx.fillText(
                `${item.name}: ${item.value}`,
                legendX + colorSize + 5,
                y
            );
        }
        
        this.ctx.restore();
    }

    // Easing function
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Resize chart
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.radius = Math.min(width, height) / 2 - 20;
        this.draw();
    }

    // Get chart data
    getData() {
        return this.data;
    }

    // Clear chart
    clear() {
        this.data = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PieChart;
}
