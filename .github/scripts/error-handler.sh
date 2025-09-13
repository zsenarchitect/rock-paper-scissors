#!/bin/bash

# GitHub Actions Error Handler and Traceback Generator
# This script provides comprehensive error handling and traceback generation

set -e

# Error handling configuration
ERROR_LOG_DIR="./logs/errors"
TRACEBACK_LOG_DIR="./logs/tracebacks"
DEBUG_LOG_DIR="./logs/debug"

# Create log directories
mkdir -p "$ERROR_LOG_DIR" "$TRACEBACK_LOG_DIR" "$DEBUG_LOG_DIR"

# Error types
ERROR_TYPE_SCRIPT=1
ERROR_TYPE_COMMAND=2
ERROR_TYPE_NETWORK=3
ERROR_TYPE_FILE=4
ERROR_TYPE_PERMISSION=5
ERROR_TYPE_DEPENDENCY=6
ERROR_TYPE_TIMEOUT=7
ERROR_TYPE_MEMORY=8
ERROR_TYPE_UNKNOWN=9

# Get error type from exit code
get_error_type() {
    local exit_code=$1
    case $exit_code in
        1) echo $ERROR_TYPE_SCRIPT ;;
        2) echo $ERROR_TYPE_COMMAND ;;
        3) echo $ERROR_TYPE_NETWORK ;;
        4) echo $ERROR_TYPE_FILE ;;
        5) echo $ERROR_TYPE_PERMISSION ;;
        6) echo $ERROR_TYPE_DEPENDENCY ;;
        7) echo $ERROR_TYPE_TIMEOUT ;;
        8) echo $ERROR_TYPE_MEMORY ;;
        *) echo $ERROR_TYPE_UNKNOWN ;;
    esac
}

# Get error type name
get_error_type_name() {
    local error_type=$1
    case $error_type in
        $ERROR_TYPE_SCRIPT) echo "Script Error" ;;
        $ERROR_TYPE_COMMAND) echo "Command Error" ;;
        $ERROR_TYPE_NETWORK) echo "Network Error" ;;
        $ERROR_TYPE_FILE) echo "File Error" ;;
        $ERROR_TYPE_PERMISSION) echo "Permission Error" ;;
        $ERROR_TYPE_DEPENDENCY) echo "Dependency Error" ;;
        $ERROR_TYPE_TIMEOUT) echo "Timeout Error" ;;
        $ERROR_TYPE_MEMORY) echo "Memory Error" ;;
        *) echo "Unknown Error" ;;
    esac
}

