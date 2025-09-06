# CosmicHub Data Flow Visualization Guide

This document provides multiple approaches to visualize the data flows in your CosmicHub project.

## Current Analytics & Monitoring Setup

Your project has several data flow systems already implemented:

### 1. Analytics System (ANALYTICS-001) ✅

- **Package**: `packages/analytics/` - Complete analytics package
- **Backend**: `backend/analytics/` - API with database layer
- **Frontend**: `apps/astro/src/services/analytics.ts` - Integration service
- **Demo**: `analytics-demo.html` - Interactive testing interface

### 2. Monitoring & Observability (OBS-011) ✅

- **Grafana Dashboards**: `backend/monitoring/grafana/dashboards/`
- **Prometheus Metrics**: `backend/monitoring/prometheus/`
- **System Monitoring**: Performance, errors, SLOs

## Visualization Options

### Option 1: Use Your Existing Analytics Dashboard

Your project has a working analytics dashboard at `apps/astro/src/pages/dashboard/analytics.astro`

**Access it:**

```bash
# Start the development server
pnpm run dev-frontend

# Visit: http://localhost:4321/dashboard/analytics
```

### Option 2: Use Your Grafana Dashboards

You have comprehensive Grafana dashboards for performance metrics:

**Access them:**

```bash
# Start monitoring stack
cd backend/monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Visit: http://localhost:3001
```

**Available dashboards:**

- API Performance Dashboard
- System Monitoring Dashboard
- Service Level Dashboard
- Business Metrics Dashboard

### Option 3: Use Your Analytics Demo

You have an interactive demo showing real-time data flows:

**Access it:**

```bash
# Start backend
pnpm run dev:backend

# Open analytics-demo.html in browser
# or visit http://localhost:8000/analytics-demo.html
```

## Creating Additional Visualizations

### Option 4: Interactive Data Flow Diagram

I've created an interactive HTML visualization for you at `data-flow-visualization.html`.

**Features:**

- Interactive D3.js-powered diagrams
- Multiple views: System Overview, Analytics Flow, Monitoring Flow, Live Metrics
- Click nodes for details, hover for tooltips
- Animated data flows
- Responsive design

**To use:**

```bash
# Open in browser
open data-flow-visualization.html
```

### Option 5: Command-Line Analysis Tool

I've created a Python tool to analyze your project structure automatically:

**Run the analysis:**

```bash
# From project root
python3 tools/data-flow-analyzer.py --summary --output ./analysis-results

# View generated Mermaid diagram
cat analysis-results/data-flow.mmd
```

## Quick Access Commands

Here are the fastest ways to visualize your data flows:

### 1. Start Your Analytics Dashboard (FASTEST)

```bash
pnpm run dev-frontend
# Then visit: http://localhost:4321/dashboard/analytics
```

### 2. Start Your Monitoring Dashboards

```bash
cd backend/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
# Then visit: http://localhost:3001
```

### 3. Test Analytics Demo

```bash
pnpm run dev:backend
# Then open: analytics-demo.html in browser
```

## Available Data Flows

Based on your existing implementation, you can visualize:

### Analytics Data Flows ✅

- **Frontend → Analytics Service**: User events, page views, interactions
- **Analytics Service → External**: GA4, Mixpanel, PostHog integration
- **Analytics Service → Database**: SQLite storage for custom analytics

### Monitoring Data Flows ✅

- **Backend Services → Prometheus**: Performance metrics, error rates
- **Prometheus → Grafana**: Dashboard visualization
- **System Metrics**: CPU, memory, disk, network monitoring

### Application Data Flows ✅

- **Frontend Apps → Main API**: Chart calculations, user data
- **Main API → Firebase**: User profiles, chart storage
- **Main API → Ephemeris**: Astronomical calculations

## Real-Time Metrics Available

Your system already tracks:

- **User Analytics**: Page views, chart calculations, user actions
- **Performance Metrics**: API response times, error rates
- **System Health**: Uptime, resource usage
- **Business Metrics**: User engagement, feature adoption

## Next Steps

1. **Immediate**: Open `data-flow-visualization.html` for interactive exploration
2. **Development**: Use your analytics dashboard at `/dashboard/analytics`
3. **Operations**: Use Grafana dashboards for monitoring
4. **Analysis**: Run the CLI tool for automated project analysis
