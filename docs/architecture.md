# Architecture

## System Overview

This analytics platform is a complete event-driven data pipeline that captures user behavioral data in real-time, processes it through a message broker, and stores it in dual storage systems: a time-series database for real-time analytics and Delta Lake for data lake capabilities.

## Component Diagram

```
┌─────────────────┐
│  Client Apps    │  (Web, Mobile, Chat, etc.)
│  - Website      │
│  - Chat App     │
│  - Mobile App   │
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
└────┬────────┬───┘
     │        │
     │        │ (Parallel Consumers)
     │        │
     ▼        ▼
┌──────┐  ┌──────────────┐
│Bento │  │ Delta Writer │
│      │  │  - Python    │
│      │  │  - delta-rs  │
└──┬───┘  └───────┬──────┘
   │              │
   │ SQL Insert   │ Delta Write
   ▼              ▼
┌──────────┐  ┌──────────┐
│PostgreSQL│  │  MinIO   │  (Ports 9000, 9001)
│TimescaleDB  │  S3 API  │
│  (5432)  │  │          │
└────┬─────┘  └────┬─────┘
     │             │
     │             ▼
     │        ┌──────────────┐
     │        │  Delta Lake  │
     │        │  - ACID      │
     │        │  - Parquet   │
     │        │  - Versioning│
     │        └──────┬───────┘
     │               │
     ▼               ▼
┌─────────┐  ┌──────────────┐
│ Grafana │  │Delta Dashboard│
│ (3000)  │  │   (8501)     │
└─────────┘  └──────────────┘
```

## Dual Storage Architecture

The platform implements a **dual-storage strategy** for optimal performance:

### 1. Hot Storage (PostgreSQL/TimescaleDB)
- **Purpose**: Real-time analytics and dashboards
- **Optimized for**: Time-series queries
- **Access Pattern**: Fast access for recent data
- **Use Cases**: Real-time monitoring, operational dashboards, alerts
- **Visualization**: Powers Grafana dashboards

### 2. Data Lake (Delta Lake on MinIO)
- **Purpose**: Long-term storage and historical analytics
- **Features**: ACID transactions without Spark, schema evolution support, time travel capabilities
- **Format**: Parquet format for efficient storage
- **Storage**: S3-compatible object storage (MinIO)
- **Use Cases**: Historical analysis, data science, ML training
- **Visualization**: Powers Streamlit Delta Dashboard

### Comparison

| Feature | PostgreSQL/TimescaleDB | Delta Lake |
|---------|------------------------|------------|
| **Purpose** | Real-time analytics | Long-term storage |
| **Query Speed** | Very fast | Fast (Parquet) |
| **Cost** | Higher (hot storage) | Lower (object storage) |
| **Scalability** | Vertical | Horizontal |
| **Time Travel** | No | Yes |
| **Schema Evolution** | Migrations needed | Automatic |
| **ACID** | Yes | Yes |
| **Best For** | Dashboards, alerts | Historical analysis, ML |

## Data Flow

### 1. Event Generation
Client applications (website, mobile, chat) capture user interactions:
- Event type (page_view, button_click, message, etc.)
- Context information (page URL, screen name, conversation ID)
- Session tracking (session ID, user ID, device ID)
- Metadata (user agent, device info, custom attributes)
- Timestamp

### 2. Event Transmission
Events are sent via HTTP POST to Analytics API at `http://localhost:3001/analytics`:
- API validates required fields
- API enriches event with server-side data
- Returns success/error response to client

### 3. Message Brokering
Analytics API produces messages to Kafka:
- Topic: `analytics-events`
- Message key: session_id (for partitioning)
- Message value: JSON serialized event
- Kafka ensures durability and ordered delivery

### 4. Parallel Stream Processing

Two independent consumers process events in parallel:

#### Path A: PostgreSQL (Bento)
1. Bento consumes from Kafka topic
2. Transforms and validates data using mapping processor
3. Ensures all required fields are present with defaults
4. Converts JSON to SQL-ready format
5. Inserts into PostgreSQL/TimescaleDB

#### Path B: Delta Lake (Delta Writer)
1. Python service consumes from Kafka topic (separate consumer group)
2. Batches events for efficient writes (configurable batch size/timeout)
3. Uses deltalake (delta-rs) library - no Spark required
4. Writes to MinIO in Delta Lake format
5. Provides ACID guarantees and versioning

### 5. Data Storage

#### PostgreSQL/TimescaleDB Storage
- TimescaleDB hypertable optimizes for time-series queries
- Indexes on event_type, channel, session_id, and timestamp
- Materialized views for aggregated analytics
- Powers real-time Grafana dashboards

#### Delta Lake Storage
- Stored as Parquet files with Delta transaction log
- ACID transactions ensure consistency
- Schema evolution handled automatically
- Supports time travel and versioning
- Optimized for analytical queries and long-term storage

### 6. Visualization

#### Grafana (Port 3000)
- Connects to PostgreSQL datasource
- Real-time dashboards with 5-second refresh
- Multiple visualization types (time series, gauges, pie charts, tables)
- Pre-configured dashboards for multi-channel analytics

#### Delta Dashboard (Port 8501)
- Streamlit-based interactive dashboard
- Reads directly from Delta Lake tables
- Interactive filters (date range, channel, event type)
- Time-series charts and heatmaps
- CSV export capability

