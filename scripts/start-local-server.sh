#!/bin/bash

# Start Local Server Command
# Runs the Rock Paper Scissors webapp locally with a simple HTTP server

# Configuration
PORT=3000
DOCS_DIR="docs"
HOST="localhost"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Rock Paper Scissors Battle Royale Local Server${NC}"
echo ""

# Check if docs directory exists
if [ ! -d "$DOCS_DIR" ]; then
    echo -e "${RED}❌ Error: $DOCS_DIR directory not found${NC}"
    echo -e "${YELLOW}💡 Make sure you're running this from the project root directory${NC}"
    exit 1
fi

# Check if index.html exists
if [ ! -f "$DOCS_DIR/index.html" ]; then
    echo -e "${RED}❌ Error: $DOCS_DIR/index.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found webapp files in $DOCS_DIR directory${NC}"
echo ""

# Check if port is available
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $PORT is already in use. Trying port $((PORT + 1))...${NC}"
    PORT=$((PORT + 1))
fi

# Try different server options
echo -e "${BLUE}🔍 Looking for available HTTP server...${NC}"

if command -v python3 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Using Python 3 HTTP server${NC}"
    echo ""
    echo -e "${YELLOW}🌐 Server starting at: http://$HOST:$PORT${NC}"
    echo -e "${YELLOW}📁 Serving files from: $DOCS_DIR${NC}"
    echo -e "${YELLOW}🎮 Game will be available at: http://$HOST:$PORT/index.html${NC}"
    echo ""
    echo -e "${BLUE}💡 Press Ctrl+C to stop the server${NC}"
    echo ""
    
    cd "$DOCS_DIR"
    python3 -m http.server $PORT
    
elif command -v python >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Using Python 2 HTTP server${NC}"
    echo ""
    echo -e "${YELLOW}🌐 Server starting at: http://$HOST:$PORT${NC}"
    echo -e "${YELLOW}📁 Serving files from: $DOCS_DIR${NC}"
    echo -e "${YELLOW}🎮 Game will be available at: http://$HOST:$PORT/index.html${NC}"
    echo ""
    echo -e "${BLUE}💡 Press Ctrl+C to stop the server${NC}"
    echo ""
    
    cd "$DOCS_DIR"
    python -m SimpleHTTPServer $PORT
    
elif command -v node >/dev/null 2>&1 && command -v npx >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Using Node.js http-server${NC}"
    echo ""
    echo -e "${YELLOW}🌐 Server starting at: http://$HOST:$PORT${NC}"
    echo -e "${YELLOW}📁 Serving files from: $DOCS_DIR${NC}"
    echo -e "${YELLOW}🎮 Game will be available at: http://$HOST:$PORT/index.html${NC}"
    echo ""
    echo -e "${BLUE}💡 Press Ctrl+C to stop the server${NC}"
    echo ""
    
    cd "$DOCS_DIR"
    npx http-server -p $PORT -o
    
elif command -v php >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Using PHP built-in server${NC}"
    echo ""
    echo -e "${YELLOW}🌐 Server starting at: http://$HOST:$PORT${NC}"
    echo -e "${YELLOW}📁 Serving files from: $DOCS_DIR${NC}"
    echo -e "${YELLOW}🎮 Game will be available at: http://$HOST:$PORT/index.html${NC}"
    echo ""
    echo -e "${BLUE}💡 Press Ctrl+C to stop the server${NC}"
    echo ""
    
    cd "$DOCS_DIR"
    php -S $HOST:$PORT
    
else
    echo -e "${RED}❌ No HTTP server found${NC}"
    echo ""
    echo -e "${YELLOW}💡 Please install one of the following:${NC}"
    echo -e "${YELLOW}   - Python 3: brew install python3 (macOS) or apt-get install python3 (Ubuntu)${NC}"
    echo -e "${YELLOW}   - Node.js: brew install node (macOS) or apt-get install nodejs (Ubuntu)${NC}"
    echo -e "${YELLOW}   - PHP: brew install php (macOS) or apt-get install php (Ubuntu)${NC}"
    echo ""
    echo -e "${BLUE}💡 Or manually open: file://$(pwd)/$DOCS_DIR/index.html${NC}"
    echo -e "${YELLOW}⚠️  Note: Some features may not work with file:// protocol${NC}"
    exit 1
fi
