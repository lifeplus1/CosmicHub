#!/bin/bash

# MOB-001: Mobile App Testing Script
# Comprehensive testing script for mobile app before app store submission

set -e

echo "🧪 Starting MOB-001 Mobile App Testing Suite"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "apps/mobile/package.json" ]; then
    echo "❌ Error: Please run this script from the CosmicHub root directory"
    exit 1
fi

# Navigate to mobile app directory
cd apps/mobile

echo "📱 Testing CosmicHub Mobile App"
echo "Location: $(pwd)"
echo ""

# Initialize test results
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Function to log test results
log_test() {
    local test_name=$1
    local status=$2
    local message=$3
    
    if [ "$status" = "PASS" ]; then
        echo "✅ $test_name: PASSED"
        ((TESTS_PASSED++))
    elif [ "$status" = "FAIL" ]; then
        echo "❌ $test_name: FAILED - $message"
        ((TESTS_FAILED++))
    elif [ "$status" = "WARN" ]; then
        echo "⚠️  $test_name: WARNING - $message"
        ((WARNINGS++))
    fi
}

echo "🔧 Phase 1: Environment & Dependencies Testing"
echo "================================================"

# Test 1: Node modules
if [ -d "node_modules" ]; then
    log_test "Dependencies Installation" "PASS"
else
    echo "📦 Installing dependencies..."
    pnpm install
    if [ $? -eq 0 ]; then
        log_test "Dependencies Installation" "PASS"
    else
        log_test "Dependencies Installation" "FAIL" "pnpm install failed"
    fi
fi

# Test 2: TypeScript compilation
echo "🔍 Testing TypeScript compilation..."
if pnpm run type-check &> /dev/null; then
    log_test "TypeScript Compilation" "PASS"
else
    log_test "TypeScript Compilation" "FAIL" "Type errors found"
fi

# Test 3: ESLint
echo "🔍 Running ESLint checks..."
if pnpm run lint &> /dev/null; then
    log_test "ESLint Compliance" "PASS"
else
    log_test "ESLint Compliance" "WARN" "Linting warnings found"
fi

# Test 4: Package.json validation
echo "🔍 Validating package.json..."
if jq -e '.name' package.json > /dev/null && jq -e '.version' package.json > /dev/null; then
    APP_NAME=$(jq -r '.name' package.json)
    APP_VERSION=$(jq -r '.version' package.json)
    log_test "Package Configuration" "PASS" "Name: $APP_NAME, Version: $APP_VERSION"
else
    log_test "Package Configuration" "FAIL" "Invalid package.json"
fi

echo ""
echo "📱 Phase 2: Mobile Configuration Testing"
echo "========================================"

# Test 5: app.json validation
echo "🔍 Validating app.json configuration..."
if [ -f "app.json" ]; then
    # Check required fields
    REQUIRED_FIELDS=(".expo.name" ".expo.slug" ".expo.version" ".expo.ios.bundleIdentifier" ".expo.android.package")
    CONFIG_VALID=true
    
    for field in "${REQUIRED_FIELDS[@]}"; do
        if ! jq -e "$field" app.json > /dev/null; then
            echo "   ❌ Missing required field: $field"
            CONFIG_VALID=false
        fi
    done
    
    if [ "$CONFIG_VALID" = true ]; then
        EXPO_NAME=$(jq -r '.expo.name' app.json)
        IOS_BUNDLE=$(jq -r '.expo.ios.bundleIdentifier' app.json)
        ANDROID_PACKAGE=$(jq -r '.expo.android.package' app.json)
        log_test "App Configuration" "PASS" "Name: $EXPO_NAME"
        echo "   📱 iOS Bundle ID: $IOS_BUNDLE"
        echo "   🤖 Android Package: $ANDROID_PACKAGE"
    else
        log_test "App Configuration" "FAIL" "Missing required configuration fields"
    fi
else
    log_test "App Configuration" "FAIL" "app.json not found"
fi

# Test 6: EAS configuration
echo "🔍 Validating EAS configuration..."
if [ -f "eas.json" ]; then
    if jq -e '.build.production' eas.json > /dev/null; then
        log_test "EAS Configuration" "PASS"
    else
        log_test "EAS Configuration" "FAIL" "Production build profile not found"
    fi
else
    log_test "EAS Configuration" "FAIL" "eas.json not found"
fi

# Test 7: Required assets
echo "🔍 Checking required assets..."
REQUIRED_ASSETS=(
    "assets/icon.png"
    "assets/splash-icon.png"
    "assets/adaptive-icon.png"
    "assets/favicon.png"
)

