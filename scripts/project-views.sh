#!/bin/bash

# Rock Paper Scissors Battle Royale - Project Views Generator
# This script generates different views of the GitHub project for review

# Project configuration
PROJECT_ID="5"
REPO_OWNER="zsenarchitect"
REPO_NAME="rock-paper-scissors"

echo "🎯 Rock Paper Scissors Battle Royale - Project Views"
echo "=================================================="
echo ""

# Function to get issue data
get_issue_data() {
    gh issue list --repo "$REPO_OWNER/$REPO_NAME" --state all --json number,title,labels,state,createdAt,updatedAt,assignees,milestone
}

# Function to format issue for display
format_issue() {
    local number=$1
    local title=$2
    local labels=$3
    local state=$4
    local created=$5
    local updated=$6
    local assignees=$7
    local milestone=$8
    
    echo "  #$number: $title"
    echo "    📊 State: $state"
    echo "    🏷️  Labels: $labels"
    echo "    📅 Created: $created"
    echo "    🔄 Updated: $updated"
    if [ "$assignees" != "null" ] && [ "$assignees" != "[]" ]; then
        echo "    👥 Assignees: $assignees"
    fi
    if [ "$milestone" != "null" ]; then
        echo "    🎯 Milestone: $milestone"
    fi
    echo ""
}

echo "📊 GENERATING PROJECT VIEWS..."
echo ""

# Get all issue data
echo "🔍 Fetching issue data..."
ISSUE_DATA=$(get_issue_data)

echo "✅ Data fetched successfully!"
echo ""

# View 1: Priority View (by urgency labels)
echo "🎯 VIEW 1: PRIORITY VIEW"
echo "========================"
echo "Issues organized by urgency levels"
echo ""

echo "🔴 URGENT PRIORITY:"
echo "-------------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "urgent") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo "🟠 HIGH PRIORITY:"
echo "-----------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "high") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo "🟡 MEDIUM PRIORITY:"
echo "-------------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "medium") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo "🟢 LOW PRIORITY:"
echo "----------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "low") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo ""
echo "🎯 VIEW 2: PHASE VIEW"
echo "====================="
echo "Issues organized by development phases"
echo ""

echo "🚀 PHASE 1 - CORE FOUNDATION:"
echo "-----------------------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "phase-1") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo "⚡ PHASE 2 - PERFORMANCE OPTIMIZATION:"
echo "-------------------------------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "phase-2") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo "🌟 PHASE 3 - PRODUCTION SCALE:"
echo "------------------------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "phase-3") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo ""
echo "🎯 VIEW 3: CATEGORY VIEW"
echo "========================"
echo "Issues organized by feature categories"
echo ""

echo "🎨 FRONTEND:"
echo "------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "frontend") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo "⚙️  BACKEND:"
echo "-----------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "backend") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo "🤖 AI TRAINING:"
echo "--------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "ai-training") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo "🏗️  INFRASTRUCTURE:"
echo "------------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.labels[].name == "infrastructure") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo ""
echo "🎯 VIEW 4: STATUS VIEW"
echo "====================="
echo "Issues organized by current status"
echo ""

echo "✅ OPEN ISSUES:"
echo "--------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.state == "OPEN") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo "🔒 CLOSED ISSUES:"
echo "----------------"
echo "$ISSUE_DATA" | jq -r '.[] | select(.state == "CLOSED") | "\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | while IFS='|' read -r number title labels state created updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created" "$updated" "$assignees" "$milestone"
done

echo ""
echo "🎯 VIEW 5: TIMELINE VIEW"
echo "======================="
echo "Issues organized by creation date (newest first)"
echo ""

echo "$ISSUE_DATA" | jq -r '.[] | "\(.createdAt)|\(.number)|\(.title)|\(.labels | map(.name) | join(", "))|\(.state)|\(.createdAt)|\(.updatedAt)|\(.assignees | map(.login) | join(", "))|\(.milestone.title // "None")"' | sort -r | while IFS='|' read -r created number title labels state created2 updated assignees milestone; do
    format_issue "$number" "$title" "$labels" "$state" "$created2" "$updated" "$assignees" "$milestone"
done

echo ""
echo "📊 PROJECT SUMMARY"
echo "=================="
TOTAL_ISSUES=$(echo "$ISSUE_DATA" | jq '. | length')
OPEN_ISSUES=$(echo "$ISSUE_DATA" | jq '[.[] | select(.state == "OPEN")] | length')
CLOSED_ISSUES=$(echo "$ISSUE_DATA" | jq '[.[] | select(.state == "CLOSED")] | length')
URGENT_ISSUES=$(echo "$ISSUE_DATA" | jq '[.[] | select(.labels[].name == "urgent")] | length')
HIGH_ISSUES=$(echo "$ISSUE_DATA" | jq '[.[] | select(.labels[].name == "high")] | length')
MEDIUM_ISSUES=$(echo "$ISSUE_DATA" | jq '[.[] | select(.labels[].name == "medium")] | length')
LOW_ISSUES=$(echo "$ISSUE_DATA" | jq '[.[] | select(.labels[].name == "low")] | length')

echo "📈 Total Issues: $TOTAL_ISSUES"
echo "✅ Open Issues: $OPEN_ISSUES"
echo "🔒 Closed Issues: $CLOSED_ISSUES"
echo ""
echo "🎯 Priority Breakdown:"
echo "  🔴 Urgent: $URGENT_ISSUES"
echo "  🟠 High: $HIGH_ISSUES"
echo "  🟡 Medium: $MEDIUM_ISSUES"
echo "  🟢 Low: $LOW_ISSUES"
echo ""
echo "🎉 Project views generated successfully!"
echo "💡 Use 'gh project view 5 --owner zsenarchitect --web' to open the project in your browser"
