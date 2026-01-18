#!/usr/bin/env node

// Script to send 1000 test events through the analytics system
const axios = require('axios');

const API_ENDPOINT = 'http://localhost:3001/analytics';
const NUM_EVENTS = 1000;

// Different channels and event types to simulate real usage
const channels = ['web', 'mobile', 'chat', 'voice'];
const eventTypes = ['page_view', 'button_click', 'message_sent', 'message_received', 'session_start', 'session_end'];
const eventCategories = ['user_action', 'system_event', 'navigation', 'engagement'];
const platforms = {
  web: ['chrome', 'firefox', 'safari', 'edge'],
  mobile: ['ios', 'android'],
  chat: ['slack', 'teams', 'web-chat', 'whatsapp'],
  voice: ['alexa', 'google-assistant', 'phone']
};

// Generate random user IDs and session IDs
const userIds = Array.from({ length: 50 }, (_, i) => `user-${i + 1}`);
const sessionIds = Array.from({ length: 100 }, (_, i) => `session-${Date.now()}-${i}`);

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEvent(index) {
  const channel = getRandomItem(channels);
  const platform = getRandomItem(platforms[channel]);
  const eventType = getRandomItem(eventTypes);
  const eventCategory = getRandomItem(eventCategories);
  const userId = getRandomItem(userIds);
  const sessionId = getRandomItem(sessionIds);
  
  return {
    // Channel information
    channel: channel,
    platform: platform,
    
    // Event classification
    event_type: eventType,
    event_category: eventCategory,
    
    // Context information
    resource_id: `resource-${Math.floor(Math.random() * 20) + 1}`,
    resource_title: `Test Resource ${Math.floor(Math.random() * 20) + 1}`,
    interaction_target: eventType.includes('click') ? `button-${Math.floor(Math.random() * 10) + 1}` : null,
    
    // Session and user tracking
    session_id: sessionId,
    device_id: `device-${Math.floor(Math.random() * 30) + 1}`,
    user_id: userId,
    
    // Technical metadata
    user_agent: `TestAgent/1.0 (${platform})`,
    client_version: '1.0.0',
    
    // Interaction-specific data
    interaction_text: eventType.includes('message') ? `Test message ${index}` : null,
    interaction_value: Math.random() * 100,
    
    // Timestamp
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time within last hour
    
    // Additional context
    custom_data: {
      test_batch: 'load-test-1000',
      event_index: index,
      environment: 'test'
    }
  };
}

async function sendEvent(event, index) {
  try {
    await axios.post(API_ENDPOINT, event);
    return { success: true, index };
  } catch (error) {
    return { 
      success: false, 
      index, 
      error: error.response?.data || error.message 
    };
  }
}

async function sendEventsInBatches(totalEvents, batchSize = 50) {
  console.log(`Sending ${totalEvents} events to ${API_ENDPOINT}...`);
  console.log(`Batch size: ${batchSize}\n`);
  
  const startTime = Date.now();
  let successCount = 0;
  let failureCount = 0;
  const failures = [];
  
  for (let i = 0; i < totalEvents; i += batchSize) {
    const batchEnd = Math.min(i + batchSize, totalEvents);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(totalEvents / batchSize);
    
    console.log(`Sending batch ${batchNumber}/${totalBatches} (events ${i + 1}-${batchEnd})...`);
    
    // Send batch of events in parallel
    const batchPromises = [];
    for (let j = i; j < batchEnd; j++) {
      const event = generateEvent(j + 1);
      batchPromises.push(sendEvent(event, j + 1));
    }
    
    const results = await Promise.all(batchPromises);
    
    // Count successes and failures
    for (const result of results) {
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        failures.push(result);
      }
    }
    
    console.log(`  ✓ Batch ${batchNumber} complete (${results.filter(r => r.success).length}/${results.length} succeeded)`);
    
    // Small delay between batches to avoid overwhelming the system
    if (batchEnd < totalEvents) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const eventsPerSecond = (totalEvents / duration).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS:');
  console.log('='.repeat(60));
  console.log(`Total events sent: ${totalEvents}`);
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failureCount}`);
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Throughput: ${eventsPerSecond} events/second`);
  
  if (failures.length > 0) {
    console.log('\nFirst 5 failures:');
    failures.slice(0, 5).forEach(f => {
      console.log(`  Event ${f.index}: ${JSON.stringify(f.error)}`);
    });
  }
  
  console.log('='.repeat(60));
}

// Check if API is ready first
async function checkApiHealth() {
  console.log('Checking API health...');
  try {
    const response = await axios.get('http://localhost:3001/health');
    console.log('✓ API is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('✗ API health check failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const isHealthy = await checkApiHealth();
  
  if (!isHealthy) {
    console.log('\nAPI is not ready. Please ensure the system is running:');
    console.log('  docker compose up --build -d');
    process.exit(1);
  }
  
  console.log('');
  await sendEventsInBatches(NUM_EVENTS, 50);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
