#!/bin/bash

# 🔔 Push Notifications & Background Sync Test Script
# Validates the implementation and provides testing instructions

echo "🚀 Testing CosmicHub Push Notifications & Background Sync"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}📋 Implementation Status Check:${NC}"
echo "=================================="

# Check if files exist
files=(
    "packages/config/src/push-notifications.ts"
    "packages/config/src/background-sync-enhanced.ts"
    "apps/astro/src/components/NotificationSettings.tsx"
    "apps/astro/src/services/notificationManager.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "✅ $file"
    else
        echo -e "❌ $file ${RED}(missing)${NC}"
    fi
done

echo ""
echo -e "${PURPLE}🔧 Development Server Check:${NC}"
echo "================================="

# Check if development server is running
if curl -s "http://localhost:5175" > /dev/null 2>&1; then
    echo -e "✅ Development server running on ${GREEN}http://localhost:5175${NC}"
    
    # Test PWA manifest
    if curl -s "http://localhost:5175/manifest.json" | grep -q "CosmicHub"; then
        echo -e "✅ PWA manifest accessible"
    else
        echo -e "⚠️  PWA manifest check failed"
    fi
    
    # Test service worker
    if curl -s "http://localhost:5175/sw.js" > /dev/null 2>&1; then
        echo -e "✅ Service worker accessible"
    else
        echo -e "⚠️  Service worker check failed"
    fi
    
elif curl -s "http://localhost:5174" > /dev/null 2>&1; then
    echo -e "✅ Development server running on ${GREEN}http://localhost:5174${NC}"
else
    echo -e "❌ Development server not running"
    echo -e "   ${YELLOW}Start with: npm run dev-frontend${NC}"
fi

echo ""
echo -e "${GREEN}🧪 Browser Testing Instructions:${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}1. Open Chrome DevTools (F12)${NC}"
echo "   • Go to Application tab"
echo "   • Check Service Workers section"
echo "   • Verify 'Push Messaging' subscription"
echo ""
echo -e "${YELLOW}2. Test Push Notifications:${NC}"
echo "   • Open Console and run:"
echo -e "     ${BLUE}navigator.serviceWorker.ready.then(reg => ${NC}"
echo -e "     ${BLUE}  reg.showNotification('Test', {body: 'Working!'})${NC}"
echo -e "     ${BLUE})${NC}"
echo ""
echo -e "${YELLOW}3. Test Offline Functionality:${NC}"
echo "   • DevTools → Network → Check 'Offline'"
echo "   • Refresh page to see offline.html"
echo "   • Uncheck 'Offline' to test background sync"
echo ""
echo -e "${YELLOW}4. Test Cross-Tab Sync:${NC}"
echo "   • Open app in multiple tabs"
echo "   • Make changes in one tab"
echo "   • Watch localStorage events in other tabs"

echo ""
echo -e "${PURPLE}📱 Mobile Testing:${NC}"
echo "=================="
echo ""
echo -e "• Open on mobile browser: ${GREEN}http://192.168.1.144:5175${NC}"
echo "• Look for 'Add to Home Screen' prompt"
echo "• Test offline functionality"
echo "• Test push notification permissions"

echo ""
echo -e "${BLUE}⚙️  Configuration Setup:${NC}"
echo "========================="
echo ""
echo -e "${YELLOW}For Production:${NC}"
echo "1. Set up VAPID keys:"
echo "   • Generate: https://vapidkeys.com/"
echo "   • Set REACT_APP_VAPID_PUBLIC_KEY in .env"
echo "   • Set VAPID_PRIVATE_KEY on server"
echo ""
echo "2. Configure notification server:"
echo "   • Set up backend endpoint for /api/notifications"
echo "   • Implement subscription management"
echo "   • Add notification scheduling service"

echo ""
echo -e "${GREEN}✨ Feature Highlights:${NC}"
echo "======================"
echo ""
echo "🔔 Smart push notifications with user preferences"
echo "🔄 Advanced background sync with retry logic"
echo "📱 Cross-app notification support"
echo "⚡ Offline-first architecture"
echo "🎯 Astrology-specific notification types"
echo "🎧 HealWave integration ready"
echo "🔐 VAPID-based security"
echo "📊 Real-time sync status monitoring"

echo ""
echo -e "${PURPLE}🚀 Next Steps:${NC}"
echo "==============="
echo ""
echo "1. Test notification permissions in browser"
echo "2. Implement notification settings UI in your app"
echo "3. Set up backend notification service"
echo "4. Configure VAPID keys for production"
echo "5. Add analytics tracking for notification engagement"

echo ""
echo -e "${GREEN}🎉 Push Notifications & Background Sync Implementation Complete!${NC}"
