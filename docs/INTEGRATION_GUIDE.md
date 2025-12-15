# Stytch Integration Guide for Angular

This comprehensive guide explains how Stytch Consumer authentication has been integrated into this Angular application, detailing every component, configuration option, and architectural decision.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Details](#implementation-details)
4. [Direct API Usage vs Abstraction](#direct-api-usage-vs-abstraction)
5. [Authentication Flows](#authentication-flows)
6. [Server-Side Integration](#server-side-integration)
7. [Security Considerations](#security-considerations)

## Overview

This application uses **[Stytch's prebuilt UI components](https://stytch.com/docs/sdks/javascript-sdk)** for Consumer authentication, providing:

- **Email Magic Links**: Passwordless authentication via email ([Stytch Magic Links Docs](https://stytch.com/docs/magic-links))
- **OAuth Social Login**: Authentication through Google and Microsoft ([Stytch OAuth Docs](https://stytch.com/docs/oauth))
- **Session Management**: Automatic session handling and persistence ([Stytch Sessions Docs](https://stytch.com/docs/sessions))
- **Security**: Built-in CSRF protection and secure token handling

### Why Stytch Prebuilt UI?

The prebuilt UI components from Stytch offer several advantages:

1. **Reduced Development Time**: No need to build custom authentication forms
2. **Best Practices**: UI follows security and UX best practices
3. **Consistent Updates**: Stytch maintains and updates the UI components
4. **Customizable**: Supports custom styling to match your brand
5. **Battle-tested**: Used by many production applications
6. **Compliance**: Handles GDPR, CCPA, and other regulatory requirements

### When to Use Prebuilt UI vs Direct API

**Use Prebuilt UI (Current Implementation) when:**
- You want a quick, production-ready solution
- You prefer managed UI updates and security patches
- You're building a standard authentication flow
- You want to minimize maintenance burden

**Use Direct API (See [Direct API Usage](#direct-api-usage-vs-abstraction)) when:**
- You need complete control over the UI
- You're building a highly customized auth flow
- You want to integrate with existing form systems
- You need to support non-standard authentication patterns

Both approaches are demonstrated in this guide.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         User Interface Layer            │
│  (Login, Dashboard, Authenticate)       │
│                                         │
│  Purpose: Render UI and handle user     │
│  interactions. Components are kept      │
│  thin, delegating business logic to     │
│  the Auth Service.                      │
└─────────────┬───────────────────────────┘
              │
              │ Dependency Injection
              ▼
┌─────────────────────────────────────────┐
│        Auth Service (Singleton)         │
│  • Manages StytchUIClient instance      │
│  • Maintains auth state (BehaviorSubject)│
│  • Provides session management methods  │
│  • Exposes Stytch client for advanced use│
│                                         │
│  Purpose: Central authentication hub    │
│  that abstracts Stytch SDK operations   │
│  and provides reactive state management │
└─────────────┬───────────────────────────┘
              │
              │ Uses
              ▼
┌─────────────────────────────────────────┐
│      Stytch SDK (@stytch/vanilla-js)    │
│  • StytchUIClient: Prebuilt UI          │
│  • StytchHeadlessClient: Direct API     │
│  • Session management                   │
│  • Token handling                       │
│  • API communication                    │
│                                         │
│  Purpose: Handles all communication     │
│  with Stytch servers, token validation, │
│  and session persistence                │
└─────────────────────────────────────────┘
```

### Data Flow: Login to Dashboard

```
1. User visits /login
   │
   ├─→ Login Component loads
   │   │
   │   ├─→ Injects Auth Service
   │   │
   │   └─→ Calls authService.getStytchClient()
   │
2. Login Component mounts Stytch UI
   │
   ├─→ stytchClient.mountLogin()
   │   │
   │   ├─→ Renders email input + OAuth buttons
   │   │
   │   └─→ Attaches event listeners
   │
3. User enters email / clicks OAuth
   │
   ├─→ Stytch SDK sends API request
   │   │
   │   └─→ (For magic link: Email sent)
   │       (For OAuth: Redirect to provider)
   │
4. User authenticates
   │
   ├─→ Redirected to /authenticate?token=...
   │   │
   │   ├─→ Authenticate Component extracts token
   │   │
   │   ├─→ Calls stytchClient.{magicLinks|oauth}.authenticate(token)
   │   │
   │   ├─→ Stytch validates token
   │   │
   │   ├─→ Session created
   │   │
   │   └─→ authService.updateAuthStatus(true)
   │
5. Redirect to /dashboard
   │
   ├─→ Auth Guard checks authService.isAuthenticated()
   │   │
   │   └─→ (If false, redirect to /login)
   │
   └─→ Dashboard Component loads
       │
       ├─→ Calls authService.getUser()
       │
       └─→ Displays user information
```

### Component Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/
│   │   │   ├── login.ts            # Mounts Stytch prebuilt UI
│   │   │   ├── login.html          # Container for Stytch UI
│   │   │   └── login.css           # Styling for login page
│   │   │
│   │   ├── authenticate/
│   │   │   ├── authenticate.ts     # Handles auth callbacks
│   │   │   ├── authenticate.html   # Loading/error states
│   │   │   └── authenticate.css    # Styling
│   │   │
│   │   └── dashboard/
│   │       ├── dashboard.ts        # Protected user page
│   │       ├── dashboard.html      # User info display
│   │       └── dashboard.css       # Dashboard styling
│   │
│   ├── guards/
│   │   └── auth-guard.ts          # Protects routes
│   │
│   ├── services/
│   │   └── auth.ts                # Core auth service
│   │
│   └── environments/
│       ├── environment.ts         # Dev config
│       └── environment.development.ts  # Dev override
```

## Implementation Details

### 1. Installation and Setup

#### Package Installation

```bash
npm install @stytch/vanilla-js
```

**What this provides:**
- `StytchUIClient`: Client with prebuilt UI components for rapid integration
- `StytchHeadlessClient`: Headless client for custom UI implementations
- Type definitions for TypeScript development
- Session management utilities
- Token handling and validation

**Package Documentation:** [Stytch JavaScript SDK](https://stytch.com/docs/sdks/javascript-sdk)

#### Environment Configuration

The application uses Angular's environment system to manage configuration across development and production.

**Purpose:** Separates environment-specific configuration (like API tokens) from code, enabling:
- Different tokens for dev/staging/production
- Easy configuration management
- No hardcoded secrets in source code

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  stytchPublicToken: 'public-token-test-YOUR-PUBLIC-TOKEN-HERE'
};
```

**Key Points:**
- `production: false` enables development mode (more logging, no optimizations)
- `stytchPublicToken` is the **public** token (safe for client-side use)
- Get your token from [Stytch Dashboard > API Keys](https://stytch.com/dashboard/api-keys)
- Use `public-token-test-*` for development, `public-token-live-*` for production

**File Replacement Setup:** In `angular.json`, the build system is configured to replace environment files:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.development.ts"
  }
]
```

This ensures the correct environment file is used during development vs production builds.


### 2. Authentication Service

The `Auth` service (`src/app/services/auth.ts`) is the central hub for all authentication operations.

**Purpose:** 
- Encapsulates Stytch SDK interactions
- Manages authentication state reactively
- Provides consistent API for components
- Ensures single Stytch client instance (singleton pattern)

```typescript
@Injectable({
  providedIn: 'root',  // Singleton across entire app
})
export class Auth {
  private stytch: StytchUIClient;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean>;
  
  constructor() {
    // Initialize Stytch client with public token
    this.stytch = new StytchUIClient(environment.stytchPublicToken);
    
    // Check if user has existing session
    this.checkSession();
  }
  
  // ... methods
}
```

#### Why This Design?

**Singleton Pattern (`providedIn: 'root'`):**
- Ensures only one Stytch client instance exists
- Maintains consistent auth state across components
- Prevents multiple session checks
- Reduces memory usage and API calls

**BehaviorSubject for State:**
- Emits current value immediately to new subscribers
- Allows components to reactively respond to auth changes
- Supports both imperative (`isAuthenticated()`) and reactive (`isAuthenticated$`) access
- Thread-safe state updates

**Private Stytch Client:**
- Encapsulates SDK implementation details
- Provides controlled access via `getStytchClient()`
- Allows future SDK version updates without breaking changes
- Enforces consistent usage patterns

#### Methods Explained:

##### `private async checkSession(): Promise<void>`

**Purpose:** Verifies if user has an active session when the service initializes.

**When it runs:** Automatically on service construction (app startup, page reload)

**What it does:**
1. Calls `this.stytch.session.getSync()` to retrieve session from memory/storage
2. Updates `isAuthenticatedSubject` based on session existence
3. Handles errors gracefully (user not logged in)

**Why it's important:**
- Restores user's logged-in state after page refresh
- Prevents requiring re-login on every navigation
- Validates session hasn't expired

[Stytch Session API Reference](https://stytch.com/docs/api/session-get)

##### `async logout(): Promise<void>`

**Purpose:** Terminates user session and clears authentication state.

**What it does:**
1. Calls `this.stytch.session.revoke()` to invalidate session on Stytch servers
2. Updates `isAuthenticatedSubject.next(false)` to notify all subscribers
3. Returns Promise that resolves when logout completes

**Usage:**
```typescript
await this.authService.logout();
this.router.navigate(['/']);
```

[Stytch Session Revoke API](https://stytch.com/docs/api/session-revoke)

##### `getUser(): User | null`

**Purpose:** Retrieves current authenticated user's information synchronously.

**What it returns:**
```typescript
{
  user_id: string;              // Unique Stytch user ID
  emails: Array<{
    email: string;
    verified: boolean;
    email_id: string;
  }>;
  name?: {                      // Optional profile info
    first_name?: string;
    middle_name?: string;
    last_name?: string;
  };
  providers: Array<{            // Authentication methods used
    provider_type: string;      // e.g., 'google', 'magic_link'
    provider_subject_id: string;
  }>;
  created_at: string;           // ISO timestamp
  status: string;               // 'active', 'pending', etc.
}
```

**When to use:** Dashboard displays, profile pages, conditional rendering

[Stytch User Object Documentation](https://stytch.com/docs/api/user-object)

##### `isAuthenticated(): boolean`

**Purpose:** Synchronous check of current authentication status.

**When to use:**
- Route guards (immediate decision needed)
- Conditional rendering (ngIf directives)
- Function calls that need instant status

**Alternative:** Use `isAuthenticated$` Observable for reactive updates

##### `getStytchClient(): StytchUIClient`

**Purpose:** Provides direct access to underlying Stytch SDK client.

**When to use:**
- Mounting UI components (`mountLogin()`)
- Advanced SDK features not wrapped by service
- Session management operations
- Accessing raw session data

**Why it's exposed:** Allows flexibility while maintaining encapsulation

##### `updateAuthStatus(isAuthenticated: boolean): void`

**Purpose:** Manually updates authentication state after successful authentication.

**When to use:**
- After successful magic link/OAuth authentication
- After manual token verification
- When sync between SDK and service state is needed

**Important:** This doesn't create a session, it only updates the service's internal state.

### 3. Login Component

The login component (`src/app/components/login/`) renders the authentication interface using Stytch's prebuilt UI.

**Purpose:**
- Mount Stytch's prebuilt authentication UI
- Configure authentication methods (magic links, OAuth)
- Handle authentication success/error events
- Redirect authenticated users

#### Lifecycle Flow:

```typescript
export class Login implements OnInit, AfterViewInit {
  ngOnInit() {
    // Check if user is already authenticated
    // Purpose: Prevent showing login to logged-in users
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit() {
    // Mount Stytch UI after view is fully initialized
    // Purpose: Ensure DOM element exists before mounting
    this.initializeStytchUI();
  }
}
```

**Why AfterViewInit?**
- DOM element `#stytch-container` must exist before mounting
- `ngOnInit` fires before view rendering
- `ngAfterViewInit` guarantees DOM is ready

#### Mounting Stytch UI:

```typescript
private initializeStytchUI() {
  const stytchClient = this.authService.getStytchClient();

  stytchClient.mountLogin({
    elementId: '#stytch-container',  // CSS selector for mount point
    config: {
      // ... configuration
    },
    styles: {
      // ... custom styling
    },
    callbacks: {
      // ... event handlers
    }
  });
}
```

**Configuration Breakdown:**

##### Products Array

```typescript
products: [Products.emailMagicLinks, Products.oauth]
```

**Purpose:** Defines which authentication methods to enable

**Available Products:**
- `Products.emailMagicLinks` - Passwordless email authentication
- `Products.oauth` - Social login providers
- `Products.passwords` - Traditional password auth
- `Products.sms` - SMS-based authentication
- `Products.whatsapp` - WhatsApp authentication

[Stytch Products Documentation](https://stytch.com/docs/guides/dashboard/product-configuration)

##### Email Magic Links Configuration

```typescript
emailMagicLinksOptions: {
  loginRedirectURL: `${window.location.origin}/authenticate`,
  loginExpirationMinutes: 60,
  signupRedirectURL: `${window.location.origin}/authenticate`,
  signupExpirationMinutes: 60,
}
```

**Field Explanations:**

- **`loginRedirectURL`**: Where to send users after clicking magic link (existing users)
  - Must match URLs configured in [Stytch Dashboard > Redirect URLs](https://stytch.com/dashboard/redirect-urls)
  - Uses `window.location.origin` for environment-agnostic configuration

- **`loginExpirationMinutes`**: How long magic link remains valid (default: 60 minutes)
  - Longer = More convenient, but less secure
  - Shorter = More secure, but users must act quickly
  - Recommended: 30-60 minutes for consumer apps

- **`signupRedirectURL`**: Where to send new users after clicking magic link
  - Can be same as login or different for onboarding flows

- **`signupExpirationMinutes`**: Magic link validity for new signups

[Magic Links API Reference](https://stytch.com/docs/api/magic-links-email-login-or-create)

##### OAuth Configuration

```typescript
oauthOptions: {
  providers: [
    { type: 'google' },
    { type: 'microsoft' }
  ],
  loginRedirectURL: `${window.location.origin}/authenticate`,
  signupRedirectURL: `${window.location.origin}/authenticate`,
}
```

**Providers Array:** Each provider must be enabled in [Stytch Dashboard > OAuth](https://stytch.com/dashboard/oauth)

**Available Providers:**
- `google` - Google OAuth ([Setup Guide](https://stytch.com/docs/oauth/google))
- `microsoft` - Microsoft OAuth ([Setup Guide](https://stytch.com/docs/oauth/microsoft))
- `github` - GitHub OAuth
- `facebook` - Facebook OAuth  
- `apple` - Apple Sign In
- And more...

**Redirect URLs:** Must match configured OAuth redirect URLs in Stytch Dashboard

[OAuth API Reference](https://stytch.com/docs/api/oauth-start)

##### Styling Configuration

```typescript
styles: {
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  container: {
    width: '100%',
  },
  colors: {
    primary: '#667eea',  // Your brand color
  }
}
```

**Purpose:** Customize Stytch UI to match your brand

**Customizable Properties:**
- **fontFamily**: Font stack for all text
- **colors.primary**: Primary brand color (buttons, links)
- **colors.secondary**: Secondary color
- **container.width**: Container width
- **container.backgroundColor**: Background color
- **buttons**: Button styling overrides
- **inputs**: Input field styling

[Styling Reference](https://stytch.com/docs/sdks/javascript-sdk#styling)

##### Callbacks Configuration

```typescript
callbacks: {
  onEvent: (message) => {
    console.group('📊 Stytch Event');
    console.log('Type:', message.type);
    console.log('Data:', message.data);
    console.groupEnd();
  },
  onSuccess: (message) => {
    console.log('✅ Authentication Success');
    this.authService.updateAuthStatus(true);
    this.router.navigate(['/dashboard']);
  },
  onError: (message) => {
    console.error('❌ Authentication Error:', message);
  }
}
```

**Callback Purposes:**

- **`onEvent`**: Fires for various UI interactions and state changes
  - Email submission
  - OAuth provider selection  
  - Form validation
  - Loading states
  - Useful for analytics and debugging

- **`onSuccess`**: Fires when authentication completes successfully
  - Update app authentication state
  - Redirect to protected content
  - Track conversion events
  - Initialize user session

- **`onError`**: Fires when authentication fails
  - Display error messages to user
  - Log errors for debugging
  - Track failed authentication attempts
  - Fallback/retry logic

[Callbacks Documentation](https://stytch.com/docs/sdks/javascript-sdk#callbacks)



### 4. Authenticate Component

The authenticate component handles the authentication callback after users click magic links or complete OAuth flows.

**Purpose:**
- Extract authentication token from URL parameters
- Call appropriate Stytch authentication method
- Handle success/error cases
- Redirect to protected content

**Flow:**

```typescript
async ngOnInit() {
  // Extract parameters from URL
  const token = this.route.snapshot.queryParamMap.get('token');
  const stytch_token_type = this.route.snapshot.queryParamMap.get('stytch_token_type');
  
  // Enhanced logging for debugging
  console.group('🔓 Processing Authentication Callback');
  console.log('Token present:', !!token);
  console.log('Token type:', stytch_token_type || 'magic_link');
  console.groupEnd();
  
  if (!token) {
    this.error = 'No authentication token found';
    return;
  }
  
  try {
    const stytchClient = this.authService.getStytchClient();
    
    // Route to correct authentication method
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
  } catch (error) {
    // Handle authentication failure
    this.error = error.message;
  }
}
```

**Key Points:**

1. **Token Extraction**: Uses Angular's `ActivatedRoute` to get query parameters
2. **Token Type Detection**: `stytch_token_type` distinguishes OAuth from magic link
3. **Method Selection**: Routes to `oauth.authenticate()` or `magicLinks.authenticate()`
4. **Session Duration**: Configurable via `session_duration_minutes`
5. **Error Handling**: Displays user-friendly error messages

**URL Structure:**

```
# Magic Link
https://yourdomain.com/authenticate?token=ABC123...

# OAuth
https://yourdomain.com/authenticate?token=XYZ789...&stytch_token_type=oauth
```

[Authentication API Reference](https://stytch.com/docs/api/authenticate-magic-link)

## Direct API Usage vs Abstraction

### Current Implementation: Service Abstraction (Recommended)

The current Auth service wraps Stytch SDK operations, providing:

**Advantages:**
- Consistent API across components
- Centralized authentication logic
- Easy to test (mock service)
- Can swap auth providers without changing components
- Reactive state management built-in

**When to Use:** Most applications, especially when:
- Building standard authentication flows
- Want maintainable, testable code
- Need consistent patterns across team
- Plan to potentially migrate providers

### Alternative: Direct API Usage

For maximum control or custom flows, you can call Stytch APIs directly without the service wrapper.

**Example: Magic Link Without Service**

```typescript
// In component
import { StytchUIClient } from '@stytch/vanilla-js';
import { environment } from '../environments/environment';

export class CustomLoginComponent {
  private stytch: StytchUIClient;
  
  constructor() {
    this.stytch = new StytchUIClient(environment.stytchPublicToken);
  }
  
  async sendMagicLink(email: string) {
    try {
      await this.stytch.magicLinks.email.loginOrCreate({
        email,
        login_magic_link_url: `${window.location.origin}/auth`,
        signup_magic_link_url: `${window.location.origin}/auth`,
        login_expiration_minutes: 30,
        signup_expiration_minutes: 30,
      });
      
      console.log('Magic link sent!');
    } catch (error) {
      console.error('Failed to send:', error);
    }
  }
  
  async authenticateMagicLink(token: string) {
    try {
      const response = await this.stytch.magicLinks.authenticate(token, {
        session_duration_minutes: 60,
      });
      
      console.log('User:', response.user);
      console.log('Session:', response.session);
      
      // Manually handle state
      // Store session, update UI, etc.
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }
}
```

[Magic Links SDK Reference](https://stytch.com/docs/sdks/javascript-sdk/magic-links)

**Example: OAuth Without Service**

```typescript
async startOAuthFlow(provider: 'google' | 'microsoft') {
  try {
    await this.stytch.oauth[provider].start({
      login_redirect_url: `${window.location.origin}/auth`,
      signup_redirect_url: `${window.location.origin}/auth`,
    });
    // User will be redirected to OAuth provider
  } catch (error) {
    console.error('OAuth start failed:', error);
  }
}

async handleOAuthCallback(token: string) {
  try {
    const response = await this.stytch.oauth.authenticate(token, {
      session_duration_minutes: 1440, // 24 hours
    });
    
    console.log('OAuth user:', response.user);
    console.log('Provider:', response.provider_type);
  } catch (error) {
    console.error('OAuth authentication failed:', error);
  }
}
```

[OAuth SDK Reference](https://stytch.com/docs/sdks/javascript-sdk/oauth)

**Example: Session Management Without Service**

```typescript
// Check session
const session = this.stytch.session.getSync();
if (session) {
  console.log('User is logged in:', session.user_id);
}

// Revoke session (logout)
await this.stytch.session.revoke();

// Get user info
const user = this.stytch.user.getSync();
console.log('User email:', user.emails[0].email);
```

[Session SDK Reference](https://stytch.com/docs/sdks/javascript-sdk/sessions)

### When to Use Each Approach

| Requirement | Use Service Abstraction | Use Direct API |
|------------|------------------------|----------------|
| Standard auth flow | ✅ | ❌ |
| Custom UI | ✅ | ✅ |
| Multiple auth methods | ✅ | ⚠️ More code |
| Testing | ✅ Easy to mock | ⚠️ Need to mock SDK |
| Team consistency | ✅ | ❌ |
| Maximum flexibility | ⚠️ Some limits | ✅ |
| Quick development | ✅ | ⚠️ More boilerplate |

## Server-Side Integration

While this is a frontend application, here's how to integrate with a backend for API requests.

### Architecture: Frontend + Backend

```
┌─────────────────┐
│   Angular App   │
│  (This Project) │
└────────┬────────┘
         │
         │ HTTP Requests with
         │ Session Token
         ▼
┌─────────────────┐      Validates      ┌───────────────┐
│  Backend API    │ ◄─────────────────► │ Stytch Servers│
│  (Node/Python/  │     Session Token   │               │
│   Go/etc.)      │                     └───────────────┘
└─────────────────┘
```

**Flow:**
1. User authenticates in Angular (frontend)
2. Stytch creates session
3. Frontend includes session token in API requests
4. Backend validates token with Stytch
5. Backend authorizes request

### Getting Session Token in Frontend

```typescript
// In your Angular service or HTTP interceptor
export class ApiService {
  constructor(private authService: Auth) {}
  
  getSessionToken(): string | null {
    const stytchClient = this.authService.getStytchClient();
    const session = stytchClient.session.getSync();
    return session?.session_token || null;
  }
}
```

### Attaching Token to Axios Requests

If you're using axios for HTTP requests:

```typescript
import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  private axios: AxiosInstance;
  
  constructor(private authService: Auth) {
    this.axios = axios.create({
      baseURL: 'https://api.yourdomain.com',
    });
    
    // Add interceptor to attach token to every request
    this.axios.interceptors.request.use((config) => {
      const stytchClient = this.authService.getStytchClient();
      const session = stytchClient.session.getSync();
      
      if (session?.session_token) {
        config.headers.Authorization = `Bearer ${session.session_token}`;
      }
      
      return config;
    });
  }
  
  async getProtectedData() {
    const response = await this.axios.get('/protected-endpoint');
    return response.data;
  }
}
```

### Attaching Token to Angular HttpClient

Using Angular's built-in HttpClient with interceptor:

```typescript
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth } from './services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: Auth) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const stytchClient = this.authService.getStytchClient();
    const session = stytchClient.session.getSync();
    
    if (session?.session_token) {
      // Clone request and add Authorization header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${session.session_token}`
        }
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}

// Register in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ]
};
```

[Angular HTTP Interceptors Guide](https://angular.io/guide/http-intercept-requests-and-responses)

### Backend Validation (Node.js Example)

```javascript
// Install Stytch Node SDK
// npm install stytch

const stytch = require('stytch');

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
});

// Middleware to validate session token
async function validateStytchSession(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const sessionToken = authHeader.substring(7);
  
  try {
    // Validate with Stytch
    const response = await client.sessions.authenticate({
      session_token: sessionToken,
    });
    
    // Add user info to request
    req.user = response.user;
    req.session = response.session;
    
    next();
  } catch (error) {
    console.error('Session validation failed:', error);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// Protected endpoint
app.get('/api/protected', validateStytchSession, (req, res) => {
  res.json({
    message: 'Protected data',
    user: req.user,
  });
});
```

[Stytch Backend SDKs](https://stytch.com/docs/sdks)

### Backend Validation (Python/FastAPI Example)

```python
# Install Stytch Python SDK
# pip install stytch

from stytch import Client
from fastapi import FastAPI, Header, HTTPException
import os

app = FastAPI()

# Initialize Stytch client
stytch_client = Client(
    project_id=os.environ["STYTCH_PROJECT_ID"],
    secret=os.environ["STYTCH_SECRET"],
)

async def validate_session(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token provided")
    
    session_token = authorization[7:]
    
    try:
        response = stytch_client.sessions.authenticate(
            session_token=session_token
        )
        return response
    except Exception as error:
        raise HTTPException(status_code=401, detail="Invalid session")

@app.get("/api/protected")
async def protected_endpoint(session_data = Depends(validate_session)):
    return {
        "message": "Protected data",
        "user": session_data.user,
    }
```

[Stytch Python SDK](https://stytch.com/docs/sdks/python-sdk)

### Important Security Notes

1. **Never expose secret key in frontend** - Only public token goes in Angular
2. **Validate on backend** - Don't trust frontend auth state alone
3. **Use HTTPS** - Always encrypt token transmission
4. **Short-lived tokens** - Set appropriate session durations
5. **Handle token expiry** - Implement refresh logic or re-authentication

[Stytch Security Best Practices](https://stytch.com/docs/guides/security/best-practices)

## Authentication Flows

### Magic Link Flow (Detailed)

```
┌──────────┐                                    ┌──────────┐
│  User    │                                    │ Angular  │
│  Browser │                                    │   App    │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │  1. Navigate to /login                        │
     ├──────────────────────────────────────────────>│
     │                                               │
     │  2. Render Login Component                    │
     │  3. Mount Stytch UI                           │
     │<──────────────────────────────────────────────┤
     │                                               │
     │  4. Enter email + submit                      │
     ├──────────────────────────────────────────────>│
     │                                               │
     │  5. Call magicLinks.email.loginOrCreate()    │
     │                    │                          │
     │                    ▼                          │
     │             ┌──────────────┐                  │
     │             │   Stytch     │                  │
     │             │   Servers    │                  │
     │             └──────────────┘                  │
     │                    │                          │
     │  6. Send magic link email                     │
     │<───────────────────┘                          │
     │                                               │
     │  7. Show "Check your email" message           │
     │<──────────────────────────────────────────────┤
     │                                               │
     │  8. Click link in email                       │
     │  (Link contains token parameter)              │
     │                                               │
     │  9. Redirect to /authenticate?token=ABC...    │
     ├──────────────────────────────────────────────>│
     │                                               │
     │  10. Extract token from URL                   │
     │  11. Call magicLinks.authenticate(token)      │
     │                    │                          │
     │                    ▼                          │
     │             ┌──────────────┐                  │
     │             │   Stytch     │                  │
     │             │   Servers    │                  │
     │             └──────────────┘                  │
     │                    │                          │
     │  12. Validate token & create session          │
     │  13. Return user + session                    │
     │                    │                          │
     │                    ▼                          │
     │  14. Update auth state                        │
     │  15. Redirect to /dashboard                   │
     │<──────────────────────────────────────────────┤
     │                                               │
     │  16. Render Dashboard (user logged in)        │
     │<──────────────────────────────────────────────┤
     │                                               │
```

**Key Points:**
- Token is single-use and time-limited (expires after `loginExpirationMinutes`)
- Session is created only after successful token validation
- Session token stored by Stytch SDK (in memory/cookies)
- Subsequent requests use session token, not magic link token

[Magic Links Flow Documentation](https://stytch.com/docs/guides/magic-links/how-it-works)

### OAuth Flow (Detailed)

```
┌──────────┐              ┌──────────┐              ┌──────────┐
│  User    │              │ Angular  │              │  OAuth   │
│  Browser │              │   App    │              │ Provider │
└────┬─────┘              └────┬─────┘              └────┬─────┘
     │                         │                         │
     │  1. Click "Login with Google"                     │
     ├────────────────────────>│                         │
     │                         │                         │
     │  2. Call oauth.google.start()                     │
     │                         ├────────┐                │
     │                         │        │                │
     │                         │    ┌───▼────────┐       │
     │                         │    │   Stytch   │       │
     │                         │    │  Servers   │       │
     │                         │    └───┬────────┘       │
     │                         │        │                │
     │  3. Redirect to OAuth provider   │                │
     │<────────────────────────┴────────┴───────────────>│
     │                                                    │
     │  4. User authenticates with provider (Google)     │
     │  5. User approves permissions                     │
     │                                                    │
     │  6. OAuth provider redirects with auth code       │
     │<───────────────────────────────────────────────────┤
     │                                                    │
     │  7. Redirect to /authenticate?token=XYZ...&       │
     │     stytch_token_type=oauth                       │
     ├────────────────────────>│                         │
     │                         │                         │
     │  8. Extract token + type from URL                 │
     │  9. Call oauth.authenticate(token)                │
     │                         ├────────┐                │
     │                         │        │                │
     │                         │    ┌───▼────────┐       │
     │                         │    │   Stytch   │       │
     │                         │    │  Servers   │       │
     │                         │    └───┬────────┘       │
     │                         │        │                │
     │  10. Exchange token for session                   │
     │  11. Return user + session                        │
     │                         │<───────┘                │
     │                         │                         │
     │  12. Update auth state                            │
     │  13. Redirect to /dashboard                       │
     │<────────────────────────┤                         │
     │                         │                         │
```

**Key Points:**
- User is redirected away from your app to OAuth provider
- OAuth provider handles authentication
- Stytch exchanges OAuth code for session token
- `stytch_token_type=oauth` parameter identifies OAuth flow

[OAuth Flow Documentation](https://stytch.com/docs/guides/oauth/how-it-works)

## Security Considerations

### 1. Token Security

**Public Token Safety:**
- Safe to expose in frontend code
- Only grants access to public operations (login, signup)
- Cannot perform admin operations
- Cannot access other users' data

**Secret Token Protection:**
- **Never** include in frontend code
- Only use on secure backend servers
- Grants full API access
- Store in environment variables

[API Keys Documentation](https://stytch.com/docs/api-keys)

### 2. Session Management

**Session Properties:**
- **Session Token**: JWT-like token identifying the session
- **Expiration**: Configurable duration (1 min - 30 days)
- **Storage**: Managed by Stytch SDK (memory + optional cookies)
- **Revocation**: Can be revoked server-side

**Best Practices:**
- Set appropriate expiration based on sensitivity
- Consumer apps: 60-1440 minutes (1-24 hours)
- High-security apps: 15-60 minutes
- Implement session refresh for long-lived apps

[Session Management Docs](https://stytch.com/docs/sessions)

### 3. CSRF Protection

**Built-in Protection:**
- Stytch includes CSRF tokens in OAuth flows
- State parameter prevents cross-site attacks
- Token validation ensures request authenticity

**Your Responsibility:**
- Use HTTPS in production
- Implement backend CSRF protection for your APIs
- Validate session tokens on backend

[CSRF Protection Guide](https://stytch.com/docs/guides/security/csrf-protection)

### 4. XSS Prevention

**Stytch SDK:**
- Sanitizes all input
- Escapes output to prevent injection
- Uses Content Security Policy headers

**Your Responsibility:**
- Never use `innerHTML` with user data
- Sanitize user-generated content
- Use Angular's built-in XSS protection

### 5. Rate Limiting

**Stytch Rate Limits:**
- Magic link sends: ~10 per minute per email
- Authentication attempts: ~100 per minute per IP
- Prevents brute force attacks
- Automatic temporary blocks for suspicious activity

[Rate Limiting Documentation](https://stytch.com/docs/guides/security/rate-limiting)

### 6. Secure Production Checklist

Before deploying to production:

- [ ] Replace test tokens with live tokens
- [ ] Configure production redirect URLs in Stytch Dashboard
- [ ] Enable HTTPS (force redirect from HTTP)
- [ ] Set appropriate session durations
- [ ] Implement backend session validation
- [ ] Enable logging and monitoring
- [ ] Test OAuth providers with production credentials
- [ ] Review and approve OAuth permissions
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Test magic link email delivery
- [ ] Configure SPF/DKIM for custom email domain
- [ ] Review Stytch Dashboard security settings

### 7. Debugging and Logging

This application includes extensive logging for debugging:

**Frontend Logging:**
```typescript
// Login component logs
console.group('📊 Stytch Event');
console.log('Type:', message.type);
console.log('Data:', message.data);
console.groupEnd();

// Authenticate component logs
console.group('🔓 Processing Authentication Callback');
console.log('Token present:', !!token);
console.log('Token type:', stytch_token_type);
console.groupEnd();

// Dashboard logs user and session data
console.group('🔐 User Authentication Information');
console.log('User Object:', this.user);
console.log('Session:', session);
console.groupEnd();
```

**Stytch Dashboard:**
- View all authentication events in real-time
- See failed attempts and errors
- Monitor session activity
- Export logs for analysis

[Stytch Logs Dashboard](https://stytch.com/dashboard/logs)

## Next Steps

- Review [Component Documentation](./COMPONENTS.md) for detailed API reference
- Check [Setup Instructions](./SETUP.md) for deployment configuration
- See [Your App Integration](./YOUR_APP_INTEGRATION.md) for adding to existing apps
- Explore [Stytch Documentation](https://stytch.com/docs) for advanced features

## Additional Resources

### Stytch Documentation
- [Main Documentation](https://stytch.com/docs)
- [JavaScript SDK](https://stytch.com/docs/sdks/javascript-sdk)
- [API Reference](https://stytch.com/docs/api)
- [Magic Links Guide](https://stytch.com/docs/guides/magic-links)
- [OAuth Guide](https://stytch.com/docs/guides/oauth)
- [Sessions Guide](https://stytch.com/docs/sessions)
- [Security Best Practices](https://stytch.com/docs/guides/security/best-practices)

### Angular Resources
- [Angular Documentation](https://angular.io/docs)
- [Angular HTTP Client](https://angular.io/guide/http)
- [Angular Router](https://angular.io/guide/router)
- [Angular Dependency Injection](https://angular.io/guide/dependency-injection)

### Community
- [Stytch Community Forum](https://stytch.com/community)
- [Stytch Support](mailto:support@stytch.com)
- [GitHub Issues](https://github.com/Inheritech/angular-stytch/issues)
