# Analytics Platform Tests

This directory contains integration tests for the analytics platform.

## Integration Test

The `integration.test.js` file contains an end-to-end test that verifies the complete analytics pipeline:

```
Website Event → Analytics API → Kafka → Bento → PostgreSQL
```

### What It Tests

1. **Analytics API Health**: Verifies the API is running and Kafka is ready
2. **Event Submission**: Sends a test web event to the Analytics API
3. **Event Processing**: Waits for the event to flow through the pipeline
4. **Database Verification**: Queries PostgreSQL to confirm the event was stored
5. **Data Integrity**: Validates all event fields match expected values

### Prerequisites

Before running the tests, ensure all services are running:

```bash
# From the root directory
docker-compose up -d

# Wait for services to be ready (30-60 seconds)
docker-compose logs -f analytics-api
# Look for "Analytics API listening on port 3001"
```

### Running the Test

```bash
# Install dependencies
cd tests
npm install

# Run the test
npm test

# Optional: Configure wait time (in milliseconds)
TEST_WAIT_TIME=15000 npm test
```

The test waits 10 seconds by default for event processing. If your system is slower, you can increase this using the `TEST_WAIT_TIME` environment variable.

### Expected Output

When successful, you should see:

```
============================================================
Analytics Platform Integration Test
============================================================

[1/5] Checking Analytics API health...
✓ API Status: ok
✓ Kafka Ready: true

[2/5] Sending test event to Analytics API...
✓ Event sent successfully (HTTP 200)
✓ Session ID: test-session-1234567890

[3/5] Waiting for event processing (10 seconds)...
   Event flow: API → Kafka → Bento → PostgreSQL
✓ Wait completed

[4/5] Querying PostgreSQL database...
✓ Found 1 event(s) in database

[5/5] Verifying event data...
✓ channel: web
✓ platform: web-desktop
✓ event_type: interaction
✓ event_category: user_action
✓ resource_id: http://localhost:8080/test-page
✓ session_id: test-session-1234567890
✓ user_id: test-user-123

============================================================
TEST RESULT: ✓ PASSED
============================================================
```

### Troubleshooting

**Connection Refused Error**
- Make sure Docker services are running: `docker-compose up -d`
- Check service status: `docker-compose ps`
- View logs: `docker-compose logs`

**Event Not Found in Database**
- Increase wait time if your system is slow
- Check Bento logs: `docker-compose logs bento`
- Verify Kafka is working: `docker-compose logs kafka`

**Test Timeout**
- Ensure all services have sufficient resources
- Check that PostgreSQL is accepting connections
- Verify network connectivity between containers

## Agent Skill

The test is integrated with a GitHub Copilot agent skill (`../.github/agents/verify-changes.md`) that automatically runs the verification before committing changes.

To use the skill:
1. Make your code changes
2. Invoke the "Verify Changes" skill
3. The skill will run the integration test
4. Only commit if the test passes

This ensures that all changes maintain the platform's core functionality.
