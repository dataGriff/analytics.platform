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
├── 📁 benthos/                           # Stream Processing
│   └── config.yaml                       # Kafka→PostgreSQL pipeline
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
4. benthos            - Stream processor
5. grafana            - Dashboard UI (port 3000)
6. analytics-api      - Event receiver (port 3001)
7. website            - Demo site (port 8080)

DATA FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User → Website → Analytics API → Kafka → Benthos → PostgreSQL → Grafana
       (JS)     (HTTP POST)     (Topic)  (Transform) (SQL)      (Query)

EVENT TYPES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• page_view         - Page loaded
• button_click      - Button clicked
• navigation_click  - Nav link clicked
• page_unload       - Page exited

QUICK START:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$ docker compose up -d              # Start all services
$ open http://localhost:8080        # Demo website
$ open http://localhost:3000        # Grafana (admin/admin)

Total Files: 17 | Services: 7 | Technologies: Docker, Node.js, Kafka, 
Benthos, PostgreSQL, TimescaleDB, Grafana, Nginx
