#!/bin/bash

# CosmicHub Data Flow Diagram Generator
# ====================================
# 
# This script generates Mermaid diagrams showing data flows in CosmicHub

echo "🌟 Generating CosmicHub Data Flow Diagrams..."

mkdir -p data-flow-diagrams

# Generate System Overview Diagram
cat > data-flow-diagrams/system-overview.mmd << 'EOF'
graph TD
    %% Frontend Applications
    A[Astro App<br/>Main Frontend] --> |API Requests| D[Main API<br/>FastAPI]
    B[Healwave App<br/>Secondary Frontend] --> |API Requests| D
    C[Mobile App<br/>React Native] --> |API Requests| D
    
    %% Backend Services
    D --> |Ephemeris Calculations| E[Ephemeris Server<br/>Astronomical Data]
    D --> |User Data Storage| F[Firebase<br/>Primary Database]
    
    %% Analytics System
    A --> |User Events| G[Analytics Service<br/>Event Tracking]
    B --> |User Events| G
    C --> |User Events| G
    D --> |Performance Metrics| G
    G --> |Custom Analytics| H[SQLite Database<br/>Analytics Storage]
    G --> |External Analytics| I[Google Analytics 4]
    G --> |Event Tracking| J[Mixpanel]
    G --> |Session Recording| K[PostHog]
    
    %% Monitoring System
    D --> |Metrics Collection| L[Prometheus<br/>Metrics Storage]
    E --> |Performance Data| L
    L --> |Dashboard Data| M[Grafana<br/>Monitoring Dashboards]
    
    %% Styling
    classDef frontend fill:#45B7D1,stroke:#333,stroke-width:2px
    classDef backend fill:#96CEB4,stroke:#333,stroke-width:2px
    classDef database fill:#FFEAA7,stroke:#333,stroke-width:2px
    classDef external fill:#DDA0DD,stroke:#333,stroke-width:2px
    classDef analytics fill:#FF6B6B,stroke:#333,stroke-width:2px
    classDef monitoring fill:#4ECDC4,stroke:#333,stroke-width:2px
    
    class A,B,C frontend
    class D,E backend
    class F,H database
    class I,J,K external
    class G analytics
    class L,M monitoring
EOF

# Generate Analytics Flow Diagram
cat > data-flow-diagrams/analytics-flow.mmd << 'EOF'
graph LR
    %% User Interactions
    U1[User Page Views] --> A[Analytics Service]
    U2[Chart Calculations] --> A
    U3[Button Clicks] --> A
    U4[Form Submissions] --> A
    U5[Error Events] --> A
    
    %% Analytics Processing
    A --> |Real-time Events| B[Event Queue<br/>Processing]
    B --> |Privacy Filtering| C[GDPR Compliance<br/>Data Sanitization]
    
    %% Data Storage
    C --> |Custom Analytics| D[SQLite Database<br/>Local Analytics]
    C --> |User Behavior| E[Google Analytics 4<br/>Web Analytics]
    C --> |Event Tracking| F[Mixpanel<br/>Product Analytics]
    C --> |Session Data| G[PostHog<br/>User Experience]
    
    %% Analytics Dashboard
    D --> |Dashboard API| H[Analytics Dashboard<br/>Real-time Metrics]
    H --> |Visualizations| I[Charts & Graphs<br/>Business Intelligence]
    
    classDef events fill:#FFE4B5,stroke:#333,stroke-width:2px
    classDef processing fill:#FF6B6B,stroke:#333,stroke-width:2px
    classDef storage fill:#98FB98,stroke:#333,stroke-width:2px
    classDef dashboard fill:#87CEEB,stroke:#333,stroke-width:2px
    
    class U1,U2,U3,U4,U5 events
    class A,B,C processing
    class D,E,F,G storage
    class H,I dashboard
EOF

# Generate Monitoring Flow Diagram
cat > data-flow-diagrams/monitoring-flow.mmd << 'EOF'
graph TD
    %% Application Components
    A[Main API<br/>FastAPI Server] --> |HTTP Metrics| M[Prometheus<br/>Metrics Collection]
    B[Ephemeris Server<br/>Astronomical Calculations] --> |Performance Data| M
    C[Analytics Service<br/>Event Processing] --> |Service Metrics| M
    
    %% System Metrics
    S1[CPU Usage] --> M
    S2[Memory Usage] --> M
    S3[Disk I/O] --> M
    S4[Network Traffic] --> M
    
    %% Prometheus Processing
    M --> |Time Series Data| P[Prometheus Database<br/>Metrics Storage]
    P --> |Query API| G[Grafana<br/>Visualization]
    
    %% Grafana Dashboards
    G --> D1[API Performance<br/>Dashboard]
    G --> D2[System Health<br/>Dashboard]
    G --> D3[Business Metrics<br/>Dashboard]
    G --> D4[SLO Compliance<br/>Dashboard]
    
    %% Alerting
    M --> |Alert Rules| AL[Alertmanager<br/>Notification System]
    AL --> |Notifications| N1[Email Alerts]
    AL --> |Notifications| N2[Slack Integration]
    
    classDef apps fill:#45B7D1,stroke:#333,stroke-width:2px
    classDef system fill:#90EE90,stroke:#333,stroke-width:2px
    classDef monitoring fill:#4ECDC4,stroke:#333,stroke-width:2px
    classDef dashboards fill:#FFB6C1,stroke:#333,stroke-width:2px
    classDef alerts fill:#FFA07A,stroke:#333,stroke-width:2px
    
    class A,B,C apps
    class S1,S2,S3,S4 system
    class M,P monitoring
    class G,D1,D2,D3,D4 dashboards
    class AL,N1,N2 alerts
EOF

# Generate User Journey Flow Diagram
cat > data-flow-diagrams/user-journey.mmd << 'EOF'
journey
    title User Data Flow Journey in CosmicHub
    
    section User Arrival
      Visit Website: 5: User
      Page Load Analytics: 3: Analytics
      Performance Tracking: 4: Monitoring
    
    section Chart Creation
      Enter Birth Data: 5: User
      API Request: 4: Frontend
      Ephemeris Calculation: 3: Backend
      Chart Generation: 4: Backend
      Result Display: 5: Frontend
      Usage Analytics: 3: Analytics
    
    section User Engagement
      View Interpretation: 5: User
      AI Interaction: 4: User
      Event Tracking: 3: Analytics
      Performance Metrics: 4: Monitoring
    
    section Data Storage
      User Profile Save: 4: Backend
      Firebase Storage: 3: Database
      Analytics Events: 3: Analytics
      Metrics Collection: 4: Monitoring
EOF

echo "✅ Generated Mermaid diagrams:"
echo "   📁 data-flow-diagrams/system-overview.mmd"
echo "   📁 data-flow-diagrams/analytics-flow.mmd" 
echo "   📁 data-flow-diagrams/monitoring-flow.mmd"
echo "   📁 data-flow-diagrams/user-journey.mmd"
echo ""
echo "🌐 To visualize:"
echo "   • Copy diagram content to https://mermaid.live"
echo "   • Use VS Code Mermaid extension"
echo "   • Generate PNG: mmdc -i diagram.mmd -o diagram.png"
echo ""
echo "📊 Also available: data-flow-visualization.html for interactive view"
