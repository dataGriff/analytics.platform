#!/bin/sh

# Wait for MinIO to be ready
sleep 5

# Configure mc client
mc alias set myminio http://minio:9000 minioadmin minioadmin

# Create analytics bucket if it doesn't exist
mc mb myminio/analytics --ignore-existing

# Note: For production, remove the following line and configure proper access policies
# mc anonymous set download myminio/analytics

echo "MinIO bucket 'analytics' created successfully"
echo "WARNING: Anonymous access is disabled. Configure access policies for production use."
