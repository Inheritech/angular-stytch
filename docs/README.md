# Documentation Index

Welcome to the Angular Stytch Authentication documentation! This comprehensive guide covers everything you need to know about implementing, understanding, and customizing Stytch Consumer authentication in Angular applications.

## 📚 Documentation Overview

This documentation is organized into four main guides, each serving a specific purpose:

### 1. [Setup Instructions](./SETUP.md) - Get Started Quickly

**Start here if you're new to the project.**

This guide walks you through:
- Creating a Stytch account and project
- Configuring authentication methods (magic links, OAuth)
- Installing and running the application
- Testing authentication flows
- Troubleshooting common issues

**Time to complete:** 15-20 minutes  
**Best for:** First-time users, deployment setup

---

### 2. [Integration Guide](./INTEGRATION_GUIDE.md) - Understand the Architecture

**Read this to understand how everything works.**

Deep dive into:
- Overall architecture and design decisions
- Why we use Stytch prebuilt UI
- Implementation details of each component
- Authentication flow diagrams
- Security considerations and best practices

**Time to read:** 30-45 minutes  
**Best for:** Developers wanting to understand the codebase, technical decision-makers

---

### 3. [Component Documentation](./COMPONENTS.md) - API Reference

**Use this as a reference when working with the code.**

Comprehensive API documentation for:
- Auth Service (methods, properties, usage)
- Login Component (lifecycle, configuration)
- Authenticate Component (callback handling)
- Dashboard Component (user data access)
- Auth Guard (route protection)
- Type definitions and interfaces

**Time to reference:** As needed  
**Best for:** Developers modifying or extending the application

---

### 4. [Your App Integration Guide](./YOUR_APP_INTEGRATION.md) - Add to Your Project

**Follow this to add Stytch auth to your existing Angular app.**

Step-by-step integration guide:
- Adding Stytch to existing Angular projects
- Code examples and templates
- Customization options (styling, behavior)
- Advanced features (remember me, auto-redirect)
- Migration from other auth solutions

**Time to complete:** 1-2 hours  
**Best for:** Developers adding authentication to existing applications

---

## 🚀 Quick Navigation

### I want to...

**...run this application**  
→ Go to [Setup Instructions](./SETUP.md)

**...understand how Stytch is integrated**  
→ Read the [Integration Guide](./INTEGRATION_GUIDE.md)

**...look up a specific API or component**  
→ Check [Component Documentation](./COMPONENTS.md)

**...add this to my own Angular app**  
→ Follow [Your App Integration Guide](./YOUR_APP_INTEGRATION.md)

