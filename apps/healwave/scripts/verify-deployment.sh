#!/bin/bash

set -e

echo "🔍 HealWave Deployment Verification"
echo "=================================="

# Configuration
URL="${1:-http://localhost:4174}"
echo "📍 Testing URL: $URL"
echo ""

# Helper function for status reporting
check_status() {
    local name="$1"
    local url="$2"
    local expected_content="$3"
    
    echo -n "🔍 $name: "
    
    if response=$(curl -s -f "$url" 2>/dev/null); then
        if [[ -n "$expected_content" ]] && [[ "$response" == *"$expected_content"* ]]; then
            echo "✅ PASS"
            return 0
        elif [[ -z "$expected_content" ]]; then
            echo "✅ PASS"
            return 0
        else
            echo "⚠️  WARNING (accessible but content unexpected)"
            return 1
        fi
    else
        echo "❌ FAIL"
        return 1
    fi
}

# Core Application Tests
echo "🏠 Core Application:"
check_status "Homepage" "$URL" "HealWave"
check_status "Manifest" "$URL/manifest.json" "HealWave"
check_status "Service Worker" "$URL/sw.js" "HealWave Service Worker"

echo ""

# PWA Features Tests
echo "📱 PWA Features:"
check_status "Icons (192x192)" "$URL/icons/icon-192x192.png"
check_status "Icons (512x512)" "$URL/icons/icon-512x512.png"
check_status "Apple Touch Icon" "$URL/icons/apple-touch-icon.png"

echo ""

# Static Assets Tests
echo "🎨 Static Assets:"
check_status "Favicon" "$URL/vite.svg"
check_status "Offline Page" "$URL/offline.html" "Healing Frequencies Paused"

echo ""

# Performance Tests
echo "⚡ Performance:"
start_time=$(date +%s%N)
curl -s -f "$URL" > /dev/null 2>&1
end_time=$(date +%s%N)
load_time=$(( (end_time - start_time) / 1000000 ))

echo "🕐 Page Load Time: ${load_time}ms"

if [[ $load_time -lt 3000 ]]; then
    echo "✅ Load time acceptable (< 3s)"
else
    echo "⚠️  Load time slow (> 3s)"
fi

echo ""

# Bundle Size Analysis
echo "📦 Bundle Analysis:"
if [[ -d "dist" ]]; then
    total_size=$(du -sh dist/ | cut -f1)
    js_size=$(find dist/assets/js -name "*.js" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1 || echo "N/A")
    css_size=$(find dist/assets/css -name "*.css" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1 || echo "N/A")
    
    echo "📁 Total Size: $total_size"
    echo "🔧 JavaScript: $js_size"
    echo "🎨 CSS: $css_size"
else
    echo "⚠️  Build directory not found"
fi

echo ""

# Security Headers (if running on a server)
echo "🔒 Security (if server configured):"
if headers=$(curl -s -I "$URL" 2>/dev/null); then
    if echo "$headers" | grep -q "X-Content-Type-Options"; then
        echo "✅ Content-Type-Options header present"
    else
        echo "⚠️  Content-Type-Options header missing"
    fi
    
    if echo "$headers" | grep -q "X-Frame-Options"; then
        echo "✅ X-Frame-Options header present"
    else
        echo "⚠️  X-Frame-Options header missing"
    fi
else
    echo "ℹ️  Headers check skipped (server may not be running)"
fi

echo ""
echo "🎉 Verification Complete!"
echo ""
echo "📋 Manual Tests Still Needed:"
echo "   • PWA install prompt appears"
echo "   • Audio frequency generation works"
echo "   • Offline functionality works"
echo "   • Responsive design on mobile"
echo "   • Cross-browser compatibility"
echo ""
