# JWT Authentication Implementation

## Overview

This document describes the JWT authentication system implemented for the dynamic portfolio backend API.

## Implementation Summary

### Components Created

1. **Models** (`src/models/`)
   - `user.model.ts` - User schema with password hashing
   - `refreshToken.model.ts` - Refresh token storage with automatic expiration

2. **Services** (`src/services/`)
   - `auth.service.ts` - Core authentication logic
     - Token generation (access & refresh)
     - Token verification
     - Login/logout functionality
     - Token refresh mechanism
     - Token cleanup utilities

3. **Controllers** (`src/controllers/`)
   - `auth.controller.ts` - HTTP request handlers
     - POST /api/auth/login
     - POST /api/auth/refresh
     - POST /api/auth/logout

4. **Routes** (`src/routes/`)
   - `auth.routes.ts` - Authentication endpoints
   - `index.ts` - Route aggregation

5. **Scripts** (`src/scripts/`)
   - `init-admin.ts` - Admin user initialization script

6. **Tests**
   - `services/__tests__/auth.service.test.ts` - 22 unit tests
   - `controllers/__tests__/auth.controller.test.ts` - 9 integration tests

## Features Implemented

### ✅ JWT Token Generation
- Access tokens with configurable expiration (default: 1h)
- Refresh tokens with longer expiration (default: 7d)
- Secure token signing with separate secrets

### ✅ Token Verification
- Access token validation
- Refresh token validation
- Expiration checking
- Revocation checking

### ✅ Login Endpoint
- Email/password authentication
- Password comparison using bcrypt
- Token generation on successful login
- Proper error handling (400, 401)

### ✅ Logout Endpoint
- Refresh token revocation
- Secure logout mechanism
- Graceful handling of invalid tokens

### ✅ Token Refresh Mechanism
- Automatic token rotation
- Old token revocation
- New token generation
- Security against token reuse

### ✅ Security Features
- Password hashing with bcrypt (10 rounds)
- Separate secrets for access and refresh tokens
- Token revocation on logout
- Automatic cleanup of expired tokens
- Protection against token reuse

## API Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### POST /api/auth/refresh
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/logout
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

## Environment Variables

Required environment variables in `.env`:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  email: string (unique, required),
  password: string (hashed, required),
  role: 'admin' | 'user',
  createdAt: Date,
  updatedAt: Date
}
```

### RefreshToken Collection
```typescript
{
  _id: ObjectId,
  token: string (unique, required),
  userId: ObjectId (ref: User),
  expiresAt: Date (indexed for auto-deletion),
  isRevoked: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

All tests passing (31 total):
- ✅ 22 unit tests for AuthService
- ✅ 9 integration tests for AuthController

Run tests:
```bash
npm test -- auth.service.test.ts
npm test -- auth.controller.test.ts
npm test  # Run all tests
```

## Usage

### Initialize Admin User
```bash
npm run init:admin
```

### Start Development Server
```bash
npm run dev
```

### Test Authentication Flow
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Refresh Token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Next Steps

The following tasks are ready to be implemented:

1. **Task 2.2**: Implement authentication middleware for protected routes
2. **Task 2.3**: Implement password reset functionality
3. **Task 2.4**: Write property-based tests for authentication system

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- ✅ **Requirement 7.2**: JWT token generation and management
- ✅ **Requirement 7.3**: Session expiration handling
- ✅ **Requirement 8.1**: RESTful API with JSON responses

## Notes

- Passwords are hashed using bcrypt with 10 salt rounds
- Refresh tokens are automatically cleaned up by MongoDB TTL index
- Token rotation prevents token reuse attacks
- All endpoints follow consistent error response format
- Comprehensive test coverage ensures reliability
