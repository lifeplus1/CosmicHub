#!/bin/bash

# Helper script for AI agents to verify analysis file freshness
# Usage: ./scripts/verify-analysis-files.sh [agent-id]

COORD_DIR="/Users/Chris/Projects/CosmicHub/ai-agent-coordination"

if [ ! -d "$COORD_DIR" ]; then
    echo "❌ Coordination directory not found: $COORD_DIR"
    exit 1
fi

# If agent ID provided, check specific file
if [ -n "$1" ]; then
    ANALYSIS_FILE="$COORD_DIR/$1-analysis.json"
    
    if [ ! -f "$ANALYSIS_FILE" ]; then
        echo "❌ Analysis file not found: $1-analysis.json"
        echo "Available files:"
        ls -1 "$COORD_DIR"/*.json 2>/dev/null | xargs -I {} basename {}
        exit 1
    fi
    
    # Check file freshness (less than 30 minutes old)
    if [ "$(find "$ANALYSIS_FILE" -mmin -30)" ]; then
        echo "✅ Analysis file is fresh: $1-analysis.json"
        
        # Show key metadata
        TIMESTAMP=$(cat "$ANALYSIS_FILE" | grep '"timestamp"' | cut -d'"' -f4)
        RUN_ID=$(cat "$ANALYSIS_FILE" | grep '"runId"' | cut -d'"' -f4)
        FILE_TYPE=$(cat "$ANALYSIS_FILE" | grep '"fileType"' | cut -d'"' -f4)
        
        echo "📅 Timestamp: $TIMESTAMP"
        echo "🔄 Run ID: $RUN_ID"
        echo "📄 File Type: $FILE_TYPE"
        
        # Show error/warning counts
        ERROR_COUNT=$(cat "$ANALYSIS_FILE" | grep '"errorCount"' | cut -d':' -f2 | tr -d ', ')
        WARNING_COUNT=$(cat "$ANALYSIS_FILE" | grep '"warningCount"' | cut -d':' -f2 | tr -d ', ')
        
        echo "🚫 Errors: $ERROR_COUNT"
        echo "⚠️  Warnings: $WARNING_COUNT"
        
    else
        echo "⚠️  Analysis file is stale (>30 minutes old): $1-analysis.json"
        echo "Run: npm run lint:ai-coord"
        exit 2
    fi
    
else
    # Check all analysis files
    echo "🔍 Checking all analysis files freshness..."
    
    FRESH_COUNT=0
    STALE_COUNT=0
    TOTAL_COUNT=0
    
    for file in "$COORD_DIR"/agent-*-analysis.json; do
        if [ -f "$file" ]; then
            TOTAL_COUNT=$((TOTAL_COUNT + 1))
            BASENAME=$(basename "$file")
            
            if [ "$(find "$file" -mmin -30)" ]; then
                echo "✅ $BASENAME (fresh)"
                FRESH_COUNT=$((FRESH_COUNT + 1))
            else
                echo "⚠️  $BASENAME (stale - >30 minutes old)"
                STALE_COUNT=$((STALE_COUNT + 1))
            fi
        fi
    done
    
    echo ""
    echo "📊 Summary: $FRESH_COUNT fresh, $STALE_COUNT stale, $TOTAL_COUNT total"
    
    if [ $STALE_COUNT -gt 0 ]; then
        echo "🔄 Run 'npm run lint:ai-coord' to refresh analysis files"
        exit 2
    else
        echo "✅ All analysis files are fresh and ready"
    fi
fi
