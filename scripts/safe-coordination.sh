#!/bin/bash
# Safe coordination script that forces proper sequencing
# Consolidated version with best functionality

echo "🔄 Running coordination analysis..."

# Run coordination with output capture
node scripts/ai-agent-lint-coordinator.mjs | tee coordination-output.log

# Wait for completion and validate
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Coordination completed. Waiting 2 seconds for file writes..."
    sleep 2
    
    if [ -f "coordination-output.log" ]; then
        echo "📊 Final Results Summary:"
        echo "────────────────────────────"
        # Show dependency info and execution recommendations
        tail -15 coordination-output.log
        echo ""
        echo "📁 Full output: coordination-output.log"
        echo "📋 Analysis files: ai-agent-coordination/"
        echo "🎯 Use individual agent commands or implement AI agents for fixes"
    else
        echo "❌ Output file not found!"
        exit 1
    fi
else
    echo "❌ Coordination failed!"
    exit 1
fi
