#!/bin/bash

# GitHub Actions Workflow Summary Generator
# This script generates comprehensive reports for all GitHub Actions workflows

set -e

# Configuration
WORKFLOW_NAME="${1:-Unknown Workflow}"
WORKFLOW_RUN_ID="${2:-$GITHUB_RUN_ID}"
WORKFLOW_SHA="${3:-$GITHUB_SHA}"
WORKFLOW_REF="${4:-$GITHUB_REF_NAME}"
WORKFLOW_ACTOR="${5:-$GITHUB_ACTOR}"

# Create reports directory
mkdir -p ./reports
mkdir -p ./logs

# Generate main summary report
echo "📊 Generating comprehensive workflow summary..."

cat > ./reports/workflow-summary.md << EOF
# 🎯 GitHub Actions Workflow Summary

**Workflow:** $WORKFLOW_NAME  
**Run ID:** $WORKFLOW_RUN_ID  
**Commit:** $WORKFLOW_SHA  
**Branch:** $WORKFLOW_REF  
**Actor:** $WORKFLOW_ACTOR  
**Generated:** $(date)  

## 📋 Workflow Information

| Field | Value |
|-------|-------|
| Workflow Name | $WORKFLOW_NAME |
| Run ID | $WORKFLOW_RUN_ID |
| Commit SHA | $WORKFLOW_SHA |
| Branch | $WORKFLOW_REF |
| Actor | $WORKFLOW_ACTOR |
| Start Time | $(date -d "@$GITHUB_WORKFLOW_START_TIME" 2>/dev/null || echo "Unknown") |
| Duration | $(($(date +%s) - ${GITHUB_WORKFLOW_START_TIME:-$(date +%s)})) seconds |

## 📁 Generated Artifacts

EOF

# List all artifacts
if [ -d "./artifacts" ]; then
    echo "### Artifact Files" >> ./reports/workflow-summary.md
    echo "" >> ./reports/workflow-summary.md
    find ./artifacts -type f \( -name "*.log" -o -name "*.json" -o -name "*.txt" -o -name "*.xml" -o -name "*.md" \) | while read file; do
        size=$(stat -c%s "$file" 2>/dev/null || echo "0")
        echo "- \`$(basename "$file")\` - $size bytes" >> ./reports/workflow-summary.md
    done
    echo "" >> ./reports/workflow-summary.md
fi

# Generate detailed logs section
cat >> ./reports/workflow-summary.md << EOF
## 🔍 Detailed Logs

### System Information
\`\`\`
OS: $(uname -a)
Node Version: $(node --version 2>/dev/null || echo "Not installed")
Python Version: $(python3 --version 2>/dev/null || echo "Not installed")
Git Version: $(git --version 2>/dev/null || echo "Not installed")
Available Memory: $(free -h 2>/dev/null | grep "Mem:" | awk '{print $2}' || echo "Unknown")
Disk Usage: $(df -h . 2>/dev/null | tail -1 | awk '{print $5}' || echo "Unknown")
\`\`\`

### Environment Variables
\`\`\`
GITHUB_WORKFLOW: $GITHUB_WORKFLOW
GITHUB_RUN_ID: $GITHUB_RUN_ID
GITHUB_RUN_NUMBER: $GITHUB_RUN_NUMBER
GITHUB_ACTOR: $GITHUB_ACTOR
GITHUB_REPOSITORY: $GITHUB_REPOSITORY
GITHUB_EVENT_NAME: $GITHUB_EVENT_NAME
GITHUB_REF: $GITHUB_REF
GITHUB_HEAD_REF: $GITHUB_HEAD_REF
GITHUB_BASE_REF: $GITHUB_BASE_REF
\`\`\`

EOF

# Add specific log sections if files exist
if [ -f "./artifacts/frontend-reports/frontend-lint-report.json" ]; then
    echo "### Frontend Linting Results" >> ./reports/workflow-summary.md
    echo '```json' >> ./reports/workflow-summary.md
    cat ./artifacts/frontend-reports/frontend-lint-report.json >> ./reports/workflow-summary.md
    echo '```' >> ./reports/workflow-summary.md
    echo "" >> ./reports/workflow-summary.md
fi

if [ -f "./artifacts/backend-reports/backend-test-results.xml" ]; then
    echo "### Backend Test Results" >> ./reports/workflow-summary.md
    echo '```xml' >> ./reports/workflow-summary.md
    head -50 ./artifacts/backend-reports/backend-test-results.xml >> ./reports/workflow-summary.md
    echo '```' >> ./reports/workflow-summary.md
    echo "" >> ./reports/workflow-summary.md
