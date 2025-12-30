import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <span>DMS<span>Pro</span></span>
        </a>
        
        @if (authService.isAuthenticated()) {
          <div class="navbar-links">
            <a routerLink="/dashboard" class="nav-link">Dashboard</a>
            <a routerLink="/documents" class="nav-link">Documents</a>
            <a routerLink="/documents/upload" class="nav-link btn btn-primary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span class="hide-mobile">Upload</span>
            </a>
          </div>
          
          <div class="navbar-user">
            <span class="user-name hide-mobile">{{ authService.currentUser()?.firstName }}</span>
            <button class="btn btn-outline btn-sm" (click)="logout()">Logout</button>
          </div>
        } @else {
          <div class="navbar-links">
            <a routerLink="/login" class="nav-link">Login</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Register</a>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: var(--surface);
      border-bottom: 1px solid var(--border);
      height: 64px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--text);
      text-decoration: none;
    }

    .navbar-brand span span {
      color: var(--primary);
    }
    
    .navbar-brand svg {
      color: var(--primary);
    }
    
    .navbar-links {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      justify-content: center;
    }
    
    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    
    .nav-link:hover {
      color: var(--primary);
      text-decoration: none;
    }
    
    .navbar-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text);
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
