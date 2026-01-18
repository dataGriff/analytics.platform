# Production Deployment

This guide covers best practices for deploying the analytics platform to production.

## Security Checklist

### General Security
- [ ] Change all default passwords
- [ ] Enable SSL/TLS for all services
- [ ] Add authentication to Analytics API
- [ ] Implement rate limiting on API endpoints
- [ ] Use environment variables for secrets
- [ ] Enable Kafka SASL/SSL authentication
- [ ] Restrict network access with firewall rules
- [ ] Add CORS configuration for Analytics API
- [ ] Use reverse proxy (nginx) for external access
- [ ] Enable database connection encryption
- [ ] Regular security updates and patches
- [ ] Implement audit logging

### Credentials to Change

1. **PostgreSQL**
   - Default: `analytics/analytics123`
   - Change: Use strong passwords, store in secrets manager

2. **MinIO**
   - Default: `minioadmin/minioadmin`
   - Change: Use strong credentials, configure IAM policies

3. **Grafana**
   - Default: `admin/admin`
   - Change: Use strong passwords, enable OAuth/LDAP

### MinIO Security

Production MinIO configuration:

```yaml
environment:
  MINIO_ROOT_USER: ${MINIO_ROOT_USER}  # Use secrets
  MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}  # Use secrets
  MINIO_SERVER_URL: https://minio.yourdomain.com
  MINIO_BROWSER_REDIRECT_URL: https://console.yourdomain.com
```

Additional steps:
- Configure proper IAM policies (no anonymous access)
- Enable TLS/SSL encryption
- Restrict bucket access to authorized services
- Enable audit logging
- Configure bucket policies and ACLs
- Use versioning for important buckets

### Analytics API Security

Add authentication middleware:

```javascript
// Example: API key authentication
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.post('/analytics', authenticate, async (req, res) => {
  // Handle event
});
```

Add rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});

app.use('/analytics', limiter);
```

## Infrastructure Considerations

### Container Orchestration

Consider using Kubernetes for production:

```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: analytics-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: analytics-api
  template:
    metadata:
      labels:
        app: analytics-api
    spec:
      containers:
      - name: analytics-api
        image: analytics-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: KAFKA_BROKERS
          valueFrom:
            configMapKeyRef:
              name: kafka-config
              key: brokers
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
```

### Resource Allocation

Recommended minimum resources for production:

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| Analytics API | 2 cores | 2GB | - |
| Kafka | 4 cores | 8GB | 100GB SSD |
| PostgreSQL | 4 cores | 16GB | 500GB SSD |
| Bento | 2 cores | 2GB | - |
| Delta Writer | 2 cores | 4GB | - |
| MinIO | 4 cores | 8GB | 1TB+ (depending on retention) |
| Grafana | 1 core | 1GB | 10GB |
| Delta Dashboard | 2 cores | 4GB | - |

### Scaling Strategy

#### Horizontal Scaling

1. **Analytics API**: Stateless, scale freely
   ```bash
   kubectl scale deployment analytics-api --replicas=5
   ```

2. **Kafka**: Add more brokers and increase partitions
   ```yaml
   # Increase partitions for parallelism
   kafka-topics --alter --topic analytics-events \
     --partitions 10 --bootstrap-server kafka:9092
   ```

3. **Bento**: Scale with Kafka partitions
   ```bash
   kubectl scale deployment bento --replicas=10
   ```

4. **Delta Writer**: Scale independently
   ```bash
   kubectl scale deployment delta-writer --replicas=5
   ```

5. **PostgreSQL**: Use read replicas for Grafana
   - Primary: Write operations
   - Replicas: Read operations (Grafana queries)

6. **MinIO**: Deploy in distributed mode
   - Multiple nodes with erasure coding
   - High availability and durability

#### Vertical Scaling

- Monitor resource usage and adjust limits
- PostgreSQL: Increase shared_buffers, work_mem
- Kafka: Tune JVM heap size
- All services: Adjust based on load patterns

## High Availability

### Multi-Zone Deployment

Deploy services across multiple availability zones:

```yaml
# Example Kubernetes pod anti-affinity
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - analytics-api
        topologyKey: topology.kubernetes.io/zone
