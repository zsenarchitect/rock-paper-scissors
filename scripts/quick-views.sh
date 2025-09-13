#!/bin/bash

# Quick Project Views - Simplified versions for quick review
# Rock Paper Scissors Battle Royale

REPO_OWNER="zsenarchitect"
REPO_NAME="rock-paper-scissors"

echo "🎯 Quick Project Views"
echo "====================="
echo ""

# Function to show a specific view
show_view() {
    local view_name=$1
    local filter=$2
    local description=$3
    
    echo "📊 $view_name"
    echo "$description"
    echo "----------------------------------------"
    
    gh issue list --repo "$REPO_OWNER/$REPO_NAME" --state all --json number,title,labels,state --jq "$filter" | while IFS='|' read -r number title labels state; do
        echo "  #$number: $title"
        echo "    🏷️  $labels | 📊 $state"
        echo ""
    done
    echo ""
}

# View 1: Urgent Issues Only
echo "🔴 URGENT ISSUES (Must Complete Now)"
echo "===================================="
gh issue list --repo "$REPO_OWNER/$REPO_NAME" --label "urgent" --json number,title,labels,state --jq '.[] | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)"' | while IFS='|' read -r number title labels state; do
    echo "  #$number: $title"
    echo "    🏷️  $labels | 📊 $state"
    echo ""
done
echo ""

# View 2: Current Iteration (Urgent + High)
echo "🎯 CURRENT ITERATION (Urgent + High Priority)"
echo "============================================="
gh issue list --repo "$REPO_OWNER/$REPO_NAME" --label "urgent,high" --json number,title,labels,state --jq '.[] | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)"' | while IFS='|' read -r number title labels state; do
    echo "  #$number: $title"
    echo "    🏷️  $labels | 📊 $state"
    echo ""
done
echo ""

# View 3: Phase 1 Issues
echo "🚀 PHASE 1 - CORE FOUNDATION"
echo "============================"
gh issue list --repo "$REPO_OWNER/$REPO_NAME" --label "phase-1" --json number,title,labels,state --jq '.[] | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)"' | while IFS='|' read -r number title labels state; do
    echo "  #$number: $title"
    echo "    🏷️  $labels | 📊 $state"
    echo ""
done
echo ""

# View 4: Frontend Issues
echo "🎨 FRONTEND ISSUES"
echo "=================="
gh issue list --repo "$REPO_OWNER/$REPO_NAME" --label "frontend" --json number,title,labels,state --jq '.[] | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)"' | while IFS='|' read -r number title labels state; do
    echo "  #$number: $title"
    echo "    🏷️  $labels | 📊 $state"
    echo ""
done
echo ""

# View 5: Backend Issues
echo "⚙️  BACKEND ISSUES"
echo "=================="
gh issue list --repo "$REPO_OWNER/$REPO_NAME" --label "backend" --json number,title,labels,state --jq '.[] | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)"' | while IFS='|' read -r number title labels state; do
    echo "  #$number: $title"
    echo "    🏷️  $labels | 📊 $state"
    echo ""
done
echo ""

# View 6: AI Training Issues
echo "🤖 AI TRAINING ISSUES"
echo "====================="
gh issue list --repo "$REPO_OWNER/$REPO_NAME" --label "ai-training" --json number,title,labels,state --jq '.[] | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)"' | while IFS='|' read -r number title labels state; do
    echo "  #$number: $title"
    echo "    🏷️  $labels | 📊 $state"
    echo ""
done
echo ""

# Summary
echo "📊 QUICK SUMMARY"
echo "================"
TOTAL=$(gh issue list --repo "$REPO_OWNER/$REPO_NAME" --state all --json number | jq '. | length')
OPEN=$(gh issue list --repo "$REPO_OWNER/$REPO_NAME" --state open --json number | jq '. | length')
URGENT=$(gh issue list --repo "$REPO_OWNER/$REPO_NAME" --label "urgent" --json number | jq '. | length')
HIGH=$(gh issue list --repo "$REPO_OWNER/$REPO_NAME" --label "high" --json number | jq '. | length')

echo "📈 Total Issues: $TOTAL"
echo "✅ Open Issues: $OPEN"
echo "🔴 Urgent: $URGENT"
echo "🟠 High: $HIGH"
echo ""
echo "💡 Next Steps:"
echo "  1. Focus on URGENT issues first"
echo "  2. Then tackle HIGH priority issues"
echo "  3. Use 'gh project view 5 --owner zsenarchitect --web' for full project view"
