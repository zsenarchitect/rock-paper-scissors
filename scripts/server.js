#!/usr/bin/env node

// Simple HTTP Server for Rock Paper Scissors Battle Royale
// Serves the docs directory with proper MIME types and CORS headers

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = 'localhost';
const DOCS_DIR = path.join(__dirname, '..', 'docs');

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
    let filePath = req.url;
    
    // Default to index.html for root path
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    // Remove query parameters
    filePath = filePath.split('?')[0];
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    
    const fullPath = path.join(DOCS_DIR, filePath);
    
    // Check if file exists
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            // Try serving index.html for SPA routing
            const indexPath = path.join(DOCS_DIR, 'index.html');
            fs.access(indexPath, fs.constants.F_OK, (err2) => {
                if (err2) {
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
