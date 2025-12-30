import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'documents',
    canActivate: [authGuard],
    loadComponent: () => import('./features/documents/document-list/document-list.component').then(m => m.DocumentListComponent)
  },
  {
    path: 'documents/upload',
    canActivate: [authGuard],
    loadComponent: () => import('./features/documents/document-upload/document-upload.component').then(m => m.DocumentUploadComponent)
  },
  {
    path: 'documents/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/documents/document-detail/document-detail.component').then(m => m.DocumentDetailComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
