import 'reflect-metadata';
import '@dotenvx/dotenvx/config';
import { connectDatabases, disconnectDatabases, MySQLDataSource } from '../config/database';
import { User, Profile, Project, BlogPost, PageView, ProjectInteraction, FileMetadata, SystemLog } from '../models';
import bcrypt from 'bcryptjs';

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // 安全检查：只在开发环境或明确允许的情况下运行
    const nodeEnv = process.env.NODE_ENV || 'development';
    const allowSeeding = process.env.ALLOW_SEEDING === 'true';
    
    if (nodeEnv === 'production' && !allowSeeding) {
      console.error('❌ Seeding is disabled in production environment!');
      console.log('   To enable seeding in production, set ALLOW_SEEDING=true');
      console.log('   ⚠️  WARNING: This will add test data to your production database!');
      process.exit(1);
    }
    
    if (nodeEnv === 'production' && allowSeeding) {
      console.warn('⚠️  WARNING: Running seed script in PRODUCTION environment!');
      console.warn('   This will add test data to your production database.');
      console.warn('   Press Ctrl+C within 5 seconds to cancel...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log(`📍 Environment: ${nodeEnv}`);
    
    await connectDatabases();
    console.log('✅ Connected to databases');

    // Seed Admin User
    const userRepo = MySQLDataSource.getRepository(User);
    const existingAdmin = await userRepo.findOne({ where: { email: 'admin@example.com' } });
    
    let adminUser: User;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = userRepo.create({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });
      await userRepo.save(adminUser);
      console.log('✅ Admin user created: admin@example.com / admin123');
    } else {
      adminUser = existingAdmin;
      console.log('ℹ️  Admin user already exists');
    }

    // Seed Profile
    const profileRepo = MySQLDataSource.getRepository(Profile);
    const existingProfile = await profileRepo.find({ take: 1 });
    
    if (existingProfile.length === 0) {
      const profile = profileRepo.create({
        name: 'John Doe',
        title: 'Full Stack Developer',
        bio: 'Passionate developer with expertise in React, Node.js, and cloud technologies. I love building scalable applications and learning new technologies.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS', 'MongoDB', 'MySQL', 'GraphQL'],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Senior Full Stack Developer',
            startDate: '2022-01-01',
            description: 'Leading development of microservices architecture and mentoring junior developers.',
            current: true,
          },
          {
            company: 'StartupXYZ',
            position: 'Full Stack Developer',
            startDate: '2020-03-01',
            endDate: '2021-12-31',
            description: 'Built and maintained multiple web applications using React and Node.js.',
            current: false,
          },
        ],
        social: {
          github: 'https://github.com/johndoe',
          linkedin: 'https://www.linkedin.com/in/johndoe',
          twitter: 'https://twitter.com/johndoe',
          email: 'john@example.com',
        },
      });
      await profileRepo.save(profile);
      console.log('✅ Profile created');
    } else {
      console.log('ℹ️  Profile already exists');
    }

    // Seed Projects
    const projectRepo = MySQLDataSource.getRepository(Project);
    const existingProjects = await projectRepo.count();
    
    let projectIds: string[] = [];
    if (existingProjects === 0) {
      const projects = [
        {
          title: 'E-Commerce Platform',
          description: 'A full-featured e-commerce platform with real-time inventory management, payment processing, and admin dashboard.',
          technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
          images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'],
          githubUrl: 'https://github.com/johndoe/ecommerce',
          liveUrl: 'https://ecommerce-demo.example.com',
          featured: true,
        },
        {
          title: 'Task Management App',
          description: 'A collaborative task management application with real-time updates, team workspaces, and Kanban boards.',
          technologies: ['Vue.js', 'Express', 'PostgreSQL', 'Socket.io'],
          images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800'],
          githubUrl: 'https://github.com/johndoe/taskmanager',
          featured: true,
        },
        {
          title: 'Weather Dashboard',
          description: 'A beautiful weather dashboard with 7-day forecasts, interactive maps, and location-based alerts.',
          technologies: ['React', 'TypeScript', 'OpenWeather API', 'Chart.js'],
          images: ['https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800'],
          githubUrl: 'https://github.com/johndoe/weather',
          liveUrl: 'https://weather-demo.example.com',
          featured: true,
        },
        {
          title: 'Blog Platform',
          description: 'A modern blogging platform with markdown support, SEO optimization, and social sharing features.',
          technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
          images: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'],
          githubUrl: 'https://github.com/johndoe/blog-platform',
          featured: false,
        },
        {
          title: 'Fitness Tracker',
          description: 'A comprehensive fitness tracking app with workout plans, progress charts, and social challenges.',
          technologies: ['React Native', 'Firebase', 'Node.js', 'TensorFlow'],
          images: ['https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800'],
          githubUrl: 'https://github.com/johndoe/fitness-tracker',
          featured: true,
        },
        {
          title: 'AI Chat Assistant',
          description: 'An intelligent chatbot powered by GPT with custom training capabilities and multi-language support.',
          technologies: ['Python', 'FastAPI', 'OpenAI', 'React', 'Docker'],
          images: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'],
          githubUrl: 'https://github.com/johndoe/ai-chat',
          liveUrl: 'https://ai-chat-demo.example.com',
          featured: true,
        },
        {
          title: 'Portfolio Website',
          description: 'A responsive portfolio website with dark mode, animations, and CMS integration.',
          technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
          images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
          githubUrl: 'https://github.com/johndoe/portfolio',
          featured: false,
        },
      ];

      for (const projectData of projects) {
        const project = projectRepo.create(projectData);
        const savedProject = await projectRepo.save(project);
        projectIds.push(savedProject.id);
      }
      console.log(`✅ ${projects.length} projects created`);
    } else {
      const allProjects = await projectRepo.find();
      projectIds = allProjects.map(p => p.id);
      console.log(`ℹ️  ${existingProjects} projects already exist`);
    }

    // Seed Blog Posts
    const blogRepo = MySQLDataSource.getRepository(BlogPost);
    const existingPosts = await blogRepo.count();
    
    if (existingPosts === 0) {
      const posts = [
        {
          title: 'Getting Started with TypeScript in 2024',
          slug: 'getting-started-with-typescript-2024',
          content: `TypeScript has become an essential tool for modern web development. In this comprehensive guide, we'll explore the fundamentals of TypeScript and why it's worth learning in 2024.

## Why TypeScript?

TypeScript adds static typing to JavaScript, which helps catch errors early in the development process. This leads to more maintainable code and better developer experience.

## Setting Up Your Environment

First, install TypeScript globally using npm:

\`\`\`bash
npm install -g typescript
\`\`\`

## Basic Types

TypeScript provides several basic types including string, number, boolean, array, and more. Here's a quick example:

\`\`\`typescript
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;
\`\`\`

## Conclusion

TypeScript is a powerful addition to any JavaScript developer's toolkit. Start using it today to write more robust and maintainable code.`,
          excerpt: 'A comprehensive guide to getting started with TypeScript, covering basic types, interfaces, and best practices for 2024.',
          tags: ['TypeScript', 'JavaScript', 'Web Development'],
          published: true,
          publishedAt: new Date('2024-01-15'),
        },
        {
          title: 'Building Scalable APIs with Node.js',
          slug: 'building-scalable-apis-nodejs',
          content: `Learn how to build production-ready APIs with Node.js and Express. This guide covers best practices for scalability, security, and performance.

## Architecture Overview

A well-designed API architecture is crucial for scalability. We'll use a layered architecture with controllers, services, and repositories.

## Setting Up Express

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());
\`\`\`

## Error Handling

Proper error handling is essential for a robust API. Implement a centralized error handler to manage all errors consistently.

## Conclusion

Building scalable APIs requires careful planning and adherence to best practices. Follow these guidelines to create robust backend services.`,
          excerpt: 'Learn best practices for building production-ready, scalable APIs using Node.js and Express.',
          tags: ['Node.js', 'API', 'Backend'],
          published: true,
          publishedAt: new Date('2024-02-01'),
        },
        {
          title: 'React Performance Optimization Tips',
          slug: 'react-performance-optimization-tips',
          content: `Optimize your React applications for better performance. Learn about memoization, code splitting, and other techniques.

## Understanding Re-renders

React components re-render when their state or props change. Understanding this is key to optimization.

## Using React.memo

\`\`\`jsx
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
\`\`\`

## Code Splitting with React.lazy

\`\`\`jsx
const LazyComponent = React.lazy(() => import('./LazyComponent'));
\`\`\`

## Conclusion

Performance optimization is an ongoing process. Regularly profile your application and apply these techniques where needed.`,
          excerpt: 'Discover essential techniques for optimizing React application performance, including memoization and code splitting.',
          tags: ['React', 'Performance', 'Frontend'],
          published: true,
          publishedAt: new Date('2024-02-15'),
        },
        {
          title: 'Introduction to Docker for Developers',
          slug: 'introduction-to-docker-developers',
          content: `Docker simplifies application deployment by containerizing your applications. Learn the basics of Docker and how to use it in your development workflow.

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers.

## Creating a Dockerfile

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Docker Compose

Docker Compose allows you to define multi-container applications.

## Conclusion

Docker is an essential tool for modern development. Start containerizing your applications today.`,
          excerpt: 'A beginner-friendly introduction to Docker, covering containers, Dockerfiles, and Docker Compose.',
          tags: ['Docker', 'DevOps', 'Containers'],
          published: true,
          publishedAt: new Date('2024-03-01'),
        },
        {
          title: 'Mastering Git Workflows',
          slug: 'mastering-git-workflows',
          content: `Effective Git workflows are essential for team collaboration. Learn about branching strategies and best practices.

## Git Flow

Git Flow is a popular branching model that defines a strict branching structure.

## Feature Branches

\`\`\`bash
git checkout -b feature/new-feature
git push origin feature/new-feature
\`\`\`

## Pull Requests

Pull requests facilitate code review and collaboration.

## Conclusion

Choose a Git workflow that fits your team's needs and stick to it consistently.`,
          excerpt: 'Learn effective Git workflows and branching strategies for better team collaboration.',
          tags: ['Git', 'Version Control', 'Collaboration'],
          published: true,
          publishedAt: new Date('2024-03-15'),
        },
        {
          title: 'CSS Grid vs Flexbox: When to Use Which',
          slug: 'css-grid-vs-flexbox',
          content: `Understanding when to use CSS Grid versus Flexbox can significantly improve your layouts. Let's explore both.

## Flexbox

Flexbox is ideal for one-dimensional layouts - either rows or columns.

\`\`\`css
.container {
  display: flex;
  justify-content: space-between;
}
\`\`\`

## CSS Grid

CSS Grid excels at two-dimensional layouts.

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
\`\`\`

## Conclusion

Use Flexbox for component-level layouts and Grid for page-level layouts.`,
          excerpt: 'A practical guide to choosing between CSS Grid and Flexbox for your layout needs.',
          tags: ['CSS', 'Frontend', 'Web Design'],
          published: true,
          publishedAt: new Date('2024-04-01'),
        },
        {
          title: 'Securing Your Node.js Applications',
          slug: 'securing-nodejs-applications',
          content: `Security is paramount in web development. Learn essential security practices for Node.js applications.

## Input Validation

Always validate and sanitize user input to prevent injection attacks.

## Authentication

Use secure authentication methods like JWT with proper token management.

## HTTPS

Always use HTTPS in production to encrypt data in transit.

## Conclusion

Security should be a priority from the start of development, not an afterthought.`,
          excerpt: 'Essential security practices every Node.js developer should know to protect their applications.',
          tags: ['Security', 'Node.js', 'Backend'],
          published: true,
          publishedAt: new Date('2024-04-15'),
        },
      ];

      for (const postData of posts) {
        const post = blogRepo.create(postData);
        await blogRepo.save(post);
      }
      console.log(`✅ ${posts.length} blog posts created`);
    } else {
      console.log(`ℹ️  ${existingPosts} blog posts already exist`);
    }

    // Seed MongoDB Analytics Data (only if projects exist)
    if (projectIds.length > 0) {
      const existingPageViews = await PageView.countDocuments();
      
      if (existingPageViews === 0) {
        // Seed Page Views
        const pageViews = [
          { page: '/', ip: '192.168.1.1', userAgent: 'Mozilla/5.0', sessionId: 'session-1' },
          { page: '/projects', ip: '192.168.1.2', userAgent: 'Mozilla/5.0', sessionId: 'session-2' },
          { page: '/blog', ip: '192.168.1.3', userAgent: 'Mozilla/5.0', sessionId: 'session-3' },
          { page: '/about', ip: '192.168.1.4', userAgent: 'Mozilla/5.0', sessionId: 'session-4' },
          { page: '/contact', ip: '192.168.1.5', userAgent: 'Mozilla/5.0', sessionId: 'session-5' },
        ];
        
        await PageView.insertMany(pageViews);
        console.log(`✅ ${pageViews.length} page views created`);
      } else {
        console.log(`ℹ️  ${existingPageViews} page views already exist`);
      }

      const existingInteractions = await ProjectInteraction.countDocuments();
      
      if (existingInteractions === 0) {
        // Seed Project Interactions
        const interactions = projectIds.slice(0, 3).flatMap(projectId => [
          { projectId, type: 'view', ip: '192.168.1.1', userAgent: 'Mozilla/5.0', sessionId: 'session-1' },
          { projectId, type: 'like', ip: '192.168.1.2', userAgent: 'Mozilla/5.0', sessionId: 'session-2' },
        ]);
        
        await ProjectInteraction.insertMany(interactions);
        console.log(`✅ ${interactions.length} project interactions created`);
      } else {
        console.log(`ℹ️  ${existingInteractions} project interactions already exist`);
      }

      const existingLogs = await SystemLog.countDocuments();
      
      if (existingLogs === 0) {
        // Seed System Logs
        const logs = [
          { level: 'info', message: 'Application started', source: 'server', metadata: {} },
          { level: 'info', message: 'Database connected', source: 'database', metadata: {} },
          { level: 'warn', message: 'High memory usage detected', source: 'monitor', metadata: { usage: '85%' } },
        ];
        
        await SystemLog.insertMany(logs);
        console.log(`✅ ${logs.length} system logs created`);
      } else {
        console.log(`ℹ️  ${existingLogs} system logs already exist`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabases();
    process.exit(0);
  }
}

seedData();
