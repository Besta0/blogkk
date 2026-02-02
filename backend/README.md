# Portfolio Backend API

Backend API service for the dynamic portfolio website built with Node.js, Express, and TypeScript.

## Documentation

- [API Documentation](../API_DOCUMENTATION.md) - Complete API reference
- [Deployment Guide](../DEPLOYMENT.md) - Deployment instructions
- [Admin Manual](../ADMIN_MANUAL.md) - Admin dashboard user guide
- [Environment Configuration](../ENV_CONFIGURATION.md) - Environment variables guide

## Features

- RESTful API with Express.js
- TypeScript for type safety
- MongoDB with Mongoose ODM
- JWT authentication with refresh tokens
- File upload with Cloudinary
- Email services (password reset, notifications)
- Rate limiting and security middleware
- Comprehensive error handling
- Analytics and statistics
- ESLint and Prettier for code quality

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB (local or MongoDB Atlas)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration values.

4. Initialize admin account:
```bash
npm run init-admin
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the project for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |
| `npm run clean` | Clean build directory |
| `npm run init-admin` | Initialize admin account |
| `npm run setup-indexes` | Setup database indexes |
| `npm run test-db` | Test database connection |
| `npm test` | Run tests |

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # MongoDB connection
│   ├── cloudinary.ts # Cloudinary setup
│   └── index.ts     # Config exports
├── controllers/     # Route controllers
│   ├── auth.controller.ts
│   ├── profile.controller.ts
│   ├── project.controller.ts
│   ├── blog.controller.ts
│   ├── contact.controller.ts
│   ├── newsletter.controller.ts
│   ├── upload.controller.ts
│   └── analytics.controller.ts
├── middleware/      # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── validation.middleware.ts
│   ├── rateLimit.middleware.ts
│   ├── upload.middleware.ts
│   └── analytics.middleware.ts
├── models/          # Database models
│   ├── user.model.ts
│   ├── profile.model.ts
│   ├── project.model.ts
│   ├── blogPost.model.ts
│   ├── contactMessage.model.ts
│   ├── newsletter.model.ts
│   └── analytics.model.ts
├── routes/          # API routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── scripts/         # CLI scripts
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Environment (development/production) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ADMIN_EMAIL` | Admin account email |
| `ADMIN_PASSWORD` | Admin account password |

## API Endpoints

For complete API documentation, see [API_DOCUMENTATION.md](../API_DOCUMENTATION.md).

### Quick Reference

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/health` | GET | Health check | Public |
| `/api/auth/login` | POST | User login | Public |
| `/api/auth/refresh` | POST | Refresh token | Public |
| `/api/auth/logout` | POST | User logout | Public |
| `/api/auth/forgot-password` | POST | Request password reset | Public |
| `/api/auth/reset-password` | POST | Reset password | Public |
| `/api/profile` | GET | Get profile | Public |
| `/api/profile` | PUT/PATCH | Update profile | Admin |
| `/api/projects` | GET | List projects | Public |
| `/api/projects` | POST | Create project | Admin |
| `/api/projects/:id` | PUT | Update project | Admin |
| `/api/projects/:id` | DELETE | Delete project | Admin |
| `/api/projects/:id/like` | POST | Like project | Public |
| `/api/blog/posts/published` | GET | List published posts | Public |
| `/api/blog/posts` | GET | List all posts | Admin |
| `/api/blog/posts` | POST | Create post | Admin |
| `/api/contact` | POST | Submit message | Public |
| `/api/contact` | GET | List messages | Admin |
| `/api/newsletter/subscribe` | POST | Subscribe | Public |
| `/api/upload/image` | POST | Upload image | Admin |
| `/api/analytics/stats` | GET | Get statistics | Admin |

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Server Error |

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=auth
```

## Contributing

1. Follow the existing code style
2. Run `npm run lint` and `npm run format` before committing
3. Ensure all TypeScript types are properly defined
4. Add appropriate error handling for new endpoints
5. Write tests for new functionality