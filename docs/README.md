# Documentation

Welcome to the Analytics Platform documentation!

## 📖 Table of Contents

### Getting Started
- **[Getting Started Guide](getting-started.md)** - Quick setup and first steps
- **[Integration Guide](integration.md)** - How to integrate the platform with your applications

### Architecture & Design
- **[Architecture](architecture.md)** - System architecture and component overview
- **[Channel-Agnostic Schema](schema.md)** - Unified event schema across all channels

### Advanced Topics
- **[Delta Lake Integration](delta-lake.md)** - Delta Lake implementation without Spark
- **[Production Deployment](production.md)** - Best practices for production deployment

### Service Documentation
- **[Delta Writer](services/delta-writer.md)** - Delta Lake writer service documentation
- **[Delta Dashboard](services/delta-dashboard.md)** - Streamlit dashboard documentation
- **[Chat App](services/chat-app.md)** - Chat application demo documentation
- **[Mobile App](services/mobile-app.md)** - Mobile application demo documentation

## 🚀 Quick Links

### For First-Time Users
Start here to get the platform running:
1. [Prerequisites](getting-started.md#prerequisites)
2. [Quick Start](getting-started.md#quick-start)
3. [Access Applications](getting-started.md#access-the-applications)

### For Developers
Integrate the analytics platform with your applications:
1. [Integration Overview](integration.md#overview)
2. [Channel-Specific Examples](integration.md#channel-specific-examples)
3. [API Documentation](integration.md#api-endpoint)

### For Architects
Understand the system design:
1. [Component Diagram](architecture.md#component-diagram)
2. [Dual Storage Architecture](architecture.md#dual-storage-architecture)
3. [Data Flow](architecture.md#data-flow)

### For DevOps
Deploy and maintain in production:
1. [Security Checklist](production.md#security-checklist)
2. [Scaling Strategy](production.md#infrastructure-considerations)
3. [Monitoring and Alerting](production.md#monitoring-and-alerting)

## 📚 Additional Resources

### Code Examples
- **[Web Implementation](../website/analytics.js)** - JavaScript analytics library for web
- **[Mobile Example](../examples/mobile-analytics.js)** - React Native implementation
- **[Chat Example](../examples/chat-analytics.js)** - Chat platform integration
- **[Speech Example](../examples/speech-analytics.js)** - Voice assistant integration
- **[Agent Example](../examples/agent-analytics.js)** - AI agent integration

### Configuration Files
- **[Docker Compose](../docker-compose.yml)** - Service orchestration
- **[Bento Config](../bento/config.yaml)** - Stream processing configuration
- **[Database Schema](../database/init.sql)** - PostgreSQL table definitions
- **[Grafana Dashboards](../grafana/dashboards/)** - Pre-built dashboard definitions

## 🔍 Finding What You Need

### By Topic

**Getting Started**
- How do I install the platform? → [Getting Started Guide](getting-started.md)
- What applications are included? → [Getting Started: Access Applications](getting-started.md#access-the-applications)
- How do I test if it's working? → [Getting Started: Test the Platform](getting-started.md#test-the-platform)

**Integration**
- How do I send events? → [Integration Guide: API Endpoint](integration.md#api-endpoint)
- What channels are supported? → [Integration Guide: Channel-Specific Examples](integration.md#channel-specific-examples)
- What fields are required? → [Integration Guide: API Endpoint](integration.md#api-endpoint)

**Architecture**
- How does data flow through the system? → [Architecture: Data Flow](architecture.md#data-flow)
- What is dual storage? → [Architecture: Dual Storage Architecture](architecture.md#dual-storage-architecture)
- How do I scale the platform? → [Architecture: Scalability Considerations](architecture.md#scalability-considerations)

**Schema**
- What is the event structure? → [Schema: Schema Structure](schema.md#schema-structure)
- How do different channels map to the schema? → [Schema: Field Mappings by Channel](schema.md#field-mappings-by-channel)
- What metadata can I include? → [Schema: Channel-Specific Metadata](schema.md#channel-specific-metadata-examples)

**Delta Lake**
- Why Delta Lake? → [Delta Lake: Benefits](delta-lake.md#delta-lake-benefits)
- How is it implemented without Spark? → [Delta Lake: Technical Details](delta-lake.md#technical-details)
- How do I query Delta Lake data? → [Delta Lake: Usage Examples](delta-lake.md#usage-examples)

**Production**
- What security measures should I take? → [Production: Security Checklist](production.md#security-checklist)
- How do I scale for production? → [Production: Infrastructure Considerations](production.md#infrastructure-considerations)
- What should I monitor? → [Production: Monitoring and Alerting](production.md#monitoring-and-alerting)

### By Role

**Data Analyst**
- [Getting Started Guide](getting-started.md) - Access Grafana and Delta Dashboard
- [Schema Documentation](schema.md) - Understand the data structure
- [Sample Queries](schema.md#sample-queries) - Example SQL queries

**Software Engineer**
- [Integration Guide](integration.md) - Add analytics to your app
- [Architecture](architecture.md) - Understand the system
- [API Documentation](integration.md#api-endpoint) - API reference

**DevOps Engineer**
- [Getting Started Guide](getting-started.md) - Deploy the platform
- [Architecture](architecture.md) - Understand components
- [Production Deployment](production.md) - Production best practices

**Data Engineer**
- [Architecture](architecture.md) - Data pipeline overview
- [Delta Lake Integration](delta-lake.md) - Data lake details
- [Schema Documentation](schema.md) - Event schema reference

## 💡 Contributing to Documentation

Found an error or want to improve the documentation? Contributions are welcome!

1. Documentation files are in Markdown format
2. Keep examples clear and concise
3. Update the Table of Contents when adding new sections
4. Test all code examples before committing

## 📧 Need Help?

- **Issues**: Open an issue in the repository
- **Questions**: Check existing documentation first
- **Bugs**: Provide logs and reproduction steps
- **Feature Requests**: Describe the use case and expected behavior
