// OpenAI API Client for Commentary System
class OpenAIClient {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://api.openai.com/v1';
        this.model = 'gpt-3.5-turbo';
        this.maxTokens = 150;
        this.temperature = 0.8;
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
        this.isEnabled = false;
        
        // Commentary templates for fallback
        this.fallbackCommentary = {
            battleStart: [
                "The battle begins! Three teams enter, only one will emerge victorious!",
                "Here we go! The ultimate rock-paper-scissors showdown starts now!",
                "The arena is set, the teams are ready - let the battle commence!"
            ],
            conversion: [
                "Incredible conversion! The tide of battle shifts!",
                "What a move! That's going to change everything!",
                "Amazing! The battlefield is transforming before our eyes!"
            ],
            elimination: [
                "Devastating! Another team falls in this epic struggle!",
                "The numbers are dwindling - who will survive?",
                "Another casualty in this intense battle!"
            ],
            victory: [
                "Victory! What an incredible display of strategy!",
                "The winner takes all! What a spectacular finish!",
                "Champions! They've proven their dominance!"
            ],
            intense: [
                "This is getting intense! The battle rages on!",
                "What a nail-biter! Every move counts!",
                "The tension is palpable - anything could happen!"
            ]
        };
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Try to load API key from local file first
            await this.loadAPIKey();
            this.isEnabled = true;
            logger.info('OpenAI client initialized successfully');
        } catch (error) {
            logger.warn('OpenAI client initialized in fallback mode', { error: error.message });
            this.isEnabled = false;
        }
    }
    
    async loadAPIKey() {
        try {
            // Try to load from local api_key.json file
            const response = await fetch('/api_key.json');
            if (response.ok) {
                const data = await response.json();
                this.apiKey = data.apiKey;
                logger.info('OpenAI API key loaded from local file');
                return;
            }
        } catch (error) {
            logger.debug('Could not load local API key file', { error: error.message });
        }
        
        // Try to load from environment variable (for production)
        if (typeof process !== 'undefined' && process.env.OPENAI_API_KEY) {
            this.apiKey = process.env.OPENAI_API_KEY;
            logger.info('OpenAI API key loaded from environment');
            return;
        }
        
        throw new Error('No OpenAI API key found');
    }
    
    async generateCommentary(context) {
        if (!this.isEnabled) {
            return this.getFallbackCommentary(context);
        }
        
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
        }
        
        try {
            const prompt = this.buildPrompt(context);
            const commentary = await this.callOpenAI(prompt);
            this.lastRequestTime = Date.now();
            
            logger.info('Generated OpenAI commentary', { 
                context: context.type,
                length: commentary.length 
            });
            
            return commentary;
        } catch (error) {
            logger.error('OpenAI API call failed, using fallback', { 
                error: error.message,
                context: context.type 
            });
            return this.getFallbackCommentary(context);
        }
    }
    
    buildPrompt(context) {
        const basePrompt = `You are a dynamic sports commentator for a rock-paper-scissors battle royale game. 
Generate engaging, exciting commentary based on the game events. Keep it under 100 characters and make it sound like a real sports commentator.

Game Context:
- Battle Duration: ${context.battleTime || 0} seconds
- Team Counts: Rock=${context.teamCounts?.rock || 0}, Paper=${context.teamCounts?.paper || 0}, Scissors=${context.teamCounts?.scissors || 0}
- Total Conversions: ${context.totalConversions || 0}
- Event Type: ${context.type}

Commentary Style: Energetic, engaging, scientific accuracy about game theory, exciting but not overwhelming.`;

        switch (context.type) {
            case 'battleStart':
                return `${basePrompt}\n\nGenerate an exciting opening commentary for the start of the battle:`;
            
            case 'conversion':
                return `${basePrompt}\n\nGenerate commentary for a conversion event (one team converting another):`;
            
            case 'elimination':
                return `${basePrompt}\n\nGenerate commentary for when a team is eliminated:`;
            
            case 'victory':
                return `${basePrompt}\n\nGenerate victory commentary for the winning team:`;
            
            case 'intense':
                return `${basePrompt}\n\nGenerate commentary for an intense moment in the battle:`;
            
            default:
                return `${basePrompt}\n\nGenerate general commentary for this game event:`;
        }
    }
    
    async callOpenAI(prompt) {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert sports commentator specializing in rock-paper-scissors battle royale games. Generate engaging, concise commentary.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: this.maxTokens,
                temperature: this.temperature
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
    
    getFallbackCommentary(context) {
        const templates = this.fallbackCommentary[context.type] || this.fallbackCommentary.intense;
        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
    }
    
    // Method to enable/disable OpenAI integration
    setEnabled(enabled) {
        this.isEnabled = enabled;
        logger.info('OpenAI client enabled status changed', { enabled });
    }
    
    // Method to update API key
    async updateAPIKey(newKey) {
        this.apiKey = newKey;
        this.isEnabled = true;
        logger.info('OpenAI API key updated');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIClient;
}
