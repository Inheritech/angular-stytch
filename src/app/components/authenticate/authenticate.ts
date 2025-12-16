import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authenticate',
  imports: [CommonModule, RouterLink],
  templateUrl: './authenticate.html',
  styleUrl: './authenticate.css',
})
export class Authenticate implements OnInit {
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: Auth
  ) {}

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const stytch_token_type = this.route.snapshot.queryParamMap.get('stytch_token_type');

    console.group('🔓 Processing Authentication Callback');
    console.log('Token present:', !!token);
    console.log('Token type:', stytch_token_type || 'magic_link (default)');
    console.log('Full URL:', window.location.href);
    console.groupEnd();

    if (!token) {
      console.error('❌ No authentication token found in URL');
      this.error = 'No authentication token found';
      this.isLoading = false;
      return;
    }

    try {
      const stytchClient = this.authService.getStytchClient();
      
      if (stytch_token_type === 'oauth') {
        console.log('🔐 Authenticating via OAuth...');
        // Handle OAuth authentication
        const response = await stytchClient.oauth.authenticate(token, {
          session_duration_minutes: 60,
        });
        console.group('✅ OAuth Authentication Success');
        console.log('Response:', response);
        console.log('User:', response.user);
        console.log('Session:', response.session);
        console.groupEnd();
      } else {
        console.log('🔗 Authenticating via Magic Link...');
        // Handle Magic Link authentication
        const response = await stytchClient.magicLinks.authenticate(token, {
          session_duration_minutes: 60,
        });
        console.group('✅ Magic Link Authentication Success');
        console.log('Response:', response);
        console.log('User:', response.user);
        console.log('Session:', response.session);
        console.groupEnd();
      }
      
      this.authService.updateAuthStatus(true);
      console.log('🎉 Authentication complete, redirecting to dashboard...');
      this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      console.group('❌ Authentication Failed');
      console.error('Error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      console.groupEnd();
      
      this.error = error instanceof Error 
        ? error.message 
        : 'Authentication failed. Please try again.';
      this.isLoading = false;
    }
  }
}
