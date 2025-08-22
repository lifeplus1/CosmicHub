# CosmicHub Monitoring Stack

## OBS-010: Prometheus Alert Rules Setup

This directory contains the complete monitoring infrastructure for CosmicHub, implementing
comprehensive Prometheus-based monitoring with SLO-aligned alerting.

## 🎯 Overview

Our monitoring solution provides:

- **SLO-aligned alerting** (99.5% availability, <2% error rate)
- **Multi-layered alert severity** (Critical, Warning, Info)
- **Performance monitoring** with P95 latency tracking
- **Business metrics** for traffic and engagement insights
- **Pre-computed recording rules** for efficient dashboards

## 🚀 Quick Start

### 1. Deploy Monitoring Stack

```bash
# Make script executable
chmod +x backend/monitoring/deploy-monitoring.sh

# Start monitoring (includes health checks)
./backend/monitoring/deploy-monitoring.sh start
```

### 2. Access Monitoring Interfaces

- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **cAdvisor**: http://localhost:8080
- **Node Exporter**: http://localhost:9100/metrics

### 3. Configure Notifications (Optional)

```bash
# Edit notification settings
cp .env.monitoring.example .env.monitoring
vim .env.monitoring
```

## 📊 Architecture

### Components

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   CosmicHub     │    │  Ephemeris   │    │   Prometheus    │
│   Backend       │────│   Server     │────│   (Metrics)     │
│   :8000         │    │   :8001      │    │   :9090         │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                    │
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  Alertmanager   │    │  Node        │    │   cAdvisor      │
│  (Alerts)       │────│  Exporter    │────│  (Containers)   │
│  :9093          │    │  :9100       │    │  :8080          │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

### Data Flow

1. **Metric Collection**: Services expose `/metrics` endpoints
2. **Scraping**: Prometheus scrapes metrics every 10-30s
3. **Rule Evaluation**: Alert rules evaluated every 15s
4. **Alerting**: Critical alerts fire to Alertmanager
5. **Notification**: Alerts sent via configured channels

## ⚠️ Alert Rules Reference

### Critical Alerts (SLO Breaches)

| Alert                        | Condition             | Impact                  | Action                                |
| ---------------------------- | --------------------- | ----------------------- | ------------------------------------- |
| `ServiceAvailabilityBreach`  | Availability < 99.5%  | User-facing degradation | Check failed requests, service health |
| `ErrorRateSLOBreach`         | Error rate > 2%       | Increased user errors   | Check logs, DB connectivity           |
| `LatencySLOBreach_Calculate` | P95 latency > 2000ms  | Slow chart generation   | Check ephemeris performance           |
| `BackendServiceDown`         | Backend unreachable   | Complete API outage     | Restart service, check health         |
| `EphemerisServiceDown`       | Ephemeris unreachable | Chart calculations lost | Restart ephemeris service             |

### Warning Alerts (Early Warnings)

| Alert                     | Condition            | Impact                  | Action                          |
| ------------------------- | -------------------- | ----------------------- | ------------------------------- |
| `HighResponseTimeWarning` | P95 latency > 1500ms | Performance degradation | Monitor trends, check resources |
| `HighErrorRateWarning`    | Error rate > 1%      | Early warning           | Investigate error patterns      |

### Info Alerts (Business Metrics)

| Alert               | Condition          | Impact          | Action           |
| ------------------- | ------------------ | --------------- | ---------------- |
| `HighTrafficVolume` | Requests > 100/sec | High engagement | Monitor capacity |

## 🔧 Configuration Files

### `prometheus/prometheus.yml`

Production Prometheus configuration with:

- **Scrape targets**: Backend (10s), Ephemeris (15s), System (30s)
- **Storage**: 30-day retention, 10GB limit
- **Alerting**: Integrated with Alertmanager
- **Performance**: Optimized query limits

### `prometheus/alert-rules.yml`

