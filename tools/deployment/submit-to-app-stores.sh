#!/bin/bash

# MOB-001: App Store Submission Script
# This script handles submission to iOS App Store and Google Play Store

set -e

echo "🚀 Starting MOB-001 App Store Submission Process"
echo "==============================================="

# Function to display usage
usage() {
    echo "Usage: $0 [ios|android|both] [--profile production]"
    echo ""
    echo "Platforms:"
    echo "  ios      - Submit to iOS App Store"
    echo "  android  - Submit to Google Play Store"
    echo "  both     - Submit to both app stores"
    echo ""
    echo "Options:"
    echo "  --profile    - Build profile to submit (default: production)"
    echo ""
    echo "Examples:"
    echo "  $0 ios --profile production"
    echo "  $0 android --profile production"
    echo "  $0 both"
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
        --profile)
            BUILD_PROFILE="$2"
            shift 2
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

echo "📱 Submitting CosmicHub Mobile App to App Stores"
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

# Function to check for successful builds
check_builds() {
    local platform=$1
    local profile=$2
    
    echo "🔍 Checking for recent successful $platform builds..."
    
    # Get the most recent build for the platform
    local build_info=$(eas build:list --platform="$platform" --limit=1 --json 2>/dev/null)
    
    if echo "$build_info" | jq -e '.[0].status == "finished"' > /dev/null; then
        local build_id=$(echo "$build_info" | jq -r '.[0].id')
        local build_date=$(echo "$build_info" | jq -r '.[0].createdAt')
        echo "✅ Found successful $platform build: $build_id (created: $build_date)"
        return 0
    else
        echo "❌ No successful $platform build found"
        echo "   Please run: ./scripts/build-mobile-app.sh $platform --production"
        return 1
    fi
}

# Function to submit to app store
submit_to_store() {
    local platform=$1
    local profile=$2
    
    echo ""
    echo "🚀 Submitting $platform app to store ($profile profile)..."
    
    # Check for recent successful build first
    if ! check_builds "$platform" "$profile"; then
        return 1
    fi
    
    # Pre-submission checklist
    echo "📋 Pre-submission checklist for $platform:"
    
    if [ "$platform" = "ios" ]; then
        echo "🍎 iOS App Store Submission Requirements:"
        echo "   ✅ Apple Developer Account active"
        echo "   ✅ App Store Connect app created"
        echo "   ✅ App metadata completed"
        echo "   ✅ Screenshots uploaded"
        echo "   ✅ Privacy information completed"
        echo "   ✅ Pricing and availability set"
        echo ""
        
        # Prompt for confirmation
        read -p "Have you completed all iOS App Store Connect requirements? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "⚠️  Please complete App Store Connect setup before submission"
            echo "   Visit: https://appstoreconnect.apple.com"
            return 1
        fi
        
    elif [ "$platform" = "android" ]; then
        echo "🤖 Google Play Store Submission Requirements:"
        echo "   ✅ Google Play Developer Account active"
        echo "   ✅ Google Play Console app created"
        echo "   ✅ Store listing completed"
        echo "   ✅ Screenshots uploaded"
        echo "   ✅ Content rating completed"
        echo "   ✅ Pricing and distribution set"
        echo ""
        
        # Prompt for confirmation
        read -p "Have you completed all Google Play Console requirements? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "⚠️  Please complete Google Play Console setup before submission"
            echo "   Visit: https://play.google.com/console"
            return 1
        fi
    fi
    
    # Start the submission
    echo "🚀 Starting submission process..."
    
    if eas submit --platform "$platform" --profile "$profile" --non-interactive; then
        echo "✅ $platform submission completed successfully!"
        
        if [ "$platform" = "ios" ]; then
            echo ""
            echo "🍎 iOS Submission Complete!"
            echo "📋 Next Steps:"
            echo "   1. Visit App Store Connect to monitor review status"
            echo "   2. Respond to any review feedback if required"
            echo "   3. Release the app once approved"
            echo "   🔗 App Store Connect: https://appstoreconnect.apple.com"
            
        elif [ "$platform" = "android" ]; then
            echo ""
            echo "🤖 Android Submission Complete!"
            echo "📋 Next Steps:"
            echo "   1. Visit Google Play Console to monitor review status"
            echo "   2. Release to production or staged rollout"
            echo "   3. Monitor user feedback and crash reports"
            echo "   🔗 Google Play Console: https://play.google.com/console"
        fi
        
        return 0
    else
        echo "❌ $platform submission failed"
        echo "🔧 Troubleshooting:"
        echo "   1. Check submission logs for error details"
        echo "   2. Verify app store credentials are configured"
        echo "   3. Ensure recent successful build exists"
        echo "   4. Check app store account status and permissions"
        return 1
    fi
}

# Track submission results
SUBMISSION_SUCCESS=true

# Execute submissions based on platform selection
case $PLATFORM in
    ios)
        echo "🍎 Starting iOS App Store submission..."
        if ! submit_to_store "ios" "$BUILD_PROFILE"; then
            SUBMISSION_SUCCESS=false
        fi
        ;;
    android)
        echo "🤖 Starting Google Play Store submission..."
        if ! submit_to_store "android" "$BUILD_PROFILE"; then
            SUBMISSION_SUCCESS=false
        fi
        ;;
    both)
        echo "📱 Starting submissions to both app stores..."
        
        echo "🍎 Submitting to iOS App Store first..."
        if ! submit_to_store "ios" "$BUILD_PROFILE"; then
            SUBMISSION_SUCCESS=false
        fi
        
        echo ""
        echo "🤖 Submitting to Google Play Store..."
        if ! submit_to_store "android" "$BUILD_PROFILE"; then
            SUBMISSION_SUCCESS=false
        fi
        ;;
esac

# Display final results
echo ""
echo "📊 Submission Summary"
echo "===================="

if [ "$SUBMISSION_SUCCESS" = true ]; then
    echo "🎉 All submissions completed successfully!"
    echo ""
    echo "🎯 MOB-001 App Store Deployment Status: IN REVIEW"
    echo ""
    echo "📋 Post-Submission Tasks:"
    echo "1. 📊 Monitor app store review processes"
    echo "2. 📧 Respond promptly to any review feedback"
    echo "3. 📈 Prepare launch marketing materials"
    echo "4. 📊 Set up analytics and monitoring"
    echo "5. 🔔 Configure push notification campaigns"
    echo ""
    echo "⏰ Expected Review Times:"
    echo "   🍎 iOS App Store: 1-3 days"
    echo "   🤖 Google Play Store: 1-3 days"
    echo ""
    echo "🎯 Success Metrics to Track:"
    echo "   📱 Target: 10,000+ downloads in first month"
    echo "   ⭐ Target: 4.5+ app store rating"
    echo "   📊 Target: 40% engagement increase vs web"
    echo "   💰 Target: 3x higher subscription conversion"
    
else
    echo "❌ One or more submissions failed"
    echo ""
    echo "🔧 Next Steps:"
    echo "1. Review submission error logs"
    echo "2. Check app store console configurations"
    echo "3. Verify builds are successful and recent"
    echo "4. Retry submission after addressing issues"
    echo ""
    echo "📚 See MOB-001-IMPLEMENTATION.md for detailed troubleshooting"
    cd ../..
    exit 1
fi

# Return to original directory
cd ../..

echo ""
echo "✅ App store submission process completed!"
echo "🎯 MOB-001 Implementation Status: SUBMITTED TO APP STORES"
echo ""
echo "📚 Continue monitoring progress in app store consoles"
echo "📞 Contact support if review process takes longer than expected"

exit 0
