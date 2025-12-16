# Integrating Stytch Authentication Into Your Angular Application

This guide shows you how to add Stytch authentication (with magic links and social login) to your existing Angular application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Step-by-Step Integration](#step-by-step-integration)
4. [Customization Options](#customization-options)
5. [Advanced Features](#advanced-features)
6. [Migration from Other Auth Solutions](#migration-from-other-auth-solutions)

## Prerequisites

- Existing Angular application (Angular 14+ recommended)
- Node.js and npm installed
- Stytch account with Consumer project
- Basic understanding of Angular services and routing

## Installation

### Step 1: Install Stytch SDK

```bash
npm install @stytch/vanilla-js
```

### Step 2: Install RxJS (if not already installed)

```bash
npm install rxjs
```

## Step-by-Step Integration

### Step 1: Create Environment Configuration

Create or update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  stytchPublicToken: 'public-token-test-YOUR-TOKEN-HERE'
};
```

And `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  stytchPublicToken: 'public-token-live-YOUR-PRODUCTION-TOKEN-HERE'
};
```

### Step 2: Create Authentication Service

Create `src/app/services/auth.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { StytchUIClient } from '@stytch/vanilla-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private stytch: StytchUIClient;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = 
    this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.stytch = new StytchUIClient(environment.stytchPublicToken);
    this.checkSession();
  }

  private async checkSession(): Promise<void> {
    try {
      const session = this.stytch.session.getSync();
      this.isAuthenticatedSubject.next(!!session);
    } catch (error) {
      console.error('Error checking session:', error);
      this.isAuthenticatedSubject.next(false);
    }
  }

  async logout(): Promise<void> {
    await this.stytch.session.revoke();
    this.isAuthenticatedSubject.next(false);
  }

  getUser() {
    return this.stytch.user.getSync();
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getStytchClient(): StytchUIClient {
    return this.stytch;
  }

  updateAuthStatus(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }
}
```

### Step 3: Create Login Component

Generate a login component:

```bash
ng generate component components/login
```

Update `login.component.ts`:

```typescript
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Products } from '@stytch/vanilla-js';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']); // Or your protected route
    }
  }

  ngAfterViewInit() {
    this.initializeStytchUI();
  }

  private initializeStytchUI() {
    const stytchClient = this.authService.getStytchClient();

    stytchClient.mountLogin({
      elementId: 'stytch-container',
      config: {
        products: [Products.emailMagicLinks, Products.oauth],
        emailMagicLinksOptions: {
          loginRedirectURL: `${window.location.origin}/authenticate`,
          loginExpirationMinutes: 60,
          signupRedirectURL: `${window.location.origin}/authenticate`,
          signupExpirationMinutes: 60,
        },
        oauthOptions: {
          providers: [
            { type: 'google' },
            { type: 'microsoft' }
          ],
          loginRedirectURL: `${window.location.origin}/authenticate`,
          signupRedirectURL: `${window.location.origin}/authenticate`,
        }
      },
      styles: {
        fontFamily: 'inherit',
        colors: {
          primary: '#0066cc', // Your brand color
        }
      },
      callbacks: {
        onSuccess: () => {
          this.authService.updateAuthStatus(true);
          this.router.navigate(['/dashboard']); // Your protected route
        },
        onError: (message) => {
          console.error('Stytch error:', message);
        }
      },
    });
  }
}
```

Update `login.component.html`:

```html
<div class="login-container">
  <div class="login-card">
    <h1>Sign In</h1>
    <div id="stytch-container"></div>
  </div>
</div>
```

Update `login.component.css` (optional styling):

```css
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
}

