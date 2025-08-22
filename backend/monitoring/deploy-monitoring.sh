#!/bin/bash
# CosmicHub Monitoring Stack Deployment Script
# OBS-010: Prometheus alert rules setup
# This script deploys the complete monitoring infrastructure

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MONITORING_DIR="$SCRIPT_DIR"
COMPOSE_FILE="$MONITORING_DIR/docker-compose.monitoring.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
CosmicHub Monitoring Deployment Script

Usage: $0 [COMMAND] [OPTIONS]

Commands:
  deploy     Deploy the complete monitoring stack
  update     Update existing monitoring stack
  stop       Stop monitoring services
  restart    Restart monitoring services
  status     Show status of monitoring services
  validate   Validate configuration files
  clean      Remove monitoring stack and data
  logs       Show logs for monitoring services

Options:
  --env ENV          Environment (development|staging|production) [default: development]
  --backup           Create backup of existing data before deployment
  --force            Force deployment without confirmations
  --help, -h         Show this help message

Examples:
  $0 deploy --env production --backup
  $0 validate
  $0 status
  $0 logs prometheus

EOF
}

# Validate prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running or not installed"
        exit 1
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "docker-compose is not installed"
        exit 1
    fi
    
    # Check if required files exist
    local required_files=(
        "$MONITORING_DIR/prometheus/prometheus.yml"
        "$MONITORING_DIR/prometheus/alert-rules.yml"
        "$COMPOSE_FILE"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "Required file not found: $file"
            exit 1
        fi
    done
    
    log_success "Prerequisites check completed"
}

# Validate configuration files
validate_config() {
    log_info "Validating configuration files..."
    
    # Validate Prometheus configuration
    log_info "Validating Prometheus configuration..."
    docker run --rm \
        -v "$MONITORING_DIR/prometheus:/etc/prometheus:ro" \
        prom/prometheus:v2.47.0 \
        promtool check config /etc/prometheus/prometheus.yml
    
    # Validate alert rules
    log_info "Validating alert rules..."
    docker run --rm \
        -v "$MONITORING_DIR/prometheus:/etc/prometheus:ro" \
        prom/prometheus:v2.47.0 \
        promtool check rules /etc/prometheus/alert-rules.yml
    
    log_success "Configuration validation completed"
}

# Create necessary directories and set permissions
setup_directories() {
    log_info "Setting up directories..."
    
    # Create data directories
    local data_dirs=(
        "$MONITORING_DIR/data/prometheus"
        "$MONITORING_DIR/data/alertmanager"
        "$MONITORING_DIR/data/grafana"
        "$MONITORING_DIR/logs"
    )
    
    for dir in "${data_dirs[@]}"; do
        mkdir -p "$dir"
        # Set appropriate permissions
        sudo chown -R 472:472 "$dir" 2>/dev/null || true  # Grafana user
    done
    
    log_success "Directory setup completed"
}

# Deploy monitoring stack
deploy_monitoring() {
    local env="${1:-development}"
    local backup="${2:-false}"
    
    log_info "Deploying monitoring stack for environment: $env"
    
    # Create backup if requested
    if [[ "$backup" == "true" ]]; then
        create_backup
    fi
    
    # Set environment variables
    export ENVIRONMENT="$env"
    export COMPOSE_PROJECT_NAME="cosmichub-monitoring"
    
    # Deploy services
    log_info "Starting monitoring services..."
    cd "$PROJECT_ROOT"
    
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be ready..."
    wait_for_services
    
    # Verify deployment
    verify_deployment
    
    log_success "Monitoring stack deployed successfully!"
    log_info "Access points:"
    log_info "  - Prometheus: http://localhost:9090"
    log_info "  - Alertmanager: http://localhost:9093"
    log_info "  - Grafana: http://localhost:3001 (admin/admin)"
}

