# Analytics Platform

A complete, production-ready **multi-channel analytics platform** that captures, processes, and visualizes behavioral data in real-time across web, mobile, chat, voice, and AI agent channels. Built with modern streaming technologies and deployable locally via Docker Compose.

## 🚀 Features

- **Multi-Channel Support**: Track interactions across web, mobile, chat, voice/speech, and AI agents
- **Channel-Agnostic Schema**: Unified data model that works across all interaction types
- **Real-time Event Streaming**: Capture user interactions and behavioral data
- **Message Broker**: Apache Kafka for reliable, scalable event streaming
- **Data Pipeline**: Bento for flexible data transformation and routing
- **Time-Series Storage**: TimescaleDB (PostgreSQL) for efficient analytics data storage
- **Real-time Dashboards**: Grafana for instant visualization and monitoring
- **Demo Website**: Interactive two-page website demonstrating event tracking

## 🌐 Supported Channels

- **Web**: Browser-based applications (desktop, mobile, tablet)
- **Mobile**: Native iOS and Android apps
- **Chat**: Chatbots, messaging platforms (Slack, Teams, WhatsApp, etc.)
- **Speech**: Voice assistants (Alexa, Google Assistant, Siri, custom)
- **Agent**: AI agents, coding assistants, autonomous systems

## 🏗️ Architecture

```
Website (User Interactions)
    ↓ HTTP POST
Analytics API (Node.js + Express)
    ↓ Kafka Producer
Apache Kafka (Message Broker)
    ↓ Consumer
Bento (Stream Processor)
    ↓ SQL Insert
PostgreSQL/TimescaleDB (Data Store)
    ↓ Query
Grafana (Visualization)
```

## 📋 Prerequisites

- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (v2.0+)
- 4GB+ RAM available for Docker
- Ports available: 3000, 3001, 5432, 8080, 9092

