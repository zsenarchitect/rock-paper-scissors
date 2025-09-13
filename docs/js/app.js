// Main Application
class App {
    constructor() {
        this.gameEngine = null;
        this.votingSystem = null;
        this.roomManager = null;
        this.currentRoom = 'restaurant';
        this.isInitialized = false;
        
        // UI elements
        this.canvas = null;
        this.teamCountElements = {};
        this.battleTimeElement = null;
        this.totalConversionsElement = null;
        this.activePlayersElement = null;
        
        // Charts
        this.pieChart = null;
        this.trendChart = null;
        
        logger.info('App initialized');
    }

    // Initialize the application
    async initialize() {
        try {
            logger.info('Initializing application...');
            
            // Get UI elements
            this.canvas = document.getElementById('gameCanvas');
            this.teamCountElements = {
                1: document.getElementById('team1-count'),
                2: document.getElementById('team2-count'),
                3: document.getElementById('team3-count')
            };
            this.battleTimeElement = document.getElementById('battle-time');
            this.totalConversionsElement = document.getElementById('total-conversions');
            this.activePlayersElement = document.getElementById('active-players');
            
            // Initialize game engine
            this.gameEngine = new GameEngine(this.canvas);
            if (!this.gameEngine.initialize()) {
                throw new Error('Failed to initialize game engine');
            }
            
            // Setup game engine callbacks
            this.setupGameEngineCallbacks();
            
            // Initialize voting system
            this.votingSystem = new VotingSystem();
            this.votingSystem.initialize();
            
            // Initialize room manager
            this.roomManager = new RoomManager();
            this.roomManager.initialize();
            
            // Initialize charts
            this.initializeCharts();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load saved preferences
            this.loadPreferences();
            
            this.isInitialized = true;
            logger.info('Application initialized successfully');
            
            // Start the game
            this.startGame();
            
        } catch (error) {
            logger.error('Failed to initialize application', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    // Setup game engine callbacks
    setupGameEngineCallbacks() {
        this.gameEngine.onBattleStart = () => {
            logger.info('Battle started');
            this.updateUI();
        };
        
        this.gameEngine.onBattleEnd = (stats) => {
            logger.info('Battle ended', stats);
            this.handleBattleEnd(stats);
        };
        
        this.gameEngine.onEntityConverted = (winner, loser) => {
            logger.debug('Entity converted', { winner: winner.id, loser: loser.id });
            this.updateUI();
        };
        
        this.gameEngine.onEntityDied = (entity) => {
            logger.debug('Entity died', { entity: entity.id });
            this.updateUI();
        };
    }

    // Initialize charts
    initializeCharts() {
        // Initialize pie chart
        const pieCanvas = document.getElementById('pieChart');
        if (pieCanvas) {
            this.pieChart = new PieChart(pieCanvas);
        }
        
        // Initialize trend chart
        const trendCanvas = document.getElementById('trendChart');
        if (trendCanvas) {
            this.trendChart = new TrendChart(trendCanvas);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Room selection
        document.querySelectorAll('.room-card').forEach(card => {
            card.addEventListener('click', (event) => {
                const room = event.currentTarget.dataset.room;
                this.selectRoom(room);
            });
        });
        
        // Vote buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const team = parseInt(event.currentTarget.dataset.team);
                this.voteForTeam(team);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboard(event);
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.savePreferences();
        });
        
        // Resize events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    // Start the game
    startGame() {
        if (!this.isInitialized) {
            logger.warn('Cannot start game: app not initialized');
            return;
        }
        
        logger.info('Starting game...');
        
        try {
            this.gameEngine.start();
            
            // Verify entities were created
            setTimeout(() => {
                const entityCount = this.gameEngine.entities.size;
                logger.info(`Game started - Entity count: ${entityCount}`);
                
                if (entityCount === 0) {
                    logger.error('No entities created! Attempting to create manually...');
                    this.gameEngine.createInitialEntities();
                }
                
                // Update UI to show initial state
                this.updateUI();
            }, 100);
            
        } catch (error) {
            logger.error('Failed to start game', error);
            this.showError('Failed to start game. Please refresh the page.');
            return;
        }
        
        // Start UI update loop
        this.startUIUpdateLoop();
    }

    // Start UI update loop with throttling
    startUIUpdateLoop() {
        let lastUIUpdate = 0;
        const UI_UPDATE_INTERVAL = 100; // Update UI every 100ms instead of every frame
        
        const updateUI = () => {
            if (this.gameEngine && this.gameEngine.isRunning) {
                const now = Date.now();
                if (now - lastUIUpdate >= UI_UPDATE_INTERVAL) {
                    this.updateUI();
                    lastUIUpdate = now;
                }
                requestAnimationFrame(updateUI);
            }
        };
        
        updateUI();
    }

    // Update UI elements
    updateUI() {
        if (!this.gameEngine) return;
        
        const gameState = this.gameEngine.getGameState();
        const stats = gameState.battleStats;
        
        // Update team counts
        for (let team = 1; team <= 3; team++) {
            const element = this.teamCountElements[team];
            if (element) {
                const countElement = element.querySelector('.count');
                if (countElement) {
                    countElement.textContent = stats.teamCounts[team] || 0;
                }
            }
        }
        
        // Update battle time
        if (this.battleTimeElement) {
            const minutes = Math.floor(stats.battleTime / 60000);
            const seconds = Math.floor((stats.battleTime % 60000) / 1000);
            this.battleTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update total conversions
        if (this.totalConversionsElement) {
            this.totalConversionsElement.textContent = stats.totalConversions;
        }
        
        // Update active players
        if (this.activePlayersElement) {
            this.activePlayersElement.textContent = stats.activePlayers;
        }
        
        // Update charts
        this.updateCharts(stats);
    }

    // Update charts
    updateCharts(stats) {
        if (this.pieChart) {
            const data = [
                { name: 'Team 1', value: stats.teamCounts[1] || 0, color: '#ff6b6b' },
                { name: 'Team 2', value: stats.teamCounts[2] || 0, color: '#4ecdc4' },
                { name: 'Team 3', value: stats.teamCounts[3] || 0, color: '#45b7d1' }
            ];
            this.pieChart.updateData(data);
        }
        
        if (this.trendChart) {
            this.trendChart.addDataPoint(stats.battleTime, stats.teamCounts);
        }
    }

    // Select room
    selectRoom(room) {
        logger.info(`Room selected: ${room}`);
        this.currentRoom = room;
        
        // Update room selection UI
        document.querySelectorAll('.room-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-room="${room}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Update game theme
        this.updateGameTheme(room);
    }

    // Update game theme
    updateGameTheme(room) {
        const themes = GameConfig.rooms.themes;
        const theme = themes[room];
        
        if (theme) {
            // Update team names and colors
            for (let team = 1; team <= 3; team++) {
                const element = this.teamCountElements[team];
                if (element) {
                    const nameElement = element.querySelector('.team-name');
                    if (nameElement) {
                        nameElement.textContent = theme.teams[team - 1] || `Team ${team}`;
                    }
                }
            }
            
            // Update vote buttons
            document.querySelectorAll('.vote-btn').forEach((btn, index) => {
                const team = index + 1;
                btn.textContent = `Add Soldier to ${theme.teams[team - 1] || `Team ${team}`}`;
                btn.style.backgroundColor = theme.colors[team - 1] || '#999999';
            });
        }
    }

    // Vote for team
    voteForTeam(team) {
        if (!this.votingSystem) return;
        
        logger.info(`Vote for team ${team}`);
        
        // Add soldier to team
        this.addSoldierToTeam(team);
        
        // Update voting system
        this.votingSystem.recordVote(team, this.currentRoom);
        
        // Play vote sound
        this.playVoteSound();
    }

    // Add soldier to team
    addSoldierToTeam(team) {
        if (!this.gameEngine) return;
        
        const symbols = GameConfig.game.symbols;
        const symbol = symbols[team - 1];
        
        const entity = new BaseEntity(
            `${symbol.toLowerCase()}_${team}_${Date.now()}`,
            symbol,
            this.gameEngine.getRandomPosition(),
            team
        );
        
        this.gameEngine.addEntity(entity);
        
        logger.info(`Soldier added to team ${team}`, { entity: entity.id });
    }

    // Play vote sound
    playVoteSound() {
        if (typeof audioManager !== 'undefined') {
            audioManager.playVoteSound();
        }
    }

    // Handle battle end
    handleBattleEnd(stats) {
        const winner = this.getWinner(stats);
        
        logger.info('Battle ended', { winner, stats });
        
        // Show winner announcement
        this.showWinnerAnnouncement(winner);
        
        // Save battle data
        this.saveBattleData(stats);
        
        // Reset game after delay
        setTimeout(() => {
            this.resetGame();
        }, 5000);
    }

    // Get winner from stats
    getWinner(stats) {
        const teamCounts = stats.teamCounts;
        let maxCount = 0;
        let winner = null;
        
        for (const [team, count] of Object.entries(teamCounts)) {
            if (count > maxCount) {
                maxCount = count;
                winner = parseInt(team);
            }
        }
        
        return winner;
    }

    // Show winner announcement
    showWinnerAnnouncement(winner) {
        const themes = GameConfig.rooms.themes;
        const theme = themes[this.currentRoom];
        const winnerName = theme ? theme.teams[winner - 1] : `Team ${winner}`;
        
        // Create winner overlay
        const overlay = document.createElement('div');
        overlay.className = 'winner-overlay';
        overlay.innerHTML = `
            <div class="winner-content">
                <h2>🎉 ${winnerName} Wins! 🎉</h2>
                <p>Battle Complete</p>
            </div>
        `;
        
        // Style the overlay
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            color: white;
            font-size: 2rem;
            text-align: center;
        `;
        
        document.body.appendChild(overlay);
        
        // Remove overlay after 5 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 5000);
    }

    // Save battle data
    saveBattleData(stats) {
        const battleData = {
            room: this.currentRoom,
            winner: this.getWinner(stats),
            duration: stats.battleTime,
            totalConversions: stats.totalConversions,
            finalTeamCounts: stats.teamCounts,
            timestamp: new Date().toISOString()
        };
        
        storage.saveBattle(battleData);
    }

    // Reset game
    resetGame() {
        logger.info('Resetting game...');
        this.gameEngine.reset();
        this.startGame();
    }

    // Handle keyboard events
    handleKeyboard(event) {
        switch (event.key) {
            case ' ':
                event.preventDefault();
                this.gameEngine.pause();
                break;
            case 'r':
                event.preventDefault();
                this.resetGame();
                break;
            case '1':
            case '2':
            case '3':
                event.preventDefault();
                this.voteForTeam(parseInt(event.key));
                break;
        }
    }

    // Handle window resize
    handleResize() {
        // Update canvas size if needed
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }
    }

    // Load preferences
    loadPreferences() {
        const preferences = storage.getPreferences();
        
        // Apply preferences
        if (preferences.soundEnabled !== undefined) {
            GameConfig.audio.enabled = preferences.soundEnabled;
        }
        
        if (preferences.showDebugOverlay !== undefined) {
            GameConfig.debug.enabled = preferences.showDebugOverlay;
        }
        
        if (preferences.preferredRoom) {
            this.selectRoom(preferences.preferredRoom);
        }
    }

    // Save preferences
    savePreferences() {
        const preferences = {
            soundEnabled: GameConfig.audio.enabled,
            showDebugOverlay: GameConfig.debug.enabled,
            preferredRoom: this.currentRoom,
            voteCount: storage.getVotes().length
        };
        
        storage.savePreferences(preferences);
    }

    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 1000;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
