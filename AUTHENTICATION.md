# Authentication System Documentation

## Overview

This authentication system implements a secure, modern authentication flow using FastAPI (backend) and React (frontend) with Google OAuth integration.

## Features

### ✅ Security Features

- **HttpOnly Cookies**: JWT tokens are stored in HttpOnly cookies to prevent XSS attacks
- **Refresh Token Pattern**: Automatic token refresh with secure token rotation
- **CSRF Protection**: Built-in protection through SameSite cookie attributes
- **Secure Cookie Settings**: Proper secure, httponly, and samesite attributes

### ✅ Google OAuth Integration

- **Automatic Popup Detection**: Checks if user has Google session before showing popup
- **Intent-based Flow**: Separate login/register flows with proper error handling
- **Secure Redirect Handling**: Proper state management and error handling

### ✅ User Experience

- **Automatic Authentication**: Seamless authentication state management
- **Loading States**: Proper loading indicators during authentication checks
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Route Protection**: Automatic redirection for unauthenticated users

## Architecture

### Frontend Components

#### AuthContext (`src/contexts/AuthContext.jsx`)

- Manages global authentication state
- Handles automatic token refresh
- Provides authentication methods to components

#### ProtectedRoute (`src/components/ProtectedRoute.jsx`)

- Wraps protected components
- Redirects unauthenticated users to login
- Shows loading state during authentication checks

#### Login Component (`src/components/Login.jsx`)

- Handles both email/password and Google OAuth login
- Automatically detects Google session and triggers popup
- Displays appropriate error messages

### Backend Endpoints

#### Authentication Endpoints

- `POST /auth/` - User registration
- `POST /auth/token` - Email/password login
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout and clear cookies
- `POST /auth/refresh` - Refresh access token

#### Google OAuth Endpoints

- `GET /auth/google/login` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Handle OAuth callback
- `GET /auth/google/client-id` - Get Google client ID for frontend

## Google OAuth Flow

### 1. Session Detection

```javascript
// Frontend checks if user has Google session
const hasGoogleSession = await checkGoogleSignInState();
if (hasGoogleSession) {
  // Automatically trigger Google login popup
  googleLogin();
}
```

### 2. OAuth Flow

1. User clicks "Continue with Google" or popup opens automatically
2. Frontend redirects to `/auth/google/login?intent=login`
3. Backend redirects to Google OAuth with proper state
4. Google redirects back to `/auth/google/callback`
5. Backend processes OAuth response and sets HttpOnly cookies
6. User is redirected to frontend with authentication complete

### 3. Cookie Management

- `access_token`: JWT access token (HttpOnly, secure)
- `refresh_token`: JWT refresh token (HttpOnly, secure)
- `user_email`: User email for display (non-HttpOnly)
- `user_type`: 'new' or 'existing' user (non-HttpOnly)

## Security Considerations

### Cookie Security

- All sensitive tokens use HttpOnly cookies
- Secure flag enabled in production
- SameSite=lax for CSRF protection
- Proper expiration times

### Token Management

- Access tokens expire in 30 minutes (configurable)
- Refresh tokens expire in 30 days (configurable)
- Automatic token refresh on 401 responses
- Proper token revocation on logout

### OAuth Security

- State parameter for CSRF protection
- Intent-based flow to prevent account hijacking
- Proper error handling for OAuth failures
- Secure redirect URI validation

## Usage Examples

### Using AuthContext

```javascript
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes

```javascript
import { ProtectedRoute } from "../components/ProtectedRoute";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});
```

### Google OAuth Integration

```javascript
import { googleLogin, checkGoogleSignInState } from "../api/auth";

// Check for existing Google session
const hasSession = await checkGoogleSignInState();
if (hasSession) {
  googleLogin(); // Opens popup automatically
}
```

## Environment Variables

### Backend (.env)

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
JWT_SECRET_KEY=your_jwt_secret_key
SECRET_KEY=your_app_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

- API URL: `http://localhost:8000` (configurable in `src/api/auth.js`)
- Google Identity Services script loaded in `index.html`

## Error Handling

### Common Error Scenarios

1. **Token Expired**: Automatic refresh attempt, redirect to login if failed
2. **OAuth Failure**: User-friendly error messages with retry options
3. **Network Errors**: Graceful degradation with retry mechanisms
4. **Invalid Credentials**: Clear error messages for user feedback

### Error Messages

- "This email is already registered. Please login instead."
- "Google authentication failed. Please try again."
- "Authentication failed. Please try again."

## Best Practices

1. **Never store tokens in localStorage** - Use HttpOnly cookies only
2. **Always validate tokens on the backend** - Don't trust client-side validation
3. **Implement proper error handling** - Provide clear feedback to users
4. **Use HTTPS in production** - Secure cookie transmission
5. **Regular security audits** - Monitor authentication events
6. **Rate limiting** - Prevent brute force attacks
7. **Logging** - Track authentication events for security monitoring
