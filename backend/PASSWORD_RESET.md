# Password Reset Implementation

## Overview

This document describes the password reset functionality implemented for the portfolio backend API.

## Features

1. **Request Password Reset**: Users can request a password reset by providing their email address
2. **Email Notification**: Users receive an email with a secure reset link
3. **Token Verification**: Reset tokens are validated before allowing password changes
4. **Secure Token Storage**: Tokens are hashed before storage in the database
5. **Token Expiration**: Reset tokens expire after 1 hour
6. **Confirmation Email**: Users receive a confirmation email after successful password reset
7. **Session Invalidation**: All refresh tokens are revoked after password reset

## API Endpoints

### 1. Request Password Reset

**Endpoint**: `POST /api/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "If the email exists, a password reset link has been sent"
  }
}
```

**Notes**:
- Always returns success to prevent email enumeration attacks
- Only sends email if the user exists in the database

### 2. Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired reset token",
    "timestamp": "2026-01-25T06:21:46.000Z"
  }
}
```

### 3. Verify Reset Token

**Endpoint**: `GET /api/auth/verify-reset-token/:token`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

## Security Features

1. **Token Hashing**: Reset tokens are hashed using SHA-256 before storage
2. **Token Expiration**: Tokens expire after 1 hour
3. **One-Time Use**: Tokens are cleared after successful password reset
4. **Session Invalidation**: All refresh tokens are revoked after password reset
5. **Email Enumeration Prevention**: Same response for existing and non-existing users
6. **Password Validation**: Minimum 6 characters required

## Email Configuration

Configure the following environment variables in `.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Portfolio Website

# Frontend URL for reset links
FRONTEND_URL=http://localhost:5173
```

## Database Schema

The User model includes the following fields for password reset:

```typescript
{
  resetPasswordToken?: string;      // Hashed token
  resetPasswordExpires?: Date;      // Expiration timestamp
}
```

## Usage Flow

1. User clicks "Forgot Password" on the login page
2. User enters their email address
3. System generates a secure token and sends an email
4. User clicks the link in the email
5. User is redirected to reset password page with token in URL
6. User enters new password
7. System validates token and updates password
8. User receives confirmation email
9. All existing sessions are invalidated
10. User can log in with new password

## Testing

Run the password reset tests:

```bash
npm test -- --testPathPatterns="auth"
```

All password reset functionality is covered by:
- Unit tests in `src/services/__tests__/auth.service.test.ts`
- Integration tests in `src/__tests__/auth.integration.test.ts`

## Error Handling

| Error Code | Status | Description |
|------------|--------|-------------|
| VALIDATION_ERROR | 400 | Missing or invalid input |
| INVALID_TOKEN | 400 | Invalid or expired reset token |
| TOKEN_INVALID | 401 | Invalid authentication token |

## Implementation Details

### Token Generation

```typescript
const resetToken = crypto.randomBytes(32).toString('hex');
const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
```

### Token Validation

```typescript
const user = await User.findOne({
  resetPasswordToken: hashedToken,
  resetPasswordExpires: { $gt: new Date() }
});
```

### Email Templates

The system sends two types of emails:
1. **Password Reset Email**: Contains the reset link
2. **Confirmation Email**: Confirms successful password reset

Both emails use HTML templates with inline styles for better compatibility.
