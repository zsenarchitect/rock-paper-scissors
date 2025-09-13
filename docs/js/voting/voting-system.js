// Voting System
class VotingSystem {
    constructor() {
        this.votes = [];
        this.voteCooldown = GameConfig.voting.voteCooldown;
        this.lastVoteTime = 0;
        this.maxVotesPerUser = GameConfig.voting.maxVotesPerUser;
        this.userVoteCount = 0;
        
        logger.info('Voting system initialized');
    }

    // Initialize voting system
    initialize() {
        this.loadVotes();
        this.setupEventListeners();
        logger.info('Voting system setup complete');
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for vote buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('vote-btn')) {
                const team = parseInt(event.target.dataset.team);
                this.handleVote(team);
            }
        });
    }

    // Handle vote
    handleVote(team) {
        const now = Date.now();
        
        // Check cooldown
        if (now - this.lastVoteTime < this.voteCooldown) {
            this.showVoteCooldown();
            return;
        }
        
        // Check vote limit
        if (this.userVoteCount >= this.maxVotesPerUser) {
            this.showVoteLimit();
            return;
        }
        
        // Record vote
        this.recordVote(team, 'current');
        
        // Update UI
        this.updateVoteUI();
        
        // Play vote sound
        this.playVoteSound();
        
        logger.info(`Vote recorded for team ${team}`, {
            team,
            userVoteCount: this.userVoteCount,
            totalVotes: this.votes.length
        });
    }

    // Record vote
    recordVote(team, room) {
        const vote = {
            id: this.generateVoteId(),
            team,
            room,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };
        
        this.votes.push(vote);
        this.userVoteCount++;
        this.lastVoteTime = Date.now();
        
        // Save to storage
        this.saveVotes();
        
        // Save to global storage
        storage.saveVote(team, room);
    }

    // Generate unique vote ID
    generateVoteId() {
        return `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('rps_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('rps_session_id', sessionId);
        }
        return sessionId;
    }

    // Get vote count for team
    getVoteCount(team, room = 'current') {
        return this.votes.filter(vote => vote.team === team && vote.room === room).length;
    }

    // Get total vote count
    getTotalVoteCount(room = 'current') {
        return this.votes.filter(vote => vote.room === room).length;
    }

    // Get vote statistics
    getVoteStatistics(room = 'current') {
        const roomVotes = this.votes.filter(vote => vote.room === room);
        const teamCounts = { 1: 0, 2: 0, 3: 0 };
        
        for (const vote of roomVotes) {
            teamCounts[vote.team]++;
        }
        
        const total = roomVotes.length;
        const percentages = {};
        
        for (const [team, count] of Object.entries(teamCounts)) {
            percentages[team] = total > 0 ? (count / total) * 100 : 0;
        }
        
        return {
            teamCounts,
            percentages,
            total,
            room
        };
    }

    // Update vote UI
    updateVoteUI() {
        // Update vote buttons with counts
        document.querySelectorAll('.vote-btn').forEach(btn => {
            const team = parseInt(btn.dataset.team);
            const count = this.getVoteCount(team);
            
            if (count > 0) {
                btn.textContent = `Add Soldier to Team ${team} (${count})`;
            }
        });
        
        // Update vote statistics display
        this.updateVoteStatisticsDisplay();
    }

    // Update vote statistics display
    updateVoteStatisticsDisplay() {
        const stats = this.getVoteStatistics();
        
        // Create or update vote statistics element
        let statsElement = document.getElementById('vote-statistics');
        if (!statsElement) {
            statsElement = document.createElement('div');
            statsElement.id = 'vote-statistics';
            statsElement.className = 'vote-statistics';
            document.querySelector('.voting-panel').appendChild(statsElement);
        }
        
        statsElement.innerHTML = `
            <div class="vote-stats">
                <div class="vote-stat">
                    <span class="label">Total Votes:</span>
                    <span class="value">${stats.total}</span>
                </div>
                <div class="vote-stat">
                    <span class="label">Your Votes:</span>
                    <span class="value">${this.userVoteCount}/${this.maxVotesPerUser}</span>
                </div>
            </div>
        `;
    }

    // Show vote cooldown message
    showVoteCooldown() {
        const remainingTime = Math.ceil((this.voteCooldown - (Date.now() - this.lastVoteTime)) / 1000);
        this.showMessage(`Please wait ${remainingTime} seconds before voting again.`, 'warning');
        this.playErrorSound();
    }

    // Show vote limit message
    showVoteLimit() {
        this.showMessage(`You have reached the maximum vote limit of ${this.maxVotesPerUser} votes.`, 'error');
        this.playErrorSound();
    }

    // Play error sound
    playErrorSound() {
        if (typeof audioManager !== 'undefined') {
            audioManager.playErrorSound();
        }
    }

    // Show message
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `vote-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'warning':
                messageDiv.style.backgroundColor = '#ff9800';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#f44336';
                break;
            default:
                messageDiv.style.backgroundColor = '#4caf50';
        }
        
        document.body.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // Play vote sound
    playVoteSound() {
        if (typeof audioManager !== 'undefined') {
            audioManager.playVoteSound();
        }
    }

    // Load votes from storage
    loadVotes() {
        const savedVotes = storage.getVotes();
        this.votes = savedVotes || [];
        
        // Count user votes for current session
        const sessionId = this.getSessionId();
        this.userVoteCount = this.votes.filter(vote => vote.sessionId === sessionId).length;
        
        logger.info('Votes loaded from storage', {
            totalVotes: this.votes.length,
            userVoteCount: this.userVoteCount
        });
    }

    // Save votes to storage
    saveVotes() {
        storage.setLocal('votes', this.votes);
    }

    // Clear all votes
    clearVotes() {
        this.votes = [];
        this.userVoteCount = 0;
        this.saveVotes();
        this.updateVoteUI();
        
        logger.info('All votes cleared');
    }

    // Export votes
    exportVotes() {
        const data = {
            votes: this.votes,
            statistics: this.getVoteStatistics(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `votes-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        logger.info('Votes exported');
    }

    // Get voting analytics
    getVotingAnalytics() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;
        
        const recentVotes = this.votes.filter(vote => now - vote.timestamp < oneHour);
        const dailyVotes = this.votes.filter(vote => now - vote.timestamp < oneDay);
        
        return {
            totalVotes: this.votes.length,
            recentVotes: recentVotes.length,
            dailyVotes: dailyVotes.length,
            userVoteCount: this.userVoteCount,
            maxVotesPerUser: this.maxVotesPerUser,
            voteCooldown: this.voteCooldown
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VotingSystem;
}
