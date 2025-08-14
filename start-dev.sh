#!/bin/bash

# CosmicHub Development Startup Script
# This script starts all services needed for development

set -e

echo "🚀 Starting CosmicHub Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start backend services with Docker Compose
echo "📦 Starting backend services (Redis, Ephemeris Server, Backend API)..."
docker-compose up -d redis ephemeris-server backend

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
echo "🔍 Checking service health..."
for i in {1..10}; do
    if curl -s http://localhost:8000/health > /dev/null && curl -s http://localhost:8001/health > /dev/null; then
        echo "✅ Backend services are healthy!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Services failed to start properly"
        docker-compose logs backend ephemeris-server
        exit 1
    fi
    echo "⏳ Waiting for services... ($i/10)"
    sleep 2
done

# Start frontend in the background
echo "🌐 Starting frontend development server..."
npm run dev-frontend &
FRONTEND_PID=$!

echo "✅ CosmicHub development environment is ready!"
echo ""
echo "📋 Service URLs:"
echo "   • Frontend: http://localhost:5174"
echo "   • Backend API: http://localhost:8000"
echo "   • Ephemeris Server: http://localhost:8001"
echo "   • API Documentation: http://localhost:8000/docs"
echo ""
echo "🛑 To stop all services:"
echo "   • Press Ctrl+C to stop frontend"
echo "   • Run: docker-compose down"

# Keep script running until interrupted
trap "echo '🛑 Stopping services...'; kill $FRONTEND_PID 2>/dev/null; docker-compose down; exit 0" INT TERM

wait $FRONTEND_PID