## 🎯 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd analytics.platform
   ```

2. **Start the platform**
   ```bash
   docker-compose up -d
   ```

   This will start all services:
   - Zookeeper (Kafka dependency)
   - Kafka (Message broker)
   - PostgreSQL with TimescaleDB (Database)
   - Bento (Stream processor)
   - Grafana (Dashboards)
   - Analytics API (Event receiver)
   - Demo Website (Event generator)

3. **Wait for services to be ready** (30-60 seconds)
   ```bash
   docker-compose logs -f
   ```
   Wait until you see "Analytics API listening on port 3001" and Kafka is ready.

4. **Access the applications**
   - **Demo Website**: http://localhost:8080
   - **Grafana Dashboard**: http://localhost:3000 (admin/admin)
   - **Analytics API Health**: http://localhost:3001/health

## 🎮 Using the Demo

1. Open the demo website at http://localhost:8080
2. Click the buttons on both pages to generate analytics events
3. Navigate between pages to track page views
4. Open Grafana at http://localhost:3000
   - Username: `admin`
   - Password: `admin`
5. View the "Analytics Platform Dashboard" to see real-time data
6. Events update every 5 seconds automatically

## 📊 What's Being Tracked

### Web Channel (Demo)
The demo website tracks:
- **Navigation Events**: Page views and route changes
- **Interaction Events**: Button clicks and form submissions
- **Session Events**: Page load and unload

### All Channels Support
The platform's **channel-agnostic schema** supports tracking across:

| Channel | Resource Type | Interaction Types | Example Events |
|---------|--------------|-------------------|----------------|
| **Web** | Pages/URLs | Clicks, scrolls, forms | page_view, button_click, form_submit |
| **Mobile** | Screens | Taps, swipes, gestures | screen_view, button_tap, swipe |
| **Chat** | Conversations | Messages, buttons | user_message, bot_response, button_click |
| **Speech** | Skills/Intents | Utterances, commands | voice_command, intent_detected, response |
| **Agent** | Tasks/Tools | Prompts, tool usage | task_start, tool_execution, code_generation |

Each event includes:
- **Channel & Platform**: Identifies the interaction source
- **Event Classification**: Type and category of event
- **Context Information**: Resource, title, interaction target (channel-specific)
- **Session Tracking**: Session ID, user ID, device ID
- **Technical Metadata**: User agent, client version
- **Flexible Metadata**: JSONB field for channel-specific attributes

See [CHANNEL_AGNOSTIC_SCHEMA.md](CHANNEL_AGNOSTIC_SCHEMA.md) for complete documentation.

## 🔧 Services Overview

### Analytics API (Port 3001)
- Node.js service that receives events from the website
- Validates and enriches event data
- Produces messages to Kafka topics
- Endpoints:
  - `GET /health` - Service health check
  - `POST /analytics` - Submit analytics events

### Kafka (Port 9092)
- Message broker for reliable event streaming
- Topic: `analytics-events`
- Handles high-throughput event ingestion
- Provides durability and replay capabilities

### Bento
- Consumes events from Kafka
- Transforms and enriches data
- Writes to PostgreSQL in real-time
- Configurable via `bento/config.yaml`

### PostgreSQL/TimescaleDB (Port 5432)
- Time-series optimized database
- Credentials: `analytics/analytics123`
- Database: `analytics`
- Table: `analytics_events`
- Automatic compression and retention policies

### Grafana (Port 3000)
- Real-time visualization dashboards
- Pre-configured with PostgreSQL datasource
- Auto-refreshing panels
- Credentials: `admin/admin`

### Demo Website (Port 8080)
- Two-page demonstration site
- Interactive buttons for event generation
- Client-side event tracking
- Local event history display

## 📁 Project Structure

```
analytics.platform/
├── docker-compose.yml          # Main orchestration file
├── analytics-api/              # Event collection API
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── bento/                    # Stream processing config
│   └── config.yaml
├── database/                   # Database initialization
│   └── init.sql
├── grafana/                    # Grafana configuration
│   ├── dashboards/
│   │   └── analytics-dashboard.json
│   └── provisioning/
│       ├── dashboards/
│       │   └── dashboards.yaml
│       └── datasources/
│           └── postgres.yaml
└── website/                    # Demo website
    ├── Dockerfile
    ├── index.html
    ├── page2.html
    ├── analytics.js
    └── styles.css
```
analytics.platform/
├── docker-compose.yml                      # Main orchestration file
├── README.md                               # This file
├── CHANNEL_AGNOSTIC_SCHEMA.md             # Schema documentation
├── analytics-api/                          # Event collection API
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── bento/                                  # Stream processing config
│   └── config.yaml
├── database/                               # Database initialization
│   └── init.sql                           # Channel-agnostic schema
├── grafana/                                # Grafana configuration
│   ├── dashboards/
│   │   ├── analytics-dashboard.json       # Legacy dashboard
│   │   └── multi-channel-analytics-dashboard.json  # New multi-channel dashboard
│   └── provisioning/
│       ├── dashboards/
│       │   └── dashboards.yaml
│       └── datasources/
│           └── postgres.yaml
├── website/                                # Demo website (web channel)
│   ├── Dockerfile
│   ├── index.html
│   ├── page2.html
│   ├── analytics.js                       # Web implementation
│   └── styles.css
└── examples/                               # Example implementations
    ├── mobile-analytics.js                # Mobile channel example
    ├── chat-analytics.js                  # Chat channel example
    ├── speech-analytics.js                # Speech/voice channel example
    └── agent-analytics.js                 # AI agent channel example
```

## 📚 Documentation

- **[CONTRACT.md](CONTRACT.md)** - **API Contract Specification** ⭐
  - Complete API endpoint documentation
  - Request/response formats and validation rules
  - Channel-agnostic event schema specification
  - Example requests for all channels
  - Error codes and responses
  - Testing and integration guidelines
  
