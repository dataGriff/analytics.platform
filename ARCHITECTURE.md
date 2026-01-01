# Analytics Platform - Architecture & Testing Guide

## System Architecture

### Overview
This analytics platform is a complete event-driven data pipeline that captures user behavioral data in real-time, processes it through a message broker, stores it in a time-series database, and visualizes it through interactive dashboards.

### Component Diagram

```
┌─────────────────┐
│  Demo Website   │  (Port 8080)
│  - Page 1       │
│  - Page 2       │
│  - Event Buttons│
└────────┬────────┘
         │ HTTP POST /analytics
         ▼
┌─────────────────┐
│ Analytics API   │  (Port 3001)
│  - Node.js      │
│  - Express      │
│  - Event Valid. │
└────────┬────────┘
         │ Kafka Producer
         ▼
┌─────────────────┐
│  Apache Kafka   │  (Port 9092)
│  - Topic:       │
│    analytics-   │
│    events       │
└────────┬────────┘
         │ Consumer
         ▼
┌─────────────────┐
│    Bento      │
│  - Stream       │
│    Processing   │
│  - Transform    │
└────────┬────────┘
         │ SQL Insert
         ▼
┌─────────────────┐
│  PostgreSQL/    │  (Port 5432)
│  TimescaleDB    │
│  - analytics    │
│    _events      │
└────────┬────────┘
         │ Query
         ▼
┌─────────────────┐
│    Grafana      │  (Port 3000)
│  - Real-time    │
│    Dashboards   │
│  - Analytics    │
└─────────────────┘
```

## Data Flow

### 1. Event Generation
- User interacts with the demo website (clicks buttons, navigates pages)
- JavaScript (analytics.js) captures the event with metadata:
  - Event type (page_view, button_click, navigation_click, page_unload)
  - Page URL and title
  - Button ID (for clicks)
  - Session ID (unique per browser session)
  - User agent
  - Timestamp
  - Custom metadata

### 2. Event Transmission
- Event is sent via HTTP POST to Analytics API at `http://localhost:3001/analytics`
- API validates required fields (event_type, page_url)
- API enriches event with server timestamp if needed

### 3. Message Brokering
- Analytics API produces message to Kafka topic `analytics-events`
- Message key: session_id (for partitioning)
- Message value: JSON serialized event
- Kafka ensures durability and ordered delivery

### 4. Stream Processing
- Bento consumes from Kafka topic
- Transforms and validates data using mapping processor
- Ensures all required fields are present with defaults
- Converts JSON to SQL-ready format

### 5. Data Storage
- Bento inserts data into PostgreSQL using `sql_insert` output
- TimescaleDB hypertable optimizes for time-series queries
- Indexes on event_type, page_url, session_id, and timestamp
- Materialized view for aggregated analytics

### 6. Visualization
- Grafana connects to PostgreSQL datasource
- Queries analytics_events table
- Real-time dashboards with 5-second refresh
- Multiple visualization types:
  - Time series: Events over time by type
  - Gauge: Total event count
  - Pie chart: Events by type distribution
  - Table: Recent events log

## Database Schema

### analytics_events Table

```sql
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(100) NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(200),
    button_id VARCHAR(100),
    session_id VARCHAR(100),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TimescaleDB hypertable for efficient time-series storage
SELECT create_hypertable('analytics_events', 'timestamp');

-- Performance indexes
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_page_url ON analytics_events(page_url);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
```

### analytics_summary Materialized View

```sql
CREATE MATERIALIZED VIEW analytics_summary AS
SELECT 
    date_trunc('minute', timestamp) as time_bucket,
    event_type,
    page_url,
    COUNT(*) as event_count
FROM analytics_events
GROUP BY time_bucket, event_type, page_url
ORDER BY time_bucket DESC;
```

## Event Types

### page_view
Triggered when a user loads a page.
```json
{
  "event_type": "page_view",
  "page_url": "http://localhost:8080/index.html",
  "page_title": "Analytics Demo - Home",
  "session_id": "session-1234567890-abc123",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2024-12-31T11:00:00.000Z",
  "metadata": {
    "referrer": "https://google.com",
    "screen_width": 1920,
    "screen_height": 1080
  }
}
```

