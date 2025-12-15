import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Products } from '@stytch/vanilla-js';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, AfterViewInit {
  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit() {
    this.initializeStytchUI();
  }

  private initializeStytchUI() {
    const stytchClient = this.authService.getStytchClient();

    const callbacks = {
      onEvent: (message: any) => {
        console.log('Stytch event:', message);
      },
      onSuccess: (message: any) => {
        console.log('Stytch success:', message);
        this.authService.updateAuthStatus(true);
        this.router.navigate(['/dashboard']);
      },
      onError: (message: any) => {
        console.error('Stytch error:', message);
      }
    };

    // Mount the Stytch login UI with email magic links and OAuth
    stytchClient.mountLogin({
      elementId: '#stytch-container',
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
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        container: {
          width: '100%',
        },
        colors: {
          primary: '#667eea',
        }
      },
      callbacks,
    });
  }
}
