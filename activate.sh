#!/bin/bash

# Rock Paper Scissors Battle Royale - Virtual Environment Activation Script

echo "🎮 Activating Rock Paper Scissors Battle Royale Environment..."

# Check if .venv exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run ./install.sh first."
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Check if activation was successful
if [ "$VIRTUAL_ENV" != "" ]; then
    echo "✅ Virtual environment activated successfully!"
    echo "📍 Virtual environment: $VIRTUAL_ENV"
    echo "🐍 Python: $(which python)"
    echo "📦 Pip: $(which pip)"
    echo ""
    echo "📋 Available commands:"
    echo "  - Test environment: python test_venv.py"
    echo "  - Train AI models: python ai_training/scripts/train_model.py"
    echo "  - Run game: cd docs && python -m http.server 8000"
    echo "  - Deactivate: deactivate"
    echo ""
    echo "🚀 Ready to go! Happy coding!"
else
    echo "❌ Failed to activate virtual environment"
    exit 1
fi
