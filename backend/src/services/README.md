# Services

This directory contains business logic services for the portfolio backend API.

## Authentication Service

The `AuthService` provides JWT-based authentication functionality including:

### Features

- **JWT Token Generation**: Creates access and refresh tokens
- **Token Verification**: Validates JWT tokens
- **Login/Logout**: User authentication flow
- **Token Refresh**: Automatic token renewal mechanism
- **Token Revocation**: Secure logout with token blacklisting

### Usage

#### Login
```typescript
import { AuthService } from './services';

const { user, tokens } = await AuthService.login(email, password);
// Returns: { user, tokens: { accessToken, refreshToken } }
```

#### Verify Token
```typescript
const payload = AuthService.verifyAccessToken(token);
// Returns: { id, email, role }
```

#### Refresh Token
```typescript
const newTokens = await AuthService.refreshAccessToken(refreshToken);
// Returns: { accessToken, refreshToken }
```

#### Logout
```typescript
await AuthService.logout(refreshToken);
// Revokes the refresh token
```

### Token Configuration

Tokens are configured via environment variables:

- `JWT_SECRET`: Secret key for access tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `JWT_EXPIRES_IN`: Access token expiration (default: 1h)
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration (default: 7d)

### Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt before storage
2. **Token Rotation**: Refresh tokens are rotated on each refresh
3. **Token Revocation**: Old refresh tokens are revoked after use
4. **Automatic Cleanup**: Expired tokens are automatically removed from database

### Database Models

#### User Model
- email (unique, required)
- password (hashed, required)
- role (admin/user)
- timestamps

#### RefreshToken Model
- token (unique, required)
- userId (reference to User)
- expiresAt (automatic expiration)
- isRevoked (revocation flag)
- timestamps

### API Endpoints

See `routes/auth.routes.ts` for available endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Testing

Run tests with:
```bash
npm test -- auth.service.test.ts
npm test -- auth.controller.test.ts
```

### Maintenance

Run periodic cleanup of expired tokens:
```typescript
const deletedCount = await AuthService.cleanupExpiredTokens();
```

This can be scheduled as a cron job or background task.
