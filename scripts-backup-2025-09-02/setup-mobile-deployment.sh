#!/bin/bash

# MOB-001: Mobile App Store Deployment Setup Script
# This script sets up the development environment for mobile app deployment

set -e

echo "🚀 Setting up MOB-001: Mobile App Store Deployment Environment"
echo "============================================================"

# Check if we're in the right directory
if [ ! -f "apps/mobile/package.json" ]; then
    echo "❌ Error: Please run this script from the CosmicHub root directory"
    exit 1
fi

echo "📱 Current directory: $(pwd)"
echo "📋 Checking mobile app status..."

# Navigate to mobile app directory
cd apps/mobile

echo "✅ Mobile app directory found"

# Check if package.json exists and has required dependencies
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in mobile app directory"
    exit 1
fi

echo "📦 Installing/updating mobile app dependencies..."
pnpm install

echo "🔧 Installing EAS CLI globally (if not already installed)..."
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g @expo/cli eas-cli
else
    echo "✅ EAS CLI already installed"
    eas --version
fi

echo "🔍 Running TypeScript type check..."
pnpm run type-check

echo "🧪 Running mobile app linting..."
pnpm run lint

echo "📊 Checking mobile app build readiness..."

# Verify essential files exist
REQUIRED_FILES=(
    "app.json"
    "eas.json"
    "App.tsx"
    "src/services/mobileIntegrationService.ts"
    "src/services/notificationService.ts"
    "src/services/biometricAuthService.ts"
    "src/services/locationService.ts"
    "src/services/cameraService.ts"
    "src/services/widgetService.ts"
)

echo "📋 Verifying required files..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
        exit 1
    fi
done

echo "📱 Verifying app.json configuration..."
if jq -e '.expo.name' app.json > /dev/null; then
    APP_NAME=$(jq -r '.expo.name' app.json)
    echo "✅ App name: $APP_NAME"
else
    echo "❌ Error: Invalid app.json configuration"
    exit 1
fi

echo "🔧 Verifying EAS configuration..."
if jq -e '.build.production' eas.json > /dev/null; then
    echo "✅ EAS production build configuration found"
else
    echo "❌ Error: EAS production build configuration missing"
    exit 1
fi

# Check Expo login status
echo "🔐 Checking Expo authentication status..."
if eas whoami &> /dev/null; then
    EXPO_USER=$(eas whoami)
    echo "✅ Logged in to Expo as: $EXPO_USER"
else
    echo "⚠️  Not logged in to Expo. Run 'eas login' to authenticate."
    echo "   This is required for building and submitting to app stores."
fi

echo ""
echo "📊 Mobile App Deployment Readiness Report"
echo "=========================================="
echo "✅ Mobile app codebase: READY"
echo "✅ TypeScript compilation: PASSED"
echo "✅ Required files: ALL PRESENT"
echo "✅ EAS CLI: INSTALLED"
echo "✅ App configuration: VALID"
echo ""

# Display next steps
echo "🎯 Next Steps for MOB-001 Implementation:"
echo "1. 🔐 Login to Expo: eas login"
echo "2. 🍎 Set up Apple Developer Account & App Store Connect"
echo "3. 🤖 Set up Google Play Developer Account & Console"
echo "4. 🎨 Create app icons and screenshots (1024x1024 source needed)"
echo "5. 📝 Prepare app store descriptions and metadata"
echo "6. 🔐 Configure production environment variables:"
echo "   - eas secret:create --scope project --name FIREBASE_API_KEY --value 'your_key'"
echo "   - eas secret:create --scope project --name API_BASE_URL --value 'https://api.cosmichub.app'"
echo "7. 🏗️  Generate production builds: eas build --platform ios --profile production"
echo "8. 🚀 Submit to app stores: eas submit --platform ios --profile production"
echo ""
echo "📚 See MOB-001-IMPLEMENTATION.md for detailed deployment guide"
echo ""
echo "🎉 Setup complete! Ready to proceed with app store deployment."

# Return to original directory
cd ../..

exit 0
