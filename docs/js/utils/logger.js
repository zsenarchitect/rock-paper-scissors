// Enhanced Logger Utility with File Logging
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
        this.errorCount = 0;
        this.warningCount = 0;
        this.debugMode = GameConfig.debug.enabled;
        
        // Set up global error handlers
        this.setupGlobalErrorHandlers();
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
            
            // Track error counts
            if (level === 'error') {
                this.errorCount++;
            } else if (level === 'warn') {
                this.warningCount++;
            }
            
            // Keep only the last maxLogs entries
            if (this.logs.length > this.maxLogs) {
                this.logs.shift();
            }
            
            // Console output with enhanced formatting
            const consoleMethod = level === 'error' ? 'error' : 
                                 level === 'warn' ? 'warn' : 'log';
            
            const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
            const styledPrefix = level === 'error' ? `%c${prefix}` : 
                               level === 'warn' ? `%c${prefix}` : prefix;
            const style = level === 'error' ? 'color: red; font-weight: bold;' : 
                         level === 'warn' ? 'color: orange; font-weight: bold;' : '';
            
            if (data) {
                if (level === 'error' || level === 'warn') {
                    console[consoleMethod](styledPrefix, style, message, data);
                } else {
                    console[consoleMethod](`${prefix} ${message}`, data);
                }
            } else {
                if (level === 'error' || level === 'warn') {
                    console[consoleMethod](styledPrefix, style, message);
                } else {
                    console[consoleMethod](`${prefix} ${message}`);
                }
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

    // Set up global error handlers
    setupGlobalErrorHandlers() {
        // Catch unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.error('Unhandled JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error ? event.error.stack : null
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });

        // Catch resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.error('Resource Loading Error', {
                    type: event.target.tagName,
                    src: event.target.src || event.target.href,
                    error: event.error
                });
            }
        }, true);
    }

    // Send logs to backend for persistent storage
    async sendLogsToBackend() {
        try {
            const errorLogs = this.getLogs('error');
            const warningLogs = this.getLogs('warn');
            
            if (errorLogs.length > 0 || warningLogs.length > 0) {
                const logData = {
                    errors: errorLogs,
                    warnings: warningLogs,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                };

                // Send to backend logging endpoint
                await fetch('/api/logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(logData)
                });
            }
        } catch (error) {
            console.error('Failed to send logs to backend:', error);
        }
    }

    // Get error statistics
    getErrorStats() {
        return {
            totalErrors: this.errorCount,
            totalWarnings: this.warningCount,
            recentErrors: this.getLogs('error').slice(-10),
            recentWarnings: this.getLogs('warn').slice(-10)
        };
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