h1 {
  margin: 0 0 24px 0;
  text-align: center;
}
```

### Step 4: Create Authenticate Component

Generate an authenticate component:

```bash
ng generate component components/authenticate
```

Update `authenticate.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authenticate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent implements OnInit {
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const stytch_token_type = this.route.snapshot.queryParamMap.get('stytch_token_type');

    if (!token) {
      this.error = 'No authentication token found';
      this.isLoading = false;
      return;
    }

    try {
      const stytchClient = this.authService.getStytchClient();
      
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
      this.router.navigate(['/dashboard']); // Your protected route
    } catch (error: any) {
      console.error('Authentication error:', error);
      this.error = error?.message || 'Authentication failed. Please try again.';
      this.isLoading = false;
    }
  }
}
```

Update `authenticate.component.html`:

```html
<div class="authenticate-container">
  @if (isLoading) {
    <div class="loading">
      <div class="spinner"></div>
      <p>Authenticating...</p>
    </div>
  }
  @if (error) {
    <div class="error">
      <h2>Authentication Failed</h2>
      <p>{{ error }}</p>
      <a routerLink="/login">Return to Login</a>
    </div>
  }
</div>
```

### Step 5: Create Auth Guard

Create `src/app/guards/auth.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
```

### Step 6: Update Routes

Update your `app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthenticateComponent } from './components/authenticate/authenticate.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'authenticate', component: AuthenticateComponent },
  
  // Protect your existing routes
  {
    path: 'dashboard',
    component: YourDashboardComponent,
    canActivate: [authGuard]
  },
  
  // Add more protected routes
  {
    path: 'profile',
    component: YourProfileComponent,
    canActivate: [authGuard]
  },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
```

### Step 7: Add Logout to Your Components

In any component where you want logout functionality:

```typescript
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export class YourComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

In the template:

```html
<button (click)="logout()">Logout</button>
```

### Step 8: Display User Information

To show user info in your components:

```typescript
export class ProfileComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getUser();
  }
  
  getUserEmail(): string {
    return this.user?.emails?.[0]?.email || 'No email';
  }
}
```

In the template:

```html
<div class="user-info">
  <p>Email: {{ getUserEmail() }}</p>
  <p>User ID: {{ user?.user_id }}</p>
</div>
```

## Customization Options

### Customize Stytch UI Appearance

```typescript
stytchClient.mountLogin({
  elementId: 'stytch-container',
  config: { /* ... */ },
  styles: {
    // Fonts
    fontFamily: '"Your Font", sans-serif',
    
    // Container
    container: {
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
    },
    
    // Colors
    colors: {
      primary: '#your-brand-color',
      secondary: '#your-secondary-color',
      success: '#00cc00',
      error: '#ff0000',
    },
    
    // Buttons
    buttons: {
      primary: {
        backgroundColor: '#your-brand-color',
        textColor: '#ffffff',
        borderRadius: '4px',
      }
    },
    
    // Input fields
    inputs: {
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      borderColor: '#cccccc',
    }
  }
});
```

### Change Session Duration

```typescript
// In authenticate component
await stytchClient.magicLinks.authenticate(token, {
  session_duration_minutes: 1440, // 24 hours
});
```

### Add More OAuth Providers

```typescript
oauthOptions: {
  providers: [
    { type: 'google' },
    { type: 'microsoft' },
    { type: 'github' },    // Add GitHub
    { type: 'facebook' },  // Add Facebook
    { type: 'apple' },     // Add Apple
  ],
  // ... other options
}
```

Remember to enable these providers in your Stytch Dashboard.

### Customize Redirect URLs per Environment

```typescript
// environment.ts
export const environment = {
  production: false,
  stytchPublicToken: 'public-token-test-...',
  redirectUrl: 'http://localhost:4200/authenticate'
};

// Use in component
emailMagicLinksOptions: {
  loginRedirectURL: environment.redirectUrl,
  signupRedirectURL: environment.redirectUrl,
}
```

## Advanced Features

### Subscribe to Authentication State

```typescript
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated$ = this.authService.isAuthenticated$;
  private subscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subscription = this.isAuthenticated$.subscribe(isAuth => {
      console.log('Auth state changed:', isAuth);
      // Update UI, redirect, etc.
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
```

In template with async pipe:

```html
@if (isAuthenticated$ | async) {
  <button (click)="logout()">Logout</button>
} @else {
  <a routerLink="/login">Login</a>
}
```

