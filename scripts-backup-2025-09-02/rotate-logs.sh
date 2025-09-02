#!/bin/bash

# Log Rotation Script for CosmicHub
# Manages log files to prevent disk space issues and improve performance

LOG_DIR="/Users/Chris/Projects/CosmicHub/backend/logs"
MAX_LOG_SIZE="10M"  # 10 megabytes
MAX_LOG_FILES=5
APP_NAME="cosmichub"

echo "🔄 Starting log rotation for CosmicHub..."
echo "📍 Log directory: $LOG_DIR"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to rotate a specific log file
rotate_log() {
    local log_file="$1"
    local base_name=$(basename "$log_file" .log)
    
    if [[ ! -f "$log_file" ]]; then
        echo "⚠️  Log file $log_file not found, skipping..."
        return
    fi
    
    # Check file size (cross-platform compatible)
    if [[ -f "$log_file" ]]; then
        file_size=$(wc -c < "$log_file" 2>/dev/null || echo "0")
        size_limit=$((10 * 1024 * 1024))  # 10MB in bytes
        
        if [[ $file_size -gt $size_limit ]]; then
            echo "📋 Rotating $log_file (size: ${file_size} bytes)"
            
            # Rotate existing numbered files
            for i in $(seq $((MAX_LOG_FILES - 1)) -1 1); do
                if [[ -f "${log_file}.${i}" ]]; then
                    mv "${log_file}.${i}" "${log_file}.$((i + 1))"
                fi
            done
            
            # Move current log to .1
            mv "$log_file" "${log_file}.1"
            
            # Create new empty log file
            touch "$log_file"
            chmod 644 "$log_file"
            
            echo "  ✅ Rotated $log_file"
        else
            echo "  ✅ $log_file size OK (${file_size} bytes)"
        fi
    fi
}

# Function to clean old log files
cleanup_old_logs() {
    local base_pattern="$1"
    
    # Remove files older than MAX_LOG_FILES
    for i in $(seq $((MAX_LOG_FILES + 1)) 20); do
        local old_file="${base_pattern}.${i}"
        if [[ -f "$old_file" ]]; then
            echo "🗑️  Removing old log: $old_file"
            rm "$old_file"
        fi
    done
}

# Main log rotation
cd "$LOG_DIR" || {
    echo "❌ Cannot access log directory: $LOG_DIR"
    exit 1
}

# Rotate application logs
rotate_log "app.log"
rotate_log "error.log"
rotate_log "access.log"
rotate_log "debug.log"

# Clean up old rotated files
cleanup_old_logs "app.log"
cleanup_old_logs "error.log"  
cleanup_old_logs "access.log"
cleanup_old_logs "debug.log"

# Compress old log files to save space (if gzip is available)
if command -v gzip >/dev/null 2>&1; then
    echo "🗜️  Compressing rotated logs..."
    find . -name "*.log.[1-9]" -type f ! -name "*.gz" -exec gzip {} \; 2>/dev/null
    echo "  ✅ Compression complete"
fi

# Summary
echo ""
echo "📊 Log rotation summary:"
echo "  📁 Directory: $LOG_DIR"
echo "  📋 Files processed: $(ls -1 *.log 2>/dev/null | wc -l)"
echo "  🗜️  Compressed files: $(ls -1 *.gz 2>/dev/null | wc -l)"
echo "  💾 Total disk usage: $(du -sh . 2>/dev/null | cut -f1)"

# Optional: Log rotation statistics
if [[ -f "app.log" ]]; then
    app_log_size=$(wc -c < "app.log" 2>/dev/null || echo "0")
    echo "  📏 Current app.log size: ${app_log_size} bytes"
fi

echo ""
echo "🎉 Log rotation completed successfully!"
echo ""
echo "💡 Schedule this script to run daily via crontab:"
echo "   0 2 * * * /Users/Chris/Projects/CosmicHub/scripts/rotate-logs.sh"
echo ""
echo "🔧 To monitor logs in real-time:"
echo "   tail -f $LOG_DIR/app.log"
