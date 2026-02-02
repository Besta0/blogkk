# 🚀 个人作品集网站

<div align="center">

一个现代化的全栈个人作品集网站，使用 React + TypeScript + Framer Motion 构建，采用混合数据库架构（MySQL + MongoDB）以获得最佳性能。

[![Version](https://img.shields.io/github/package-json/v/Besta0/blogkk?style=flat-square)](https://github.com/Besta0/blogkk)
[![Docker Pulls](https://img.shields.io/docker/pulls/caleb333/blogkk?style=flat-square)](https://hub.docker.com/r/caleb333/blogkk)

[在线演示](#) • [文档](#-文档) • [报告问题](https://github.com/Besta0/blogkk/issues) • [功能请求](https://github.com/Besta0/blogkk/issues)

**🌐 语言:** [English](README.md) | [中文](README-zh.md)

</div>

---

## 📸 界面预览

<div align="center">

### 🏠 首页
![首页](screenshots/home.png)
*现代化的主页设计，带有动画渐变和交互元素*

### 👤 关于页面
![关于页面](screenshots/about.png)
*技能展示，带有进度条和经验时间线*

### 💼 项目展示
![项目展示](screenshots/projects.png)
*精选项目展示，支持筛选和详细查看*

### 📝 博客
![博客](screenshots/blog.png)
*技术博客，支持 Markdown 和标签筛选*

### 📧 联系方式
![联系页面](screenshots/contact.png)
*联系表单，集成社交媒体链接*

</div>

---

## 📚 文档

| 文档 | 描述 |
|------|------|
| [部署指南](DEPLOYMENT.md) | 完整的部署说明 |
| [API 文档](API_DOCUMENTATION.md) | 完整的 API 参考 |
| [管理员手册](ADMIN_MANUAL.md) | 管理后台使用指南 |
| [环境配置](ENV_CONFIGURATION.md) | 环境变量配置指南 |
| [后端文档](backend/README.md) | 后端相关文档 |

---

## ✨ 功能特性

- 🎨 **精美视觉效果** - 渐变、毛玻璃、3D 动画
- 🖱️ **丰富交互** - 磁性按钮、滚动动画
- 🌓 **深色/浅色主题** - 支持主题切换
- 📱 **响应式设计** - 完美适配所有设备
- ⚡ **性能优化** - 使用 Vite 构建，加载快速
- 🐳 **Docker 支持** - 一键部署
- 🔐 **管理后台** - 完整的内容管理系统
- 📝 **博客系统** - 支持 Markdown 和标签
- 📊 **数据分析** - 内置访客统计和实时追踪
- 🔒 **JWT 认证** - 安全的管理员访问，支持刷新令牌
- 🗄️ **混合数据库** - MySQL 存储结构化数据，MongoDB 存储分析数据

## 🛠️ 技术栈

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Framer Motion** - 动画库
- **TanStack Query** - 数据获取
- **Lucide React** - 图标库

### 后端
- **Node.js** - 运行时
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **TypeORM** - MySQL ORM，完整类型支持
- **Mongoose** - MongoDB ODM，用于分析数据
- **JWT** - 认证，支持刷新令牌
- **Cloudinary** - 图片存储

### 数据库架构
- **MySQL** - 结构化数据（用户、项目、博客文章、个人资料）
- **MongoDB** - 分析数据（页面访问、交互记录、日志）

### DevOps
- **Docker** - 容器化
- **Docker Compose** - 编排
- **Nginx** - Web 服务器

## 📦 安装与运行

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose（推荐）
- MySQL 8.0+（开发环境可使用 SQLite）
- MongoDB 6.0+（测试环境可使用 mongodb-memory-server）
- Cloudinary 账号（用于图片上传）

---

## 🔧 开发环境

### 使用 Docker 快速启动（推荐）

开发环境包含前后端热重载功能：

```bash
# 克隆仓库
git clone https://github.com/Besta0/blogkk.git
cd blogkk

# 启动开发环境（带热重载）
./dev.sh

# 或手动启动
docker-compose -f docker-compose.dev.yml up --build
```

**访问地址：**
- 前端：http://localhost:5050
- 后端 API：http://localhost:3010
- 管理后台：http://localhost:5050/admin
- MySQL：localhost:3308
- MongoDB：localhost:27019

### 初始化开发数据

```bash
# 创建管理员账号（必需）
docker-compose -f docker-compose.dev.yml exec backend npm run init:admin

# 或使用自定义凭据
docker-compose -f docker-compose.dev.yml exec backend npm run init:admin your-email@example.com your-password

# 填充测试数据（可选 - 仅用于开发环境）
docker-compose -f docker-compose.dev.yml exec backend npm run seed
```

**默认管理员凭据：**
- 邮箱：admin@example.com
- 密码：admin123

### 本地开发（不使用 Docker）

```bash
# 安装依赖
npm install
cd backend && npm install && cd ..

# 配置环境变量
cp .env.example .env
cp backend/.env.example backend/.env

# 编辑 .env 文件配置
# 前端 .env: VITE_API_BASE_URL=http://localhost:3010
# 后端 .env: PORT=3000, 数据库设置等

# 终端 1 - 启动后端
cd backend
npm run dev

# 终端 2 - 启动前端
npm run dev

# 终端 3 - 初始化管理员
cd backend
npm run init:admin
```

### 开发环境特性

✅ **热重载** - 代码更改立即生效，无需重启  
✅ **独立端口** - 与生产环境不冲突  
✅ **测试数据** - 使用 `seed` 脚本填充示例数据  
✅ **调试模式** - 详细的日志和错误信息  
✅ **隔离数据库** - 使用独立的 `portfolio_dev` 数据库

### ⚠️ 开发环境注意事项

1. **测试数据**：`seed` 脚本在开发环境中安全使用
2. **端口配置**：开发环境使用 5050/3010 端口，生产环境使用 5060/3020 端口
3. **数据库**：使用独立的 `portfolio_dev` 数据库
4. **热重载**：文件更改会触发自动重载
5. **调试**：使用 `docker-compose -f docker-compose.dev.yml logs -f` 查看日志

---

## 🚀 生产环境

### Docker 部署（推荐）

#### 步骤 1：配置环境变量

```bash
# 复制生产环境模板
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production

# 编辑生产配置
nano .env.production
nano backend/.env.production
```

**关键生产环境设置：**
- 设置强密码的 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`（64+ 字符）
- 配置生产数据库 URL
- 设置 Cloudinary 凭据
- 配置 SMTP 邮件功能
- 设置安全的管理员凭据

#### 步骤 2：使用 Docker Compose 部署

```bash
# 构建并启动所有服务（包含 MySQL 和 MongoDB）
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 检查服务状态
docker-compose ps
```

#### 步骤 3：初始化生产数据库

```bash
# 创建管理员账号（必需）
docker-compose exec backend npm run init:admin admin@yourdomain.com SecurePassword123!

# 设置数据库索引（必需）
docker-compose exec backend npm run setup-indexes

# 检查数据一致性（可选）
docker-compose exec backend npm run check-consistency
```

**访问地址：**
- 前端：http://localhost:5060
- 后端 API：http://localhost:3020
- 管理后台：http://localhost:5060/admin
- MySQL：localhost:3307
- MongoDB：localhost:27018

#### 替代方案：从 Docker Hub 快速启动

```bash
# 从 Docker Hub 拉取并运行
docker run -d -p 5060:80 --name blogkk caleb333/blogkk:latest

# 查看日志
docker logs -f blogkk
```

访问 http://localhost:5060

### 🔒 生产环境安全

**重要安全实践：**

1. **强凭据**
   ```bash
   # 生成安全的 JWT 密钥
   openssl rand -base64 64
   ```

2. **环境变量**
   - 永远不要将 `.env` 文件提交到版本控制
   - 为所有服务使用强且唯一的密码
   - 定期轮换密钥（每 90 天）

3. **数据库安全**
   - 使用强数据库密码
   - 启用数据库认证
   - 配置 IP 白名单（云数据库）
   - 定期备份（建议每天）

4. **SSL/HTTPS**
   - 生产环境必须使用 HTTPS
   - 配置 SSL 证书（推荐 Let's Encrypt）
   - 设置正确的 CORS 策略

5. **管理员访问**
   - 使用强管理员密码（12+ 字符）
   - 如果可用，启用 2FA
   - 限制管理员访问到可信 IP
   - 监控管理员活动日志

### ⚠️ 生产环境警告

❌ **不要**在生产环境运行 `npm run seed` - 它会添加测试数据！  
❌ **不要**使用默认凭据（admin@example.com / admin123）  
❌ **不要**公开暴露数据库端口  
❌ **不要**使用开发环境变量  
✅ **务必**定期备份数据库  
✅ **务必**监控应用日志  
✅ **务必**使用强且唯一的密码  
✅ **务必**启用 HTTPS/SSL  

### 生产环境维护

```bash
# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 重启服务
docker-compose restart

# 更新应用
git pull origin main
docker-compose up -d --build

# 备份数据库
docker-compose exec mysql mysqldump -u root -p portfolio > backup.sql
docker-compose exec mongodb mongodump --out=/backup

# 停止服务
docker-compose down

# 停止并删除所有数据（危险！）
docker-compose down -v
```

## 🎯 项目结构

```
.
├── src/                     # 前端源代码
│   ├── admin/               # 管理后台
│   │   ├── components/      # 管理组件
│   │   ├── context/         # 认证上下文
│   │   └── pages/           # 管理页面
│   ├── api/                 # API 客户端和 hooks
│   │   └── hooks/           # React Query hooks
│   ├── components/          # React 组件
│   ├── hooks/               # 自定义 hooks
│   ├── providers/           # Context providers
│   └── App.tsx              # 主应用组件
├── backend/                 # 后端源代码
│   └── src/
│       ├── config/          # 数据库和应用配置
│       │   └── database.ts  # MySQL 和 MongoDB 连接
│       ├── controllers/     # 路由控制器
│       ├── middleware/      # Express 中间件
│       ├── models/          # TypeORM 实体和 Mongoose schemas
│       │   ├── user.model.ts        # 用户实体 (MySQL)
│       │   ├── project.model.ts     # 项目实体 (MySQL)
│       │   ├── blogPost.model.ts    # 博客实体 (MySQL)
│       │   ├── profile.model.ts     # 个人资料实体 (MySQL)
│       │   └── analytics.model.ts   # 分析 schemas (MongoDB)
│       ├── routes/          # API 路由
│       ├── services/        # 业务逻辑
│       ├── scripts/         # CLI 脚本
│       │   ├── init-admin.ts        # 初始化管理员
│       │   ├── seed-data.ts         # 填充测试数据
│       │   └── migrate-to-mysql.ts  # 数据迁移工具
│       └── utils/           # 工具函数
├── docker-compose.yml       # 生产环境 Docker 配置
├── docker-compose.dev.yml   # 开发环境 Docker 配置
└── package.json             # 项目配置
```

## 🗄️ 数据库架构

### MySQL（结构化数据）
- **Users** - 管理员账号，JWT 认证
- **RefreshTokens** - 令牌管理，安全会话
- **Profiles** - 个人信息和技能
- **Projects** - 作品集项目和图片
- **BlogPosts** - 博客文章，支持 Markdown
- **ContactMessages** - 联系表单提交
- **Newsletters** - 邮件订阅

### MongoDB（分析数据）
- **PageViews** - 访客追踪，支持会话
- **ProjectInteractions** - 项目浏览、点赞、分享
- **FileMetadata** - 上传文件信息
- **SystemLogs** - 应用日志，TTL 自动清理

## 🔧 自定义配置

### 更新个人信息

**方式一：使用管理后台（推荐）**

1. 访问管理后台 `/admin`
2. 使用管理员凭据登录
3. 导航到"个人资料"编辑个人信息
4. 导航到"项目"管理作品集
5. 导航到"博客"撰写文章

**方式二：直接编辑文件（静态内容）**

编辑以下文件更新静态内容：

- `src/components/HeroSection.tsx` - 主标题和副标题
- `src/components/AboutSection.tsx` - 技能和时间线
- `src/components/ProjectsSection.tsx` - 项目列表
- `src/components/ContactSection.tsx` - 联系信息和社交链接

### 修改主题颜色

在 `tailwind.config.js` 中编辑颜色配置：

```js
colors: {
  primary: { ... },  // 主色
  accent: { ... },   // 强调色
}
```

## 🧪 测试

```bash
# 运行后端测试
cd backend
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- auth.service.test.ts
```

项目使用：
- **Jest** - 测试框架
- **fast-check** - 属性测试
- **SQLite** - 测试用内存数据库
- **mongodb-memory-server** - 测试用内存 MongoDB

---

## 📋 环境对比

| 功能 | 开发环境 | 生产环境 |
|------|---------|---------|
| **前端端口** | 5050 | 5060 |
| **后端端口** | 3010 | 3020 |
| **MySQL 端口** | 3308 | 3307 |
| **MongoDB 端口** | 27019 | 27018 |
| **数据库名称** | portfolio_dev | portfolio |
| **热重载** | ✅ 启用 | ❌ 禁用 |
| **调试日志** | ✅ 详细 | ⚠️ 最小 |
| **Seed 脚本** | ✅ 允许 | 🚫 阻止 |
| **JWT 过期** | 1 小时 | 15 分钟 |
| **HTTPS** | ❌ 可选 | ✅ 必需 |
| **代码压缩** | ❌ 否 | ✅ 是 |

---

## 🔧 管理脚本

后端包含多个数据库操作管理脚本：

```bash
# 初始化管理员账号
npm run init:admin [email] [password]

# 填充测试数据（仅开发环境）
npm run seed

# 强制在生产环境填充（不推荐）
npm run seed:prod

# 设置数据库索引
npm run setup-indexes

# 检查数据一致性
npm run check-consistency

# 从 MongoDB 迁移数据到 MySQL
npm run migrate
```

详细脚本文档请参阅 [backend/SCRIPTS.md](backend/SCRIPTS.md)

## 📝 生产部署

详细部署说明请参阅 [DEPLOYMENT.md](DEPLOYMENT.md)。

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/Besta0/blogkk.git
cd blogkk

# 2. 配置环境变量
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production

# 3. 使用 Docker Compose 部署
docker-compose up -d --build

# 4. 初始化管理员账号
docker-compose exec backend npm run init-admin
```

### 云平台

| 平台 | 前端 | 后端 | 数据库 |
|------|------|------|--------|
| Vercel | ✅ | ❌ | ❌ |
| Railway | ✅ | ✅ | ✅ MySQL & MongoDB |
| AWS | ✅ | ✅ | ✅ RDS & DocumentDB |
| DigitalOcean | ✅ | ✅ | ✅ 托管数据库 |

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Framer Motion](https://www.framer.com/motion/) - 强大的动画库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [TypeORM](https://typeorm.io/) - TypeScript MySQL ORM
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM

<div align="center">

⭐ 如果这个项目对你有帮助，请给它一个 star！

Made with ❤️ by [Caleb Tan](https://github.com/Besta0)

</div>
