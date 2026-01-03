# Analytics Platform - API Contract

## Overview

This document defines the formal contract for the Analytics Platform API, providing a comprehensive specification for consumers implementing event tracking across web, mobile, chat, speech, and AI agent channels.

## Version

**Contract Version:** 1.0.0  
**API Version:** 1.0.0  
**Last Updated:** 2026-01-03

## Purpose

This contract serves three key purposes:

1. **Consumer Integration**: Clear specification for developers implementing analytics tracking
2. **Testing & Validation**: Reference for automated contract testing and validation
3. **AI Understanding**: Structured documentation for AI tools and assistants

## Base URL

```
http://localhost:3001
```

For production environments, replace with your deployed API URL.

---

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Description:** Check the health and readiness of the Analytics API service.

**Request:**
- Method: `GET`
- Headers: None required
- Body: None

**Success Response (200 OK):**

```json
{
  "status": "ok",
  "kafkaReady": true,
  "timestamp": "2026-01-03T12:00:00.000Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Service status, always "ok" when running |
| `kafkaReady` | boolean | Indicates if Kafka producer is connected |
| `timestamp` | string (ISO 8601) | Server timestamp |

**Error Response (503 Service Unavailable):**

```json
{
  "status": "error",
  "kafkaReady": false,
  "timestamp": "2026-01-03T12:00:00.000Z"
}
```

---

### 2. Submit Analytics Event

**Endpoint:** `POST /analytics`

**Description:** Submit an analytics event to the platform. Events are validated, enriched, and forwarded to the Kafka message broker for processing.

**Request:**

- Method: `POST`
- Headers:
  - `Content-Type: application/json`
- Body: JSON event payload (see Event Schema below)

**Minimum Required Fields:**

```json
{
  "channel": "web",
  "event_type": "interaction",
  "session_id": "session-1234567890-abc"
}
```

**Complete Event Schema:**

```json
{
  "channel": "web",
  "platform": "web-desktop",
  "event_type": "interaction",
  "event_category": "user_action",
  "resource_id": "https://example.com/page",
  "resource_title": "Example Page",
  "interaction_target": "btn-submit",
  "session_id": "session-1234567890-abc",
  "user_id": "user-456",
  "device_id": "device-789",
  "user_agent": "Mozilla/5.0...",
  "client_version": "1.0.0",
  "interaction_value": 1.5,
  "interaction_text": "Search query text",
  "timestamp": "2026-01-03T12:00:00.000Z",
  "metadata": {
    "custom_field": "custom_value"
  }
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Event received and sent to Kafka",
  "eventId": "session-1234567890-abc"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Bad request",
  "message": "Missing required fields: event_type, channel, session_id"
}
```

**Error Response (503 Service Unavailable):**

```json
{
  "error": "Service unavailable",
  "message": "Kafka producer not ready"
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

---

## Event Schema Specification

### Core Schema

The Analytics Platform uses a **channel-agnostic schema** that works across all interaction types.

#### Required Fields

| Field | Type | Max Length | Description | Validation Rules |
|-------|------|-----------|-------------|------------------|
| `channel` | string | 50 | Primary interaction channel | Must be one of: `web`, `mobile`, `agent`, `chat`, `speech` |
| `event_type` | string | 100 | Type of event | Non-empty string, no special characters except underscore and hyphen |
| `session_id` | string | 100 | Unique session identifier | Non-empty string, should be unique per session |

#### Optional Fields

| Field | Type | Max Length | Description | Default |
|-------|------|-----------|-------------|---------|
| `platform` | string | 100 | Specific platform variant | null |
| `event_category` | string | 100 | Broad event category | null |
| `resource_id` | string | 500 | Context identifier (URL, screen, task) | null |
| `resource_title` | string | 200 | Human-readable context | null |
| `interaction_target` | string | 200 | What was interacted with | null |
| `user_id` | string | 100 | Authenticated user identifier | null |
| `device_id` | string | 100 | Unique device identifier | null |
| `user_agent` | string (text) | unlimited | Browser/app user agent string | null |
| `client_version` | string | 50 | App/SDK version | null |
| `interaction_value` | number | - | Numeric value (duration, score, confidence) | null |
| `interaction_text` | string (text) | unlimited | Text content (query, message, command) | null |
| `timestamp` | string (ISO 8601) | - | Event timestamp | Server time if not provided |
| `metadata` | object (JSON) | - | Additional channel-specific data | {} |

### Field Mappings by Channel

Different channels map context differently to the schema fields:

#### Web Channel

```json
{
  "channel": "web",
  "platform": "web-desktop|web-mobile|web-tablet",
  "event_type": "navigation|interaction|session|error",
  "event_category": "user_action|system_event|engagement|error",
  "resource_id": "https://example.com/page",
  "resource_title": "Page Title",
  "interaction_target": "btn-submit|link-nav|form-contact",
  "session_id": "session-xxx",
  "user_id": "user-xxx",
  "device_id": "device-xxx",
  "user_agent": "Mozilla/5.0...",
  "client_version": "1.0.0",
  "metadata": {
    "referrer": "https://referrer.com",
    "screen_width": 1920,
    "screen_height": 1080,
    "viewport_width": 1440,
    "viewport_height": 900
  }
}
```

#### Mobile Channel

```json
{
  "channel": "mobile",
  "platform": "ios|android",
  "event_type": "navigation|interaction|session|error",
  "event_category": "user_action|system_event|engagement|error",
  "resource_id": "HomeScreen|ProductDetailScreen",
  "resource_title": "Home Screen|Product Detail",
  "interaction_target": "btn-purchase|tab-favorites",
  "session_id": "session-xxx",
  "user_id": "user-xxx",
  "device_id": "device-xxx",
  "user_agent": "MyApp/1.0.0 (iOS)",
  "client_version": "1.0.0",
  "metadata": {
    "device_model": "iPhone 14 Pro",
    "os_version": "17.0",
    "app_state": "active|background|inactive",
    "interaction_type": "tap|swipe|long_press"
  }
}
```

#### Chat Channel

```json
{
  "channel": "chat",
  "platform": "slack|teams|whatsapp|telegram|discord",
  "event_type": "message|intent|interaction|session|sentiment|error",
  "event_category": "user_action|system_event|engagement|error",
  "resource_id": "conversation-xxx",
  "resource_title": "Conversation Topic",
  "interaction_target": "user_message|bot_response|button_click",
  "interaction_text": "Message content or query",
  "session_id": "session-xxx",
  "user_id": "user-xxx",
  "device_id": "device-xxx",
  "metadata": {
    "chat_platform": "slack",
    "intent": "support.query",
    "entities": {"product": "premium"},
    "confidence_score": 0.95,
    "message_count": 6
  }
}
```

#### Speech/Voice Channel

```json
{
  "channel": "speech",
  "platform": "alexa|google-assistant|siri|custom",
  "event_type": "utterance|intent|response|interaction|session|permission|error",
  "event_category": "user_action|system_event|engagement|error",
  "resource_id": "skill-weather-001",
  "resource_title": "Weather Skill",
  "interaction_target": "GetWeatherIntent",
  "interaction_text": "What is the weather in New York",
  "interaction_value": 0.92,
  "session_id": "session-xxx",
  "user_id": "user-xxx",
  "device_id": "device-xxx",
  "metadata": {
    "voice_platform": "alexa",
    "skill_id": "skill-weather-001",
    "intent_name": "GetWeatherIntent",
    "slots": {"city": "New York", "date": "today"},
    "confidence_score": 0.92
  }
}
```

#### Agent/AI Channel

```json
{
  "channel": "agent",
  "platform": "copilot|langchain|autogen|custom",
  "event_type": "prompt|tool|generation|context|inference|decision|thought|feedback|session|resource|error",
  "event_category": "user_action|system_event|engagement|error",
  "resource_id": "task-001",
  "resource_title": "Implement authentication feature",
  "interaction_target": "create_file|user_prompt|gpt-4",
  "interaction_text": "Create a login page with email and password",
  "interaction_value": 250,
  "session_id": "session-xxx",
  "user_id": "user-xxx",
  "device_id": "device-xxx",
  "user_agent": "AIAgent/1.0.0 (copilot)",
  "client_version": "1.0.0",
  "metadata": {
    "agent_platform": "copilot",
    "task_type": "code_generation",
    "language": "javascript",
    "tool_name": "create_file",
    "model_name": "gpt-4",
    "input_tokens": 500,
    "output_tokens": 800
  }
}
```

---

## Event Types by Channel

### Web Channel Event Types

| Event Type | Description | Typical interaction_target Values |
|-----------|-------------|----------------------------------|
| `navigation` | Page views, route changes | page_url, route_name |
| `interaction` | Button clicks, form submissions | button_id, form_id, link_id |
| `session` | Page load, page unload | page_load, page_unload |
| `error` | JavaScript errors, API failures | error_type |

### Mobile Channel Event Types

| Event Type | Description | Typical interaction_target Values |
|-----------|-------------|----------------------------------|
| `navigation` | Screen views, tab switches | screen_name, tab_name |
| `interaction` | Taps, swipes, gestures | button_id, gesture_type |
| `session` | App launch, background, foreground | app_launch, app_background, app_foreground |
| `error` | Crashes, API failures | crash, api_error |

### Chat Channel Event Types

| Event Type | Description | Typical interaction_target Values |
|-----------|-------------|----------------------------------|
| `message` | User/bot messages | user_message, bot_response |
| `intent` | Intent detection | intent_name |
| `interaction` | Button clicks, quick replies | button_id, quick_reply |
| `session` | Conversation start/end | conversation_start, conversation_end |
| `sentiment` | Sentiment analysis | positive, negative, neutral |
| `error` | Fallback, errors | fallback, error_type |

### Speech Channel Event Types

| Event Type | Description | Typical interaction_target Values |
|-----------|-------------|----------------------------------|
| `utterance` | User speech input | voice_command |
| `intent` | Intent recognition | intent_name |
| `response` | Voice responses | speech_response, card_display |
| `interaction` | Audio playback, card displays | audio_playback, card_interaction |
| `session` | Skill launch/end | skill_launch, skill_end |
| `permission` | Permission requests | permission_type |
| `error` | Recognition errors, failures | recognition_error, api_error |

### Agent Channel Event Types

| Event Type | Description | Typical interaction_target Values |
|-----------|-------------|----------------------------------|
| `prompt` | User prompts/instructions | user_prompt |
| `tool` | Tool usage/execution | tool_name |
| `generation` | Code/content generation | code, content, response |
| `context` | Context retrieval | file, documentation, workspace |
| `inference` | Model inference calls | model_name |
| `decision` | Agent decisions | decision_type |
| `thought` | Agent reasoning steps | step_number |
| `feedback` | User feedback | positive, negative, correction |
| `session` | Task start/complete | task_start, task_complete |
| `resource` | Resource usage metrics | usage |
| `error` | Execution errors | error_type |

---

## Event Categories

Standard event categories across all channels:

| Category | Description | Use Cases |
|----------|-------------|-----------|
| `user_action` | User-initiated actions | Clicks, taps, commands, prompts |
| `system_event` | System-generated events | Page loads, app launches, task starts |
| `engagement` | User engagement metrics | Messages, generations, interactions |
| `error` | Error conditions | Failures, crashes, fallbacks |

---

## Validation Rules

### String Fields

- Must be valid UTF-8 strings
- Leading/trailing whitespace is preserved
- Empty strings are allowed for optional fields
- Max lengths enforced as specified in schema

### Required Field Validation

The API will return `400 Bad Request` if any of these conditions are violated:

1. `channel` must be present and non-empty
2. `event_type` must be present and non-empty
3. `session_id` must be present and non-empty

### Recommended Channel Values

While `channel` accepts any string, the following standard values are recommended:

- `web` - Web browsers (desktop, mobile, tablet)
- `mobile` - Native mobile apps (iOS, Android)
- `chat` - Chat platforms (Slack, Teams, WhatsApp, etc.)
- `speech` - Voice assistants (Alexa, Google, Siri)
- `agent` - AI agents and assistants

### Timestamp Format

- Must be ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- If not provided, server timestamp will be used
- Timezone must be UTC (Z suffix)

### Metadata Field

- Must be valid JSON object
- Can contain nested objects and arrays
- No size limit at API level (database storage limits apply)
- Recommended to keep under 10KB for performance

---

## Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Event successfully received and queued |
| 400 | Bad Request | Missing required fields or invalid format |
| 500 | Internal Server Error | Server-side processing error |
| 503 | Service Unavailable | Kafka producer not ready |

---

## Example Requests

### Web Button Click

```bash
curl -X POST http://localhost:3001/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "web",
    "platform": "web-desktop",
    "event_type": "interaction",
    "event_category": "user_action",
    "resource_id": "https://example.com/products",
    "resource_title": "Products Page",
    "interaction_target": "btn-add-to-cart",
    "session_id": "session-1234567890-abc",
    "user_id": "user-456",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "metadata": {
      "product_id": "prod-789",
      "price": 29.99
    }
  }'
```

### Mobile Screen View

```bash
curl -X POST http://localhost:3001/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "mobile",
    "platform": "ios",
    "event_type": "navigation",
    "event_category": "navigation",
    "resource_id": "ProductDetailScreen",
    "resource_title": "Product Detail",
    "session_id": "session-mobile-123",
    "user_id": "user-789",
    "device_id": "device-iphone-456",
    "user_agent": "MyApp/1.0.0 (iOS 17.0; iPhone 14 Pro)",
    "client_version": "1.0.0",
    "metadata": {
      "device_model": "iPhone 14 Pro",
      "os_version": "17.0",
      "previous_screen": "HomeScreen"
    }
  }'
```

### Chat Message

```bash
curl -X POST http://localhost:3001/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "chat",
    "platform": "slack",
    "event_type": "message",
    "event_category": "engagement",
    "resource_id": "conversation-abc-123",
    "resource_title": "Support Conversation",
    "interaction_target": "user_message",
    "interaction_text": "How do I reset my password?",
    "session_id": "session-chat-456",
    "user_id": "user-slack-789",
    "metadata": {
      "chat_platform": "slack",
      "intent": "support.password_reset",
      "confidence_score": 0.89,
      "message_count": 3
    }
  }'
```

### Voice Command

```bash
curl -X POST http://localhost:3001/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "speech",
    "platform": "alexa",
    "event_type": "utterance",
    "event_category": "user_action",
    "resource_id": "skill-weather-001",
    "resource_title": "Weather Skill",
    "interaction_target": "GetWeatherIntent",
    "interaction_text": "What is the weather in New York",
    "interaction_value": 0.92,
    "session_id": "session-alexa-789",
    "user_id": "user-alexa-123",
    "device_id": "device-echo-456",
    "metadata": {
      "voice_platform": "alexa",
      "skill_id": "skill-weather-001",
      "intent_name": "GetWeatherIntent",
      "slots": {
        "city": "New York",
        "date": "today"
      },
      "confidence_score": 0.92
    }
  }'
```

### AI Agent Tool Usage

```bash
curl -X POST http://localhost:3001/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "agent",
    "platform": "copilot",
    "event_type": "tool",
    "event_category": "system_event",
    "resource_id": "task-001",
    "resource_title": "Implement authentication feature",
    "interaction_target": "create_file",
    "interaction_text": "Create src/pages/Login.jsx",
    "interaction_value": 250,
    "session_id": "session-agent-123",
    "user_id": "user-dev-456",
    "user_agent": "AIAgent/1.0.0 (copilot)",
    "client_version": "1.0.0",
    "metadata": {
      "agent_platform": "copilot",
      "task_type": "code_generation",
      "tool_name": "create_file",
      "language": "javascript",
      "execution_time": 250,
      "file_path": "src/pages/Login.jsx"
    }
  }'
```

---

## Rate Limits

**Current Implementation:** No rate limiting

**Recommendation for Production:**
- Implement per-client rate limiting (e.g., 1000 requests/minute)
- Use session_id or IP address for client identification
- Return `429 Too Many Requests` when limit exceeded

---

## Authentication

**Current Implementation:** No authentication required

**Recommendation for Production:**
- Implement API key authentication
- Use HTTPS for secure transmission
- Add `Authorization: Bearer <token>` header requirement

---

## CORS Policy

**Current Implementation:** All origins allowed (`*`)

**Recommendation for Production:**
- Configure allowed origins explicitly
- Restrict to known client domains
- Update CORS configuration in `analytics-api/server.js`

---

## Data Retention

Events are stored in PostgreSQL/TimescaleDB with the following characteristics:

- **Storage**: Time-series optimized hypertable
- **Compression**: Automatic compression for older data
- **Retention**: Configure retention policies as needed
- **Indexes**: Optimized for common query patterns

---

## Testing Guide

### Contract Testing

To verify your implementation conforms to this contract:

1. **Required Fields Test**: Ensure all three required fields are sent
2. **Optional Fields Test**: Verify optional fields are accepted
3. **Invalid Payload Test**: Confirm proper error responses
4. **Timestamp Format Test**: Validate ISO 8601 timestamp handling
5. **Metadata Test**: Verify JSONB metadata is stored correctly

### Example Test Cases

See `examples/` directory for implementation examples:
- `examples/web-analytics.js` - Web implementation (website/analytics.js)
- `examples/mobile-analytics.js` - Mobile implementation
- `examples/chat-analytics.js` - Chat implementation
- `examples/speech-analytics.js` - Voice implementation
- `examples/agent-analytics.js` - AI agent implementation

---

## Change Log

### Version 1.0.0 (2026-01-03)
- Initial contract specification
- Channel-agnostic schema definition
- Multi-channel support (web, mobile, chat, speech, agent)
- API endpoint documentation
- Validation rules and error responses

---

## Support & Resources

### Documentation
- [README.md](./README.md) - Platform overview and setup
- [CHANNEL_AGNOSTIC_SCHEMA.md](./CHANNEL_AGNOSTIC_SCHEMA.md) - Detailed schema documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide

### Implementation Examples
- [website/analytics.js](./website/analytics.js) - Web tracking implementation
- [examples/mobile-analytics.js](./examples/mobile-analytics.js) - Mobile SDK example
- [examples/chat-analytics.js](./examples/chat-analytics.js) - Chat platform example
- [examples/speech-analytics.js](./examples/speech-analytics.js) - Voice assistant example
- [examples/agent-analytics.js](./examples/agent-analytics.js) - AI agent example

### For Issues
Open an issue in the repository with:
- Contract version
- Event payload (sanitized)
- Error message
- Expected vs actual behavior

---

## Contract Compliance

This contract is implemented by:
- **API Server**: `analytics-api/server.js`
- **Database Schema**: `database/init.sql`
- **Stream Processor**: `bento/config.yaml`

Any changes to the contract should be reflected in all three components.

---

**End of Contract Document**
