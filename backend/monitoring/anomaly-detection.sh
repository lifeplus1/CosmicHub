#!/bin/bash

# OBS-012: Enhanced Anomaly Detection with Incident Response Integration
# Monitors synthetic journey logs and triggers incident response for anomalies

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_DIR="${REPO_ROOT}/logs"
ALERT_LOG="${LOG_DIR}/anomaly_alerts.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[$(date -u '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" >&2
}

log_warning() {
    echo -e "${YELLOW}[$(date -u '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" >&2
}

log_error() {
    echo -e "${RED}[$(date -u '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

log_success() {
    echo -e "${GREEN}[$(date -u '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}" >&2
}

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

run_anomaly_detection() {
    log_info "Running synthetic journey anomaly detection..."
    
    # Run synthetic journey analysis
    cd "${REPO_ROOT}"
    local analysis_output
    local exit_code
    
    if analysis_output=$(python3 scripts/observability/analyze_synthetic.py --alert-log "${ALERT_LOG}" 2>&1); then
        exit_code=0
        log_success "No anomalies detected in synthetic journey"
    else
        exit_code=$?
        log_warning "Anomaly detected in synthetic journey!"
    fi
    
    # Log the analysis results
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ): ${analysis_output}" >> "${LOG_DIR}/anomaly_analysis.log"
    
    # If anomaly detected (exit code 1), handle it
    if [ $exit_code -eq 1 ]; then
        handle_anomaly "${analysis_output}"
    fi
    
    return $exit_code
}

handle_anomaly() {
    local anomaly_data="$1"
    
    log_error "CRITICAL ANOMALY DETECTED"
    
    # Parse the JSON output to get anomaly details
    local parsed_data
    parsed_data=$(echo "${anomaly_data}" | jq -c . 2>/dev/null || echo "${anomaly_data}")
    
    # Log critical anomaly
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ): CRITICAL ANOMALY: ${parsed_data}" >> "${LOG_DIR}/critical_anomalies.log"
    
    # Send Slack notification if configured
    send_slack_notification "${parsed_data}"
    
    # Create incident via incident response system
    create_incident "${parsed_data}"
}

send_slack_notification() {
    local anomaly_data="$1"
    
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        log_info "Sending Slack notification for anomaly..."
        
        local webhook_payload
        webhook_payload=$(cat <<EOF
{
    "text": "🚨 CRITICAL: Synthetic journey anomaly detected",
    "attachments": [{
        "color": "danger",
        "title": "CosmicHub Anomaly Detection Alert",
        "text": "Synthetic journey monitoring has detected a critical anomaly that requires immediate attention.",
        "fields": [
            {
                "title": "Service",
                "value": "CosmicHub Synthetic Monitoring",
                "short": true
            },
            {
                "title": "Severity", 
                "value": "Critical",
                "short": true
            },
            {
                "title": "Timestamp",
                "value": "$(date -u '+%Y-%m-%d %H:%M:%S UTC')",
                "short": true
            }
        ],
        "footer": "CosmicHub Incident Response System",
        "ts": "$(date +%s)"
    }]
}
EOF
)
        
        if curl -X POST "${SLACK_WEBHOOK_URL}" \
                -H 'Content-Type: application/json' \
                -d "${webhook_payload}" \
                --silent --show-error > /dev/null 2>&1; then
            log_success "Slack notification sent successfully"
        else
            log_error "Failed to send Slack notification"
        fi
    else
        log_info "No Slack webhook configured, skipping notification"
    fi
}

create_incident() {
    local anomaly_data="$1"
    
    # Check if incident response system is available
    if [ -f "${REPO_ROOT}/backend/monitoring/incident_response.py" ]; then
        log_info "Creating incident via incident response system..."
        
        # Create incident using the incident response system
        local incident_result
        if incident_result=$(python3 -c "
import asyncio
import json
import sys
import os
sys.path.append('${REPO_ROOT}')

from backend.monitoring.incident_response import IncidentResponseSystem, Alert

async def create_anomaly_incident():
    system = IncidentResponseSystem()
    
    try:
        # Parse anomaly data to extract details
        anomaly_json = '''${anomaly_data}'''
        try:
            data = json.loads(anomaly_json)
            failure_rate = data.get('failure_rate', 0) * 100
            reasons = ', '.join(data.get('reasons', []))
            description = f'Synthetic journey anomaly: {failure_rate:.1f}% failure rate. Reasons: {reasons}'
        except:
            description = f'Synthetic journey anomaly detected: {anomaly_json}'
        
        alert = Alert(
            alertname='SyntheticJourneyAnomalyDetected',
            severity='critical',
            service='cosmichub',
            component='synthetic_monitoring',
            description=description,
            summary='Critical synthetic journey anomaly detected',
            impact='Potential service degradation affecting user experience',
            action='Investigate service health, check recent deployments, review system metrics'
        )
        
        incident = await system._create_incident(alert)
        await system._add_timeline_event(incident, 'Incident created from synthetic journey anomaly detection')
        
        print(f'SUCCESS: Created incident {incident.id}')
        return 0
        
    except Exception as e:
        print(f'ERROR: Failed to create incident: {e}')
        return 1
    finally:
        await system.close()

exit_code = asyncio.run(create_anomaly_incident())
sys.exit(exit_code)
        " 2>&1); then
            log_success "Incident created: ${incident_result}"
        else
            log_error "Failed to create incident: ${incident_result}"
        fi
    else
        log_warning "Incident response system not found, logging anomaly only"
    fi
    
    # Log to incident creation log regardless
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ): ANOMALY INCIDENT: ${anomaly_data}" >> "${LOG_DIR}/incident_creation.log"
}

