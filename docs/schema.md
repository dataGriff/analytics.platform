# Channel-Agnostic Analytics Schema

## Overview

This analytics platform uses a **channel-agnostic schema** that supports tracking user behavior across multiple interaction channels including web, mobile apps, AI agents, chat interfaces, and voice/speech platforms. The schema is designed to be flexible and extensible while maintaining consistent structure across all channels.

## Core Principles

1. **Channel Agnostic**: Common fields work across all channels
2. **Context Flexible**: Resource and interaction fields adapt to channel context
3. **Metadata Rich**: JSONB metadata field for channel-specific attributes
4. **Session Consistent**: Unified session tracking across channels
5. **Queryable**: Indexed fields for efficient cross-channel analytics

## Schema Structure

### Core Event Table: `analytics_events`

```sql
CREATE TABLE analytics_events (
    id SERIAL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Channel information
    channel VARCHAR(50) NOT NULL,
    platform VARCHAR(100),
    
    -- Event classification
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(100),
    
    -- Context information (channel-agnostic)
    resource_id VARCHAR(500),
    resource_title VARCHAR(200),
    interaction_target VARCHAR(200),
    
    -- Session and user tracking
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    device_id VARCHAR(100),
    
    -- Technical metadata
    user_agent TEXT,
    client_version VARCHAR(50),
    
    -- Interaction-specific data
    interaction_value NUMERIC,
    interaction_text TEXT,
    
    -- Additional context
    metadata JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, timestamp)
);
```

## Field Mappings by Channel

### Channel-Agnostic Fields

| Field | Description | Examples |
|-------|-------------|----------|
| `channel` | Primary interaction channel | web, mobile, agent, chat, speech |
| `platform` | Specific platform/variant | web-desktop, ios, alexa, slack |
| `event_type` | Type of event | interaction, navigation, session, message, intent |
| `event_category` | Broad category | user_action, system_event, engagement, error |
| `session_id` | Unique session identifier | session-123-abc |
| `user_id` | Authenticated user ID | user-456 |
| `device_id` | Unique device identifier | device-789-xyz |
| `timestamp` | Event timestamp | 2026-01-01T12:00:00Z |

### Context Fields (Channel-Specific Meaning)

| Field | Web | Mobile | Chat | Speech | Agent |
|-------|-----|--------|------|--------|-------|
| `resource_id` | Page URL | Screen name | Conversation ID | Skill/Intent ID | Task ID |
| `resource_title` | Page title | Screen title | Conversation topic | Skill name | Task description |
| `interaction_target` | Button/element ID | Button/gesture ID | Message type | Intent/command | Tool name |
| `interaction_text` | Search query | - | Message content | Utterance | Prompt/command |
| `interaction_value` | Duration/score | Duration | Confidence | Confidence/duration | Execution time/confidence |

### Channel-Specific Metadata Examples

#### Web Channel
```json
{
  "referrer": "https://example.com",
  "screen_width": 1920,
  "screen_height": 1080,
  "viewport_width": 1440,
  "viewport_height": 900,
  "page_section": "header"
}
```

#### Mobile Channel
```json
{
  "screen_name": "ProductDetailScreen",
  "device_model": "iPhone 14 Pro",
  "os_version": "17.0",
  "app_state": "active",
  "interaction_type": "tap",
  "previous_screen": "HomeScreen"
}
```

#### Chat Channel
```json
{
  "chat_platform": "slack",
  "intent": "support.query",
  "entities": {"product": "premium", "issue": "billing"},
  "confidence_score": 0.95,
  "message_count": 6,
  "conversation_duration": 120000
}
```

#### Speech Channel
```json
{
  "voice_platform": "alexa",
  "skill_id": "skill-weather-001",
  "utterance": "What is the weather in New York",
  "intent_name": "GetWeatherIntent",
  "slots": {"city": "New York", "date": "today"},
  "confidence_score": 0.92,
  "response_type": "speech"
}
```

#### Agent Channel
```json
{
  "agent_platform": "copilot",
  "task_type": "code_generation",
  "language": "javascript",
  "tool_name": "create_file",
  "model_name": "gpt-4",
  "input_tokens": 500,
  "output_tokens": 800,
  "reasoning": "Using React hooks for modern implementation"
}
```

## Event Types by Channel

### Web Events
- `navigation` - Page views, route changes
- `interaction` - Button clicks, form submissions
- `session` - Page load, page unload
- `error` - JavaScript errors, API failures

### Mobile Events
- `navigation` - Screen views, tab switches
- `interaction` - Taps, swipes, long presses
- `session` - App launch, app background, app foreground
- `error` - Crashes, API failures

