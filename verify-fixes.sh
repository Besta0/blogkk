#!/bin/bash

# Verification Script for Blog Edit Fix
# 验证博客编辑修复的脚本

echo "🔍 Verifying Blog Edit Fix..."
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# Function to check file content
check_file() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅ $description${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌ $description${NC}"
        ((FAIL++))
        return 1
    fi
}

# Function to check file does NOT contain pattern
check_file_not() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if ! grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅ $description${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌ $description${NC}"
        ((FAIL++))
        return 1
    fi
}

echo "📋 Checking Backend Controller..."
check_file "backend/src/controllers/blog.controller.ts" "id: post.id" "Backend returns 'id' field"
check_file_not "backend/src/controllers/blog.controller.ts" "_id: post._id" "Backend does not return '_id' field"
check_file "backend/src/controllers/blog.controller.ts" "if (!id)" "Delete method has correct logic"

echo ""
echo "📋 Checking Frontend BlogManager..."
check_file "src/admin/pages/BlogManager.tsx" "id: editingPost.id" "Frontend uses editingPost.id"
check_file_not "src/admin/pages/BlogManager.tsx" "Number(rawId)" "Frontend removed numeric conversion"

echo ""
echo "📋 Checking Middleware..."
check_file "backend/src/middleware/validation.middleware.ts" "validateUUID" "UUID validation middleware exists"
check_file "backend/src/middleware/index.ts" "validateUUID" "UUID validation exported"

echo ""
echo "📋 Checking Routes..."
check_file "backend/src/routes/blog.routes.ts" "validateUUID" "Blog routes use UUID validation"
check_file "backend/src/routes/project.routes.ts" "validateUUID" "Project routes use UUID validation"

echo ""
echo "📋 Checking Development Configuration..."
check_file "docker-compose.dev.yml" "PORT=3010" "Dev backend PORT=3010"
check_file "docker-compose.dev.yml" "3010:3010" "Dev backend port mapping 3010:3010"
check_file "docker-compose.dev.yml" "VITE_API_BASE_URL=http://localhost:3010" "Dev frontend API URL"
check_file "backend/.env" "PORT=3010" "Dev backend .env PORT=3010"

echo ""
echo "📋 Checking Production Configuration..."
check_file "docker-compose.yml" "PORT=3020" "Prod backend PORT=3020"
check_file "docker-compose.yml" ":3020" "Prod backend port mapping 3020:3020"
check_file "docker-compose.yml" "NODE_ENV=production" "Prod backend NODE_ENV=production"
check_file "docker-compose.yml" "JWT_EXPIRES_IN:-1h" "Prod JWT expires in 1h"
check_file "backend/.env.production.example" "PORT=3020" "Prod backend example PORT=3020"

echo ""
echo "📋 Checking Model..."
check_file "backend/src/models/blogPost.model.ts" "@PrimaryGeneratedColumn('uuid')" "BlogPost uses UUID primary key"

echo ""
echo "=============================="
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo "=============================="

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Blog edit fix is complete.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please review the issues above.${NC}"
    exit 1
fi
