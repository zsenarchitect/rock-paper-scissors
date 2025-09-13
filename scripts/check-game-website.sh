#!/bin/bash

# Check Game Website Command
# Opens the live GitHub Pages website in the default browser

# Configuration
WEBSITE_URL="https://zsenarchitect.github.io/rock-paper-scissors/"
REPO_NAME="rock-paper-scissors"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Opening Rock Paper Scissors Battle Royale Website${NC}"
echo -e "${YELLOW}Website: ${WEBSITE_URL}${NC}"
echo ""

# Check if website is accessible
echo -e "${BLUE}🔍 Checking website accessibility...${NC}"
if curl -s --head "${WEBSITE_URL}" | head -n 1 | grep -q "200 OK"; then
    echo -e "${GREEN}✅ Website is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Website might be deploying or temporarily unavailable${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Opening in default browser...${NC}"

# Open website in default browser (works on macOS, Linux, and Windows)
if command -v open >/dev/null 2>&1; then
    # macOS
    open "${WEBSITE_URL}"
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "${WEBSITE_URL}"
elif command -v start >/dev/null 2>&1; then
    # Windows
    start "${WEBSITE_URL}"
else
    echo -e "${YELLOW}⚠️  Could not determine how to open browser. Please manually visit:${NC}"
    echo -e "${BLUE}${WEBSITE_URL}${NC}"
fi

echo ""
echo -e "${GREEN}🎮 Game should now be open in your browser!${NC}"
echo -e "${YELLOW}💡 You should see 40 Rock, 40 Paper, and 40 Scissors entities battling automatically${NC}"
echo ""
