import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  user: any = null;
  isLoading = true;
  showUserDataJson = false;
  showSessionInfo = false;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    try {
      this.user = this.authService.getUser();
      this.logUserInformation();
      this.logSessionInformation();
      this.isLoading = false;
    } catch (error) {
      console.error('Error getting user:', error);
      this.isLoading = false;
    }
  }

  /**
   * Logs comprehensive user information to console for debugging
   * Includes user object, authentication methods, and metadata
   */
  private logUserInformation(): void {
    console.group('🔐 User Authentication Information');
    console.log('User Object:', this.user);
    console.log('User ID:', this.getUserId());
    console.log('Email:', this.getUserEmail());
    console.log('Name:', this.getUserName());
    console.log('Authentication Method:', this.getAuthMethod());
    console.log('Created At:', this.user?.created_at);
    console.log('Status:', this.user?.status);
    console.log('Providers:', this.user?.providers);
    console.log('Emails:', this.user?.emails);
    console.groupEnd();
  }

  /**
   * Logs session information to console for debugging
   * Includes session details and authentication state
   */
  private logSessionInformation(): void {
    const stytchClient = this.authService.getStytchClient();
    const session = stytchClient.session.getSync();
    
    console.group('📋 Session Information');
    console.log('Session Object:', session);
    console.log('Is Authenticated:', this.authService.isAuthenticated());
    console.log('Session ID:', session?.session_id);
    console.log('Started At:', session?.started_at);
    console.log('Last Accessed At:', session?.last_accessed_at);
    console.log('Expires At:', session?.expires_at);
    console.log('Authentication Factors:', session?.authentication_factors);
    console.groupEnd();
  }

  async logout() {
    console.log('🚪 Logging out user...');
    try {
      await this.authService.logout();
      console.log('✅ Logout successful');
      this.router.navigate(['/']);
    } catch (error) {
      console.error('❌ Error logging out:', error);
    }
  }

  toggleUserDataJson(): void {
    this.showUserDataJson = !this.showUserDataJson;
    console.log('👁️ User Data JSON view:', this.showUserDataJson ? 'shown' : 'hidden');
  }

  toggleSessionInfo(): void {
    this.showSessionInfo = !this.showSessionInfo;
    console.log('👁️ Session Info view:', this.showSessionInfo ? 'shown' : 'hidden');
  }

  getUserJson(): string {
    return JSON.stringify(this.user, null, 2);
  }

  getSessionJson(): string {
    const stytchClient = this.authService.getStytchClient();
    const session = stytchClient.session.getSync();
    return JSON.stringify(session, null, 2);
  }

  getUserEmail(): string {
    return this.user?.emails?.[0]?.email || 'No email available';
  }

  getUserName(): string {
    return this.user?.name?.first_name || this.user?.name?.last_name 
      ? `${this.user.name.first_name || ''} ${this.user.name.last_name || ''}`.trim()
      : 'User';
  }

  getUserId(): string {
    return this.user?.user_id || 'N/A';
  }

  getAuthMethod(): string {
    if (this.user?.providers?.length > 0) {
      return this.user.providers.map((p: any) => p.type).join(', ');
    }
    return 'Unknown';
  }

  getSessionExpiry(): string {
    const stytchClient = this.authService.getStytchClient();
    const session = stytchClient.session.getSync();
    if (session?.expires_at) {
      const expiryDate = new Date(session.expires_at);
      return expiryDate.toLocaleString();
    }
    return 'N/A';
  }
}
