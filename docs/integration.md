# Integration Guide

This guide explains how to integrate the analytics platform with your applications.

## Overview

The analytics platform uses a **channel-agnostic schema** that supports multiple interaction channels including web, mobile apps, AI agents, chat interfaces, and voice/speech platforms.

## Integration Steps

### 1. Choose Your Channel

Identify which channel type best describes your application:
- **web**: Browser-based applications (desktop, mobile, tablet)
- **mobile**: Native iOS and Android apps
- **chat**: Chatbots, messaging platforms (Slack, Teams, WhatsApp, etc.)
- **speech**: Voice assistants (Alexa, Google Assistant, Siri, custom)
- **agent**: AI agents, coding assistants, autonomous systems

### 2. Implement Event Tracking

Send events to the Analytics API using HTTP POST:

```javascript
const event = {
  // Channel identification
  channel: 'web',              // Required: web, mobile, chat, speech, agent
  platform: 'web-desktop',     // Optional: Specific platform variant
  
  // Event classification
  event_type: 'interaction',   // Required: Type of event
  event_category: 'user_action', // Optional: Broad category
  
  // Context information
  resource_id: 'https://example.com/page',  // Resource identifier
  resource_title: 'Page Title',             // Human-readable context
  interaction_target: 'btn-submit',         // What was interacted with
  interaction_text: 'Search query text',    // Text content (if applicable)
  interaction_value: 100,                   // Numeric value (if applicable)
  
  // Session tracking
  session_id: 'session-123',   // Required: Unique session ID
  user_id: 'user-456',        // Optional: Authenticated user ID
  device_id: 'device-789',    // Optional: Device identifier
  
  // Technical metadata
  user_agent: navigator.userAgent,  // Optional: User agent string
  client_version: '1.0.0',          // Optional: Client version
  
  // Additional context
  metadata: {                  // Optional: Channel-specific attributes
    custom_field: 'value'
  },
  
  // Timestamp
  timestamp: new Date().toISOString()  // Optional: Event timestamp
};

// Send to Analytics API
fetch('http://localhost:3001/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(event)
});
```

### 3. Generate Session and Device IDs

Implement session and device tracking for your channel:

```javascript
// Generate or retrieve session ID (per session)
function getSessionId() {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Generate or retrieve device ID (persistent)
function getDeviceId() {
  let deviceId = localStorage.getItem('analytics_device_id');
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_device_id', deviceId);
  }
  return deviceId;
}
```

## Channel-Specific Examples

### Web Channel

```javascript
// Track page view
{
  channel: 'web',
  platform: 'web-desktop',
  event_type: 'navigation',
  event_category: 'page_view',
  resource_id: window.location.href,
  resource_title: document.title,
  session_id: getSessionId(),
  device_id: getDeviceId(),
  user_agent: navigator.userAgent,
  metadata: {
    referrer: document.referrer,
    screen_width: screen.width,
    screen_height: screen.height
  }
}

// Track button click
{
  channel: 'web',
  platform: 'web-desktop',
  event_type: 'interaction',
  event_category: 'user_action',
  resource_id: window.location.href,
  resource_title: document.title,
  interaction_target: 'btn-submit',
  session_id: getSessionId(),
  device_id: getDeviceId(),
  user_agent: navigator.userAgent
}
```

**Full Example**: See [website/analytics.js](../website/analytics.js)

### Mobile Channel

```javascript
// React Native example
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Track screen view
{
  channel: 'mobile',
  platform: Platform.OS, // 'ios' or 'android'
  event_type: 'navigation',
  event_category: 'screen_view',
  resource_id: 'HomeScreen',
  resource_title: 'Home',
  session_id: getSessionId(),
  device_id: getDeviceId(),
  user_agent: Device.userAgent,
  metadata: {
    device_model: Device.modelName,
    os_version: Device.osVersion,
    app_version: '1.0.0'
  }
}

// Track button tap
{
  channel: 'mobile',
  platform: Platform.OS,
  event_type: 'interaction',
  event_category: 'user_action',
  resource_id: 'HomeScreen',
  interaction_target: 'btn-primary',
  interaction_text: 'Submit',
  session_id: getSessionId(),
  device_id: getDeviceId(),
  metadata: {
    interaction_type: 'tap'
  }
}
```

**Full Example**: See [examples/mobile-analytics.js](../examples/mobile-analytics.js)

### Chat Channel

```javascript
// Track user message
{
  channel: 'chat',
  platform: 'slack',
  event_type: 'message',
  event_category: 'engagement',
  resource_id: 'conv-123',
  resource_title: 'Support Conversation',
  interaction_target: 'user_message',
  interaction_text: 'How do I reset my password?',
  interaction_value: 'How do I reset my password?'.length,
  session_id: getSessionId(),
  user_id: getUserId(),
  device_id: getDeviceId(),
  metadata: {
    chat_platform: 'slack',
    conversation_duration: 120000,
    message_count: 5
  }
}

// Track bot response
{
  channel: 'chat',
  platform: 'slack',
  event_type: 'message',
  event_category: 'engagement',
  resource_id: 'conv-123',
  resource_title: 'Support Conversation',
  interaction_target: 'bot_response',
  interaction_text: 'Here are the steps to reset your password...',
  session_id: getSessionId(),
  metadata: {
    intent: 'password_reset',
    confidence_score: 0.95
  }
}
```

