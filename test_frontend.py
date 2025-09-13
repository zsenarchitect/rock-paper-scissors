#!/usr/bin/env python3
"""
Frontend test script for Rock Paper Scissors Battle Royale
"""

import os
import sys
import json
from pathlib import Path

def test_html_structure():
    """Test HTML structure and basic functionality"""
    print("🌐 Testing HTML structure...")
    
    # Check if main HTML file exists
    html_file = Path("docs/index.html")
    if not html_file.exists():
        print("❌ docs/index.html not found")
        return False
    
    # Read and validate HTML content
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Basic HTML structure checks
    checks = [
        ("DOCTYPE declaration", "<!DOCTYPE html>" in content),
        ("HTML tag", "<html" in content),
        ("Head section", "<head>" in content),
        ("Body section", "<body>" in content),
        ("Canvas element", "<canvas" in content),
        ("Script tags", "<script" in content),
    ]
    
    results = []
    for check_name, passed in checks:
        status = "✅" if passed else "❌"
        print(f"  {status} {check_name}")
        results.append(passed)
    
    return all(results)

def test_js_files():
    """Test JavaScript files exist and are valid"""
    print("📜 Testing JavaScript files...")
    
    js_files = [
        "docs/js/config/game-config.js",
        "docs/js/utils/logger.js",
        "docs/js/utils/storage.js",
        "docs/js/utils/math-utils.js",
        "docs/js/utils/audio-manager.js",
        "docs/js/game/game-engine.js",
        "docs/js/entities/base-entity.js",
        "docs/js/entities/rock-entity.js",
        "docs/js/entities/paper-entity.js",
        "docs/js/entities/scissors-entity.js",
    ]
    
    results = []
    for js_file in js_files:
        if Path(js_file).exists():
            print(f"  ✅ {js_file}")
            results.append(True)
        else:
            print(f"  ❌ {js_file} not found")
            results.append(False)
    
    return all(results)

def test_css_files():
    """Test CSS files exist"""
    print("🎨 Testing CSS files...")
    
    css_files = [
        "docs/css/style.css",
    ]
    
    results = []
    for css_file in css_files:
        if Path(css_file).exists():
            print(f"  ✅ {css_file}")
            results.append(True)
        else:
            print(f"  ❌ {css_file} not found")
            results.append(False)
    
    return all(results)

def main():
    """Run all frontend tests"""
    print("🧪 Running Frontend Tests")
    print("=" * 40)
    
    tests = [
        test_html_structure,
        test_js_files,
        test_css_files,
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
    
    with open("frontend-test-results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    
    print(f"📄 Results saved to frontend-test-results.json")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
