# CosmicHub Grafana Dashboards

## OBS-011: Performance Metrics Dashboard Implementation

This directory contains comprehensive Grafana dashboards for monitoring CosmicHub's performance,
infrastructure, and business metrics.

## 📊 Dashboard Overview

### Core Performance Dashboards

1. **CosmicHub API Performance Dashboard** (`cosmichub-api-performance.json`)
   - API request rates and throughput
   - Response time percentiles (P50, P95)
   - Error rates by endpoint
   - Active request tracking
   - Top endpoints by traffic volume
   - Slowest endpoints identification

2. **System Monitoring Dashboard** (`system/system-monitoring.json`)
   - CPU usage across cores
   - Memory utilization and availability
   - Disk usage and I/O metrics
   - Network throughput monitoring
   - Container-specific resource usage
   - Host-level system metrics

3. **Service Level Dashboard** (`cosmichub-slo-dashboard.json`)
   - SLO compliance tracking (99.5% availability)
   - Error rate monitoring (< 2% target)
   - Response time SLO (< 2s P95)
   - Service health status table
   - Uptime trend analysis
   - Database performance metrics

4. **Business Metrics Dashboard** (`business/business-metrics.json`)
   - Active users (24h window)
   - New user registrations
   - Chart generation metrics
   - Revenue tracking
   - User journey funnel analysis
   - Conversion rate optimization
   - Chart type popularity

## 🚀 Deployment

### Prerequisites

- Prometheus data collection (OBS-010)
- Grafana service running on port 3001
- Docker Compose monitoring stack

### Automatic Provisioning

Dashboards are automatically provisioned when Grafana starts:

```bash
# Start the monitoring stack
cd backend/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### Manual Import

1. Access Grafana at `http://localhost:3001`
2. Login with admin credentials
3. Navigate to Dashboards → Import
4. Upload JSON files from this directory

## 📈 Key Metrics

### API Performance Metrics

```promql
# Request rate
rate(http_requests_total{job="cosmichub-backend"}[5m])

# Response time P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="cosmichub-backend"}[5m]))

# Error rate
100 * (rate(http_requests_total{job="cosmichub-backend",code!~"2.."}[5m]) / rate(http_requests_total{job="cosmichub-backend"}[5m]))
```

### System Metrics

```promql
# CPU usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes

# Disk usage
100 - ((node_filesystem_avail_bytes{mountpoint="/"} * 100) / node_filesystem_size_bytes{mountpoint="/"})
```

### Business Metrics

```promql
# Active users
cosmichub_active_users_24h

# Chart generation rate
rate(cosmichub_charts_generated_total[1h]) * 3600

# Revenue tracking
increase(cosmichub_revenue_total[24h])
```

## 🎯 SLO Targets

| Metric               | Target  | Alert Threshold |
| -------------------- | ------- | --------------- |
| Availability         | 99.5%   | < 99.5%         |
| Error Rate           | < 2%    | > 2%            |
| Response Time P95    | < 2s    | > 2s            |
| Database Latency P95 | < 500ms | > 500ms         |

## 🔧 Dashboard Configuration

### Data Sources

- **Prometheus**: Primary metrics source
- **Alertmanager**: Alert status and history
- **Local storage**: Historical data retention

### Refresh Intervals

- Real-time dashboards: 30s
- Business metrics: 1m
- Historical analysis: 5m

### Time Ranges

- API Performance: Last 1 hour
- System Monitoring: Last 1 hour
- Business Metrics: Last 24 hours
- SLO Dashboard: Last 1 hour

## 📱 Dashboard Features

### Interactive Elements

- Time range picker
- Variable templating (planned)
- Drill-down capabilities
- Alert annotations
- Threshold visualization

### Visualization Types

- Time series graphs
- Gauge panels for SLOs
- Stat panels for KPIs
- Pie charts for distributions
- Bar charts for rankings
- Tables for service status

### Alert Integration

- Visual alert indicators
- Alert annotation overlay
- Threshold line displays
- Status color coding

## 🔍 Troubleshooting

### Common Issues

### No Data Displayed

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Verify metric collection
curl http://localhost:9090/api/v1/query?query=up
```

#### Slow Dashboard Loading

- Reduce time range
- Increase refresh interval
- Optimize query complexity
- Check Prometheus performance

#### Missing Metrics

- Verify application instrumentation
- Check Prometheus scrape config
- Confirm metric naming conventions
- Review firewall/network access

### Debug Queries

```bash
# Test Prometheus connectivity
curl -G http://localhost:9090/api/v1/query --data-urlencode 'query=up'

# Check specific metrics
curl -G http://localhost:9090/api/v1/query --data-urlencode 'query=http_requests_total'

# Validate dashboard queries
curl -G http://localhost:9090/api/v1/query_range \
  --data-urlencode 'query=rate(http_requests_total[5m])' \
  --data-urlencode 'start=2025-08-23T10:00:00Z' \
  --data-urlencode 'end=2025-08-23T11:00:00Z' \
  --data-urlencode 'step=60s'
```

## 📋 Maintenance

### Regular Tasks

- [ ] Review dashboard performance monthly
- [ ] Update SLO targets quarterly
- [ ] Optimize slow queries
- [ ] Archive old dashboards
- [ ] Update documentation

### Dashboard Updates

1. Edit JSON files in this directory
2. Restart Grafana service for provisioning
3. Or import manually via UI
4. Test all panels and queries
5. Document changes in version control

## 🔗 Related Documentation

- [OBS-010: Monitoring Infrastructure](../README.md)
- [Prometheus Configuration](../prometheus/README.md)
- [Alert Rules Documentation](../prometheus/alert-rules.yml)
- [SLO Definitions](../../docs/slo-definitions.md)

---

**Dashboard Status**: ✅ Complete  
**Implementation**: OBS-011  
**Last Updated**: August 23, 2025  
**Maintained By**: CosmicHub Infrastructure Team
