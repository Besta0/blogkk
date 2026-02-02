# 环境变量配置指南

本文档说明如何配置项目的环境变量，用于开发、测试和生产环境。

## 目录

- [快速开始](#快速开始)
- [前端环境变量](#前端环境变量)
- [后端环境变量](#后端环境变量)
- [Docker 环境变量](#docker-环境变量)
- [CI/CD 环境变量](#cicd-环境变量)
- [安全最佳实践](#安全最佳实践)

## 快速开始

### 开发环境

```bash
# 前端
cp .env.example .env

# 后端
cd backend
cp .env.example .env
```

### 生产环境

```bash
# 前端
cp .env.production.example .env.production

# 后端
cd backend
cp .env.production.example .env.production
```

## 前端环境变量

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:3020` | 是 |

### 示例配置

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:3010

# 生产环境
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 后端环境变量

### 服务器配置

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `PORT` | 服务器端口 | `3000` | 否 |
| `NODE_ENV` | 运行环境 | `development` | 是 |
| `FRONTEND_URL` | 前端地址（CORS） | `http://localhost:5060` | 是 |

### 数据库配置

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `MONGODB_URI` | MongoDB 连接字符串 | - | 是 |
| `MONGODB_TEST_URI` | 测试数据库连接字符串 | - | 否 |

### JWT 配置

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `JWT_SECRET` | JWT 签名密钥 | - | 是 |
| `JWT_REFRESH_SECRET` | 刷新令牌密钥 | - | 是 |
| `JWT_EXPIRES_IN` | 访问令牌过期时间 | `1h` | 否 |
| `JWT_REFRESH_EXPIRES_IN` | 刷新令牌过期时间 | `7d` | 否 |

### Cloudinary 配置

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary 云名称 | - | 是 |
| `CLOUDINARY_API_KEY` | Cloudinary API 密钥 | - | 是 |
| `CLOUDINARY_API_SECRET` | Cloudinary API 密钥 | - | 是 |

### 邮件配置

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `SMTP_HOST` | SMTP 服务器地址 | `smtp.gmail.com` | 是 |
| `SMTP_PORT` | SMTP 端口 | `587` | 是 |
| `SMTP_USER` | SMTP 用户名 | - | 是 |
| `SMTP_PASS` | SMTP 密码 | - | 是 |
| `FROM_EMAIL` | 发件人邮箱 | - | 是 |
| `FROM_NAME` | 发件人名称 | `Portfolio Website` | 否 |

### 管理员配置

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `ADMIN_EMAIL` | 管理员邮箱 | - | 是 |
| `ADMIN_PASSWORD` | 管理员密码 | - | 是 |

## Docker 环境变量

使用 Docker Compose 时，可以通过 `.env` 文件或命令行设置环境变量：

```bash
# 创建 .env 文件
cat > .env << EOF
# 端口配置
FRONTEND_PORT=5060
BACKEND_PORT=3020

# API 配置
VITE_API_BASE_URL=http://localhost:3020
FRONTEND_URL=http://localhost:5060

# 数据库
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/portfolio

# JWT
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# 邮件
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Portfolio

# 管理员
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password
EOF

# 启动服务
docker-compose up -d
```

## CI/CD 环境变量

### GitHub Actions Secrets

在 GitHub 仓库设置中添加以下 Secrets：

| Secret 名称 | 描述 |
|-------------|------|
| `MONGODB_URI` | 生产数据库连接字符串 |
| `JWT_SECRET` | 生产 JWT 密钥 |
| `JWT_REFRESH_SECRET` | 生产刷新令牌密钥 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary 云名称 |
| `CLOUDINARY_API_KEY` | Cloudinary API 密钥 |
| `CLOUDINARY_API_SECRET` | Cloudinary API 密钥 |
| `SSH_HOST` | 部署服务器地址（可选） |
| `SSH_USERNAME` | SSH 用户名（可选） |
| `SSH_PRIVATE_KEY` | SSH 私钥（可选） |

### GitHub Actions Variables

在 GitHub 仓库设置中添加以下 Variables：

| Variable 名称 | 描述 |
|---------------|------|
| `VITE_API_BASE_URL` | 生产 API 地址 |

## 安全最佳实践

### 1. 生成安全密钥

```bash
# 生成 JWT 密钥
openssl rand -base64 64

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 2. 环境变量安全

- ❌ 永远不要将 `.env` 文件提交到版本控制
- ✅ 使用 `.env.example` 作为模板
- ✅ 在 CI/CD 中使用 Secrets 管理敏感信息
- ✅ 定期轮换密钥和密码

### 3. 生产环境检查清单

- [ ] 使用强密码和密钥（至少 64 字符）
- [ ] 启用 HTTPS
- [ ] 配置正确的 CORS 策略
- [ ] 设置适当的速率限制
- [ ] 启用数据库认证
- [ ] 配置日志记录和监控

### 4. 密钥轮换

建议定期轮换以下密钥：

- JWT 密钥：每 90 天
- 数据库密码：每 90 天
- API 密钥：每 180 天

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `MONGODB_URI` 格式是否正确
   - 确认 IP 白名单已配置（MongoDB Atlas）

2. **CORS 错误**
   - 确认 `FRONTEND_URL` 与实际前端地址匹配
   - 检查是否包含协议（http/https）

3. **JWT 验证失败**
   - 确认 `JWT_SECRET` 在所有实例中一致
   - 检查令牌是否过期

4. **邮件发送失败**
   - 确认 SMTP 凭据正确
   - 对于 Gmail，使用应用专用密码
