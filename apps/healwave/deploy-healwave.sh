#!/bin/bash

# HealWave Production Deployment Script
# Usage: ./deploy-healwave.sh [vercel|netlify|firebase]

set -e

echo "🚀 HealWave Production Deployment Starting..."

# Check if deployment target is provided
if [ -z "$1" ]; then
    echo "❌ Please specify deployment target: vercel, netlify, or firebase"
    echo "Usage: ./deploy-healwave.sh [vercel|netlify|firebase]"
    exit 1
fi

DEPLOYMENT_TARGET=$1

# Change to HealWave directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

echo "🔍 Running type check..."
npm run type-check

echo "🧹 Running linting..."
npm run lint

echo "🧪 Running tests..."
npm run test -- --run

echo "🏗️ Building for production..."
npm run build:production

echo "📊 Analyzing bundle size..."
ls -la dist/

case $DEPLOYMENT_TARGET in
    vercel)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    netlify)
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist
        ;;
    firebase)
        echo "🚀 Deploying to Firebase..."
        if ! command -v firebase &> /dev/null; then
            echo "Installing Firebase CLI..."
            npm install -g firebase-tools
        fi
        firebase deploy --only hosting
        ;;
    *)
        echo "❌ Invalid deployment target: $DEPLOYMENT_TARGET"
        echo "Available targets: vercel, netlify, firebase"
        exit 1
        ;;
esac

echo "✅ HealWave deployed successfully to $DEPLOYMENT_TARGET!"
echo "🌐 Your app should be available at your configured domain"

# Performance audit reminder
echo ""
echo "📈 Next steps:"
echo "1. Run Lighthouse audit on deployed site"
echo "2. Test PWA installation on mobile devices"
echo "3. Verify service worker functionality"
echo "4. Check analytics integration"
echo "5. Test all frequency presets"
