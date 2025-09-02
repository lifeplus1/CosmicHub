#!/bin/bash

# MOB-001: Production Build Script for Mobile App Store Deployment
# This script handles production builds for iOS and Android

set -e

echo "🏗️  Starting MOB-001 Production Build Process"
echo "============================================="

# Function to display usage
usage() {
    echo "Usage: $0 [ios|android|both] [--preview|--production]"
    echo ""
    echo "Platforms:"
    echo "  ios      - Build for iOS App Store"
    echo "  android  - Build for Google Play Store"
    echo "  both     - Build for both platforms"
    echo ""
    echo "Build Types:"
    echo "  --preview     - Internal preview build for testing"
    echo "  --production  - Production build for app store submission (default)"
    echo ""
    echo "Examples:"
    echo "  $0 ios --production"
    echo "  $0 android --preview"
    echo "  $0 both --production"
    exit 1
}

# Default values
PLATFORM=""
BUILD_PROFILE="production"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        ios|android|both)
            PLATFORM="$1"
            shift
            ;;
        --preview)
            BUILD_PROFILE="preview"
            shift
            ;;
        --production)
            BUILD_PROFILE="production"
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "❌ Unknown option: $1"
            usage
            ;;
    esac
done

# Validate platform selection
if [ -z "$PLATFORM" ]; then
    echo "❌ Error: Platform must be specified (ios, android, or both)"
    usage
fi

# Check if we're in the right directory
if [ ! -f "apps/mobile/package.json" ]; then
    echo "❌ Error: Please run this script from the CosmicHub root directory"
    exit 1
fi

# Navigate to mobile app directory
cd apps/mobile

echo "📱 Building CosmicHub Mobile App"
echo "Platform: $PLATFORM"
echo "Build Profile: $BUILD_PROFILE"
echo ""

# Verify EAS CLI is installed and user is authenticated
if ! command -v eas &> /dev/null; then
    echo "❌ Error: EAS CLI not found. Please run setup-mobile-deployment.sh first"
    exit 1
fi

echo "🔐 Checking Expo authentication..."
if ! eas whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Expo. Please run: eas login"
    exit 1
else
    EXPO_USER=$(eas whoami)
    echo "✅ Authenticated as: $EXPO_USER"
fi

# Verify app configuration
echo "📋 Verifying app configuration..."
if [ ! -f "app.json" ] || [ ! -f "eas.json" ]; then
    echo "❌ Error: Missing required configuration files (app.json, eas.json)"
    exit 1
fi

# Run pre-build checks
echo "🔍 Running pre-build checks..."
echo "📦 Installing dependencies..."
pnpm install

echo "✅ Running TypeScript type check..."
pnpm run type-check

echo "✅ Running linting check..."
pnpm run lint || echo "⚠️  Linting warnings found - continuing with build"

# Function to build for specific platform
build_platform() {
    local platform=$1
    local profile=$2
    
    echo ""
    echo "🏗️  Building for $platform ($profile profile)..."
    
    # Start the build
    if eas build --platform "$platform" --profile "$profile" --non-interactive; then
        echo "✅ $platform build completed successfully!"
        
        # Get build information
        echo "📊 Getting build information..."
        eas build:list --platform="$platform" --limit=1 --json | jq -r '.[0] | "Build ID: \(.id)\nStatus: \(.status)\nPlatform: \(.platform)\nProfile: \(.profile)\nCreated: \(.createdAt)"'
        
        return 0
    else
        echo "❌ $platform build failed"
        return 1
    fi
}

# Track build results
BUILD_SUCCESS=true

# Execute builds based on platform selection
case $PLATFORM in
    ios)
        echo "🍎 Starting iOS build..."
        if ! build_platform "ios" "$BUILD_PROFILE"; then
            BUILD_SUCCESS=false
        fi
        ;;
    android)
        echo "🤖 Starting Android build..."
        if ! build_platform "android" "$BUILD_PROFILE"; then
            BUILD_SUCCESS=false
        fi
        ;;
    both)
        echo "📱 Starting builds for both platforms..."
        
        echo "🍎 Building iOS first..."
        if ! build_platform "ios" "$BUILD_PROFILE"; then
            BUILD_SUCCESS=false
        fi
        
        echo ""
        echo "🤖 Building Android..."
        if ! build_platform "android" "$BUILD_PROFILE"; then
            BUILD_SUCCESS=false
        fi
        ;;
esac

# Display final results
echo ""
echo "📊 Build Summary"
echo "================"

if [ "$BUILD_SUCCESS" = true ]; then
    echo "🎉 All builds completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. 📱 Download builds from: https://expo.dev/builds"
    echo "2. 🧪 Test builds on physical devices"
    echo "3. 🚀 Submit to app stores using: ./scripts/submit-to-app-stores.sh"
    echo ""
    echo "📝 Build artifacts:"
    echo "   iOS: .ipa file (ready for App Store submission)"
    echo "   Android: .apk/.aab file (ready for Google Play submission)"
    echo ""
    echo "🔗 Monitor build status: eas build:list"
else
    echo "❌ One or more builds failed"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Check build logs: eas build:list"
    echo "2. Verify configuration files (app.json, eas.json)"
    echo "3. Check environment variables: eas secret:list"
    echo "4. Ensure all dependencies are properly installed"
    echo ""
    echo "📚 See MOB-001-IMPLEMENTATION.md for detailed troubleshooting guide"
    cd ../..
    exit 1
fi

# Return to original directory
cd ../..

echo "✅ Production build process completed!"
echo "📚 See MOB-001-IMPLEMENTATION.md for submission guidelines"

exit 0
