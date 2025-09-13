#!/bin/bash

# Cursor Workflow Script for Issue Management
# Usage: ./scripts/work-on-issue.sh <issue-number> [merge]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Check if issue number is provided
if [ $# -eq 0 ]; then
    print_error "Usage: $0 <issue-number> [merge]"
    print_error "Example: $0 1 merge"
    print_error "Example: $0 5"
    exit 1
fi

ISSUE_NUMBER=$1
MERGE_OPTION=${2:-""}

print_status "Starting workflow for issue #$ISSUE_NUMBER"

# Step 1: Analyze issue
print_step "1. Analyzing issue #$ISSUE_NUMBER"
if ! gh issue view $ISSUE_NUMBER > /dev/null 2>&1; then
    print_error "Issue #$ISSUE_NUMBER not found or not accessible"
    exit 1
fi

print_success "Issue #$ISSUE_NUMBER found"

# Get issue details
ISSUE_TITLE=$(gh issue view $ISSUE_NUMBER --json title --jq '.title')
ISSUE_STATE=$(gh issue view $ISSUE_NUMBER --json state --jq '.state')
ISSUE_LABELS=$(gh issue view $ISSUE_NUMBER --json labels --jq '.labels[].name' | tr '\n' ' ')

print_status "Title: $ISSUE_TITLE"
print_status "State: $ISSUE_STATE"
print_status "Labels: $ISSUE_LABELS"

if [ "$ISSUE_STATE" != "OPEN" ]; then
    print_warning "Issue #$ISSUE_NUMBER is not open (state: $ISSUE_STATE)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Workflow cancelled"
        exit 1
    fi
fi

# Step 2: Determine issue type and create branch name
print_step "2. Determining issue type and creating branch"

# Convert title to kebab-case for branch name
BRANCH_NAME=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

# Determine issue type based on labels
if echo "$ISSUE_LABELS" | grep -q "bug"; then
    BRANCH_TYPE="bugfix"
elif echo "$ISSUE_LABELS" | grep -q "urgent\|hotfix"; then
    BRANCH_TYPE="hotfix"
elif echo "$ISSUE_LABELS" | grep -q "enhancement"; then
    BRANCH_TYPE="enhancement"
else
    BRANCH_TYPE="feature"
fi

BRANCH_NAME="${BRANCH_TYPE}/issue-${ISSUE_NUMBER}-${BRANCH_NAME}"

print_status "Branch type: $BRANCH_TYPE"
print_status "Branch name: $BRANCH_NAME"

# Step 3: Create and switch to branch
print_step "3. Creating and switching to branch: $BRANCH_NAME"

if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    print_warning "Branch $BRANCH_NAME already exists"
    read -p "Switch to existing branch? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout $BRANCH_NAME
        print_success "Switched to existing branch: $BRANCH_NAME"
    else
        print_error "Workflow cancelled"
        exit 1
    fi
else
    git checkout -b $BRANCH_NAME
    print_success "Created and switched to branch: $BRANCH_NAME"
fi

# Step 4: Display issue details for implementation
print_step "4. Issue details for implementation"
echo -e "${CYAN}Issue #$ISSUE_NUMBER: $ISSUE_TITLE${NC}"
echo -e "${CYAN}Labels: $ISSUE_LABELS${NC}"
echo -e "${CYAN}Branch: $BRANCH_NAME${NC}"
echo -e "${CYAN}Type: $BRANCH_TYPE${NC}"

# Step 5: Show next steps
print_step "5. Next steps for implementation"
echo -e "${YELLOW}1. Implement the solution for issue #$ISSUE_NUMBER${NC}"
echo -e "${YELLOW}2. Test your changes thoroughly${NC}"
echo -e "${YELLOW}3. Run: git add . && git commit -m \"$BRANCH_TYPE: brief description for issue #$ISSUE_NUMBER\"${NC}"
echo -e "${YELLOW}4. Run: git push -u origin $BRANCH_NAME${NC}"
echo -e "${YELLOW}5. Run: gh pr create --title \"$BRANCH_TYPE: description for issue #$ISSUE_NUMBER\" --body \"Resolves #$ISSUE_NUMBER\"${NC}"

if [ "$MERGE_OPTION" = "merge" ]; then
    echo -e "${RED}6. CRITICAL: Run: ./.github/_local_action_monitor main${NC}"
    echo -e "${YELLOW}7. Run: gh pr merge --squash --delete-branch${NC}"
    print_warning "Merge option enabled - PR will be merged after creation"
    print_error "MANDATORY: Run action monitor before merging to main!"
else
    echo -e "${YELLOW}6. PR will be left open for review${NC}"
fi

print_success "Workflow setup complete for issue #$ISSUE_NUMBER"
print_status "You can now start implementing the solution"
print_status "Use 'cursor' to open the project in Cursor IDE for implementation"

# Optional: Open issue in browser
read -p "Open issue #$ISSUE_NUMBER in browser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    gh issue view $ISSUE_NUMBER --web
fi
