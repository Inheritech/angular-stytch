import { Injectable } from '@angular/core';
import { StytchUIClient } from '@stytch/vanilla-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private stytch: StytchUIClient;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

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

  async sendMagicLink(email: string): Promise<void> {
    await this.stytch.magicLinks.email.loginOrCreate({
      email,
      login_magic_link_url: `${window.location.origin}/authenticate`,
      signup_magic_link_url: `${window.location.origin}/authenticate`,
    });
  }

  async authenticateToken(token: string): Promise<void> {
    await this.stytch.magicLinks.authenticate({
      magic_links_token: token,
      session_duration_minutes: 60,
    });
    this.isAuthenticatedSubject.next(true);
  }

  async startOAuth(provider: 'google' | 'microsoft'): Promise<void> {
    await this.stytch.oauth[provider].start({
      login_redirect_url: `${window.location.origin}/authenticate`,
      signup_redirect_url: `${window.location.origin}/authenticate`,
    });
  }

  async authenticateOAuth(token: string): Promise<void> {
    await this.stytch.oauth.authenticate({
      oauth_token: token,
      session_duration_minutes: 60,
    });
    this.isAuthenticatedSubject.next(true);
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
}
