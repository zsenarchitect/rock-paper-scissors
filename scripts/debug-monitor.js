#!/usr/bin/env node

// Debug Monitor for Rock Paper Scissors Battle Royale
// Monitors frontend and backend errors in real-time

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DEBUG_DIR = path.join(__dirname, '..', 'DEBUG', 'logs');
const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = 'white') {
    const timestamp = new Date().toISOString();
    console.log(`${COLORS[color]}[${timestamp}] ${message}${COLORS.reset}`);
}

function monitorLogs() {
    log('🔍 Starting Debug Monitor...', 'cyan');
    log(`📁 Monitoring directory: ${DEBUG_DIR}`, 'blue');
    
    // Ensure DEBUG directory exists
    if (!fs.existsSync(DEBUG_DIR)) {
        fs.mkdirSync(DEBUG_DIR, { recursive: true });
        log('📁 Created DEBUG directory', 'yellow');
    }
    
    // Monitor for new log files
    let lastFiles = new Set();
    
    const checkForNewLogs = () => {
        try {
            const files = fs.readdirSync(DEBUG_DIR);
            const currentFiles = new Set(files);
            
            // Check for new files
            for (const file of currentFiles) {
                if (!lastFiles.has(file)) {
                    log(`📄 New log file detected: ${file}`, 'green');
                    monitorFile(path.join(DEBUG_DIR, file));
                }
            }
            
            lastFiles = currentFiles;
        } catch (error) {
            log(`❌ Error reading debug directory: ${error.message}`, 'red');
        }
    };
    
    // Monitor individual log file
    const monitorFile = (filePath) => {
        if (!fs.existsSync(filePath)) return;
        
        let lastSize = fs.statSync(filePath).size;
        
        const checkFile = () => {
            try {
                if (!fs.existsSync(filePath)) return;
                
                const stats = fs.statSync(filePath);
                if (stats.size > lastSize) {
                    // Read new content
                    const stream = fs.createReadStream(filePath, { start: lastSize });
                    let newContent = '';
                    
                    stream.on('data', (chunk) => {
                        newContent += chunk.toString();
                    });
                    
                    stream.on('end', () => {
                        if (newContent.trim()) {
                            const lines = newContent.trim().split('\n');
                            lines.forEach(line => {
                                if (line.trim()) {
                                    displayLogLine(line, filePath);
                                }
                            });
                        }
                        lastSize = stats.size;
                    });
                }
            } catch (error) {
                log(`❌ Error monitoring file ${filePath}: ${error.message}`, 'red');
            }
        };
        
        // Check file every 500ms
        const interval = setInterval(checkFile, 500);
        
        // Clean up interval when file is deleted
        const checkExists = () => {
            if (!fs.existsSync(filePath)) {
                clearInterval(interval);
            } else {
                setTimeout(checkExists, 1000);
            }
        };
        checkExists();
    };
    
    // Display log line with appropriate formatting
    const displayLogLine = (line, filePath) => {
        const fileName = path.basename(filePath);
        
        if (line.includes('ERROR') || line.includes('error')) {
            log(`🔴 [${fileName}] ${line}`, 'red');
        } else if (line.includes('WARN') || line.includes('warn')) {
            log(`🟡 [${fileName}] ${line}`, 'yellow');
        } else if (line.includes('DEBUG') || line.includes('debug')) {
            log(`🔵 [${fileName}] ${line}`, 'blue');
        } else {
            log(`⚪ [${fileName}] ${line}`, 'white');
        }
    };
    
    // Initial check
    checkForNewLogs();
    
    // Check every 2 seconds for new files
    setInterval(checkForNewLogs, 2000);
    
    // Monitor existing files
    try {
        const existingFiles = fs.readdirSync(DEBUG_DIR);
        existingFiles.forEach(file => {
            if (file.endsWith('.log')) {
                monitorFile(path.join(DEBUG_DIR, file));
            }
        });
    } catch (error) {
        log(`❌ Error reading existing files: ${error.message}`, 'red');
    }
}

function showLogSummary() {
    log('📊 Debug Log Summary', 'cyan');
    log('='.repeat(50), 'cyan');
    
    try {
        const files = fs.readdirSync(DEBUG_DIR);
        const logFiles = files.filter(f => f.endsWith('.log'));
        
        if (logFiles.length === 0) {
            log('📭 No log files found', 'yellow');
            return;
        }
        
        logFiles.forEach(file => {
            const filePath = path.join(DEBUG_DIR, file);
            const stats = fs.statSync(filePath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            
            log(`📄 ${file} (${sizeKB} KB) - Modified: ${stats.mtime.toISOString()}`, 'blue');
            
            // Count error/warning lines
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                const errorCount = lines.filter(line => line.includes('ERROR') || line.includes('error')).length;
                const warnCount = lines.filter(line => line.includes('WARN') || line.includes('warn')).length;
                const debugCount = lines.filter(line => line.includes('DEBUG') || line.includes('debug')).length;
                
                if (errorCount > 0) log(`   🔴 Errors: ${errorCount}`, 'red');
                if (warnCount > 0) log(`   🟡 Warnings: ${warnCount}`, 'yellow');
                if (debugCount > 0) log(`   🔵 Debug: ${debugCount}`, 'blue');
            } catch (error) {
                log(`   ❌ Error reading file: ${error.message}`, 'red');
            }
        });
    } catch (error) {
        log(`❌ Error reading debug directory: ${error.message}`, 'red');
    }
}

function clearLogs() {
    log('🧹 Clearing debug logs...', 'yellow');
    
    try {
        const files = fs.readdirSync(DEBUG_DIR);
        files.forEach(file => {
            if (file.endsWith('.log')) {
                fs.unlinkSync(path.join(DEBUG_DIR, file));
                log(`🗑️  Deleted: ${file}`, 'yellow');
            }
        });
        log('✅ Debug logs cleared', 'green');
    } catch (error) {
        log(`❌ Error clearing logs: ${error.message}`, 'red');
    }
}

// Command line interface
const command = process.argv[2];

switch (command) {
    case 'monitor':
    case 'watch':
        monitorLogs();
        break;
    case 'summary':
    case 'status':
        showLogSummary();
        break;
    case 'clear':
        clearLogs();
        break;
    default:
        log('🔍 Debug Monitor for Rock Paper Scissors Battle Royale', 'cyan');
        log('', 'white');
        log('Usage:', 'yellow');
        log('  node scripts/debug-monitor.js monitor  - Monitor logs in real-time', 'white');
        log('  node scripts/debug-monitor.js summary  - Show log summary', 'white');
        log('  node scripts/debug-monitor.js clear    - Clear all debug logs', 'white');
        log('', 'white');
        log('Examples:', 'yellow');
        log('  node scripts/debug-monitor.js monitor', 'white');
        log('  node scripts/debug-monitor.js summary', 'white');
        break;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('\n🛑 Debug monitor stopped', 'yellow');
    process.exit(0);
});
