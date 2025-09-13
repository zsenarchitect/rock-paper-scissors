#!/bin/bash

# Quick GitHub Actions Status Check
# Shows current status of all workflows without waiting
# Usage: ./quick-check.sh [commit-hash]

set -euo pipefail

REPO="zsenarchitect/rock-paper-scissors"
COMMIT_HASH=${1:-"main"}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Quick GitHub Actions Status Check${NC}"
echo -e "${BLUE}====================================${NC}"
echo "Repository: $REPO"
echo "Commit/Branch: $COMMIT_HASH"
echo "Timestamp: $(date)"
echo ""

# Get recent workflow runs
echo -e "${BLUE}📊 Recent Workflow Runs:${NC}"
gh run list --repo "$REPO" --limit 10 --json databaseId,status,conclusion,workflowName,createdAt,updatedAt,headBranch,displayTitle | jq -r '.[] | "\(.status)|\(.conclusion)|\(.workflowName)|\(.createdAt)|\(.displayTitle)"' | while IFS='|' read -r status conclusion workflow_name created_at title; do
    case $status in
        "completed")
            if [ "$conclusion" = "success" ]; then
                echo -e "  ${GREEN}✅ $workflow_name: SUCCESS${NC}"
            else
                echo -e "  ${RED}❌ $workflow_name: FAILED ($conclusion)${NC}"
            fi
            ;;
        "in_progress")
            echo -e "  ${YELLOW}🔄 $workflow_name: RUNNING${NC}"
            ;;
        "queued")
            echo -e "  ${BLUE}⏳ $workflow_name: QUEUED${NC}"
            ;;
        *)
            echo -e "  ${YELLOW}❓ $workflow_name: $status${NC}"
            ;;
    esac
done

echo ""
echo -e "${BLUE}💡 To monitor workflows continuously, run:${NC}"
echo -e "  ${YELLOW}./.github/scripts/monitor-actions.sh${NC}"
echo -e "  ${YELLOW}./.github/scripts/monitor-actions.sh $COMMIT_HASH 60${NC}  # Wait up to 60 minutes"
