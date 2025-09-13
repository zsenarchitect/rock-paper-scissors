# 🎯 Cursor Workflow for Issue Management

## Quick Start

When you want to work on an issue, use this command format:

```bash
work on issue X with option (merge optional)
```

**Examples:**
- `work on issue 1` - Work on issue #1, create PR, leave open for review
- `work on issue 5 merge` - Work on issue #5, create PR, and merge it
- `work on issue 12 with merge` - Work on issue #12, create PR, and merge it

## 🔄 Automated Workflow

The workflow automatically:

1. **Analyzes the issue** - Checks description, labels, priority
2. **Creates a dedicated branch** - Based on issue type and number
3. **Implements the solution** - Step by step with TODO tracking
4. **Tests thoroughly** - Linting, functionality, browser testing
5. **Commits changes** - With descriptive commit messages
6. **Creates PR** - With detailed description and issue reference
7. **Optionally merges** - If merge is requested

## 📋 Workflow Steps

### Step 1: Issue Analysis
```bash
gh issue view X
```
- Reads issue description, labels, and comments
- Determines issue type (bug, feature, enhancement, urgent)
- Checks if requirements are clear
- Creates TODO list for tracking

### Step 2: Branch Creation
```bash
git checkout -b {type}/issue-{number}-{description}
```
- **Bug**: `bugfix/issue-5-fix-audio-loading`
- **Feature**: `feature/issue-1-cute-cursor`
- **Enhancement**: `enhancement/issue-12-improve-performance`
- **Urgent**: `hotfix/issue-3-urgent-security-fix`

### Step 3: Implementation
- Breaks down task into specific TODO items
- Implements solution step by step
- Follows existing code patterns
- Adds comprehensive comments
- Tests each change

### Step 4: Quality Assurance
- Runs linting checks with `read_lints`
- Tests functionality thoroughly
- Verifies no regressions
- Tests in browser if frontend change

### Step 5: Version Control
```bash
git add .
git commit -m "{type}: brief description for issue #{number}

- Detailed bullet points of changes
- Any breaking changes or important notes
- Testing performed
- Dependencies updated

Resolves #{number}"
```

### Step 6: Pull Request
```bash
git push -u origin {branch-name}
gh pr create --title "{type}: description for issue #{number}" --body "## Description

Brief description of what was implemented.

## Changes Made
- List of specific changes
- Any new features added
- Bug fixes implemented
- Performance improvements

## Testing
- How the changes were tested
- Any manual testing performed
- Browser/device testing if applicable

Resolves #{number}"
```

### Step 7: Optional Merge
```bash
# If merge is requested
gh pr merge --squash --delete-branch

# If not requested, leave PR open for review
gh pr comment --body "PR ready for review. Changes implemented and tested."
```

## 🎮 Usage Examples

### Example 1: Feature Implementation
```bash
# Command
work on issue 1

# What happens:
# 1. Analyzes issue #1 (cute cursor)
# 2. Creates branch: feature/issue-1-cute-cursor
# 3. Implements cute cursor with personality
# 4. Tests in browser
# 5. Commits with descriptive message
# 6. Creates PR with screenshots
# 7. Leaves PR open for review
```

### Example 2: Bug Fix with Merge
```bash
# Command
work on issue 5 merge

# What happens:
# 1. Analyzes issue #5 (audio loading bug)
# 2. Creates branch: bugfix/issue-5-fix-audio-loading
# 3. Fixes audio loading issue
# 4. Tests audio functionality
# 5. Commits fix
# 6. Creates PR
# 7. Merges PR immediately
```

### Example 3: Urgent Hotfix
```bash
# Command
work on issue 3 with merge

# What happens:
# 1. Analyzes issue #3 (urgent security fix)
# 2. Creates branch: hotfix/issue-3-urgent-security-fix
# 3. Implements security fix
# 4. Tests security measures
# 5. Commits fix
# 6. Creates PR
# 7. Merges PR immediately
# 8. Notifies team of urgent fix
```

## 🔧 Manual Workflow Script

You can also use the manual script:

```bash
# Basic usage
./scripts/work-on-issue.sh 1

# With merge option
./scripts/work-on-issue.sh 5 merge

# With merge option (alternative syntax)
./scripts/work-on-issue.sh 12 with merge
```

## 📝 TODO List Template

The workflow automatically creates a TODO list:

```javascript
todo_write({
    merge: false,
    todos: [
        {id: 'analyze_issue', content: 'Analyze issue X requirements', status: 'in_progress'},
        {id: 'create_branch', content: 'Create dedicated branch for issue X', status: 'pending'},
        {id: 'implement_solution', content: 'Implement solution for issue X', status: 'pending'},
        {id: 'test_implementation', content: 'Test the implementation', status: 'pending'},
        {id: 'commit_changes', content: 'Commit changes for issue X', status: 'pending'},
        {id: 'create_pr', content: 'Create pull request for issue X', status: 'pending'},
        {id: 'optional_merge', content: 'Merge PR if requested', status: 'pending'}
    ]
});
```

## 🎯 Issue Type Detection

The workflow automatically detects issue types:

- **Bug** → `bugfix/issue-X-fix-description`
- **Feature** → `feature/issue-X-add-description`
- **Enhancement** → `enhancement/issue-X-improve-description`
- **Urgent** → `hotfix/issue-X-urgent-description`

## 🚨 Error Handling

### If Issue Description is Unclear
1. Adds comment to issue asking for clarification
2. Makes reasonable assumptions
3. Documents assumptions in PR description

### If Implementation Fails
1. Reverts changes
2. Creates new branch with different approach
3. Documents what was tried and why it failed

### If Tests Fail
1. Fixes failing tests
2. Adds new tests if needed
3. Ensures all tests pass before committing

## 📋 Workflow Completion Checklist

- [ ] Issue analyzed and understood
- [ ] Branch created with proper naming
- [ ] Solution implemented and tested
- [ ] All tests passing
- [ ] Code linted and clean
- [ ] Changes committed with descriptive message
- [ ] Branch pushed to remote
- [ ] PR created with detailed description
- [ ] PR merged if requested
- [ ] TODO list completed
- [ ] Cleanup performed

## 🎮 Special Cases

### Urgent Issues
- Uses `hotfix/` prefix
- Skips some testing if critical
- Merges immediately after PR creation
- Notifies team of urgent fix

### UI/UX Issues
- Tests in multiple browsers
- Includes before/after screenshots
- Tests responsive design
- Verifies accessibility

### Backend Issues
- Tests API endpoints
- Verifies database changes
- Checks error handling
- Tests performance impact

## 🔧 Quick Commands

### Check Issue Status
```bash
gh issue view X --json state,title,labels,assignees
```

### List Open Issues
```bash
gh issue list --state open
```

### Check PR Status
```bash
gh pr list --head feature/issue-X-description
```

### Merge PR
```bash
gh pr merge --squash --delete-branch
```

## 🎯 Success Metrics

- Issue resolved completely
- Code follows project conventions
- Tests pass and coverage maintained
- Documentation updated if needed
- PR approved and merged
- No regressions introduced
- Clean git history maintained

## 🚀 Getting Started

1. **Install GitHub CLI** (if not already installed)
2. **Authenticate with GitHub** (`gh auth login`)
3. **Use the workflow command**:
   ```bash
   work on issue X with option (merge optional)
   ```

The workflow will handle everything else automatically! 🎮✨
