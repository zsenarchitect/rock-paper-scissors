#!/bin/bash

# Simple cleanup script for GitHub Actions
# This script doesn't move itself to avoid issues

echo "🧹 Running simple cleanup..."

# Create DEBUG directory if it doesn't exist
mkdir -p DEBUG/logs DEBUG/dumps DEBUG/traces DEBUG/reports DEBUG/screenshots DEBUG/recordings DEBUG/analysis

# Clean up any temporary files
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name "*.log" -not -path "./DEBUG/*" -delete 2>/dev/null || true

# Clean up Python cache
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

echo "✅ Simple cleanup completed"
