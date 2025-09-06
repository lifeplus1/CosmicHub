#!/bin/bash

set -e

echo "🚀 Starting HealWave Production Deployment..."

# Configuration
DEPLOY_ENV=${1:-production}
VERSION=${2:-$(date +%Y%m%d-%H%M%S)}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}
APP_NAME="healwave"

echo "📋 Deployment Configuration:"
echo "   Environment: $DEPLOY_ENV"
echo "   Version: $VERSION"
echo "   Registry: ${DOCKER_REGISTRY:-'local'}"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if required files exist
REQUIRED_FILES=(
    "deploy/Dockerfile.production"
    "deploy/nginx.conf"
    "deploy/docker-compose.production.yml"
    "deploy/production.env"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
done

# Load environment variables
if [[ -f "deploy/$DEPLOY_ENV.env" ]]; then
    echo "📦 Loading $DEPLOY_ENV environment variables..."
    set -a
    source "deploy/$DEPLOY_ENV.env"
    set +a
else
    echo "⚠️  Environment file deploy/$DEPLOY_ENV.env not found, using defaults"
fi

# Build the application
echo "🏗️  Building HealWave application..."

# Get the absolute path to the workspace root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
HEALWAVE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "📂 Workspace root: $WORKSPACE_ROOT"
echo "📂 HealWave root: $HEALWAVE_ROOT"

cd "$WORKSPACE_ROOT"

# Build packages first
echo "📦 Building workspace packages..."
pnpm run build:analytics

# Build HealWave
echo "🎵 Building HealWave app..."
cd "$HEALWAVE_ROOT"
npm run build

# Verify build output
if [[ ! -d "dist" ]] || [[ ! -f "dist/index.html" ]]; then
    echo "❌ Build failed - dist directory or index.html not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Build Docker image
echo "🐳 Building Docker image..."
IMAGE_TAG="${APP_NAME}:${VERSION}"

if [[ -n "$DOCKER_REGISTRY" ]]; then
    FULL_IMAGE_TAG="${DOCKER_REGISTRY}/${IMAGE_TAG}"
else
    FULL_IMAGE_TAG="$IMAGE_TAG"
fi

docker build -f deploy/Dockerfile.production -t "$FULL_IMAGE_TAG" "$WORKSPACE_ROOT"

if [[ $? -ne 0 ]]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker image built: $FULL_IMAGE_TAG"

# Push to registry (if configured)
if [[ -n "$DOCKER_REGISTRY" ]]; then
    echo "📤 Pushing to Docker registry..."
    docker push "$FULL_IMAGE_TAG"
    
    if [[ $? -ne 0 ]]; then
        echo "❌ Docker push failed"
        exit 1
    fi
    
    echo "✅ Image pushed to registry"
fi

# Deploy with Docker Compose
echo "🚀 Deploying application..."

# Update docker-compose with new image
export HEALWAVE_IMAGE="$FULL_IMAGE_TAG"
export HEALWAVE_VERSION="$VERSION"

# Stop existing containers
docker-compose -f deploy/docker-compose.production.yml down

# Start new containers
docker-compose -f deploy/docker-compose.production.yml up -d

# Wait for health check
echo "🏥 Waiting for application to be healthy..."
for i in {1..30}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    
    if [[ $i -eq 30 ]]; then
        echo "❌ Health check failed after 30 attempts"
        echo "📊 Checking container logs..."
        docker-compose -f deploy/docker-compose.production.yml logs healwave-app
        exit 1
    fi
    
    echo "⏳ Attempt $i/30 - waiting for health check..."
    sleep 10
done

# Post-deployment verification
echo "🔍 Running post-deployment verification..."

# Check if PWA manifest is accessible
if curl -f http://localhost/manifest.json > /dev/null 2>&1; then
    echo "✅ PWA manifest accessible"
else
    echo "⚠️  PWA manifest not accessible"
fi

# Check if service worker is accessible
if curl -f http://localhost/sw.js > /dev/null 2>&1; then
    echo "✅ Service worker accessible"
else
    echo "⚠️  Service worker not accessible"
fi

# Cleanup old images (keep last 3)
echo "🧹 Cleaning up old Docker images..."
docker images "$APP_NAME" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
    tail -n +2 | sort -k2 -r | tail -n +4 | awk '{print $1}' | \
    xargs -r docker rmi

echo ""
echo "🎉 HealWave deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   Environment: $DEPLOY_ENV"
echo "   Version: $VERSION"
echo "   Image: $FULL_IMAGE_TAG"
echo "   URL: http://localhost"
echo ""
echo "📊 Useful commands:"
echo "   View logs: docker-compose -f deploy/docker-compose.production.yml logs -f"
echo "   Stop app: docker-compose -f deploy/docker-compose.production.yml down"
echo "   Restart: docker-compose -f deploy/docker-compose.production.yml restart"
echo ""
