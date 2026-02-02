# Middleware Documentation

This directory contains all middleware functions used in the backend API. The middleware is organized into three main categories: CORS handling, request logging, and error handling.

## Overview

The middleware stack is applied in the following order in `app.ts`:

1. **Request Tracking** - Adds unique IDs and tracks response time
2. **CORS** - Handles cross-origin requests
3. **Logging** - Logs all incoming requests
4. **Body Parsing** - Parses JSON and URL-encoded bodies
5. **Routes** - Application routes
6. **404 Handler** - Catches undefined routes
7. **Error Handler** - Global error handling

## Middleware Components

### CORS Middleware (`cors.middleware.ts`)

Handles Cross-Origin Resource Sharing (CORS) configuration.

**Validates: Requirement 1.4 - Correct CORS policy configuration**

#### Features:
- Configurable allowed origins based on environment
- Supports credentials (cookies, authentication headers)
- Handles preflight OPTIONS requests
- Custom CORS error handling

#### Configuration:
```typescript
// Allowed origins are configured via environment variables
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

#### Exports:
- `corsMiddleware` - Main CORS middleware
- `corsErrorHandler` - Handles CORS-specific errors

### Logger Middleware (`logger.middleware.ts`)

Provides comprehensive request logging and tracking.

#### Features:
- Request ID generation for tracking
- Response time measurement
- Configurable log formats (dev/production)
- Slow request detection (> 1000ms)
- Detailed request logging in development

#### Exports:
- `requestLogger` - Morgan-based HTTP request logger
- `requestIdMiddleware` - Adds unique ID to each request
- `responseTimeMiddleware` - Tracks and logs response time
- `detailedRequestLogger` - Detailed logging for development

#### Headers Added:
- `X-Request-ID` - Unique identifier for each request
- `X-Response-Time` - Time taken to process request (in ms)

### Error Middleware (`error.middleware.ts`)

Comprehensive error handling system.

**Validates: Requirement 1.5 - Graceful error handling with user-friendly messages**

#### Features:
- Custom `ApiError` class for operational errors
- Consistent error response format
- Environment-aware error details
- Database error conversion
- Unhandled rejection/exception handlers

#### ApiError Class:
```typescript
new ApiError(
  statusCode: number,
  message: string,
  code?: string,
  details?: any,
  isOperational?: boolean
)
```

#### Error Response Format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-24T12:00:00.000Z",
    "requestId": "unique-request-id",
    "stack": "Error stack (development only)"
  }
}
```

#### HTTP Status Codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

#### Exports:
- `ApiError` - Custom error class
- `errorHandler` - Global error handling middleware
- `notFoundHandler` - 404 handler for undefined routes
- `asyncHandler` - Wrapper for async route handlers
- `validationErrorHandler` - Handles validation errors
- `databaseErrorHandler` - Converts database errors to ApiErrors
- `unhandledRejectionHandler` - Handles unhandled promise rejections
- `uncaughtExceptionHandler` - Handles uncaught exceptions

## Usage Examples

### Using ApiError in Routes:
```typescript
import { ApiError, asyncHandler } from './middleware';

// Throw an error
app.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }
  
  res.json({ success: true, data: user });
}));
```

### Using asyncHandler:
```typescript
// Automatically catches errors in async functions
app.post('/data', asyncHandler(async (req, res) => {
  const result = await someAsyncOperation();
  res.json({ success: true, data: result });
}));
```

### Accessing Request ID:
```typescript
app.get('/test', (req, res) => {
  const requestId = (req as any).id;
  console.log(`Processing request ${requestId}`);
  res.json({ requestId });
});
```

## Testing

All middleware components are thoroughly tested:

- **Unit Tests**: `middleware/__tests__/middleware.test.ts`
- **Integration Tests**: `__tests__/app.integration.test.ts`

Run tests:
```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

## Environment Variables

The middleware uses the following environment variables:

- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Primary frontend URL for CORS
- `ALLOWED_ORIGINS` - Comma-separated list of additional allowed origins

## Best Practices

1. **Always use ApiError for operational errors** - This ensures consistent error responses
2. **Use asyncHandler for async routes** - Automatically catches and forwards errors
3. **Include meaningful error codes** - Makes debugging easier
4. **Add details in development** - But hide sensitive info in production
5. **Log appropriately** - Use console.warn for operational errors, console.error for programming errors

## Future Enhancements

- Rate limiting middleware
- Request validation middleware (express-validator/joi)
- Authentication middleware (JWT verification)
- API versioning middleware
- Request sanitization middleware
- Compression middleware
