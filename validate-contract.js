#!/usr/bin/env node

/**
 * Analytics Platform - Contract Validator
 * 
 * This script validates event payloads against the Analytics Platform contract
 * without requiring the API server to be running.
 * 
 * Usage:
 *   node validate-contract.js <event-file.json>
 *   node validate-contract.js --example web
 *   node validate-contract.js --test
 */

// Required fields as per contract
const REQUIRED_FIELDS = ['channel', 'event_type', 'session_id'];

// Valid channel values (recommended)
const VALID_CHANNELS = ['web', 'mobile', 'chat', 'speech', 'agent'];

// Valid event categories
const VALID_CATEGORIES = ['user_action', 'system_event', 'engagement', 'error'];

// Field max lengths as per database schema
const FIELD_CONSTRAINTS = {
  channel: 50,
  platform: 100,
  event_type: 100,
  event_category: 100,
  resource_id: 500,
  resource_title: 200,
  interaction_target: 200,
  session_id: 100,
  user_id: 100,
  device_id: 100,
  client_version: 50
};

// Example events for testing
const EXAMPLE_EVENTS = {
  web: {
    channel: 'web',
    platform: 'web-desktop',
    event_type: 'interaction',
    event_category: 'user_action',
    resource_id: 'https://example.com/products',
    resource_title: 'Products Page',
    interaction_target: 'btn-add-to-cart',
    session_id: 'session-1234567890-abc',
    user_id: 'user-456',
    metadata: { product_id: 'prod-789' }
  },
  mobile: {
    channel: 'mobile',
    platform: 'ios',
    event_type: 'navigation',
    event_category: 'navigation',
    resource_id: 'ProductDetailScreen',
    resource_title: 'Product Detail',
    session_id: 'session-mobile-123',
    user_id: 'user-789',
    device_id: 'device-iphone-456',
    metadata: { device_model: 'iPhone 14 Pro' }
  },
  chat: {
    channel: 'chat',
    platform: 'slack',
    event_type: 'message',
    event_category: 'engagement',
    resource_id: 'conversation-abc-123',
    interaction_text: 'How do I reset my password?',
    session_id: 'session-chat-456',
    metadata: { intent: 'support.password_reset' }
  },
  speech: {
    channel: 'speech',
    platform: 'alexa',
    event_type: 'utterance',
    event_category: 'user_action',
    resource_id: 'skill-weather-001',
    interaction_target: 'GetWeatherIntent',
    interaction_text: 'What is the weather in New York',
    interaction_value: 0.92,
    session_id: 'session-alexa-789',
    metadata: { confidence_score: 0.92 }
  },
  agent: {
    channel: 'agent',
    platform: 'copilot',
    event_type: 'tool',
    event_category: 'system_event',
    resource_id: 'task-001',
    resource_title: 'Implement authentication',
    interaction_target: 'create_file',
    interaction_value: 250,
    session_id: 'session-agent-123',
    metadata: { tool_name: 'create_file', language: 'javascript' }
  },
  minimal: {
    channel: 'web',
    event_type: 'interaction',
    session_id: 'session-minimal-001'
  }
};

class ContractValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validate(event) {
    this.errors = [];
    this.warnings = [];

    if (typeof event !== 'object' || event === null) {
      this.errors.push('Event must be a JSON object');
      return false;
    }

    this.validateRequiredFields(event);
    this.validateFieldTypes(event);
    this.validateFieldLengths(event);
    this.validateChannelValue(event);
    this.validateCategoryValue(event);
    this.validateTimestamp(event);
    this.validateMetadata(event);

