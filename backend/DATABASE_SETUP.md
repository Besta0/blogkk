# Database Setup Guide

This project uses a **hybrid database architecture** with MySQL and MongoDB:

## Architecture Overview

### MySQL (Structured Data)
Used for data with well-defined schemas and relationships:
- **Users** - Authentication and user management
- **Profiles** - User profile information
- **Projects** - Portfolio projects
- **BlogPosts** - Blog articles
- **ContactMessages** - Contact form submissions
- **Newsletters** - Email subscriptions
- **RefreshTokens** - JWT refresh tokens

### MongoDB (Unstructured/Semi-structured Data)
Used for flexible, document-based data:
- **PageViews** - Analytics page view tracking
- **ProjectInteractions** - Project views, likes, shares
- **FileMetadata** - Uploaded file information
- **SystemLogs** - Application logs

## Development Setup

### Using Docker (Recommended)

```bash
# Start all services (MySQL, MongoDB, Backend)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Seed the database
docker-compose -f docker-compose.dev.yml exec backend npm run seed

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Local Setup

1. **Install MySQL 8.0+**
   ```bash
   # macOS
   brew install mysql
   brew services start mysql
   
   # Create database
   mysql -u root -e "CREATE DATABASE portfolio;"
   ```

2. **Install MongoDB 7.0+**
   ```bash
   # macOS
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run Backend**
   ```bash
   npm install
   npm run dev
   ```

## Environment Variables

```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=portfolio

# MongoDB
MONGODB_URI=mongodb://localhost:27017/portfolio_analytics
```

## Database Scripts

```bash
# Seed sample data
npm run seed

# Create admin user
npm run init-admin [email] [password]

# Setup indexes
npm run setup-indexes

# Check database consistency
npm run check-consistency
```

## Testing

Tests use in-memory databases:
- **MySQL**: SQLite in-memory (via better-sqlite3)
- **MongoDB**: mongodb-memory-server

```bash
npm test
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        Backend API                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   MySQL (TypeORM)   │    │  MongoDB (Mongoose) │        │
│  │                     │    │                     │        │
│  │  • Users            │    │  • PageViews        │        │
│  │  • Profiles         │    │  • Interactions     │        │
│  │  • Projects         │    │  • FileMetadata     │        │
│  │  • BlogPosts        │    │  • SystemLogs       │        │
│  │  • ContactMessages  │    │                     │        │
│  │  • Newsletters      │    │                     │        │
│  │  • RefreshTokens    │    │                     │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Why Hybrid Architecture?

1. **MySQL for Structured Data**
   - ACID compliance for critical data
   - Strong relationships between entities
   - Complex queries with JOINs
   - Data integrity constraints

2. **MongoDB for Analytics/Logs**
   - Flexible schema for varying data
   - High write throughput
   - Easy horizontal scaling
   - Time-series data optimization
   - Automatic TTL for log cleanup
