#!/bin/bash

# Fast Docker Build Script for CosmicHub
# Uses BuildKit for parallel builds and optimized caching

set -e

echo "🚀 Starting optimized Docker builds..."

# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build arguments for caching
BUILD_ARGS="--build-arg BUILDKIT_INLINE_CACHE=1"

# Function to build service with timing
build_service() {
    local service=$1
    echo "⏱️  Building $service..."
    start_time=$(date +%s)
    
    docker compose build $BUILD_ARGS --no-cache $service
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    echo "✅ $service built in ${duration}s"
}

# Parse command line arguments
SERVICES=()
PARALLEL=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --parallel|-p)
            PARALLEL=true
            shift
            ;;
        --force|-f)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS] [SERVICES...]"
            echo ""
            echo "Options:"
            echo "  -p, --parallel    Build services in parallel"
            echo "  -f, --force       Force rebuild (no cache)"
            echo "  -h, --help        Show this help"
            echo ""
            echo "Services: backend astro-app healwave-app (default: all)"
            exit 0
            ;;
        *)
            SERVICES+=("$1")
            shift
            ;;
    esac
done

# Default to all services if none specified
if [ ${#SERVICES[@]} -eq 0 ]; then
    SERVICES=("backend" "astro-app" "healwave-app")
fi

# Add --no-cache if force flag is set
if [ "$FORCE" = true ]; then
    BUILD_ARGS="$BUILD_ARGS --no-cache"
fi

echo "🎯 Building services: ${SERVICES[*]}"
echo "🔧 Parallel: $PARALLEL"
echo "🔄 Force rebuild: $FORCE"
echo ""

# Build services
if [ "$PARALLEL" = true ]; then
    echo "🚀 Building services in parallel..."
    pids=()
    
    for service in "${SERVICES[@]}"; do
        echo "🔨 Starting build for $service..."
        (build_service "$service") &
        pids+=($!)
    done
    
    # Wait for all builds to complete
    for pid in "${pids[@]}"; do
        wait $pid
    done
    
    echo "🎉 All parallel builds completed!"
else
    echo "🔨 Building services sequentially..."
    for service in "${SERVICES[@]}"; do
        build_service "$service"
    done
    echo "🎉 All sequential builds completed!"
fi

echo ""
echo "📊 Build Summary:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | grep cosmichub || true

echo ""
echo "🎯 To start the services, run:"
echo "   docker compose up -d"