    return this.errors.length === 0;
  }

  validateRequiredFields(event) {
    for (const field of REQUIRED_FIELDS) {
      if (!event[field] || event[field] === '') {
        this.errors.push(`Missing required field: ${field}`);
      }
    }
  }

  validateFieldTypes(event) {
    const stringFields = [
      'channel', 'platform', 'event_type', 'event_category',
      'resource_id', 'resource_title', 'interaction_target',
      'session_id', 'user_id', 'device_id', 'user_agent',
      'client_version', 'interaction_text', 'timestamp'
    ];

    for (const field of stringFields) {
      if (event[field] !== undefined && event[field] !== null && typeof event[field] !== 'string') {
        this.errors.push(`Field '${field}' must be a string, got ${typeof event[field]}`);
      }
    }

    if (event.interaction_value !== undefined && event.interaction_value !== null) {
      if (typeof event.interaction_value !== 'number') {
        this.errors.push(`Field 'interaction_value' must be a number, got ${typeof event.interaction_value}`);
      }
    }

    if (event.metadata !== undefined && event.metadata !== null) {
      if (typeof event.metadata !== 'object') {
        this.errors.push(`Field 'metadata' must be an object, got ${typeof event.metadata}`);
      }
    }
  }

  validateFieldLengths(event) {
    for (const [field, maxLength] of Object.entries(FIELD_CONSTRAINTS)) {
      if (event[field] && event[field].length > maxLength) {
        this.errors.push(`Field '${field}' exceeds max length of ${maxLength} (current: ${event[field].length})`);
      }
    }
  }

  validateChannelValue(event) {
    if (event.channel && !VALID_CHANNELS.includes(event.channel)) {
      this.warnings.push(`Channel '${event.channel}' is not a standard value. Recommended: ${VALID_CHANNELS.join(', ')}`);
    }
  }

  validateCategoryValue(event) {
    if (event.event_category && !VALID_CATEGORIES.includes(event.event_category)) {
      this.warnings.push(`Event category '${event.event_category}' is not a standard value. Recommended: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  validateTimestamp(event) {
    if (event.timestamp) {
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      if (!iso8601Regex.test(event.timestamp)) {
        this.errors.push(`Timestamp must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ), got: ${event.timestamp}`);
      }
    } else {
      this.warnings.push('No timestamp provided - server will add one');
    }
  }

  validateMetadata(event) {
    if (event.metadata) {
      try {
        JSON.stringify(event.metadata);
      } catch (e) {
        this.errors.push(`Metadata is not valid JSON: ${e.message}`);
      }
    }
  }

  getReport() {
    let report = '';
    
    if (this.errors.length > 0) {
      report += '❌ VALIDATION FAILED\n\n';
      report += 'Errors:\n';
      this.errors.forEach((error, i) => {
        report += `  ${i + 1}. ${error}\n`;
      });
    } else {
      report += '✅ VALIDATION PASSED\n';
    }

    if (this.warnings.length > 0) {
      report += '\nWarnings:\n';
      this.warnings.forEach((warning, i) => {
        report += `  ${i + 1}. ${warning}\n`;
      });
    }

    return report;
  }
}

// CLI handling
function printUsage() {
  console.log(`
Analytics Platform - Contract Validator

Usage:
  node validate-contract.js <event-file.json>    Validate a JSON event file
  node validate-contract.js --example <channel>  Show example for channel (web, mobile, chat, speech, agent)
  node validate-contract.js --test               Run all test cases

Examples:
  node validate-contract.js my-event.json
  node validate-contract.js --example web
  node validate-contract.js --test
  `);
}

function validateFile(filename) {
  const fs = require('fs');
  
  try {
    const content = fs.readFileSync(filename, 'utf8');
    const event = JSON.parse(content);
    
    console.log(`\nValidating event from: ${filename}\n`);
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('\n' + '='.repeat(60) + '\n');
    
    const validator = new ContractValidator();
    validator.validate(event);
    console.log(validator.getReport());
    
    return validator.errors.length === 0;
  } catch (e) {
    console.error(`Error reading or parsing file: ${e.message}`);
    return false;
  }
}

function showExample(channel) {
  if (!EXAMPLE_EVENTS[channel]) {
    console.error(`Unknown channel: ${channel}`);
    console.log(`Available channels: ${Object.keys(EXAMPLE_EVENTS).join(', ')}`);
    return;
  }
  
  console.log(`\nExample ${channel} event:\n`);
  console.log(JSON.stringify(EXAMPLE_EVENTS[channel], null, 2));
  console.log('\n' + '='.repeat(60) + '\n');
  
  const validator = new ContractValidator();
  validator.validate(EXAMPLE_EVENTS[channel]);
  console.log(validator.getReport());
}

function runTests() {
  console.log('\nRunning Contract Validation Tests\n');
  console.log('='.repeat(60) + '\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test valid events
  console.log('Testing valid events:\n');
  
  for (const [name, event] of Object.entries(EXAMPLE_EVENTS)) {
    const validator = new ContractValidator();
    const isValid = validator.validate(event);
    
    if (isValid) {
      console.log(`✅ ${name}: PASS`);
      passed++;
    } else {
      console.log(`❌ ${name}: FAIL`);
      console.log(validator.getReport());
      failed++;
    }
  }
  
  // Test invalid events
  console.log('\nTesting invalid events:\n');
  
  const invalidEvents = [
    { name: 'missing_channel', event: { event_type: 'interaction', session_id: 'test' } },
    { name: 'missing_event_type', event: { channel: 'web', session_id: 'test' } },
    { name: 'missing_session_id', event: { channel: 'web', event_type: 'interaction' } },
    { name: 'empty_channel', event: { channel: '', event_type: 'interaction', session_id: 'test' } },
    { name: 'invalid_timestamp', event: { channel: 'web', event_type: 'interaction', session_id: 'test', timestamp: '2024-01-01' } }
  ];
  
  for (const { name, event } of invalidEvents) {
    const validator = new ContractValidator();
    const isValid = validator.validate(event);
    
    if (!isValid) {
      console.log(`✅ ${name}: Correctly rejected`);
      passed++;
    } else {
      console.log(`❌ ${name}: Should have been rejected`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  
  return failed === 0;
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
  process.exit(1);
}

if (args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(0);
}

if (args[0] === '--test') {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

if (args[0] === '--example') {
  if (args.length < 2) {
    console.error('Please specify a channel');
    console.log(`Available channels: ${Object.keys(EXAMPLE_EVENTS).join(', ')}`);
    process.exit(1);
  }
  showExample(args[1]);
  process.exit(0);
}

// Assume it's a file path
const success = validateFile(args[0]);
process.exit(success ? 0 : 1);
