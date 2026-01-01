// Chat Analytics Example (Chatbot / Messaging Platform)
// This demonstrates how the channel-agnostic schema works for chat interactions

class ChatAnalytics {
    constructor(apiEndpoint, botVersion) {
        this.apiEndpoint = apiEndpoint;
        this.botVersion = botVersion;
        this.conversationSessions = new Map();
    }

    getOrCreateSessionId(conversationId) {
        if (!this.conversationSessions.has(conversationId)) {
            const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            this.conversationSessions.set(conversationId, sessionId);
        }
        return this.conversationSessions.get(conversationId);
    }

    async sendEvent(conversationId, userId, eventType, interactionTarget = null, metadata = {}, eventCategory = 'user_action') {
        const event = {
            // Channel information
            channel: 'chat',
            platform: metadata.chat_platform || 'web-chat', // 'slack', 'teams', 'whatsapp', 'web-chat', etc.
            
            // Event classification
            event_type: eventType,
            event_category: eventCategory,
            
            // Context information (conversation-based for chat)
            resource_id: conversationId,
            resource_title: metadata.conversation_topic || conversationId,
            interaction_target: interactionTarget,
            
            // Session and user tracking
            session_id: this.getOrCreateSessionId(conversationId),
            device_id: metadata.device_id || null,
            user_id: userId,
            
            // Technical metadata
            user_agent: metadata.user_agent || 'ChatBot/1.0',
            client_version: this.botVersion,
            
            // Interaction-specific data
            interaction_text: metadata.message_text || null,
            interaction_value: metadata.confidence_score || null,
            
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
                console.log('Chat analytics event sent successfully');
            }
        } catch (error) {
            console.error('Error sending chat analytics event:', error);
        }
    }

    // Chat-specific tracking methods
    trackMessageSent(conversationId, userId, messageText, platform = 'web-chat') {
        this.sendEvent(conversationId, userId, 'message', 'user_message', {
            message_text: messageText,
            message_type: 'text',
            message_length: messageText.length,
            chat_platform: platform
        }, 'engagement');
    }

    trackBotResponse(conversationId, userId, responseText, intent, confidenceScore, platform = 'web-chat') {
        this.sendEvent(conversationId, userId, 'message', 'bot_response', {
            message_text: responseText,
            message_type: 'text',
            intent: intent,
            confidence_score: confidenceScore,
            chat_platform: platform
        }, 'system_event');
    }

    trackButtonClick(conversationId, userId, buttonLabel, buttonValue, platform = 'web-chat') {
        this.sendEvent(conversationId, userId, 'interaction', buttonLabel, {
            button_value: buttonValue,
            interaction_type: 'button_click',
            chat_platform: platform
        }, 'user_action');
    }

    trackConversationStart(conversationId, userId, entryPoint, platform = 'web-chat') {
        this.sendEvent(conversationId, userId, 'session', 'conversation_start', {
            entry_point: entryPoint,
            chat_platform: platform
        }, 'system_event');
    }

    trackConversationEnd(conversationId, userId, duration, messageCount, platform = 'web-chat') {
        this.sendEvent(conversationId, userId, 'session', 'conversation_end', {
            conversation_duration: duration,
            message_count: messageCount,
            chat_platform: platform
        }, 'system_event');
    }

    trackIntentDetection(conversationId, userId, intent, entities, confidenceScore, platform = 'web-chat') {
        this.sendEvent(conversationId, userId, 'intent', intent, {
            entities: entities,
            confidence_score: confidenceScore,
            chat_platform: platform
        }, 'system_event');
    }

    trackFallback(conversationId, userId, userMessage, platform = 'web-chat') {
        this.sendEvent(conversationId, userId, 'error', 'fallback', {
            message_text: userMessage,
            error_type: 'intent_not_recognized',
            chat_platform: platform
        }, 'error');
    }

    trackSentimentDetection(conversationId, userId, sentiment, score, platform = 'web-chat') {
        this.sendEvent(conversationId, userId, 'sentiment', sentiment, {
            sentiment_score: score,
            chat_platform: platform
        }, 'engagement');
    }
}

// Usage example
const analytics = new ChatAnalytics('http://localhost:3001', '1.0.0');

// Track conversation start
analytics.trackConversationStart('conv-123', 'user-456', 'widget', 'web-chat');

// Track user message
analytics.trackMessageSent('conv-123', 'user-456', 'What is the weather today?', 'web-chat');

// Track intent detection
analytics.trackIntentDetection('conv-123', 'user-456', 'weather.query', 
    { location: 'current', time: 'today' }, 0.95, 'web-chat');

// Track bot response
analytics.trackBotResponse('conv-123', 'user-456', 
    'The weather today is sunny with a high of 75°F.', 
    'weather.query', 0.95, 'web-chat');

// Track button click
analytics.trackButtonClick('conv-123', 'user-456', 'Show More Details', 'weather_details', 'web-chat');

// Track conversation end
analytics.trackConversationEnd('conv-123', 'user-456', 120000, 6, 'web-chat');

export default ChatAnalytics;
