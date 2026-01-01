# Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get your analytics platform up and running quickly.

## Prerequisites Check

```bash
# Check Docker is installed
docker --version
# Expected: Docker version 20.10+ 

# Check Docker Compose is installed
docker compose version
# Expected: Docker Compose version v2.0+

# Check available disk space (need ~2GB)
df -h

# Check available RAM (need ~4GB)
free -h  # Linux
# or
vm_stat  # macOS
```

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd analytics.platform
```

### 2. Start All Services

```bash
# Start in detached mode (background)
docker compose up -d

# Or start with logs visible
docker compose up
```

**⏱️ Wait Time**: 60-90 seconds for all services to initialize

### 3. Verify Services are Running

```bash
docker compose ps
```

Expected output - all services should show "Up":
```
NAME                    STATUS
analytics-api          Up
bento                Up
grafana                Up
kafka                  Up
postgres               Up
website                Up
zookeeper              Up
```

### 4. Test the Platform

#### A. Check API Health
```bash
curl http://localhost:3001/health
```
✅ Should return: `{"status":"ok","kafkaReady":true, ...}`

#### B. Open the Demo Website
Open your browser to: **http://localhost:8080**

#### C. Generate Events
- Click the colorful buttons on the page
- Navigate to "Page 2" using the nav menu
- Click buttons on Page 2
- Navigate back to Page 1

#### D. View Real-Time Analytics
Open your browser to: **http://localhost:3000**
- Username: `admin`
- Password: `admin`
- Dashboard: "Analytics Platform Dashboard"

You should see:
- ✅ Events Over Time graph
- ✅ Total Events gauge
- ✅ Events by Type pie chart
- ✅ Recent Events table

### 5. Watch Data Flow

Open multiple terminal windows to watch the data flow through the system:

```bash
# Terminal 1: Watch Analytics API logs
docker compose logs -f analytics-api

# Terminal 2: Watch Bento processing
docker compose logs -f bento

# Terminal 3: Watch database inserts
docker exec -it postgres psql -U analytics -d analytics -c \
  "SELECT event_type, button_id, timestamp FROM analytics_events ORDER BY timestamp DESC LIMIT 5;"
```

Now click buttons on the website and watch events flow through!

## Common Commands

### Service Management

```bash
# Stop all services
docker compose down

# Restart a specific service
docker compose restart analytics-api

# View service logs
docker compose logs -f <service-name>

# Scale a service
docker compose up -d --scale analytics-api=3
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

# View Kafka topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Consume from Kafka (watch live events)
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic analytics-events \
  --from-beginning
```

### Cleanup

```bash
# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (fresh start)
docker compose down -v

# Remove all Docker images
docker compose down --rmi all -v
```

## Test Event Generation Script

Create a file `test_events.sh`:

```bash
#!/bin/bash

echo "Sending 10 test events..."

for i in {1..10}; do
  curl -s -X POST http://localhost:3001/analytics \
    -H "Content-Type: application/json" \
    -d "{
      \"event_type\": \"button_click\",
      \"page_url\": \"http://test.com/page\",
      \"page_title\": \"Test Page\",
      \"button_id\": \"test-button-$i\",
      \"session_id\": \"test-session-$(date +%s)\",
      \"user_agent\": \"test-script\"
    }" && echo " ✅ Event $i sent"
  sleep 0.5
done

echo "Done! Check Grafana for results."
```

Run it:
```bash
chmod +x test_events.sh
./test_events.sh
```

## Troubleshooting

### Problem: Services won't start
```bash
# Check if ports are already in use
netstat -tuln | grep -E '3000|3001|5432|8080|9092'

# Solution: Stop conflicting services or change ports in docker-compose.yml
```

### Problem: "Kafka producer not ready"
```bash
# Wait longer for Kafka to initialize (can take 60+ seconds)
docker compose logs kafka

# Look for: "started (kafka.server.KafkaServer)"
```

### Problem: No data in Grafana
```bash
# 1. Check Analytics API is receiving events
curl http://localhost:3001/health

# 2. Check Bento is running
docker compose logs bento | grep -i error

# 3. Check database has data
docker exec -it postgres psql -U analytics -d analytics -c \
  "SELECT COUNT(*) FROM analytics_events;"

# 4. Refresh Grafana dashboard (F5)
```

### Problem: Out of memory
```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory → 6GB+
```

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Demo Website | http://localhost:8080 | None |
| Analytics API | http://localhost:3001 | None |
| Grafana | http://localhost:3000 | admin / admin |
| PostgreSQL | localhost:5432 | analytics / analytics123 |
| Kafka | localhost:9092 | None |

## What's Next?

1. **Customize the website** - Edit files in `website/` directory
2. **Add more dashboards** - Create new Grafana dashboards
3. **Extend the API** - Add endpoints in `analytics-api/server.js`
4. **Transform data** - Modify `bento/config.yaml`
5. **Add more metrics** - Create database views and queries

## Need Help?

- 📖 Read the full [README.md](README.md)
- 🏗️ Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- 🐛 Open an issue in the repository
- 💬 Check the logs: `docker compose logs -f`

## Success Checklist

- [ ] All services are running (`docker compose ps`)
- [ ] Analytics API health check passes
- [ ] Website loads at http://localhost:8080
- [ ] Grafana dashboard shows data at http://localhost:3000
- [ ] Can see events in database
- [ ] Can see events in Kafka topic

If all boxes are checked: **🎉 Congratulations! Your analytics platform is ready!**
