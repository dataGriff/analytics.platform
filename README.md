# Analytics Platform

A complete, production-ready **multi-channel analytics platform** that captures, processes, and visualizes behavioral data in real-time across web, mobile, chat, voice, and AI agent channels. Built with modern streaming technologies and deployable locally via Docker Compose.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ (for CLI installation)
- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (v2.0+)
- 6GB+ RAM available for Docker

### Option 1: Using the CLI (Recommended)

1. **Clone and install the CLI**
   ```bash
   git clone https://github.com/dataGriff/analytics.platform.git
   cd analytics.platform
   pip install -e .
   ```

2. **Start the platform**
   ```bash
   analytics-platform up
   ```

   The CLI will:
   - Start all Docker containers
   - Wait for services to be ready
   - Display access URLs when ready

3. **Check status**
   ```bash
   analytics-platform status
   ```

4. **View logs**
   ```bash
   analytics-platform logs -f
   ```

5. **Stop the platform**
   ```bash
   analytics-platform down
   ```

For detailed CLI installation and usage, see [CLI_INSTALL.md](CLI_INSTALL.md).

### Option 2: Using Docker Compose Directly

```bash
# Clone the repository
git clone https://github.com/dataGriff/analytics.platform.git
cd analytics.platform

# Start all services
docker compose up -d

# Wait 60-90 seconds for services to initialize
```

### Access the Applications

Once running, access these applications:

| Application | URL | Credentials | Description |
|------------|-----|-------------|-------------|
| **Demo Website** | http://localhost:8080 | None | Interactive demo with event tracking |
| **Chat App** | http://localhost:8082 | None | Chat interface demo |
| **Grafana** | http://localhost:3000 | admin / admin | Real-time analytics dashboards |
| **Delta Dashboard** | http://localhost:8501 | None | Streamlit dashboard for Delta Lake |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin | Object storage console |
| **Analytics API** | http://localhost:3001/health | None | API health check |

### Test the Platform

1. Open the **Demo Website** at http://localhost:8080
2. Click buttons on both pages to generate events
3. View real-time analytics in **Grafana** at http://localhost:3000 (admin/admin)
4. Explore Delta Lake data in **Delta Dashboard** at http://localhost:8501

## 🌟 Features

### Multi-Channel Support
Track interactions across multiple channels with a unified schema:
- **Web**: Browser-based applications (desktop, mobile, tablet)
- **Mobile**: Native iOS and Android apps
- **Chat**: Chatbots, messaging platforms (Slack, Teams, WhatsApp, etc.)
- **Speech**: Voice assistants (Alexa, Google Assistant, Siri, custom)
- **Agent**: AI agents, coding assistants, autonomous systems

### Real-time Event Streaming
- Apache Kafka for reliable, scalable event streaming
- High-throughput event ingestion with durability and replay

### Dual Storage Architecture
- **PostgreSQL/TimescaleDB**: Hot storage for real-time analytics and dashboards
- **Delta Lake on MinIO**: Data lake with ACID transactions, time travel, and long-term storage

### Stream Processing
- **Bento**: Flexible data transformation and routing to PostgreSQL
- **Delta Writer**: Spark-free Delta Lake writer using delta-rs (Python)

### Interactive Dashboards
- **Grafana**: Real-time dashboards with 5-second auto-refresh
- **Streamlit Delta Dashboard**: Interactive Delta Lake exploration with filters and exports

### Channel-Agnostic Schema
Unified data model that works across all interaction types, enabling:
- Cross-channel analytics and insights
- Consistent tracking approach
- Easy addition of new channels
- Flexible metadata for channel-specific attributes

## 📐 Architecture

```
Client Applications (Web, Mobile, Chat, etc.)
    ↓ HTTP POST
Analytics API (Node.js + Express)
    ↓ Kafka Producer
Apache Kafka (Message Broker)
    ↓ Consumer (Parallel Processing)
    ├─→ Bento (Stream Processor)
    │       ↓ SQL Insert
    │   PostgreSQL/TimescaleDB (Time-Series DB)
    │       ↓ Query
    │   Grafana (Visualization)
    │
    └─→ Delta Writer (Python Service)
            ↓ Delta Lake Write
        MinIO (S3-compatible Storage)
            ↓ Store/Query
        Delta Lake Tables (Data Lake)
            ↓ Read
        Delta Dashboard (Streamlit)
```

## 📚 Documentation

Comprehensive documentation is available in the [docs/](docs/) directory:

### Getting Started
- **[Getting Started Guide](docs/getting-started.md)** - Complete setup and quickstart guide
- **[Integration Guide](docs/integration.md)** - How to integrate with your applications
- **[CLI Installation Guide](CLI_INSTALL.md)** - CLI installation and usage

