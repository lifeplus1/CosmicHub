#!/bin/bash

# OBS-012: Incident Response System Deployment Script
# Comprehensive incident response automation for CosmicHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
INCIDENT_RESPONSE_SCRIPT="$SCRIPT_DIR/incident_response.py"
LOG_DIR="$PROJECT_ROOT/logs"

print_header() {
    echo -e "${BLUE}🚨 CosmicHub Incident Response System (OBS-012)${NC}"
    echo -e "${BLUE}=================================================${NC}"
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
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check required Python packages
    if ! python3 -c "import httpx, pydantic" 2>/dev/null; then
        print_warning "Installing required Python packages..."
        pip3 install httpx pydantic
    fi
    
    # Check if Prometheus is accessible
    if curl -s http://localhost:9090/api/v1/status > /dev/null 2>&1; then
        print_success "Prometheus is accessible"
    else
        print_warning "Prometheus is not accessible at http://localhost:9090"
        print_info "Make sure Prometheus is running before starting incident response"
    fi
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    mkdir -p "$LOG_DIR/incident_archive"
    
    print_success "Prerequisites check completed"
}

setup_configuration() {
    print_info "Setting up configuration..."
    
    local env_file="$SCRIPT_DIR/.env.incident_response"
    
    if [ ! -f "$env_file" ]; then
        print_warning "Environment file not found, creating default configuration"
        cp "$env_file" "$env_file.example" 2>/dev/null || true
    fi
    
    # Source environment variables if file exists
    if [ -f "$env_file" ]; then
        set -o allexport
        # shellcheck source=/dev/null
        source "$env_file"
        set +o allexport
        print_success "Configuration loaded from $env_file"
    fi
}

install_systemd_service() {
    print_info "Installing systemd service..."
    
    if [ "$EUID" -ne 0 ]; then
        print_warning "Root privileges required to install systemd service"
        print_info "Run with sudo to install as system service"
        return 1
    fi
    
    local service_file="$SCRIPT_DIR/incident-response.service"
    local target="/etc/systemd/system/incident-response.service"
    
    # Update service file paths
    sed "s|/opt/cosmichub|$PROJECT_ROOT|g" "$service_file" > "$target"
    
    systemctl daemon-reload
    systemctl enable incident-response
    
    print_success "Systemd service installed and enabled"
    print_info "Start with: sudo systemctl start incident-response"
}

start_monitoring() {
    print_info "Starting incident response monitoring..."
    
    # Check if already running
    if pgrep -f "incident_response.py.*--monitor" > /dev/null; then
        print_warning "Incident response monitoring is already running"
        return 0
    fi
    
    # Start in background
    nohup python3 "$INCIDENT_RESPONSE_SCRIPT" --monitor > "$LOG_DIR/incident_response.log" 2>&1 &
    local pid=$!
    
    # Wait a moment and check if process is still running
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        echo $pid > "$LOG_DIR/incident_response.pid"
        print_success "Incident response monitoring started (PID: $pid)"
        print_info "Logs: $LOG_DIR/incident_response.log"
    else
        print_error "Failed to start incident response monitoring"
        print_info "Check logs: $LOG_DIR/incident_response.log"
        exit 1
    fi
}

stop_monitoring() {
    print_info "Stopping incident response monitoring..."
    
    local pid_file="$LOG_DIR/incident_response.pid"
    
    if [ -f "$pid_file" ]; then
        local pid
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "$pid_file"
            print_success "Incident response monitoring stopped"
        else
            print_warning "Process not running, cleaning up PID file"
            rm -f "$pid_file"
        fi
    else
        # Try to find and kill the process
        local pids
        pids=$(pgrep -f "incident_response.py.*--monitor" || true)
        if [ -n "$pids" ]; then
            # shellcheck disable=SC2086
            kill $pids
            print_success "Incident response monitoring stopped"
        else
            print_warning "No incident response monitoring process found"
        fi
    fi
}

