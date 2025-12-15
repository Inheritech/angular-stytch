# Stytch Integration Guide for Angular

This guide provides a comprehensive overview of how Stytch Consumer authentication has been integrated into this Angular application, covering both magic link and social login authentication methods.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Details](#implementation-details)
4. [Authentication Flows](#authentication-flows)
5. [Security Considerations](#security-considerations)

## Overview

This application uses **Stytch's prebuilt UI components** for Consumer authentication, which provides:

- **Email Magic Links**: Passwordless authentication via email
- **OAuth Social Login**: Authentication through Google and Microsoft
- **Session Management**: Automatic session handling and persistence
- **Security**: Built-in CSRF protection and secure token handling

### Why Stytch Prebuilt UI?

The prebuilt UI components from Stytch offer several advantages:

1. **Reduced Development Time**: No need to build custom authentication forms
2. **Best Practices**: UI follows security and UX best practices
3. **Consistent Updates**: Stytch maintains and updates the UI components
4. **Customizable**: Supports custom styling to match your brand
5. **Battle-tested**: Used by many production applications

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  User Interface │
│  (Components)   │
└────────┬────────┘
         │
    ┌────▼────────────────┐
    │  Auth Service       │
    │  (Manages Stytch)   │
    └────┬────────────────┘
         │
    ┌────▼──────────────────┐
    │  Stytch SDK           │
    │  (@stytch/vanilla-js) │
    └───────────────────────┘
```

### Component Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/           # Login page with Stytch UI
│   │   ├── authenticate/    # Handles auth callbacks
│   │   └── dashboard/       # Protected dashboard
│   ├── guards/
│   │   └── auth-guard.ts    # Route protection
│   ├── services/
│   │   └── auth.ts          # Authentication service
│   └── environments/
│       └── environment.ts   # Configuration
```

## Implementation Details

### 1. Installation and Setup

#### Package Installation

```bash
npm install @stytch/vanilla-js
```

The `@stytch/vanilla-js` package provides:
- `StytchUIClient`: Client with prebuilt UI components
- `StytchHeadlessClient`: Headless client for custom UI
- Type definitions for TypeScript

#### Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  stytchPublicToken: 'public-token-test-YOUR-PUBLIC-TOKEN-HERE'
};
```

**Important**: Replace with your actual Stytch public token from the [Stytch Dashboard](https://stytch.com/dashboard).

### 2. Authentication Service

The `Auth` service (`src/app/services/auth.ts`) is the core of the authentication system:

```typescript
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private stytch: StytchUIClient;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean>;
  
  // ... implementation
}
```

#### Key Features:

1. **Singleton Service**: Provided at root level, ensuring single instance
2. **Stytch Client Initialization**: Creates `StytchUIClient` with public token
3. **Session Management**: Checks and maintains session state
4. **Observable Pattern**: Exposes authentication state via RxJS Observable

#### Methods:

- `checkSession()`: Verifies current session status
- `logout()`: Revokes the session and updates state
- `getUser()`: Returns current user information
- `isAuthenticated()`: Synchronous authentication status check
- `getStytchClient()`: Provides access to Stytch client
- `updateAuthStatus()`: Updates authentication state

### 3. Login Component

The login component (`src/app/components/login/`) mounts the Stytch prebuilt UI.

#### Key Implementation Points:

**TypeScript** (`login.ts`):

```typescript
ngAfterViewInit() {
  const stytchClient = this.authService.getStytchClient();
  
  stytchClient.mountLogin({
    elementId: 'stytch-container',
    config: {
      products: [Products.emailMagicLinks, Products.oauth],
      emailMagicLinksOptions: {
        loginRedirectURL: `${window.location.origin}/authenticate`,
        signupRedirectURL: `${window.location.origin}/authenticate`,
        // ... more options
      },
      oauthOptions: {
        providers: [
          { type: 'google' },
          { type: 'microsoft' }
        ],
        // ... more options
      }
    },
    styles: { /* custom styling */ },
    callbacks: {
      onSuccess: (message) => {
        this.authService.updateAuthStatus(true);
        this.router.navigate(['/dashboard']);
      },
      onError: (message) => {
        console.error('Stytch error:', message);
      }
    }
  });
}
```

**HTML** (`login.html`):

```html
<div id="stytch-container"></div>
```

The Stytch UI is mounted into this container element.

#### Configuration Options:

1. **Products**: Specify which authentication methods to enable
   - `Products.emailMagicLinks`: Email-based magic links
   - `Products.oauth`: Social login providers

2. **Email Magic Links Options**:
   - `loginRedirectURL`: Where to redirect after magic link click
   - `signupRedirectURL`: Where to redirect after signup
   - `loginExpirationMinutes`: Magic link validity (60 minutes)

3. **OAuth Options**:
   - `providers`: List of OAuth providers (google, microsoft, etc.)
   - `loginRedirectURL`: OAuth callback URL
   - `signupRedirectURL`: OAuth signup callback URL

4. **Styles**: Custom styling for the prebuilt UI
   - `fontFamily`: Custom font
   - `colors.primary`: Primary brand color
   - `container.width`: Container width

5. **Callbacks**:
   - `onSuccess`: Called when authentication succeeds
   - `onError`: Called when an error occurs
   - `onEvent`: Called for various events

### 4. Authenticate Component

The authenticate component (`src/app/components/authenticate/`) handles the authentication callback from both magic links and OAuth.

#### Flow:

1. User clicks magic link or completes OAuth flow
2. Redirected to `/authenticate?token=...&stytch_token_type=...`
3. Component extracts token and type from URL
4. Calls appropriate Stytch API method
5. Updates auth state and redirects to dashboard

```typescript
async ngOnInit() {
  const token = this.route.snapshot.queryParamMap.get('token');
  const stytch_token_type = this.route.snapshot.queryParamMap.get('stytch_token_type');
  
  if (stytch_token_type === 'oauth') {
    await stytchClient.oauth.authenticate(token, {
      session_duration_minutes: 60,
    });
  } else {
    await stytchClient.magicLinks.authenticate(token, {
      session_duration_minutes: 60,
    });
  }
  
  this.authService.updateAuthStatus(true);
  this.router.navigate(['/dashboard']);
}
```

### 5. Dashboard Component

Protected page that displays user information after successful authentication.

Features:
- Displays user details (email, ID, auth method)
- Provides logout functionality
- Protected by `authGuard`

### 6. Auth Guard

The auth guard (`src/app/guards/auth-guard.ts`) protects routes from unauthenticated access:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};
```

Applied to routes:

```typescript
{ path: 'dashboard', component: Dashboard, canActivate: [authGuard] }
```

### 7. Routing Configuration

The application uses Angular's standalone routing:

```typescript
export const routes: Routes = [
  { path: '', component: Login },
  { path: 'authenticate', component: Authenticate },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
```

## Authentication Flows

### Magic Link Flow

1. **User enters email** on login page
2. **Stytch sends magic link** to email
3. **User clicks link** in email
4. **Redirects to `/authenticate`** with token
5. **Authenticate component** validates token
6. **Session created**, user redirected to dashboard

```
User                    App                   Stytch
  │                      │                      │
  ├──Enter Email────────>│                      │
  │                      ├──Send Magic Link────>│
  │                      │                      │
  │<──Email with Link────┼──────────────────────┤
  │                      │                      │
  ├──Click Link─────────>│                      │
  │                      ├──Authenticate Token─>│
  │                      │<──Session Created────┤
  │<──Redirect Dashboard─┤                      │
```

### OAuth Flow

1. **User clicks OAuth button** (Google/Microsoft)
2. **Redirects to OAuth provider**
3. **User authenticates** with provider
4. **Provider redirects back** to `/authenticate` with token
5. **Authenticate component** validates OAuth token
6. **Session created**, user redirected to dashboard

```
User                    App                   OAuth Provider        Stytch
  │                      │                           │                │
  ├──Click OAuth Button─>│                           │                │
  │                      ├──Redirect to Provider────>│                │
  │                      │                           │                │
  │<──OAuth Login Screen─┤                           │                │
  ├──Authenticate────────┼──────────────────────────>│                │
  │                      │                           │                │
  │                      │<──Redirect with Token─────┤                │
  │                      ├──Authenticate Token───────┼───────────────>│
  │                      │<──Session Created─────────┼────────────────┤
  │<──Redirect Dashboard─┤                           │                │
```

## Security Considerations

### 1. Token Security

- Tokens are never stored in localStorage or cookies manually
- Stytch SDK manages session storage securely
- Tokens are transmitted over HTTPS only

### 2. Session Management

- Sessions expire after 60 minutes (configurable)
- Session revocation on logout
- Automatic session refresh by Stytch SDK

### 3. CSRF Protection

- Stytch includes built-in CSRF protection
- State parameter used in OAuth flows

### 4. Environment Variables

- Public token is safe for client-side use
- Never expose secret keys in frontend code
- Use environment-specific configurations

### 5. Route Protection

- Auth guard prevents access to protected routes
- Redirects unauthenticated users to login
- Checks authentication state before rendering

### 6. Best Practices

1. **Always use HTTPS** in production
2. **Set appropriate session durations** based on security requirements
3. **Implement proper error handling** for authentication failures
4. **Monitor authentication events** for suspicious activity
5. **Keep Stytch SDK updated** to latest version
6. **Use environment variables** for configuration
7. **Implement rate limiting** on backend APIs

## Next Steps

- Review [Component Documentation](./COMPONENTS.md) for detailed component API
- Check [Setup Instructions](./SETUP.md) for getting started
- See [Integration Guide for Your App](./YOUR_APP_INTEGRATION.md) for adding to existing apps
