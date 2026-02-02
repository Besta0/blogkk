#!/bin/bash

# Development environment startup script with hot reload

echo "🚀 Starting development environment with hot reload..."
echo ""

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Show logs
echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📍 Services:"
echo "   Frontend (Vite):  http://localhost:5050"
echo "   Backend API:      http://localhost:3010"
echo "   MySQL:            localhost:3308"
echo "   MongoDB:          localhost:27019"
echo ""
echo "🔥 Hot reload is enabled for both frontend and backend!"
echo ""
echo "⚠️  Production environment (if running):"
echo "   Frontend:         http://localhost:5060"
echo "   Backend API:      http://localhost:3020"
echo "   MySQL:            localhost:3307"
echo "   MongoDB:          localhost:27018"
echo ""
echo "📝 To view logs:"
echo "   All services:     docker-compose -f docker-compose.dev.yml logs -f"
echo "   Frontend only:    docker-compose -f docker-compose.dev.yml logs -f frontend"
echo "   Backend only:     docker-compose -f docker-compose.dev.yml logs -f backend"
echo ""
echo "🛑 To stop:"
echo "   docker-compose -f docker-compose.dev.yml down"
echo ""

# Follow logs
docker-compose -f docker-compose.dev.yml logs -f
