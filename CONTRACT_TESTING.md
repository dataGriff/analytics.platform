# Contract Testing Examples

This directory contains example payloads and test cases for validating compliance with the Analytics Platform API contract.

## Purpose

These examples serve multiple purposes:

1. **Integration Testing**: Verify your client implementation sends valid events
2. **Contract Validation**: Ensure the API correctly accepts/rejects payloads
3. **Documentation**: Illustrate correct usage patterns for each channel
4. **AI Training**: Help AI systems understand the expected format

## Test Categories

### 1. Valid Event Examples

These payloads should be **accepted** by the API (200 OK response).

#### Minimum Valid Event

```json
{
  "channel": "web",
  "event_type": "interaction",
  "session_id": "session-test-001"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Event received and sent to Kafka",
  "eventId": "session-test-001"
}
```

---

#### Complete Web Event

```json
{
  "channel": "web",
  "platform": "web-desktop",
  "event_type": "interaction",
  "event_category": "user_action",
  "resource_id": "https://example.com/products",
  "resource_title": "Products Page",
  "interaction_target": "btn-add-to-cart",
  "session_id": "session-1234567890-abc",
  "user_id": "user-456",
  "device_id": "device-789",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "client_version": "1.0.0",
  "interaction_value": 29.99,
  "interaction_text": "Product added to cart",
  "timestamp": "2026-01-03T12:00:00.000Z",
  "metadata": {
    "product_id": "prod-789",
    "price": 29.99,
    "quantity": 1
  }
}
```

---

#### Complete Mobile Event

```json
{
  "channel": "mobile",
  "platform": "ios",
  "event_type": "navigation",
  "event_category": "navigation",
  "resource_id": "ProductDetailScreen",
  "resource_title": "Product Detail",
  "interaction_target": null,
  "session_id": "session-mobile-123",
  "user_id": "user-789",
  "device_id": "device-iphone-456",
  "user_agent": "MyApp/1.0.0 (iOS 17.0; iPhone 14 Pro)",
  "client_version": "1.0.0",
  "timestamp": "2026-01-03T12:01:00.000Z",
  "metadata": {
    "device_model": "iPhone 14 Pro",
    "os_version": "17.0",
    "app_state": "active",
    "previous_screen": "HomeScreen"
  }
}
```

---

#### Complete Chat Event

```json
{
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
  "timestamp": "2026-01-03T12:02:00.000Z",
  "metadata": {
    "chat_platform": "slack",
    "intent": "support.password_reset",
    "confidence_score": 0.89,
    "message_count": 3
  }
}
```

---

#### Complete Speech Event

```json
{
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
  "timestamp": "2026-01-03T12:03:00.000Z",
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
}
```

---

#### Complete Agent Event

```json
{
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
  "timestamp": "2026-01-03T12:04:00.000Z",
  "metadata": {
    "agent_platform": "copilot",
    "task_type": "code_generation",
    "tool_name": "create_file",
    "language": "javascript",
    "execution_time": 250,
    "file_path": "src/pages/Login.jsx",
    "lines_of_code": 75
  }
}
```

---

### 2. Invalid Event Examples

These payloads should be **rejected** by the API (400 Bad Request response).

#### Missing Required Field: channel

```json
{
  "event_type": "interaction",
  "session_id": "session-test-001"
}
```

**Expected Response:**
```json
{
  "error": "Bad request",
  "message": "Missing required fields: event_type, channel, session_id"
}
```

---

#### Missing Required Field: event_type

```json
{
  "channel": "web",
  "session_id": "session-test-001"
}
```

**Expected Response:**
```json
{
  "error": "Bad request",
  "message": "Missing required fields: event_type, channel, session_id"
}
```

---

#### Missing Required Field: session_id

```json
{
  "channel": "web",
  "event_type": "interaction"
}
```

**Expected Response:**
```json
{
  "error": "Bad request",
  "message": "Missing required fields: event_type, channel, session_id"
}
```

---

#### Empty Required Field

```json
{
  "channel": "",
  "event_type": "interaction",
  "session_id": "session-test-001"
}
```

**Expected Response:**
```json
{
  "error": "Bad request",
  "message": "Missing required fields: event_type, channel, session_id"
}
```

