// Battle API
class BattleAPI {
    constructor() {
        this.baseUrl = window.location.origin;
        this.apiEndpoint = '/api/battle';
        this.isOnline = navigator.onLine;
        
        // Setup online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            logger.info('Connection restored');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            logger.warn('Connection lost');
        });
        
        logger.info('Battle API initialized');
    }

    // Start new battle
    async startBattle(config) {
        const battleData = {
            room: config.room || 'restaurant',
            teams: config.teams || ['Team 1', 'Team 2', 'Team 3'],
            duration: config.duration || 300000, // 5 minutes
            maxEntities: config.maxEntities || 120,
            timestamp: Date.now()
        };
        
        try {
            if (this.isOnline) {
                const response = await this.makeRequest('POST', '/start', battleData);
                logger.info('Battle started via API', response);
                return response;
            } else {
                // Offline mode - store locally
                const battleId = this.generateBattleId();
                const localBattle = { ...battleData, id: battleId, status: 'local' };
                storage.setLocal('currentBattle', localBattle);
                logger.info('Battle started locally', localBattle);
                return localBattle;
            }
        } catch (error) {
            logger.error('Failed to start battle', error);
            throw error;
        }
    }

    // Get battle status
    async getBattleStatus(battleId) {
        try {
            if (this.isOnline) {
                const response = await this.makeRequest('GET', `/${battleId}/status`);
                return response;
            } else {
                // Offline mode - get from local storage
                const battle = storage.getLocal('currentBattle');
                return battle || { status: 'not_found' };
            }
        } catch (error) {
            logger.error('Failed to get battle status', error);
            throw error;
        }
    }

    // Update battle statistics
    async updateBattleStats(battleId, stats) {
        const updateData = {
            battleId,
            stats,
            timestamp: Date.now()
        };
        
        try {
            if (this.isOnline) {
                const response = await this.makeRequest('PUT', `/${battleId}/stats`, updateData);
                logger.debug('Battle stats updated via API', response);
                return response;
            } else {
                // Offline mode - store locally
                const battle = storage.getLocal('currentBattle');
                if (battle) {
                    battle.stats = stats;
                    battle.lastUpdate = Date.now();
                    storage.setLocal('currentBattle', battle);
                }
                logger.debug('Battle stats updated locally', updateData);
                return updateData;
            }
        } catch (error) {
            logger.error('Failed to update battle stats', error);
            throw error;
        }
    }

    // End battle
    async endBattle(battleId, finalStats) {
        const endData = {
            battleId,
            finalStats,
            endTime: Date.now()
        };
        
        try {
            if (this.isOnline) {
                const response = await this.makeRequest('POST', `/${battleId}/end`, endData);
                logger.info('Battle ended via API', response);
                return response;
            } else {
                // Offline mode - save to history
                const battle = storage.getLocal('currentBattle');
                if (battle) {
                    battle.finalStats = finalStats;
                    battle.endTime = Date.now();
                    battle.status = 'completed';
                    
                    // Save to battle history
                    const battles = storage.getLocal('battles', []);
                    battles.push(battle);
                    storage.setLocal('battles', battles);
                    
                    // Clear current battle
                    storage.removeLocal('currentBattle');
                }
                logger.info('Battle ended locally', endData);
                return endData;
            }
        } catch (error) {
            logger.error('Failed to end battle', error);
            throw error;
        }
    }

    // Get battle history
    async getBattleHistory(limit = 10) {
        try {
            if (this.isOnline) {
                const response = await this.makeRequest('GET', `/history?limit=${limit}`);
                return response;
            } else {
                // Offline mode - get from local storage
                const battles = storage.getLocal('battles', []);
                return battles.slice(-limit);
            }
        } catch (error) {
            logger.error('Failed to get battle history', error);
            throw error;
        }
    }

    // Submit vote
    async submitVote(battleId, team, room) {
        const voteData = {
            battleId,
            team,
            room,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        try {
            if (this.isOnline) {
                const response = await this.makeRequest('POST', `/${battleId}/vote`, voteData);
                logger.debug('Vote submitted via API', response);
                return response;
            } else {
                // Offline mode - store locally
                const votes = storage.getLocal('pendingVotes', []);
                votes.push(voteData);
                storage.setLocal('pendingVotes', votes);
                logger.debug('Vote stored locally', voteData);
                return voteData;
            }
        } catch (error) {
            logger.error('Failed to submit vote', error);
            throw error;
        }
    }

    // Sync offline data
    async syncOfflineData() {
        if (!this.isOnline) {
            logger.warn('Cannot sync: offline');
            return;
        }
        
        try {
            // Sync pending votes
            const pendingVotes = storage.getLocal('pendingVotes', []);
            if (pendingVotes.length > 0) {
                for (const vote of pendingVotes) {
                    await this.submitVote(vote.battleId, vote.team, vote.room);
                }
                storage.removeLocal('pendingVotes');
                logger.info('Pending votes synced', { count: pendingVotes.length });
            }
            
            // Sync battle data
            const localBattles = storage.getLocal('battles', []);
            if (localBattles.length > 0) {
                // Send recent battles to server
                const recentBattles = localBattles.slice(-5);
                await this.makeRequest('POST', '/sync', { battles: recentBattles });
                logger.info('Battle data synced', { count: recentBattles.length });
            }
            
        } catch (error) {
            logger.error('Failed to sync offline data', error);
            throw error;
        }
    }

    // Make HTTP request
    async makeRequest(method, endpoint, data = null) {
        const url = `${this.baseUrl}${this.apiEndpoint}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    // Generate unique battle ID
    generateBattleId() {
        return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get API status
    getStatus() {
        return {
            isOnline: this.isOnline,
            baseUrl: this.baseUrl,
            apiEndpoint: this.apiEndpoint
        };
    }

    // Test API connection
    async testConnection() {
        try {
            const response = await this.makeRequest('GET', '/health');
            logger.info('API connection test successful', response);
            return true;
        } catch (error) {
            logger.warn('API connection test failed', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleAPI;
}
