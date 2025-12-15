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

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    try {
      this.user = this.authService.getUser();
      this.isLoading = false;
    } catch (error) {
      console.error('Error getting user:', error);
      this.isLoading = false;
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
}
