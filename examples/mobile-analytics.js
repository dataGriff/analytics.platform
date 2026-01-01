// Mobile Analytics SDK Example (React Native / iOS / Android)
// This demonstrates how the channel-agnostic schema works for mobile apps

class MobileAnalytics {
    constructor(apiEndpoint, appVersion) {
        this.apiEndpoint = apiEndpoint;
        this.appVersion = appVersion;
        this.sessionId = this.generateSessionId();
        this.deviceId = this.getOrCreateDeviceId();
        this.userId = null; // Set after authentication
    }

    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    getOrCreateDeviceId() {
        // In real implementation, use device-specific storage
        // For iOS: UserDefaults, for Android: SharedPreferences
        return `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    detectPlatform() {
        // In real implementation, detect actual platform
        // return Platform.OS === 'ios' ? 'ios' : 'android';
        return 'ios'; // or 'android'
    }

    async sendEvent(eventType, interactionTarget = null, metadata = {}, eventCategory = 'user_action') {
        const event = {
            // Channel information
            channel: 'mobile',
            platform: this.detectPlatform(),
            
            // Event classification
            event_type: eventType,
            event_category: eventCategory,
            
            // Context information (screen-based for mobile)
            resource_id: metadata.screen_name || 'unknown',
            resource_title: metadata.screen_title || metadata.screen_name,
            interaction_target: interactionTarget,
            
            // Session and user tracking
            session_id: this.sessionId,
            device_id: this.deviceId,
            user_id: this.userId,
            
            // Technical metadata
            user_agent: this.getUserAgent(),
            client_version: this.appVersion,
            
            // Timestamp
            timestamp: new Date().toISOString(),
            
            // Additional context
            metadata: {
                ...metadata,
                device_model: this.getDeviceModel(),
                os_version: this.getOSVersion(),
                app_state: this.getAppState()
            }
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
                console.log('Analytics event sent successfully');
            }
        } catch (error) {
            console.error('Error sending analytics event:', error);
        }
    }

    // Mobile-specific tracking methods
    trackScreenView(screenName, screenTitle = null) {
        this.sendEvent('navigation', null, {
            screen_name: screenName,
            screen_title: screenTitle || screenName,
            previous_screen: this.currentScreen
        }, 'navigation');
        this.currentScreen = screenName;
    }

    trackButtonTap(buttonId, screenName) {
        this.sendEvent('interaction', buttonId, {
            screen_name: screenName,
            interaction_type: 'tap'
        }, 'user_action');
    }

    trackSwipeGesture(direction, screenName) {
        this.sendEvent('interaction', 'swipe', {
            screen_name: screenName,
            interaction_type: 'swipe',
            direction: direction
        }, 'user_action');
    }

    trackAppLaunch() {
        this.sendEvent('session', null, {
            action: 'app_launch',
            is_first_launch: this.isFirstLaunch()
        }, 'system_event');
    }

    trackAppBackground() {
        this.sendEvent('session', null, {
            action: 'app_background',
            session_duration: Date.now() - this.sessionStartTime
        }, 'system_event');
    }

    setUserId(userId) {
        this.userId = userId;
    }

    // Placeholder methods for device info
    getUserAgent() {
        return `MyApp/${this.appVersion} (${this.detectPlatform()})`;
    }

    getDeviceModel() {
        // In real implementation: return Device.modelName;
        return 'iPhone 14 Pro';
    }

    getOSVersion() {
        // In real implementation: return Device.osVersion;
        return '17.0';
    }

    getAppState() {
        // In real implementation: return AppState.currentState;
        return 'active';
    }

    isFirstLaunch() {
        // Check if this is the first time the app has been launched
        return false;
    }
}

// Usage example
const analytics = new MobileAnalytics('http://localhost:3001', '1.0.0');

// Track app launch
analytics.trackAppLaunch();

// Track screen view
analytics.trackScreenView('home', 'Home Screen');

// Track button tap
analytics.trackButtonTap('btn-purchase', 'product_detail');

// Track gesture
analytics.trackSwipeGesture('left', 'image_gallery');

export default MobileAnalytics;
