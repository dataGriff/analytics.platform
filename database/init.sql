-- Initialize analytics database

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create analytics events table (channel-agnostic design)
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Channel information
    channel VARCHAR(50) NOT NULL, -- 'web', 'mobile', 'agent', 'chat', 'speech'
    platform VARCHAR(100), -- 'ios', 'android', 'web-desktop', 'web-mobile', 'alexa', 'google-assistant', etc.
    
    -- Event classification
    event_type VARCHAR(100) NOT NULL, -- 'interaction', 'navigation', 'error', 'conversion', 'utterance', 'message', etc.
    event_category VARCHAR(100), -- 'user_action', 'system_event', 'engagement', etc.
    
    -- Context information (channel-agnostic)
    resource_id VARCHAR(500), -- URL for web, screen name for mobile, intent for agents, conversation id for chat
    resource_title VARCHAR(200), -- Page title, screen title, intent name, conversation topic
    interaction_target VARCHAR(200), -- Button/element ID, UI component, command, message type
    
    -- Session and user tracking
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100), -- Optional authenticated user ID
    device_id VARCHAR(100), -- Unique device identifier
    
    -- Technical metadata
    user_agent TEXT, -- Browser/app user agent string
    client_version VARCHAR(50), -- App version, SDK version
    
    -- Interaction-specific data
    interaction_value NUMERIC, -- Duration, count, score, confidence level
    interaction_text TEXT, -- Search query, voice command, chat message, button label
    
    -- Additional context
    metadata JSONB, -- Flexible storage for channel-specific attributes
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, timestamp)
);

-- Convert to TimescaleDB hypertable for better time-series performance
SELECT create_hypertable('analytics_events', 'timestamp', if_not_exists => TRUE);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_channel ON analytics_events(channel);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_resource_id ON analytics_events(resource_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_metadata ON analytics_events USING GIN(metadata);

-- Create a materialized view for real-time analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_summary AS
SELECT 
    date_trunc('minute', timestamp) as time_bucket,
    channel,
    event_type,
    event_category,
    resource_id,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(interaction_value) as avg_interaction_value
FROM analytics_events
GROUP BY time_bucket, channel, event_type, event_category, resource_id
ORDER BY time_bucket DESC;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_analytics_summary_time ON analytics_summary(time_bucket DESC);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO analytics;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO analytics;
