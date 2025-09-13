#!/usr/bin/env python3
"""
Simple project structure validation for GitHub Actions
"""

import os
import sys
from pathlib import Path

def validate_structure():
    """Validate basic project structure"""
    print("🏗️ Validating project structure...")
    
    # Required directories
    required_dirs = [
        "docs/",
        "ai_training/",
        "temp/",
        "DEBUG/"
    ]
    
    # Required files
    required_files = [
        "README.md",
        ".gitignore",
        "requirements.txt",
        "package.json",
        "cleanup-simple.sh"
    ]
    
    # Check directories
    for dir_path in required_dirs:
        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            print(f"  ✅ {dir_path}")
        else:
            print(f"  ❌ {dir_path} missing")
            return False
    
    # Check files
    for file_path in required_files:
        if os.path.exists(file_path) and os.path.isfile(file_path):
            print(f"  ✅ {file_path}")
        else:
            print(f"  ❌ {file_path} missing")
            return False
    
    print("✅ Project structure validation passed")
    return True

def main():
    """Main validation function"""
    try:
        success = validate_structure()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Validation failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
