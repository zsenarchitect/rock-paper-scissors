#!/usr/bin/env python3
"""
Project Structure Validation Script
Validates that files are in correct directories according to .cursorrules
"""

import os
import sys
from pathlib import Path

def check_root_pollution():
    """Check for files that shouldn't be in root directory"""
    print("🔍 Checking for root directory pollution...")
    
    # Files that should NOT be in root
    forbidden_patterns = [
        "*.debug", "debug_*", "*.log", "*.trace", "*.dump",
        "*.test", "test_*", "*_test", "*.spec",
        "*.tmp", "*.temp", "temp_*", "*.cache", "cache_*",
        "*.bak", "*.backup", "backup_*", "*.old",
        ".DS_Store", "Thumbs.db", "._*", ".Spotlight-V100", ".Trashes",
        "ehthumbs.db", "*.swp", "*.swo", "*~"
    ]
    
    violations = []
    
    for file in os.listdir("."):
        if os.path.isfile(file):
            for pattern in forbidden_patterns:
                if pattern.startswith("*"):
                    if file.endswith(pattern[1:]):
                        violations.append(f"File '{file}' matches forbidden pattern '{pattern}'")
                elif pattern.endswith("*"):
                    if file.startswith(pattern[:-1]):
                        violations.append(f"File '{file}' matches forbidden pattern '{pattern}'")
                elif file == pattern:
                    violations.append(f"File '{file}' matches forbidden pattern '{pattern}'")
    
    if violations:
        print("❌ Root directory pollution found:")
        for violation in violations:
            print(f"  - {violation}")
        return False
    else:
        print("✅ Root directory is clean")
        return True

def check_directory_structure():
    """Check that required directories exist"""
    print("\n📁 Checking directory structure...")
    
    required_dirs = [
        "docs/",
        "docs/js/",
        "docs/css/",
        "docs/assets/",
        "docs/data/",
        "ai_training/",
        "ai_training/models/",
        "ai_training/scripts/",
        "ai_training/data/",
        ".venv/",
        "temp/",
        "DEBUG/"
    ]
    
    missing_dirs = []
    
    for dir_path in required_dirs:
        if not os.path.exists(dir_path):
            missing_dirs.append(dir_path)
    
    if missing_dirs:
        print("❌ Missing required directories:")
        for dir_path in missing_dirs:
            print(f"  - {dir_path}")
        return False
    else:
        print("✅ All required directories exist")
        return True

def check_file_organization():
    """Check that files are in correct directories"""
    print("\n📄 Checking file organization...")
    
    # Check that test files are in temp/tests/
    test_files_in_root = []
    for file in os.listdir("."):
        if os.path.isfile(file) and ("test" in file.lower() or file.endswith(".test")):
            test_files_in_root.append(file)
    
    if test_files_in_root:
        print("❌ Test files found in root directory:")
        for file in test_files_in_root:
            print(f"  - {file} (should be in temp/tests/)")
        return False
    else:
        print("✅ No test files in root directory")
    
    # Check that debug files are in DEBUG/ (excluding entry scripts)
    debug_files_in_root = []
    entry_scripts = ["debug-helper.sh", "cleanup.sh", "dev-workflow.sh", "activate.sh", "install.sh"]
    
    for file in os.listdir("."):
        if os.path.isfile(file) and ("debug" in file.lower() or file.endswith(".debug")):
            # Skip entry scripts
            if file not in entry_scripts:
                debug_files_in_root.append(file)
    
    if debug_files_in_root:
        print("❌ Debug files found in root directory:")
        for file in debug_files_in_root:
            print(f"  - {file} (should be in DEBUG/)")
        return False
    else:
        print("✅ No debug files in root directory")
    
    return True

def check_entry_scripts():
    """Check that entry scripts are lean"""
    print("\n📝 Checking entry scripts...")
    
    entry_scripts = [
        "install.sh",
        "activate.sh",
        "cleanup.sh",
        "verify-phase1.py"
    ]
    
    for script in entry_scripts:
        if os.path.exists(script):
            with open(script, 'r') as f:
                content = f.read()
                lines = content.split('\n')
                
                # Check if script is too long (more than 200 lines)
                if len(lines) > 200:
                    print(f"⚠️  Entry script '{script}' is quite long ({len(lines)} lines)")
                    print(f"   Consider breaking it into smaller modules")
                else:
                    print(f"✅ Entry script '{script}' is appropriately sized ({len(lines)} lines)")
    
    return True

def check_modular_design():
    """Check that the project follows modular design principles"""
    print("\n🏗️ Checking modular design...")
    
    # Check that JavaScript files are properly organized
    js_files = []
    for root, dirs, files in os.walk("docs/js"):
        for file in files:
            if file.endswith(".js"):
                js_files.append(os.path.join(root, file))
    
    if len(js_files) > 0:
        print(f"✅ JavaScript files are organized in modules ({len(js_files)} files)")
    else:
        print("❌ No JavaScript files found in docs/js/")
        return False
    
    # Check that Python files are properly organized
    py_files = []
    for root, dirs, files in os.walk("ai_training"):
        for file in files:
            if file.endswith(".py"):
                py_files.append(os.path.join(root, file))
    
    if len(py_files) > 0:
        print(f"✅ Python files are organized in modules ({len(py_files)} files)")
    else:
        print("❌ No Python files found in ai_training/")
        return False
    
    return True

def main():
    """Run all validation checks"""
    print("🎮 Rock Paper Scissors Battle Royale - Structure Validation")
    print("=" * 60)
    
    checks = [
        check_root_pollution,
        check_directory_structure,
        check_file_organization,
        check_entry_scripts,
        check_modular_design
    ]
    
    passed = 0
    total = len(checks)
    
    for check in checks:
        if check():
            passed += 1
        print()
    
    print("=" * 60)
    print(f"📊 Validation Summary: {passed}/{total} checks passed")
    
    if passed == total:
        print("🎉 Project structure is valid and follows .cursorrules!")
        print("✅ Ready for development and collaboration")
        return 0
    else:
        print("❌ Project structure needs attention")
        print("🔧 Run './cleanup.sh' to fix issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())
