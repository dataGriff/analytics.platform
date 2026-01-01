// Chat App Analytics - Channel-Agnostic Event Tracking

class ChatAnalytics {
    constructor(apiEndpoint = 'http://localhost:3001', botVersion = '1.0.0') {
        this.apiEndpoint = apiEndpoint;
        this.botVersion = botVersion;
        this.sessionId = this.getOrCreateSessionId();
        this.deviceId = this.getOrCreateDeviceId();
        this.platform = this.detectPlatform();
        this.conversationSessions = new Map();
        this.startTime = Date.now();
    }

    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('chat-analytics-session-id');
        if (!sessionId) {
            sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            sessionStorage.setItem('chat-analytics-session-id', sessionId);
        }
        return sessionId;
    }

    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('chat-analytics-device-id');
        if (!deviceId) {
            deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem('chat-analytics-device-id', deviceId);
        }
        return deviceId;
    }

    detectPlatform() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return 'web-mobile';
        if (/tablet/i.test(ua)) return 'web-tablet';
        return 'web-desktop';
    }

    getConversationSessionId(conversationId) {
        if (!this.conversationSessions.has(conversationId)) {
            const convSessionId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            this.conversationSessions.set(conversationId, convSessionId);
        }
        return this.conversationSessions.get(conversationId);
    }

    async sendEvent(conversationId, eventType, interactionTarget, metadata = {}, eventCategory = 'user_action') {
        const event = {
            // Channel information
            channel: 'chat',
            platform: this.platform,
            
            // Event classification
            event_type: eventType,
            event_category: eventCategory,
            
            // Context information
            resource_id: conversationId,
            resource_title: metadata.conversation_topic || conversationId,
            interaction_target: interactionTarget,
            
            // Session and user tracking
            session_id: this.getConversationSessionId(conversationId),
            device_id: this.deviceId,
            user_id: metadata.user_id || 'anonymous',
            
            // Technical metadata
            user_agent: navigator.userAgent,
            client_version: this.botVersion,
            
            // Interaction-specific data
            interaction_text: metadata.message_text || null,
            interaction_value: metadata.confidence_score || metadata.value || null,
            
            // Timestamp
            timestamp: new Date().toISOString(),
            
            // Additional context
            metadata: metadata
        };

        try {
            const response = await fetch(`${this.apiEndpoint}/analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            });

            if (response.ok) {
                console.log('Chat analytics event sent:', eventType);
                this.saveEventToHistory(event);
                return true;
            } else {
                console.warn('Failed to send analytics event:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('Error sending chat analytics event:', error);
            return false;
        }
    }

    // Event history management
    saveEventToHistory(event) {
        const history = this.getEventHistory();
        history.unshift({
            type: event.event_type,
            target: event.interaction_target,
            timestamp: event.timestamp,
            category: event.event_category
        });
        
        // Keep only last 10 events
        if (history.length > 10) {
            history.splice(10);
        }
        
        localStorage.setItem('chat-event-history', JSON.stringify(history));
        
        // Trigger custom event for UI updates
        window.dispatchEvent(new CustomEvent('analytics-event', { detail: event }));
    }

    getEventHistory() {
        const history = localStorage.getItem('chat-event-history');
        return history ? JSON.parse(history) : [];
    }

    // Chat-specific tracking methods

    // Track when a user sends a message
    async trackMessageSent(conversationId, messageText, userId = 'anonymous') {
        return await this.sendEvent(
            conversationId,
            'message',
            'user_message',
            {
                message_text: messageText,
                message_type: 'text',
                message_length: messageText.length,
                user_id: userId,
                conversation_id: conversationId
            },
            'engagement'
        );
    }

    // Track bot responses
    async trackBotResponse(conversationId, responseText, intent = 'general', confidenceScore = null) {
        return await this.sendEvent(
            conversationId,
            'message',
            'bot_response',
            {
                message_text: responseText,
                message_type: 'text',
                intent: intent,
                confidence_score: confidenceScore,
                response_length: responseText.length
            },
            'system_event'
        );
    }

    // Track button clicks in chat (quick actions, suggestions, etc.)
    async trackButtonClick(conversationId, buttonLabel, buttonValue = null) {
        return await this.sendEvent(
            conversationId,
            'interaction',
            buttonLabel,
            {
                button_value: buttonValue,
                interaction_type: 'button_click'
            },
            'user_action'
        );
    }

    // Track conversation start
    async trackConversationStart(conversationId, entryPoint = 'direct') {
        return await this.sendEvent(
            conversationId,
            'session',
            'conversation_start',
            {
                entry_point: entryPoint,
                conversation_id: conversationId
            },
            'session_event'
        );
    }

    // Track conversation end
    async trackConversationEnd(conversationId, duration, messageCount) {
        return await this.sendEvent(
            conversationId,
            'session',
            'conversation_end',
            {
                duration_seconds: duration,
                message_count: messageCount,
                conversation_id: conversationId
            },
            'session_event'
        );
    }

    // Track when user switches conversations
    async trackConversationSwitch(fromConversationId, toConversationId) {
        return await this.sendEvent(
            toConversationId,
            'navigation',
            'conversation_switch',
            {
                from_conversation: fromConversationId,
                to_conversation: toConversationId
            },
            'user_action'
        );
    }

    // Track typing indicator (user started typing)
    async trackTypingStart(conversationId) {
        return await this.sendEvent(
            conversationId,
            'interaction',
            'typing_start',
            {
                interaction_type: 'typing'
            },
            'user_action'
        );
    }

    // Track when user creates a new conversation
    async trackNewConversation(conversationId) {
        return await this.sendEvent(
            conversationId,
            'interaction',
            'new_conversation',
            {
                conversation_id: conversationId
            },
            'user_action'
        );
    }

    // Track user feedback (thumbs up/down, ratings, etc.)
    async trackFeedback(conversationId, feedbackType, feedbackValue, targetMessageId = null) {
        return await this.sendEvent(
            conversationId,
            'interaction',
            'feedback',
            {
                feedback_type: feedbackType,
                feedback_value: feedbackValue,
                target_message_id: targetMessageId
            },
            'user_action'
        );
    }

    // Track app/page load
    async trackAppLoad() {
        return await this.sendEvent(
            'app-root',
            'session',
            'app_load',
            {
                load_time: Date.now(),
                referrer: document.referrer || 'direct'
            },
            'session_event'
        );
    }

    // Get session duration
    getSessionDuration() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatAnalytics;
}
