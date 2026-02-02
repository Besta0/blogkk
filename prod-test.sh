#!/bin/bash

# Production Environment Test Script
# 生产环境测试脚本

echo "🚀 Starting Production Environment Test..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not found${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checking configuration files...${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found, using .env.production.example${NC}"
    cp .env.production.example .env.production
fi

if [ ! -f "backend/.env.production" ]; then
    echo -e "${YELLOW}⚠️  backend/.env.production not found, using backend/.env.production.example${NC}"
    cp backend/.env.production.example backend/.env.production
fi

echo -e "${GREEN}✅ Configuration files ready${NC}"
echo ""

echo -e "${YELLOW}🐳 Starting production containers...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready (30 seconds)...${NC}"
sleep 30

echo ""
echo -e "${YELLOW}🔍 Checking service health...${NC}"

# Check backend health
echo -n "Backend (port 3020): "
if curl -s http://localhost:3020/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Check frontend
echo -n "Frontend (port 5060): "
if curl -s http://localhost:5060 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Check MySQL
echo -n "MySQL (port 3307): "
if docker exec portfolio-mysql mysqladmin ping -h localhost -u root -prootpassword > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Check MongoDB
echo -n "MongoDB (port 27018): "
if docker exec portfolio-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Production environment test complete!"
echo "==========================================${NC}"
echo ""
echo "Access your application:"
echo "  Frontend: http://localhost:5060"
echo "  Backend API: http://localhost:3020/api/health"
echo "  Admin Panel: http://localhost:5060/admin"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
echo ""
echo "To stop:"
echo "  docker-compose down"
