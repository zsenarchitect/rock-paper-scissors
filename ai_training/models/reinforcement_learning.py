"""
Reinforcement Learning for Rock Paper Scissors Strategy Learning

This module implements reinforcement learning algorithms for learning optimal strategies
in the Rock Paper Scissors Battle Royale game.
"""

import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from dataclasses import dataclass
import json
import logging

logger = logging.getLogger(__name__)

@dataclass
class RLConfig:
    """Configuration for reinforcement learning"""
    learning_rate: float = 0.1
    discount_factor: float = 0.95
    epsilon: float = 0.1
    epsilon_decay: float = 0.995
    epsilon_min: float = 0.01
    memory_size: int = 10000
    batch_size: int = 32
    target_update_freq: int = 100

class QLearning:
    """
    Q-Learning implementation for strategy learning
    """
    
    def __init__(self, state_size: int, action_size: int, config: RLConfig):
        """
        Initialize Q-Learning agent
        
        Args:
            state_size: Size of state space
            action_size: Size of action space
            config: RL configuration
        """
        self.state_size = state_size
        self.action_size = action_size
        self.config = config
        
        # Q-table
        self.q_table = np.zeros((state_size, action_size))
        
        # Experience replay
        self.memory = []
        
        logger.info(f"Q-Learning agent initialized: state_size={state_size}, action_size={action_size}")
    
    def get_state_index(self, state: np.ndarray) -> int:
        """Convert continuous state to discrete index"""
        # Simple discretization - in practice, you'd want more sophisticated methods
        state_hash = hash(tuple(np.round(state, 2)))
        return abs(state_hash) % self.state_size
    
    def choose_action(self, state: np.ndarray, training: bool = True) -> int:
        """
        Choose action using epsilon-greedy policy
        
        Args:
            state: Current state
            training: Whether in training mode
            
        Returns:
            Action index
        """
        state_idx = self.get_state_index(state)
        
        if training and np.random.random() < self.config.epsilon:
            # Explore
            return np.random.randint(self.action_size)
        else:
            # Exploit
            return np.argmax(self.q_table[state_idx])
    
    def update_q_table(self, state: np.ndarray, action: int, reward: float, 
                      next_state: np.ndarray, done: bool):
        """
        Update Q-table using Q-learning update rule
        
        Args:
            state: Current state
            action: Action taken
            reward: Reward received
            next_state: Next state
            done: Whether episode is done
        """
        state_idx = self.get_state_index(state)
        next_state_idx = self.get_state_index(next_state)
        
        # Q-learning update
        current_q = self.q_table[state_idx, action]
        
        if done:
            target_q = reward
        else:
            target_q = reward + self.config.discount_factor * np.max(self.q_table[next_state_idx])
        
        # Update Q-value
        self.q_table[state_idx, action] += self.config.learning_rate * (target_q - current_q)
        
        # Decay epsilon
        if self.config.epsilon > self.config.epsilon_min:
            self.config.epsilon *= self.config.epsilon_decay
    
    def save(self, filepath: str):
        """Save Q-table to file"""
        model_data = {
            'q_table': self.q_table.tolist(),
            'config': {
                'learning_rate': self.config.learning_rate,
                'discount_factor': self.config.discount_factor,
                'epsilon': self.config.epsilon,
                'epsilon_decay': self.config.epsilon_decay,
                'epsilon_min': self.config.epsilon_min
            }
        }
        
        with open(filepath, 'w') as f:
            json.dump(model_data, f, indent=2)
        
        logger.info(f"Q-table saved to {filepath}")
    
    def load(self, filepath: str):
        """Load Q-table from file"""
        with open(filepath, 'r') as f:
            model_data = json.load(f)
        
        self.q_table = np.array(model_data['q_table'])
        
        # Update config
        config_data = model_data['config']
        self.config.learning_rate = config_data['learning_rate']
        self.config.discount_factor = config_data['discount_factor']
        self.config.epsilon = config_data['epsilon']
        self.config.epsilon_decay = config_data['epsilon_decay']
        self.config.epsilon_min = config_data['epsilon_min']
        
        logger.info(f"Q-table loaded from {filepath}")

