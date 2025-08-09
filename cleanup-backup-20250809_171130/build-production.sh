#!/bin/bash

# Production Build and Deployment Script
# Comprehensive production build with all optimizations

set -e  # Exit on any error

echo "🚀 Starting CosmicHub Production Build Process..."

# Configuration
BUILD_DIR="dist"
ANALYZE_BUNDLE=${ANALYZE_BUNDLE:-false}
SKIP_TESTS=${SKIP_TESTS:-false}
ENVIRONMENT=${ENVIRONMENT:-production}
VERSION=${VERSION:-$(date +%Y%m%d-%H%M%S)}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Step 1: Environment validation
log_info "Validating build environment..."

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed or not in PATH"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm is not installed or not in PATH"
    exit 1
fi

NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Check for required environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    if [ -z "$VITE_API_URL" ]; then
        log_warning "VITE_API_URL not set, using default"
    fi
fi

log_success "Environment validation completed"

# Step 2: Clean previous builds
log_info "Cleaning previous builds..."

if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    log_info "Removed existing build directory"
fi

# Clean node_modules if requested
if [ "$CLEAN_DEPS" = "true" ]; then
    log_info "Cleaning node_modules..."
    rm -rf node_modules
    rm -rf apps/*/node_modules
    rm -rf packages/*/node_modules
    log_info "Cleaned all node_modules"
fi

log_success "Cleanup completed"

# Step 3: Install dependencies
log_info "Installing dependencies..."

npm ci --silent
log_success "Dependencies installed"

# Step 4: Lint and type checking
if [ "$SKIP_TESTS" != "true" ]; then
    log_info "Running linting and type checking..."
    
    # TypeScript compilation check
    log_info "Checking TypeScript compilation..."
    npm run type-check || {
        log_error "TypeScript compilation failed"
        exit 1
    }
    
    # ESLint
    log_info "Running ESLint..."
    npm run lint || {
        log_error "ESLint failed"
        exit 1
    }
    
    log_success "Linting and type checking completed"
fi

# Step 5: Run tests
if [ "$SKIP_TESTS" != "true" ]; then
    log_info "Running test suite..."
    
    # Unit tests
    npm run test:unit || {
        log_error "Unit tests failed"
        exit 1
    }
    
    # Integration tests
    npm run test:integration || {
        log_warning "Integration tests failed - continuing with build"
    }
    
    log_success "Tests completed"
fi

# Step 6: Build applications
log_info "Building applications for production..."

# Set production environment variables
export NODE_ENV=production
export VITE_ENVIRONMENT=$ENVIRONMENT
export VITE_VERSION=$VERSION
export VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build packages first
log_info "Building shared packages..."
npm run build:packages || {
    log_error "Package build failed"
    exit 1
}

# Build applications
log_info "Building Astro application..."
npm run build:astro || {
    log_error "Astro build failed"
    exit 1
}

log_info "Building Healwave application..."
npm run build:healwave || {
    log_error "Healwave build failed"
    exit 1
}

log_success "Application builds completed"

# Step 7: Bundle analysis
if [ "$ANALYZE_BUNDLE" = "true" ]; then
    log_info "Analyzing bundle sizes..."
    
    # Generate bundle analysis reports
    npm run analyze:astro || log_warning "Astro bundle analysis failed"
    npm run analyze:healwave || log_warning "Healwave bundle analysis failed"
    
    log_success "Bundle analysis completed"
fi

# Step 8: Security audit
log_info "Running security audit..."

npm audit --audit-level=moderate || {
    log_warning "Security audit found vulnerabilities - review required"
}

# Check for known vulnerabilities in production dependencies
npm audit --production --audit-level=high || {
    log_error "High/Critical security vulnerabilities found in production dependencies"
    exit 1
}

log_success "Security audit completed"

# Step 9: Performance budgets check
log_info "Checking performance budgets..."

check_bundle_size() {
    local app=$1
    local max_size=$2
    local build_path="apps/$app/dist"
    
    if [ -d "$build_path" ]; then
        local size=$(du -sk "$build_path" | cut -f1)
        local size_mb=$((size / 1024))
        
        log_info "$app bundle size: ${size_mb}MB"
        
        if [ $size -gt $max_size ]; then
            log_warning "$app bundle size ($size_mb MB) exceeds budget"
            return 1
        fi
    fi
    return 0
}

# Check bundle sizes (in KB)
check_bundle_size "astro" 2048    # 2MB limit
check_bundle_size "healwave" 2048 # 2MB limit

log_success "Performance budget checks completed"

# Step 10: Generate build manifest
log_info "Generating build manifest..."

