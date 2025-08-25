# CosmicHub Monitoring Stack

Comprehensive monitoring and alerting setup for CosmicHub using Prometheus, Alertmanager, and
Grafana.

## OBS-010: Prometheus Alert Rules Setup ✅

This monitoring stack implements comprehensive alerting aligned with our SLO policy:

- **99.5% Availability** target across all services
- **<2% Error Rate** maximum threshold
- **Latency SLOs**: P95 < 2000ms for calculations, < 1000ms for subscription checks

### Quick Start

```bash
# Deploy the complete monitoring stack
./backend/monitoring/deploy-monitoring.sh deploy --env production

# Check status
./backend/monitoring/deploy-monitoring.sh status

# View logs
./backend/monitoring/deploy-monitoring.sh logs
```

### Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │────│   Alertmanager  │────│     Grafana     │
│   (Metrics)     │    │    (Alerts)     │    │  (Dashboards)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  CosmicHub API  │    │ Notification    │    │   Monitoring    │
│   (Backend)     │    │   Channels      │    │   Dashboard     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Ephemeris API   │
│  (Calculations) │
└─────────────────┘
```

## Alert Categories

### 🔴 Critical Alerts

- **Service Down**: Backend/Ephemeris service unavailable
- **SLO Breaches**: Availability < 99.5%, Error Rate > 2%, Latency exceeded
- **Database Issues**: Connection failures, query timeouts

### 🟡 Warning Alerts

- **Performance Degradation**: High latency approaching SLO limits
- **Resource Constraints**: Memory/CPU/Disk usage warnings
- **Security Issues**: Authentication failures, suspicious patterns

### 🔵 Info Alerts

- **Business Metrics**: High traffic, user registration spikes
- **Operational Info**: Deployment notifications, capacity planning

## Services & Access Points

| Service       | URL                   | Purpose                    |
| ------------- | --------------------- | -------------------------- |
| Prometheus    | <http://localhost:9090> | Metrics storage & querying |
| Alertmanager  | <http://localhost:9093> | Alert routing & management |
| Grafana       | <http://localhost:3001> | Dashboards & visualization |
| Node Exporter | <http://localhost:9100> | System metrics             |
| Blackbox      | <http://localhost:9115> | Endpoint monitoring        |

### Default Credentials

- **Grafana**: admin/admin (change on first login)

## Configuration Files

```text
backend/monitoring/
├── prometheus/
│   ├── prometheus.yml          # Main Prometheus config
│   ├── alert-rules.yml         # Comprehensive alert rules
├── alertmanager/
│   └── alertmanager.yml        # Alert routing config
├── grafana/
│   └── provisioning/           # Dashboard & datasource config
├── docker-compose.monitoring.yml
├── deploy-monitoring.sh        # Deployment automation
└── README.md                   # This file
```

## Alert Rules Overview

### SLO-Based Alerts

- **ServiceAvailabilityBreach**: < 99.5% availability
- **ErrorRateSLOBreach**: > 2% error rate
- **LatencySLOBreach**: P95 latency exceeded (2000ms calculate, 1000ms subscription)

### Service Health

- **BackendServiceDown**: API unavailable
- **EphemerisServiceDown**: Calculation service unavailable
- **DatabaseConnectionFailure**: DB connectivity issues

### Performance Warnings

- **HighResponseTimeWarning**: Latency approaching limits
- **HighErrorRateWarning**: Error rate elevated (>1% warning before 2% critical)
- **HighMemoryUsage**: >80% memory usage
- **HighCPUUsage**: >80% CPU usage

### Business & Security

- **AuthenticationFailureSpike**: Potential security issues
- **RateLimitingActive**: Traffic restrictions active
- **HighTrafficVolume**: Positive engagement indicator

## Deployment Commands

```bash
# Full deployment with backup
./deploy-monitoring.sh deploy --env production --backup

# Validate configuration
./deploy-monitoring.sh validate

# Update existing stack
./deploy-monitoring.sh update

# Monitor logs
./deploy-monitoring.sh logs prometheus

# Check service health
./deploy-monitoring.sh status

# Clean restart
./deploy-monitoring.sh restart
```

## Metrics Endpoints

Ensure your services expose metrics at these endpoints:

### Backend API (`backend:8000`)

```http
GET /metrics
```

**Required metrics:**

- `http_requests_total` - Total HTTP requests (labels: status, method, route)
- `http_request_duration_seconds` - Request duration histogram
- `auth_failures_total` - Authentication failures
- `db_connection_errors_total` - Database errors
- `rate_limit_exceeded_total` - Rate limiting events

### Ephemeris Server (`ephemeris:8001`)

```http
GET /metrics
```

**Required metrics:**

- `calculation_queue_depth` - Pending calculations
- `calculation_duration_seconds` - Processing time
- `calculation_errors_total` - Failed calculations

## Runbook Links

All alerts reference runbooks for quick resolution:

- Service Down: `https://docs.cosmichub.com/runbooks/service-down`
- Performance: `https://docs.cosmichub.com/runbooks/performance`
- Security: `https://docs.cosmichub.com/runbooks/security`
- Database: `https://docs.cosmichub.com/runbooks/database`

## SLO Alignment

This monitoring setup directly supports our Service Level Objectives:

| SLO                    | Target       | Alert Threshold   | Alert Name                    |
| ---------------------- | ------------ | ----------------- | ----------------------------- |
| Availability           | 99.5%        | < 99.5% for 2min  | ServiceAvailabilityBreach     |
| Error Rate             | < 2%         | > 2% for 1min     | ErrorRateSLOBreach            |
| Latency (Calculate)    | P95 < 2000ms | > 2000ms for 3min | LatencySLOBreach_Calculate    |
| Latency (Subscription) | P95 < 1000ms | > 1000ms for 3min | LatencySLOBreach_Subscription |

## Troubleshooting

### Common Issues

1. **Services won't start**

   ```bash
   # Check Docker status
   docker info

   # Validate configs
   ./deploy-monitoring.sh validate
   ```

2. **No metrics appearing**
   - Verify service endpoints are accessible
   - Check Prometheus targets: <http://localhost:9090/targets>
   - Review service logs

3. **Alerts not firing**
   - Validate alert rules syntax
   - Check Prometheus Rules: <http://localhost:9090/rules>
   - Verify metric names match your service output

### Monitoring the Monitoring

The monitoring stack monitors itself:

- Prometheus health: <http://localhost:9090/-/healthy>
- Alertmanager health: <http://localhost:9093/-/healthy>
- Self-monitoring alerts included in alert rules

## Next Steps

1. **Customize Alerting**: Update `alertmanager.yml` with your notification channels
2. **Add Dashboards**: Import Grafana dashboards for visual monitoring
3. **Extend Metrics**: Add business-specific metrics to your services
4. **Production Hardening**: Configure authentication, TLS, and access controls

---

**Related Tasks:**

- ✅ OBS-010: Prometheus alert rules setup
- 📋 OBS-011: Grafana dashboard creation (next)
- 📋 OBS-012: Incident response automation (future)