class PolicyGradient:
    """
    Policy Gradient implementation for strategy learning
    """
    
    def __init__(self, state_size: int, action_size: int, config: RLConfig):
        """
        Initialize Policy Gradient agent
        
        Args:
            state_size: Size of state space
            action_size: Size of action space
            config: RL configuration
        """
        self.state_size = state_size
        self.action_size = action_size
        self.config = config
        
        # Policy parameters (simple linear policy)
        self.theta = np.random.randn(state_size, action_size) * 0.01
        
        # Experience storage
        self.episode_states = []
        self.episode_actions = []
        self.episode_rewards = []
        
        logger.info(f"Policy Gradient agent initialized: state_size={state_size}, action_size={action_size}")
    
    def get_action_probabilities(self, state: np.ndarray) -> np.ndarray:
        """Get action probabilities from current policy"""
        logits = np.dot(state, self.theta)
        exp_logits = np.exp(logits - np.max(logits))  # Numerical stability
        return exp_logits / np.sum(exp_logits)
    
    def choose_action(self, state: np.ndarray) -> int:
        """
        Choose action from policy
        
        Args:
            state: Current state
            
        Returns:
            Action index
        """
        probs = self.get_action_probabilities(state)
        return np.random.choice(self.action_size, p=probs)
    
    def store_experience(self, state: np.ndarray, action: int, reward: float):
        """Store experience for episode"""
        self.episode_states.append(state)
        self.episode_actions.append(action)
        self.episode_rewards.append(reward)
    
    def update_policy(self):
        """Update policy using stored episode data"""
        if not self.episode_states:
            return
        
        # Convert to numpy arrays
        states = np.array(self.episode_states)
        actions = np.array(self.episode_actions)
        rewards = np.array(self.episode_rewards)
        
        # Compute discounted rewards
        discounted_rewards = self._compute_discounted_rewards(rewards)
        
        # Compute policy gradient
        gradient = self._compute_policy_gradient(states, actions, discounted_rewards)
        
        # Update policy parameters
        self.theta += self.config.learning_rate * gradient
        
        # Clear episode data
        self.episode_states.clear()
        self.episode_actions.clear()
        self.episode_rewards.clear()
    
    def _compute_discounted_rewards(self, rewards: np.ndarray) -> np.ndarray:
        """Compute discounted cumulative rewards"""
        discounted = np.zeros_like(rewards)
        running_sum = 0
        
        for t in reversed(range(len(rewards))):
            running_sum = rewards[t] + self.config.discount_factor * running_sum
            discounted[t] = running_sum
        
        # Normalize rewards
        if len(discounted) > 1:
            discounted = (discounted - np.mean(discounted)) / (np.std(discounted) + 1e-8)
        
        return discounted
    
    def _compute_policy_gradient(self, states: np.ndarray, actions: np.ndarray, 
                                rewards: np.ndarray) -> np.ndarray:
        """Compute policy gradient"""
        gradient = np.zeros_like(self.theta)
        
        for t in range(len(states)):
            state = states[t]
            action = actions[t]
            reward = rewards[t]
            
            # Get action probabilities
            probs = self.get_action_probabilities(state)
            
            # Compute gradient for this timestep
            for a in range(self.action_size):
                if a == action:
                    gradient[:, a] += reward * state * (1 - probs[a])
                else:
                    gradient[:, a] += reward * state * (-probs[a])
        
        return gradient / len(states)
    
    def save(self, filepath: str):
        """Save policy to file"""
        model_data = {
            'theta': self.theta.tolist(),
            'config': {
                'learning_rate': self.config.learning_rate,
                'discount_factor': self.config.discount_factor
            }
        }
        
        with open(filepath, 'w') as f:
            json.dump(model_data, f, indent=2)
        
        logger.info(f"Policy saved to {filepath}")
    
    def load(self, filepath: str):
        """Load policy from file"""
        with open(filepath, 'r') as f:
            model_data = json.load(f)
        
        self.theta = np.array(model_data['theta'])
        
        # Update config
        config_data = model_data['config']
        self.config.learning_rate = config_data['learning_rate']
        self.config.discount_factor = config_data['discount_factor']
        
        logger.info(f"Policy loaded from {filepath}")

