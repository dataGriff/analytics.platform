# Delta Lake Analytics Dashboard

An interactive web dashboard for visualizing analytics events stored in Delta Lake.

## Features

- **Real-time Data Visualization**: View analytics events from Delta Lake with auto-refresh capability
- **Interactive Filters**: Filter by date range, channel, and event type
- **Rich Charts**: 
  - Time series of events over time
  - Channel distribution pie chart
  - Event type breakdown
  - Platform and category analysis
  - Heatmap of channel × event type
- **Recent Events Table**: Browse the most recent events
- **Data Export**: Download filtered data as CSV

## Usage

The dashboard is accessible at: **http://localhost:8501**

### Controls

- **Auto-refresh**: Enable to automatically refresh data every 60 seconds
- **Refresh Data**: Manual refresh button
- **Date Range**: Filter events by date range
- **Channel**: Filter by specific channel (web, chat, mobile, agent, speech)
- **Event Type**: Filter by event type (page_view, click, message_sent, etc.)

## Technology Stack

- **Streamlit**: Interactive dashboard framework
- **Delta Lake**: Data lake storage format
- **Plotly**: Interactive charting library
- **Pandas**: Data manipulation
- **MinIO**: S3-compatible object storage backend

## Architecture

```
Delta Lake (MinIO) → Dashboard Service → Streamlit UI
```

The dashboard reads directly from Delta Lake tables stored in MinIO, providing a real-time view of your analytics data without impacting the operational PostgreSQL database.

## Development

To run locally:

```bash
pip install -r requirements.txt
streamlit run dashboard.py
```

## Environment Variables

- `DELTA_TABLE_PATH`: Path to Delta Lake table (default: `s3://analytics/delta/analytics-events`)
- `AWS_ENDPOINT_URL`: MinIO endpoint (default: `http://minio:9000`)
- `AWS_ACCESS_KEY_ID`: MinIO access key (default: `minioadmin`)
- `AWS_SECRET_ACCESS_KEY`: MinIO secret key (default: `minioadmin`)
