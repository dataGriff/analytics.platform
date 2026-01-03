// Integration Test for Analytics Platform
// This test ensures a web event flows through the entire pipeline:
// Analytics API → Kafka → Bento → PostgreSQL

const http = require('http');
const https = require('https');
const { Client } = require('pg');
const crypto = require('crypto');

// Configuration
const ANALYTICS_API_URL = 'http://localhost:3001';
const POSTGRES_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'analytics',
  password: 'analytics123',
  database: 'analytics'
};

// Configurable wait time (can be overridden via environment variable)
const PROCESSING_WAIT_TIME = parseInt(process.env.TEST_WAIT_TIME || '10000', 10);

// Test event data (example web event)
const TEST_EVENT = {
  channel: 'web',
  platform: 'web-desktop',
  event_type: 'interaction',
  event_category: 'user_action',
  resource_id: 'http://localhost:8080/test-page',
  resource_title: 'Test Page',
  interaction_target: 'btn-test-click',
  session_id: `test-session-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
  user_id: 'test-user-123',
  device_id: 'test-device-456',
  user_agent: 'Mozilla/5.0 (Test)',
  client_version: '1.0.0',
  interaction_value: null,
  interaction_text: 'Test Button',
  timestamp: new Date().toISOString(),
  metadata: {
    test: true,
    test_run_id: Date.now()
  }
};

// Helper function to send HTTP POST request
function sendPostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            statusCode: res.statusCode,
            body: responseBody
          });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Helper function to check API health
async function checkAPIHealth() {
  return new Promise((resolve, reject) => {
    http.get(`${ANALYTICS_API_URL}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          resolve(health);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Helper function to query PostgreSQL
async function queryDatabase(sessionId) {
  const client = new Client(POSTGRES_CONFIG);
  
  try {
    await client.connect();
    
    const query = 'SELECT * FROM analytics_events WHERE session_id = $1';
    const result = await client.query(query, [sessionId]);
    
    return result.rows;
  } finally {
    await client.end();
  }
}

// Helper function to wait/sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test function
async function runIntegrationTest() {
  console.log('='.repeat(60));
  console.log('Analytics Platform Integration Test');
  console.log('='.repeat(60));
  
  let testPassed = false;
  let errorMessage = '';
  
  try {
    // Step 1: Check API health
    console.log('\n[1/5] Checking Analytics API health...');
    const health = await checkAPIHealth();
    console.log(`✓ API Status: ${health.status}`);
    console.log(`✓ Kafka Ready: ${health.kafkaReady}`);
    
    if (!health.kafkaReady) {
      throw new Error('Kafka is not ready. Ensure all services are running.');
    }
    
    // Step 2: Send test event
    console.log('\n[2/5] Sending test event to Analytics API...');
    const response = await sendPostRequest(`${ANALYTICS_API_URL}/analytics`, TEST_EVENT);
    console.log(`✓ Event sent successfully (HTTP ${response.statusCode})`);
    console.log(`✓ Session ID: ${TEST_EVENT.session_id}`);
    
    // Step 3: Wait for event processing
    console.log(`\n[3/5] Waiting for event processing (${PROCESSING_WAIT_TIME / 1000} seconds)...`);
    console.log('   Event flow: API → Kafka → Bento → PostgreSQL');
    await sleep(PROCESSING_WAIT_TIME);
    console.log('✓ Wait completed');
    
    // Step 4: Query database
    console.log('\n[4/5] Querying PostgreSQL database...');
    const events = await queryDatabase(TEST_EVENT.session_id);
    
    if (events.length === 0) {
      throw new Error(`No events found in database with session_id: ${TEST_EVENT.session_id}`);
    }
    
    console.log(`✓ Found ${events.length} event(s) in database`);
    
    // Step 5: Verify event data
    console.log('\n[5/5] Verifying event data...');
    const event = events[0];
    
    // Verify critical fields
    const assertions = [
      { field: 'channel', expected: TEST_EVENT.channel, actual: event.channel },
      { field: 'platform', expected: TEST_EVENT.platform, actual: event.platform },
      { field: 'event_type', expected: TEST_EVENT.event_type, actual: event.event_type },
      { field: 'event_category', expected: TEST_EVENT.event_category, actual: event.event_category },
      { field: 'resource_id', expected: TEST_EVENT.resource_id, actual: event.resource_id },
      { field: 'session_id', expected: TEST_EVENT.session_id, actual: event.session_id },
      { field: 'user_id', expected: TEST_EVENT.user_id, actual: event.user_id }
    ];
    
    let allAssertionsPassed = true;
    for (const assertion of assertions) {
      if (assertion.expected === assertion.actual) {
        console.log(`✓ ${assertion.field}: ${assertion.actual}`);
      } else {
        console.log(`✗ ${assertion.field}: expected "${assertion.expected}", got "${assertion.actual}"`);
        allAssertionsPassed = false;
      }
    }
    
    if (!allAssertionsPassed) {
      throw new Error('Event data verification failed');
    }
    
    testPassed = true;
    
  } catch (error) {
    errorMessage = error.message;
    console.error('\n✗ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠ Connection refused. Make sure all services are running:');
      console.error('   docker-compose up -d');
    }
  }
  
  // Print results
  console.log('\n' + '='.repeat(60));
  if (testPassed) {
    console.log('TEST RESULT: ✓ PASSED');
    console.log('='.repeat(60));
    process.exit(0);
  } else {
    console.log('TEST RESULT: ✗ FAILED');
    console.log('Error:', errorMessage);
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Run the test
runIntegrationTest().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
