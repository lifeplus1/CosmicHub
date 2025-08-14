#!/bin/bash

# Development deployment script
echo "🚀 Starting CosmicHub development environment..."

# Stop any existing containers
docker-compose -f docker-compose.dev.yml down

# Build and start services
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Health checks
echo "🔍 Checking service health..."

# Check backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
fi

# Check ephemeris
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ Ephemeris server is healthy"
else
    echo "❌ Ephemeris server is not responding"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is serving"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🌟 CosmicHub is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🌌 Ephemeris: http://localhost:8001"
echo ""
echo "📊 View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "🛑 Stop services: docker-compose -f docker-compose.dev.yml down"