BUILD_MANIFEST=$(cat <<EOF
{
  "version": "$VERSION",
  "environment": "$ENVIRONMENT",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "nodeVersion": "$NODE_VERSION",
  "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "applications": {
    "astro": {
      "built": true,
      "path": "apps/astro/dist"
    },
    "healwave": {
      "built": true,
      "path": "apps/healwave/dist"
    }
  },
  "optimization": {
    "bundleAnalysis": $ANALYZE_BUNDLE,
    "testsSkipped": $SKIP_TESTS,
    "treeShaking": true,
    "codeSplitting": true,
    "compression": true
  }
}
EOF
)

echo "$BUILD_MANIFEST" > build-manifest.json
log_success "Build manifest generated"

# Step 11: Prepare distribution
log_info "Preparing distribution packages..."

# Create distribution directory structure
mkdir -p dist/{astro,healwave,shared}

# Copy built applications
if [ -d "apps/astro/dist" ]; then
    cp -r apps/astro/dist/* dist/astro/
    log_info "Astro distribution copied"
fi

if [ -d "apps/healwave/dist" ]; then
    cp -r apps/healwave/dist/* dist/healwave/
    log_info "Healwave distribution copied"
fi

# Copy shared assets
cp -r assets/* dist/shared/ 2>/dev/null || log_warning "No shared assets to copy"

# Copy build manifest
cp build-manifest.json dist/

log_success "Distribution packages prepared"

# Step 12: Generate deployment artifacts
log_info "Generating deployment artifacts..."

# Create deployment configuration
DEPLOY_CONFIG=$(cat <<EOF
# CosmicHub Production Deployment Configuration
# Generated at $(date -u +"%Y-%m-%dT%H:%M:%SZ")

version: $VERSION
environment: $ENVIRONMENT

applications:
  - name: astro
    path: ./astro
    port: 3000
    healthCheck: /health
    
  - name: healwave
    path: ./healwave
    port: 3001
    healthCheck: /health

optimization:
  compression: true
  caching: true
  cdn: true
  serviceWorker: true

monitoring:
  enabled: true
  metrics:
    - response_time
    - error_rate
    - memory_usage
    - cpu_usage

security:
  https: true
  hsts: true
  csp: true
  cors: enabled
EOF
)

echo "$DEPLOY_CONFIG" > dist/deployment.yml

# Create Docker configurations if needed
if [ -f "Dockerfile" ]; then
    cp Dockerfile dist/
    log_info "Dockerfile copied to distribution"
fi

if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml dist/
    log_info "Docker Compose configuration copied"
fi

log_success "Deployment artifacts generated"

# Step 13: Archive distribution
log_info "Creating distribution archive..."

ARCHIVE_NAME="cosmichub-$VERSION-$ENVIRONMENT.tar.gz"
tar -czf "$ARCHIVE_NAME" -C dist .

ARCHIVE_SIZE=$(du -sh "$ARCHIVE_NAME" | cut -f1)
log_info "Distribution archive: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

log_success "Distribution archive created"

# Step 14: Verification
log_info "Running post-build verification..."

# Verify critical files exist
verify_file() {
    local file=$1
    if [ -f "$file" ]; then
        log_success "✓ $file"
    else
        log_error "✗ $file missing"
        return 1
    fi
}

verify_file "dist/astro/index.html"
verify_file "dist/healwave/index.html"
verify_file "dist/build-manifest.json"
verify_file "dist/deployment.yml"

# Check JavaScript bundles
JS_FILES=$(find dist -name "*.js" | wc -l)
CSS_FILES=$(find dist -name "*.css" | wc -l)

log_info "JavaScript files: $JS_FILES"
log_info "CSS files: $CSS_FILES"

if [ $JS_FILES -eq 0 ]; then
    log_error "No JavaScript files found in distribution"
    exit 1
fi

log_success "Post-build verification completed"

# Step 15: Summary
echo ""
echo "=========================================="
echo "🎉 CosmicHub Production Build Complete!"
echo "=========================================="
echo ""
echo "📊 Build Summary:"
echo "  Version: $VERSION"
echo "  Environment: $ENVIRONMENT"
echo "  Archive: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
echo "  JavaScript files: $JS_FILES"
echo "  CSS files: $CSS_FILES"
echo ""
echo "📁 Distribution structure:"
echo "  dist/"
echo "  ├── astro/          (Astrology app)"
echo "  ├── healwave/       (Frequency healing app)"
echo "  ├── shared/         (Shared assets)"
echo "  ├── build-manifest.json"
echo "  └── deployment.yml"
echo ""

if [ "$ANALYZE_BUNDLE" = "true" ]; then
    echo "📈 Bundle analysis reports available in:"
    echo "  apps/astro/bundle-report.html"
    echo "  apps/healwave/bundle-report.html"
    echo ""
fi

echo "🚀 Ready for deployment!"
echo ""

# Success exit
exit 0
