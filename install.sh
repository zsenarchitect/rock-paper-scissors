#!/bin/bash

# Rock Paper Scissors Battle Royale - Installation Script
echo "🎮 Setting up Rock Paper Scissors Battle Royale AI Training Platform..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Python version
python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.8+ is required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Install the package in development mode
echo "🔨 Installing package in development mode..."
pip install -e .

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p ai_training/data/training-data
mkdir -p ai_training/data/simulation-results
mkdir -p ai_training/data/strategy-evaluations
mkdir -p logs
mkdir -p data/exports

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << EOF
# Rock Paper Scissors Battle Royale Configuration

# API Keys
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_TOKEN=your_github_token_here

# Database
DATABASE_URL=sqlite:///data/battles.db
REDIS_URL=redis://localhost:6379

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# AI Training
BATCH_SIZE=32
LEARNING_RATE=0.001
EPOCHS=100
POPULATION_SIZE=50

# Game Configuration
MAX_ENTITIES=200
BATTLE_DURATION=300
SIMULATION_SPEED=1.0

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/battle_royale.log

# Audio
AUDIO_ENABLED=True
AUDIO_VOLUME=0.7

# Debug
DEBUG_MODE=False
PERFORMANCE_MONITORING=True
EOF
    echo "✅ Created .env file - please update with your API keys"
fi

# Create gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
.venv/
venv/
env/
ENV/

# Environment Variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Data
data/exports/
ai_training/data/training-data/
ai_training/data/simulation-results/
ai_training/data/strategy-evaluations/

# API Keys
api_key.json
secrets.json

# Temporary files
tmp/
temp/
*.tmp
EOF
    echo "✅ Created .gitignore"
fi

# Test installation
echo "🧪 Testing installation..."
python -c "import numpy, pandas, torch; print('✅ Core dependencies working')" 2>/dev/null || echo "⚠️ Some dependencies may not be fully installed"

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Activate the virtual environment: source .venv/bin/activate"
echo "2. Update .env file with your API keys"
echo "3. Run the game: python -m http.server 8000 (in docs/ folder)"
echo "4. Open http://localhost:8000 in your browser"
echo ""
echo "🔧 Development commands:"
echo "- Train AI model: python -m ai_training.scripts.train_model"
echo "- Run simulation: python -m ai_training.scripts.evaluate_strategy"
echo "- Start API server: python -m src.api.server"
echo ""
echo "📚 Documentation: README.md"
echo "🐛 Issues: https://github.com/yourusername/rock-paper-scissors/issues"
echo ""
echo "Happy coding! 🚀"