ASSETS_FOUND=0
for asset in "${REQUIRED_ASSETS[@]}"; do
    if [ -f "$asset" ]; then
        ((ASSETS_FOUND++))
    else
        echo "   ⚠️  Missing asset: $asset"
    fi
done

if [ $ASSETS_FOUND -eq ${#REQUIRED_ASSETS[@]} ]; then
    log_test "Required Assets" "PASS" "All assets present"
elif [ $ASSETS_FOUND -gt 0 ]; then
    log_test "Required Assets" "WARN" "$ASSETS_FOUND/${#REQUIRED_ASSETS[@]} assets found"
else
    log_test "Required Assets" "FAIL" "No required assets found"
fi

echo ""
echo "🔧 Phase 3: Mobile Services Testing"
echo "==================================="

# Test 8: Mobile services files
echo "🔍 Checking mobile service implementations..."
MOBILE_SERVICES=(
    "src/services/mobileIntegrationService.ts"
    "src/services/notificationService.ts"
    "src/services/biometricAuthService.ts"
    "src/services/locationService.ts"
    "src/services/cameraService.ts"
    "src/services/widgetService.ts"
    "src/services/apiService.ts"
)

SERVICES_FOUND=0
for service in "${MOBILE_SERVICES[@]}"; do
    if [ -f "$service" ]; then
        ((SERVICES_FOUND++))
        # Check if service has basic export structure
        if grep -q "export.*class\|export.*function\|export.*const" "$service"; then
            echo "   ✅ $service"
        else
            echo "   ⚠️  $service (may be incomplete)"
        fi
    else
        echo "   ❌ $service (missing)"
    fi
done

if [ $SERVICES_FOUND -eq ${#MOBILE_SERVICES[@]} ]; then
    log_test "Mobile Services" "PASS" "All services implemented"
else
    log_test "Mobile Services" "FAIL" "Missing mobile services: $((${#MOBILE_SERVICES[@]} - $SERVICES_FOUND))"
fi

# Test 9: App.tsx structure
echo "🔍 Validating main App.tsx component..."
if [ -f "App.tsx" ]; then
    if grep -q "mobileIntegrationService" "App.tsx" && grep -q "useEffect" "App.tsx"; then
        log_test "Main App Component" "PASS"
    else
        log_test "Main App Component" "WARN" "May not be properly integrated with mobile services"
    fi
else
    log_test "Main App Component" "FAIL" "App.tsx not found"
fi

echo ""
echo "📊 Phase 4: Build Readiness Testing"
echo "===================================="

# Test 10: EAS CLI availability
echo "🔍 Checking EAS CLI installation..."
if command -v eas &> /dev/null; then
    EAS_VERSION=$(eas --version)
    log_test "EAS CLI" "PASS" "Version: $EAS_VERSION"
else
    log_test "EAS CLI" "FAIL" "EAS CLI not installed. Run: npm install -g @expo/cli eas-cli"
fi

# Test 11: Expo authentication
echo "🔍 Checking Expo authentication..."
if command -v eas &> /dev/null && eas whoami &> /dev/null; then
    EXPO_USER=$(eas whoami)
    log_test "Expo Authentication" "PASS" "Logged in as: $EXPO_USER"
else
    log_test "Expo Authentication" "WARN" "Not authenticated. Run: eas login"
fi

# Test 12: Build test (dry run)
echo "🔍 Testing build configuration (dry run)..."
if command -v eas &> /dev/null; then
    # This would be a dry run if EAS supported it
    # For now, just validate the configuration
    if jq -e '.build.production' eas.json > /dev/null; then
        log_test "Build Configuration Test" "PASS"
    else
        log_test "Build Configuration Test" "FAIL" "Invalid build configuration"
    fi
else
    log_test "Build Configuration Test" "FAIL" "EAS CLI not available"
fi

echo ""
echo "🎯 Phase 5: App Store Readiness Testing"
echo "======================================="

# Test 13: iOS requirements
echo "🔍 Checking iOS App Store requirements..."
IOS_READY=true

# Check iOS bundle identifier format
if jq -e '.expo.ios.bundleIdentifier' app.json > /dev/null; then
    BUNDLE_ID=$(jq -r '.expo.ios.bundleIdentifier' app.json)
    if [[ $BUNDLE_ID =~ ^[a-zA-Z0-9.-]+$ ]]; then
        echo "   ✅ iOS Bundle ID format valid: $BUNDLE_ID"
    else
        echo "   ❌ iOS Bundle ID format invalid: $BUNDLE_ID"
        IOS_READY=false
    fi
else
    echo "   ❌ iOS Bundle ID missing"
    IOS_READY=false
fi

# Check iOS permissions
if jq -e '.expo.ios.infoPlist' app.json > /dev/null; then
    echo "   ✅ iOS permissions configured"
else
    echo "   ⚠️  iOS permissions not explicitly configured"
fi

if [ "$IOS_READY" = true ]; then
    log_test "iOS App Store Readiness" "PASS"
else
    log_test "iOS App Store Readiness" "FAIL" "iOS configuration issues found"
fi

# Test 14: Android requirements
echo "🔍 Checking Google Play Store requirements..."
ANDROID_READY=true

# Check Android package name format
if jq -e '.expo.android.package' app.json > /dev/null; then
    PACKAGE_NAME=$(jq -r '.expo.android.package' app.json)
    if [[ $PACKAGE_NAME =~ ^[a-zA-Z0-9._]+$ ]]; then
        echo "   ✅ Android package name format valid: $PACKAGE_NAME"
    else
        echo "   ❌ Android package name format invalid: $PACKAGE_NAME"
        ANDROID_READY=false
    fi
else
    echo "   ❌ Android package name missing"
    ANDROID_READY=false
fi

# Check Android permissions
if jq -e '.expo.android.permissions' app.json > /dev/null; then
    PERMISSION_COUNT=$(jq '.expo.android.permissions | length' app.json)
    echo "   ✅ Android permissions configured ($PERMISSION_COUNT permissions)"
else
    echo "   ⚠️  Android permissions not explicitly configured"
fi

if [ "$ANDROID_READY" = true ]; then
    log_test "Android App Store Readiness" "PASS"
else
    log_test "Android App Store Readiness" "FAIL" "Android configuration issues found"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo "✅ Tests Passed: $TESTS_PASSED"
echo "❌ Tests Failed: $TESTS_FAILED"
echo "⚠️  Warnings: $WARNINGS"
echo ""

# Calculate overall readiness score
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED + WARNINGS))
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))
    echo "📈 Overall Pass Rate: $PASS_RATE%"