- **[CHANNEL_AGNOSTIC_SCHEMA.md](CHANNEL_AGNOSTIC_SCHEMA.md)** - Complete schema documentation
  - Field mappings for each channel
  - Sample queries for cross-channel analytics
  - Best practices and implementation guidelines

- **[CONTRACT_TESTING.md](CONTRACT_TESTING.md)** - Contract testing examples
  - Valid and invalid event examples
  - Test scripts (bash, JavaScript, Python)
  - JSON Schema validation
  
- **[event-schema.json](event-schema.json)** - JSON Schema for validation
  - Machine-readable schema definition
  - Use with validation libraries

- **[validate-contract.js](validate-contract.js)** - Standalone validation tool
  - Validate events without API server
  - Built-in test suite (11 tests)
  - Available as GitHub Copilot agent skill
  - Usage: `node validate-contract.js --test`
  
- **[.github/agents/](.github/agents/)** - GitHub Copilot agent skills
  - `validate-contract` skill for event validation
  - Use with: `@agent use validate-contract`
  
- **[examples/](examples/)** - Implementation examples
  - Mobile app tracking (React Native, iOS, Android)
  - Chat/messaging platform tracking
  - Voice/speech assistant tracking
  - AI agent tracking

## 🔌 Implementing New Channels

To implement tracking for a new channel:

1. **Use the channel-agnostic event structure** (see examples/)
2. **Set appropriate channel and platform values**
3. **Map your context to resource_id/resource_title**
4. **Use metadata JSONB for channel-specific attributes**
5. **Send events to the Analytics API endpoint**

Example for a custom channel:
```javascript
{
  channel: 'your-channel',
  platform: 'your-platform',
  event_type: 'interaction',
  event_category: 'user_action',
  resource_id: 'context-identifier',
  resource_title: 'Human-readable context',
  interaction_target: 'what-was-interacted-with',
  session_id: 'session-123',
  user_id: 'user-456',
  device_id: 'device-789',
  metadata: { /* channel-specific data */ }
}
```

## 🛠️ Development

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f analytics-api
docker-compose logs -f bento
docker-compose logs -f kafka
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart analytics-api
```

### Stop the Platform
```bash
docker-compose down
```

### Remove All Data (Fresh Start)
```bash
docker-compose down -v
```

### Access Database
```bash
docker exec -it postgres psql -U analytics -d analytics

# Example queries:
SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT 10;
SELECT event_type, COUNT(*) FROM analytics_events GROUP BY event_type;
```

## 🔒 Security Notes

**This is a demo setup. For production:**

- Change default passwords
- Enable SSL/TLS for all services
- Add authentication to Analytics API
- Implement rate limiting
- Use environment variables for secrets
- Enable Kafka authentication (SASL/SSL)
- Restrict network access
- Add monitoring and alerting

## 🚢 Production Considerations

1. **Scaling**:
   - Add more Kafka brokers
   - Scale Bento horizontally
   - Use PostgreSQL replication
   - Add load balancer for Analytics API

2. **Monitoring**:
   - Add Prometheus for metrics
   - Set up alerts in Grafana
   - Monitor Kafka lag
   - Track API response times

3. **Data Retention**:
   - Configure TimescaleDB retention policies
   - Archive old data to cold storage
   - Set up automated backups

4. **High Availability**:
   - Deploy across multiple availability zones
   - Use managed Kafka service
   - Implement database failover
   - Add health checks and auto-recovery

## 🐛 Troubleshooting

### Services won't start
- Check if ports are already in use
- Ensure Docker has enough resources
- Check logs: `docker-compose logs`

### Events not appearing in Grafana
- Wait 1-2 minutes for data to flow through pipeline
- Check Analytics API is running: `curl http://localhost:3001/health`
- Verify Kafka topics: `docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092`
- Check Bento logs: `docker-compose logs bento`

### Database connection issues
- Ensure PostgreSQL is fully started
- Check credentials in config files
- Verify network connectivity between containers

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the repository.
