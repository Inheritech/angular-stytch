# Setup Instructions

This guide walks you through setting up and running the Angular Stytch application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stytch Account Setup](#stytch-account-setup)
3. [Application Setup](#application-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Testing Authentication](#testing-authentication)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For cloning the repository

### Verify Installation

```bash
node --version  # Should show v18.x or higher
npm --version   # Should show 9.x or higher
```

## Stytch Account Setup

### Step 1: Create a Stytch Account

1. Go to [https://stytch.com](https://stytch.com)
2. Click "Start now" or "Sign up"
3. Complete the registration process
4. Verify your email address

### Step 2: Create a Project

1. Log in to the [Stytch Dashboard](https://stytch.com/dashboard)
2. Click "Create a new project"
3. Choose **"Consumer"** as the project type (not B2B)
4. Name your project (e.g., "Angular Auth Demo")
5. Click "Create project"

### Step 3: Get Your Public Token

1. In your project dashboard, navigate to **"API Keys"** in the left sidebar
2. Find the **"Public token"** section
3. Copy the public token (starts with `public-token-test-` for test environment)
4. Keep this token safe - you'll need it for configuration

**Important**: 
- Use **Test** environment for development
- Use **Live** environment only for production
- Never expose secret tokens in frontend code

### Step 4: Configure Redirect URLs

1. In the Stytch Dashboard, go to **"Redirect URLs"**
2. Add the following URLs for local development:
   - `http://localhost:4200/authenticate`
3. For production, add your production URL:
   - `https://yourdomain.com/authenticate`

### Step 5: Enable Authentication Methods

#### Enable Email Magic Links

1. Go to **"Email magic links"** in the sidebar
2. Toggle **"Email magic links"** to enabled
3. Configure settings:
   - **Expiration**: 60 minutes (or your preference)
   - **Email template**: Customize if desired
4. Save changes

#### Enable OAuth Providers

**For Google OAuth:**

1. Go to **"OAuth"** → **"Google"** in the sidebar
2. Toggle **"Google OAuth"** to enabled
3. You can use Stytch's test credentials for development, or:
   - Create a Google OAuth app in [Google Cloud Console](https://console.cloud.google.com/)
   - Add Client ID and Client Secret to Stytch
4. Configure redirect URIs in Google Console:
   - Add `https://test.stytch.com/v1/public/oauth/google/start` (for test)
5. Save changes

**For Microsoft OAuth:**

1. Go to **"OAuth"** → **"Microsoft"** in the sidebar
2. Toggle **"Microsoft OAuth"** to enabled
3. You can use Stytch's test credentials for development, or:
   - Create an Azure AD app in [Azure Portal](https://portal.azure.com/)
   - Add Application (client) ID and Client Secret to Stytch
4. Configure redirect URIs in Azure:
   - Add `https://test.stytch.com/v1/public/oauth/microsoft/start` (for test)
5. Save changes

**Note**: For development/testing, Stytch provides test credentials for OAuth providers, so you don't need to set up your own OAuth apps immediately.

### Step 6: Test Your Configuration

1. In Stytch Dashboard, go to **"Testing"**
2. Use the built-in test tools to verify:
   - Magic links are being sent
   - OAuth flows work correctly
   - Sessions are being created

## Application Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Inheritech/angular-stytch.git
cd angular-stytch
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Angular 21.x
- Stytch Vanilla JS SDK
- Other required dependencies

### Step 3: Verify Installation

```bash
npm list @stytch/vanilla-js
```

Should show `@stytch/vanilla-js@5.43.0` or higher.

## Configuration

### Step 1: Update Environment File

Open `src/environments/environment.ts` and replace the placeholder with your Stytch public token:

```typescript
export const environment = {
  production: false,
  stytchPublicToken: 'public-token-test-YOUR-ACTUAL-TOKEN-HERE'
};
```

**Replace** `YOUR-ACTUAL-TOKEN-HERE` with the public token from your Stytch Dashboard.

### Step 2: Update Environment for Production (Optional)

If deploying to production, update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  stytchPublicToken: 'public-token-live-YOUR-PRODUCTION-TOKEN-HERE'
};
```

**Important**: Use your **Live** environment token for production.

### Step 3: Configure Angular Environment (Optional)

If you need different environments, update `angular.json`:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ]
  }
}
```

## Running the Application

### Development Server

Start the development server:

```bash
npm start
```

Or:

```bash
ng serve
```

The application will be available at:
- **URL**: `http://localhost:4200`
- **Hot reload**: Automatically reloads on file changes

### Production Build

Build for production:

```bash
npm run build
```

The build artifacts will be in the `dist/` directory.

### Serve Production Build Locally

To test the production build locally:

```bash
npm install -g http-server
cd dist/angular-stytch-app
http-server -p 8080
```

Then visit `http://localhost:8080`

## Testing Authentication

### Test Magic Link Authentication

1. Open `http://localhost:4200`
2. Enter your email address
3. Click "Send Magic Link"
4. Check your email for the magic link
5. Click the link in the email
6. You should be redirected to the dashboard

**Note**: In test environment, magic links expire after 60 minutes.

### Test Google OAuth

1. Open `http://localhost:4200`
2. Click "Continue with Google"
3. Complete Google authentication
4. You should be redirected to the dashboard

**Note**: You may need to configure Google OAuth in Stytch Dashboard.

### Test Microsoft OAuth

1. Open `http://localhost:4200`
2. Click "Continue with Microsoft"
3. Complete Microsoft authentication
4. You should be redirected to the dashboard

**Note**: You may need to configure Microsoft OAuth in Stytch Dashboard.

### Test Protected Routes

1. Try accessing `http://localhost:4200/dashboard` without logging in
2. You should be redirected to the login page
3. Log in and verify you can access the dashboard

### Test Logout

1. Log in to the application
2. Navigate to the dashboard
3. Click the "Logout" button
4. Verify you're redirected to login
5. Try accessing dashboard again - should redirect to login

## Troubleshooting

### Issue: "Public token is invalid"

**Solution**:
- Verify you've copied the correct public token from Stytch Dashboard
- Ensure you're using a token from the Consumer project (not B2B)
- Check that you're using the Test token for development

### Issue: "Redirect URL is not allowed"

**Solution**:
- Add `http://localhost:4200/authenticate` to allowed redirect URLs in Stytch Dashboard
- Ensure the URL exactly matches (no trailing slash, correct protocol)
- Wait a few minutes for changes to propagate

### Issue: "Magic link not received"

**Solution**:
- Check your spam/junk folder
- Verify email magic links are enabled in Stytch Dashboard
- Check Stytch Dashboard logs for delivery status
- Try with a different email address

### Issue: "OAuth provider not configured"

**Solution**:
- Ensure the OAuth provider is enabled in Stytch Dashboard
- For development, use Stytch's test credentials
- For production, configure your own OAuth app
- Check that redirect URLs are correctly configured in OAuth provider

### Issue: "CORS errors in console"

**Solution**:
- Stytch handles CORS automatically
- If seeing CORS errors, verify your domain is correct
- Check that you're using the correct environment (test vs live)

### Issue: "Session not persisting after refresh"

**Solution**:
- Clear browser cookies and local storage
- Ensure session_duration_minutes is set correctly
- Check browser console for session errors
- Verify Stytch SDK is properly initialized

### Issue: "Build errors with TypeScript"

**Solution**:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
rm -rf .angular
```

### Issue: "Application won't start"

**Solution**:
```bash
# Check for port conflicts
lsof -ti:4200 | xargs kill -9

# Start with different port
ng serve --port 4201
```

## Development Tips

### 1. Use Angular DevTools

Install the [Angular DevTools](https://angular.io/guide/devtools) browser extension for debugging.

### 2. Monitor Network Requests

Open browser DevTools → Network tab to monitor Stytch API calls.

### 3. Check Stytch Logs

View authentication events in real-time in Stytch Dashboard → Logs.

### 4. Enable Verbose Logging

Add to `environment.ts`:

```typescript
export const environment = {
  production: false,
  stytchPublicToken: 'your-token',
  debugMode: true
};
```

### 5. Hot Module Replacement

Angular CLI supports HMR for faster development:

```bash
ng serve --hmr
```

## Next Steps

- Review [Integration Guide](./INTEGRATION_GUIDE.md) to understand the implementation
- Check [Component Documentation](./COMPONENTS.md) for API details
- See [Your App Integration Guide](./YOUR_APP_INTEGRATION.md) to add to your own app
- Explore [Stytch Documentation](https://stytch.com/docs) for advanced features

## Additional Resources

- [Stytch Documentation](https://stytch.com/docs)
- [Stytch Dashboard](https://stytch.com/dashboard)
- [Angular Documentation](https://angular.io/docs)
- [Stytch JavaScript SDK](https://stytch.com/docs/sdks/javascript-sdk)
- [Stytch Community](https://stytch.com/community)

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Stytch Dashboard logs
3. Check browser console for errors
4. Contact Stytch support at [support@stytch.com](mailto:support@stytch.com)