class ReinforcementLearning:
    """
    Main reinforcement learning class that combines different algorithms
    """
    
    def __init__(self, algorithm: str = 'q_learning', state_size: int = 6, 
                 action_size: int = 3, config: RLConfig = None):
        """
        Initialize reinforcement learning agent
        
        Args:
            algorithm: Algorithm to use ('q_learning' or 'policy_gradient')
            state_size: Size of state space
            action_size: Size of action space
            config: RL configuration
        """
        if config is None:
            config = RLConfig()
        
        self.algorithm = algorithm
        self.config = config
        
        if algorithm == 'q_learning':
            self.agent = QLearning(state_size, action_size, config)
        elif algorithm == 'policy_gradient':
            self.agent = PolicyGradient(state_size, action_size, config)
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")
        
        logger.info(f"Reinforcement Learning initialized with {algorithm}")
    
    def train(self, simulation_function, episodes: int = 1000) -> Dict[str, List[float]]:
        """
        Train the RL agent
        
        Args:
            simulation_function: Function that runs simulation and returns results
            episodes: Number of training episodes
            
        Returns:
            Training history
        """
        history = {
            'episode_rewards': [],
            'episode_lengths': [],
            'epsilon': [] if self.algorithm == 'q_learning' else []
        }
        
        logger.info(f"Starting RL training for {episodes} episodes...")
        
        for episode in range(episodes):
            # Run episode
            episode_reward, episode_length = self._run_episode(simulation_function)
            
            # Update history
            history['episode_rewards'].append(episode_reward)
            history['episode_lengths'].append(episode_length)
            
            if self.algorithm == 'q_learning':
                history['epsilon'].append(self.agent.config.epsilon)
            
            if episode % 100 == 0:
                avg_reward = np.mean(history['episode_rewards'][-100:])
                logger.info(f"Episode {episode}: Average Reward = {avg_reward:.2f}")
        
        logger.info("RL training completed!")
        return history
    
    def _run_episode(self, simulation_function) -> Tuple[float, int]:
        """Run a single episode"""
        # This is a simplified implementation
        # In practice, you'd want to integrate with the actual game simulation
        
        episode_reward = 0
        episode_length = 0
        
        # Simulate episode
        state = np.random.randn(self.agent.state_size)
        
        for step in range(100):  # Max episode length
            action = self.agent.choose_action(state, training=True)
            
            # Run simulation step
            results = simulation_function(state, action)
            reward = results.get('reward', 0)
            next_state = results.get('next_state', state)
            done = results.get('done', False)
            
            # Store experience
            if self.algorithm == 'q_learning':
                self.agent.update_q_table(state, action, reward, next_state, done)
            elif self.algorithm == 'policy_gradient':
                self.agent.store_experience(state, action, reward)
            
            episode_reward += reward
            episode_length += 1
            
            if done:
                break
            
            state = next_state
        
        # Update policy for policy gradient
        if self.algorithm == 'policy_gradient':
            self.agent.update_policy()
        
        return episode_reward, episode_length
    
    def get_strategy(self, state: np.ndarray) -> Dict[str, float]:
        """Get strategy from current policy"""
        if self.algorithm == 'q_learning':
            action = self.agent.choose_action(state, training=False)
            # Convert action to strategy parameters
            strategy = {
                'aggression': float(action / self.agent.action_size),
                'patience': float(1.0 - action / self.agent.action_size),
                'grouping': float(0.5)
            }
        else:  # policy_gradient
            probs = self.agent.get_action_probabilities(state)
            strategy = {
                'aggression': float(probs[0]),
                'patience': float(probs[1]),
                'grouping': float(probs[2])
            }
        
        return strategy
    
    def save(self, filepath: str):
        """Save trained model"""
        self.agent.save(filepath)
    
    def load(self, filepath: str):
        """Load trained model"""
        self.agent.load(filepath)
