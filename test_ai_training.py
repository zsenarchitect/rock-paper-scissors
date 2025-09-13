#!/usr/bin/env python3
"""
AI Training test script for Rock Paper Scissors Battle Royale
"""

import os
import sys
import json
from pathlib import Path

def test_genetic_algorithm():
    """Test genetic algorithm module"""
    print("🧬 Testing Genetic Algorithm...")
    
    try:
        # Add project root to path
        sys.path.insert(0, str(Path.cwd()))
        
        from ai_training.models.genetic_algorithm import GeneticAlgorithm
        print("  ✅ GeneticAlgorithm class imported successfully")
        
        # Test basic functionality
        ga = GeneticAlgorithm()
        print("  ✅ GeneticAlgorithm instance created")
        
        return True
    except Exception as e:
        print(f"  ❌ Genetic Algorithm test failed: {e}")
        return False

def test_neural_network():
    """Test neural network module"""
    print("🧠 Testing Neural Network...")
    
    try:
        # Add project root to path
        sys.path.insert(0, str(Path.cwd()))
        
        from ai_training.models.neural_network import NeuralNetwork
        print("  ✅ NeuralNetwork class imported successfully")
        
        # Test basic functionality
        nn = NeuralNetwork()
        print("  ✅ NeuralNetwork instance created")
        
        return True
    except Exception as e:
        print(f"  ❌ Neural Network test failed: {e}")
        return False

def test_reinforcement_learning():
    """Test reinforcement learning module"""
    print("🎯 Testing Reinforcement Learning...")
    
    try:
        # Add project root to path
        sys.path.insert(0, str(Path.cwd()))
        
        from ai_training.models.reinforcement_learning import ReinforcementLearning
        print("  ✅ ReinforcementLearning class imported successfully")
        
        # Test basic functionality
        rl = ReinforcementLearning()
        print("  ✅ ReinforcementLearning instance created")
        
        return True
    except Exception as e:
        print(f"  ❌ Reinforcement Learning test failed: {e}")
        return False

def test_training_script():
    """Test training script"""
    print("📚 Testing Training Script...")
    
    try:
        script_path = Path("ai_training/scripts/train_model.py")
        if script_path.exists():
            print("  ✅ Training script exists")
            
            # Test if script can be imported
            import importlib.util
            spec = importlib.util.spec_from_file_location("train_model", script_path)
            train_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(train_module)
            print("  ✅ Training script imported successfully")
            
            return True
        else:
            print("  ❌ Training script not found")
            return False
    except Exception as e:
        print(f"  ❌ Training script test failed: {e}")
        return False

def main():
    """Run all AI training tests"""
    print("🧪 Running AI Training Tests")
    print("=" * 40)
    
    tests = [
        test_genetic_algorithm,
        test_neural_network,
        test_reinforcement_learning,
        test_training_script,
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
    
    with open("ai-training-test-results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    
    print(f"📄 Results saved to ai-training-test-results.json")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
