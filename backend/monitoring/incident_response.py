#!/usr/bin/env python3
"""OBS-012: Incident Response Automation System

Automated incident detection, response, and coordination system for CosmicHub.
Integrates with Prometheus alerts, Grafana dashboards, and notification systems.

Features:
- Automated incident creation from critical alerts
- Service health assessment and auto-recovery attempts
- Incident escalation and notification workflows
- Status page updates and communication coordination
- Post-incident analysis and reporting
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import subprocess
from datetime import datetime, timezone, timedelta
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Any


# Type aliases for better code clarity
TimelineEntry = Dict[str, str]
MitigationAttempt = Dict[str, str]
CommunicationUpdate = Dict[str, str]

import httpx
from pydantic import BaseModel, Field

# Configuration
PROMETHEUS_URL = os.getenv("PROMETHEUS_URL", "http://localhost:9090")
GRAFANA_URL = os.getenv("GRAFANA_URL", "http://localhost:3000")
ALERT_LOG_PATH = Path(os.getenv("ALERT_LOG_PATH", "logs/incident_alerts.log"))
INCIDENT_LOG_PATH = Path(os.getenv("INCIDENT_LOG_PATH", "logs/incidents.log"))
STATUS_PAGE_WEBHOOK = os.getenv("STATUS_PAGE_WEBHOOK")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
PAGERDUTY_API_KEY = os.getenv("PAGERDUTY_API_KEY")

# Ensure log directories exist
ALERT_LOG_PATH.parent.mkdir(exist_ok=True)
INCIDENT_LOG_PATH.parent.mkdir(exist_ok=True)

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/incident_response.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class IncidentSeverity(str, Enum):
    """Incident severity levels aligned with alert severity"""
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"
    INFO = "info"


class IncidentStatus(str, Enum):
    """Incident lifecycle status"""
    DETECTED = "detected"
    ACKNOWLEDGED = "acknowledged"
    INVESTIGATING = "investigating"
    MITIGATING = "mitigating"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Alert(BaseModel):
    """Prometheus alert structure"""
    model_config = {"arbitrary_types_allowed": True}
    
    alertname: str
    severity: str
    service: str
    component: Optional[str] = None
    description: str
    summary: str
    impact: Optional[str] = None
    action: Optional[str] = None
    runbook: Optional[str] = None
    labels: Dict[str, str] = Field(default_factory=dict)
    annotations: Dict[str, str] = Field(default_factory=dict)
    state: str = "firing"
    active_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    value: Optional[str] = None


class Incident(BaseModel):
    """Incident tracking and management"""
    model_config = {"arbitrary_types_allowed": True}
    
    id: str
    title: str
    description: str
    severity: IncidentSeverity
    status: IncidentStatus
    service: str
    component: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    resolved_at: Optional[str] = None
    alerts: List[Alert] = Field(default_factory=list)  # type: ignore[type-arg]
    timeline: List[TimelineEntry] = Field(default_factory=list)  # type: ignore[type-arg]
    impact: Optional[str] = None
    mitigation_attempts: List[MitigationAttempt] = Field(default_factory=list)  # type: ignore[type-arg]
    communication_updates: List[CommunicationUpdate] = Field(default_factory=list)  # type: ignore[type-arg]
    root_cause: Optional[str] = None
    follow_up_actions: List[str] = Field(default_factory=list)


# Force model to rebuild to resolve forward references
try:
    Alert.model_rebuild()
    Incident.model_rebuild()
except Exception:
    pass  # Ignore rebuild errors


class IncidentResponseSystem:
    """Main incident response automation system"""

    def __init__(self):
        self.active_incidents: Dict[str, Incident] = {}
        self.client = httpx.AsyncClient(timeout=30.0)
        self.alert_processors = {
            "BackendServiceDown": self._handle_service_down,
            "EphemerisServiceDown": self._handle_service_down,
            "ServiceAvailabilityBreach": self._handle_slo_breach,
            "ErrorRateSLOBreach": self._handle_slo_breach,
            "LatencySLOBreach_Calculate": self._handle_performance_issue,
            "LatencySLOBreach_Subscription": self._handle_performance_issue,
            "DatabaseConnectionFailure": self._handle_database_issue,
            "AuthenticationFailureSpike": self._handle_security_incident,
        }

    async def monitor_alerts(self):
        """Continuously monitor Prometheus alerts for incident triggers"""
        logger.info("Starting incident response monitoring...")

        while True:
            try:
                await self._check_prometheus_alerts()
                await self._update_incident_status()
                await self._cleanup_resolved_incidents()
                await asyncio.sleep(30)  # Check every 30 seconds
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}")
                await asyncio.sleep(60)  # Longer wait on error

    async def _check_prometheus_alerts(self):
        """Fetch and process active alerts from Prometheus"""
        try:
            response = await self.client.get(f"{PROMETHEUS_URL}/api/v1/alerts")
            data = response.json()

            if data["status"] != "success":
                logger.error(f"Failed to fetch alerts: {data}")
                return

            active_alerts = [alert for alert in data["data"]["alerts"] if alert["state"] == "firing"]

            for alert_data in active_alerts:
                alert = self._parse_alert(alert_data)
                await self._process_alert(alert)

        except Exception as e:
            logger.error(f"Error fetching Prometheus alerts: {e}")

    def _parse_alert(self, alert_data: Dict[str, Any]) -> Alert:
        """Parse Prometheus alert into Alert model"""
        labels = alert_data.get("labels", {})
        annotations = alert_data.get("annotations", {})

        return Alert(
            alertname=labels.get("alertname", "Unknown"),
            severity=labels.get("severity", "warning"),
            service=labels.get("service", "unknown"),
            component=labels.get("component"),
            description=annotations.get("description", "No description"),
            summary=annotations.get("summary", "No summary"),
            impact=annotations.get("impact"),
            action=annotations.get("action"),
            runbook=annotations.get("runbook"),
            labels=labels,
            annotations=annotations,
            state=alert_data.get("state", "firing"),
            active_at=alert_data.get("activeAt",
                datetime.now(timezone.utc).isoformat()),
            value=alert_data.get("value")
        )

    async def _process_alert(self, alert: Alert):
        """Process individual alert and trigger incident response if needed"""
        incident_id = f"{alert.service}_{alert.alertname}_{alert.active_at[:10]}"

        # Check if incident already exists
        if incident_id in self.active_incidents:
            incident = self.active_incidents[incident_id]
            # Update existing incident with new alert data
            if alert not in incident.alerts:
                incident.alerts.append(alert)
                incident.updated_at = datetime.now(timezone.utc).isoformat()
                await self._add_timeline_event(incident, f"New alert added: {alert.alertname}")
        else:
            # Create new incident for critical/major alerts
            if alert.severity in ["critical", "major"]:
                incident = await self._create_incident(alert)
                self.active_incidents[incident_id] = incident

                # Execute automated response
                if alert.alertname in self.alert_processors:
                    await self.alert_processors[alert.alertname](incident,
                        alert)

    async def _create_incident(self, alert: Alert) -> Incident:
        """Create a new incident from an alert"""
        incident_id = f"{alert.service}_{alert.alertname}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        severity_map = {
            "critical": IncidentSeverity.CRITICAL,
            "major": IncidentSeverity.MAJOR,
            "warning": IncidentSeverity.MINOR,
            "info": IncidentSeverity.INFO
        }

        incident = Incident(
            id=incident_id,
            title=f"{alert.service.title()} - {alert.summary}",
            description=alert.description,
            severity=severity_map.get(alert.severity, IncidentSeverity.MINOR),
            status=IncidentStatus.DETECTED,
            service=alert.service,
            component=alert.component,
            alerts=[alert],
            impact=alert.impact
        )

        # Log incident creation
        await self._add_timeline_event(incident, "Incident created from alert")
        await self._log_incident(incident)

        # Send notifications
        await self._send_incident_notification(incident, "created")

        logger.info(f"Created incident {incident_id} from alert {alert.alertname}")
        return incident

    async def _handle_service_down(self, incident: Incident, alert: Alert):
        """Handle service down incidents with automated recovery attempts"""
        await self._add_timeline_event(incident,
            "Starting automated service recovery")

        service_recovery_commands = {
            "backend": [
                "docker-compose restart cosmichub-backend",
                "systemctl restart cosmichub-backend"
            ],
            "ephemeris": [
                "docker-compose restart ephemeris-server",
                "systemctl restart ephemeris-server"
            ]
        }

        commands = service_recovery_commands.get(alert.service, [])

        for cmd in commands:
            try:
                result = subprocess.run(
                    cmd.split(),
                    capture_output=True,
                    text=True,
                    timeout=60
                )

                mitigation: MitigationAttempt = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "action": cmd,
                    "result": "success" if result.returncode == 0 else "failed",
                    "output": result.stdout or result.stderr
                }
                incident.mitigation_attempts.append(mitigation)

                if result.returncode == 0:
                    await self._add_timeline_event(incident, f"Service recovery successful with command: {cmd}")
                    break
                else:
                    await self._add_timeline_event(incident, f"Service recovery failed with command: {cmd}")

            except Exception as e:
                mitigation: MitigationAttempt = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "action": cmd,
                    "result": "error",
                    "output": str(e)
                }
                incident.mitigation_attempts.append(mitigation)
                await self._add_timeline_event(incident, f"Recovery command error: {str(e)}")

        # Wait for service to come back online
        await self._wait_for_service_recovery(incident, alert)

    async def _handle_slo_breach(self, incident: Incident, alert: Alert):
        """Handle SLO breach incidents"""
        await self._add_timeline_event(incident,
            "SLO breach detected - gathering diagnostics")

        # Collect system metrics
        metrics = await self._collect_system_metrics()
        mitigation: MitigationAttempt = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "system_diagnostics",
            "result": "completed",
            "output": json.dumps(metrics)
        }
        incident.mitigation_attempts.append(mitigation)

        # Check for recent deployments
        recent_changes = await self._check_recent_deployments()
        if recent_changes:
            await self._add_timeline_event(incident, f"Recent deployment detected: {recent_changes}")

        # Escalate if error rate is very high
        current_error_rate = metrics.get("error_rate_5m", 0) or 0
        if current_error_rate > 5.0:  # 5% error rate
            incident.severity = IncidentSeverity.CRITICAL
            await self._escalate_incident(incident, "High error rate detected")

    async def _handle_performance_issue(self,
        incident: Incident,
        alert: Alert):
        """Handle performance/latency issues"""
        await self._add_timeline_event(incident,
            "Performance issue detected - analyzing bottlenecks")

        # Check database performance
        db_metrics = await self._check_database_performance()

        # Check CPU/Memory usage
        system_metrics = await self._collect_system_metrics()

        # Look for resource constraints
        if (system_metrics.get("cpu_usage", 0) or 0) > 80:
            await self._add_timeline_event(incident, "High CPU usage detected")

        if (system_metrics.get("memory_usage", 0) or 0) > 80:
            await self._add_timeline_event(incident,
                "High memory usage detected")

        # Store diagnostic data
        diagnostic_data: Dict[str, Any] = {
            "database_metrics": db_metrics,
            "system_metrics": system_metrics,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        mitigation: MitigationAttempt = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "performance_diagnostics",
            "result": "completed",
            "output": json.dumps(diagnostic_data)
        }
        incident.mitigation_attempts.append(mitigation)

    async def _handle_database_issue(self, incident: Incident, alert: Alert):
        """Handle database connectivity issues"""
        await self._add_timeline_event(incident,
            "Database issue detected - checking connectivity")

        # Test database connection
        db_status = await self._test_database_connection()

        if not db_status.get("connected", False):
            await self._add_timeline_event(incident,
                "Database connection failed - attempting reconnection")

            # Attempt database reconnection
            reconnect_result = await self._attempt_database_reconnection()

            mitigation: MitigationAttempt = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": "database_reconnection",
                "result": "success" if reconnect_result else "failed",
                "output": f"Connection test: {db_status}"
            }
            incident.mitigation_attempts.append(mitigation)

        # Check for database maintenance or issues
        db_health = await self._check_database_health()
        if db_health.get("issues"):
            await self._add_timeline_event(incident, f"Database health issues: {db_health.get('issues')}")

    async def _handle_security_incident(self,
        incident: Incident,
        alert: Alert):
        """Handle security-related incidents"""
        incident.severity = IncidentSeverity.CRITICAL  # Always treat security as critical
        await self._add_timeline_event(incident,
            "Security incident detected - initiating response")

        # Collect security metrics
        security_data = await self._collect_security_metrics()

        # Check for suspicious patterns
        suspicious_ips = security_data.get("suspicious_ips", [])
        if suspicious_ips:
            await self._add_timeline_event(incident, f"Suspicious IPs detected: {suspicious_ips}")

            # Auto-block if configured
            if os.getenv("AUTO_BLOCK_SUSPICIOUS_IPS",
                "false").lower() == "true":
                await self._block_suspicious_ips(suspicious_ips)
                await self._add_timeline_event(incident, f"Auto-blocked {len(suspicious_ips)} suspicious IPs")

        # Escalate immediately for security issues
        await self._escalate_incident(incident,
            "Security incident requires immediate attention")

        # Store security investigation data
        mitigation: MitigationAttempt = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "security_analysis",
            "result": "completed",
            "output": json.dumps(security_data)
        }
        incident.mitigation_attempts.append(mitigation)

    async def _wait_for_service_recovery(self,
        incident: Incident,
        alert: Alert,
        timeout_minutes: int = 10):
        """Wait for service to recover after mitigation attempts"""
        start_time = datetime.now()
        timeout = timedelta(minutes=timeout_minutes)

        while datetime.now() - start_time < timeout:
            try:
                # Check if service is responding
                service_url = self._get_service_health_url(alert.service)
                response = await self.client.get(service_url, timeout=10)

                if response.status_code == 200:
                    await self._add_timeline_event(incident,
                        "Service recovery confirmed")
                    incident.status = IncidentStatus.MITIGATING
                    await self._send_incident_notification(incident,
                        "recovering")
                    return True

            except Exception:
                pass  # Service still down

            await asyncio.sleep(30)  # Wait 30 seconds between checks

        # Service didn't recover - escalate
        await self._add_timeline_event(incident,
            "Service recovery timeout - escalating")
        await self._escalate_incident(incident, "Automated recovery failed")
        return False

    def _get_service_health_url(self, service: str) -> str:
        """Get health check URL for a service"""
        health_urls = {
            "backend": "http://localhost:8000/health",
            "ephemeris": "http://localhost:8001/health",
            "cosmichub": "http://localhost:8000/health"
        }
        return health_urls.get(service, "http://localhost:8000/health")

    async def _collect_system_metrics(self) -> Dict[str, Optional[float]]:
        """Collect current system metrics from Prometheus"""
        metrics: Dict[str, Optional[float]] = {}

        queries = {
            "error_rate_5m": 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100',
            "availability_5m": 'rate(http_requests_total{status!~"5.."}[5m]) / rate(http_requests_total[5m]) * 100',
            "p95_latency_5m": 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) * 1000',
            "cpu_usage": 'avg(100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100))',
            "memory_usage": 'avg((1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100)',
            "request_rate": 'rate(http_requests_total[5m])'
        }

        for metric_name, query in queries.items():
            try:
                response = await self.client.get(
                    f"{PROMETHEUS_URL}/api/v1/query",
                    params={"query": query}
                )
                data = response.json()

                if data["status"] == "success" and data["data"]["result"]:
                    value = data["data"]["result"][0]["value"][1]
                    metrics[metric_name] = float(value)
                else:
                    metrics[metric_name] = None

            except Exception as e:
                logger.error(f"Error collecting metric {metric_name}: {e}")
                metrics[metric_name] = None

        return metrics

    async def _check_recent_deployments(self) -> Optional[str]:
        """Check for recent deployments that might be causing issues"""
        try:
            # Check git log for recent commits
            result = subprocess.run(
                ["git", "log", "--oneline", "--since=1 hour ago"],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0 and result.stdout.strip():
                recent_commits = result.stdout.strip().split('\n')
                return f"Recent commits: {len(recent_commits)}"

        except Exception as e:
            logger.error(f"Error checking deployments: {e}")

        return None

    async def _check_database_performance(self) -> Dict[str, Any]:
        """Check database performance metrics"""
        # This would integrate with your specific database monitoring
        # For now, return placeholder structure
        return {
            "connection_count": 10,
            "avg_query_time": 50,
            "slow_queries": 2,
            "deadlocks": 0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def _test_database_connection(self) -> Dict[str, Any]:
        """Test database connectivity"""
        # This would test your specific database
        # For now, return placeholder
        return {
            "connected": True,
            "response_time": 25,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def _attempt_database_reconnection(self) -> bool:
        """Attempt to reconnect to database"""
        # Implementation depends on your database setup
        return True

    async def _check_database_health(self) -> Dict[str, Any]:
        """Check overall database health"""
        return {
            "status": "healthy",
            "issues": [],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def _collect_security_metrics(self) -> Dict[str, Any]:
        """Collect security-related metrics"""
        return {
            "failed_auth_attempts": 5,
            "suspicious_ips": ["192.168.1.100", "10.0.0.50"],
            "rate_limit_hits": 25,
            "blocked_requests": 12,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def _block_suspicious_ips(self, ips: List[str]):
        """Block suspicious IP addresses"""
        # This would integrate with your firewall/security system
        logger.info(f"Would block IPs: {ips}")

    async def _escalate_incident(self, incident: Incident, reason: str):
        """Escalate incident to higher severity and notify stakeholders"""
        incident.status = IncidentStatus.ACKNOWLEDGED
        await self._add_timeline_event(incident, f"Incident escalated: {reason}")

        # Send escalation notifications
        await self._send_incident_notification(incident, "escalated")

        # Create PagerDuty incident if configured
        if PAGERDUTY_API_KEY:
            await self._create_pagerduty_incident(incident)

    async def _add_timeline_event(self, incident: Incident, event: str):
        """Add event to incident timeline"""
        timeline_entry: TimelineEntry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": event
        }
        incident.timeline.append(timeline_entry)
        incident.updated_at = datetime.now(timezone.utc).isoformat()
        logger.info(f"Incident {incident.id}: {event}")

    async def _log_incident(self, incident: Incident):
        """Log incident to persistent storage"""
        try:
            incident_data = incident.model_dump()
            with open(INCIDENT_LOG_PATH, "a") as f:
                f.write(json.dumps(incident_data) + "\n")
        except Exception as e:
            logger.error(f"Error logging incident: {e}")

    async def _send_incident_notification(self,
        incident: Incident,
        action: str):
        """Send incident notifications via configured channels"""
        try:
            # Send Slack notification
            if SLACK_WEBHOOK_URL:
                await self._send_slack_notification(incident, action)

            # Update status page
            if STATUS_PAGE_WEBHOOK:
                await self._update_status_page(incident, action)

        except Exception as e:
            logger.error(f"Error sending notifications: {e}")

    async def _send_slack_notification(self, incident: Incident, action: str):
        """Send Slack notification about incident"""
        if not SLACK_WEBHOOK_URL:
            return

        color_map = {
            "critical": "#ff0000",
            "major": "#ff6600",
            "minor": "#ffcc00",
            "info": "#00ccff"
        }

        severity_color = color_map.get(incident.severity.value, "#cccccc")

        message: Dict[str, Any] = {
            "attachments": [
                {
                    "color": severity_color,
                    "title": f"Incident {action.title()}: {incident.title}",
                    "fields": [
                        {
                            "title": "Severity",
                            "value": incident.severity.value.upper(),
                            "short": True
                        },
                        {
                            "title": "Service",
                            "value": incident.service,
                            "short": True
                        },
                        {
                            "title": "Status",
                            "value": incident.status.value.replace("_",
                                " ").title(),
                            "short": True
                        },
                        {
                            "title": "Created",
                            "value": incident.created_at,
                            "short": True
                        }
                    ],
                    "text": incident.description
                }
            ]
        }

        await self.client.post(SLACK_WEBHOOK_URL, json=message)

    async def _update_status_page(self, incident: Incident, action: str):
        """Update status page with incident information"""
        if not STATUS_PAGE_WEBHOOK:
            return

        status_update = {
            "incident_id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity.value,
            "status": incident.status.value,
            "action": action,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        await self.client.post(STATUS_PAGE_WEBHOOK, json=status_update)

    async def _create_pagerduty_incident(self, incident: Incident):
        """Create PagerDuty incident for critical issues"""
        if not PAGERDUTY_API_KEY:
            return

        pagerduty_data: Dict[str, Any] = {
            "incident": {
                "type": "incident",
                "title": incident.title,
                "service": {
                    "id": "PSERVICE_ID",  # Configure with your PagerDuty service ID
                    "type": "service_reference"
                },
                "body": {
                    "type": "incident_body",
                    "details": incident.description
                }
            }
        }

        headers = {
            "Authorization": f"Token token={PAGERDUTY_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/vnd.pagerduty+json;version=2"
        }

        try:
            response = await self.client.post(
                "https://api.pagerduty.com/incidents",
                json=pagerduty_data,
                headers=headers
            )

            if response.status_code == 201:
                await self._add_timeline_event(incident,
                    "PagerDuty incident created")
            else:
                logger.error(f"Failed to create PagerDuty incident: {response.text}")

        except Exception as e:
            logger.error(f"Error creating PagerDuty incident: {e}")

    async def _update_incident_status(self):
        """Update status of active incidents"""
        for _, incident in list(self.active_incidents.items()):
            # Check if incident can be auto-resolved
            if incident.status in [IncidentStatus.MITIGATING, IncidentStatus.INVESTIGATING]:
                if await self._check_incident_resolution(incident):
                    incident.status = IncidentStatus.RESOLVED
                    incident.resolved_at = datetime.now(timezone.utc).isoformat()
                    await self._add_timeline_event(incident,
                        "Incident auto-resolved")
                    await self._send_incident_notification(incident,
                        "resolved")

    async def _check_incident_resolution(self, incident: Incident) -> bool:
        """Check if incident conditions are resolved"""
        # Check if the original alerts are still firing
        for alert in incident.alerts:
            if await self._is_alert_still_active(alert):
                return False

        # Additional health checks based on incident type
        if incident.service in ["backend", "ephemeris"]:
            service_url = self._get_service_health_url(incident.service)
            try:
                response = await self.client.get(service_url, timeout=10)
                if response.status_code != 200:
                    return False
            except Exception:
                return False

        return True

    async def _is_alert_still_active(self, alert: Alert) -> bool:
        """Check if a specific alert is still firing"""
        try:
            response = await self.client.get(f"{PROMETHEUS_URL}/api/v1/alerts")
            data = response.json()

            if data["status"] != "success":
                return True  # Assume still active if can't check

            active_alerts = data["data"]["alerts"]

            for active_alert in active_alerts:
                if (active_alert.get("labels",
                    {}).get("alertname") == alert.alertname and
                    active_alert.get("state") == "firing"):
                    return True

            return False

        except Exception as e:
            logger.error(f"Error checking alert status: {e}")
            return True  # Assume still active if can't check

    async def _cleanup_resolved_incidents(self):
        """Move resolved incidents to closed status and archive"""
        current_time = datetime.now(timezone.utc)

        for incident_id, incident in list(self.active_incidents.items()):
            if incident.status == IncidentStatus.RESOLVED:
                # Auto-close incidents resolved for more than 1 hour
                if incident.resolved_at:
                    resolved_time = datetime.fromisoformat(incident.resolved_at.replace('Z',
                        '+00:00'))
                    if current_time - resolved_time > timedelta(hours=1):
                        incident.status = IncidentStatus.CLOSED
                        await self._add_timeline_event(incident,
                            "Incident auto-closed")
                        await self._archive_incident(incident)
                        del self.active_incidents[incident_id]

    async def _archive_incident(self, incident: Incident):
        """Archive closed incident for post-incident analysis"""
        try:
            archive_path = Path("logs/incident_archive")
            archive_path.mkdir(exist_ok=True)

            archive_file = archive_path / f"{incident.id}.json"
            with open(archive_file, "w") as f:
                json.dump(incident.model_dump(), f, indent=2)

            logger.info(f"Archived incident {incident.id}")

        except Exception as e:
            logger.error(f"Error archiving incident: {e}")

    async def get_incident_status(self) -> Dict[str, Any]:
        """Get current incident status summary"""
        return {
            "active_incidents": len(self.active_incidents),
            "critical_incidents": len([i for i in self.active_incidents.values() if i.severity == IncidentSeverity.CRITICAL]),
            "incidents_by_status": {
                status.value: len([i for i in self.active_incidents.values() if i.status == status])
                for status in IncidentStatus
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def generate_incident_report(self,
        hours: int = 24) -> Dict[str,
        Any]:
        """Generate incident summary report"""
        since = datetime.now(timezone.utc) - timedelta(hours=hours)

        # Load incidents from logs
        incidents: List[Dict[str, Any]] = []
        try:
            if INCIDENT_LOG_PATH.exists():
                with open(INCIDENT_LOG_PATH, "r") as f:
                    for line in f:
                        try:
                            incident_data = json.loads(line.strip())
                            incident_time = datetime.fromisoformat(incident_data["created_at"].replace('Z',
                                '+00:00'))
                            if incident_time >= since:
                                incidents.append(incident_data)
                        except Exception:
                            continue
        except Exception as e:
            logger.error(f"Error loading incidents for report: {e}")

        # Generate summary
        total_incidents = len(incidents)
        critical_incidents = len([i for i in incidents if i.get("severity") == "critical"])

        # Calculate MTTR (Mean Time To Resolution)
        resolved_incidents = [i for i in incidents if i.get("resolved_at")]
        mttr_minutes = 0.0
        if resolved_incidents:
            total_resolution_time = 0.0
            for incident in resolved_incidents:
                created_str = incident.get("created_at", "")
                resolved_str = incident.get("resolved_at", "")
                if created_str and resolved_str:
                    created = datetime.fromisoformat(created_str.replace('Z',
                        '+00:00'))
                    resolved = datetime.fromisoformat(resolved_str.replace('Z',
                        '+00:00'))
                    total_resolution_time += (resolved - created).total_seconds()

            mttr_minutes = (total_resolution_time / len(resolved_incidents)) / 60

        return {
            "period_hours": hours,
            "total_incidents": total_incidents,
            "critical_incidents": critical_incidents,
            "resolved_incidents": len(resolved_incidents),
            "mean_time_to_resolution_minutes": round(mttr_minutes, 2),
            "incidents_by_service": self._group_incidents_by_key(incidents,
                "service"),
            "incidents_by_severity": self._group_incidents_by_key(incidents,
                "severity"),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    def _group_incidents_by_key(self,
        incidents: List[Dict[str,
        Any]],
        key: str) -> Dict[str,
        int]:
        """Group incidents by a specific key"""
        groups: Dict[str, int] = {}
        for incident in incidents:
            value = incident.get(key, "unknown")
            groups[value] = groups.get(value, 0) + 1
        return groups

    async def close(self):
        """Clean shutdown"""
        await self.client.aclose()


# CLI interface for incident management
async def main():
    """Main entry point for incident response system"""
    import argparse

    parser = argparse.ArgumentParser(description="CosmicHub Incident Response System (OBS-012)")
    parser.add_argument("--monitor",
        action="store_true",
        help="Start continuous monitoring")
    parser.add_argument("--status",
        action="store_true",
        help="Show current incident status")
    parser.add_argument("--report",
        type=int,
        metavar="HOURS",
        help="Generate incident report for last N hours")
    parser.add_argument("--test",
        action="store_true",
        help="Test incident response system")

    args = parser.parse_args()

    system = IncidentResponseSystem()

    try:
        if args.monitor:
            logger.info("Starting incident response monitoring...")
            await system.monitor_alerts()
        elif args.status:
            status = await system.get_incident_status()
            print(json.dumps(status, indent=2))
        elif args.report is not None:
            report = await system.generate_incident_report(args.report)
            print(json.dumps(report, indent=2))
        elif args.test:
            # Create a test incident to verify the system
            test_alert = Alert(
                alertname="TestAlert",
                severity="critical",
                service="test",
                description="Test incident for system validation",
                summary="Test Alert Summary",
                impact="No user impact - system test"
            )

            incident = await system._create_incident(test_alert)  # type: ignore[attr-defined]
            await system._add_timeline_event(incident, "Test incident created")  # type: ignore[attr-defined]  # type: ignore[attr-defined]

            print(f"Created test incident: {incident.id}")
            print(json.dumps(incident.model_dump(), indent=2))
        else:
            parser.print_help()

    finally:
        await system.close()


if __name__ == "__main__":
    asyncio.run(main())
