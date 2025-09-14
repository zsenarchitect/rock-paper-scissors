#!/usr/bin/env node

// Enhanced HTTP Server for Rock Paper Scissors Battle Royale
// Serves the docs directory with proper MIME types, CORS headers, and debug logging

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = 'localhost';
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const DEBUG_DIR = path.join(__dirname, '..', 'DEBUG', 'logs');

// Ensure DEBUG directory exists
if (!fs.existsSync(DEBUG_DIR)) {
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

// Debug logging
const debugLog = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        message,
        data,
        type: 'backend'
    };
    
    console.log(`[${timestamp}] DEBUG: ${message}`, data || '');
    
    // Write to debug log file
    const logFile = path.join(DEBUG_DIR, `server-debug_${new Date().toISOString().split('T')[0]}.log`);
    const logLine = `${timestamp} - ${message}${data ? ' - ' + JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(logFile, logLine);
};

// Error logging
const errorLog = (message, error = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        message,
        error: error ? error.stack || error.toString() : null,
        type: 'backend_error'
    };
    
    console.error(`[${timestamp}] ERROR: ${message}`, error || '');
    
    // Write to error log file
    const logFile = path.join(DEBUG_DIR, `server-error_${new Date().toISOString().split('T')[0]}.log`);
    const logLine = `${timestamp} - ${message}${error ? ' - ' + (error.stack || error.toString()) : ''}\n`;
    fs.appendFileSync(logFile, logLine);
};

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg'
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
};

function log(message, color = 'blue') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(req, res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        const mimeType = getMimeType(filePath);
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(data);
    });
}

function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    debugLog(`Request received: ${req.method} ${pathname}`, {
        headers: req.headers,
        query: parsedUrl.query
    });
    
    // Handle API endpoints
    if (pathname.startsWith('/api/')) {
        handleAPIRequest(req, res, pathname);
        return;
    }
    
    let filePath = pathname;
    
    // Default to index.html for root path
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
        errorLog('Directory traversal attempt blocked', { path: filePath, ip: req.connection.remoteAddress });
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    
    const fullPath = path.join(DOCS_DIR, filePath);
    
    // Check if file exists
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            debugLog(`File not found: ${filePath}`, { error: err.message });
            // Try serving index.html for SPA routing
            const indexPath = path.join(DOCS_DIR, 'index.html');
            fs.access(indexPath, fs.constants.F_OK, (err2) => {
                if (err2) {
                    errorLog('Index.html not found', { error: err2.message });
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('File not found');
                } else {
                    serveFile(req, res, indexPath);
                }
            });
        } else {
            serveFile(req, res, fullPath);
        }
    });
}

// Handle API requests
function handleAPIRequest(req, res, pathname) {
    const method = req.method;
    
    if (pathname === '/api/logs' && method === 'POST') {
        handleLogSubmission(req, res);
    } else if (pathname === '/api/status' && method === 'GET') {
        handleStatusRequest(req, res);
    } else if (pathname === '/api/debug' && method === 'GET') {
        handleDebugRequest(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
}

// Handle log submission from frontend
function handleLogSubmission(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const logData = JSON.parse(body);
            debugLog('Frontend logs received', logData);
            
            // Write frontend logs to file
            const logFile = path.join(DEBUG_DIR, `frontend-logs_${new Date().toISOString().split('T')[0]}.log`);
            const logLine = `${new Date().toISOString()} - Frontend Logs\n${JSON.stringify(logData, null, 2)}\n\n`;
            fs.appendFileSync(logFile, logLine);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Logs received' }));
        } catch (error) {
            errorLog('Failed to parse frontend logs', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid log data' }));
        }
    });
}

// Handle status request
function handleStatusRequest(req, res) {
    const status = {
        server: 'running',
        port: PORT,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
}

// Handle debug request
function handleDebugRequest(req, res) {
    try {
        const debugFiles = fs.readdirSync(DEBUG_DIR);
        const logs = debugFiles.map(file => {
            const filePath = path.join(DEBUG_DIR, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size,
                modified: stats.mtime
            };
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ logs }));
    } catch (error) {
        errorLog('Failed to read debug files', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read debug files' }));
    }
}

// Create server
const server = http.createServer(handleRequest);

// Handle CORS preflight requests
server.on('request', (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
    }
});

// Start server
server.listen(PORT, HOST, () => {
    log('🚀 Rock Paper Scissors Battle Royale Server Started', 'green');
    log('', 'reset');
    log(`🌐 Server running at: http://${HOST}:${PORT}`, 'yellow');
    log(`📁 Serving files from: ${DOCS_DIR}`, 'yellow');
    log(`🎮 Game URL: http://${HOST}:${PORT}/index.html`, 'yellow');
    log('', 'reset');
    log('💡 Press Ctrl+C to stop the server', 'blue');
    log('', 'reset');
    
    // Auto-open browser if requested
    if (process.argv.includes('--open') || process.argv.includes('-o')) {
        const url = `http://${HOST}:${PORT}`;
        log(`🔍 Opening browser to: ${url}`, 'blue');
        
        const openCommand = process.platform === 'darwin' ? 'open' :
                           process.platform === 'win32' ? 'start' : 'xdg-open';
        
        exec(`${openCommand} ${url}`, (error) => {
            if (error) {
                log('⚠️  Could not auto-open browser', 'yellow');
            }
        });
    }
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        log(`❌ Port ${PORT} is already in use`, 'red');
        log(`💡 Try running with a different port: PORT=3001 node scripts/server.js`, 'yellow');
    } else {
        log(`❌ Server error: ${err.message}`, 'red');
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    log('\n🛑 Shutting down server...', 'yellow');
    server.close(() => {
        log('✅ Server stopped', 'green');
        process.exit(0);
    });
});