### button_click
Triggered when a user clicks a tracked button.
```json
{
  "event_type": "button_click",
  "page_url": "http://localhost:8080/index.html",
  "page_title": "Analytics Demo - Home",
  "button_id": "btn-action-1",
  "session_id": "session-1234567890-abc123",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2024-12-31T11:00:05.000Z",
  "metadata": {
    "page_section": "main"
  }
}
```

### navigation_click
Triggered when a user clicks a navigation link.
```json
{
  "event_type": "navigation_click",
  "page_url": "http://localhost:8080/index.html",
  "page_title": "Analytics Demo - Home",
  "session_id": "session-1234567890-abc123",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2024-12-31T11:00:10.000Z",
  "metadata": {
    "destination": "http://localhost:8080/page2.html",
    "link_text": "Page 2"
  }
}
```

### page_unload
Triggered when a user leaves a page.
```json
{
  "event_type": "page_unload",
  "page_url": "http://localhost:8080/index.html",
  "page_title": "Analytics Demo - Home",
  "session_id": "session-1234567890-abc123",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2024-12-31T11:00:30.000Z",
  "metadata": {
    "time_on_page": 30000
  }
}
```

## Testing the Platform

### Manual Testing Steps

1. **Start the Platform**
   ```bash
   docker compose up -d
   ```

2. **Verify All Services are Running**
   ```bash
   docker compose ps
   ```
   Expected output: All services should be "Up"

3. **Check Analytics API Health**
   ```bash
   curl http://localhost:3001/health
   ```
   Expected: `{"status":"ok","kafkaReady":true,"timestamp":"..."}`

4. **Test Event Generation**
   - Open browser to http://localhost:8080
   - Click various buttons on Page 1
   - Navigate to Page 2 using the nav link
   - Click buttons on Page 2
   - Navigate back to Page 1
   - Check browser console for success messages

5. **Verify Kafka Topics**
   ```bash
   docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092
   ```
   Expected: Should include `analytics-events` topic

6. **Check Kafka Messages**
   ```bash
   docker exec -it kafka kafka-console-consumer \
     --bootstrap-server localhost:9092 \
     --topic analytics-events \
     --from-beginning \
     --max-messages 10
   ```
   Expected: JSON event messages

7. **Verify Database Records**
   ```bash
   docker exec -it postgres psql -U analytics -d analytics -c \
     "SELECT event_type, page_url, button_id, timestamp FROM analytics_events ORDER BY timestamp DESC LIMIT 10;"
   ```
   Expected: Recent events from your clicks

8. **View Grafana Dashboard**
   - Open browser to http://localhost:3000
   - Login: admin / admin
   - Navigate to "Analytics Platform Dashboard"
   - Verify panels show data
   - Generate more events and watch real-time updates (5-second refresh)

### Automated API Testing

```bash
# Test submitting an event
curl -X POST http://localhost:3001/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "button_click",
    "page_url": "http://test.com/page",
    "page_title": "Test Page",
    "button_id": "test-button",
    "session_id": "test-session-123",
    "user_agent": "curl/7.0"
  }'

# Expected response:
# {"success":true,"message":"Event received and sent to Kafka","eventId":"test-session-123"}
```

### Performance Testing

```bash
# Send 100 events quickly
for i in {1..100}; do
  curl -X POST http://localhost:3001/analytics \
    -H "Content-Type: application/json" \
    -d "{
      \"event_type\": \"button_click\",
      \"page_url\": \"http://test.com/page\",
      \"button_id\": \"perf-test-$i\",
      \"session_id\": \"perf-test-session\"
    }" &
done
wait

# Verify all events were stored
docker exec -it postgres psql -U analytics -d analytics -c \
  "SELECT COUNT(*) FROM analytics_events WHERE session_id = 'perf-test-session';"
```

## Monitoring & Observability

