#!/usr/bin/env python3
"""
Test script to verify virtual environment setup
"""

import sys
import os

def test_imports():
    """Test that required packages can be imported"""
    print("🧪 Testing virtual environment setup...")
    
    try:
        import numpy as np
        print(f"✅ NumPy {np.__version__}")
    except ImportError as e:
        print(f"❌ NumPy import failed: {e}")
        return False
    
    try:
        import pandas as pd
        print(f"✅ Pandas {pd.__version__}")
    except ImportError as e:
        print(f"❌ Pandas import failed: {e}")
        return False
    
    try:
        import matplotlib
        print(f"✅ Matplotlib {matplotlib.__version__}")
    except ImportError as e:
        print(f"❌ Matplotlib import failed: {e}")
        return False
    
    try:
        import sklearn
        print(f"✅ Scikit-learn {sklearn.__version__}")
    except ImportError as e:
        print(f"❌ Scikit-learn import failed: {e}")
        return False
    
    return True

def test_ai_training():
    """Test AI training module"""
    print("\n🤖 Testing AI training module...")
    
    try:
        from ai_training.models.genetic_algorithm import GeneticAlgorithm, Strategy
        print("✅ Genetic Algorithm module imported successfully")
        
        # Test creating a strategy
        strategy = Strategy(
            aggression=0.8,
            patience=0.6,
            grouping=0.7,
            speed=1.2,
            vision=100.0,
            avoidance=0.5
        )
        print(f"✅ Strategy created: {strategy}")
        
        # Test genetic algorithm
        ga = GeneticAlgorithm(population_size=10, max_generations=5)
        print("✅ Genetic Algorithm initialized")
        
        return True
    except ImportError as e:
        print(f"❌ AI training module import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ AI training module test failed: {e}")
        return False

def test_environment():
    """Test environment variables and paths"""
    print("\n🌍 Testing environment...")
    
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Virtual environment: {'.venv' in sys.executable or 'venv' in sys.executable}")
    
    return True

def main():
    """Run all tests"""
    print("🎮 Rock Paper Scissors Battle Royale - Environment Test")
    print("=" * 60)
    
    success = True
    
    # Test environment
    success &= test_environment()
    
    # Test imports
    success &= test_imports()
    
    # Test AI training
    success &= test_ai_training()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 All tests passed! Virtual environment is ready.")
        print("\n📋 Next steps:")
        print("1. Run the game: cd docs && python -m http.server 8000")
        print("2. Open http://localhost:8000 in your browser")
        print("3. Start AI training: python -m ai_training.scripts.train_model")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
