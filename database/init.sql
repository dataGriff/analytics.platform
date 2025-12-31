-- Initialize analytics database

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
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

-- Convert to TimescaleDB hypertable for better time-series performance
SELECT create_hypertable('analytics_events', 'timestamp', if_not_exists => TRUE);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_url ON analytics_events(page_url);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);

-- Create a materialized view for real-time analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_summary AS
SELECT 
    date_trunc('minute', timestamp) as time_bucket,
    event_type,
    page_url,
    COUNT(*) as event_count
FROM analytics_events
GROUP BY time_bucket, event_type, page_url
ORDER BY time_bucket DESC;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_analytics_summary_time ON analytics_summary(time_bucket DESC);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO analytics;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO analytics;
