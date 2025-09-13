#!/usr/bin/env python3
"""
Performance test script for Rock Paper Scissors Battle Royale
"""

import os
import sys
import json
import time
import psutil
from pathlib import Path

def test_memory_usage():
    """Test memory usage"""
    print("💾 Testing Memory Usage...")
    
    try:
        # Get current memory usage
        process = psutil.Process()
        memory_info = process.memory_info()
        memory_mb = memory_info.rss / 1024 / 1024
        
        print(f"  📊 Current memory usage: {memory_mb:.2f} MB")
        
        # Test memory allocation
        test_data = []
        for i in range(1000):
            test_data.append(f"test_string_{i}" * 100)
        
        memory_after = process.memory_info().rss / 1024 / 1024
        print(f"  📊 Memory after allocation: {memory_after:.2f} MB")
        
        # Clean up
        del test_data
        
        return True
    except Exception as e:
        print(f"  ❌ Memory test failed: {e}")
        return False

def test_cpu_usage():
    """Test CPU usage"""
    print("⚡ Testing CPU Usage...")
    
    try:
        # Get CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        print(f"  📊 CPU usage: {cpu_percent}%")
        
        # Test CPU intensive operation
        start_time = time.time()
        result = sum(i * i for i in range(10000))
        end_time = time.time()
        
        print(f"  📊 CPU test completed in {end_time - start_time:.4f} seconds")
        print(f"  📊 Result: {result}")
        
        return True
    except Exception as e:
        print(f"  ❌ CPU test failed: {e}")
        return False

def test_file_operations():
    """Test file operations performance"""
    print("📁 Testing File Operations...")
    
    try:
        # Test file creation
        start_time = time.time()
        test_file = Path("temp_performance_test.txt")
        
        with open(test_file, "w") as f:
            for i in range(1000):
                f.write(f"Line {i}: Performance test data\n")
        
        creation_time = time.time() - start_time
        print(f"  📊 File creation time: {creation_time:.4f} seconds")
        
        # Test file reading
        start_time = time.time()
        with open(test_file, "r") as f:
            content = f.read()
        
        read_time = time.time() - start_time
        print(f"  📊 File read time: {read_time:.4f} seconds")
        print(f"  📊 File size: {len(content)} characters")
        
        # Clean up
        test_file.unlink()
        
        return True
    except Exception as e:
        print(f"  ❌ File operations test failed: {e}")
        return False

def test_import_performance():
    """Test import performance"""
    print("📦 Testing Import Performance...")
    
    try:
        # Test Python standard library imports
        start_time = time.time()
        import os
        import sys
        import json
        import time
        stdlib_time = time.time() - start_time
        print(f"  📊 Standard library imports: {stdlib_time:.4f} seconds")
        
        # Test third-party imports
        start_time = time.time()
        try:
            import numpy as np
            import pandas as pd
            third_party_time = time.time() - start_time
            print(f"  📊 Third-party imports: {third_party_time:.4f} seconds")
        except ImportError:
            print("  ⚠️ Third-party packages not available")
            third_party_time = 0
        
        return True
    except Exception as e:
        print(f"  ❌ Import performance test failed: {e}")
        return False

def main():
    """Run all performance tests"""
    print("🧪 Running Performance Tests")
    print("=" * 40)
    
    tests = [
        test_memory_usage,
        test_cpu_usage,
        test_file_operations,
        test_import_performance,
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
        "timestamp": str(Path.cwd()),
        "system_info": {
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total / 1024 / 1024 / 1024,  # GB
        }
    }
    
    with open("performance-test-results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    
    print(f"📄 Results saved to performance-test-results.json")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
