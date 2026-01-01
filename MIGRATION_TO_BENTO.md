# Migration from Benthos to Bento

## Overview
This project has been successfully migrated from Benthos to Bento. Bento is the actively maintained, fully open-source fork of Benthos that continues development after Benthos was acquired by Redpanda.

## What Changed

### 1. Docker Image
- **Before**: `jeffail/benthos:4.25.0`
- **After**: `ghcr.io/warpstreamlabs/bento:latest`

### 2. Directory Structure
- **Before**: `benthos/` directory
- **After**: `bento/` directory

### 3. Service Name
- **Before**: Service named `benthos` in docker-compose.yml
- **After**: Service named `bento` in docker-compose.yml

### 4. Configuration File
- **Location**: `bento/config.yaml` (renamed from `benthos/config.yaml`)
- **Changes**: 
  - `root_path` changed from `/benthos` to `/bento`
  - `consumer_group` changed from `benthos-analytics-consumer` to `bento-analytics-consumer`

## Why Bento?

1. **Active Development**: Bento is actively maintained by the community and WarpStream Labs
2. **Open Source**: Remains fully MIT licensed and open source
3. **Drop-in Replacement**: Fully compatible with Benthos configurations
4. **Up-to-date**: Receives regular updates and new features
5. **Community Support**: Growing community with active Discord and Slack channels

## Configuration Compatibility

Bento is 100% compatible with Benthos configurations. The existing pipeline configuration works without any modifications:

```yaml
input:
  kafka:
    addresses:
      - kafka:29092
    topics:
      - analytics-events
    consumer_group: bento-analytics-consumer

pipeline:
  processors:
    - mapping: |
        # Your existing Bloblang mappings work as-is
        root = this
        root.timestamp = this.timestamp.or(now())
        # ... etc

output:
  sql_insert:
    # Your existing output configuration works as-is
    driver: postgres
    dsn: postgres://analytics:analytics123@postgres:5432/analytics?sslmode=disable
    # ... etc
```

## Documentation Updates

All documentation has been updated to reflect the migration:
- ✅ README.md
- ✅ ARCHITECTURE.md
- ✅ SUMMARY.md
- ✅ QUICKSTART.md
- ✅ PROJECT_STRUCTURE.md
- ✅ COMPLETION_CHECKLIST.md
- ✅ website/index.html
- ✅ website/page2.html

## Commands Updated

### Docker Commands
```bash
# Before
docker compose logs -f benthos
docker compose restart benthos
docker compose up -d --scale benthos=3

# After
docker compose logs -f bento
docker compose restart bento
docker compose up -d --scale bento=3
```

## Testing

The migration has been tested and verified:
- ✅ Bento container starts successfully
- ✅ Kafka consumer connects and consumes messages
- ✅ SQL output inserts data into PostgreSQL
- ✅ HTTP metrics endpoint available at port 4195
- ✅ All existing functionality maintained

## Resources

- **Bento GitHub**: https://github.com/warpstreamlabs/bento
- **Bento Documentation**: https://warpstreamlabs.github.io/bento/
- **Docker Image**: https://github.com/warpstreamlabs/bento/pkgs/container/bento

## No Action Required

For users of this platform:
- No configuration changes needed beyond pulling the new docker-compose.yml
- No pipeline modifications required
- No database schema changes
- Simply run `docker compose up -d` to use Bento

The migration is transparent and maintains all existing functionality while providing access to future updates and improvements from the Bento community.