```

### Service Redundancy

1. **Multiple Analytics API instances**: Behind load balancer
2. **Kafka cluster**: 3+ brokers with replication factor 3
3. **PostgreSQL**: Primary-replica with automatic failover
4. **MinIO**: Distributed mode with 4+ nodes
5. **Grafana**: Multiple instances (stateless)

### Health Checks

Implement comprehensive health checks:

```yaml
# Kubernetes liveness and readiness probes
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Monitoring and Alerting

### Metrics to Monitor

1. **Analytics API**
   - Request rate
   - Response time
   - Error rate
   - Kafka producer lag

2. **Kafka**
   - Broker availability
   - Consumer lag
   - Partition distribution
   - Disk usage

3. **PostgreSQL**
   - Connection count
   - Query performance
   - Replication lag
   - Disk usage

4. **Bento**
   - Processing rate
   - Error rate
   - Queue depth

5. **Delta Writer**
   - Batch write frequency
   - Error rate
   - MinIO connection status

6. **MinIO**
   - Storage usage
   - Request rate
   - Error rate

### Alerting Rules

Example alerts to configure:

```yaml
# Prometheus alert rules
groups:
- name: analytics
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      
  - alert: KafkaConsumerLag
    expr: kafka_consumer_lag > 10000
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Kafka consumer lag is high"
```

### Log Aggregation

Use centralized logging:

- **Option 1**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Option 2**: Splunk
- **Option 3**: CloudWatch Logs (AWS)
- **Option 4**: Stackdriver (GCP)

Example log format:

```json
{
  "timestamp": "2026-01-18T12:00:00Z",
  "level": "info",
  "service": "analytics-api",
  "message": "Event received",
  "session_id": "session-123",
  "event_type": "page_view"
}
```

## Data Retention

### PostgreSQL Retention

Configure TimescaleDB retention policies:

```sql
-- Retain last 90 days in hot storage
SELECT add_retention_policy('analytics_events', INTERVAL '90 days');

-- Compress data older than 7 days
SELECT add_compression_policy('analytics_events', INTERVAL '7 days');
```

### Delta Lake Retention

Implement data lifecycle policies:

```python
# Vacuum old versions (run periodically)
from deltalake import DeltaTable

dt = DeltaTable('s3://analytics/delta/analytics-events')
dt.vacuum(retention_hours=168)  # Keep 7 days of history
```

### Backup Strategy

1. **PostgreSQL**
   - Daily full backups
   - Hourly incremental backups
   - Test restore procedures regularly

   ```bash
   # Example backup script
   pg_dump -U analytics -d analytics > backup_$(date +%Y%m%d).sql
   ```

2. **MinIO/Delta Lake**
   - Enable versioning on buckets
   - Cross-region replication
   - Regular snapshot backups

   ```bash
   # MinIO mirror for backup
   mc mirror minio/analytics s3-backup/analytics
   ```

## Networking

### Load Balancer Configuration

Example nginx configuration for Analytics API:

```nginx
upstream analytics_api {
    least_conn;
    server api1:3001 max_fails=3 fail_timeout=30s;
    server api2:3001 max_fails=3 fail_timeout=30s;
    server api3:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name analytics.yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/analytics.crt;
    ssl_certificate_key /etc/ssl/private/analytics.key;
    
    location /analytics {
        proxy_pass http://analytics_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
    }
    
    location /health {
        proxy_pass http://analytics_api;
        access_log off;
    }
}
```

### Firewall Rules

Restrict access to internal services:

