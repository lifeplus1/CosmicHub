#!/bin/bash

# CosmicHub Prometheus Monitoring Deployment Script
# Implementation for OBS-010: Prometheus Alert Rules Setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MONITORING_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$(dirname "$MONITORING_DIR")")"

print_header() {
    echo -e "${BLUE}🔍 CosmicHub Monitoring Setup${NC}"
    echo -e "${BLUE}==============================${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if main services are running
    if ! docker ps | grep -q cosmichub-backend; then
        print_warning "CosmicHub backend is not running. Starting monitoring stack only."
    fi
    
    print_success "Prerequisites check completed"
}

setup_environment() {
    print_info "Setting up environment..."
    
    # Create .env.monitoring if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/.env.monitoring" ]; then
        cat > "$PROJECT_ROOT/.env.monitoring" << EOF
# CosmicHub Monitoring Environment Variables
# Copy this file and update with your actual values

# Slack Integration (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# PagerDuty Integration (Optional)
PAGERDUTY_SERVICE_KEY=your-pagerduty-service-key

# Email Alerts (Optional)
SMTP_PASSWORD=your-smtp-password

# Redis Authentication (Optional)
REDIS_PASSWORD=

# Additional Monitoring Settings
PROMETHEUS_RETENTION_TIME=30d
PROMETHEUS_RETENTION_SIZE=10GB
EOF
        print_warning "Created .env.monitoring file. Please update with your actual values."
        print_info "Edit $PROJECT_ROOT/.env.monitoring with your notification settings"
    else
        print_success "Environment file exists"
    fi
}

validate_config() {
    print_info "Validating Prometheus configuration..."
    
    # Use promtool if available, otherwise just basic file checks
    if command -v promtool &> /dev/null; then
        promtool check config "$MONITORING_DIR/prometheus/prometheus.yml"
        promtool check rules "$MONITORING_DIR/prometheus/alert-rules.yml"
        print_success "Prometheus configuration is valid"
    else
        print_warning "promtool not available, skipping config validation"
        # Basic file existence check
        if [ -f "$MONITORING_DIR/prometheus/prometheus.yml" ] && [ -f "$MONITORING_DIR/prometheus/alert-rules.yml" ]; then
            print_success "Configuration files exist"
        else
            print_error "Configuration files missing"
            exit 1
        fi
    fi
}

start_monitoring_stack() {
    print_info "Starting monitoring stack..."
    
    cd "$PROJECT_ROOT"
    
    # Load environment variables
    set -a
    [ -f .env.monitoring ] && source .env.monitoring
    set +a
    
    # Start monitoring services
    docker-compose -f backend/monitoring/docker-compose.monitoring.yml up -d
    
    print_success "Monitoring stack started"
}