---

### 3. Edge Case Examples

These test boundary conditions and edge cases.

#### Event with Null Optional Fields

```json
{
  "channel": "web",
  "platform": null,
  "event_type": "interaction",
  "event_category": null,
  "resource_id": null,
  "resource_title": null,
  "interaction_target": null,
  "session_id": "session-test-001",
  "user_id": null,
  "device_id": null,
  "user_agent": null,
  "client_version": null,
  "interaction_value": null,
  "interaction_text": null,
  "timestamp": null,
  "metadata": null
}
```

**Expected**: Should be accepted (200 OK). Server will add timestamp if null.

---

#### Event with Empty Metadata Object

```json
{
  "channel": "web",
  "event_type": "interaction",
  "session_id": "session-test-001",
  "metadata": {}
}
```

**Expected**: Should be accepted (200 OK).

---

#### Event with Complex Nested Metadata

```json
{
  "channel": "agent",
  "event_type": "tool",
  "session_id": "session-test-001",
  "metadata": {
    "execution": {
      "start_time": "2026-01-03T12:00:00.000Z",
      "end_time": "2026-01-03T12:00:05.000Z",
      "duration_ms": 5000
    },
    "resources": {
      "cpu_usage": 45.2,
      "memory_mb": 256
    },
    "tags": ["production", "high-priority"],
    "config": {
      "retry_count": 3,
      "timeout": 30000
    }
  }
}
```

**Expected**: Should be accepted (200 OK). JSONB can handle nested structures.

---

#### Event with Very Long String

```json
{
  "channel": "web",
  "event_type": "interaction",
  "session_id": "session-test-001",
  "interaction_text": "Lorem ipsum dolor sit amet... [500+ character string]"
}
```

**Expected**: Should be accepted (200 OK). `interaction_text` is TEXT type with no limit.

---

#### Event with Special Characters

```json
{
  "channel": "chat",
  "event_type": "message",
  "session_id": "session-test-001",
  "interaction_text": "Hello! How are you? 😊 I need help with <special> & \"quoted\" characters."
}
```

**Expected**: Should be accepted (200 OK). UTF-8 encoding handles special characters.

---

#### Event with Non-Standard Channel

```json
{
  "channel": "custom-iot-device",
  "platform": "raspberry-pi",
  "event_type": "sensor_reading",
  "session_id": "session-iot-001",
  "metadata": {
    "sensor_type": "temperature",
    "value": 72.5,
    "unit": "fahrenheit"
  }
}
```

**Expected**: Should be accepted (200 OK). Channel is flexible to support future use cases.

---

## Testing Scripts

### Bash Script (using curl)

```bash
#!/bin/bash

API_URL="http://localhost:3001/analytics"

echo "Testing valid event..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "web",
    "event_type": "interaction",
    "session_id": "session-test-001"
  }'

echo -e "\n\nTesting missing channel (should fail)..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "interaction",
    "session_id": "session-test-001"
  }'

echo -e "\n\nTesting missing event_type (should fail)..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "web",
    "session_id": "session-test-001"
  }'

echo -e "\n\nTesting missing session_id (should fail)..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "web",
    "event_type": "interaction"
  }'
```

Save as `test-contract.sh` and run:
```bash
chmod +x test-contract.sh
./test-contract.sh
```

---

### JavaScript/Node.js Script

```javascript
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/analytics';

async function testEvent(description, payload, shouldSucceed = true) {
  console.log(`\nTesting: ${description}`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (shouldSucceed && response.ok) {
      console.log('✓ PASS: Event accepted');
    } else if (!shouldSucceed && !response.ok) {
      console.log('✓ PASS: Event rejected as expected');
    } else {
      console.log('✗ FAIL: Unexpected response');
    }
    
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('✗ FAIL: Error sending event', error.message);
  }
}

async function runTests() {
  // Valid events
  await testEvent('Minimum valid event', {
    channel: 'web',
    event_type: 'interaction',
    session_id: 'session-test-001'
  }, true);

  await testEvent('Complete web event', {
    channel: 'web',
    platform: 'web-desktop',
    event_type: 'interaction',
    event_category: 'user_action',
    resource_id: 'https://example.com/products',
    resource_title: 'Products Page',
    interaction_target: 'btn-add-to-cart',
    session_id: 'session-test-002',
    user_id: 'user-456',
    metadata: { product_id: 'prod-789' }
  }, true);

  // Invalid events
  await testEvent('Missing channel', {
    event_type: 'interaction',
    session_id: 'session-test-003'
  }, false);

  await testEvent('Missing event_type', {
    channel: 'web',
    session_id: 'session-test-004'
  }, false);

  await testEvent('Missing session_id', {
    channel: 'web',
    event_type: 'interaction'
  }, false);
}

runTests();
```

