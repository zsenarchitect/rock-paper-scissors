// Room Manager
class RoomManager {
    constructor() {
        this.currentRoom = 'restaurant';
        this.rooms = new Map();
        this.roomHistory = [];
        this.maxHistorySize = 10;
        
        logger.info('Room manager initialized');
    }

    // Initialize room manager
    initialize() {
        this.setupRooms();
        this.setupEventListeners();
        this.loadRoomHistory();
        
        logger.info('Room manager setup complete');
    }

    // Setup available rooms
    setupRooms() {
        const themes = GameConfig.rooms.themes;
        
        for (const [key, theme] of Object.entries(themes)) {
            this.rooms.set(key, {
                id: key,
                name: theme.name,
                teams: theme.teams,
                colors: theme.colors,
                sprites: theme.sprites,
                isActive: false,
                battleCount: 0,
                lastBattle: null,
                totalVotes: 0
            });
        }
        
        logger.info('Rooms setup complete', Array.from(this.rooms.keys()));
    }

    // Setup event listeners
    setupEventListeners() {
        // Room selection
        document.addEventListener('click', (event) => {
            if (event.target.closest('.room-card')) {
                const roomCard = event.target.closest('.room-card');
                const roomId = roomCard.dataset.room;
                this.selectRoom(roomId);
            }
        });
    }

    // Select room
    selectRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            logger.warn(`Unknown room: ${roomId}`);
            return;
        }
        
        // Update current room
        this.currentRoom = roomId;
        
        // Update room states
        for (const [id, room] of this.rooms) {
            room.isActive = (id === roomId);
        }
        
        // Update UI
        this.updateRoomUI();
        
        // Save to history
        this.addToHistory(roomId);
        
        // Save preferences
        storage.setLocal('currentRoom', roomId);
        
        logger.info(`Room selected: ${roomId}`, {
            room: this.rooms.get(roomId),
            history: this.roomHistory
        });
    }

    // Update room UI
    updateRoomUI() {
        // Update room cards
        document.querySelectorAll('.room-card').forEach(card => {
            const roomId = card.dataset.room;
            const room = this.rooms.get(roomId);
            
            if (room) {
                // Update status
                const statusElement = card.querySelector('.room-status');
                if (statusElement) {
                    statusElement.textContent = room.isActive ? 'Active' : 'Available';
                    statusElement.className = `room-status ${room.isActive ? 'active' : 'available'}`;
                }
                
                // Update battle count
                const battleCountElement = card.querySelector('.battle-count');
                if (battleCountElement) {
                    battleCountElement.textContent = `${room.battleCount} battles`;
                } else if (room.battleCount > 0) {
                    const countDiv = document.createElement('div');
                    countDiv.className = 'battle-count';
                    countDiv.textContent = `${room.battleCount} battles`;
                    card.appendChild(countDiv);
                }
            }
        });
        
        // Update team names in game
        this.updateGameTheme();
    }

    // Update game theme based on current room
    updateGameTheme() {
        const room = this.rooms.get(this.currentRoom);
        if (!room) return;
        
        // Update team count elements
        for (let team = 1; team <= 3; team++) {
            const element = document.getElementById(`team${team}-count`);
            if (element) {
                const nameElement = element.querySelector('.team-name');
                if (nameElement) {
                    nameElement.textContent = room.teams[team - 1] || `Team ${team}`;
                }
            }
        }
        
        // Update vote buttons
        document.querySelectorAll('.vote-btn').forEach((btn, index) => {
            const team = index + 1;
            btn.textContent = `Add Soldier to ${room.teams[team - 1] || `Team ${team}`}`;
            btn.style.backgroundColor = room.colors[team - 1] || '#999999';
        });
        
        logger.info('Game theme updated', { room: this.currentRoom, theme: room });
    }

    // Add room to history
    addToHistory(roomId) {
        const timestamp = Date.now();
        const historyEntry = { roomId, timestamp };
        
        // Remove existing entry if it exists
        this.roomHistory = this.roomHistory.filter(entry => entry.roomId !== roomId);
        
        // Add to beginning
        this.roomHistory.unshift(historyEntry);
        
        // Limit history size
        if (this.roomHistory.length > this.maxHistorySize) {
            this.roomHistory = this.roomHistory.slice(0, this.maxHistorySize);
        }
        
        // Save history
        this.saveRoomHistory();
    }

    // Load room history
    loadRoomHistory() {
        const saved = storage.getLocal('roomHistory', []);
        this.roomHistory = saved;
        
        logger.info('Room history loaded', { history: this.roomHistory });
    }

    // Save room history
    saveRoomHistory() {
        storage.setLocal('roomHistory', this.roomHistory);
    }

    // Get current room
    getCurrentRoom() {
        return this.rooms.get(this.currentRoom);
    }

    // Get room by ID
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    // Get all rooms
    getAllRooms() {
        return Array.from(this.rooms.values());
    }

    // Get room statistics
    getRoomStatistics() {
        const stats = {};
        
        for (const [id, room] of this.rooms) {
            stats[id] = {
                name: room.name,
                battleCount: room.battleCount,
                totalVotes: room.totalVotes,
                lastBattle: room.lastBattle,
                isActive: room.isActive
            };
        }
        
        return stats;
    }

    // Update room statistics
    updateRoomStatistics(roomId, stats) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        if (stats.battleCount !== undefined) {
            room.battleCount = stats.battleCount;
        }
        
        if (stats.totalVotes !== undefined) {
            room.totalVotes = stats.totalVotes;
        }
        
        if (stats.lastBattle !== undefined) {
            room.lastBattle = stats.lastBattle;
        }
        
        logger.info('Room statistics updated', { roomId, stats });
    }

    // Create custom room
    createCustomRoom(name, teams, colors, sprites) {
        const roomId = `custom_${Date.now()}`;
        const room = {
            id: roomId,
            name,
            teams,
            colors,
            sprites,
            isActive: false,
            battleCount: 0,
            lastBattle: null,
            totalVotes: 0,
            isCustom: true
        };
        
        this.rooms.set(roomId, room);
        
        logger.info('Custom room created', { roomId, room });
        
        return roomId;
    }

    // Delete custom room
    deleteCustomRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.isCustom) {
            logger.warn(`Cannot delete room: ${roomId}`);
            return false;
        }
        
        this.rooms.delete(roomId);
        
        // If this was the current room, switch to default
        if (this.currentRoom === roomId) {
            this.selectRoom('restaurant');
        }
        
        logger.info('Custom room deleted', { roomId });
        
        return true;
    }

    // Get room history
    getRoomHistory() {
        return this.roomHistory;
    }

    // Clear room history
    clearRoomHistory() {
        this.roomHistory = [];
        this.saveRoomHistory();
        
        logger.info('Room history cleared');
    }

    // Export room data
    exportRoomData() {
        const data = {
            rooms: Array.from(this.rooms.entries()),
            currentRoom: this.currentRoom,
            history: this.roomHistory,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rooms-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        logger.info('Room data exported');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoomManager;
}