wait_for_services() {
    print_info "Waiting for services to be ready..."
    
    local services=(
        "http://localhost:9090/-/healthy:Prometheus"
        "http://localhost:9093/-/healthy:Alertmanager"
        "http://localhost:9121/:Redis Exporter"
        "http://localhost:9100/metrics:Node Exporter"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r url name <<< "$service"
        
        local attempts=0
        local max_attempts=30
        
        while [ $attempts -lt $max_attempts ]; do
            if curl -s "$url" > /dev/null 2>&1; then
                print_success "$name is ready"
                break
            fi
            
            attempts=$((attempts + 1))
            if [ $attempts -eq $max_attempts ]; then
                print_warning "$name is not responding after $max_attempts attempts"
            else
                sleep 2
            fi
        done
    done
}

run_health_checks() {
    print_info "Running health checks..."
    
    # Check Prometheus targets
    local targets_up
    targets_up=$(curl -s http://localhost:9090/api/v1/targets 2>/dev/null | jq -r '.data.activeTargets[] | select(.health=="up") | .scrapeUrl' 2>/dev/null | wc -l || echo "0")
    
    if [ "$targets_up" -gt 0 ]; then
        print_success "$targets_up Prometheus targets are healthy"
    else
        print_warning "No healthy Prometheus targets found"
    fi
    
    # Check alert rules
    local alert_rules
    alert_rules=$(curl -s http://localhost:9090/api/v1/rules 2>/dev/null | jq -r '.data.groups[].rules[] | select(.type=="alerting") | .name' 2>/dev/null | wc -l || echo "0")
    
    if [ "$alert_rules" -gt 0 ]; then
        print_success "$alert_rules alert rules loaded"
    else
        print_warning "No alert rules found"
    fi
}

show_access_info() {
    print_info "Monitoring stack is ready!"
    echo
    echo -e "${GREEN}📊 Access URLs:${NC}"
    echo -e "  🔍 Prometheus:     http://localhost:9090"
    echo -e "  🚨 Alertmanager:   http://localhost:9093"
    echo -e "  📊 cAdvisor:       http://localhost:8080"
    echo -e "  🖥️  Node Exporter:  http://localhost:9100/metrics"
    echo -e "  📦 Redis Exporter: http://localhost:9121"
    echo
    echo -e "${BLUE}🔧 Useful Commands:${NC}"
    echo -e "  View logs:         docker-compose -f backend/monitoring/docker-compose.monitoring.yml logs -f"
    echo -e "  Stop monitoring:   docker-compose -f backend/monitoring/docker-compose.monitoring.yml down"
    echo -e "  Restart services:  docker-compose -f backend/monitoring/docker-compose.monitoring.yml restart"
    echo
    echo -e "${YELLOW}⚠️  Configuration:${NC}"
    echo -e "  Update notification settings in: .env.monitoring"
    echo -e "  Alert rules documentation: backend/monitoring/README.md"
}

test_alerts() {
    print_info "Testing alert system..."
    
    # Test if we can reach Prometheus API
    if curl -s http://localhost:9090/api/v1/query?query=up > /dev/null; then
        print_success "Prometheus API is accessible"
    else
        print_error "Cannot reach Prometheus API"
        return 1
    fi
    
    # Show current alerts
    local active_alerts
    active_alerts=$(curl -s http://localhost:9090/api/v1/alerts 2>/dev/null | jq -r '.data.alerts[] | select(.state=="firing") | .labels.alertname' 2>/dev/null | wc -l || echo "0")
    
    if [ "$active_alerts" -gt 0 ]; then
        print_warning "$active_alerts alerts are currently firing"
        echo "Check Prometheus alerts page: http://localhost:9090/alerts"
    else
        print_success "No alerts currently firing"
    fi
}

cleanup() {
    print_info "Stopping monitoring stack..."
    cd "$PROJECT_ROOT"
    docker-compose -f backend/monitoring/docker-compose.monitoring.yml down
    print_success "Monitoring stack stopped"
}

show_help() {
    echo "CosmicHub Prometheus Monitoring Deployment Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start     Start the monitoring stack (default)"
    echo "  stop      Stop the monitoring stack"
    echo "  restart   Restart the monitoring stack"
    echo "  test      Test alert system"
    echo "  status    Show service status"
    echo "  help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0                # Start monitoring stack"
    echo "  $0 start          # Start monitoring stack"
    echo "  $0 stop           # Stop monitoring stack"
    echo "  $0 test           # Test alerts"
}

# Main execution
main() {
    print_header
    
    case "${1:-start}" in
        start)
            check_prerequisites
            setup_environment
            validate_config
            start_monitoring_stack
            wait_for_services
            run_health_checks
            show_access_info
            ;;
        stop)
            cleanup
            ;;
        restart)
            cleanup
            sleep 3
            main start
            ;;
        test)
            test_alerts
            ;;
        status)
            cd "$PROJECT_ROOT"
            docker-compose -f backend/monitoring/docker-compose.monitoring.yml ps
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Handle script interruption
trap cleanup EXIT

# Execute main function with all arguments
main "$@"
