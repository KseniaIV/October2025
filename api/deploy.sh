#!/bin/bash

# APISIX RSS Service Deployment Script
set -e

# Configuration
SERVICE_NAME="apisix-rss-service"
DOCKER_IMAGE="$SERVICE_NAME:latest"
CONTAINER_NAME="$SERVICE_NAME-container"
PORT=${PORT:-3000}
ENVIRONMENT=${ENVIRONMENT:-production}

echo "🚀 Deploying APISIX RSS Service..."
echo "Environment: $ENVIRONMENT"
echo "Port: $PORT"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "📋 Checking dependencies..."
if ! command_exists docker; then
    echo "❌ Docker is required but not installed."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo "✅ Dependencies check passed"

# Build TypeScript
echo "🔨 Building TypeScript..."
npm install
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Stop existing container if running
echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Build Docker image
echo "🏗️ Building Docker image..."
docker build -t $DOCKER_IMAGE .

# Run container
echo "🚀 Starting container..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:3000 \
  -e NODE_ENV=$ENVIRONMENT \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  $DOCKER_IMAGE

# Wait for service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 5

# Health check
echo "🏥 Performing health check..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:$PORT/api/health >/dev/null 2>&1; then
        echo "✅ Service is healthy!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Health check failed after $max_attempts attempts"
        docker logs $CONTAINER_NAME
        exit 1
    fi
    
    echo "Attempt $attempt/$max_attempts failed, retrying in 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
done

# Display service information
echo ""
echo "🎉 Deployment completed successfully!"
echo "📊 Service URL: http://localhost:$PORT"
echo "🏥 Health Check: http://localhost:$PORT/api/health"
echo "📰 RSS Feeds: http://localhost:$PORT/api/feeds/{feedType}"
echo ""
echo "Available feed types:"
echo "  - top"
echo "  - technology"
echo "  - business"
echo "  - health"
echo "  - science"
echo "  - sports"
echo ""
echo "📋 Container logs: docker logs $CONTAINER_NAME"
echo "🛑 Stop service: docker stop $CONTAINER_NAME"
echo ""

# Optional: Test API endpoints
if [ "$ENVIRONMENT" = "development" ]; then
    echo "🧪 Testing API endpoints..."
    
    echo "Testing health endpoint..."
    curl -s http://localhost:$PORT/api/health | jq '.'
    
    echo ""
    echo "Testing RSS feed endpoint..."
    curl -s http://localhost:$PORT/api/feeds/top | jq '.success, .feedType, .count'
fi

echo "✅ Deployment script completed!"
