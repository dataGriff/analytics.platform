// Mobile Analytics SDK for Analytics Platform
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

class MobileAnalytics {
    constructor(apiEndpoint, appVersion) {
        this.apiEndpoint = apiEndpoint;
        this.appVersion = appVersion;
        this.sessionId = this.generateSessionId();
        this.currentScreen = null;
        this.initializeDeviceId();
    }

    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    async initializeDeviceId() {
        try {
            let deviceId = await AsyncStorage.getItem('analytics-device-id');
            if (!deviceId) {
                deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
                await AsyncStorage.setItem('analytics-device-id', deviceId);
            }
            this.deviceId = deviceId;
        } catch (error) {
            console.error('Error initializing device ID:', error);
            this.deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        }
    }

    detectPlatform() {
        return Platform.OS; // 'ios' or 'android' or 'web'
    }

    getDeviceModel() {
        return Device.modelName || Device.deviceName || 'Unknown';
    }

    getOSVersion() {
        return Platform.Version || 'Unknown';
    }

    getUserAgent() {
        return `${Device.brand || 'Unknown'}/${Device.modelName || 'Unknown'} ${Platform.OS}/${Platform.Version}`;
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
            user_id: null, // Set after authentication if needed
            
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
                app_version: Constants.expoConfig?.version || this.appVersion
            }
        };

        try {
            // Save to history first
            await this.saveEventToHistory(event);

            // Send to server
            const response = await fetch(`${this.apiEndpoint}/analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            });

            if (response.ok) {
                console.log('✅ Analytics event sent successfully:', eventType);
            } else {
                console.warn('⚠️ Analytics event failed:', response.status);
            }
        } catch (error) {
            console.error('❌ Error sending analytics event:', error.message);
            // Still save locally even if send fails
        }
    }

    // Mobile-specific tracking methods
    async trackScreenView(screenName, screenTitle = null) {
        await this.sendEvent('navigation', null, {
            screen_name: screenName,
            screen_title: screenTitle || screenName,
            previous_screen: this.currentScreen
        }, 'navigation');
        this.currentScreen = screenName;
    }

    async trackButtonTap(buttonId, screenName, additionalMetadata = {}) {
        await this.sendEvent('interaction', buttonId, {
            screen_name: screenName,
            interaction_type: 'tap',
            ...additionalMetadata
        }, 'user_action');
    }

    async trackSwipeGesture(direction, screenName) {
        await this.sendEvent('interaction', 'swipe', {
            screen_name: screenName,
            interaction_type: 'swipe',
            swipe_direction: direction
        }, 'gesture');
    }

    async trackAppLaunch() {
        await this.sendEvent('app_launch', null, {
            app_version: this.appVersion,
            device_model: this.getDeviceModel(),
            os_version: this.getOSVersion()
        }, 'lifecycle');
    }

    async trackAppBackground() {
        await this.sendEvent('app_background', null, {}, 'lifecycle');
    }

    async trackError(errorMessage, errorStack = null) {
        await this.sendEvent('error', errorMessage, {
            error_stack: errorStack,
            screen_name: this.currentScreen
        }, 'error');
    }

    // Event history management
    async getEventHistory() {
        try {
            const history = await AsyncStorage.getItem('event-history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error reading event history:', error);
            return [];
        }
    }

    async saveEventToHistory(event) {
        try {
            const history = await this.getEventHistory();
            history.unshift(event);
            
            // Keep only last 5 events
            if (history.length > 5) {
                history.pop();
            }
            
            await AsyncStorage.setItem('event-history', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving event to history:', error);
        }
    }

    async clearEventHistory() {
        try {
            await AsyncStorage.removeItem('event-history');
        } catch (error) {
            console.error('Error clearing event history:', error);
        }
    }
}

export default MobileAnalytics;