| Service | Port | Access |
|---------|------|--------|
| Analytics API | 3001 | Public (via load balancer) |
| Grafana | 3000 | Internal/VPN only |
| PostgreSQL | 5432 | Internal only |
| Kafka | 9092 | Internal only |
| MinIO API | 9000 | Internal only |
| MinIO Console | 9001 | Internal/VPN only |
| Delta Dashboard | 8501 | Internal/VPN only |

## Disaster Recovery

### Backup Procedures

1. **Database Backups**
   - Automated daily backups
   - Store in separate region
   - Retention: 30 days

2. **Configuration Backups**
   - Version control all configs
   - Automated deployment pipelines
   - Infrastructure as Code (Terraform)

3. **Data Lake Backups**
   - MinIO replication to secondary region
   - Delta Lake versioning enabled
   - Regular restore testing

### Recovery Procedures

Document and test recovery procedures:

1. **Service Failure**: Automatic restart/failover
2. **Database Failure**: Promote replica to primary
3. **Complete Failure**: Restore from backups
4. **Data Corruption**: Use Delta Lake time travel

### RTO and RPO Targets

Define targets for your organization:

- **RTO (Recovery Time Objective)**: How quickly you need to recover
  - Example: 1 hour for critical services
- **RPO (Recovery Point Objective)**: How much data loss is acceptable
  - Example: 15 minutes (last backup)

## Performance Optimization

### PostgreSQL Tuning

```sql
-- Adjust based on your hardware
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET max_connections = 200;

-- Reload configuration
SELECT pg_reload_conf();
```

### Kafka Tuning

```properties
# Increase throughput
num.network.threads=8
num.io.threads=16
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400

# Retention
log.retention.hours=168
log.segment.bytes=1073741824
```

### MinIO Performance

- Use SSDs for better performance
- Configure appropriate erasure coding
- Tune cache settings
- Use distributed mode for high throughput

## Cost Optimization

1. **Right-size resources**: Monitor and adjust based on actual usage
2. **Data retention**: Implement policies to delete old data
3. **Compression**: Enable compression on PostgreSQL and Kafka
4. **Reserved instances**: Use reserved/committed instances for steady workload
5. **Spot instances**: Use for non-critical batch processing
6. **Storage tiering**: Move old data to cheaper storage tiers

## Compliance and Privacy

### GDPR Compliance

- Implement data deletion capabilities
- Add user consent tracking
- Provide data export functionality
- Document data processing activities

### Data Anonymization

Consider anonymizing sensitive fields:

```sql
-- Example: Anonymize IP addresses
UPDATE analytics_events
SET metadata = jsonb_set(
  metadata,
  '{ip_address}',
  to_jsonb(regexp_replace(metadata->>'ip_address', '\d+$', 'XXX'))
)
WHERE timestamp < NOW() - INTERVAL '30 days';
```

## Deployment Checklist

- [ ] Security audit completed
- [ ] All default passwords changed
- [ ] SSL/TLS enabled on all services
- [ ] Authentication configured
- [ ] Rate limiting implemented
- [ ] Monitoring and alerting set up
- [ ] Log aggregation configured
- [ ] Backup procedures tested
- [ ] Disaster recovery plan documented
- [ ] Load testing completed
- [ ] Health checks implemented
- [ ] Documentation updated
- [ ] Team trained on operations

## Managed Service Alternatives

Consider using managed services to reduce operational overhead:

- **Kafka**: Confluent Cloud, AWS MSK, Azure Event Hubs
- **PostgreSQL**: AWS RDS, Google Cloud SQL, Azure Database
- **Object Storage**: AWS S3, Google Cloud Storage, Azure Blob
- **Monitoring**: Datadog, New Relic, Prometheus + Grafana Cloud

## Next Steps

- **Set up monitoring**: Configure alerts and dashboards
- **Test disaster recovery**: Regular DR drills
- **Performance testing**: Load test your deployment
- **Security audit**: Regular security reviews
- **Documentation**: Keep runbooks up to date
