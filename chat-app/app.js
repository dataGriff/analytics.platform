// Chat App Main Application Logic

class ChatApp {
    constructor() {
        this.analytics = new ChatAnalytics('http://localhost:3001', '1.0.0');
        this.conversations = new Map();
        this.currentConversation = null;
        this.messageCount = 0;
        this.userId = this.getOrCreateUserId();
        this.botResponses = this.initBotResponses();
        
        this.init();
    }

    getOrCreateUserId() {
        let userId = localStorage.getItem('chat-user-id');
        if (!userId) {
            userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('chat-user-id', userId);
        }
        return userId;
    }

    initBotResponses() {
        return {
            'help': {
                text: "I'm here to help! You can ask me about analytics, view your conversation history, or use the quick action buttons.",
                intent: 'help',
                confidence: 0.95
            },
            'status': {
                text: "All systems operational! Analytics platform is tracking your interactions in real-time. Check the dashboard for detailed insights.",
                intent: 'status',
                confidence: 0.98
            },
            'feedback': {
                text: "We'd love to hear your feedback! This demo showcases how chat interactions are tracked and analyzed across different channels.",
                intent: 'feedback',
                confidence: 0.92
            },
            'support': {
                text: "For support, visit our documentation or check the Grafana dashboard to see how your events are being processed.",
                intent: 'support',
                confidence: 0.94
            },
            'default': {
                text: "Thanks for your message! This is a demo bot to showcase analytics tracking. Try the quick action buttons or check the analytics panel on the right.",
                intent: 'general',
                confidence: 0.85
            }
        };
    }

    init() {
        // Track app load
        this.analytics.trackAppLoad();

        // Initialize UI elements
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.chatMessages = document.getElementById('chat-messages');
        this.conversationsList = document.getElementById('conversations-list');
        this.newConversationBtn = document.getElementById('new-conversation-btn');
        this.quickActionBtns = document.querySelectorAll('.quick-btn');
        this.typingIndicator = document.getElementById('typing-indicator');

        // Set up event listeners
        this.setupEventListeners();

        // Create initial conversation
        this.createNewConversation();

        // Start session duration counter
        this.startSessionCounter();

        // Load event history
        this.updateEventDisplay();
    }

