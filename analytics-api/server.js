const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Kafka configuration
const kafka = new Kafka({
  clientId: 'analytics-api',
  brokers: ['kafka:29092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer();

// Initialize Kafka producer
let producerReady = false;

async function initProducer() {
  try {
    await producer.connect();
    producerReady = true;
    console.log('Kafka producer connected successfully');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
    // Retry connection after 5 seconds
    setTimeout(initProducer, 5000);
  }
}

initProducer();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    kafkaReady: producerReady,
    timestamp: new Date().toISOString()
  });
});

// Analytics event endpoint
app.post('/analytics', async (req, res) => {
  try {
    if (!producerReady) {
      return res.status(503).json({ 
        error: 'Service unavailable', 
        message: 'Kafka producer not ready' 
      });
    }

    const event = req.body;
    
    // Validate event (channel-agnostic schema)
    if (!event.event_type || !event.channel || !event.session_id) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Missing required fields: event_type, channel, session_id' 
      });
    }

    // Add server timestamp if not present
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString();
    }

    // Send to Kafka
    await producer.send({
      topic: 'analytics-events',
      messages: [
        {
          key: event.session_id || 'anonymous',
          value: JSON.stringify(event),
          timestamp: Date.now().toString()
        }
      ]
    });

    console.log('Event sent to Kafka:', {
      channel: event.channel,
      platform: event.platform,
      type: event.event_type,
      resource: event.resource_id,
      target: event.interaction_target
    });

    res.json({ 
      success: true, 
      message: 'Event received and sent to Kafka',
      eventId: event.session_id
    });

  } catch (error) {
    console.error('Error processing analytics event:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await producer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await producer.disconnect();
  process.exit(0);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Analytics API listening on port ${port}`);
});