# Wait for services to be ready
wait_for_services() {
    local max_attempts=30
    local attempt=1
    
    local services=(
        "localhost:9090"  # Prometheus
        "localhost:9093"  # Alertmanager
        "localhost:3001"  # Grafana
    )
    
    for service in "${services[@]}"; do
        log_info "Waiting for $service to be ready..."
        
        while [[ $attempt -le $max_attempts ]]; do
            if curl -f -s "http://$service" >/dev/null 2>&1; then
                log_success "$service is ready"
                break
            fi
            
            if [[ $attempt -eq $max_attempts ]]; then
                log_warning "$service is not responding after $max_attempts attempts"
                break
            fi
            
            sleep 2
            ((attempt++))
        done
        
        attempt=1
    done
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check if services are running
    local services=("prometheus" "alertmanager" "grafana")
    
    for service in "${services[@]}"; do
        if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
            log_success "$service is running"
        else
            log_error "$service is not running"
            return 1
        fi
    done
    
    # Test Prometheus API
    if curl -f -s "http://localhost:9090/api/v1/status/config" >/dev/null; then
        log_success "Prometheus API is responding"
    else
        log_warning "Prometheus API is not responding"
    fi
    
    # Test if alerts are loaded
    local alert_count
    alert_count=$(curl -s "http://localhost:9090/api/v1/rules" | jq -r '.data.groups | length' 2>/dev/null || echo "0")
    
    if [[ "$alert_count" -gt 0 ]]; then
        log_success "Alert rules loaded successfully ($alert_count groups)"
    else
        log_warning "No alert rules found"
    fi
    
    log_success "Deployment verification completed"
}

# Create backup
create_backup() {
    local backup_dir="$MONITORING_DIR/backups/$(date +%Y%m%d_%H%M%S)"
    log_info "Creating backup in $backup_dir"
    
    mkdir -p "$backup_dir"
    
    # Backup data directories if they exist
    if [[ -d "$MONITORING_DIR/data" ]]; then
        cp -r "$MONITORING_DIR/data" "$backup_dir/"
        log_success "Data backed up to $backup_dir"
    fi
}

# Show service status
show_status() {
    log_info "Monitoring services status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log_info "Service health checks:"
    
    # Prometheus
    if curl -f -s "http://localhost:9090/-/healthy" >/dev/null 2>&1; then
        log_success "Prometheus: Healthy"
    else
        log_error "Prometheus: Unhealthy or not responding"
    fi
    
    # Alertmanager
    if curl -f -s "http://localhost:9093/-/healthy" >/dev/null 2>&1; then
        log_success "Alertmanager: Healthy"
    else
        log_error "Alertmanager: Unhealthy or not responding"
    fi
    
    # Grafana
    if curl -f -s "http://localhost:3001/api/health" >/dev/null 2>&1; then
        log_success "Grafana: Healthy"
    else
        log_error "Grafana: Unhealthy or not responding"
    fi
}

# Show logs
show_logs() {
    local service="${1:-}"
    
    if [[ -z "$service" ]]; then
        docker-compose -f "$COMPOSE_FILE" logs --tail=100 -f
    else
        docker-compose -f "$COMPOSE_FILE" logs --tail=100 -f "$service"
    fi
}

# Stop services
stop_services() {
    log_info "Stopping monitoring services..."
    docker-compose -f "$COMPOSE_FILE" down
    log_success "Services stopped"
}

# Clean up everything
clean_services() {
    log_warning "This will remove all monitoring data. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log_info "Cleaning up monitoring stack..."
        docker-compose -f "$COMPOSE_FILE" down -v
        sudo rm -rf "$MONITORING_DIR/data" 2>/dev/null || true
        log_success "Cleanup completed"
    else
        log_info "Cleanup cancelled"
    fi
}

# Main function
main() {
    local command="${1:-}"
    local env="development"
    local backup=false
    local force=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                env="$2"
                shift 2
                ;;
            --backup)
                backup=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                if [[ -z "$command" ]]; then
                    command="$1"
                fi
                shift
                ;;
        esac
    done
    
    # Execute command
    case "$command" in
        deploy)
            check_prerequisites
            setup_directories
            validate_config
            deploy_monitoring "$env" "$backup"
            ;;
        update)
            check_prerequisites
            validate_config
            log_info "Updating monitoring stack..."
            docker-compose -f "$COMPOSE_FILE" up -d
            wait_for_services
            log_success "Update completed"
            ;;
        validate)
            check_prerequisites
            validate_config
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "${2:-}"
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            deploy_monitoring "$env" "$backup"
            ;;
        clean)
            clean_services
            ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