    setupEventListeners() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Track typing
        let typingTimeout;
        this.chatInput.addEventListener('input', () => {
            if (this.currentConversation) {
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    this.analytics.trackTypingStart(this.currentConversation.id);
                }, 500);
            }
        });

        // New conversation button
        this.newConversationBtn.addEventListener('click', () => this.createNewConversation());

        // Quick action buttons
        this.quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // Analytics event listener
        window.addEventListener('analytics-event', () => {
            this.updateEventDisplay();
            this.updateStats();
        });
    }

    createNewConversation() {
        const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const conversation = {
            id: conversationId,
            title: `Conversation ${this.conversations.size + 1}`,
            messages: [],
            startTime: Date.now(),
            messageCount: 0
        };

        this.conversations.set(conversationId, conversation);
        this.addConversationToList(conversation);
        this.switchToConversation(conversationId);
        
        // Track new conversation
        this.analytics.trackNewConversation(conversationId);
        this.analytics.trackConversationStart(conversationId, 'user_initiated');

        // Add welcome message
        this.addBotMessage(
            "👋 Hello! I'm your analytics demo bot. Send me a message or use the quick actions below to see how events are tracked!",
            'welcome',
            1.0
        );
    }

    addConversationToList(conversation) {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        conversationItem.setAttribute('data-conversation-id', conversation.id);
        conversationItem.innerHTML = `
            <div class="conversation-title">${conversation.title}</div>
            <div class="conversation-preview">Start chatting...</div>
        `;

        conversationItem.addEventListener('click', () => {
            this.switchToConversation(conversation.id);
        });

        this.conversationsList.appendChild(conversationItem);
    }

    switchToConversation(conversationId) {
        if (this.currentConversation && this.currentConversation.id !== conversationId) {
            // Track conversation switch
            this.analytics.trackConversationSwitch(this.currentConversation.id, conversationId);
        }

        this.currentConversation = this.conversations.get(conversationId);
        
        // Update UI
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-conversation-id="${conversationId}"]`)?.classList.add('active');

        // Show chat interface
        document.getElementById('chat-welcome').style.display = 'none';
        document.getElementById('chat-active').style.display = 'flex';

        // Render messages
        this.renderMessages();
        
        // Focus input
        this.chatInput.focus();

        // Update stats
        this.updateStats();
    }

    renderMessages() {
        this.chatMessages.innerHTML = '';
        this.currentConversation.messages.forEach(msg => {
            this.renderMessage(msg);
        });
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.innerHTML = `
            <div class="message-content">${message.text}</div>
            <div class="message-time">${this.formatTime(message.timestamp)}</div>
        `;
        this.chatMessages.appendChild(messageDiv);
    }

    async sendMessage() {
        const text = this.chatInput.value.trim();
        if (!text || !this.currentConversation) return;

        // Add user message
        const userMessage = {
            type: 'user',
            text: text,
            timestamp: Date.now()
        };
        this.currentConversation.messages.push(userMessage);
        this.currentConversation.messageCount++;
        this.renderMessage(userMessage);
        this.scrollToBottom();

        // Clear input
        this.chatInput.value = '';
        this.messageCount++;

        // Track message sent
        await this.analytics.trackMessageSent(this.currentConversation.id, text, this.userId);

        // Update conversation preview
        this.updateConversationPreview(this.currentConversation.id, text);

        // Show typing indicator
        this.typingIndicator.style.display = 'flex';

        // Simulate bot response
        setTimeout(() => {
            this.typingIndicator.style.display = 'none';
            this.generateBotResponse(text);
        }, 1000 + Math.random() * 1000);
    }

    async generateBotResponse(userMessage) {
        let response = this.botResponses.default;

        // Simple intent matching
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('help')) {
            response = this.botResponses.help;
        } else if (lowerMessage.includes('status') || lowerMessage.includes('how are you')) {
            response = this.botResponses.status;
        } else if (lowerMessage.includes('feedback')) {
            response = this.botResponses.feedback;
        } else if (lowerMessage.includes('support')) {
            response = this.botResponses.support;
        }

        await this.addBotMessage(response.text, response.intent, response.confidence);
    }

    async addBotMessage(text, intent, confidence) {
        const botMessage = {
            type: 'bot',
            text: text,
            timestamp: Date.now()
        };
        this.currentConversation.messages.push(botMessage);
        this.currentConversation.messageCount++;
        this.renderMessage(botMessage);
        this.scrollToBottom();

        // Track bot response
        await this.analytics.trackBotResponse(this.currentConversation.id, text, intent, confidence);

        // Update conversation preview
        this.updateConversationPreview(this.currentConversation.id, text);
    }

    async handleQuickAction(action) {
        if (!this.currentConversation) return;

        // Track button click
        await this.analytics.trackButtonClick(this.currentConversation.id, `quick-action-${action}`, action);

        // Show typing indicator
        this.typingIndicator.style.display = 'flex';

        // Simulate bot response
        setTimeout(() => {
            this.typingIndicator.style.display = 'none';
            const response = this.botResponses[action] || this.botResponses.default;
            this.addBotMessage(response.text, response.intent, response.confidence);
        }, 800);
    }

    updateConversationPreview(conversationId, text) {
        const conversationItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (conversationItem) {
            const preview = conversationItem.querySelector('.conversation-preview');
            preview.textContent = text.substring(0, 40) + (text.length > 40 ? '...' : '');
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    updateStats() {
        // Update message count
        document.getElementById('stat-messages').textContent = this.messageCount;

        // Update current conversation
        const conversationStat = document.getElementById('stat-conversation');
        if (this.currentConversation) {
            conversationStat.textContent = this.currentConversation.title;
        } else {
            conversationStat.textContent = 'None';
        }
    }

    startSessionCounter() {
        setInterval(() => {
            const duration = this.analytics.getSessionDuration();
            const minutes = Math.floor(duration / 60);
            document.getElementById('stat-duration').textContent = `${minutes}m`;
        }, 1000);
    }

    updateEventDisplay() {
        const eventList = document.getElementById('event-list');
        const history = this.analytics.getEventHistory();
        
        eventList.innerHTML = '';
        
        history.slice(0, 5).forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <div class="event-type">${event.type} - ${event.target}</div>
                <div class="event-time">${this.formatTime(new Date(event.timestamp).getTime())}</div>
            `;
            eventList.appendChild(eventItem);
        });
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
