#!/usr/bin/env python3
"""
Setup script for Rock Paper Scissors Battle Royale AI Training Platform
"""

from setuptools import setup, find_packages
import os

# Read the README file
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read requirements
with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="rock-paper-scissors-battle-royale",
    version="1.0.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="AI Training Platform for Rock Paper Scissors Battle Royale",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/rock-paper-scissors",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Games/Entertainment",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=3.0.0",
            "black>=22.0.0",
            "flake8>=4.0.0",
            "mypy>=0.950",
        ],
        "ai": [
            "torch>=1.12.0",
            "tensorflow>=2.10.0",
            "openai>=0.27.0",
            "transformers>=4.20.0",
        ],
        "web": [
            "flask>=2.0.0",
            "fastapi>=0.85.0",
            "dash>=2.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "rps-train=ai_training.scripts.train_model:main",
            "rps-simulate=ai_training.scripts.evaluate_strategy:main",
            "rps-server=src.api.server:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.json", "*.yaml", "*.yml", "*.txt", "*.md"],
    },
    zip_safe=False,
)
