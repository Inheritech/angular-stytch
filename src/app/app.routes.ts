import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Authenticate } from './components/authenticate/authenticate';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'authenticate', component: Authenticate },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
