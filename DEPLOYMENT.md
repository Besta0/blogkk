# 🚀 部署指南

本文档提供了多种部署个人网站的方式。

## 📋 目录

- [Docker 部署](#docker-部署)
- [Vercel 部署](#vercel-部署)
- [Netlify 部署](#netlify-部署)
- [自托管服务器](#自托管服务器)

## 🐳 Docker 部署

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+（可选）

### 快速开始

```bash
# 1. 克隆或下载项目
git clone https://github.com/Besta0/blogkk.git
cd blogkk

# 2. 使用 Docker Compose 启动（推荐）
docker-compose up -d

# 3. 访问网站
# 打开浏览器访问 http://localhost:3000
```

### 自定义配置

#### 修改端口

编辑 `docker-compose.yml`：

```yaml
ports:
  - "8080:80"  # 将 8080 改为你想要的端口
```

#### 构建自定义镜像

```bash
docker build -t my-personal-website:latest .
docker run -d -p 3000:80 --name my-site my-personal-website:latest
```

### 生产环境部署

```bash
# 使用环境变量
docker-compose -f docker-compose.yml up -d

# 查看日志
docker-compose logs -f web

# 停止服务
docker-compose down

# 更新部署
git pull
docker-compose up -d --build
```

## ▲ Vercel 部署

### 步骤

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
   - 点击 "Deploy"

3. **自动部署**
   - 每次推送到 main 分支会自动触发部署

### 环境变量（如需要）

在 Vercel 项目设置中添加环境变量。

## 🌐 Netlify 部署

### 步骤

1. **准备代码**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **在 Netlify 部署**
   - 访问 [netlify.com](https://netlify.com)
   - 点击 "Add new site" → "Import an existing project"
   - 连接 GitHub 并选择仓库
   - 配置：
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - 点击 "Deploy site"

3. **自定义域名**
   - 在站点设置中添加自定义域名
   - 配置 DNS 记录

## 🖥️ 自托管服务器

### 使用 Docker

```bash
# 1. SSH 连接到服务器
ssh user@your-server.com

# 2. 安装 Docker（如果未安装）
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. 克隆项目
git clone https://github.com/Besta0/blogkk.git
cd blogkk

# 4. 启动服务
docker-compose up -d

# 5. 配置防火墙
sudo ufw allow 3000/tcp
```

### 使用 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/personal-website
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/personal-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 使用 SSL（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 🔧 常见问题

### Docker 容器无法启动

```bash
# 查看日志
docker-compose logs web

# 检查端口占用
netstat -tulpn | grep 3000

# 重启容器
docker-compose restart
```

### 构建失败

```bash
# 清理缓存
docker-compose down -v
docker system prune -a

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 性能优化

- 启用 Gzip 压缩（已在 nginx.conf 中配置）
- 使用 CDN 加速静态资源
- 配置浏览器缓存
- 启用 HTTP/2

## 📊 监控和维护

### 健康检查

```bash
# Docker 健康检查
curl http://localhost:3000/health

# 查看容器状态
docker ps
docker stats
```

### 日志管理

```bash
# 查看实时日志
docker-compose logs -f web

# 查看最近 100 行日志
docker-compose logs --tail=100 web
```

### 备份

```bash
# 备份 Docker 镜像
docker save personal-website > backup.tar

# 恢复
docker load < backup.tar
```

## 🎯 下一步

- [ ] 配置自定义域名
- [ ] 设置 SSL 证书
- [ ] 配置 CDN
- [ ] 设置监控和告警
- [ ] 配置自动备份

---

如有问题，请提交 Issue 或 Pull Request！