### Implement Remember Me

```typescript
// Store preference
localStorage.setItem('rememberMe', 'true');

// Use longer session duration
const sessionDuration = localStorage.getItem('rememberMe') === 'true' 
  ? 43200  // 30 days
  : 60;    // 1 hour

await stytchClient.magicLinks.authenticate(token, {
  session_duration_minutes: sessionDuration,
});
```

### Add Loading States

```typescript
export class LoginComponent {
  isInitializing = true;

  ngAfterViewInit() {
    this.initializeStytchUI();
    this.isInitializing = false;
  }
}
```

```html
@if (isInitializing) {
  <div class="loading-spinner"></div>
} @else {
  <div id="stytch-container"></div>
}
```

### Implement Auto-Redirect After Login

```typescript
// Store intended URL before login
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Store the intended URL
    localStorage.setItem('redirectUrl', state.url);
    router.navigate(['/login']);
    return false;
  }
};

// Redirect after successful login
callbacks: {
  onSuccess: () => {
    const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard';
    localStorage.removeItem('redirectUrl');
    this.authService.updateAuthStatus(true);
    this.router.navigateByUrl(redirectUrl);
  }
}
```

### Add User Profile Management

```typescript
export class ProfileService {
  constructor(private authService: AuthService) {}

  updateProfile(updates: { name?: string }) {
    const stytch = this.authService.getStytchClient();
    // Use Stytch User Management API
    // See: https://stytch.com/docs/api/user-update
  }

  deleteAccount() {
    const stytch = this.authService.getStytchClient();
    // Use Stytch User Delete API
    // See: https://stytch.com/docs/api/user-delete
  }
}
```

## Migration from Other Auth Solutions

### From Firebase Auth

Replace Firebase Auth calls:

```typescript
// Before (Firebase)
await this.afAuth.signInWithEmailLink(email, link);

// After (Stytch)
await stytchClient.magicLinks.authenticate(token, { ... });
```

### From Auth0

Replace Auth0 calls:

```typescript
// Before (Auth0)
await this.auth0.loginWithRedirect();

// After (Stytch)
// Use Stytch OAuth or Magic Links
stytchClient.mountLogin({ ... });
```

### From AWS Cognito

Replace Cognito calls:

```typescript
// Before (Cognito)
await Auth.signIn(username, password);

// After (Stytch)
// Use passwordless authentication
stytchClient.mountLogin({ ... });
```

## Testing

### Unit Testing with Jasmine/Jest

Mock the auth service:

```typescript
describe('ProtectedComponent', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'getUser',
      'logout'
    ]);
    authServiceSpy.isAuthenticated.and.returnValue(true);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
  });

  it('should display user info when authenticated', () => {
    authServiceSpy.getUser.and.returnValue({
      user_id: '123',
      emails: [{ email: 'test@example.com' }]
    });
    
    // Test your component
  });
});
```

### E2E Testing

Use Cypress or Playwright to test authentication flows.

## Best Practices

1. **Never expose secret tokens** in frontend code
2. **Always use HTTPS** in production
3. **Implement proper error handling** for all auth operations
4. **Set appropriate session durations** based on security needs
5. **Monitor auth logs** in Stytch Dashboard
6. **Keep SDK updated** to latest version
7. **Test all auth flows** before production deployment
8. **Use environment variables** for configuration
9. **Implement loading states** for better UX
10. **Handle edge cases** (expired sessions, network errors, etc.)

## Next Steps

- Review the [Integration Guide](./INTEGRATION_GUIDE.md) for architecture details
- Check [Component Documentation](./COMPONENTS.md) for API reference
- Read [Setup Instructions](./SETUP.md) for Stytch configuration
- Explore [Stytch Docs](https://stytch.com/docs) for advanced features

## Support

For issues or questions:
- Check [Stytch Documentation](https://stytch.com/docs)
- Visit [Stytch Community](https://stytch.com/community)
- Contact [Stytch Support](mailto:support@stytch.com)
