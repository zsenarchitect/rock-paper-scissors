#!/bin/bash

# GitHub Actions Comprehensive Logging Configuration
# This script provides standardized logging functions for all workflows

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Log levels
LOG_LEVEL_DEBUG=0
LOG_LEVEL_INFO=1
LOG_LEVEL_WARN=2
LOG_LEVEL_ERROR=3
LOG_LEVEL_FATAL=4

# Default log level (can be overridden)
LOG_LEVEL=${LOG_LEVEL:-$LOG_LEVEL_INFO}

# Log file paths
LOG_DIR="./logs"
ERROR_LOG="$LOG_DIR/error.log"
DEBUG_LOG="$LOG_DIR/debug.log"
TRACE_LOG="$LOG_DIR/trace.log"
PERFORMANCE_LOG="$LOG_DIR/performance.log"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging functions
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local level_name=""
    local color=""
    
    case $level in
        $LOG_LEVEL_DEBUG)
            level_name="DEBUG"
            color=$CYAN
            ;;
        $LOG_LEVEL_INFO)
            level_name="INFO"
            color=$GREEN
            ;;
        $LOG_LEVEL_WARN)
            level_name="WARN"
            color=$YELLOW
            ;;
        $LOG_LEVEL_ERROR)
            level_name="ERROR"
            color=$RED
            ;;
        $LOG_LEVEL_FATAL)
            level_name="FATAL"
            color=$RED
            ;;
        *)
            level_name="UNKNOWN"
            color=$WHITE
            ;;
    esac
    
    # Only log if level is >= current log level
    if [ $level -ge $LOG_LEVEL ]; then
        # Console output with colors
        echo -e "${color}[$timestamp] [$level_name] $message${NC}"
        
        # File output without colors
        echo "[$timestamp] [$level_name] $message" >> "$LOG_DIR/workflow.log"
        
        # Level-specific log files
        case $level in
            $LOG_LEVEL_DEBUG)
                echo "[$timestamp] [$level_name] $message" >> "$DEBUG_LOG"
                ;;
            $LOG_LEVEL_ERROR|$LOG_LEVEL_FATAL)
                echo "[$timestamp] [$level_name] $message" >> "$ERROR_LOG"
                ;;
        esac
    fi
}

# Convenience functions
log_debug() { log $LOG_LEVEL_DEBUG "$1"; }
log_info() { log $LOG_LEVEL_INFO "$1"; }
log_warn() { log $LOG_LEVEL_WARN "$1"; }
log_error() { log $LOG_LEVEL_ERROR "$1"; }
log_fatal() { log $LOG_LEVEL_FATAL "$1"; }

# Trace function for detailed debugging
trace() {
    local function_name=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S.%3N')
    echo "[$timestamp] [TRACE] [$function_name] $message" >> "$TRACE_LOG"
}

# Performance logging
log_performance() {
    local metric=$1
    local value=$2
    local unit=${3:-""}
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [PERF] $metric: $value $unit" >> "$PERFORMANCE_LOG"
}

# Error handling with traceback
handle_error() {
    local exit_code=$?
    local line_number=$1
    local command=$2
    
    if [ $exit_code -ne 0 ]; then
        log_error "Command failed with exit code $exit_code"
        log_error "Line: $line_number"
        log_error "Command: $command"
        
        # Generate traceback
        echo "=== TRACEBACK ===" >> "$ERROR_LOG"
        echo "Exit Code: $exit_code" >> "$ERROR_LOG"
        echo "Line: $line_number" >> "$ERROR_LOG"
        echo "Command: $command" >> "$ERROR_LOG"
        echo "Timestamp: $(date)" >> "$ERROR_LOG"
        echo "Environment:" >> "$ERROR_LOG"
        env | sort >> "$ERROR_LOG"
        echo "=================" >> "$ERROR_LOG"
        
        # Also add to GitHub step summary
        echo "❌ **Error Details**" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Exit Code:** $exit_code" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Line:** $line_number" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Command:** $command" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Timestamp:** $(date)" >> "$GITHUB_STEP_SUMMARY"
    fi
    
    return $exit_code
}

# Set up error handling
set -e
trap 'handle_error $LINENO "$BASH_COMMAND"' ERR

# System information logging
log_system_info() {
    log_info "=== System Information ==="
    log_info "OS: $(uname -a)"
    log_info "Node Version: $(node --version 2>/dev/null || echo 'Not installed')"
    log_info "Python Version: $(python3 --version 2>/dev/null || echo 'Not installed')"
    log_info "Git Version: $(git --version 2>/dev/null || echo 'Not installed')"
    log_info "Available Memory: $(free -h 2>/dev/null | grep 'Mem:' | awk '{print $2}' || echo 'Unknown')"
    log_info "Disk Usage: $(df -h . 2>/dev/null | tail -1 | awk '{print $5}' || echo 'Unknown')"
    log_info "========================="
}

