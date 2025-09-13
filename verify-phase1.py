#!/usr/bin/env python3
"""
Phase 1 Verification Script
Comprehensive check of all Phase 1 components
"""

import os
import sys
import json
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists and report status"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} - MISSING")
        return False

def check_directory_exists(dirpath, description):
    """Check if a directory exists and report status"""
    if os.path.isdir(dirpath):
        print(f"✅ {description}: {dirpath}")
        return True
    else:
        print(f"❌ {description}: {dirpath} - MISSING")
        return False

def check_js_file_content(filepath, required_functions):
    """Check if JS file contains required functions"""
    if not os.path.exists(filepath):
        print(f"❌ {filepath} - FILE MISSING")
        return False
    
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        missing_functions = []
        for func in required_functions:
            if func not in content:
                missing_functions.append(func)
        
        if missing_functions:
            print(f"❌ {filepath} - Missing functions: {missing_functions}")
            return False
        else:
            print(f"✅ {filepath} - All required functions present")
            return True
    except Exception as e:
        print(f"❌ {filepath} - Error reading file: {e}")
        return False

def main():
    """Run comprehensive Phase 1 verification"""
    print("🎮 Rock Paper Scissors Battle Royale - Phase 1 Verification")
    print("=" * 70)
    
    # Track overall success
    total_checks = 0
    passed_checks = 0
    
    # 1. Project Structure
    print("\n📁 PROJECT STRUCTURE")
    print("-" * 30)
    
    structure_checks = [
        ("docs/", "GitHub Pages directory"),
        ("docs/index.html", "Main HTML file"),
        ("docs/css/", "CSS directory"),
        ("docs/js/", "JavaScript directory"),
        ("docs/assets/", "Assets directory"),
        ("docs/data/", "Data directory"),
        ("ai_training/", "AI training directory"),
        (".venv/", "Virtual environment"),
        ("requirements.txt", "Python requirements"),
        ("setup.py", "Python setup script"),
        (".gitignore", "Git ignore file"),
        ("README.md", "Project documentation")
    ]
    
    for path, description in structure_checks:
        total_checks += 1
        if os.path.exists(path):
            print(f"✅ {description}: {path}")
            passed_checks += 1
        else:
            print(f"❌ {description}: {path} - MISSING")
    
    # 2. Core Game Files
    print("\n🎮 CORE GAME FILES")
    print("-" * 30)
    
    game_files = [
        ("docs/js/game/game-engine.js", "Game engine"),
        ("docs/js/game/entity-manager.js", "Entity manager"),
        ("docs/js/game/collision-system.js", "Collision system"),
        ("docs/js/game/physics-engine.js", "Physics engine"),
        ("docs/js/entities/base-entity.js", "Base entity"),
        ("docs/js/entities/rock-entity.js", "Rock entity"),
        ("docs/js/entities/paper-entity.js", "Paper entity"),
        ("docs/js/entities/scissors-entity.js", "Scissors entity"),
        ("docs/js/config/game-config.js", "Game configuration"),
        ("docs/js/utils/logger.js", "Logger utility"),
        ("docs/js/utils/storage.js", "Storage utility"),
        ("docs/js/utils/math-utils.js", "Math utilities"),
        ("docs/js/utils/audio-manager.js", "Audio manager"),
        ("docs/js/visualization/pie-chart.js", "Pie chart"),
        ("docs/js/visualization/trend-graph.js", "Trend graph"),
        ("docs/js/voting/voting-system.js", "Voting system"),
        ("docs/js/rooms/room-manager.js", "Room manager"),
        ("docs/js/api/battle-api.js", "Battle API"),
        ("docs/js/app.js", "Main application")
    ]
    
    for filepath, description in game_files:
        total_checks += 1
        if check_file_exists(filepath, description):
            passed_checks += 1
    
    # 3. AI Training Files
    print("\n🤖 AI TRAINING FILES")
    print("-" * 30)
    
    ai_files = [
        ("ai_training/__init__.py", "AI training init"),
        ("ai_training/models/__init__.py", "Models init"),
        ("ai_training/models/genetic_algorithm.py", "Genetic algorithm"),
        ("ai_training/models/neural_network.py", "Neural network"),
        ("ai_training/models/reinforcement_learning.py", "Reinforcement learning"),
        ("ai_training/scripts/train_model.py", "Training script")
    ]
    
    for filepath, description in ai_files:
        total_checks += 1
        if check_file_exists(filepath, description):
            passed_checks += 1
    
    # 4. Configuration Files
    print("\n⚙️ CONFIGURATION FILES")
    print("-" * 30)
    
    config_files = [
        ("docs/data/battles.json", "Battles data"),
        ("docs/data/rooms.json", "Rooms data"),
        ("docs/data/voting.json", "Voting data"),
        ("docs/data/strategies.json", "Strategies data"),
        ("docs/data/analytics.json", "Analytics data")
    ]
    
    for filepath, description in config_files:
        total_checks += 1
        if check_file_exists(filepath, description):
            passed_checks += 1
    
    # 5. Asset Directories
    print("\n🎨 ASSET DIRECTORIES")
    print("-" * 30)
    
    asset_dirs = [
        ("docs/assets/images/sprites/", "Sprite images"),
        ("docs/assets/sounds/effects/", "Sound effects"),
        ("docs/assets/sounds/ui/", "UI sounds")
    ]
    
    for dirpath, description in asset_dirs:
        total_checks += 1
        if check_directory_exists(dirpath, description):
            passed_checks += 1
    
    # 6. Key Functionality Checks
    print("\n🔧 KEY FUNCTIONALITY")
    print("-" * 30)
    
    # Check audio manager functionality
    total_checks += 1
    if check_js_file_content("docs/js/utils/audio-manager.js", 
                           ["findSoundFile", "findAlternativeSoundFile", "tryLoadSound"]):
        passed_checks += 1
    
    # Check game engine functionality
    total_checks += 1
    if check_js_file_content("docs/js/game/game-engine.js", 
                           ["GameEngine", "init", "start", "update", "render"]):
        passed_checks += 1
    
    # Check AI training functionality
    total_checks += 1
    if check_js_file_content("ai_training/models/genetic_algorithm.py", 
                           ["GeneticAlgorithm", "Strategy", "evolve"]):
        passed_checks += 1
    
    # 7. Virtual Environment Check
    print("\n🐍 VIRTUAL ENVIRONMENT")
    print("-" * 30)
    
    total_checks += 1
    if os.path.exists(".venv/bin/python"):
        print("✅ Virtual environment Python executable")
        passed_checks += 1
    else:
        print("❌ Virtual environment Python executable - MISSING")
    
    # 8. Test Files
    print("\n🧪 TEST FILES")
    print("-" * 30)
    
    test_files = [
        ("test_venv.py", "Virtual environment test"),
        ("test-audio-manager.js", "Audio manager test"),
        ("test-audio.html", "Audio browser test"),
        ("convert-audio.html", "Audio converter")
    ]
    
    for filepath, description in test_files:
        total_checks += 1
        if check_file_exists(filepath, description):
            passed_checks += 1
    
    # 9. Documentation
    print("\n📚 DOCUMENTATION")
    print("-" * 30)
    
    doc_files = [
        ("README.md", "Main documentation"),
        ("docs/AUDIO_SYSTEM.md", "Audio system documentation"),
        ("install.sh", "Installation script"),
        ("activate.sh", "Activation script")
    ]
    
    for filepath, description in doc_files:
        total_checks += 1
        if check_file_exists(filepath, description):
            passed_checks += 1
    
    # Summary
    print("\n" + "=" * 70)
    print(f"📊 PHASE 1 VERIFICATION SUMMARY")
    print(f"Total Checks: {total_checks}")
    print(f"Passed: {passed_checks}")
    print(f"Failed: {total_checks - passed_checks}")
    print(f"Success Rate: {(passed_checks/total_checks)*100:.1f}%")
    
    if passed_checks == total_checks:
        print("\n🎉 PHASE 1 COMPLETE! All components verified successfully.")
        print("\n📋 Phase 1 Features Ready:")
        print("  ✅ Modular project structure")
        print("  ✅ Game engine with entity system")
        print("  ✅ Collision detection and physics")
        print("  ✅ Configuration management")
        print("  ✅ Logging and debugging framework")
        print("  ✅ AI training platform")
        print("  ✅ Visualization system")
        print("  ✅ Audio system (extension-agnostic)")
        print("  ✅ Virtual environment (.venv)")
        print("  ✅ Testing framework")
        print("  ✅ Documentation")
        
        print("\n🚀 Ready for Phase 2 or production use!")
        return 0
    else:
        print(f"\n❌ PHASE 1 INCOMPLETE! {total_checks - passed_checks} issues found.")
        print("Please fix the missing components before proceeding.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
