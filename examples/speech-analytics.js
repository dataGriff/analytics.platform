// Voice/Speech Analytics Example (Alexa, Google Assistant, Voice Agents)
// This demonstrates how the channel-agnostic schema works for speech interactions

class SpeechAnalytics {
    constructor(apiEndpoint, agentVersion) {
        this.apiEndpoint = apiEndpoint;
        this.agentVersion = agentVersion;
        this.sessionMap = new Map();
    }

    getOrCreateSessionId(deviceId) {
        if (!this.sessionMap.has(deviceId)) {
            const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            this.sessionMap.set(deviceId, sessionId);
        }
        return this.sessionMap.get(deviceId);
    }

    async sendEvent(deviceId, userId, eventType, interactionTarget = null, metadata = {}, eventCategory = 'user_action') {
        const event = {
            // Channel information
            channel: 'speech',
            platform: metadata.voice_platform || 'alexa', // 'alexa', 'google-assistant', 'siri', 'custom-voice', etc.
            
            // Event classification
            event_type: eventType,
            event_category: eventCategory,
            
            // Context information (intent/skill-based for speech)
            resource_id: metadata.skill_id || metadata.intent || 'unknown',
            resource_title: metadata.skill_name || metadata.intent_name,
            interaction_target: interactionTarget,
            
            // Session and user tracking
            session_id: this.getOrCreateSessionId(deviceId),
            device_id: deviceId,
            user_id: userId,
            
            // Technical metadata
            user_agent: `VoiceAgent/${this.agentVersion} (${metadata.voice_platform || 'alexa'})`,
            client_version: this.agentVersion,
            
            // Interaction-specific data
            interaction_text: metadata.utterance || metadata.response_text || null,
            interaction_value: metadata.confidence_score || metadata.duration || null,
            
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
                console.log('Speech analytics event sent successfully');
            }
        } catch (error) {
            console.error('Error sending speech analytics event:', error);
        }
    }

    // Speech-specific tracking methods
    trackUtterance(deviceId, userId, utterance, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'utterance', 'user_speech', {
            utterance: utterance,
            utterance_length: utterance.length,
            voice_platform: platform
        }, 'engagement');
    }

    trackIntentRecognition(deviceId, userId, intent, slots, confidenceScore, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'intent', intent, {
            intent_name: intent,
            slots: slots,
            confidence_score: confidenceScore,
            voice_platform: platform
        }, 'system_event');
    }

    trackVoiceResponse(deviceId, userId, responseText, duration, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'response', 'voice_output', {
            response_text: responseText,
            duration: duration,
            response_type: 'speech',
            voice_platform: platform
        }, 'system_event');
    }

    trackSkillLaunch(deviceId, userId, skillId, skillName, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'session', 'skill_launch', {
            skill_id: skillId,
            skill_name: skillName,
            voice_platform: platform
        }, 'system_event');
    }

    trackSkillEnd(deviceId, userId, skillId, sessionDuration, interactionCount, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'session', 'skill_end', {
            skill_id: skillId,
            session_duration: sessionDuration,
            interaction_count: interactionCount,
            voice_platform: platform
        }, 'system_event');
    }

    trackAudioPlayback(deviceId, userId, audioTitle, audioUrl, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'interaction', 'audio_playback', {
            audio_title: audioTitle,
            audio_url: audioUrl,
            interaction_type: 'playback',
            voice_platform: platform
        }, 'engagement');
    }

    trackCardDisplay(deviceId, userId, cardType, cardTitle, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'interaction', 'card_display', {
            card_type: cardType,
            card_title: cardTitle,
            interaction_type: 'visual',
            voice_platform: platform
        }, 'engagement');
    }

    trackError(deviceId, userId, errorType, errorMessage, context, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'error', errorType, {
            error_message: errorMessage,
            error_context: context,
            voice_platform: platform
        }, 'error');
    }

    trackPermissionRequest(deviceId, userId, permissionType, granted, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'permission', permissionType, {
            permission_granted: granted,
            voice_platform: platform
        }, 'system_event');
    }

    trackSpeechRecognitionConfidence(deviceId, userId, confidenceScore, utterance, platform = 'alexa') {
        this.sendEvent(deviceId, userId, 'speech_quality', 'recognition', {
            confidence_score: confidenceScore,
            utterance: utterance,
            voice_platform: platform
        }, 'system_event');
    }
}

// Usage example
const analytics = new SpeechAnalytics('http://localhost:3001', '1.0.0');

// Track skill launch
analytics.trackSkillLaunch('device-echo-123', 'user-789', 'skill-weather-001', 'Weather Buddy', 'alexa');

// Track user utterance
analytics.trackUtterance('device-echo-123', 'user-789', 
    'What is the weather in New York', 'alexa');

// Track intent recognition
analytics.trackIntentRecognition('device-echo-123', 'user-789', 
    'GetWeatherIntent', 
    { city: 'New York', date: 'today' }, 
    0.92, 'alexa');

// Track voice response
analytics.trackVoiceResponse('device-echo-123', 'user-789', 
    'The weather in New York today is partly cloudy with a high of 68 degrees', 
    3500, 'alexa');

// Track card display (visual response on Echo Show)
analytics.trackCardDisplay('device-echo-123', 'user-789', 
    'standard', 'New York Weather', 'alexa');

// Track skill end
analytics.trackSkillEnd('device-echo-123', 'user-789', 'skill-weather-001', 45000, 3, 'alexa');

export default SpeechAnalytics;
