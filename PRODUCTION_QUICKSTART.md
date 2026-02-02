# 生产环境快速启动指南

## 🎯 5分钟快速部署

### 第一步：准备配置文件

```bash
# 复制环境配置模板
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production
```

### 第二步：编辑配置（重要！）

编辑 `backend/.env.production`，至少修改以下内容：

```bash
# 必须修改的配置
JWT_SECRET=你的超长随机字符串至少64个字符
JWT_REFRESH_SECRET=另一个超长随机字符串至少64个字符
ADMIN_EMAIL=你的管理员邮箱
ADMIN_PASSWORD=你的强密码

# 如果有域名，修改这个
FRONTEND_URL=https://你的域名.com
```

💡 **生成安全密钥**：
```bash
# 在终端运行以下命令生成随机密钥
openssl rand -base64 64
```

### 第三步：启动服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 等待30秒让服务完全启动
sleep 30
```

### 第四步：初始化管理员

```bash
# 创建管理员账户
docker exec -it portfolio-backend npm run init:admin
```

### 第五步：验证部署

```bash
# 检查后端
curl http://localhost:3020/api/health

# 检查前端
curl http://localhost:5060
```

## 🌐 访问应用

- **前端网站**: http://localhost:5060
- **管理后台**: http://localhost:5060/admin
- **后端API**: http://localhost:3020/api/health

## 📝 默认端口

| 服务 | 端口 |
|------|------|
| 前端 | 5060 |
| 后端 | 3020 |
| MySQL | 3307 |
| MongoDB | 27018 |

## ⚡ 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 重启服务
docker-compose restart backend
docker-compose restart frontend

# 停止所有服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

## 🔧 故障排查

### 后端无法访问？

```bash
# 检查后端日志
docker logs portfolio-backend --tail 50

# 确认端口正确
docker ps | grep portfolio-backend
# 应该看到: 0.0.0.0:3020->3020/tcp
```

### 数据库连接失败？

```bash
# 检查数据库状态
docker ps | grep mysql
docker ps | grep mongodb

# 查看数据库日志
docker logs portfolio-mysql --tail 20
docker logs portfolio-mongodb --tail 20
```

### 前端无法加载？

```bash
# 检查前端日志
docker logs portfolio-frontend --tail 50

# 确认环境变量
docker exec portfolio-frontend env | grep VITE_API_BASE_URL
# 应该是: http://localhost:3020
```

## 🎉 完成！

现在你的应用已经在生产模式下运行了！

**下一步**：
1. 访问 http://localhost:5060/admin 登录管理后台
2. 修改个人资料信息
3. 创建项目和博客文章
4. 配置 Cloudinary（图片上传）
5. 配置 SMTP（邮件发送）

## 📚 更多信息

- 完整部署检查清单：查看 `PRODUCTION_CHECKLIST.md`
- 开发环境指南：查看 `DEVELOPMENT.md`
- API 文档：查看 `API_DOCUMENTATION.md`
- 管理员手册：查看 `ADMIN_MANUAL.md`

---

**提示**: 如果你在本地测试生产环境，可以使用 `./prod-test.sh` 脚本自动检查所有服务。
