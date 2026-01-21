<a id="personal-portfolio-website"></a>
# 🚀 Personal Portfolio Website

<div align="center">

[English](#personal-portfolio-website) | [中文](#个人作品集网站)

A stunning, interactive personal portfolio website built with React + TypeScript + Framer Motion.

</div>

<div align="center">

### 📌 Version & Docker Pulls

[![Version](https://img.shields.io/github/package-json/v/Besta0/blogkk?style=flat-square)](https://github.com/Besta0/blogkk)
[![Docker Pulls](https://img.shields.io/docker/pulls/caleb333/blogkk?style=flat-square)](https://hub.docker.com/r/caleb333/blogkk)

</div>

<div align="center">

[Live Demo](#) • [Documentation](#) • [Report Bug](https://github.com/Besta0/blogkk/issues) • [Request Feature](https://github.com/Besta0/blogkk/issues)

</div>

---

## ✨ Features

- 🎨 **Stunning Visual Effects** - Gradients, glassmorphism, 3D animations
- 🖱️ **Rich Interactions** - Magnetic buttons, scroll animations
- 🌓 **Dark/Light Theme** - Theme switching support
- 📱 **Responsive Design** - Perfect adaptation to all devices
- ⚡ **Performance Optimized** - Built with Vite for fast loading
- 🐳 **Docker Support** - One-click deployment

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling Framework
- **Framer Motion** - Animation Library
- **Lucide React** - Icon Library
- **Docker** - Containerization

## 📦 Installation & Running

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Deployment

#### Option 1: Quick Start with Docker Hub (Easiest)

```bash
# Pull and run from Docker Hub
docker run -d -p 3030:80 --name blogkk caleb333/blogkk:latest

# View logs
docker logs -f blogkk

# Stop container
docker stop blogkk
docker rm blogkk
```

Visit http://localhost:3030

#### Option 2: Using Docker Compose (Recommended for Development)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop service
docker-compose down
```

Visit http://localhost:3030

#### Option 3: Build from Source

```bash
# Build image
docker build -t blogkk .

# Run container
docker run -d -p 3030:80 --name blogkk blogkk

# View logs
docker logs -f blogkk

# Stop container
docker stop blogkk
docker rm blogkk
```

## 🎯 Project Structure

```
.
├── src/
│   ├── components/          # React Components
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── HeroSection.tsx  # Hero section
│   │   ├── AboutSection.tsx # About section
│   │   ├── ProjectsSection.tsx # Projects showcase
│   │   ├── ContactSection.tsx  # Contact form
│   │   └── MagneticButton.tsx  # Magnetic button component
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry file
│   └── index.css            # Global styles
├── public/                  # Static assets
├── Dockerfile               # Docker build file
├── docker-compose.yml       # Docker Compose config
├── nginx.conf               # Nginx config
└── package.json             # Project config
```

## 🎨 Customization

### Update Personal Information

Edit the following files to update your personal information:

- `src/components/HeroSection.tsx` - Modify main title and subtitle
- `src/components/AboutSection.tsx` - Modify skills and timeline
- `src/components/ProjectsSection.tsx` - Modify project list
- `src/components/ContactSection.tsx` - Modify contact info and social links

### Modify Theme Colors

Edit color configuration in `tailwind.config.js`:

```js
colors: {
  primary: { ... },  // Primary color
  accent: { ... },    // Accent color
}
```

### Modify Port

Modify port mapping in `docker-compose.yml`:

```yaml
ports:
  - "your-port:80"
```

## 📝 Production Deployment

### Vercel / Netlify

1. Push code to GitHub
2. Import project in Vercel/Netlify
3. Build command: `npm run build`
4. Output directory: `dist`

### Self-hosted Server

```bash
# 1. Clone repository
git clone https://github.com/Besta0/blogkk.git
cd blogkk

# 2. Deploy with Docker Compose
docker-compose up -d

# 3. Configure Nginx reverse proxy (optional)
# Edit /etc/nginx/sites-available/default
# Add reverse proxy config pointing to localhost:3030
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Framer Motion](https://www.framer.com/motion/) - Powerful animation library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icon library

<div align="center">

⭐ If this project helped you, please give it a star!

Made with ❤️ by [Caleb Tan](https://github.com/Besta0)

</div>

---

<a id="个人作品集网站"></a>
# 🇨🇳 个人作品集网站

<div align="center">

[English](#personal-portfolio-website) | **中文**

一个炫酷、交互性强的个人作品集网站，使用 React + TypeScript + Framer Motion 构建。

</div>

<div align="center">

### 📌 版本 & Docker 下载次数

[![版本](https://img.shields.io/github/package-json/v/Besta0/blogkk?style=flat-square)](https://github.com/Besta0/blogkk)
[![Docker 下载次数](https://img.shields.io/docker/pulls/caleb333/blogkk?style=flat-square)](https://hub.docker.com/r/caleb333/blogkk)

</div>

<div align="center">

[在线演示](#) • [文档](#) • [报告问题](https://github.com/Besta0/blogkk/issues) • [功能建议](https://github.com/Besta0/blogkk/issues)

</div>

---

## ✨ 特性

- 🎨 **炫酷的视觉效果** - 渐变、玻璃态、3D 动效
- 🖱️ **丰富的交互** - 磁性按钮、滚动动画
- 🌓 **深色/浅色主题** - 支持主题切换
- 📱 **响应式设计** - 完美适配各种设备
- ⚡ **性能优化** - 使用 Vite 构建，快速加载
- 🐳 **Docker 支持** - 一键部署

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Framer Motion** - 动画库
- **Lucide React** - 图标库
- **Docker** - 容器化部署

## 📦 安装和运行

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### Docker 部署

#### 方式一：从 Docker Hub 快速启动（最简单）

```bash
# 从 Docker Hub 拉取并运行
docker run -d -p 3030:80 --name blogkk caleb333/blogkk:latest

# 查看日志
docker logs -f blogkk

# 停止容器
docker stop blogkk
docker rm blogkk
```

访问 http://localhost:3030

#### 方式二：使用 Docker Compose（推荐用于开发）

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问 http://localhost:3030

#### 方式三：从源码构建

```bash
# 构建镜像
docker build -t blogkk .

# 运行容器
docker run -d -p 3030:80 --name blogkk blogkk

# 查看日志
docker logs -f blogkk

# 停止容器
docker stop blogkk
docker rm blogkk
```

## 🎯 项目结构

```
.
├── src/
│   ├── components/          # React 组件
│   │   ├── Navbar.tsx       # 导航栏
│   │   ├── HeroSection.tsx  # 首页 Hero 区域
│   │   ├── AboutSection.tsx # 关于我
│   │   ├── ProjectsSection.tsx # 项目展示
│   │   ├── ContactSection.tsx  # 联系方式
│   │   └── MagneticButton.tsx  # 磁性按钮组件
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── Dockerfile               # Docker 构建文件
├── docker-compose.yml       # Docker Compose 配置
├── nginx.conf               # Nginx 配置
└── package.json             # 项目配置
```

## 🎨 自定义配置

### 修改个人信息

编辑以下文件来更新你的个人信息：

- `src/components/HeroSection.tsx` - 修改主标题和副标题
- `src/components/AboutSection.tsx` - 修改技能和时间线
- `src/components/ProjectsSection.tsx` - 修改项目列表
- `src/components/ContactSection.tsx` - 修改联系方式和社交链接

### 修改主题颜色

编辑 `tailwind.config.js` 中的颜色配置：

```js
colors: {
  primary: { ... },  // 主色调
  accent: { ... },    // 强调色
}
```

### 修改端口

在 `docker-compose.yml` 中修改端口映射：

```yaml
ports:
  - "你的端口:80"
```

## 📝 部署到生产环境

### Vercel / Netlify

1. 将代码推送到 GitHub
2. 在 Vercel/Netlify 中导入项目
3. 构建命令：`npm run build`
4. 输出目录：`dist`

### 自托管服务器

```bash
# 1. 克隆仓库
git clone https://github.com/Besta0/blogkk.git
cd blogkk

# 2. 使用 Docker Compose 部署
docker-compose up -d

# 3. 配置 Nginx 反向代理（可选）
# 编辑 /etc/nginx/sites-available/default
# 添加反向代理配置指向 localhost:3030
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Framer Motion](https://www.framer.com/motion/) - 强大的动画库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Lucide](https://lucide.dev/) - 精美的图标库

<div align="center">

⭐ 如果这个项目对你有帮助，请给个 Star！

由 [Caleb Tan](https://github.com/Besta0) 用 ❤️ 制作

</div>