# Generate comprehensive traceback
generate_traceback() {
    local exit_code=$1
    local line_number=$2
    local command=$3
    local function_name=$4
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local traceback_file="$TRACEBACK_LOG_DIR/traceback-$(date +%Y%m%d-%H%M%S).log"
    
    # Get error type
    local error_type=$(get_error_type $exit_code)
    local error_type_name=$(get_error_type_name $error_type)
    
    # Generate traceback content
    cat > "$traceback_file" << EOF
# 🚨 ERROR TRACEBACK REPORT

**Timestamp:** $timestamp  
**Error Type:** $error_type_name  
**Exit Code:** $exit_code  
**Line Number:** $line_number  
**Command:** $command  
**Function:** $function_name  

## 📋 Error Details

### Basic Information
- **Workflow:** $GITHUB_WORKFLOW
- **Run ID:** $GITHUB_RUN_ID
- **Commit:** $GITHUB_SHA
- **Branch:** $GITHUB_REF_NAME
- **Actor:** $GITHUB_ACTOR
- **Repository:** $GITHUB_REPOSITORY

### System Information
- **OS:** $(uname -a)
- **Node Version:** $(node --version 2>/dev/null || echo 'Not installed')
- **Python Version:** $(python3 --version 2>/dev/null || echo 'Not installed')
- **Git Version:** $(git --version 2>/dev/null || echo 'Not installed')
- **Available Memory:** $(free -h 2>/dev/null | grep 'Mem:' | awk '{print $2}' || echo 'Unknown')
- **Disk Usage:** $(df -h . 2>/dev/null | tail -1 | awk '{print $5}' || echo 'Unknown')

### Environment Variables
EOF

    # Add environment variables
    env | sort >> "$traceback_file"
    
    # Add process information
    cat >> "$traceback_file" << EOF

### Process Information
- **PID:** $$
- **PPID:** $PPID
- **User:** $(whoami)
- **Working Directory:** $(pwd)
- **Shell:** $SHELL

### Command History
EOF

    # Add command history if available
    if [ -f ~/.bash_history ]; then
        tail -20 ~/.bash_history >> "$traceback_file"
    else
        echo "Command history not available" >> "$traceback_file"
    fi
    
    # Add recent log entries
    cat >> "$traceback_file" << EOF

### Recent Log Entries
EOF

    if [ -f "./logs/workflow.log" ]; then
        tail -50 "./logs/workflow.log" >> "$traceback_file"
    else
        echo "No workflow log available" >> "$traceback_file"
    fi
    
    # Add stack trace if available
    cat >> "$traceback_file" << EOF

### Stack Trace
EOF

    # Generate stack trace
    local i=0
    while caller $i; do
        echo "  Level $i: $(caller $i)" >> "$traceback_file"
        ((i++))
    done
    
    # Add file system information
    cat >> "$traceback_file" << EOF

### File System Information
- **Current Directory Contents:**
EOF

    ls -la >> "$traceback_file"
    
    cat >> "$traceback_file" << EOF

- **Disk Usage by Directory:**
EOF

    du -sh * 2>/dev/null | sort -hr >> "$traceback_file" || echo "Disk usage not available" >> "$traceback_file"
    
    # Add network information
    cat >> "$traceback_file" << EOF

### Network Information
EOF

    if command -v netstat >/dev/null 2>&1; then
        netstat -tuln >> "$traceback_file"
    else
        echo "Network information not available" >> "$traceback_file"
    fi
    
    # Add error analysis
    cat >> "$traceback_file" << EOF

### Error Analysis

**Error Type:** $error_type_name  
**Likely Cause:** $(analyze_error_cause $exit_code $command)  
**Recommended Action:** $(get_recommended_action $error_type)  

### Debugging Steps

1. Check the command that failed: \`$command\`
2. Verify all dependencies are installed
3. Check file permissions and paths
4. Review environment variables
5. Check system resources (memory, disk space)
6. Review recent changes in the repository

### Next Steps

1. Review this traceback report
2. Check the GitHub Actions logs
3. Verify the failing command manually
4. Check for recent changes that might have caused the issue
5. Consider rolling back to a previous working commit

---

*Generated by GitHub Actions Error Handler*
EOF

    echo "$traceback_file"
}

# Analyze error cause
analyze_error_cause() {
    local exit_code=$1
    local command=$2
    
    case $exit_code in
        1)
            if [[ "$command" == *"python"* ]]; then
                echo "Python script execution failed - check syntax, imports, or logic errors"
            elif [[ "$command" == *"node"* ]]; then
                echo "Node.js execution failed - check JavaScript syntax or runtime errors"
            elif [[ "$command" == *"npm"* ]]; then
                echo "NPM command failed - check package.json or dependencies"
            else
                echo "Script execution failed - check command syntax and logic"
            fi
            ;;
        2)
            echo "Command not found or invalid - check if the command exists and is in PATH"
            ;;
        3)
            echo "Network operation failed - check internet connection and URLs"
            ;;
        4)
            echo "File operation failed - check file paths, permissions, and existence"
            ;;
        5)
            echo "Permission denied - check file/directory permissions and user rights"
            ;;
        6)
            echo "Dependency missing - check if required packages/tools are installed"
            ;;
        7)
            echo "Operation timed out - check network connectivity and resource availability"
            ;;
        8)
            echo "Out of memory - check system memory usage and optimize resource consumption"
            ;;
        *)
            echo "Unknown error - check logs and system status"
            ;;
    esac
}

# Get recommended action
get_recommended_action() {
    local error_type=$1
    
    case $error_type in
        $ERROR_TYPE_SCRIPT)
            echo "Review script syntax, check for typos, verify logic flow"
            ;;
        $ERROR_TYPE_COMMAND)
            echo "Install missing commands, check PATH, verify command syntax"
            ;;
        $ERROR_TYPE_NETWORK)
            echo "Check internet connection, verify URLs, retry the operation"
            ;;
        $ERROR_TYPE_FILE)
            echo "Check file paths, create missing directories, verify file permissions"
            ;;
        $ERROR_TYPE_PERMISSION)
            echo "Change file permissions, run with appropriate user privileges"
            ;;
        $ERROR_TYPE_DEPENDENCY)
            echo "Install missing dependencies, update package managers"
            ;;
        $ERROR_TYPE_TIMEOUT)
            echo "Increase timeout values, check system performance, retry operation"
            ;;
        $ERROR_TYPE_MEMORY)
            echo "Free up memory, optimize resource usage, increase system memory"
            ;;
        *)
            echo "Review error logs, check system status, contact support if needed"
            ;;
    esac
}

# Handle error with comprehensive logging
handle_error() {
    local exit_code=$?
    local line_number=$1
    local command=$2
    local function_name=${3:-"main"}
    
    if [ $exit_code -ne 0 ]; then
        echo "🚨 ERROR DETECTED" >&2
        echo "Exit Code: $exit_code" >&2
        echo "Line: $line_number" >&2
        echo "Command: $command" >&2
        echo "Function: $function_name" >&2
        
        # Generate traceback
        local traceback_file=$(generate_traceback $exit_code $line_number "$command" $function_name)
        echo "Traceback saved to: $traceback_file" >&2
        
        # Log to error log
        local error_log="$ERROR_LOG_DIR/error-$(date +%Y%m%d-%H%M%S).log"
        cat > "$error_log" << EOF
ERROR: $exit_code
Line: $line_number
Command: $command
Function: $function_name
Timestamp: $(date)
Traceback: $traceback_file
EOF
        
        # Add to GitHub step summary
        echo "❌ **Error Detected**" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Exit Code:** $exit_code" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Line:** $line_number" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Command:** $command" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Function:** $function_name" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Traceback:** $traceback_file" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Error Log:** $error_log" >> "$GITHUB_STEP_SUMMARY"
        echo "" >> "$GITHUB_STEP_SUMMARY"
        
        # Upload artifacts
        if command -v gh >/dev/null 2>&1; then
            echo "📤 Uploading error artifacts..."
            gh api repos/$GITHUB_REPOSITORY/actions/artifacts --method POST \
                --field name="error-traceback-$(date +%Y%m%d-%H%M%S)" \
                --field path="$traceback_file,$error_log" \
                --field retention_days=30 || true
        fi
    fi
    
    return $exit_code
}

# Set up error handling
trap 'handle_error $LINENO "$BASH_COMMAND" "${FUNCNAME[0]}"' ERR

# Export functions
export -f generate_traceback analyze_error_cause get_recommended_action handle_error

echo "🔧 Error handler initialized"
echo "Error logs: $ERROR_LOG_DIR"
echo "Traceback logs: $TRACEBACK_LOG_DIR"
echo "Debug logs: $DEBUG_LOG_DIR"
