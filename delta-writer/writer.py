#!/usr/bin/env python3
import json
import os
import time
import logging
from datetime import datetime
from kafka import KafkaConsumer
from deltalake import write_deltalake
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:29092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'analytics-events')
KAFKA_GROUP_ID = os.getenv('KAFKA_GROUP_ID', 'delta-writer-consumer')
DELTA_TABLE_PATH = os.getenv('DELTA_TABLE_PATH', 's3://analytics/delta/analytics-events')
BATCH_SIZE = int(os.getenv('BATCH_SIZE', '100'))
BATCH_TIMEOUT_SECONDS = int(os.getenv('BATCH_TIMEOUT_SECONDS', '10'))

# S3/MinIO Configuration
AWS_ENDPOINT_URL = os.getenv('AWS_ENDPOINT_URL', 'http://minio:9000')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', 'minioadmin')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', 'minioadmin')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
AWS_ALLOW_HTTP = os.getenv('AWS_ALLOW_HTTP', 'true')

# Set up storage options for Delta Lake
storage_options = {
    'AWS_ENDPOINT_URL': AWS_ENDPOINT_URL,
    'AWS_ACCESS_KEY_ID': AWS_ACCESS_KEY_ID,
    'AWS_SECRET_ACCESS_KEY': AWS_SECRET_ACCESS_KEY,
    'AWS_REGION': AWS_REGION,
    'AWS_ALLOW_HTTP': AWS_ALLOW_HTTP,
    'AWS_S3_ALLOW_UNSAFE_RENAME': 'true'
}

def wait_for_kafka():
    """Wait for Kafka to be available."""
    max_retries = 30
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to connect to Kafka (attempt {attempt + 1}/{max_retries})...")
            consumer = KafkaConsumer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                consumer_timeout_ms=1000
            )
            consumer.close()
            logger.info("Successfully connected to Kafka")
            return True
        except Exception as e:
            logger.warning(f"Failed to connect to Kafka: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
    
    logger.error("Failed to connect to Kafka after maximum retries")
    return False

def parse_event(message):
    """Parse and normalize event data."""
    try:
        event = json.loads(message.value.decode('utf-8'))
        
        # Ensure timestamp is in ISO format
        if 'timestamp' in event and event['timestamp']:
            try:
                # Try parsing the timestamp
                dt = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00'))
                event['timestamp'] = dt.isoformat()
            except:
                event['timestamp'] = datetime.utcnow().isoformat()
        else:
            event['timestamp'] = datetime.utcnow().isoformat()
        
        # Ensure all required fields have defaults
        event.setdefault('channel', 'unknown')
        event.setdefault('platform', '')
        event.setdefault('event_type', 'unknown')
        event.setdefault('event_category', '')
        event.setdefault('resource_id', '')
        event.setdefault('resource_title', '')
        event.setdefault('interaction_target', '')
        event.setdefault('session_id', '')
        event.setdefault('user_id', '')
        event.setdefault('device_id', '')
        event.setdefault('user_agent', '')
        event.setdefault('client_version', '')
        event.setdefault('interaction_value', None)
        event.setdefault('interaction_text', '')
        
        # Convert metadata to JSON string if it exists
        if 'metadata' in event and isinstance(event['metadata'], (dict, list)):
            event['metadata'] = json.dumps(event['metadata'])
        else:
            event['metadata'] = '{}'
        
        return event
    except Exception as e:
        logger.error(f"Error parsing event: {e}")
        return None

def write_batch_to_delta(events):
    """Write a batch of events to Delta Lake."""
    if not events:
        return
    
    try:
        logger.info(f"Writing batch of {len(events)} events to Delta Lake...")
        
        # Convert to DataFrame
        df = pd.DataFrame(events)
        
        # Ensure proper data types
        if 'interaction_value' in df.columns:
            df['interaction_value'] = pd.to_numeric(df['interaction_value'], errors='coerce')
        
        # Convert timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Write to Delta Lake
        write_deltalake(
            DELTA_TABLE_PATH,
            df,
            mode='append',
            storage_options=storage_options,
            engine='rust'
        )
        
        logger.info(f"Successfully wrote {len(events)} events to Delta Lake")
        
    except Exception as e:
        logger.error(f"Error writing to Delta Lake: {e}", exc_info=True)
        raise

def main():
    """Main consumer loop."""
    logger.info("Delta Lake Writer Service Starting...")
    logger.info(f"Kafka Bootstrap Servers: {KAFKA_BOOTSTRAP_SERVERS}")
    logger.info(f"Kafka Topic: {KAFKA_TOPIC}")
    logger.info(f"Delta Table Path: {DELTA_TABLE_PATH}")
    logger.info(f"Batch Size: {BATCH_SIZE}")
    logger.info(f"Batch Timeout: {BATCH_TIMEOUT_SECONDS}s")
    
    # Wait for Kafka to be available
    if not wait_for_kafka():
        logger.error("Kafka is not available. Exiting.")
        return
    
    # Create Kafka consumer
    logger.info("Creating Kafka consumer...")
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id=KAFKA_GROUP_ID,
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        value_deserializer=lambda x: x
    )
    
    logger.info(f"Subscribed to topic: {KAFKA_TOPIC}")
    logger.info("Starting to consume messages...")
    
    batch = []
    last_batch_time = time.time()
    
    try:
        for message in consumer:
            # Parse event
            event = parse_event(message)
            if event:
                batch.append(event)
                
                # Check if we should write the batch
                batch_full = len(batch) >= BATCH_SIZE
                batch_timeout = (time.time() - last_batch_time) >= BATCH_TIMEOUT_SECONDS
                
                if batch_full or batch_timeout:
                    write_batch_to_delta(batch)
                    batch = []
                    last_batch_time = time.time()
            
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
    except Exception as e:
        logger.error(f"Error in consumer loop: {e}", exc_info=True)
    finally:
        # Write any remaining events
        if batch:
            logger.info("Writing remaining events before shutdown...")
            write_batch_to_delta(batch)
        
        logger.info("Closing Kafka consumer...")
        consumer.close()
        logger.info("Delta Lake Writer Service stopped")

if __name__ == '__main__':
    main()
