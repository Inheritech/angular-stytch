import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  async sendMagicLink() {
    if (!this.email) {
      this.showMessage('Please enter your email', 'error');
      return;
    }

    this.isLoading = true;
    this.message = '';

    try {
      await this.authService.sendMagicLink(this.email);
      this.showMessage('Magic link sent! Check your email.', 'success');
      this.email = '';
    } catch (error) {
      console.error('Error sending magic link:', error);
      this.showMessage('Failed to send magic link. Please try again.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithGoogle() {
    this.isLoading = true;
    try {
      await this.authService.startOAuth('google');
    } catch (error) {
      console.error('Error with Google login:', error);
      this.showMessage('Failed to login with Google. Please try again.', 'error');
      this.isLoading = false;
    }
  }

  async loginWithMicrosoft() {
    this.isLoading = true;
    try {
      await this.authService.startOAuth('microsoft');
    } catch (error) {
      console.error('Error with Microsoft login:', error);
      this.showMessage('Failed to login with Microsoft. Please try again.', 'error');
      this.isLoading = false;
    }
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }
}
