analytics.platform/
│
├── 📄 README.md                          # Main documentation & setup guide
├── 📄 QUICKSTART.md                      # 5-minute getting started guide
├── 📄 ARCHITECTURE.md                    # Technical architecture & testing
├── 📄 SUMMARY.md                         # Implementation summary
├── 📄 .gitignore                         # Git exclusions
├── 📄 docker-compose.yml                 # Multi-service orchestration
│
├── 📁 analytics-api/                     # Event Collection Service
│   ├── Dockerfile                        # Node.js container image
│   ├── package.json                      # Dependencies (express, kafkajs)
│   └── server.js                         # Main API server (Kafka producer)
│
├── 📁 bento/                           # Stream Processing (PostgreSQL)
│   └── config.yaml                       # Kafka→PostgreSQL pipeline
│
├── 📁 delta-writer/                      # Stream Processing (Delta Lake)
│   ├── Dockerfile                        # Python container image
│   ├── requirements.txt                  # Python dependencies
│   ├── writer.py                         # Delta Lake writer service
│   └── README.md                         # Delta writer documentation
│
├── 📁 minio/                             # MinIO Configuration
│   └── init-bucket.sh                    # Bucket initialization script
│
├── 📁 database/                          # Database Setup
│   └── init.sql                          # Schema, indexes, hypertable
│
├── 📁 grafana/                           # Visualization
│   ├── dashboards/
│   │   └── analytics-dashboard.json     # Pre-built dashboard
│   └── provisioning/
│       ├── dashboards/
│       │   └── dashboards.yaml          # Dashboard provider config
│       └── datasources/
│           └── postgres.yaml            # PostgreSQL datasource
│
└── 📁 website/                           # Demo Application
    ├── Dockerfile                        # Nginx web server
    ├── index.html                        # Page 1 (3 buttons)
    ├── page2.html                        # Page 2 (3 buttons)
    ├── analytics.js                      # Event tracking library
    └── styles.css                        # Responsive styling

SERVICES (via docker-compose.yml):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. zookeeper          - Kafka coordination service
2. kafka              - Message broker (port 9092)
3. postgres           - TimescaleDB database (port 5432)
4. minio              - S3-compatible storage (ports 9000, 9001)
5. minio-init         - Bucket initialization
6. bento            - Stream processor (PostgreSQL)
7. delta-writer       - Stream processor (Delta Lake)
8. grafana            - Dashboard UI (port 3000)
9. analytics-api      - Event receiver (port 3001)
10. website           - Demo site (port 8080)

DATA FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User → Website → Analytics API → Kafka → ┬→ Bento → PostgreSQL → Grafana
       (JS)     (HTTP POST)     (Topic)   └→ Delta Writer → MinIO (Delta Lake)

EVENT TYPES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• page_view         - Page loaded
• button_click      - Button clicked
• navigation_click  - Nav link clicked
• page_unload       - Page exited

STORAGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• PostgreSQL/TimescaleDB - Hot storage for real-time analytics
• Delta Lake on MinIO     - Data lake for long-term storage

QUICK START:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$ docker compose up -d              # Start all services
$ open http://localhost:8080        # Demo website
$ open http://localhost:3000        # Grafana (admin/admin)
$ open http://localhost:9001        # MinIO Console (minioadmin/minioadmin)

Total Files: 21 | Services: 10 | Technologies: Docker, Node.js, Python, Kafka, 
Bento, PostgreSQL, TimescaleDB, Delta Lake, MinIO, Grafana, Nginx
