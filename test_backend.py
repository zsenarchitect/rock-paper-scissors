#!/usr/bin/env python3
"""
Backend test script for Rock Paper Scissors Battle Royale
"""

import os
import sys
import json
from pathlib import Path

def test_python_imports():
    """Test Python imports work correctly"""
    print("🐍 Testing Python imports...")
    
    try:
        import numpy as np
        print("  ✅ numpy imported successfully")
    except ImportError as e:
        print(f"  ❌ numpy import failed: {e}")
        return False
    
    try:
        import pandas as pd
        print("  ✅ pandas imported successfully")
    except ImportError as e:
        print(f"  ❌ pandas import failed: {e}")
        return False
    
    try:
        import matplotlib
        print("  ✅ matplotlib imported successfully")
    except ImportError as e:
        print(f"  ❌ matplotlib import failed: {e}")
        return False
    
    return True

def test_ai_training_modules():
    """Test AI training modules"""
    print("🤖 Testing AI training modules...")
    
    ai_files = [
        "ai_training/__init__.py",
        "ai_training/models/__init__.py",
        "ai_training/models/genetic_algorithm.py",
        "ai_training/models/neural_network.py",
        "ai_training/models/reinforcement_learning.py",
        "ai_training/scripts/train_model.py",
    ]
    
    results = []
    for ai_file in ai_files:
        if Path(ai_file).exists():
            print(f"  ✅ {ai_file}")
            results.append(True)
        else:
            print(f"  ❌ {ai_file} not found")
            results.append(False)
    
    return all(results)

def test_config_files():
    """Test configuration files"""
    print("⚙️ Testing configuration files...")
    
    config_files = [
        "requirements.txt",
        "setup.py",
        "package.json",
    ]
    
    results = []
    for config_file in config_files:
        if Path(config_file).exists():
            print(f"  ✅ {config_file}")
            results.append(True)
        else:
            print(f"  ❌ {config_file} not found")
            results.append(False)
    
    return all(results)

def test_scripts():
    """Test executable scripts"""
    print("🔧 Testing executable scripts...")
    
    scripts = [
        "install.sh",
        "activate.sh",
        "cleanup.sh",
        "dev-workflow.sh",
    ]
    
    results = []
    for script in scripts:
        script_path = Path(script)
        if script_path.exists() and script_path.stat().st_mode & 0o111:
            print(f"  ✅ {script} (executable)")
            results.append(True)
        else:
            print(f"  ❌ {script} not found or not executable")
            results.append(False)
    
    return all(results)

def main():
    """Run all backend tests"""
    print("🧪 Running Backend Tests")
    print("=" * 40)
    
    tests = [
        test_python_imports,
        test_ai_training_modules,
        test_config_files,
        test_scripts,
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
            print()
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            results.append(False)
            print()
    
    # Generate test results
    passed = sum(results)
    total = len(results)
    
    print("📊 Test Summary")
    print("=" * 40)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    # Save results to file
    test_results = {
        "passed": passed,
        "total": total,
        "success_rate": passed / total if total > 0 else 0,
        "timestamp": str(Path.cwd())
    }
    
    with open("backend-test-results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    
    print(f"📄 Results saved to backend-test-results.json")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
