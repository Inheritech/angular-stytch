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

  updateAuthStatus(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }
}