show_status() {
    print_info "Checking incident response system status..."
    
    # Check if monitoring is running
    if pgrep -f "incident_response.py.*--monitor" > /dev/null; then
        local pid
        pid=$(pgrep -f "incident_response.py.*--monitor")
        print_success "Monitoring is running (PID: $pid)"
    else
        print_warning "Monitoring is not running"
    fi
    
    # Check Prometheus connectivity
    if curl -s http://localhost:9090/api/v1/status > /dev/null 2>&1; then
        print_success "Prometheus connection: OK"
    else
        print_error "Prometheus connection: FAILED"
    fi
    
    # Show recent incidents
    if [ -f "$LOG_DIR/incidents.log" ]; then
        local incident_count
        incident_count=$(wc -l < "$LOG_DIR/incidents.log" 2>/dev/null || echo "0")
        print_info "Total incidents logged: $incident_count"
        
        if [ "$incident_count" -gt 0 ]; then
            print_info "Recent incidents:"
            tail -3 "$LOG_DIR/incidents.log" | while read -r line; do
                local incident_id
                incident_id=$(echo "$line" | jq -r '.id' 2>/dev/null || echo "Unknown")
                local created_at
                created_at=$(echo "$line" | jq -r '.created_at' 2>/dev/null || echo "Unknown")
                local severity
                severity=$(echo "$line" | jq -r '.severity' 2>/dev/null || echo "Unknown")
                echo -e "  ${YELLOW}•${NC} $incident_id ($severity) - $created_at"
            done
        fi
    else
        print_info "No incidents logged yet"
    fi
}

run_test() {
    print_info "Running incident response system test..."
    
    python3 "$INCIDENT_RESPONSE_SCRIPT" --test
    
    print_success "Test completed - check output above for results"
}

generate_report() {
    local hours=${1:-24}
    
    print_info "Generating incident report for last $hours hours..."
    
    python3 "$INCIDENT_RESPONSE_SCRIPT" --report "$hours"
}

show_logs() {
    print_info "Showing recent incident response logs..."
    
    if [ -f "$LOG_DIR/incident_response.log" ]; then
        tail -50 "$LOG_DIR/incident_response.log"
    else
        print_warning "No log file found at $LOG_DIR/incident_response.log"
    fi
}

setup_cron() {
    print_info "Setting up cron job for incident response monitoring..."
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "incident_response.py"; then
        print_warning "Cron job already exists"
        return 0
    fi
    
    # Add cron job to restart monitoring if it dies
    (crontab -l 2>/dev/null; echo "*/5 * * * * cd $PROJECT_ROOT && $SCRIPT_DIR/deploy-incident-response.sh monitor-check >> $LOG_DIR/cron.log 2>&1") | crontab -
    
    print_success "Cron job added to check monitoring every 5 minutes"
}

monitor_check() {
    # This is called by cron to ensure monitoring is running
    if ! pgrep -f "incident_response.py.*--monitor" > /dev/null; then
        print_warning "$(date): Incident monitoring not running, restarting..." >> "$LOG_DIR/cron.log"
        start_monitoring
    fi
}

show_help() {
    echo "CosmicHub Incident Response System (OBS-012) Deployment Script"
    echo
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo
    echo "Commands:"
    echo "  start         Start incident response monitoring"
    echo "  stop          Stop incident response monitoring"
    echo "  restart       Restart incident response monitoring"
    echo "  status        Show system status and recent incidents"
    echo "  test          Run system test"
    echo "  report [hrs]  Generate incident report (default: 24 hours)"
    echo "  logs          Show recent log entries"
    echo "  install       Install systemd service (requires root)"
    echo "  setup-cron    Setup cron job for monitoring"
    echo "  monitor-check Internal command for cron monitoring"
    echo "  help          Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start                    # Start monitoring"
    echo "  $0 status                   # Check status"
    echo "  $0 report 48                # Generate 48-hour report"
    echo "  $0 test                     # Test the system"
    echo
}

main() {
    print_header
    
    case "${1:-start}" in
        start)
            check_prerequisites
            setup_configuration
            start_monitoring
            ;;
        stop)
            stop_monitoring
            ;;
        restart)
            stop_monitoring
            sleep 2
            check_prerequisites
            setup_configuration
            start_monitoring
            ;;
        status)
            show_status
            ;;
        test)
            check_prerequisites
            setup_configuration
            run_test
            ;;
        report)
            check_prerequisites
            setup_configuration
            generate_report "${2:-24}"
            ;;
        logs)
            show_logs
            ;;
        install)
            check_prerequisites
            install_systemd_service
            ;;
        setup-cron)
            setup_cron
            ;;
        monitor-check)
            monitor_check
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Trap to handle script interruption
trap 'print_warning "Script interrupted"; exit 1' INT TERM

main "$@"
