# Analytics Platform

A complete, production-ready analytics platform that captures, processes, and visualizes behavioral data in real-time. Built with modern streaming technologies and deployable locally via Docker Compose.

## 🚀 Features

- **Real-time Event Streaming**: Capture user interactions and behavioral data
- **Message Broker**: Apache Kafka for reliable, scalable event streaming
- **Data Pipeline**: Benthos for flexible data transformation and routing
- **Time-Series Storage**: TimescaleDB (PostgreSQL) for efficient analytics data storage
- **Real-time Dashboards**: Grafana for instant visualization and monitoring
- **Demo Website**: Interactive two-page website demonstrating event tracking

## 🏗️ Architecture

```
Website (User Interactions)
    ↓ HTTP POST
Analytics API (Node.js + Express)
    ↓ Kafka Producer
Apache Kafka (Message Broker)
    ↓ Consumer
Benthos (Stream Processor)
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
   - Benthos (Stream processor)
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

The platform tracks the following events:

- **Page Views**: When users visit a page
- **Button Clicks**: When users click tracked buttons
- **Navigation**: When users navigate between pages
- **Page Unload**: When users leave a page

Each event includes:
- Event type and timestamp
- Page URL and title
- Button ID (for clicks)
- Session ID (unique per browser session)
- User agent information
- Custom metadata

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

### Benthos
- Consumes events from Kafka
- Transforms and enriches data
- Writes to PostgreSQL in real-time
- Configurable via `benthos/config.yaml`

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
├── benthos/                    # Stream processing config
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

## 🛠️ Development

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f analytics-api
docker-compose logs -f benthos
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
   - Scale Benthos horizontally
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
- Check Benthos logs: `docker-compose logs benthos`

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
