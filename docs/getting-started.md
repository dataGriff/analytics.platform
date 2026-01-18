# Getting Started

This guide will get your analytics platform up and running in 5 minutes.

## Prerequisites

- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (v2.0+)
- 6GB+ RAM available for Docker
- Ports available: 3000, 3001, 5432, 8080, 8082, 8501, 9000, 9001, 9092

## Quick Start

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd analytics.platform
```

### 2. Start All Services

```bash
docker compose up -d
```

This will start all services:
- Zookeeper (Kafka dependency)
- Kafka (Message broker)
- PostgreSQL with TimescaleDB (Database)
- MinIO (S3-compatible object storage)
- Bento (Stream processor for PostgreSQL)
- Delta Writer (Stream processor for Delta Lake)
- Delta Dashboard (Streamlit dashboard for Delta Lake)
- Grafana (Dashboards)
- Analytics API (Event receiver)
- Demo Website (Event generator)
- Chat App (Chat demo)

**⏱️ Wait Time**: 60-90 seconds for all services to initialize

### 3. Verify Services are Running

```bash
docker compose ps
```

Expected output - all services should show "Up":
```
NAME                    STATUS
analytics-api          Up
bento                  Up
chat-app               Up
delta-dashboard        Up
delta-writer           Up
grafana                Up
kafka                  Up
minio                  Up
minio-init             Exited (0)
postgres               Up
website                Up
zookeeper              Up
```

### 4. Access the Applications

Once all services are running, you can access:

| Application | URL | Credentials | Description |
|------------|-----|-------------|-------------|
| **Demo Website** | http://localhost:8080 | None | Interactive demo with event tracking |
| **Chat App** | http://localhost:8082 | None | Chat interface demo |
| **Delta Lake Dashboard** | http://localhost:8501 | None | Streamlit dashboard for Delta Lake |
| **Grafana** | http://localhost:3000 | admin / admin | Real-time analytics dashboards |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin | Object storage console |
| **Analytics API Health** | http://localhost:3001/health | None | API health check |

### 5. Test the Platform

#### Generate Events from Demo Website

1. Open http://localhost:8080
2. Click the buttons on Page 1
3. Navigate to "Page 2" using the nav menu
4. Click buttons on Page 2
5. Navigate back to Page 1

#### View Real-Time Analytics in Grafana

1. Open http://localhost:3000
2. Login with username: `admin`, password: `admin`
3. Navigate to "Analytics Platform Dashboard" or "Multi-Channel Analytics Dashboard"
4. See real-time data updates (5-second refresh)

#### Explore Delta Lake Dashboard

1. Open http://localhost:8501
2. Use interactive filters for date range, channel, and event type
3. View charts and recent events
4. Export data as CSV if needed

#### (Optional) Browse Delta Lake Files

1. Open http://localhost:9001
2. Login with username: `minioadmin`, password: `minioadmin`
3. Navigate to: `analytics` bucket → `delta` → `analytics-events`
4. View Delta Lake Parquet files

## Common Commands

### Service Management

```bash
# Stop all services
docker compose down

# Restart a specific service
docker compose restart analytics-api

# View service logs
docker compose logs -f <service-name>

# View all logs
docker compose logs -f
```

### Data Access

```bash
# Access PostgreSQL
docker exec -it postgres psql -U analytics -d analytics

# Query recent events
docker exec -it postgres psql -U analytics -d analytics -c \
  "SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT 10;"

# Count events by type
docker exec -it postgres psql -U analytics -d analytics -c \
  "SELECT event_type, COUNT(*) FROM analytics_events GROUP BY event_type;"
```

### Cleanup

```bash
# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (fresh start)
docker compose down -v
```

## Troubleshooting

### Services won't start
- Check if ports are already in use: `netstat -tuln | grep -E '3000|3001|5432|8080|9092'`
- Ensure Docker has enough resources (6GB+ RAM)
- Check logs: `docker compose logs`

### "Kafka producer not ready"
- Wait longer for Kafka to initialize (can take 60+ seconds)
- Check Kafka logs: `docker compose logs kafka`
- Look for: "started (kafka.server.KafkaServer)"

### No data in Grafana
1. Check Analytics API is receiving events: `curl http://localhost:3001/health`
2. Check Bento is running: `docker compose logs bento | grep -i error`
3. Check database has data: `docker exec -it postgres psql -U analytics -d analytics -c "SELECT COUNT(*) FROM analytics_events;"`
4. Refresh Grafana dashboard (F5)

### Events not showing in Delta Dashboard
- Wait 1-2 minutes for events to be written to Delta Lake
- Check Delta Writer logs: `docker compose logs delta-writer`
- Verify MinIO is accessible: http://localhost:9001

## Next Steps

- **Learn about the architecture**: See [Architecture](architecture.md)
- **Understand the schema**: See [Channel-Agnostic Schema](schema.md)
- **Explore Delta Lake integration**: See [Delta Lake](delta-lake.md)
- **Integrate your own applications**: See [Integration Guide](integration.md)
- **Deploy to production**: See [Production Deployment](production.md)
