# 生产环境部署检查清单

## ✅ 部署前检查

### 1. 配置文件
- [ ] 复制并配置 `.env.production`
- [ ] 复制并配置 `backend/.env.production`
- [ ] 设置强密码的 JWT_SECRET（64+ 字符）
- [ ] 设置强密码的 JWT_REFRESH_SECRET（64+ 字符）
- [ ] 配置正确的数据库连接信息
- [ ] 配置 FRONTEND_URL 为实际域名

### 2. 端口配置
- [ ] 前端端口：5060
- [ ] 后端端口：3020
- [ ] MySQL 端口：3307（主机）/ 3306（容器内）
- [ ] MongoDB 端口：27018（主机）/ 27017（容器内）

### 3. 数据库
- [ ] MySQL 数据库已创建
- [ ] MongoDB 已配置
- [ ] 数据库凭据已更新
- [ ] 数据库备份策略已设置

### 4. 安全设置
- [ ] 更改默认管理员密码
- [ ] 配置 CORS_ORIGINS
- [ ] 启用 HTTPS/SSL
- [ ] 配置防火墙规则
- [ ] 设置速率限制

### 5. 第三方服务
- [ ] Cloudinary 配置（图片上传）
- [ ] SMTP 配置（邮件发送）
- [ ] 其他 API 密钥已配置

## 🚀 部署步骤

### 使用 Docker Compose

```bash
# 1. 构建并启动容器
docker-compose up -d --build

# 2. 等待服务启动（约30秒）
sleep 30

# 3. 检查服务状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 5. 初始化管理员账户
docker exec -it portfolio-backend npm run init:admin
```

### 快速测试脚本

```bash
# 运行生产环境测试
./prod-test.sh
```

## 🔍 部署后验证

### 1. 服务健康检查
```bash
# 后端健康检查
curl http://localhost:3020/api/health

# 前端访问
curl http://localhost:5060

# 数据库连接
docker exec portfolio-mysql mysqladmin ping -h localhost -u root -p
docker exec portfolio-mongodb mongosh --eval "db.adminCommand('ping')"
```

### 2. 功能测试
- [ ] 前端页面正常加载
- [ ] 管理员登录成功
- [ ] API 端点响应正常
- [ ] 图片上传功能正常
- [ ] 邮件发送功能正常
- [ ] 数据库读写正常

### 3. 性能检查
- [ ] 页面加载时间 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 图片加载优化
- [ ] 缓存策略生效

## ⚠️ 常见问题

### 问题 1: 后端无法连接
**症状**: `curl http://localhost:3020/api/health` 失败

**解决方案**:
```bash
# 检查后端日志
docker logs portfolio-backend

# 检查端口映射
docker ps | grep portfolio-backend

# 确认环境变量
docker exec portfolio-backend env | grep PORT
```

### 问题 2: 数据库连接失败
**症状**: 后端日志显示数据库连接错误

**解决方案**:
```bash
# 检查数据库容器状态
docker ps | grep mysql
docker ps | grep mongodb

# 测试数据库连接
docker exec portfolio-mysql mysqladmin ping -h localhost -u root -p
docker exec portfolio-mongodb mongosh --eval "db.adminCommand('ping')"

# 检查数据库凭据
docker exec portfolio-backend env | grep DB_
```

### 问题 3: 前端无法访问后端
**症状**: 前端页面加载但 API 调用失败

**解决方案**:
```bash
# 检查前端环境变量
docker exec portfolio-frontend env | grep VITE_API_BASE_URL

# 检查 CORS 配置
docker exec portfolio-backend env | grep FRONTEND_URL

# 重启前端容器
docker-compose restart frontend
```

### 问题 4: 博客文章编辑显示"无效ID"
**症状**: 编辑博客文章时显示错误

**已修复**: 
- ✅ 后端控制器返回 `id` 而不是 `_id`
- ✅ 前端简化了 ID 处理逻辑
- ✅ UUID 验证中间件正确配置
- ✅ 端口配置正确（3020）

**验证**:
```bash
# 检查后端版本
docker logs portfolio-backend | grep "Server is running"

# 应该显示: 🚀 Server is running on port 3020
```

## 🔄 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并启动
docker-compose up -d --build

# 3. 检查更新
docker-compose logs -f
```

## 🛑 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（谨慎！）
docker-compose down -v
```

## 📊 监控和维护

### 日志管理
```bash
# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 导出日志
docker-compose logs > logs.txt
```

### 数据备份
```bash
# MySQL 备份
docker exec portfolio-mysql mysqldump -u root -p portfolio > backup.sql

# MongoDB 备份
docker exec portfolio-mongodb mongodump --out=/backup

# 恢复 MySQL
docker exec -i portfolio-mysql mysql -u root -p portfolio < backup.sql
```

### 性能监控
```bash
# 查看容器资源使用
docker stats

# 查看容器详情
docker inspect portfolio-backend
docker inspect portfolio-frontend
```

## 📞 支持

如果遇到问题：
1. 检查日志：`docker-compose logs -f`
2. 查看本文档的常见问题部分
3. 检查 GitHub Issues
4. 联系技术支持

---

**最后更新**: 2026-02-01
**版本**: 1.0.0