### Architecture & Design
- **[Architecture](docs/architecture.md)** - System architecture and component overview
- **[Channel-Agnostic Schema](docs/schema.md)** - Unified event schema documentation

### Advanced Topics
- **[Delta Lake Integration](docs/delta-lake.md)** - Delta Lake implementation details
- **[Production Deployment](docs/production.md)** - Production deployment best practices

### Service Documentation
- **[Delta Writer](docs/services/delta-writer.md)** - Delta Lake writer service
- **[Delta Dashboard](docs/services/delta-dashboard.md)** - Streamlit dashboard
- **[Chat App](docs/services/chat-app.md)** - Chat application demo
- **[Mobile App](docs/services/mobile-app.md)** - Mobile application demo

## 🛠️ Development

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f analytics-api

# Or use the CLI
analytics-platform logs -f analytics-api
```

### Restart Services
```bash
# All services
docker compose restart

# Specific service
docker compose restart analytics-api

# Or use the CLI
analytics-platform restart -s analytics-api
```

### Stop the Platform
```bash
# Using docker compose
docker compose down

# Remove all data for fresh start
docker compose down -v

# Or use the CLI
analytics-platform down
analytics-platform down --volumes  # Remove data
```

### Access Database
```bash
docker exec -it postgres psql -U analytics -d analytics

# Example queries:
SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT 10;
SELECT channel, event_type, COUNT(*) FROM analytics_events 
  GROUP BY channel, event_type;
```

## 🔌 Integration

Send events to the Analytics API using HTTP POST:

```javascript
fetch('http://localhost:3001/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channel: 'web',              // Required: web, mobile, chat, speech, agent
    event_type: 'interaction',   // Required: Type of event
    session_id: 'session-123',   // Required: Unique session ID
    resource_id: 'page-url',     // Resource identifier
    resource_title: 'Page Title', // Human-readable context
    interaction_target: 'button-id', // What was interacted with
    metadata: { custom: 'data' } // Optional: Channel-specific data
  })
});
```

See the [Integration Guide](docs/integration.md) for channel-specific examples and best practices.

## 🔒 Security Notes

**This is a demo setup. For production:**

### Change Default Passwords
- PostgreSQL: `analytics/analytics123`
- MinIO: `minioadmin/minioadmin`
- Grafana: `admin/admin`

### Enable Security Features
- SSL/TLS for all services
- Authentication for Analytics API
- Rate limiting
- Kafka authentication (SASL/SSL)
- Proper IAM policies for MinIO
- Network access restrictions
- Audit logging

See [Production Deployment](docs/production.md) for complete security checklist.

## 📊 What's Being Tracked

The platform's **channel-agnostic schema** supports tracking across:

| Channel | Resource Type | Interaction Types | Example Events |
|---------|--------------|-------------------|----------------|
| **Web** | Pages/URLs | Clicks, scrolls, forms | page_view, button_click, form_submit |
| **Mobile** | Screens | Taps, swipes, gestures | screen_view, button_tap, swipe |
| **Chat** | Conversations | Messages, buttons | user_message, bot_response, button_click |
| **Speech** | Skills/Intents | Utterances, commands | voice_command, intent_detected, response |
| **Agent** | Tasks/Tools | Prompts, tool usage | task_start, tool_execution, code_generation |

Each event includes:
- Channel & platform identification
- Event classification (type and category)
- Context information (resource, title, interaction target)
- Session tracking (session ID, user ID, device ID)
- Technical metadata (user agent, client version)
- Flexible metadata (JSONB field for channel-specific attributes)

## 🚢 Production Considerations

### Scaling
- Add more Kafka brokers and increase partitions
- Scale Bento and Delta Writer horizontally
- Use PostgreSQL replication
- Add load balancer for Analytics API
- Scale MinIO with distributed mode

### Monitoring
- Add Prometheus for metrics
- Set up alerts in Grafana
- Monitor Kafka consumer lag
- Track API response times

### Data Retention
- Configure TimescaleDB retention policies
- Archive old data to cold storage
- Set up automated backups
- Implement Delta Lake vacuum procedures

### High Availability
- Deploy across multiple availability zones
- Use managed services (Kafka, PostgreSQL, S3)
- Implement database failover
- Add health checks and auto-recovery

See [Production Deployment](docs/production.md) for detailed recommendations.

## 🐛 Troubleshooting

### Services won't start
- Check if ports are already in use
- Ensure Docker has enough resources (6GB+ RAM)
- Check logs: `docker compose logs` or `analytics-platform logs`

### Events not appearing in Grafana
- Wait 1-2 minutes for data to flow through pipeline
- Check API health: `curl http://localhost:3001/health`
- Verify Kafka: `docker compose logs kafka`
- Check Bento: `docker compose logs bento`

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
