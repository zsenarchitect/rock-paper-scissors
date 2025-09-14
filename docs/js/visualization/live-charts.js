// Live Charts Manager
// Manages real-time chart updates and data visualization

class LiveCharts {
    constructor() {
        this.charts = new Map();
        this.updateInterval = null;
        this.isRunning = false;
    }

    // Initialize all charts
    initialize() {
        try {
            // Initialize pie chart
            const pieCanvas = document.getElementById('pieChart');
            if (pieCanvas) {
                this.charts.set('pie', new PieChart(pieCanvas));
            }

            // Initialize trend chart
            const trendCanvas = document.getElementById('trendChart');
            if (trendCanvas) {
                this.charts.set('trend', new TrendChart(trendCanvas));
            }

            logger.info('Live charts initialized', { chartCount: this.charts.size });
            return true;
        } catch (error) {
            logger.error('Failed to initialize live charts', error);
            return false;
        }
    }

    // Start chart updates
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateInterval = setInterval(() => {
            this.updateAllCharts();
        }, 1000); // Update every second

        logger.info('Live charts started');
    }

    // Stop chart updates
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isRunning = false;
        logger.info('Live charts stopped');
    }

    // Update all charts with current game data
    updateAllCharts() {
        if (!this.isRunning) return;

        try {
            // Get current game state (this would come from the game engine)
            const gameState = this.getCurrentGameState();
            
            // Update pie chart
            const pieChart = this.charts.get('pie');
            if (pieChart && gameState.teamCounts) {
                const pieData = [
                    { name: 'Team 1', value: gameState.teamCounts[1] || 0, color: '#ff6b6b' },
                    { name: 'Team 2', value: gameState.teamCounts[2] || 0, color: '#4ecdc4' },
                    { name: 'Team 3', value: gameState.teamCounts[3] || 0, color: '#45b7d1' }
                ];
                pieChart.updateData(pieData);
            }

            // Update trend chart
            const trendChart = this.charts.get('trend');
            if (trendChart && gameState.teamCounts) {
                trendChart.addDataPoint(gameState.battleTime, gameState.teamCounts);
            }
        } catch (error) {
            logger.error('Error updating charts', error);
        }
    }

    // Get current game state (placeholder - would integrate with game engine)
    getCurrentGameState() {
        // This would normally get data from the game engine
        // For now, return mock data
        return {
            teamCounts: {
                1: Math.floor(Math.random() * 50) + 10,
                2: Math.floor(Math.random() * 50) + 10,
                3: Math.floor(Math.random() * 50) + 10
            },
            battleTime: Date.now() - (this.startTime || Date.now()),
            totalConversions: Math.floor(Math.random() * 100),
            activePlayers: Math.floor(Math.random() * 20) + 5
        };
    }

    // Update specific chart
    updateChart(chartName, data) {
        const chart = this.charts.get(chartName);
        if (chart) {
            chart.updateData(data);
        }
    }

    // Add data point to trend chart
    addTrendDataPoint(time, teamCounts) {
        const trendChart = this.charts.get('trend');
        if (trendChart) {
            trendChart.addDataPoint(time, teamCounts);
        }
    }

    // Reset all charts
    reset() {
        this.charts.forEach(chart => {
            if (chart.reset) {
                chart.reset();
            }
        });
        logger.info('All charts reset');
    }

    // Get chart statistics
    getStats() {
        const stats = {
            chartCount: this.charts.size,
            isRunning: this.isRunning,
            charts: Array.from(this.charts.keys())
        };
        return stats;
    }
}

// Create global instance
const liveCharts = new LiveCharts();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiveCharts;
}