### Service Logs

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f analytics-api
docker compose logs -f bento
docker compose logs -f kafka
docker compose logs -f postgres
docker compose logs -f grafana
```

### Metrics

- **Analytics API**: Logs to stdout, shows event processing
- **Bento**: Prometheus metrics at http://localhost:4195/metrics (if enabled)
- **Kafka**: JMX metrics (requires configuration)
- **PostgreSQL**: Query performance via pg_stat_statements

### Health Checks

```bash
# Analytics API
curl http://localhost:3001/health

# Bento (if HTTP enabled)
# curl http://localhost:4195/ready

# Kafka (check broker status)
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# PostgreSQL
docker exec postgres pg_isready -U analytics

# Grafana
curl http://localhost:3000/api/health
```

## Scaling Considerations

### Horizontal Scaling

1. **Analytics API**
   - Add load balancer (nginx, HAProxy)
   - Scale to multiple containers: `docker compose up -d --scale analytics-api=3`
   - Session affinity not required (stateless)

2. **Kafka**
   - Add more broker replicas
   - Increase topic partitions for parallelism
   - Configure replication factor for durability

3. **Bento**
   - Scale to multiple consumers
   - Each consumes from different partitions
   - `docker compose up -d --scale bento=3`

4. **PostgreSQL**
   - Configure replication (primary-replica)
   - Use read replicas for Grafana queries
   - Consider PostgreSQL connection pooling (PgBouncer)

### Vertical Scaling

- Increase Docker resource limits in docker-compose.yml
- Add memory limits and CPU reservations
- Tune JVM settings for Kafka
- Adjust PostgreSQL shared_buffers and work_mem

## Troubleshooting Guide

### Events not appearing in Grafana

1. Check Analytics API is running: `docker compose ps analytics-api`
2. Verify Kafka is healthy: `docker compose logs kafka | grep started`
3. Check Bento is consuming: `docker compose logs bento`
4. Verify database connectivity: `docker exec postgres psql -U analytics -d analytics -c "SELECT COUNT(*) FROM analytics_events;"`
5. Refresh Grafana dashboard manually

### "Service Unavailable" from Analytics API

- Kafka not ready yet - wait 30-60 seconds after startup
- Check logs: `docker compose logs analytics-api`
- Restart Analytics API: `docker compose restart analytics-api`

### Docker build failures

- Network issues with npm install
- Solution: Use `--no-cache` flag: `docker compose build --no-cache`
- Or pre-pull images: `docker compose pull`

### Database connection errors

- PostgreSQL not fully started
- Wait 10-20 seconds for database initialization
- Check logs: `docker compose logs postgres`
- Verify connection: `docker exec postgres psql -U analytics -l`

## Security Checklist (Production)

- [ ] Change all default passwords
- [ ] Enable SSL/TLS for all services
- [ ] Add authentication to Analytics API
- [ ] Implement rate limiting on API endpoints
- [ ] Use environment variables for secrets
- [ ] Enable Kafka SASL/SSL authentication
- [ ] Restrict network access with firewall rules
- [ ] Set up log aggregation (ELK, Splunk)
- [ ] Configure monitoring and alerting
- [ ] Implement data retention policies
- [ ] Add CORS configuration for Analytics API
- [ ] Use reverse proxy (nginx) for external access
- [ ] Enable database connection encryption
- [ ] Regular security updates and patches
- [ ] Backup and disaster recovery plan

## Next Steps & Enhancements

1. **Advanced Analytics**
   - User journey mapping
   - Funnel analysis
   - Cohort analysis
   - A/B testing support

2. **Additional Data Sources**
   - Server-side events
   - Mobile app events
   - Third-party integrations

3. **Machine Learning**
   - Anomaly detection
   - Predictive analytics
   - User segmentation
   - Recommendation engine

4. **Operational Improvements**
   - Infrastructure as Code (Terraform)
   - CI/CD pipeline
   - Automated testing
   - Blue-green deployments

5. **Data Quality**
   - Schema validation
   - Data deduplication
   - Event versioning
   - Audit logging