show_status() {
    log_info "Anomaly Detection System Status"
    echo
    
    # Check if synthetic log exists
    local synth_log="${REPO_ROOT}/logs/synthetic_journey.log"
    if [ -f "${synth_log}" ]; then
        local entries
        entries=$(wc -l < "${synth_log}" 2>/dev/null || echo "0")
        log_info "Synthetic journey entries: ${entries}"
        
        # Show last entry
        if [ "${entries}" -gt 0 ]; then
            local last_entry
            last_entry=$(tail -1 "${synth_log}" | jq -r '.timestamp // "unknown"' 2>/dev/null || echo "unknown")
            log_info "Last synthetic journey: ${last_entry}"
        fi
    else
        log_warning "No synthetic journey log found"
    fi
    
    # Check anomaly log
    if [ -f "${ALERT_LOG}" ]; then
        local anomaly_count
        anomaly_count=$(wc -l < "${ALERT_LOG}" 2>/dev/null || echo "0")
        log_info "Total anomalies detected: ${anomaly_count}"
        
        if [ "${anomaly_count}" -gt 0 ]; then
            local recent_anomaly
            recent_anomaly=$(tail -1 "${ALERT_LOG}" | jq -r '.timestamp // "unknown"' 2>/dev/null || echo "unknown")
            log_info "Most recent anomaly: ${recent_anomaly}"
        fi
    else
        log_info "No anomalies detected yet"
    fi
    
    # Check incident response system
    if [ -f "${REPO_ROOT}/backend/monitoring/incident_response.py" ]; then
        log_success "Incident response system available"
    else
        log_warning "Incident response system not found"
    fi
}

cleanup_logs() {
    log_info "Cleaning up old anomaly detection logs..."
    
    # Clean up logs older than 30 days
    local cutoff_date
    if command -v gdate >/dev/null 2>&1; then
        # macOS with GNU date
        cutoff_date=$(gdate -d '30 days ago' '+%Y-%m-%d')
    elif date -d '30 days ago' '+%Y-%m-%d' >/dev/null 2>&1; then
        # Linux with GNU date
        cutoff_date=$(date -d '30 days ago' '+%Y-%m-%d')
    else
        # Fallback - keep everything
        log_warning "Cannot determine cutoff date, skipping cleanup"
        return 0
    fi
    
    local logs_to_clean=(
        "${LOG_DIR}/anomaly_analysis.log"
        "${LOG_DIR}/critical_anomalies.log"
        "${LOG_DIR}/incident_creation.log"
    )
    
    for log_file in "${logs_to_clean[@]}"; do
        if [ -f "${log_file}" ]; then
            # Create backup
            cp "${log_file}" "${log_file}.backup"
            
            # Filter recent entries (simple date filtering)
            if grep -E "^20[0-9]{2}-[0-9]{2}-[0-9]{2}" "${log_file}.backup" | \
               awk -v cutoff="${cutoff_date}" '$1 >= cutoff' > "${log_file}.tmp"; then
                mv "${log_file}.tmp" "${log_file}"
                rm -f "${log_file}.backup"
                log_success "Cleaned up ${log_file}"
            else
                # Restore backup if filtering failed
                mv "${log_file}.backup" "${log_file}"
                rm -f "${log_file}.tmp"
                log_warning "Failed to clean ${log_file}, kept original"
            fi
        fi
    done
}

show_help() {
    echo "OBS-012: Enhanced Anomaly Detection for CosmicHub"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  run           Run anomaly detection (default)"
    echo "  status        Show anomaly detection system status"  
    echo "  cleanup       Clean up old log entries"
    echo "  help          Show this help message"
    echo
    echo "Environment Variables:"
    echo "  ANOMALY_WINDOW         Rolling window size (default: 12)"
    echo "  ANOMALY_FAIL_THRESHOLD Failure rate threshold (default: 0.10)" 
    echo "  ANOMALY_P95_FACTOR     P95 latency increase factor (default: 1.5)"
    echo "  SLACK_WEBHOOK_URL      Slack webhook for notifications"
    echo
    echo "Cron Usage Examples:"
    echo "  # Run every 5 minutes"
    echo "  */5 * * * * ${SCRIPT_DIR}/anomaly-detection.sh run >> /var/log/anomaly-cron.log 2>&1"
    echo
    echo "  # Status check every hour"
    echo "  0 * * * * ${SCRIPT_DIR}/anomaly-detection.sh status"
    echo
    echo "  # Weekly cleanup on Sunday at 2 AM"  
    echo "  0 2 * * 0 ${SCRIPT_DIR}/anomaly-detection.sh cleanup"
}

main() {
    case "${1:-run}" in
        run)
            run_anomaly_detection
            ;;
        status)
            show_status
            ;;
        cleanup)
            cleanup_logs
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Handle script interruption gracefully
trap 'log_warning "Anomaly detection interrupted"; exit 1' INT TERM

main "$@"
