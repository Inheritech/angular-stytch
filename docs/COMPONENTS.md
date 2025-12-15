# Component Documentation

This document provides detailed documentation for all components, services, and guards in the application.

## Table of Contents

1. [Auth Service](#auth-service)
2. [Login Component](#login-component)
3. [Authenticate Component](#authenticate-component)
4. [Dashboard Component](#dashboard-component)
5. [Auth Guard](#auth-guard)

---

## Auth Service

**Location**: `src/app/services/auth.ts`

**Purpose**: Central authentication service that manages Stytch client and authentication state.

### Class: `Auth`

Injectable service that provides authentication functionality throughout the application.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `stytch` | `StytchUIClient` | Instance of Stytch UI client |
| `isAuthenticatedSubject` | `BehaviorSubject<boolean>` | Internal subject for auth state |
| `isAuthenticated$` | `Observable<boolean>` | Observable stream of authentication state |

#### Constructor

```typescript
constructor()
```

Initializes the Stytch client with the public token from environment configuration and checks the current session status.

#### Methods

##### `checkSession()`

```typescript
private async checkSession(): Promise<void>
```

Checks if a valid session exists and updates the authentication state.

**Returns**: `Promise<void>`

**Usage**:
```typescript
// Called automatically on service initialization
```

##### `logout()`

```typescript
async logout(): Promise<void>
```

Revokes the current session and updates authentication state to false.

**Returns**: `Promise<void>`

**Usage**:
```typescript
await this.authService.logout();
```

##### `getUser()`

```typescript
getUser(): User | null
```

Returns the current authenticated user information synchronously.

**Returns**: `User | null` - User object or null if not authenticated

**Usage**:
```typescript
const user = this.authService.getUser();
console.log(user.email);
```

**User Object Structure**:
```typescript
{
  user_id: string;
  emails: Array<{ email: string }>;
  name: { first_name?: string; last_name?: string };
  providers: Array<{ type: string }>;
  // ... other fields
}
```

##### `isAuthenticated()`

```typescript
isAuthenticated(): boolean
```

Returns the current authentication state synchronously.

**Returns**: `boolean` - True if authenticated, false otherwise

**Usage**:
```typescript
if (this.authService.isAuthenticated()) {
  // User is logged in
}
```

##### `getStytchClient()`

```typescript
getStytchClient(): StytchUIClient
```

Provides access to the underlying Stytch client for advanced operations.

**Returns**: `StytchUIClient` - The Stytch UI client instance

**Usage**:
```typescript
const client = this.authService.getStytchClient();
client.mountLogin({ ... });
```

##### `updateAuthStatus()`

```typescript
updateAuthStatus(isAuthenticated: boolean): void
```

Manually updates the authentication state. Typically called after successful authentication.

**Parameters**:
- `isAuthenticated` (boolean): The new authentication state

**Returns**: `void`

**Usage**:
```typescript
this.authService.updateAuthStatus(true);
```

---

## Login Component

**Location**: `src/app/components/login/`

**Purpose**: Displays the Stytch prebuilt UI for user authentication.

### Class: `Login`

Component that handles the login page and mounts Stytch's prebuilt authentication UI.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `authService` | `Auth` | Injected authentication service |
| `router` | `Router` | Angular router for navigation |

#### Lifecycle Hooks

##### `ngOnInit()`

```typescript
ngOnInit(): void
```

Checks if user is already authenticated and redirects to dashboard if so.

##### `ngAfterViewInit()`

```typescript
ngAfterViewInit(): void
```

Initializes and mounts the Stytch UI after the view is ready.

#### Methods

##### `initializeStytchUI()`

```typescript
private initializeStytchUI(): void
```

Configures and mounts the Stytch login UI with email magic links and OAuth providers.

**Configuration**:
- Email Magic Links with 60-minute expiration
- OAuth providers: Google and Microsoft
- Custom styling with brand colors
- Success callback redirects to dashboard

#### Template

**File**: `src/app/components/login/login.html`

Contains a container div with header and the Stytch UI mount point.

```html
<div class="login-container">
  <div class="login-card">
    <div class="header">
      <h1>Welcome</h1>
      <p class="subtitle">Sign in to continue</p>
    </div>
    <div id="stytch-container"></div>
  </div>
</div>
```

#### Styles

**File**: `src/app/components/login/login.css`

Provides styling for:
- Full-screen gradient background
- Centered white card
- Responsive design
- Header text formatting

---

## Authenticate Component

**Location**: `src/app/components/authenticate/`

**Purpose**: Handles authentication callbacks from magic links and OAuth flows.

### Class: `Authenticate`

Component that processes authentication tokens and creates sessions.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isLoading` | `boolean` | Loading state indicator |
| `error` | `string` | Error message if authentication fails |
| `route` | `ActivatedRoute` | Access to route parameters |
| `router` | `Router` | Angular router for navigation |
| `authService` | `Auth` | Injected authentication service |

#### Lifecycle Hooks

##### `ngOnInit()`

```typescript
async ngOnInit(): Promise<void>
```

Extracts authentication token from URL query parameters and authenticates the user.

**Query Parameters**:
- `token` (required): Authentication token from Stytch
- `stytch_token_type` (optional): Type of token ('oauth' or magic link)

**Flow**:
1. Extract token and type from URL
2. Validate token exists
3. Call appropriate Stytch authentication method
4. Update auth state
5. Redirect to dashboard or show error

#### Template

**File**: `src/app/components/authenticate/authenticate.html`

Displays loading state or error message.

```html
<div class="authenticate-container">
  <div class="authenticate-card">
    @if (isLoading) {
      <div class="loading">
        <div class="spinner"></div>
        <h2>Authenticating...</h2>
        <p>Please wait while we verify your credentials.</p>
      </div>
    }
    @if (error) {
      <div class="error">
        <h2>Authentication Failed</h2>
        <p>{{ error }}</p>
        <a routerLink="/" class="btn">Return to Login</a>
      </div>
    }
  </div>
</div>
```

#### Styles

**File**: `src/app/components/authenticate/authenticate.css`

Provides styling for:
- Loading spinner animation
- Error display
- Centered layout
- Consistent styling with login page

---

## Dashboard Component

**Location**: `src/app/components/dashboard/`

**Purpose**: Protected page that displays user information after successful authentication.

### Class: `Dashboard`

Component that shows authenticated user data and provides logout functionality.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `user` | `any` | Current user object |
| `isLoading` | `boolean` | Loading state indicator |
| `authService` | `Auth` | Injected authentication service |
| `router` | `Router` | Angular router for navigation |

#### Lifecycle Hooks

##### `ngOnInit()`

```typescript
ngOnInit(): void
```

Loads current user information from the authentication service.

#### Methods

##### `logout()`

```typescript
async logout(): Promise<void>
```

Logs out the user and redirects to login page.

**Usage**:
```typescript
<button (click)="logout()">Logout</button>
```

##### `getUserEmail()`

```typescript
getUserEmail(): string
```

Extracts and returns the user's email address.

**Returns**: `string` - User's email or "No email available"

##### `getUserName()`

```typescript
getUserName(): string
```

Constructs and returns the user's full name.

**Returns**: `string` - User's name or "User"

##### `getUserId()`

```typescript
getUserId(): string
```

Returns the user's unique Stytch ID.

**Returns**: `string` - User ID or "N/A"

##### `getAuthMethod()`

```typescript
getAuthMethod(): string
```

Returns the authentication method(s) used by the user.

**Returns**: `string` - Comma-separated list of auth methods

#### Template

**File**: `src/app/components/dashboard/dashboard.html`

Displays:
- Dashboard header with logout button
- Welcome message
- User information card
- Application information

```html
<div class="dashboard-container">
  <div class="dashboard-header">
    <h1>Dashboard</h1>
    <button class="btn-logout" (click)="logout()">Logout</button>
  </div>
  
  <div class="dashboard-content">
    <!-- Welcome card, user info, and app info -->
  </div>
</div>
```

#### Styles

**File**: `src/app/components/dashboard/dashboard.css`

Provides styling for:
- Dashboard layout
- Information cards
- Logout button
- Responsive grid

---

## Auth Guard

**Location**: `src/app/guards/auth-guard.ts`

**Purpose**: Protects routes from unauthorized access.

### Function: `authGuard`

Functional route guard that checks authentication status.

#### Signature

```typescript
export const authGuard: CanActivateFn = (route, state) => boolean | UrlTree
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `route` | `ActivatedRouteSnapshot` | The route being activated |
| `state` | `RouterStateSnapshot` | The router state |

#### Returns

- `true` - Allow navigation if authenticated
- `false` - Prevent navigation and redirect to login if not authenticated

#### Usage

Apply to routes in routing configuration:

```typescript
{
  path: 'dashboard',
  component: Dashboard,
  canActivate: [authGuard]
}
```

#### Implementation

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

---

## Environment Configuration

**Location**: `src/environments/environment.ts`

Configuration file for environment-specific settings.

### Interface

```typescript
{
  production: boolean;
  stytchPublicToken: string;
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `production` | `boolean` | Whether app is in production mode |
| `stytchPublicToken` | `string` | Stytch public token for authentication |

### Usage

```typescript
import { environment } from '../../environments/environment';

const token = environment.stytchPublicToken;
```

---

## Routing Configuration

**Location**: `src/app/app.routes.ts`

### Routes

| Path | Component | Guard | Description |
|------|-----------|-------|-------------|
| `/` | `Login` | None | Login page |
| `/authenticate` | `Authenticate` | None | Authentication callback handler |
| `/dashboard` | `Dashboard` | `authGuard` | Protected user dashboard |
| `**` | Redirect to `/` | None | Catch-all redirect to login |

### Example

```typescript
export const routes: Routes = [
  { path: '', component: Login },
  { path: 'authenticate', component: Authenticate },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
```

---

## Type Definitions

### User Type

```typescript
interface User {
  user_id: string;
  emails: Array<{
    email: string;
    verified: boolean;
    email_id: string;
  }>;
  name?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
  };
  providers: Array<{
    provider_type: string;
    provider_subject_id: string;
  }>;
  created_at: string;
  status: string;
}
```

### Stytch Callbacks

```typescript
interface Callbacks {
  onSuccess?: (message: any) => void;
  onError?: (message: any) => void;
  onEvent?: (message: any) => void;
}
```

---

## Error Handling

All components implement error handling:

1. **Try-Catch Blocks**: Wrap async operations
2. **Error Display**: Show user-friendly error messages
3. **Logging**: Console.error for debugging
4. **Fallback**: Graceful degradation on failure

Example:
```typescript
try {
  await stytchClient.oauth.authenticate(token, options);
} catch (error: any) {
  console.error('Authentication error:', error);
  this.error = error?.message || 'Authentication failed. Please try again.';
}
```
