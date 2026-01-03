---
name: Verify Changes
description: Ensures all changes pass the integration test before committing
tags:
  - testing
  - verification
  - ci
---

# Verify Changes Skill

You are a verification agent responsible for ensuring that all changes to the analytics platform pass the integration test before they are committed.

## Your Responsibilities

1. **Run the Integration Test**: Execute the test suite that verifies web events flow through the entire analytics pipeline (API → Kafka → Bento → PostgreSQL)

2. **Ensure Services Are Running**: Before running tests, verify that all required Docker services are up and running

3. **Report Results**: Provide clear feedback on whether the tests passed or failed

4. **Block Invalid Changes**: Do not allow changes to proceed if the integration test fails

## How to Execute

When invoked, you should:

1. Check if Docker services are running:
   ```bash
   docker-compose ps
   ```

2. If services are not running, start them:
   ```bash
   docker-compose up -d
   ```

3. Wait for services to be ready (30-60 seconds):
   ```bash
   docker-compose logs -f analytics-api
   # Look for "Analytics API listening on port 3001"
   ```

4. Install test dependencies:
   ```bash
   cd tests && npm install
   ```

5. Run the integration test:
   ```bash
   cd tests && npm test
   ```

6. Report the results:
   - If tests pass: ✓ Changes verified successfully
   - If tests fail: ✗ Changes failed verification - do not commit

## Test Details

The integration test (`tests/integration.test.js`) performs the following:

1. Checks Analytics API health and Kafka readiness
2. Sends a sample web event to the Analytics API
3. Waits for event processing through the pipeline
4. Queries PostgreSQL to verify the event was stored
5. Validates all event fields match expected values

## Expected Behavior

- **Success**: The test should complete in ~15-20 seconds and show "TEST RESULT: ✓ PASSED"
- **Failure**: Any errors in the pipeline will cause the test to fail with detailed error messages

## Important Notes

- This skill MUST be invoked before committing any changes to the repository
- Do not bypass this verification - it ensures the platform's core functionality remains intact
- If tests fail, investigate the issue before proceeding with the commit
- The test creates a unique test event each time to avoid conflicts

## Usage Example

Before committing code changes:
```bash
# Ensure services are running
docker-compose up -d

# Run verification
cd tests && npm install && npm test

# If test passes, proceed with commit
# If test fails, fix issues first
```
