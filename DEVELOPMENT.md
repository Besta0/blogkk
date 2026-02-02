# 开发环境指南

本项目支持热重载（Hot Reload）开发环境，让你可以实时看到代码更改的效果。

## 🚀 快速开始

### 方法 1：使用启动脚本（推荐）

```bash
./dev.sh
```

这个脚本会自动：
- 停止现有容器
- 构建并启动所有服务
- 显示服务地址
- 跟踪日志输出

### 方法 2：手动启动

```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up --build

# 或者在后台运行
docker-compose -f docker-compose.dev.yml up --build -d

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f
```

## 📍 服务地址

启动后，你可以访问：

### 开发环境
- **前端（Vite 开发服务器）**: http://localhost:5050
- **后端 API**: http://localhost:3010
- **MySQL 数据库**: localhost:3308
- **MongoDB 数据库**: localhost:27019

### 生产环境（如果同时运行）
- **前端（Nginx）**: http://localhost:5060
- **后端 API**: http://localhost:3020
- **MySQL 数据库**: localhost:3307
- **MongoDB 数据库**: localhost:27018

> 💡 开发环境和生产环境使用不同的端口和数据库，可以同时运行而不会冲突。

## 🔥 热重载功能

### 前端热重载
- 修改 `src/` 目录下的任何文件
- 浏览器会自动刷新并显示更改
- 支持 React Fast Refresh，保持组件状态

### 后端热重载
- 修改 `backend/src/` 目录下的任何文件
- Nodemon 会自动重启服务器
- API 更改立即生效

## 📝 常用命令

### 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.dev.yml logs -f

# 只查看前端日志
docker-compose -f docker-compose.dev.yml logs -f frontend

# 只查看后端日志
docker-compose -f docker-compose.dev.yml logs -f backend
```

### 重启服务

```bash
# 重启所有服务
docker-compose -f docker-compose.dev.yml restart

# 只重启前端
docker-compose -f docker-compose.dev.yml restart frontend

# 只重启后端
docker-compose -f docker-compose.dev.yml restart backend
```

### 停止服务

```bash
# 停止所有服务
docker-compose -f docker-compose.dev.yml down

# 停止并删除数据卷
docker-compose -f docker-compose.dev.yml down -v
```

### 重新构建

```bash
# 重新构建所有服务
docker-compose -f docker-compose.dev.yml build

# 重新构建特定服务
docker-compose -f docker-compose.dev.yml build frontend
docker-compose -f docker-compose.dev.yml build backend
```

## 🐛 调试技巧

### 进入容器

```bash
# 进入前端容器
docker-compose -f docker-compose.dev.yml exec frontend sh

# 进入后端容器
docker-compose -f docker-compose.dev.yml exec backend sh
```

### 安装新依赖

```bash
# 前端安装依赖
docker-compose -f docker-compose.dev.yml exec frontend npm install <package-name>

# 后端安装依赖
docker-compose -f docker-compose.dev.yml exec backend npm install <package-name>
```

### 清理并重新开始

```bash
# 停止所有容器并删除数据
docker-compose -f docker-compose.dev.yml down -v

# 重新构建并启动
docker-compose -f docker-compose.dev.yml up --build
```

## 🔧 环境变量

开发环境使用以下配置：

### 前端
- `VITE_API_BASE_URL`: http://localhost:3010

### 后端
- `NODE_ENV`: development
- `PORT`: 3000 (容器内部，映射到主机 3010)
- `DB_HOST`: mysql
- `DB_PORT`: 3306
- `DB_NAME`: portfolio_dev
- `MONGODB_URI`: mongodb://mongodb:27017/portfolio_analytics_dev
- `JWT_EXPIRES_IN`: 1h

## 🔄 开发环境 vs 生产环境

| 服务 | 开发环境 | 生产环境 |
|------|---------|---------|
| 前端 | http://localhost:5050 (Vite) | http://localhost:5060 (Nginx) |
| 后端 | http://localhost:3010 | http://localhost:3020 |
| MySQL | localhost:3308 | localhost:3307 |
| MongoDB | localhost:27019 | localhost:27018 |
| 数据库名 | portfolio_dev | portfolio |

开发环境使用独立的端口和数据库，因此可以与生产环境同时运行。

## 📦 生产环境

要切换到生产环境，使用：

```bash
docker-compose up --build
```

这会使用 `docker-compose.yml` 文件，构建优化后的生产版本。

## ⚠️ 注意事项

1. **端口冲突**: 确保端口 5050、3010、3308、27019 没有被其他程序占用
2. **与生产环境隔离**: 开发环境使用不同的端口和数据库，可以与生产环境同时运行
3. **文件权限**: 如果遇到权限问题，可能需要调整文件所有权
4. **性能**: 开发模式下性能可能较慢，这是正常的
5. **数据持久化**: 开发环境使用独立的数据卷（`mysql_data_dev`、`mongodb_data_dev`）

## 🆘 常见问题

### 热重载不工作？

1. 确保文件已保存
2. 检查容器日志是否有错误
3. 尝试重启服务：`docker-compose -f docker-compose.dev.yml restart`

### 端口已被占用？

```bash
# 查看占用端口的进程
lsof -i :5050  # 前端
lsof -i :3010  # 后端

# 或者修改 docker-compose.dev.yml 中的端口映射
```

### 开发环境和生产环境冲突？

不会冲突！开发环境使用：
- 前端: 5050 (vs 生产 5060)
- 后端: 3010 (vs 生产 3020)
- MySQL: 3308 (vs 生产 3307)
- MongoDB: 27019 (vs 生产 27018)

可以同时运行两个环境进行对比测试。

### 依赖安装失败？

```bash
# 删除 node_modules 并重新安装
docker-compose -f docker-compose.dev.yml down
rm -rf node_modules backend/node_modules
docker-compose -f docker-compose.dev.yml up --build
```
