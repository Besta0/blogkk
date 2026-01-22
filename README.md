# 🚀 Personal Portfolio Website

<div align="center">

A stunning, interactive personal portfolio website built with React + TypeScript + Framer Motion.

### 📌 Version & Docker Pulls

[![Version](https://img.shields.io/github/package-json/v/Besta0/blogkk?style=flat-square)](https://github.com/Besta0/blogkk)
[![Docker Pulls](https://img.shields.io/docker/pulls/caleb333/blogkk?style=flat-square)](https://hub.docker.com/r/caleb333/blogkk)

[Live Demo](#) • [Documentation](#) • [Report Bug](https://github.com/Besta0/blogkk/issues) • [Request Feature](https://github.com/Besta0/blogkk/issues)

**🌐 Language:** [English](README.md) | [中文](README-zh.md)

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

## � Customization

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