## Services Overview

### Analytics API (Port 3001)
**Technology**: Node.js + Express + KafkaJS

**Responsibilities**:
- Receive events from client applications via HTTP POST
- Validate and enrich event data
- Produce messages to Kafka topics
- Provide health check endpoint

**Endpoints**:
- `GET /health` - Service health check
- `POST /analytics` - Submit analytics events

### Apache Kafka (Port 9092)
**Technology**: Confluent Kafka + Zookeeper

**Responsibilities**:
- Message broker for reliable event streaming
- Topic management and partitioning
- Handle high-throughput event ingestion
- Provide durability and replay capabilities

### Bento
**Technology**: Bento (formerly Benthos) stream processor

**Responsibilities**:
- Consume events from Kafka
- Transform and enrich data
- Write to PostgreSQL in real-time
- Configurable via YAML

**Configuration**: `bento/config.yaml`

### Delta Writer
**Technology**: Python + deltalake (delta-rs)

**Responsibilities**:
- Consume events from Kafka (parallel to Bento)
- Batch processing for efficiency
- Write to Delta Lake format
- No Spark dependency

**Configuration**: Environment variables in docker-compose.yml

### MinIO (Ports 9000, 9001)
**Technology**: MinIO object storage

**Responsibilities**:
- S3-compatible object storage
- Store Delta Lake tables
- Web console for management
- Bucket initialization

**Access**:
- API: Port 9000
- Console: Port 9001 (minioadmin/minioadmin)

### PostgreSQL/TimescaleDB (Port 5432)
**Technology**: TimescaleDB extension on PostgreSQL

**Responsibilities**:
- Time-series optimized database
- Store analytics events
- Support real-time queries
- Automatic compression and retention

**Credentials**: analytics/analytics123

### Grafana (Port 3000)
**Technology**: Grafana

**Responsibilities**:
- Real-time visualization dashboards
- Pre-configured with PostgreSQL datasource
- Auto-refreshing panels
- Dashboard provisioning

**Credentials**: admin/admin

### Delta Dashboard (Port 8501)
**Technology**: Streamlit + Python

**Responsibilities**:
- Interactive Delta Lake dashboard
- Real-time event visualization
- Advanced filtering and exploration
- Data export capabilities

## Scalability Considerations

### Horizontal Scaling

1. **Analytics API**
   - Stateless design allows easy scaling
   - Add load balancer (nginx, HAProxy)
   - Scale: `docker compose up -d --scale analytics-api=3`

2. **Kafka**
   - Add more broker replicas
   - Increase topic partitions for parallelism
   - Configure replication factor for durability

3. **Bento**
   - Scale to multiple consumers
   - Each consumes from different partitions
   - `docker compose up -d --scale bento=3`

4. **Delta Writer**
   - Scale horizontally with separate consumer groups
   - Independent processing of events
   - `docker compose up -d --scale delta-writer=3`

5. **PostgreSQL**
   - Configure replication (primary-replica)
   - Use read replicas for Grafana queries
   - Consider connection pooling (PgBouncer)

6. **MinIO**
   - Supports distributed deployment
   - Multiple nodes for high availability
   - Erasure coding for data protection

### Vertical Scaling
- Increase Docker resource limits
- Tune JVM settings for Kafka
- Adjust PostgreSQL shared_buffers and work_mem
- Allocate more CPU/memory to containers

## Security Considerations

**Current Setup**: Demo/development configuration with default credentials

**Production Recommendations**:

1. **General Security**
   - Change all default passwords
   - Enable SSL/TLS for all services
   - Add authentication to Analytics API
   - Implement rate limiting
   - Use environment variables for secrets
   - Enable Kafka authentication (SASL/SSL)
   - Restrict network access
   - Add monitoring and alerting

2. **MinIO Security**
   - Configure proper IAM policies
   - Use strong credentials
   - Enable TLS/SSL encryption
   - Restrict bucket access
   - Enable audit logging
   - Configure bucket policies and ACLs

3. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Implement row-level security if needed
   - Regular backups
   - Audit logging

## Monitoring & Observability

### Logs
```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f analytics-api
docker compose logs -f bento
docker compose logs -f delta-writer
```

### Health Checks
```bash
# Analytics API
curl http://localhost:3001/health

# Kafka
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# PostgreSQL
docker exec postgres pg_isready -U analytics

# Grafana
curl http://localhost:3000/api/health
```

### Metrics
- **Analytics API**: Logs to stdout, shows event processing
- **Kafka**: JMX metrics (requires configuration)
- **PostgreSQL**: Query performance via pg_stat_statements
- **Grafana**: Built-in metrics and monitoring

## High Availability

For production deployment:

1. **Multiple Availability Zones**: Deploy across multiple zones
2. **Managed Services**: Use managed Kafka, PostgreSQL services
3. **Database Replication**: Primary-replica setup with failover
4. **Health Checks**: Implement comprehensive health checks
5. **Auto-Recovery**: Configure restart policies and auto-scaling
6. **Load Balancing**: Use load balancers for API endpoints
7. **Backup Strategy**: Regular backups of PostgreSQL and MinIO
8. **Disaster Recovery**: Document and test recovery procedures
