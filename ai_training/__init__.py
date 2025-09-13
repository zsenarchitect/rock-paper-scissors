"""
Rock Paper Scissors Battle Royale - AI Training Module

This module contains AI training components for the Rock Paper Scissors Battle Royale game.
It includes genetic algorithms, neural networks, and reinforcement learning approaches
for evolving optimal strategies.
"""

__version__ = "1.0.0"
__author__ = "Your Name"
__email__ = "your.email@example.com"

# Import main components
from .models.genetic_algorithm import GeneticAlgorithm
from .models.neural_network import NeuralNetwork
from .models.reinforcement_learning import ReinforcementLearning

__all__ = [
    "GeneticAlgorithm",
    "NeuralNetwork", 
    "ReinforcementLearning",
]
