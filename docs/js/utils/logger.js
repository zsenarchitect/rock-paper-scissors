// Logger Utility
class Logger {
    constructor() {
        this.logLevel = GameConfig.debug.logLevel;
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        this.logs = [];
        this.maxLogs = 1000;
    }

    log(level, message, data = null) {
        const levelValue = this.levels[level];
        const currentLevelValue = this.levels[this.logLevel];
        
        if (levelValue >= currentLevelValue) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level,
                message,
                data
            };
            
            this.logs.push(logEntry);
            
            // Keep only the last maxLogs entries
            if (this.logs.length > this.maxLogs) {
                this.logs.shift();
            }
            
            // Console output
            const consoleMethod = level === 'error' ? 'error' : 
                                 level === 'warn' ? 'warn' : 'log';
            
            if (data) {
                console[consoleMethod](`[${timestamp}] ${level.toUpperCase()}: ${message}`, data);
            } else {
                console[consoleMethod](`[${timestamp}] ${level.toUpperCase()}: ${message}`);
            }
        }
    }

    debug(message, data = null) {
        this.log('debug', message, data);
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    // Performance logging
    time(label) {
        console.time(label);
    }

    timeEnd(label) {
        console.timeEnd(label);
    }

    // Get logs for debugging
    getLogs(level = null) {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return this.logs;
    }

    // Clear logs
    clear() {
        this.logs = [];
        console.clear();
    }

    // Export logs
    export() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `battle-logs-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Create global logger instance
const logger = new Logger();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
