#!/usr/bin/env python3
"""
Training script for Rock Paper Scissors AI models

This script trains various AI models for the Rock Paper Scissors Battle Royale game.
"""

import sys
import os
import argparse
import logging
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from ai_training.models.genetic_algorithm import GeneticAlgorithm, Strategy
from ai_training.models.neural_network import NeuralNetwork, NetworkConfig
from ai_training.models.reinforcement_learning import ReinforcementLearning, RLConfig

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def simulate_battle(strategy: Strategy) -> dict:
    """
    Simulate a battle with the given strategy
    
    This is a placeholder function. In practice, this would integrate
    with the actual game simulation engine.
    
    Args:
        strategy: Strategy to test
        
    Returns:
        Simulation results
    """
    import random
    
    # Simulate battle results based on strategy parameters
    survival_time = random.uniform(50, 200) * strategy.patience
    conversions = random.uniform(0, 10) * strategy.aggression
    damage_dealt = random.uniform(20, 100) * strategy.aggression
    damage_taken = random.uniform(10, 80) * (1 - strategy.avoidance)
    
    return {
        'survival_time': survival_time,
        'conversions': conversions,
        'damage_dealt': damage_dealt,
        'damage_taken': damage_taken
    }

def train_genetic_algorithm(population_size: int = 50, generations: int = 100):
    """Train using genetic algorithm"""
    logger.info("Starting Genetic Algorithm training...")
    
    # Initialize genetic algorithm
    ga = GeneticAlgorithm(
        population_size=population_size,
        max_generations=generations
    )
    
    # Train
    best_strategy = ga.evolve(simulate_battle)
    
    # Save results
    ga.save_population('ai_training/data/strategy-evaluations/ga_population.json')
    
    logger.info(f"Genetic Algorithm training completed!")
    logger.info(f"Best strategy: {best_strategy}")
    
    return best_strategy

def train_neural_network(epochs: int = 100):
    """Train using neural network"""
    logger.info("Starting Neural Network training...")
    
    # Generate training data
    import numpy as np
    
    # Create synthetic training data
    n_samples = 1000
    X = np.random.rand(n_samples, 6)  # 6 input features
    y = np.random.rand(n_samples, 3)  # 3 output targets
    
    # Initialize neural network
    config = NetworkConfig(
        input_size=6,
        hidden_sizes=[64, 32],
        output_size=3,
        learning_rate=0.001
    )
    
    nn = NeuralNetwork(config)
    
    # Train
    history = nn.train(X, y, epochs=epochs)
    
    # Save model
    nn.save('ai_training/data/strategy-evaluations/neural_network.json')
    
    logger.info("Neural Network training completed!")
    logger.info(f"Final training loss: {history['train_loss'][-1]:.4f}")
    
    return nn

def train_reinforcement_learning(episodes: int = 1000):
    """Train using reinforcement learning"""
    logger.info("Starting Reinforcement Learning training...")
    
    # Initialize RL agent
    config = RLConfig(
        learning_rate=0.1,
        discount_factor=0.95,
        epsilon=0.1
    )
    
    rl = ReinforcementLearning(
        algorithm='q_learning',
        state_size=6,
        action_size=3,
        config=config
    )
    
    # Train
    history = rl.train(simulate_battle, episodes=episodes)
    
    # Save model
    rl.save('ai_training/data/strategy-evaluations/reinforcement_learning.json')
    
    logger.info("Reinforcement Learning training completed!")
    logger.info(f"Final average reward: {history['episode_rewards'][-100:].mean():.4f}")
    
    return rl

def main():
    """Main training function"""
    parser = argparse.ArgumentParser(description='Train AI models for Rock Paper Scissors')
    parser.add_argument('--model', choices=['genetic', 'neural', 'rl', 'all'], 
                       default='all', help='Model to train')
    parser.add_argument('--population-size', type=int, default=50,
                       help='Population size for genetic algorithm')
    parser.add_argument('--generations', type=int, default=100,
                       help='Number of generations for genetic algorithm')
    parser.add_argument('--epochs', type=int, default=100,
                       help='Number of epochs for neural network')
    parser.add_argument('--episodes', type=int, default=1000,
                       help='Number of episodes for reinforcement learning')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs('ai_training/data/strategy-evaluations', exist_ok=True)
    
    logger.info("🎮 Rock Paper Scissors Battle Royale - AI Training")
    logger.info("=" * 60)
    
    if args.model in ['genetic', 'all']:
        train_genetic_algorithm(args.population_size, args.generations)
    
    if args.model in ['neural', 'all']:
        train_neural_network(args.epochs)
    
    if args.model in ['rl', 'all']:
        train_reinforcement_learning(args.episodes)
    
    logger.info("🎉 All training completed!")
    logger.info("📁 Results saved to ai_training/data/strategy-evaluations/")

if __name__ == "__main__":
    main()
