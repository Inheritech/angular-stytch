# Angular Stytch Authentication

A sample Angular application demonstrating Consumer authentication with Stytch, featuring passwordless magic links and social login (Google, Microsoft).

## Features

✨ **Passwordless Authentication** - Email magic links for secure, password-free login  
🔐 **Social Login** - OAuth integration with Google and Microsoft  
🎨 **Prebuilt UI** - Stytch's production-ready authentication components  
🛡️ **Route Protection** - Auth guards for protected pages  
📱 **Responsive Design** - Mobile-friendly interface  
🔄 **Session Management** - Automatic session handling and refresh  

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Stytch account ([Sign up here](https://stytch.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/Inheritech/angular-stytch.git
cd angular-stytch

# Install dependencies
npm install

# Configure your Stytch public token
# Edit src/environments/environment.ts and add your token

# Start the development server
npm start
```

Visit `http://localhost:4200` to see the application.

## Documentation

📚 **Comprehensive documentation is available in the `/docs` directory:**

- **[Setup Instructions](./docs/SETUP.md)** - Complete guide to setting up and running the application
  - Stytch account setup
  - OAuth provider configuration
  - Environment configuration
  - Running the app

- **[Integration Guide](./docs/INTEGRATION_GUIDE.md)** - Deep dive into the architecture
  - How Stytch is integrated
  - Authentication flows explained
  - Component architecture
  - Security considerations

- **[Component Documentation](./docs/COMPONENTS.md)** - Detailed API reference
  - Auth Service API
  - Component interfaces
  - Type definitions
  - Error handling

- **[Your App Integration Guide](./docs/YOUR_APP_INTEGRATION.md)** - Add Stytch to your app
  - Step-by-step integration
  - Code examples
  - Customization options
  - Migration from other auth providers

## Technology Stack

- **Angular 21** - Latest Angular framework with standalone components
- **Stytch SDK** - `@stytch/vanilla-js` v5.43.0
- **TypeScript** - Type-safe development
- **RxJS** - Reactive state management
- **CSS3** - Modern styling with gradients and animations

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/           # Login page with Stytch UI
│   │   ├── authenticate/    # Authentication callback handler
│   │   └── dashboard/       # Protected user dashboard
│   ├── services/
│   │   └── auth.ts          # Authentication service
│   ├── guards/
│   │   └── auth-guard.ts    # Route protection
│   └── environments/
│       └── environment.ts   # Configuration
├── docs/                    # Comprehensive documentation
└── ...
```

## Authentication Methods

### 🔗 Magic Links

Users receive a secure, one-time link via email. Clicking the link authenticates them without requiring a password.

**Benefits:**
- No passwords to remember or manage
- Reduces password-related security risks
- Better user experience
- Email verified by default

### 🌐 OAuth Social Login

One-click authentication using existing accounts:
- **Google** - Gmail and Google Workspace accounts
- **Microsoft** - Outlook and Azure AD accounts

**Benefits:**
- Faster signup/login
- Leverages existing trusted accounts
- No additional credentials needed

## Key Components

### Auth Service

Central service managing Stytch client and authentication state.

```typescript
// Check authentication status
if (authService.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = authService.getUser();

// Logout
await authService.logout();
```

### Login Component

Mounts Stytch's prebuilt UI for authentication.

```typescript
stytchClient.mountLogin({
  elementId: 'stytch-container',
  config: {
    products: [Products.emailMagicLinks, Products.oauth],
    // ... configuration
  }
});
```

### Auth Guard

Protects routes from unauthorized access.

```typescript
{
  path: 'dashboard',
  component: Dashboard,
  canActivate: [authGuard]
}
```

## Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Environment Configuration

Update `src/environments/environment.ts` with your Stytch public token:

```typescript
export const environment = {
  production: false,
  stytchPublicToken: 'public-token-test-YOUR-TOKEN-HERE'
};
```

Get your token from the [Stytch Dashboard](https://stytch.com/dashboard).

## Deployment

### Build

```bash
npm run build
```

### Deploy

The built application (in `dist/`) can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages
- Any static hosting service

**Important:** Update your Stytch redirect URLs in the dashboard to match your production domain.

## Security

- ✅ Public token safe for client-side use
- ✅ Sessions managed securely by Stytch
- ✅ CSRF protection built-in
- ✅ HTTPS required for production
- ✅ Tokens transmitted securely
- ✅ No passwords stored or managed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Resources

- [Stytch Documentation](https://stytch.com/docs)
- [Stytch Dashboard](https://stytch.com/dashboard)
- [Angular Documentation](https://angular.io/docs)
- [Stytch JavaScript SDK](https://stytch.com/docs/sdks/javascript-sdk)

## Support

- 📖 Check the [documentation](./docs/)
- 🐛 [Report issues](https://github.com/Inheritech/angular-stytch/issues)
- 💬 [Stytch Community](https://stytch.com/community)
- 📧 [Stytch Support](mailto:support@stytch.com)

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [Angular](https://angular.io)
- Authentication by [Stytch](https://stytch.com)
- Icons from [Google Fonts](https://fonts.google.com/icons)
