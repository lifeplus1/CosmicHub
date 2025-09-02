#!/bin/bash

# PWA Testing and Validation Script for CosmicHub
# Tests PWA implementation and provides feedback

echo "🔍 PWA Implementation Validation for CosmicHub"
echo "=============================================="
echo ""

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $2"
    else
        echo "❌ $2 (Missing: $1)"
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $2"
    else
        echo "❌ $2 (Missing: $1)"
    fi
}

# CosmicHub Astro App
echo "🌟 CosmicHub Astro App PWA Check:"
echo "--------------------------------"

check_file "/Users/Chris/Projects/CosmicHub/apps/astro/public/manifest.json" "PWA Manifest"
check_file "/Users/Chris/Projects/CosmicHub/apps/astro/public/sw.js" "Service Worker"
check_file "/Users/Chris/Projects/CosmicHub/apps/astro/public/offline.html" "Offline Page"
check_file "/Users/Chris/Projects/CosmicHub/apps/astro/src/pwa.ts" "PWA Registration"
check_dir "/Users/Chris/Projects/CosmicHub/apps/astro/public/icons" "Icons Directory"
check_file "/Users/Chris/Projects/CosmicHub/apps/astro/public/browserconfig.xml" "Browser Config"

echo ""

# HealWave App
echo "🎧 HealWave App PWA Check:"
echo "-------------------------"

check_file "/Users/Chris/Projects/CosmicHub/apps/healwave/public/manifest.json" "PWA Manifest"
check_file "/Users/Chris/Projects/CosmicHub/apps/healwave/public/sw.js" "Service Worker"
check_file "/Users/Chris/Projects/CosmicHub/apps/healwave/public/offline.html" "Offline Page"
check_file "/Users/Chris/Projects/CosmicHub/apps/healwave/src/pwa.ts" "PWA Registration"
check_dir "/Users/Chris/Projects/CosmicHub/apps/healwave/public/icons" "Icons Directory"
check_file "/Users/Chris/Projects/CosmicHub/apps/healwave/public/browserconfig.xml" "Browser Config"

echo ""
echo "📱 PWA Testing Instructions:"
echo "============================"
echo ""
echo "1. 🌐 Open Chrome DevTools → Application → Manifest"
echo "   - Verify manifest loads correctly"
echo "   - Check 'Add to homescreen' link"
echo ""
echo "2. 🔄 Test Service Worker:"
echo "   - DevTools → Application → Service Workers"
echo "   - Verify registration and status"
echo "   - Test 'Offline' checkbox"
echo ""
echo "3. 📊 Run Lighthouse Audit:"
echo "   - DevTools → Lighthouse → Progressive Web App"
echo "   - Target score: 90+ for PWA category"
echo ""
echo "4. 📱 Mobile Testing:"
echo "   - Open on mobile browser"
echo "   - Look for 'Add to Home Screen' prompt"
echo "   - Test offline functionality"
echo ""
echo "5. 🎯 Advanced Testing:"
echo "   - Test app shortcuts (if supported)"
echo "   - Verify theme colors in status bar"
echo "   - Check standalone mode display"
echo ""

# Check if development server is running
if lsof -i :5174 > /dev/null 2>&1; then
    echo "🚀 Development server detected on port 5174"
    echo ""
    echo "🔗 Test URLs:"
    echo "   • Astro App: http://localhost:5174"
    echo "   • Manifest: http://localhost:5174/manifest.json"
    echo "   • Service Worker: http://localhost:5174/sw.js"
    echo "   • Offline Page: http://localhost:5174/offline.html"
else
    echo "⚠️  Development server not detected. Start with: npm run dev-frontend"
fi

echo ""
echo "💡 Pro Tips:"
echo "============"
echo "• Use 'lighthouse-ci' for automated PWA testing"
echo "• Test on multiple devices and browsers"
echo "• Validate icons with PWA Asset Generator tools"
echo "• Monitor Core Web Vitals in production"
echo "• Consider push notifications for engagement"

echo ""
echo "🎉 PWA implementation check complete!"
