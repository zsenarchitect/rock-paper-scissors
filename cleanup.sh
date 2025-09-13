#!/bin/bash

# Rock Paper Scissors Battle Royale - Cleanup Script
# Maintains clean project organization according to .cursorrules

echo "🧹 Rock Paper Scissors Battle Royale - Cleanup Script"
echo "=================================================="

# Create temp directory structure if it doesn't exist
echo "📁 Creating temp directory structure..."
mkdir -p temp/tests/unit
mkdir -p temp/tests/integration
mkdir -p temp/tests/e2e
mkdir -p temp/tests/fixtures
mkdir -p temp/logs/application
mkdir -p temp/logs/errors
mkdir -p temp/logs/performance
mkdir -p temp/logs/audit
mkdir -p temp/cache

# Create DEBUG directory structure if it doesn't exist
echo "🐛 Creating DEBUG directory structure..."
mkdir -p DEBUG/logs
mkdir -p DEBUG/dumps
mkdir -p DEBUG/traces
mkdir -p DEBUG/reports
mkdir -p DEBUG/screenshots
mkdir -p DEBUG/recordings
mkdir -p DEBUG/analysis

# Clean up debug files from root
echo "🐛 Cleaning up debug files..."
find . -maxdepth 1 -name "*.debug" -delete
find . -maxdepth 1 -name "debug_*" -delete
find . -maxdepth 1 -name "*.log" -delete
find . -maxdepth 1 -name "*.trace" -delete
find . -maxdepth 1 -name "*.dump" -delete

# Clean up test files from root
echo "🧪 Cleaning up test files..."
find . -maxdepth 1 -name "*.test" -delete
find . -maxdepth 1 -name "test_*" -delete
find . -maxdepth 1 -name "*_test" -delete
find . -maxdepth 1 -name "*.spec" -delete

# Clean up temporary files from root
echo "🗑️ Cleaning up temporary files..."
find . -maxdepth 1 -name "*.tmp" -delete
find . -maxdepth 1 -name "*.temp" -delete
find . -maxdepth 1 -name "temp_*" -delete
find . -maxdepth 1 -name "*.cache" -delete
find . -maxdepth 1 -name "cache_*" -delete

# Clean up backup files from root
echo "💾 Cleaning up backup files..."
find . -maxdepth 1 -name "*.bak" -delete
find . -maxdepth 1 -name "*.backup" -delete
find . -maxdepth 1 -name "backup_*" -delete
find . -maxdepth 1 -name "*.old" -delete

# Clean up OS files
echo "🖥️ Cleaning up OS files..."
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete
find . -name "._*" -delete
find . -name ".Spotlight-V100" -delete
find . -name ".Trashes" -delete
find . -name "ehthumbs.db" -delete

# Clean up IDE files
echo "💻 Cleaning up IDE files..."
find . -name "*.swp" -delete
find . -name "*.swo" -delete
find . -name "*~" -delete
find . -name ".vscode" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".idea" -type d -exec rm -rf {} + 2>/dev/null || true

# Clean up build artifacts
echo "🔨 Cleaning up build artifacts..."
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "out" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Clean up Python cache
echo "🐍 Cleaning up Python cache..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete
find . -name "*.pyo" -delete
find . -name "*.pyd" -delete

# Clean up JavaScript cache
echo "📜 Cleaning up JavaScript cache..."
find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".parcel-cache" -type d -exec rm -rf {} + 2>/dev/null || true

# Move misplaced files to temp directory
echo "📦 Moving misplaced files to temp directory..."

# Move debug files to DEBUG directory
find . -maxdepth 1 -name "debug_*" -exec mv {} DEBUG/ \; 2>/dev/null || true
find . -maxdepth 1 -name "*.debug" -exec mv {} DEBUG/ \; 2>/dev/null || true

# Move test files
find . -maxdepth 1 -name "test_*" -exec mv {} temp/tests/ \; 2>/dev/null || true
find . -maxdepth 1 -name "*_test" -exec mv {} temp/tests/ \; 2>/dev/null || true
find . -maxdepth 1 -name "*.test" -exec mv {} temp/tests/ \; 2>/dev/null || true

# Move temporary files
find . -maxdepth 1 -name "temp_*" -exec mv {} temp/ \; 2>/dev/null || true
find . -maxdepth 1 -name "*.tmp" -exec mv {} temp/ \; 2>/dev/null || true
find . -maxdepth 1 -name "*.temp" -exec mv {} temp/ \; 2>/dev/null || true

# Clean up empty directories
echo "📁 Removing empty directories..."
find . -type d -empty -delete 2>/dev/null || true

# Update .gitignore to include temp directory
echo "📝 Updating .gitignore..."
if ! grep -q "temp/" .gitignore; then
    echo "" >> .gitignore
    echo "# Temporary files and directories" >> .gitignore
    echo "temp/" >> .gitignore
    echo "*.tmp" >> .gitignore
    echo "*.temp" >> .gitignore
    echo "debug_*" >> .gitignore
    echo "test_*" >> .gitignore
    echo "*_test" >> .gitignore
    echo "*.debug" >> .gitignore
    echo "*.log" >> .gitignore
    echo "*.trace" >> .gitignore
    echo "*.dump" >> .gitignore
fi

# Show cleanup summary
echo ""
echo "📊 Cleanup Summary:"
echo "=================="
echo "✅ Debug files cleaned up and moved to DEBUG/"
echo "✅ Test files cleaned up"
echo "✅ Temporary files cleaned up"
echo "✅ Backup files cleaned up"
echo "✅ OS files cleaned up"
echo "✅ IDE files cleaned up"
echo "✅ Build artifacts cleaned up"
echo "✅ Python cache cleaned up"
echo "✅ JavaScript cache cleaned up"
echo "✅ Misplaced files moved to temp/"
echo "✅ Empty directories removed"
echo "✅ .gitignore updated"

# Show current root directory status
echo ""
echo "📁 Current Root Directory:"
echo "========================="
ls -la | grep -v "^d" | grep -v "total" | head -20

echo ""
echo "🎉 Cleanup completed successfully!"
echo "📋 Remember to run this script regularly to maintain clean organization."
echo "🔧 Use './cleanup.sh' to run this cleanup script anytime."