# Workflow step logging
log_step_start() {
    local step_name=$1
    log_info "🚀 Starting step: $step_name"
    echo "🚀 **$step_name**" >> "$GITHUB_STEP_SUMMARY"
    echo "**Started:** $(date)" >> "$GITHUB_STEP_SUMMARY"
    echo "" >> "$GITHUB_STEP_SUMMARY"
}

log_step_end() {
    local step_name=$1
    local status=$2
    log_info "✅ Completed step: $step_name (Status: $status)"
    echo "✅ **$step_name** - $status" >> "$GITHUB_STEP_SUMMARY"
    echo "**Completed:** $(date)" >> "$GITHUB_STEP_SUMMARY"
    echo "" >> "$GITHUB_STEP_SUMMARY"
}

# Artifact logging
log_artifact() {
    local artifact_name=$1
    local artifact_path=$2
    local size=$(du -sh "$artifact_path" 2>/dev/null | cut -f1 || echo "Unknown")
    log_info "📦 Artifact created: $artifact_name ($size)"
    echo "📦 **$artifact_name** - $size" >> "$GITHUB_STEP_SUMMARY"
}

# Test result logging
log_test_result() {
    local test_name=$1
    local result=$2
    local details=$3
    
    if [ "$result" = "PASS" ]; then
        log_info "✅ Test passed: $test_name"
        echo "✅ **$test_name** - PASS" >> "$GITHUB_STEP_SUMMARY"
    else
        log_error "❌ Test failed: $test_name"
        echo "❌ **$test_name** - FAIL" >> "$GITHUB_STEP_SUMMARY"
        if [ -n "$details" ]; then
            echo "**Details:** $details" >> "$GITHUB_STEP_SUMMARY"
        fi
    fi
}

# Performance metrics logging
log_performance_metrics() {
    local metrics_file=$1
    if [ -f "$metrics_file" ]; then
        log_info "📊 Performance metrics available: $metrics_file"
        echo "📊 **Performance Metrics**" >> "$GITHUB_STEP_SUMMARY"
        echo "**File:** $metrics_file" >> "$GITHUB_STEP_SUMMARY"
        echo "**Size:** $(du -sh "$metrics_file" | cut -f1)" >> "$GITHUB_STEP_SUMMARY"
        echo "" >> "$GITHUB_STEP_SUMMARY"
    fi
}

# Generate summary report
generate_summary_report() {
    local report_file="./reports/workflow-summary-$(date +%Y%m%d-%H%M%S).md"
    mkdir -p "./reports"
    
    log_info "📊 Generating summary report: $report_file"
    
    cat > "$report_file" << EOF
# 🎯 Workflow Summary Report

**Generated:** $(date)  
**Workflow:** $GITHUB_WORKFLOW  
**Run ID:** $GITHUB_RUN_ID  
**Commit:** $GITHUB_SHA  
**Actor:** $GITHUB_ACTOR  

## 📋 System Information

- **OS:** $(uname -a)
- **Node Version:** $(node --version 2>/dev/null || echo 'Not installed')
- **Python Version:** $(python3 --version 2>/dev/null || echo 'Not installed')
- **Git Version:** $(git --version 2>/dev/null || echo 'Not installed')

## 📁 Generated Artifacts

EOF

    # List all log files
    if [ -d "$LOG_DIR" ]; then
        echo "### Log Files" >> "$report_file"
        echo "" >> "$report_file"
        find "$LOG_DIR" -type f -name "*.log" | while read file; do
            size=$(stat -c%s "$file" 2>/dev/null || echo "0")
            echo "- \`$(basename "$file")\` - $size bytes" >> "$report_file"
        done
        echo "" >> "$report_file"
    fi
    
    # List all artifacts
    if [ -d "./artifacts" ]; then
        echo "### Artifact Files" >> "$report_file"
        echo "" >> "$report_file"
        find "./artifacts" -type f | while read file; do
            size=$(stat -c%s "$file" 2>/dev/null || echo "0")
            echo "- \`$(basename "$file")\` - $size bytes" >> "$report_file"
        done
        echo "" >> "$report_file"
    fi
    
    log_info "✅ Summary report generated: $report_file"
    echo "$report_file"
}

# Export functions for use in other scripts
export -f log log_debug log_info log_warn log_error log_fatal trace log_performance
export -f log_system_info log_step_start log_step_end log_artifact log_test_result
export -f log_performance_metrics generate_summary_report

# Initialize logging
log_info "🔧 Logging system initialized"
log_info "Log level: $LOG_LEVEL"
log_info "Log directory: $LOG_DIR"
