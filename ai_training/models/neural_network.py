"""
Neural Network for Rock Paper Scissors Strategy Learning

This module implements neural networks for learning optimal strategies
in the Rock Paper Scissors Battle Royale game.
"""

import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from dataclasses import dataclass
import json
import logging

logger = logging.getLogger(__name__)

@dataclass
class NetworkConfig:
    """Configuration for neural network"""
    input_size: int = 6  # aggression, patience, grouping, speed, vision, avoidance
    hidden_sizes: List[int] = None
    output_size: int = 3  # Rock, Paper, Scissors strategies
    learning_rate: float = 0.001
    dropout_rate: float = 0.2
    activation: str = 'relu'
    
    def __post_init__(self):
        if self.hidden_sizes is None:
            self.hidden_sizes = [64, 32]

class NeuralNetwork:
    """
    Simple neural network implementation for strategy learning
    """
    
    def __init__(self, config: NetworkConfig):
        """
        Initialize neural network
        
        Args:
            config: Network configuration
        """
        self.config = config
        self.weights = []
        self.biases = []
        self.layers = []
        
        # Initialize network architecture
        self._initialize_weights()
        
        logger.info(f"Neural network initialized with config: {config}")
    
    def _initialize_weights(self):
        """Initialize network weights and biases"""
        layer_sizes = [self.config.input_size] + self.config.hidden_sizes + [self.config.output_size]
        
        for i in range(len(layer_sizes) - 1):
            # Xavier initialization
            fan_in = layer_sizes[i]
            fan_out = layer_sizes[i + 1]
            limit = np.sqrt(6.0 / (fan_in + fan_out))
            
            weight = np.random.uniform(-limit, limit, (fan_in, fan_out))
            bias = np.zeros((fan_out,))
            
            self.weights.append(weight)
            self.biases.append(bias)
    
    def _activation(self, x: np.ndarray, activation: str = None) -> np.ndarray:
        """Apply activation function"""
        if activation is None:
            activation = self.config.activation
        
        if activation == 'relu':
            return np.maximum(0, x)
        elif activation == 'sigmoid':
            return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
        elif activation == 'tanh':
            return np.tanh(x)
        elif activation == 'linear':
            return x
        else:
            raise ValueError(f"Unknown activation function: {activation}")
    
    def _activation_derivative(self, x: np.ndarray, activation: str = None) -> np.ndarray:
        """Compute activation function derivative"""
        if activation is None:
            activation = self.config.activation
        
        if activation == 'relu':
            return (x > 0).astype(float)
        elif activation == 'sigmoid':
            s = self._activation(x, activation)
            return s * (1 - s)
        elif activation == 'tanh':
            return 1 - np.tanh(x) ** 2
        elif activation == 'linear':
            return np.ones_like(x)
        else:
            raise ValueError(f"Unknown activation function: {activation}")
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass through the network
        
        Args:
            x: Input features (batch_size, input_size)
            
        Returns:
            Output predictions (batch_size, output_size)
        """
        self.layers = [x]  # Store activations for backprop
        
        current = x
        
        # Hidden layers
        for i in range(len(self.weights) - 1):
            z = np.dot(current, self.weights[i]) + self.biases[i]
            current = self._activation(z)
            self.layers.append(current)
        
        # Output layer (no activation for regression)
        z = np.dot(current, self.weights[-1]) + self.biases[-1]
        self.layers.append(z)
        
        return z
    
    def predict(self, x: np.ndarray) -> np.ndarray:
        """
        Make predictions
        
        Args:
            x: Input features
            
        Returns:
            Predictions
        """
        return self.forward(x)
    
    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 100, 
              batch_size: int = 32, validation_split: float = 0.2) -> Dict[str, List[float]]:
        """
        Train the neural network
        
        Args:
            X: Input features (n_samples, input_size)
            y: Target values (n_samples, output_size)
            epochs: Number of training epochs
            batch_size: Batch size for training
            validation_split: Fraction of data to use for validation
            
        Returns:
            Training history
        """
        # Split data
        n_samples = X.shape[0]
        n_val = int(n_samples * validation_split)
        n_train = n_samples - n_val
        
        indices = np.random.permutation(n_samples)
        train_indices = indices[:n_train]
        val_indices = indices[n_train:]
        
        X_train, y_train = X[train_indices], y[train_indices]
        X_val, y_val = X[val_indices], y[val_indices]
        
        # Training history
        history = {
            'train_loss': [],
            'val_loss': [],
            'train_accuracy': [],
            'val_accuracy': []
        }
        
        logger.info(f"Starting training for {epochs} epochs...")
        
        for epoch in range(epochs):
            # Shuffle training data
            train_indices = np.random.permutation(n_train)
            
            epoch_train_loss = 0
            epoch_train_acc = 0
            
            # Mini-batch training
            for i in range(0, n_train, batch_size):
                batch_indices = train_indices[i:i + batch_size]
                X_batch = X_train[batch_indices]
                y_batch = y_train[batch_indices]
                
                # Forward pass
                y_pred = self.forward(X_batch)
                
                # Compute loss and accuracy
                loss = self._compute_loss(y_pred, y_batch)
                acc = self._compute_accuracy(y_pred, y_batch)
                
                epoch_train_loss += loss
                epoch_train_acc += acc
                
                # Backward pass
                self._backward_pass(y_batch)
            
            # Validation
            val_pred = self.predict(X_val)
            val_loss = self._compute_loss(val_pred, y_val)
            val_acc = self._compute_accuracy(val_pred, y_val)
            
            # Update history
            history['train_loss'].append(epoch_train_loss / (n_train // batch_size))
            history['val_loss'].append(val_loss)
            history['train_accuracy'].append(epoch_train_acc / (n_train // batch_size))
            history['val_accuracy'].append(val_acc)
            
            if epoch % 10 == 0:
                logger.info(f"Epoch {epoch}: Train Loss = {history['train_loss'][-1]:.4f}, "
                           f"Val Loss = {val_loss:.4f}, Val Acc = {val_acc:.4f}")
        
        logger.info("Training completed!")
        return history
    
    def _compute_loss(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        """Compute mean squared error loss"""
        return np.mean((y_pred - y_true) ** 2)
    
    def _compute_accuracy(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        """Compute accuracy (for classification)"""
        if y_true.ndim == 1:
            # Convert to one-hot if needed
            y_true_onehot = np.eye(self.config.output_size)[y_true.astype(int)]
        else:
            y_true_onehot = y_true
        
        predictions = np.argmax(y_pred, axis=1)
        true_labels = np.argmax(y_true_onehot, axis=1)
        
        return np.mean(predictions == true_labels)
    
    def _backward_pass(self, y_true: np.ndarray):
        """Backward pass for gradient computation"""
        # This is a simplified implementation
        # In practice, you'd want to use a proper deep learning framework
        
        # Compute output error
        y_pred = self.layers[-1]
        output_error = y_pred - y_true
        
        # Backpropagate through layers
        error = output_error
        
        for i in range(len(self.weights) - 1, -1, -1):
            # Compute gradients
            if i == len(self.weights) - 1:
                # Output layer
                grad_w = np.dot(self.layers[i].T, error)
                grad_b = np.mean(error, axis=0)
            else:
                # Hidden layers
                grad_w = np.dot(self.layers[i].T, error)
                grad_b = np.mean(error, axis=0)
                
                # Propagate error backward
                error = np.dot(error, self.weights[i].T)
                error *= self._activation_derivative(self.layers[i])
            
            # Update weights and biases
            self.weights[i] -= self.config.learning_rate * grad_w
            self.biases[i] -= self.config.learning_rate * grad_b
    
    def save(self, filepath: str):
        """Save model to file"""
        model_data = {
            'config': {
                'input_size': self.config.input_size,
                'hidden_sizes': self.config.hidden_sizes,
                'output_size': self.config.output_size,
                'learning_rate': self.config.learning_rate,
                'dropout_rate': self.config.dropout_rate,
                'activation': self.config.activation
            },
            'weights': [w.tolist() for w in self.weights],
            'biases': [b.tolist() for b in self.biases]
        }
        
        with open(filepath, 'w') as f:
            json.dump(model_data, f, indent=2)
        
        logger.info(f"Model saved to {filepath}")
    
    def load(self, filepath: str):
        """Load model from file"""
        with open(filepath, 'r') as f:
            model_data = json.load(f)
        
        # Reconstruct config
        config_data = model_data['config']
        self.config = NetworkConfig(**config_data)
        
        # Reconstruct weights and biases
        self.weights = [np.array(w) for w in model_data['weights']]
        self.biases = [np.array(b) for b in model_data['biases']]
        
        logger.info(f"Model loaded from {filepath}")
    
    def get_strategy(self, features: np.ndarray) -> Dict[str, float]:
        """
        Get strategy parameters from input features
        
        Args:
            features: Input features (aggression, patience, grouping, speed, vision, avoidance)
            
        Returns:
            Strategy parameters
        """
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        prediction = self.predict(features)
        
        # Convert prediction to strategy parameters
        strategy = {
            'aggression': float(prediction[0, 0]),
            'patience': float(prediction[0, 1]),
            'grouping': float(prediction[0, 2])
        }
        
        return strategy