Comprehensive alert rules with:

- **195 lines** of SLO-aligned rules
- **Critical/Warning/Info** severity levels
- **Recording rules** for dashboard efficiency
- **Runbook links** for operational guidance

### `docker-compose.monitoring.yml`

Complete monitoring stack:

- Prometheus, Alertmanager, Grafana
- Node Exporter, cAdvisor, Redis Exporter
- Blackbox Exporter for health checks
- Production-ready networking

## 📈 SLO Alignment

Our monitoring directly supports business objectives:

### Service Level Objectives (SLOs)

- **Availability**: 99.5% (measured over 5-minute windows)
- **Error Rate**: < 2% (5xx errors over total requests)
- **Latency**: P95 < 2000ms for /calculate endpoint

### Service Level Indicators (SLIs)

- **Request Success Rate**: `(non-5xx requests) / (total requests)`
- **Response Time**: P95 of `http_request_duration_seconds`
- **Service Uptime**: `up{job="service-name"}`

## 🚨 Runbook Integration

Each alert includes runbook links for immediate action guidance:

- **Availability**: https://docs.cosmichub.com/runbooks/availability
- **Error Rate**: https://docs.cosmichub.com/runbooks/error-rate
- **Latency**: https://docs.cosmichub.com/runbooks/latency
- **Service Down**: https://docs.cosmichub.com/runbooks/service-down

## 🛠️ Operations

### Common Commands

```bash
# View monitoring stack status
./backend/monitoring/deploy-monitoring.sh status

# Test alert system
./backend/monitoring/deploy-monitoring.sh test

# View logs
docker-compose -f backend/monitoring/docker-compose.monitoring.yml logs -f

# Stop monitoring
./backend/monitoring/deploy-monitoring.sh stop

# Restart monitoring
./backend/monitoring/deploy-monitoring.sh restart
```

### Troubleshooting

#### Prometheus Not Starting

```bash
# Check configuration syntax
promtool check config backend/monitoring/prometheus/prometheus.yml
promtool check rules backend/monitoring/prometheus/alert-rules.yml

# Check Docker logs
docker-compose -f backend/monitoring/docker-compose.monitoring.yml logs prometheus
```

#### No Metrics Visible

```bash
# Check service targets
curl http://localhost:9090/api/v1/targets

# Verify service endpoints
curl http://localhost:8000/metrics
curl http://localhost:8001/metrics
```

#### Alerts Not Firing

```bash
# Check alert rules evaluation
curl http://localhost:9090/api/v1/rules

# Test alert queries manually
curl 'http://localhost:9090/api/v1/query?query=up{job="cosmichub-backend"}'
```

## 📧 Notification Setup

### Slack Integration

```bash
# Set Slack webhook in .env.monitoring
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### PagerDuty Integration

```bash
# Set PagerDuty service key in .env.monitoring
PAGERDUTY_SERVICE_KEY=your-pagerduty-service-key
```

### Email Alerts

```bash
# Configure SMTP in .env.monitoring
SMTP_PASSWORD=your-smtp-password
```

## 🏗️ Development

### Adding New Alerts

1. Edit `prometheus/alert-rules.yml`
2. Test with `promtool check rules`
3. Reload Prometheus: `curl -X POST http://localhost:9090/-/reload`

### Custom Metrics

Add metrics to your service:

```python
# Python example
from prometheus_client import Counter, Histogram

request_count = Counter('http_requests_total', 'HTTP requests', ['method', 'status'])
request_duration = Histogram('http_request_duration_seconds', 'Request duration')
```

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Alertmanager Configuration](https://prometheus.io/docs/alerting/latest/configuration/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [CosmicHub SLO Policy](https://docs.cosmichub.com/slo-policy)

---

**Implementation Status**: ✅ Complete - OBS-010 Prometheus Alert Rules Setup  
**Last Updated**: August 22, 2025  
**Version**: 1.0.0