fi

if [ -f "./artifacts/security-reports/bandit-report.json" ]; then
    echo "### Security Scan Results" >> ./reports/workflow-summary.md
    echo '```json' >> ./reports/workflow-summary.md
    cat ./artifacts/security-reports/bandit-report.json >> ./reports/workflow-summary.md
    echo '```' >> ./reports/workflow-summary.md
    echo "" >> ./reports/workflow-summary.md
fi

# Add performance metrics if available
if [ -f "./artifacts/performance-reports/memory-usage-test.log" ]; then
    echo "### Performance Metrics" >> ./reports/workflow-summary.md
    echo '```' >> ./reports/workflow-summary.md
    cat ./artifacts/performance-reports/memory-usage-test.log >> ./reports/workflow-summary.md
    echo '```' >> ./reports/workflow-summary.md
    echo "" >> ./reports/workflow-summary.md
fi

# Add next steps and recommendations
cat >> ./reports/workflow-summary.md << EOF
## 🚀 Next Steps

1. **Review Reports**: Check all generated reports and logs for issues
2. **Address Failures**: Fix any failed tests or security issues
3. **Performance**: Review performance metrics and optimize if needed
4. **Deploy**: Proceed with deployment if all checks pass
5. **Monitor**: Set up monitoring for production deployment

## 📊 Summary Statistics

- **Total Artifacts:** $(find ./artifacts -type f 2>/dev/null | wc -l)
- **Total Log Files:** $(find ./artifacts -name "*.log" 2>/dev/null | wc -l)
- **Total JSON Reports:** $(find ./artifacts -name "*.json" 2>/dev/null | wc -l)
- **Total XML Reports:** $(find ./artifacts -name "*.xml" 2>/dev/null | wc -l)
- **Total Size:** $(du -sh ./artifacts 2>/dev/null | cut -f1 || echo "Unknown")

## 🔗 Related Links

- [Repository](https://github.com/$GITHUB_REPOSITORY)
- [Actions](https://github.com/$GITHUB_REPOSITORY/actions)
- [This Run](https://github.com/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID)

---

*Generated by GitHub Actions Workflow Summary Generator*
EOF

# Generate JSON summary for programmatic access
cat > ./reports/workflow-summary.json << EOF
{
  "workflow": {
    "name": "$WORKFLOW_NAME",
    "run_id": "$WORKFLOW_RUN_ID",
    "sha": "$WORKFLOW_SHA",
    "ref": "$WORKFLOW_REF",
    "actor": "$WORKFLOW_ACTOR",
    "start_time": "$(date -d "@$GITHUB_WORKFLOW_START_TIME" 2>/dev/null || echo "Unknown")",
    "duration_seconds": $(($(date +%s) - ${GITHUB_WORKFLOW_START_TIME:-$(date +%s)}))
  },
  "artifacts": {
    "total_files": $(find ./artifacts -type f 2>/dev/null | wc -l),
    "log_files": $(find ./artifacts -name "*.log" 2>/dev/null | wc -l),
    "json_reports": $(find ./artifacts -name "*.json" 2>/dev/null | wc -l),
    "xml_reports": $(find ./artifacts -name "*.xml" 2>/dev/null | wc -l),
    "total_size_bytes": $(du -sb ./artifacts 2>/dev/null | cut -f1 || echo "0")
  },
  "system": {
    "os": "$(uname -a)",
    "node_version": "$(node --version 2>/dev/null || echo "Not installed")",
    "python_version": "$(python3 --version 2>/dev/null || echo "Not installed")",
    "git_version": "$(git --version 2>/dev/null || echo "Not installed")"
  },
  "generated_at": "$(date -Iseconds)"
}
EOF

# Generate traceback log if there are any errors
if [ -f "./logs/error.log" ]; then
    echo "### Error Traceback" >> ./reports/workflow-summary.md
    echo '```' >> ./reports/workflow-summary.md
    cat ./logs/error.log >> ./reports/workflow-summary.md
    echo '```' >> ./reports/workflow-summary.md
    echo "" >> ./reports/workflow-summary.md
fi

echo "✅ Workflow summary generated successfully!"
echo "📁 Reports saved to: ./reports/"
echo "📊 Summary: ./reports/workflow-summary.md"
echo "📋 JSON: ./reports/workflow-summary.json"