### Chat Events
- `message` - User messages, bot responses
- `intent` - Intent detection
- `interaction` - Button clicks, quick replies
- `session` - Conversation start, conversation end
- `sentiment` - Sentiment analysis results
- `error` - Fallback triggers, errors

### Speech Events
- `utterance` - User speech input
- `intent` - Intent recognition
- `response` - Voice responses
- `interaction` - Audio playback, card displays
- `session` - Skill launch, skill end
- `permission` - Permission requests
- `error` - Recognition errors, API failures

### Agent Events
- `prompt` - User prompts/instructions
- `tool` - Tool usage/execution
- `generation` - Code/content generation
- `context` - Context retrieval
- `inference` - Model inference calls
- `decision` - Agent decisions
- `thought` - Agent reasoning steps
- `feedback` - User feedback
- `session` - Task start, task complete
- `resource` - Resource usage metrics
- `error` - Execution errors

## Sample Queries

### Cross-Channel Event Volume
```sql
SELECT 
    date_trunc('hour', timestamp) as hour,
    channel,
    COUNT(*) as event_count
FROM analytics_events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hour, channel
ORDER BY hour DESC, event_count DESC;
```

### Channel-Specific User Engagement
```sql
SELECT 
    channel,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(DISTINCT user_id) as users,
    COUNT(*) as total_events,
    AVG(interaction_value) as avg_interaction_value
FROM analytics_events
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY channel;
```

### Top Resources by Channel
```sql
SELECT 
    channel,
    resource_id,
    resource_title,
    COUNT(*) as event_count
FROM analytics_events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY channel, resource_id, resource_title
ORDER BY channel, event_count DESC;
```

### Event Type Distribution
```sql
SELECT 
    channel,
    event_type,
    event_category,
    COUNT(*) as count
FROM analytics_events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY channel, event_type, event_category
ORDER BY channel, count DESC;
```

### User Journey Analysis (Cross-Channel)
```sql
SELECT 
    user_id,
    session_id,
    channel,
    event_type,
    resource_id,
    timestamp
FROM analytics_events
WHERE user_id = 'user-123'
ORDER BY timestamp DESC
LIMIT 50;
```

### Speech Confidence Analysis
```sql
SELECT 
    event_type,
    AVG((metadata->>'confidence_score')::numeric) as avg_confidence,
    COUNT(*) as event_count
FROM analytics_events
WHERE channel = 'speech'
    AND metadata->>'confidence_score' IS NOT NULL
    AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY event_type;
```

### Agent Tool Usage
```sql
SELECT 
    interaction_target as tool_name,
    COUNT(*) as usage_count,
    AVG(interaction_value) as avg_execution_time
FROM analytics_events
WHERE channel = 'agent'
    AND event_type = 'tool'
    AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY interaction_target
ORDER BY usage_count DESC;
```

## Implementation Examples

See the following files for implementation examples:
- [website/analytics.js](../website/analytics.js) - Web implementation
- [examples/mobile-analytics.js](../examples/mobile-analytics.js) - Mobile implementation
- [examples/chat-analytics.js](../examples/chat-analytics.js) - Chat implementation
- [examples/speech-analytics.js](../examples/speech-analytics.js) - Voice/Speech implementation
- [examples/agent-analytics.js](../examples/agent-analytics.js) - AI Agent implementation

## Benefits of Channel-Agnostic Design

1. **Unified Analytics**: Single schema for all interaction types
2. **Cross-Channel Insights**: Compare behavior across channels
3. **Scalable**: Easy to add new channels without schema changes
4. **Consistent Tracking**: Same approach for all teams
5. **Flexible Metadata**: Channel-specific details in JSONB field
6. **Efficient Queries**: Common fields indexed for performance
7. **Future-Proof**: Adaptable to new interaction paradigms

## Migration Notes

When migrating from channel-specific schemas:
1. Map old fields to new channel-agnostic fields
2. Move channel-specific data to `metadata` JSONB field
3. Add `channel` and `platform` identifiers
4. Standardize event types across channels
5. Update queries to use new field names
6. Update visualization dashboards

## Best Practices

1. **Consistent Naming**: Use same event_type names across channels where applicable
2. **Rich Metadata**: Include channel-specific details in metadata field
3. **Session Tracking**: Always include session_id for behavior analysis
4. **User Linking**: Link authenticated users across channels with user_id
5. **Device Tracking**: Use device_id for cross-session user identification
6. **Event Categories**: Use consistent event_category values
7. **Timestamps**: Always use ISO 8601 format for timestamps
8. **Validation**: Validate events before sending to ensure data quality
