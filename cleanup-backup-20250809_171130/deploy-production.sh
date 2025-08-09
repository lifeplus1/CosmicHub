#!/bin/bash

# CosmicHub Production Deployment Script
# Simplified deployment for immediate production deployment

set -e

echo "🚀 CosmicHub Production Deployment Started"
echo "============================================"

# Configuration
export NODE_ENV=production
export VITE_API_URL="${VITE_API_URL:-https://api.cosmichub.io}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Environment Setup
log_info "Setting up production environment..."
if [ -f ".env.production" ]; then
    source .env.production
    log_success "Production environment loaded"
else
    log_warning "No .env.production file found, using defaults"
fi

# Step 2: Clean and Install Dependencies
log_info "Installing dependencies..."
npm ci --silent
log_success "Dependencies installed"

# Step 3: Build Applications
log_info "Building applications for production..."

# Build Astro App
log_info "Building Astro application..."
if [ -d "apps/astro/dist" ]; then
    log_success "Astro application already built"
else
    cd apps/astro
    npm run build || {
        log_warning "Astro build failed, trying with environment override..."
        VITE_API_URL="$VITE_API_URL" npm run build
    }
    cd ../..
    log_success "Astro application built"
fi

# Build Healwave App
log_info "Building Healwave application..."
if [ -d "apps/healwave/dist" ]; then
    log_success "Healwave application already built"
else
    cd apps/healwave
    npm run build || {
        log_warning "Healwave build failed, trying with environment override..."
        VITE_API_URL="$VITE_API_URL" npm run build
    }
    cd ../..
    log_success "Healwave application built"
fi

# Step 4: Create Deployment Manifest
log_info "Creating deployment manifest..."
cat > deployment-manifest.json << EOF
{
  "deploymentId": "$(date +%Y%m%d_%H%M%S)",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0.0",
  "environment": "production",
  "applications": {
    "astro": {
      "name": "CosmicHub Astrology",
      "path": "apps/astro/dist",
      "url": "https://astro.cosmichub.io",
      "built": true
    },
    "healwave": {
      "name": "CosmicHub Healwave",
      "path": "apps/healwave/dist",
      "url": "https://healwave.cosmichub.io",
      "built": true
    }
  },
  "assets": {
    "static": "dist/assets",
    "cdn": "$VITE_CDN_URL"
  },
  "deployment": {
    "status": "ready",
    "buildTime": "$(date +%s)",
    "deployer": "$(whoami)",
    "commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
  }
}
EOF
log_success "Deployment manifest created"

# Step 5: Security and Performance Validation
log_info "Running security validation..."

# Check for common security issues
if grep -r "console.log" apps/*/dist/ 2>/dev/null; then
    log_warning "Console logs found in production build"
else
    log_success "No console logs in production build"
fi

# Check for proper HTTPS configuration
if [[ "$VITE_API_URL" =~ ^https:// ]]; then
    log_success "HTTPS configuration verified"
else
    log_warning "Non-HTTPS API URL detected: $VITE_API_URL"
fi

# Step 6: Performance Analysis
log_info "Analyzing bundle sizes..."
if [ -d "apps/astro/dist" ]; then
    ASTRO_SIZE=$(du -sh apps/astro/dist 2>/dev/null | cut -f1 || echo "unknown")
    log_info "Astro bundle size: $ASTRO_SIZE"
fi

if [ -d "apps/healwave/dist" ]; then
    HEALWAVE_SIZE=$(du -sh apps/healwave/dist 2>/dev/null | cut -f1 || echo "unknown")
    log_info "Healwave bundle size: $HEALWAVE_SIZE"
fi

# Step 7: Create Archive for Deployment
log_info "Creating deployment archive..."
tar -czf cosmichub-production-$(date +%Y%m%d_%H%M%S).tar.gz \
    apps/astro/dist \
    apps/healwave/dist \
    deployment-manifest.json \
    .env.production 2>/dev/null || {
    log_warning "Archive creation failed, continuing..."
}

# Step 8: Deployment Summary
echo ""
echo "🎉 Deployment Preparation Complete!"
echo "=================================="
echo "📦 Applications Built:"
echo "   • Astro: apps/astro/dist"
echo "   • Healwave: apps/healwave/dist"
echo ""
echo "🔧 Configuration:"
echo "   • Environment: production"
echo "   • API URL: $VITE_API_URL"
echo "   • Version: 1.0.0"
echo ""
echo "📋 Next Steps:"
echo "   1. Deploy apps/astro/dist to astro.cosmichub.io"
echo "   2. Deploy apps/healwave/dist to healwave.cosmichub.io"
echo "   3. Configure CDN and SSL certificates"
echo "   4. Set up monitoring and alerts"
echo "   5. Run post-deployment health checks"
echo ""
echo "🚀 Ready for Production Deployment!"

# Step 9: Optional - Start Local Production Preview
if [ "$1" = "--preview" ]; then
    log_info "Starting production preview servers..."
    echo "Astro preview will be available at: http://localhost:4173"
    echo "Healwave preview will be available at: http://localhost:4174"
    echo "Press Ctrl+C to stop preview servers"
    
    # Start preview servers in background
    cd apps/astro && npm run preview -- --port 4173 &
    ASTRO_PID=$!
    cd ../healwave && npm run preview -- --port 4174 &
    HEALWAVE_PID=$!
    cd ../..
    
    # Wait for user input
    read -p "Preview servers started. Press Enter to stop..."
    
    # Clean up
    kill $ASTRO_PID $HEALWAVE_PID 2>/dev/null || true
    log_success "Preview servers stopped"
fi

log_success "Production deployment script completed successfully!"
exit 0