else
    PASS_RATE=0
fi

# Provide recommendations
echo ""
echo "🎯 MOB-001 Deployment Readiness Assessment"
echo "=========================================="

if [ $TESTS_FAILED -eq 0 ] && [ $PASS_RATE -ge 80 ]; then
    echo "🎉 READY FOR DEPLOYMENT!"
    echo ""
    echo "✅ Mobile app is ready for app store deployment"
    echo "✅ All critical tests passed"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  $WARNINGS warnings found - address before submission if possible"
    fi
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Run: ./scripts/build-mobile-app.sh both --production"
    echo "2. Test builds on physical devices"
    echo "3. Run: ./scripts/submit-to-app-stores.sh both"
    echo ""
    READY_STATUS="READY"
elif [ $TESTS_FAILED -le 2 ] && [ $PASS_RATE -ge 70 ]; then
    echo "⚠️  PARTIALLY READY - Address failures before deployment"
    echo ""
    echo "🔧 Issues to resolve:"
    echo "   - $TESTS_FAILED critical tests failed"
    if [ $WARNINGS -gt 0 ]; then
        echo "   - $WARNINGS warnings should be addressed"
    fi
    echo ""
    echo "📋 Recommended actions:"
    echo "1. Fix failing tests listed above"
    echo "2. Re-run this testing script"
    echo "3. Proceed with deployment when all tests pass"
    READY_STATUS="PARTIALLY_READY"
else
    echo "❌ NOT READY - Multiple issues need resolution"
    echo ""
    echo "🔧 Critical issues:"
    echo "   - $TESTS_FAILED tests failed (maximum 2 acceptable)"
    echo "   - Pass rate: $PASS_RATE% (minimum 70% required)"
    echo ""
    echo "📋 Required actions:"
    echo "1. Review and fix all failing tests"
    echo "2. Install missing dependencies/tools"
    echo "3. Complete app configuration setup"
    echo "4. Re-run testing script"
    READY_STATUS="NOT_READY"
fi

echo ""
echo "📚 For detailed deployment guide, see: MOB-001-IMPLEMENTATION.md"
echo "🔧 For troubleshooting help, see failing tests above"

# Return to original directory
cd ../..

# Set appropriate exit code
if [ "$READY_STATUS" = "READY" ]; then
    echo ""
    echo "✅ Mobile app testing completed successfully!"
    exit 0
elif [ "$READY_STATUS" = "PARTIALLY_READY" ]; then
    echo ""
    echo "⚠️  Mobile app testing completed with warnings"
    exit 1
else
    echo ""
    echo "❌ Mobile app testing failed - address issues before deployment"
    exit 2
fi
