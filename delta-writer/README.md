# Delta Lake Writer Service

## Overview

The Delta Lake Writer service is a containerized Python application that consumes analytics events from Kafka and writes them to Delta Lake format in S3-compatible storage (MinIO).

## Architecture

```
Kafka (analytics-events topic)
    ↓
Delta Writer (Python Service)
    ↓
MinIO (S3-compatible storage)
    ↓
Delta Lake Tables
```

## Features

- **Spark-free**: Uses the `deltalake` Python library (delta-rs) - no Spark required
- **Batch Processing**: Configurable batch size and timeout for efficient writes
- **S3-compatible Storage**: Works with MinIO or any S3-compatible storage
- **Automatic Schema**: Delta Lake handles schema evolution automatically
- **ACID Transactions**: Delta Lake provides ACID guarantees
- **Time Travel**: Delta Lake supports versioning and time travel queries
- **Containerized**: Fully containerized service following the platform's architecture

## Configuration

Environment variables:

- `KAFKA_BOOTSTRAP_SERVERS`: Kafka bootstrap servers (default: `kafka:29092`)
- `KAFKA_TOPIC`: Kafka topic to consume from (default: `analytics-events`)
- `KAFKA_GROUP_ID`: Consumer group ID (default: `delta-writer-consumer`)
- `DELTA_TABLE_PATH`: S3 path for Delta table (default: `s3://analytics/delta/analytics-events`)
- `AWS_ENDPOINT_URL`: S3 endpoint URL (default: `http://minio:9000`)
- `AWS_ACCESS_KEY_ID`: S3 access key (default: `minioadmin`)
- `AWS_SECRET_ACCESS_KEY`: S3 secret key (default: `minioadmin`)
- `AWS_REGION`: AWS region (default: `us-east-1`)
- `AWS_ALLOW_HTTP`: Allow HTTP for S3 (default: `true`)
- `BATCH_SIZE`: Number of events to batch before writing (default: `100`)
- `BATCH_TIMEOUT_SECONDS`: Max seconds to wait before writing batch (default: `10`)

## Schema

The Delta table mirrors the PostgreSQL schema with the following fields:

- `timestamp`: Event timestamp (TIMESTAMP)
- `channel`: Channel name (web, mobile, chat, speech, agent)
- `platform`: Platform identifier
- `event_type`: Type of event
- `event_category`: Event category
- `resource_id`: Resource identifier (URL, screen name, etc.)
- `resource_title`: Resource title
- `interaction_target`: Interaction target (button, element, etc.)
- `session_id`: Session identifier
- `user_id`: User identifier (optional)
- `device_id`: Device identifier (optional)
- `user_agent`: User agent string
- `client_version`: Client version
- `interaction_value`: Numeric interaction value (optional)
- `interaction_text`: Interaction text content
- `metadata`: Additional metadata as JSON string

## Usage

The service runs automatically when you start the platform with `docker compose up -d`.

### Access MinIO Console

MinIO provides a web console for browsing the stored data:

1. Open http://localhost:9001 in your browser
2. Login with credentials:
   - Username: `minioadmin`
   - Password: `minioadmin`
3. Navigate to `analytics` bucket → `delta` → `analytics-events` to see the Delta Lake files

### Query Delta Lake Data

You can query the Delta Lake data using Python:

```python
from deltalake import DeltaTable
import pandas as pd

# Configure storage options
storage_options = {
    'AWS_ENDPOINT_URL': 'http://localhost:9000',
    'AWS_ACCESS_KEY_ID': 'minioadmin',
    'AWS_SECRET_ACCESS_KEY': 'minioadmin',
    'AWS_REGION': 'us-east-1',
    'AWS_ALLOW_HTTP': 'true'
}

# Load Delta table
dt = DeltaTable(
    's3://analytics/delta/analytics-events',
    storage_options=storage_options
)

# Convert to pandas DataFrame
df = dt.to_pandas()

# Query the data
print(df.head())
print(df.groupby('event_type').size())
```

### View Logs

```bash
docker compose logs -f delta-writer
```

## Benefits of Delta Lake

1. **ACID Transactions**: Ensures data consistency
2. **Schema Evolution**: Automatically handles schema changes
3. **Time Travel**: Query historical versions of data
4. **Efficient Storage**: Parquet format with optimizations
5. **Scalable**: Works with any S3-compatible storage
6. **No Spark Required**: Uses delta-rs (Rust-based) library
7. **Compaction**: Supports compaction for better performance
8. **Metadata**: Rich metadata and statistics

## Monitoring

The service logs all operations including:
- Kafka connection status
- Batch writes to Delta Lake
- Error conditions
- Event processing statistics

Monitor using:
```bash
docker compose logs -f delta-writer
```

## Troubleshooting

### Service not starting
- Check Kafka is running: `docker compose ps kafka`
- Check MinIO is running: `docker compose ps minio`
- View logs: `docker compose logs delta-writer`

### No data being written
- Verify events are in Kafka: Use Kafka console consumer
- Check MinIO bucket exists: Access MinIO console at http://localhost:9001
- Verify storage credentials in docker-compose.yml

### Connection errors
- Ensure MinIO is healthy: `docker compose ps minio`
- Check network connectivity between containers
- Verify AWS credentials in environment variables

## Development

To modify the service:

1. Edit `writer.py`
2. Rebuild the container: `docker compose build delta-writer`
3. Restart the service: `docker compose up -d delta-writer`
4. View logs: `docker compose logs -f delta-writer`

## Dependencies

- **kafka-python**: Kafka consumer client
- **deltalake**: Delta Lake library (delta-rs)
- **pandas**: Data manipulation
