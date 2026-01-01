#!/bin/sh

# Wait for MinIO to be ready
sleep 5

# Configure mc client
mc alias set myminio http://minio:9000 minioadmin minioadmin

# Create analytics bucket if it doesn't exist
mc mb myminio/analytics --ignore-existing

# Set public policy for the bucket (for demo purposes)
mc anonymous set download myminio/analytics

echo "MinIO bucket 'analytics' created and configured successfully"
