# GitHub Copilot Agent Skills

This directory contains GitHub Copilot agent skill definitions for the Analytics Platform.

## Available Skills

### validate-contract

Validates analytics events against the Analytics Platform API contract.

**Configuration:** `validate-contract-skill.yml`

**Tool:** `validate-contract.js` (in repository root)

#### Usage

##### With GitHub Copilot Agent

```
@agent use validate-contract to validate my-event.json
@agent use validate-contract to show example agent
@agent use validate-contract to test
```

##### Direct CLI Usage

```bash
# Validate an event file
node validate-contract.js my-event.json

# Show example for a channel
node validate-contract.js --example web
node validate-contract.js --example mobile
node validate-contract.js --example chat
node validate-contract.js --example speech
node validate-contract.js --example agent

# Run all tests
node validate-contract.js --test
```

#### Capabilities

- **Event Validation**: Validates event payloads against contract requirements
- **Contract Testing**: Runs comprehensive test suite
- **Schema Verification**: Checks required fields, types, and constraints
- **Example Generation**: Provides valid examples for each channel

#### What It Validates

✅ Required fields (`channel`, `event_type`, `session_id`)  
✅ Field types (strings, numbers, objects)  
✅ Field length constraints (max lengths per database schema)  
✅ Channel values (web, mobile, chat, speech, agent)  
✅ Event category values (user_action, system_event, engagement, error)  
✅ Timestamp format (ISO 8601)  
✅ Metadata structure (valid JSON)

#### Example Output

```
✅ VALIDATION PASSED

Warnings:
  1. No timestamp provided - server will add one
```

or

```
❌ VALIDATION FAILED

Errors:
  1. Missing required field: channel
  2. Field 'event_type' must be a string, got number
```

## Adding New Skills

To add a new agent skill:

1. Create a YAML configuration file in this directory
2. Follow the structure of existing skills
3. Ensure the tool/script is accessible from the repository
4. Document usage and examples
5. Update this README

## Related Documentation

- [CONTRACT.md](../../CONTRACT.md) - Complete API contract specification
- [CONTRACT_TESTING.md](../../CONTRACT_TESTING.md) - Testing documentation
- [event-schema.json](../../event-schema.json) - JSON Schema for validation
- [validate-contract.js](../../validate-contract.js) - Validation tool
