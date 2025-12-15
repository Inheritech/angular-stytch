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

    if (!token) {
      this.error = 'No authentication token found';
      this.isLoading = false;
      return;
    }

    try {
      const stytchClient = this.authService.getStytchClient();
      
      if (stytch_token_type === 'oauth') {
        // Handle OAuth authentication
        await stytchClient.oauth.authenticate(token, {
          session_duration_minutes: 60,
        });
      } else {
        // Handle Magic Link authentication
        await stytchClient.magicLinks.authenticate(token, {
          session_duration_minutes: 60,
        });
      }
      
      this.authService.updateAuthStatus(true);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Authentication error:', error);
      this.error = error?.message || 'Authentication failed. Please try again.';
      this.isLoading = false;
    }
  }
}