**...customize the authentication UI**  
→ See [Customization Options](./YOUR_APP_INTEGRATION.md#customization-options)

**...change authentication settings**  
→ See [Setup: Configure Stytch](./SETUP.md#stytch-account-setup)

**...troubleshoot an issue**  
→ Check [Troubleshooting](./SETUP.md#troubleshooting)

---

## 📖 Reading Order

### For New Users

1. **[Setup Instructions](./SETUP.md)** - Get the app running
2. **[Integration Guide](./INTEGRATION_GUIDE.md)** - Understand the implementation
3. **[Component Documentation](./COMPONENTS.md)** - Reference as needed

### For Integrators

1. **[Your App Integration Guide](./YOUR_APP_INTEGRATION.md)** - Add to your app
2. **[Component Documentation](./COMPONENTS.md)** - API reference
3. **[Integration Guide](./INTEGRATION_GUIDE.md)** - Deep dive when needed

### For Evaluators

1. **[Integration Guide](./INTEGRATION_GUIDE.md)** - Architecture overview
2. **[Setup Instructions](./SETUP.md)** - See it in action
3. **[Component Documentation](./COMPONENTS.md)** - Technical details

---

## 🎯 Key Concepts

### Stytch Prebuilt UI

This application uses Stytch's prebuilt UI components rather than custom forms. This provides:
- Production-ready authentication interface
- Built-in security best practices
- Automatic updates from Stytch
- Consistent user experience
- Reduced development time

Learn more in the [Integration Guide](./INTEGRATION_GUIDE.md#why-stytch-prebuilt-ui).

### Authentication Methods

Two primary authentication methods are implemented:

**Email Magic Links** - Passwordless authentication via email  
**OAuth Social Login** - Google and Microsoft integration

See the [Integration Guide](./INTEGRATION_GUIDE.md#authentication-flows) for flow diagrams.

### Session Management

Sessions are managed automatically by the Stytch SDK with:
- Secure token storage
- Automatic refresh
- Configurable duration
- Logout functionality

Details in [Component Documentation](./COMPONENTS.md#auth-service).

---

## 💡 Common Tasks

### Changing the Primary Color

```typescript
// In login component
styles: {
  colors: {
    primary: '#your-brand-color',
  }
}
```

See [Customization Options](./YOUR_APP_INTEGRATION.md#customization-options).

### Adding More OAuth Providers

1. Enable provider in Stytch Dashboard
2. Add to `oauthOptions.providers` array

See [Your App Integration Guide](./YOUR_APP_INTEGRATION.md#add-more-oauth-providers).

### Changing Session Duration

```typescript
await stytchClient.magicLinks.authenticate(token, {
  session_duration_minutes: 1440, // 24 hours
});
```

See [Customization Options](./YOUR_APP_INTEGRATION.md#change-session-duration).

### Protecting Routes

```typescript
{
  path: 'protected',
  component: YourComponent,
  canActivate: [authGuard]
}
```

See [Component Documentation](./COMPONENTS.md#auth-guard).

---

## 🔍 Architecture at a Glance

```
┌─────────────────────────────────────────┐
│           User Interface                │
│  (Login, Dashboard, Authenticate)       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Auth Service                    │
│  • Manages Stytch client                │
│  • Tracks authentication state          │
│  • Exposes user information             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Stytch SDK                         │
│  • Prebuilt UI components               │
│  • Magic link handling                  │
│  • OAuth integration                    │
│  • Session management                   │
└─────────────────────────────────────────┘
```

---

## 📊 Document Statistics

| Document | Size | Sections | Best For |
|----------|------|----------|----------|
| Setup Instructions | ~10KB | 7 | Getting started |
| Integration Guide | ~11KB | 6 | Understanding architecture |
| Component Documentation | ~12KB | 9 | API reference |
| Your App Integration | ~17KB | 8 | Adding to your app |
| **Total** | **~51KB** | **30+** | Complete coverage |

---

## 🔗 External Resources

### Stytch Resources
- [Stytch Documentation](https://stytch.com/docs)
- [Stytch Dashboard](https://stytch.com/dashboard)
- [JavaScript SDK Docs](https://stytch.com/docs/sdks/javascript-sdk)
- [Stytch Community](https://stytch.com/community)

### Angular Resources
- [Angular Documentation](https://angular.io/docs)
- [Angular CLI](https://angular.io/cli)
- [Angular Router](https://angular.io/guide/router)

---

## 🤝 Getting Help

### Within This Documentation
1. Use the Quick Navigation section above
2. Check the relevant guide based on your task
3. Review troubleshooting sections

### External Support
- **Stytch Support**: [support@stytch.com](mailto:support@stytch.com)
- **Stytch Community**: [stytch.com/community](https://stytch.com/community)
- **GitHub Issues**: For bugs in this implementation

---

## 📝 Documentation Conventions

Throughout this documentation:

- **Code blocks** show example implementations
- **Diagrams** illustrate flows and architecture
- **Tables** provide quick reference
- **Callouts** highlight important information
- **Links** connect related topics

---

## 🔄 Keep Documentation Updated

This documentation reflects the current implementation. When making changes:

1. Update relevant documentation files
2. Ensure code examples match implementation
3. Update diagrams if architecture changes
4. Keep external links current

---

## License

This documentation is part of the Angular Stytch Authentication project and follows the same license.

---

**Ready to get started?**  
→ Head to [Setup Instructions](./SETUP.md) to run the application  
→ Or jump to [Your App Integration Guide](./YOUR_APP_INTEGRATION.md) to add to your project
