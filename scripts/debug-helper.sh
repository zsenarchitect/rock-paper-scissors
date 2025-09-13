#!/bin/bash

# Rock Paper Scissors Battle Royale - Debug Helper Script
# Provides utilities for debugging and development

echo "🐛 Rock Paper Scissors Battle Royale - Debug Helper"
echo "=================================================="

# Function to create debug log
create_debug_log() {
    local log_name="$1"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local log_file="DEBUG/logs/${log_name}_${timestamp}.log"
    
    echo "📝 Creating debug log: $log_file"
    touch "$log_file"
    echo "Debug log created at: $(date)" > "$log_file"
    echo "Log file: $log_file"
}

# Function to take debug screenshot
take_debug_screenshot() {
    local screenshot_name="$1"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local screenshot_file="DEBUG/screenshots/${screenshot_name}_${timestamp}.png"
    
    echo "📸 Taking debug screenshot: $screenshot_file"
    # This would need to be implemented based on your system
    # For now, just create a placeholder
    touch "$screenshot_file"
    echo "Screenshot placeholder created: $screenshot_file"
}

# Function to create debug report
create_debug_report() {
    local report_name="$1"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local report_file="DEBUG/reports/${report_name}_${timestamp}.md"
    
    echo "📊 Creating debug report: $report_file"
    cat > "$report_file" << EOF
# Debug Report: $report_name

**Date:** $(date)
**System:** $(uname -a)
**Python Version:** $(python --version 2>/dev/null || echo "Not available")
**Node Version:** $(node --version 2>/dev/null || echo "Not available")

## Issue Description
[Describe the issue being debugged]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Debug Information
- Log files: DEBUG/logs/
- Screenshots: DEBUG/screenshots/
- Memory dumps: DEBUG/dumps/
- Execution traces: DEBUG/traces/

## Notes
[Additional notes]
EOF
    echo "Debug report created: $report_file"
}

# Function to clean debug files
clean_debug_files() {
    echo "🧹 Cleaning debug files..."
    
    # Remove files older than 7 days
    find DEBUG/ -type f -mtime +7 -delete 2>/dev/null || true
    
    # Compress old log files
    find DEBUG/logs/ -name "*.log" -mtime +1 -exec gzip {} \; 2>/dev/null || true
    
    echo "✅ Debug files cleaned up"
}

# Function to show debug status
show_debug_status() {
    echo "📊 Debug Status:"
    echo "==============="
    
    if [ -d "DEBUG" ]; then
        echo "✅ DEBUG directory exists"
        
        # Count files in each subdirectory
        for subdir in logs dumps traces reports screenshots recordings analysis; do
            if [ -d "DEBUG/$subdir" ]; then
                count=$(find "DEBUG/$subdir" -type f | wc -l)
                echo "  📁 DEBUG/$subdir: $count files"
            else
                echo "  ❌ DEBUG/$subdir: Missing"
            fi
        done
        
        # Show total size
        total_size=$(du -sh DEBUG 2>/dev/null | cut -f1)
        echo "  💾 Total size: $total_size"
    else
        echo "❌ DEBUG directory not found"
    fi
}

# Function to open debug folder
open_debug_folder() {
    echo "📂 Opening DEBUG folder..."
    if command -v open >/dev/null 2>&1; then
        open DEBUG
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open DEBUG
    else
        echo "Please open DEBUG folder manually"
    fi
}

# Main menu
case "$1" in
    "log")
        create_debug_log "$2"
        ;;
    "screenshot")
        take_debug_screenshot "$2"
        ;;
    "report")
        create_debug_report "$2"
        ;;
    "clean")
        clean_debug_files
        ;;
    "status")
        show_debug_status
        ;;
    "open")
        open_debug_folder
        ;;
    *)
        echo "Usage: $0 {log|screenshot|report|clean|status|open} [name]"
        echo ""
        echo "Commands:"
        echo "  log [name]        Create a debug log file"
        echo "  screenshot [name] Take a debug screenshot"
        echo "  report [name]     Create a debug report"
        echo "  clean             Clean old debug files"
        echo "  status            Show debug status"
        echo "  open              Open DEBUG folder"
        echo ""
        echo "Examples:"
        echo "  $0 log audio-issue"
        echo "  $0 screenshot game-bug"
        echo "  $0 report performance-problem"
        echo "  $0 clean"
        echo "  $0 status"
        echo "  $0 open"
        ;;
esac
