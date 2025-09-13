// Storage Utility
class Storage {
    constructor() {
        this.prefix = 'rps_battle_';
    }

    // Local Storage methods
    setLocal(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            logger.debug(`Stored in localStorage: ${key}`, value);
        } catch (error) {
            logger.error('Failed to store in localStorage', { key, error });
        }
    }

    getLocal(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            logger.error('Failed to retrieve from localStorage', { key, error });
            return defaultValue;
        }
    }

    removeLocal(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            logger.debug(`Removed from localStorage: ${key}`);
        } catch (error) {
            logger.error('Failed to remove from localStorage', { key, error });
        }
    }

    // Session Storage methods
    setSession(key, value) {
        try {
            const serialized = JSON.stringify(value);
            sessionStorage.setItem(this.prefix + key, serialized);
            logger.debug(`Stored in sessionStorage: ${key}`, value);
        } catch (error) {
            logger.error('Failed to store in sessionStorage', { key, error });
        }
    }

    getSession(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(this.prefix + key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            logger.error('Failed to retrieve from sessionStorage', { key, error });
            return defaultValue;
        }
    }

    removeSession(key) {
        try {
            sessionStorage.removeItem(this.prefix + key);
            logger.debug(`Removed from sessionStorage: ${key}`);
        } catch (error) {
            logger.error('Failed to remove from sessionStorage', { key, error });
        }
    }

    // Battle data methods
    saveBattle(battleData) {
        const battles = this.getLocal('battles', []);
        battles.push({
            ...battleData,
            id: this.generateId(),
            timestamp: new Date().toISOString()
        });
        this.setLocal('battles', battles);
        logger.info('Battle saved', battleData);
    }

    getBattles() {
        return this.getLocal('battles', []);
    }

    getBattle(id) {
        const battles = this.getBattles();
        return battles.find(battle => battle.id === id);
    }

    // User preferences
    savePreferences(preferences) {
        this.setLocal('preferences', preferences);
        logger.info('Preferences saved', preferences);
    }

    getPreferences() {
        return this.getLocal('preferences', {
            soundEnabled: true,
            showDebugOverlay: false,
            preferredRoom: 'restaurant',
            voteCount: 0
        });
    }

    // Voting data
    saveVote(team, room) {
        const votes = this.getLocal('votes', []);
        votes.push({
            team,
            room,
            timestamp: new Date().toISOString()
        });
        this.setLocal('votes', votes);
        logger.info('Vote saved', { team, room });
    }

    getVotes() {
        return this.getLocal('votes', []);
    }

    getVoteCount(team, room) {
        const votes = this.getVotes();
        return votes.filter(vote => vote.team === team && vote.room === room).length;
    }

    // Analytics data
    saveAnalytics(event, data) {
        const analytics = this.getLocal('analytics', []);
        analytics.push({
            event,
            data,
            timestamp: new Date().toISOString()
        });
        this.setLocal('analytics', analytics);
        logger.debug('Analytics saved', { event, data });
    }

    getAnalytics() {
        return this.getLocal('analytics', []);
    }

    // Clear all data
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            logger.info('All data cleared');
        } catch (error) {
            logger.error('Failed to clear all data', error);
        }
    }

    // Export data
    exportData() {
        const data = {
            battles: this.getBattles(),
            votes: this.getVotes(),
            analytics: this.getAnalytics(),
            preferences: this.getPreferences(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `battle-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        logger.info('Data exported');
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Create global storage instance
const storage = new Storage();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
