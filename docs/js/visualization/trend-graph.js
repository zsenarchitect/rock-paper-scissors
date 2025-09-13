// Trend Graph Visualization
class TrendGraph {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = [];
        this.maxDataPoints = 100;
        this.timeWindow = 60000; // 1 minute
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        
        // Chart properties
        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        this.width = canvas.width - this.margin.left - this.margin.right;
        this.height = canvas.height - this.margin.top - this.margin.bottom;
        
        logger.info('Trend graph initialized');
    }

    // Add data point
    addDataPoint(timestamp, teamCounts) {
        const dataPoint = {
            timestamp,
            teamCounts: { ...teamCounts }
        };
        
        this.data.push(dataPoint);
        
        // Remove old data points
        const cutoffTime = timestamp - this.timeWindow;
        this.data = this.data.filter(point => point.timestamp >= cutoffTime);
        
        // Limit data points
        if (this.data.length > this.maxDataPoints) {
            this.data = this.data.slice(-this.maxDataPoints);
        }
        
        this.draw();
    }

    // Draw the trend graph
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.data.length < 2) return;
        
        // Calculate scales
        const xScale = this.calculateXScale();
        const yScale = this.calculateYScale();
        
        // Draw background
        this.drawBackground();
        
        // Draw grid
        this.drawGrid(xScale, yScale);
        
        // Draw data lines
        this.drawDataLines(xScale, yScale);
        
        // Draw axes
        this.drawAxes(xScale, yScale);
        
        // Draw legend
        this.drawLegend();
    }

    // Calculate X scale
    calculateXScale() {
        const minTime = Math.min(...this.data.map(d => d.timestamp));
        const maxTime = Math.max(...this.data.map(d => d.timestamp));
        const timeRange = maxTime - minTime;
        
        return {
            min: minTime,
            max: maxTime,
            range: timeRange,
            scale: this.width / timeRange
        };
    }

    // Calculate Y scale
    calculateYScale() {
        let minValue = Infinity;
        let maxValue = -Infinity;
        
        for (const point of this.data) {
            for (const count of Object.values(point.teamCounts)) {
                minValue = Math.min(minValue, count);
                maxValue = Math.max(maxValue, count);
            }
        }
        
        const padding = (maxValue - minValue) * 0.1;
        minValue = Math.max(0, minValue - padding);
        maxValue = maxValue + padding;
        
        return {
            min: minValue,
            max: maxValue,
            range: maxValue - minValue,
            scale: this.height / (maxValue - minValue)
        };
    }

    // Draw background
    drawBackground() {
        this.ctx.save();
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    // Draw grid
    drawGrid(xScale, yScale) {
        this.ctx.save();
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        
        // Vertical grid lines
        const timeStep = xScale.range / 5;
        for (let i = 0; i <= 5; i++) {
            const x = this.margin.left + (i * timeStep) * xScale.scale;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.margin.top);
            this.ctx.lineTo(x, this.margin.top + this.height);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        const valueStep = yScale.range / 5;
        for (let i = 0; i <= 5; i++) {
            const y = this.margin.top + this.height - (i * valueStep) * yScale.scale;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin.left, y);
            this.ctx.lineTo(this.margin.left + this.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    // Draw data lines
    drawDataLines(xScale, yScale) {
        const teams = [1, 2, 3];
        
        for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
            const team = teams[teamIndex];
            const color = this.colors[teamIndex];
            
            this.ctx.save();
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            let firstPoint = true;
            
            for (const point of this.data) {
                const x = this.margin.left + (point.timestamp - xScale.min) * xScale.scale;
                const y = this.margin.top + this.height - (point.teamCounts[team] - yScale.min) * yScale.scale;
                
                if (firstPoint) {
                    this.ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    // Draw axes
    drawAxes(xScale, yScale) {
        this.ctx.save();
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        
        // X axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top + this.height);
        this.ctx.lineTo(this.margin.left + this.width, this.margin.top + this.height);
        this.ctx.stroke();
        
        // Y axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top);
        this.ctx.lineTo(this.margin.left, this.margin.top + this.height);
        this.ctx.stroke();
        
        // X axis labels
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        
        const timeStep = xScale.range / 5;
        for (let i = 0; i <= 5; i++) {
            const time = xScale.min + (i * timeStep);
            const x = this.margin.left + (i * timeStep) * xScale.scale;
            const seconds = Math.floor((time % 60000) / 1000);
            this.ctx.fillText(seconds.toString(), x, this.margin.top + this.height + 5);
        }
        
        // Y axis labels
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        
        const valueStep = yScale.range / 5;
        for (let i = 0; i <= 5; i++) {
            const value = yScale.min + (i * valueStep);
            const y = this.margin.top + this.height - (i * valueStep) * yScale.scale;
            this.ctx.fillText(Math.round(value).toString(), this.margin.left - 5, y);
        }
        
        this.ctx.restore();
    }

    // Draw legend
    drawLegend() {
        const legendX = this.margin.left + this.width - 100;
        const legendY = this.margin.top + 10;
        const itemHeight = 15;
        
        this.ctx.save();
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        for (let i = 0; i < 3; i++) {
            const y = legendY + i * itemHeight;
            
            // Draw color line
            this.ctx.strokeStyle = this.colors[i];
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(legendX, y);
            this.ctx.lineTo(legendX + 20, y);
            this.ctx.stroke();
            
            // Draw label
            this.ctx.fillStyle = '#333333';
            this.ctx.fillText(`Team ${i + 1}`, legendX + 25, y);
        }
        
        this.ctx.restore();
    }

    // Resize chart
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;
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
    module.exports = TrendGraph;
}
