# 🚀 部署指南

本文档提供了动态作品集网站的完整部署指南，包括前端、后端和数据库的配置。

## 📋 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [Docker 部署](#docker-部署)
- [手动部署](#手动部署)
- [云平台部署](#云平台部署)
- [数据库配置](#数据库配置)
- [环境变量配置](#环境变量配置)
- [SSL/HTTPS 配置](#sslhttps-配置)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 系统要求

### 最低配置
- CPU: 1 核心
- 内存: 1GB RAM
- 存储: 10GB SSD
- 操作系统: Ubuntu 20.04+ / CentOS 8+ / macOS / Windows

### 软件依赖
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 5.0 (或 MongoDB Atlas)
- Docker >= 20.10 (可选)
- Docker Compose >= 2.0 (可选)

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/Besta0/blogkk.git
cd blogkk
```

### 2. 配置环境变量
```bash
# 前端
cp .env.example .env

# 后端
cd backend
cp .env.example .env
```

### 3. 启动服务
```bash
# 使用 Docker Compose (推荐)
docker-compose up -d

# 或手动启动
npm install && npm run build
cd backend && npm install && npm run build && npm start
```

### 4. 初始化管理员账户
```bash
cd backend
npm run init-admin
```

### 5. 访问网站
- 前端: http://localhost:5060
- 后端 API: http://localhost:3020
- 管理后台: http://localhost:5060/admin

## 🐳 Docker 部署

### 开发环境

```bash
# 启动开发环境 (带热重载)
docker-compose -f docker-compose.dev.yml up -d

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

### 生产环境

```bash
# 1. 配置生产环境变量
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production

# 2. 编辑环境变量文件，填入实际值
nano .env.production
nano backend/.env.production

# 3. 构建并启动
docker-compose up -d --build

# 4. 初始化管理员 (首次部署)
docker-compose exec backend npm run init-admin

# 5. 查看服务状态
docker-compose ps
docker-compose logs -f
```

### Docker Compose 配置说明

```yaml
# docker-compose.yml 主要配置
services:
  frontend:
    build: .
    ports:
      - "5060:80"  # 前端端口
    environment:
      - VITE_API_BASE_URL=http://localhost:3020

  backend:
    build: ./backend
    ports:
      - "3020:3000"  # 后端端口
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://...
      - JWT_SECRET=your-secret
```

### 自定义 Docker 镜像

```bash
# 构建前端镜像
docker build -t portfolio-frontend:latest .

# 构建后端镜像
docker build -t portfolio-backend:latest ./backend

# 运行容器
docker run -d -p 5060:80 --name frontend portfolio-frontend:latest
docker run -d -p 3020:3000 --name backend portfolio-backend:latest
```

## 手动部署

### 前端部署

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production

# 3. 构建生产版本
npm run build

# 4. 部署 dist 目录到 Web 服务器
# 输出目录: ./dist
```

### 后端部署

```bash
cd backend

# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.production.example .env
# 编辑 .env 文件填入实际配置

# 3. 构建 TypeScript
npm run build

# 4. 启动服务
npm start

# 或使用 PM2 进程管理
npm install -g pm2
pm2 start dist/server.js --name portfolio-api
pm2 save
pm2 startup
```

### 使用 PM2 管理后端进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status
pm2 logs portfolio-api

# 重启/停止
pm2 restart portfolio-api
pm2 stop portfolio-api

# 设置开机自启
pm2 startup
pm2 save
```

PM2 配置文件 (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'portfolio-api',
    script: './dist/server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## 云平台部署

### ▲ Vercel 部署 (前端)

1. **准备代码**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **在 Vercel 部署**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - 配置：
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Environment Variables**: 添加 `VITE_API_BASE_URL`
   - 点击 "Deploy"

### 🌐 Netlify 部署 (前端)

1. **在 Netlify 部署**
   - 访问 [netlify.com](https://netlify.com)
   - 点击 "Add new site" → "Import an existing project"
   - 连接 GitHub 并选择仓库
   - 配置：
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - 添加环境变量 `VITE_API_BASE_URL`
   - 点击 "Deploy site"

### 🚂 Railway 部署 (后端)

1. **创建项目**
   - 访问 [railway.app](https://railway.app)
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择仓库，设置根目录为 `backend`

2. **配置环境变量**
   - 在 Railway 项目设置中添加所有后端环境变量
   - 参考 `backend/.env.example`

3. **配置启动命令**
   ```
   npm run build && npm start
   ```

### ☁️ AWS 部署

#### 使用 EC2

```bash
# 1. 连接到 EC2 实例
ssh -i your-key.pem ec2-user@your-instance-ip

# 2. 安装 Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# 3. 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. 部署应用
git clone https://github.com/Besta0/blogkk.git
cd blogkk
docker-compose up -d
```

#### 使用 Elastic Beanstalk

1. 安装 EB CLI: `pip install awsebcli`
2. 初始化: `eb init`
3. 创建环境: `eb create production`
4. 部署: `eb deploy`

## 数据库配置

### MongoDB Atlas (推荐)

1. **创建账户和集群**
   - 访问 [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - 创建免费 M0 集群

2. **配置网络访问**
   - 在 "Network Access" 中添加 IP 白名单
   - 生产环境建议使用 VPC Peering

3. **创建数据库用户**
   - 在 "Database Access" 中创建用户
   - 记录用户名和密码

4. **获取连接字符串**
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

### 本地 MongoDB

```bash
# 使用 Docker 运行 MongoDB
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:6

# 连接字符串
mongodb://admin:password@localhost:27017/portfolio?authSource=admin
```

### 数据库索引设置

首次部署后运行索引设置脚本：
```bash
cd backend
npm run setup-indexes
```

## 环境变量配置

详细的环境变量配置请参考 [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md)

### 必需的环境变量

| 变量 | 描述 | 示例 |
|------|------|------|
| `MONGODB_URI` | MongoDB 连接字符串 | `mongodb+srv://...` |
| `JWT_SECRET` | JWT 签名密钥 (64+ 字符) | `openssl rand -base64 64` |
| `JWT_REFRESH_SECRET` | 刷新令牌密钥 | `openssl rand -base64 64` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary 云名称 | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API 密钥 | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API 密钥 | `abc123...` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@example.com` |
| `ADMIN_PASSWORD` | 管理员密码 | `SecurePassword123!` |

### 生成安全密钥

```bash
# 生成 JWT 密钥
openssl rand -base64 64

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## SSL/HTTPS 配置

### 使用 Let's Encrypt (Certbot)

```bash
# 安装 Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期测试
sudo certbot renew --dry-run

# 设置自动续期 (crontab)
0 0 1 * * /usr/bin/certbot renew --quiet
```

### Nginx 反向代理配置

```nginx
# /etc/nginx/sites-available/portfolio
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # 前端
    location / {
        proxy_pass http://localhost:5060;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 监控和维护

### 健康检查

```bash
# API 健康检查
curl http://localhost:3020/health

# Docker 容器状态
docker ps
docker stats

# PM2 状态
pm2 status
pm2 monit
```

### 日志管理

```bash
# Docker 日志
docker-compose logs -f backend
docker-compose logs --tail=100 backend

# PM2 日志
pm2 logs portfolio-api
pm2 logs portfolio-api --lines 100

# 系统日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 数据库备份

```bash
# MongoDB 备份
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# 恢复备份
mongorestore --uri="mongodb+srv://..." /backup/20240101

# 自动备份脚本 (crontab)
0 2 * * * /path/to/backup-script.sh
```

### 性能监控

推荐使用以下工具：
- **Uptime Robot** - 免费的网站监控
- **MongoDB Atlas** - 内置数据库监控
- **PM2 Plus** - Node.js 应用监控
- **Cloudflare** - CDN 和 DDoS 防护

## 故障排除

### 常见问题

#### 1. Docker 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend

# 检查端口占用
netstat -tulpn | grep -E '3020|5060'

# 重启容器
docker-compose restart

# 完全重建
docker-compose down -v
docker-compose up -d --build
```

#### 2. 数据库连接失败

```bash
# 测试连接
cd backend
npm run test-db

# 检查环境变量
echo $MONGODB_URI

# 检查 IP 白名单 (MongoDB Atlas)
# 确保服务器 IP 已添加到白名单
```

#### 3. JWT 认证失败

- 确认 `JWT_SECRET` 在所有实例中一致
- 检查令牌是否过期
- 清除浏览器缓存和 localStorage

#### 4. 文件上传失败

- 检查 Cloudinary 配置是否正确
- 确认文件大小不超过限制 (默认 5MB)
- 检查文件类型是否支持

#### 5. CORS 错误

- 确认 `FRONTEND_URL` 配置正确
- 检查是否包含协议 (http/https)
- 确认端口号正确

### 性能优化

1. **启用 Gzip 压缩** (已在 nginx.conf 中配置)
2. **使用 CDN** 加速静态资源
3. **配置浏览器缓存**
4. **启用 HTTP/2**
5. **优化图片** (Cloudinary 自动处理)
6. **数据库索引优化**

### 安全检查清单

- [ ] 使用强密码和密钥 (64+ 字符)
- [ ] 启用 HTTPS
- [ ] 配置正确的 CORS 策略
- [ ] 设置 API 速率限制
- [ ] 启用数据库认证
- [ ] 定期更新依赖
- [ ] 配置防火墙规则
- [ ] 启用日志记录和监控

## 🎯 部署检查清单

### 首次部署

- [ ] 配置所有环境变量
- [ ] 设置 MongoDB 数据库
- [ ] 配置 Cloudinary 账户
- [ ] 初始化管理员账户
- [ ] 设置数据库索引
- [ ] 配置 SSL 证书
- [ ] 测试所有 API 端点
- [ ] 验证管理后台功能

### 更新部署

- [ ] 备份数据库
- [ ] 拉取最新代码
- [ ] 检查环境变量变更
- [ ] 重新构建和部署
- [ ] 运行数据库迁移 (如有)
- [ ] 验证功能正常

---

如有问题，请提交 Issue 或 Pull Request！
