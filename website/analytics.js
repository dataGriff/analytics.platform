// Analytics Platform - Event Tracking JavaScript

// Generate a session ID (stored in sessionStorage)
function getSessionId() {
    let sessionId = sessionStorage.getItem('analytics-session-id');
    if (!sessionId) {
        sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('analytics-session-id', sessionId);
    }
    return sessionId;
}

// Generate or retrieve device ID (stored in localStorage)
function getDeviceId() {
    let deviceId = localStorage.getItem('analytics-device-id');
    if (!deviceId) {
        deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('analytics-device-id', deviceId);
    }
    return deviceId;
}

// Detect platform
function detectPlatform() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'web-mobile';
    if (/tablet/i.test(ua)) return 'web-tablet';
    return 'web-desktop';
}

// Get event history from localStorage
function getEventHistory() {
    const history = localStorage.getItem('event-history');
    return history ? JSON.parse(history) : [];
}

// Save event to history
function saveEventToHistory(event) {
    const history = getEventHistory();
    history.unshift(event);
    // Keep only last 5 events
    if (history.length > 5) {
        history.pop();
    }
    localStorage.setItem('event-history', JSON.stringify(history));
    updateEventDisplay();
}

// Update event display on page
function updateEventDisplay() {
    const eventList = document.getElementById('event-list');
    if (!eventList) return;

    const history = getEventHistory();
    if (history.length === 0) {
        eventList.innerHTML = '<p class="no-events">No events yet. Click a button to start!</p>';
        return;
    }

    eventList.innerHTML = history.map(event => `
        <div class="event-item">
            <span class="event-type">${event.event_type}</span>
            <span class="event-button">${event.interaction_target || 'N/A'}</span>
            <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
        </div>
    `).join('');
}

// Send analytics event (channel-agnostic format)
async function sendAnalyticsEvent(eventType, interactionTarget = null, metadata = {}, eventCategory = 'user_action') {
    const event = {
        // Channel information
        channel: 'web',
        platform: detectPlatform(),
        
        // Event classification
        event_type: eventType,
        event_category: eventCategory,
        
        // Context information
        resource_id: window.location.href,
        resource_title: document.title,
        interaction_target: interactionTarget,
        
        // Session and user tracking
        session_id: getSessionId(),
        device_id: getDeviceId(),
        user_id: null, // Can be set if user is authenticated
        
        // Technical metadata
        user_agent: navigator.userAgent,
        client_version: '1.0.0',
        
        // Timestamp
        timestamp: new Date().toISOString(),
        
        // Additional context
        metadata: metadata
    };

    // Save to local history for display
    saveEventToHistory(event);

    try {
        // Send to analytics API which pushes to Kafka
        const response = await fetch('http://localhost:3001/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Analytics event sent successfully:', result);
        } else {
            console.error('Failed to send analytics event:', response.status);
        }
    } catch (error) {
        console.error('Error sending analytics event:', error);
    }
}

// Track page view
function trackPageView() {
    sendAnalyticsEvent('navigation', null, {
        referrer: document.referrer,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
    }, 'navigation');
}

// Track button click
function trackButtonClick(buttonId) {
    sendAnalyticsEvent('interaction', buttonId, {
        page_section: 'main',
        interaction_type: 'click'
    }, 'user_action');
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', function() {
    // Track page view
    trackPageView();

    // Update event display
    updateEventDisplay();

    // Add click handlers to all buttons with IDs
    document.querySelectorAll('button[id^="btn-"]').forEach(button => {
        button.addEventListener('click', function() {
            trackButtonClick(this.id);
            
            // Visual feedback
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
        });
    });

    // Track navigation clicks
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            sendAnalyticsEvent('navigation', this.textContent, {
                destination: this.href,
                link_text: this.textContent
            }, 'navigation');
        });
    });
});

// Track page unload
window.addEventListener('beforeunload', function() {
    sendAnalyticsEvent('session', null, {
        time_on_page: Date.now() - performance.timeOrigin,
        action: 'page_unload'
    }, 'system_event');
});