**Full Example**: See [examples/chat-analytics.js](../examples/chat-analytics.js)

### Speech Channel

```javascript
// Track voice command
{
  channel: 'speech',
  platform: 'alexa',
  event_type: 'utterance',
  event_category: 'voice_input',
  resource_id: 'skill-weather-001',
  resource_title: 'Weather Skill',
  interaction_target: 'GetWeatherIntent',
  interaction_text: 'What is the weather in New York',
  session_id: getSessionId(),
  device_id: getDeviceId(),
  metadata: {
    voice_platform: 'alexa',
    intent_name: 'GetWeatherIntent',
    slots: { city: 'New York', date: 'today' },
    confidence_score: 0.92
  }
}
```

**Full Example**: See [examples/speech-analytics.js](../examples/speech-analytics.js)

### Agent Channel

```javascript
// Track code generation
{
  channel: 'agent',
  platform: 'github-copilot',
  event_type: 'generation',
  event_category: 'code_generation',
  resource_id: 'task-456',
  resource_title: 'Implement authentication',
  interaction_target: 'create_file',
  interaction_text: 'Create authentication middleware',
  interaction_value: 1500, // execution time in ms
  session_id: getSessionId(),
  user_id: getUserId(),
  metadata: {
    task_type: 'code_generation',
    language: 'javascript',
    tool_name: 'create_file',
    model_name: 'gpt-4',
    input_tokens: 500,
    output_tokens: 800
  }
}
```

**Full Example**: See [examples/agent-analytics.js](../examples/agent-analytics.js)

## API Endpoint

### POST /analytics

**Endpoint**: `http://localhost:3001/analytics` (or your deployed API URL)

**Headers**:
```
Content-Type: application/json
```

**Request Body**: JSON event object (see examples above)

**Success Response**:
```json
{
  "success": true,
  "message": "Event received and sent to Kafka",
  "eventId": "session-123"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Missing required fields: channel, event_type, session_id"
}
```

**Required Fields**:
- `channel`: Channel type
- `event_type`: Type of event
- `session_id`: Session identifier

## Field Mappings by Channel

| Field | Web | Mobile | Chat | Speech | Agent |
|-------|-----|--------|------|--------|-------|
| `resource_id` | Page URL | Screen name | Conversation ID | Skill/Intent ID | Task ID |
| `resource_title` | Page title | Screen title | Conversation topic | Skill name | Task description |
| `interaction_target` | Button/element ID | Button/gesture ID | Message type | Intent/command | Tool name |
| `interaction_text` | Search query | - | Message content | Utterance | Prompt/command |
| `interaction_value` | Duration/score | Duration | Confidence | Confidence/duration | Execution time |

## Best Practices

1. **Session Management**
   - Generate unique session IDs per session
   - Store in sessionStorage (web) or memory (mobile)
   - Use consistent format: `session-{timestamp}-{random}`

2. **Device Tracking**
   - Generate persistent device IDs
   - Store in localStorage (web) or AsyncStorage (mobile)
   - Use consistent format: `device-{timestamp}-{random}`

3. **Timestamps**
   - Use ISO 8601 format: `new Date().toISOString()`
   - Client-side timestamps are preserved by the platform

4. **Event Types**
   - Use consistent event_type names across channels
   - Common types: navigation, interaction, session, message, etc.

5. **Metadata**
   - Use metadata field for channel-specific attributes
   - Keep metadata organized and documented
   - Avoid sensitive information (PII)

6. **Error Handling**
   - Implement retry logic for failed requests
   - Log errors for debugging
   - Don't block user interactions on analytics failures

7. **Performance**
   - Send events asynchronously
   - Batch events if needed (implement client-side batching)
   - Consider using beacons for page unload events

## Testing Your Integration

### 1. Check API Health
```bash
curl http://localhost:3001/health
```

### 2. Send Test Event
```bash
curl -X POST http://localhost:3001/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "web",
    "event_type": "test",
    "session_id": "test-session-123"
  }'
```

### 3. Verify in Grafana
1. Open http://localhost:3000
2. Navigate to Multi-Channel Analytics Dashboard
3. Filter by your channel
4. Verify events appear

### 4. Query PostgreSQL
```bash
docker exec -it postgres psql -U analytics -d analytics -c \
  "SELECT * FROM analytics_events WHERE channel='web' ORDER BY timestamp DESC LIMIT 10;"
```

### 5. Check Delta Lake
1. Open http://localhost:8501 (Delta Dashboard)
2. Filter by your channel
3. Verify events appear

## Next Steps

- **Understand the schema**: See [Channel-Agnostic Schema](schema.md)
- **View architecture**: See [Architecture](architecture.md)
- **Deploy to production**: See [Production Deployment](production.md)
