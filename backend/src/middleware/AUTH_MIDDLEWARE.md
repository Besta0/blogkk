# Authentication and Authorization Middleware

This document describes the authentication and authorization middleware implementation for the portfolio backend API.

## Overview

The authentication middleware provides JWT-based authentication and role-based authorization for protecting API routes. It implements requirements 7.1 and 7.4 from the specification.

## Middleware Functions

### `authenticate`

Verifies JWT access token and attaches user information to the request.

**Usage:**
```typescript
import { authenticate } from '../middleware';

router.get('/protected', authenticate, (req: AuthRequest, res) => {
  // req.user contains authenticated user info
  res.json({ user: req.user });
});
```

**Behavior:**
- Extracts JWT token from `Authorization: Bearer <token>` header
- Verifies token signature and expiration
- Attaches decoded user payload to `req.user`
- Returns 401 if token is missing, invalid, or expired

**Error Codes:**
- `AUTH_REQUIRED` (401): No token provided or invalid format
- `TOKEN_INVALID` (401): Token is invalid or expired

### `authorize(...roles)`

Creates middleware to check if authenticated user has required role(s).

**Usage:**
```typescript
import { authorize } from '../middleware';

// Single role
router.delete('/admin/users/:id', authenticate, authorize('admin'), handler);

// Multiple roles
router.get('/content', authenticate, authorize('user', 'admin'), handler);
```

**Behavior:**
- Checks if `req.user` exists (must be used after `authenticate`)
- Verifies user's role matches one of the allowed roles
- Returns 403 if user doesn't have required permissions

**Error Codes:**
- `AUTH_REQUIRED` (401): User not authenticated
- `FORBIDDEN` (403): User lacks required permissions

### `optionalAuth`

Attaches user info if token is present, but doesn't require authentication.

**Usage:**
```typescript
import { optionalAuth } from '../middleware';

router.get('/public', optionalAuth, (req: AuthRequest, res) => {
  if (req.user) {
    // User is authenticated
  } else {
    // User is anonymous
  }
});
```

**Behavior:**
- Attempts to verify token if present
- Silently fails if token is invalid
- Continues request processing regardless of authentication status

### `requireAdmin`

Convenience middleware array for admin-only routes.

**Usage:**
```typescript
import { requireAdmin } from '../middleware';

router.post('/admin/settings', requireAdmin, handler);
// Equivalent to: authenticate + authorize('admin')
```

### `requireUser`

Convenience middleware array for authenticated user routes (both users and admins).

**Usage:**
```typescript
import { requireUser } from '../middleware';

router.get('/profile', requireUser, handler);
// Equivalent to: authenticate + authorize('user', 'admin')
```

## Request Type

Use the `AuthRequest` type for route handlers that use authentication:

```typescript
import { AuthRequest } from '../middleware';

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  const userRole = req.user.role;
  // ...
});
```

## Example Routes

### Protected Profile Routes

```typescript
import { Router } from 'express';
import { AuthRequest, requireAdmin, requireUser, optionalAuth } from '../middleware';

const router = Router();

// User or Admin can access
router.get('/me', requireUser, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Admin only
router.get('/admin', requireAdmin, (req: AuthRequest, res) => {
  res.json({ message: 'Admin area', user: req.user });
});

// Public with optional auth
router.get('/public', optionalAuth, (req: AuthRequest, res) => {
  res.json({
    authenticated: !!req.user,
    user: req.user || null,
  });
});

export default router;
```

## HTTP Status Codes

The middleware follows standard HTTP status codes:

- **200 OK**: Request successful
- **401 Unauthorized**: Authentication required or token invalid
  - Missing token
  - Invalid token format
  - Expired token
  - Invalid signature
- **403 Forbidden**: Authenticated but insufficient permissions
  - User role doesn't match required role(s)

## Error Response Format

All authentication errors follow the standard API error format:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required",
    "timestamp": "2026-01-24T15:42:18.000Z"
  }
}
```

## Testing

The middleware includes comprehensive unit and integration tests:

- **Unit Tests**: `src/middleware/__tests__/auth.middleware.test.ts`
  - Tests individual middleware functions
  - Mocks AuthService for isolated testing
  
- **Integration Tests**: `src/__tests__/auth.integration.test.ts`
  - Tests complete authentication flow
  - Uses real database and JWT tokens
  - Tests protected routes with actual HTTP requests

Run tests:
```bash
npm test -- auth.middleware.test.ts
npm test -- auth.integration.test.ts
```

## Security Considerations

1. **Token Storage**: Tokens should be stored securely on the client (e.g., httpOnly cookies or secure storage)
2. **HTTPS**: Always use HTTPS in production to prevent token interception
3. **Token Expiration**: Access tokens expire after 1 hour by default
4. **Refresh Tokens**: Use refresh tokens to obtain new access tokens
5. **Rate Limiting**: Consider adding rate limiting to prevent brute force attacks

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 7.1**: User access to admin panel requires login verification
  - Implemented via `authenticate` middleware
  - Returns 401 for unauthenticated requests

- **Requirement 7.4**: When user has insufficient permissions, return 403 status code
  - Implemented via `authorize` middleware
  - Returns 403 when user role doesn't match required role(s)

## Next Steps

To use this middleware in your routes:

1. Import the required middleware functions
2. Apply `authenticate` to routes that require authentication
3. Add `authorize` to routes that require specific roles
4. Use `optionalAuth` for public routes that benefit from user context
5. Use convenience arrays `requireAdmin` or `requireUser` for common patterns
