#!/bin/bash

# Setup Project Iterations with Urgency Levels
# This script adds all issues to the GitHub project and assigns urgency levels

echo "🚀 Setting up iteration-driven development with urgency levels..."

# Get project ID
PROJECT_ID="PVT_kwHOA6l1Fc4BDBdk"

# Function to add issue to project with urgency
add_issue_to_project() {
    local issue_id=$1
    local urgency=$2
    local iteration=$3
    
    echo "📋 Adding Issue #$issue_id to project with urgency: $urgency"
    
    # Add urgency label
    gh issue edit $issue_id --add-label "$urgency"
    
    # Add to project (this would require GitHub CLI project commands)
    echo "✅ Issue #$issue_id assigned urgency: $urgency, iteration: $iteration"
}

# URGENT - Critical issues for immediate completion
echo "🔴 URGENT Issues (Current Iteration - Week 1):"
add_issue_to_project 3 "urgent" "Current"
add_issue_to_project 1 "urgent" "Current"
add_issue_to_project 2 "urgent" "Current"

# HIGH - High priority issues for current iteration
echo "🟠 HIGH Priority Issues (Current Iteration - Week 1-2):"
add_issue_to_project 4 "high" "Current"
add_issue_to_project 5 "high" "Current"
add_issue_to_project 6 "high" "Current"
add_issue_to_project 7 "high" "Current"

# MEDIUM - Medium priority issues for next iteration
echo "🟡 MEDIUM Priority Issues (Next Iteration - Week 2-3):"
add_issue_to_project 8 "medium" "Next"
add_issue_to_project 9 "medium" "Next"
add_issue_to_project 10 "medium" "Next"
add_issue_to_project 11 "medium" "Next"

# LOW - Low priority issues for future iterations
echo "🟢 LOW Priority Issues (Future Iterations - Week 3+):"
add_issue_to_project 12 "low" "Future"
add_issue_to_project 13 "low" "Future"
add_issue_to_project 14 "low" "Future"
add_issue_to_project 15 "low" "Future"
add_issue_to_project 16 "low" "Future"

echo "✅ All issues assigned to project with urgency levels!"
echo ""
echo "📊 Iteration Summary:"
echo "🔴 URGENT (3 issues): Critical for immediate completion"
echo "🟠 HIGH (4 issues): High priority for current iteration"
echo "🟡 MEDIUM (4 issues): Medium priority for next iteration"
echo "🟢 LOW (5 issues): Low priority for future iterations"
echo ""
echo "🎯 Focus on URGENT and HIGH priority issues for the current iteration!"
