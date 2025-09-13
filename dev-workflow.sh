#!/bin/bash

# Rock Paper Scissors Battle Royale - Development Workflow Script
# Combines cleanup, validation, and testing for clean development

echo "🎮 Rock Paper Scissors Battle Royale - Development Workflow"
echo "=========================================================="

# Step 1: Cleanup
echo "🧹 Step 1: Running cleanup..."
./cleanup.sh

if [ $? -ne 0 ]; then
    echo "❌ Cleanup failed. Stopping workflow."
    exit 1
fi

# Step 2: Validate structure
echo ""
echo "🔍 Step 2: Validating project structure..."
python validate-structure.py

if [ $? -ne 0 ]; then
    echo "❌ Structure validation failed. Please fix issues before continuing."
    exit 1
fi

# Step 3: Run tests
echo ""
echo "🧪 Step 3: Running tests..."

# Test virtual environment
echo "  - Testing virtual environment..."
source .venv/bin/activate && python temp/tests/test_venv.py > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "    ✅ Virtual environment test passed"
else
    echo "    ❌ Virtual environment test failed"
    exit 1
fi

# Test AI training
echo "  - Testing AI training..."
python ai_training/scripts/train_model.py --model genetic --generations 1 --population-size 2 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "    ✅ AI training test passed"
else
    echo "    ❌ AI training test failed"
    exit 1
fi

# Step 4: Check for uncommitted changes
echo ""
echo "📝 Step 4: Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes detected:"
    git status --short
    echo ""
    echo "💡 Consider committing changes before continuing:"
    echo "   git add ."
    echo "   git commit -m 'Your commit message'"
else
    echo "✅ No uncommitted changes"
fi

# Step 5: Summary
echo ""
echo "🎉 Development Workflow Complete!"
echo "================================="
echo "✅ Cleanup completed"
echo "✅ Structure validated"
echo "✅ Tests passed"
echo "✅ Ready for development"

echo ""
echo "📋 Available commands:"
echo "  - Cleanup: ./cleanup.sh"
echo "  - Validate: python validate-structure.py"
echo "  - Test: python test_venv.py"
echo "  - Train AI: python ai_training/scripts/train_model.py"
echo "  - Run game: cd docs && python -m http.server 8000"

echo ""
echo "🚀 Happy coding!"
