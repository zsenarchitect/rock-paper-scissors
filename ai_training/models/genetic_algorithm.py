"""
Genetic Algorithm for Rock Paper Scissors Strategy Evolution

This module implements a genetic algorithm to evolve optimal strategies
for the Rock Paper Scissors Battle Royale game.
"""

import random
import numpy as np
from typing import List, Tuple, Dict, Any
from dataclasses import dataclass
import json
import logging

logger = logging.getLogger(__name__)

@dataclass
class Strategy:
    """Represents a strategy with genetic parameters"""
    aggression: float
    patience: float
    grouping: float
    speed: float
    vision: float
    avoidance: float
    fitness: float = 0.0
    generation: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert strategy to dictionary"""
        return {
            'aggression': self.aggression,
            'patience': self.patience,
            'grouping': self.grouping,
            'speed': self.speed,
            'vision': self.vision,
            'avoidance': self.avoidance,
            'fitness': self.fitness,
            'generation': self.generation
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Strategy':
        """Create strategy from dictionary"""
        return cls(
            aggression=data['aggression'],
            patience=data['patience'],
            grouping=data['grouping'],
            speed=data['speed'],
            vision=data['vision'],
            avoidance=data['avoidance'],
            fitness=data.get('fitness', 0.0),
            generation=data.get('generation', 0)
        )

class GeneticAlgorithm:
    """
    Genetic Algorithm for evolving Rock Paper Scissors strategies
    """
    
    def __init__(self, 
                 population_size: int = 50,
                 mutation_rate: float = 0.1,
                 crossover_rate: float = 0.8,
                 elite_size: int = 5,
                 max_generations: int = 100):
        """
        Initialize the genetic algorithm
        
        Args:
            population_size: Number of strategies in each generation
            mutation_rate: Probability of mutation
            crossover_rate: Probability of crossover
            elite_size: Number of best strategies to preserve
            max_generations: Maximum number of generations to evolve
        """
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.elite_size = elite_size
        self.max_generations = max_generations
        
        self.population: List[Strategy] = []
        self.generation = 0
        self.best_fitness_history: List[float] = []
        self.average_fitness_history: List[float] = []
        
        logger.info(f"Genetic Algorithm initialized with population size {population_size}")
    
    def create_random_strategy(self) -> Strategy:
        """Create a random strategy"""
        return Strategy(
            aggression=random.uniform(0.0, 1.0),
            patience=random.uniform(0.0, 1.0),
            grouping=random.uniform(0.0, 1.0),
            speed=random.uniform(0.5, 2.0),
            vision=random.uniform(50.0, 150.0),
            avoidance=random.uniform(0.0, 1.0),
            generation=self.generation
        )
    
    def initialize_population(self) -> None:
        """Initialize the population with random strategies"""
        self.population = [self.create_random_strategy() for _ in range(self.population_size)]
        logger.info(f"Initialized population with {len(self.population)} strategies")
    
    def evaluate_fitness(self, strategy: Strategy, simulation_results: Dict[str, Any]) -> float:
        """
        Evaluate the fitness of a strategy based on simulation results
        
        Args:
            strategy: The strategy to evaluate
            simulation_results: Results from battle simulation
            
        Returns:
            Fitness score (higher is better)
        """
        # Extract metrics from simulation results
        survival_time = simulation_results.get('survival_time', 0)
        conversions = simulation_results.get('conversions', 0)
        damage_dealt = simulation_results.get('damage_dealt', 0)
        damage_taken = simulation_results.get('damage_taken', 1)
        
        # Calculate fitness based on multiple factors
        fitness = 0.0
        
        # Survival time factor (longer is better)
        fitness += survival_time * 0.3
        
        # Conversion factor (more conversions is better)
        fitness += conversions * 10.0
        
        # Damage ratio (more damage dealt vs taken is better)
        damage_ratio = damage_dealt / max(damage_taken, 1)
        fitness += damage_ratio * 5.0
        
        # Strategy-specific bonuses
        if strategy.aggression > 0.7 and conversions > 5:
            fitness += 2.0  # Aggressive strategies that convert well
        
        if strategy.patience > 0.7 and survival_time > 100:
            fitness += 1.5  # Patient strategies that survive long
        
        if strategy.grouping > 0.6 and damage_taken < 50:
            fitness += 1.0  # Grouping strategies that avoid damage
        
        return max(0.0, fitness)
    
    def select_parents(self) -> List[Strategy]:
        """Select parents for reproduction using tournament selection"""
        parents = []
        
        for _ in range(self.population_size - self.elite_size):
            # Tournament selection
            tournament_size = 3
            tournament = random.sample(self.population, tournament_size)
            winner = max(tournament, key=lambda s: s.fitness)
            parents.append(winner)
        
        return parents
    
    def crossover(self, parent1: Strategy, parent2: Strategy) -> Tuple[Strategy, Strategy]:
        """
        Create two offspring from two parents using uniform crossover
        
        Args:
            parent1: First parent strategy
            parent2: Second parent strategy
            
        Returns:
            Tuple of two offspring strategies
        """
        if random.random() > self.crossover_rate:
            return parent1, parent2
        
        # Create offspring
        child1 = Strategy(
            aggression=random.choice([parent1.aggression, parent2.aggression]),
            patience=random.choice([parent1.patience, parent2.patience]),
            grouping=random.choice([parent1.grouping, parent2.grouping]),
            speed=random.choice([parent1.speed, parent2.speed]),
            vision=random.choice([parent1.vision, parent2.vision]),
            avoidance=random.choice([parent1.avoidance, parent2.avoidance]),
            generation=self.generation + 1
        )
        
        child2 = Strategy(
            aggression=random.choice([parent1.aggression, parent2.aggression]),
            patience=random.choice([parent1.patience, parent2.patience]),
            grouping=random.choice([parent1.grouping, parent2.grouping]),
            speed=random.choice([parent1.speed, parent2.speed]),
            vision=random.choice([parent1.vision, parent2.vision]),
            avoidance=random.choice([parent1.avoidance, parent2.avoidance]),
            generation=self.generation + 1
        )
        
        return child1, child2
    
    def mutate(self, strategy: Strategy) -> Strategy:
        """
        Mutate a strategy by randomly changing some parameters
        
        Args:
            strategy: Strategy to mutate
            
        Returns:
            Mutated strategy
        """
        if random.random() > self.mutation_rate:
            return strategy
        
        # Create mutated copy
        mutated = Strategy(
            aggression=max(0.0, min(1.0, strategy.aggression + random.gauss(0, 0.1))),
            patience=max(0.0, min(1.0, strategy.patience + random.gauss(0, 0.1))),
            grouping=max(0.0, min(1.0, strategy.grouping + random.gauss(0, 0.1))),
            speed=max(0.1, min(3.0, strategy.speed + random.gauss(0, 0.2))),
            vision=max(10.0, min(200.0, strategy.vision + random.gauss(0, 10))),
            avoidance=max(0.0, min(1.0, strategy.avoidance + random.gauss(0, 0.1))),
            generation=strategy.generation
        )
        
        return mutated
    
    def evolve_generation(self) -> None:
        """Evolve one generation of strategies"""
        # Sort population by fitness
        self.population.sort(key=lambda s: s.fitness, reverse=True)
        
        # Keep elite strategies
        elite = self.population[:self.elite_size]
        
        # Select parents
        parents = self.select_parents()
        
        # Create new generation
        new_population = elite.copy()
        
        for i in range(0, len(parents), 2):
            if i + 1 < len(parents):
                parent1, parent2 = parents[i], parents[i + 1]
                child1, child2 = self.crossover(parent1, parent2)
                
                # Mutate children
                child1 = self.mutate(child1)
                child2 = self.mutate(child2)
                
                new_population.extend([child1, child2])
        
        # Ensure population size
        while len(new_population) < self.population_size:
            new_population.append(self.create_random_strategy())
        
        self.population = new_population[:self.population_size]
        self.generation += 1
        
        # Update fitness history
        fitnesses = [s.fitness for s in self.population]
        self.best_fitness_history.append(max(fitnesses))
        self.average_fitness_history.append(np.mean(fitnesses))
        
        logger.info(f"Generation {self.generation}: Best fitness = {max(fitnesses):.2f}, "
                   f"Average fitness = {np.mean(fitnesses):.2f}")
    
    def evolve(self, simulation_function) -> Strategy:
        """
        Evolve strategies for multiple generations
        
        Args:
            simulation_function: Function that runs simulation and returns results
            
        Returns:
            Best evolved strategy
        """
        if not self.population:
            self.initialize_population()
        
        for generation in range(self.max_generations):
            # Evaluate fitness for all strategies
            for strategy in self.population:
                if strategy.fitness == 0.0:  # Only evaluate if not already evaluated
                    results = simulation_function(strategy)
                    strategy.fitness = self.evaluate_fitness(strategy, results)
            
            # Evolve to next generation
            self.evolve_generation()
            
            # Check for convergence
            if len(self.best_fitness_history) > 10:
                recent_improvement = (self.best_fitness_history[-1] - 
                                    self.best_fitness_history[-10])
                if recent_improvement < 0.01:
                    logger.info("Convergence detected, stopping evolution")
                    break
        
        # Return best strategy
        best_strategy = max(self.population, key=lambda s: s.fitness)
        logger.info(f"Evolution complete. Best fitness: {best_strategy.fitness:.2f}")
        
        return best_strategy
    
    def save_population(self, filename: str) -> None:
        """Save current population to file"""
        data = {
            'generation': self.generation,
            'population': [s.to_dict() for s in self.population],
            'fitness_history': {
                'best': self.best_fitness_history,
                'average': self.average_fitness_history
            }
        }
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        
        logger.info(f"Population saved to {filename}")
    
    def load_population(self, filename: str) -> None:
        """Load population from file"""
        with open(filename, 'r') as f:
            data = json.load(f)
        
        self.generation = data['generation']
        self.population = [Strategy.from_dict(s) for s in data['population']]
        self.best_fitness_history = data['fitness_history']['best']
        self.average_fitness_history = data['fitness_history']['average']
        
        logger.info(f"Population loaded from {filename}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get current population statistics"""
        if not self.population:
            return {}
        
        fitnesses = [s.fitness for s in self.population]
        
        return {
            'generation': self.generation,
            'population_size': len(self.population),
            'best_fitness': max(fitnesses),
            'worst_fitness': min(fitnesses),
            'average_fitness': np.mean(fitnesses),
            'std_fitness': np.std(fitnesses),
            'best_strategy': max(self.population, key=lambda s: s.fitness).to_dict()
        }