Save as `test-contract.js` and run:
```bash
npm install node-fetch
node test-contract.js
```

---

### Python Script

```python
import requests
import json

API_URL = 'http://localhost:3001/analytics'

def test_event(description, payload, should_succeed=True):
    print(f"\nTesting: {description}")
    
    try:
        response = requests.post(
            API_URL,
            headers={'Content-Type': 'application/json'},
            json=payload
        )
        
        result = response.json()
        
        if should_succeed and response.ok:
            print('✓ PASS: Event accepted')
        elif not should_succeed and not response.ok:
            print('✓ PASS: Event rejected as expected')
        else:
            print('✗ FAIL: Unexpected response')
        
        print(f'Response: {json.dumps(result, indent=2)}')
    except Exception as e:
        print(f'✗ FAIL: Error sending event: {e}')

def run_tests():
    # Valid events
    test_event('Minimum valid event', {
        'channel': 'web',
        'event_type': 'interaction',
        'session_id': 'session-test-001'
    }, True)

    test_event('Complete mobile event', {
        'channel': 'mobile',
        'platform': 'ios',
        'event_type': 'navigation',
        'event_category': 'navigation',
        'resource_id': 'HomeScreen',
        'session_id': 'session-test-002',
        'user_id': 'user-789',
        'metadata': {'device_model': 'iPhone 14 Pro'}
    }, True)

    # Invalid events
    test_event('Missing channel', {
        'event_type': 'interaction',
        'session_id': 'session-test-003'
    }, False)

    test_event('Missing event_type', {
        'channel': 'web',
        'session_id': 'session-test-004'
    }, False)

    test_event('Missing session_id', {
        'channel': 'web',
        'event_type': 'interaction'
    }, False)

if __name__ == '__main__':
    run_tests()
```

Save as `test-contract.py` and run:
```bash
pip install requests
python test-contract.py
```

---

## Validation Tools

### JSON Schema Validation

Use the provided `event-schema.json` file with a JSON Schema validator:

```javascript
const Ajv = require('ajv');
const schema = require('./event-schema.json');

const ajv = new Ajv();
const validate = ajv.compile(schema);

const event = {
  channel: 'web',
  event_type: 'interaction',
  session_id: 'session-test-001'
};

const valid = validate(event);
if (valid) {
  console.log('Event is valid!');
} else {
  console.log('Validation errors:', validate.errors);
}
```

---

## Best Practices

1. **Always Include Required Fields**: `channel`, `event_type`, `session_id`
2. **Use Standard Channel Values**: `web`, `mobile`, `chat`, `speech`, `agent`
3. **Include Descriptive event_type**: Use consistent naming across implementations
4. **Add Rich Metadata**: Include channel-specific details in the `metadata` field
5. **Set Appropriate Timestamps**: Use ISO 8601 format with UTC timezone
6. **Track Sessions Properly**: Use consistent `session_id` across related events
7. **Handle Errors Gracefully**: Implement retry logic for failed submissions
8. **Validate Before Sending**: Use JSON Schema validation in your client code

---

## Related Documentation

- [CONTRACT.md](../CONTRACT.md) - Complete API contract specification
- [event-schema.json](../event-schema.json) - JSON Schema for validation
- [CHANNEL_AGNOSTIC_SCHEMA.md](../CHANNEL_AGNOSTIC_SCHEMA.md) - Detailed schema documentation
- [examples/](../examples/) - Implementation examples for each channel

---

**End of Contract Testing Examples**
