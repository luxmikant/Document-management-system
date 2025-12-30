import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-side hide-mobile">
        <div class="auth-side-content">
          <div class="logo white">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span class="logo-text">DMS<span>Pro</span></span>
          </div>
          <h1>Manage your documents with <span>confidence</span>.</h1>
          <p>Join thousands of professionals who use DMSPro to secure their business intelligence.</p>
          
          <div class="auth-features">
            <div class="auth-feature">
              <div class="feature-dot"></div>
              <span>Enterprise-grade security</span>
            </div>
            <div class="auth-feature">
              <div class="feature-dot"></div>
              <span>Real-time collaboration</span>
            </div>
            <div class="auth-feature">
              <div class="feature-dot"></div>
              <span>Advanced version control</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="auth-form-side">
        <div class="auth-form-container">
          <div class="auth-header">
            <div class="logo mobile-only">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span class="logo-text">DMS<span>Pro</span></span>
            </div>
            <h2>Welcome back</h2>
            <p class="text-secondary">Please enter your details to sign in</p>
          </div>
          
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-input"
                [(ngModel)]="email"
                required
                email
                placeholder="name@company.com"
                [disabled]="loading()"
              />
            </div>
            
            <div class="form-group">
              <div class="label-row">
                <label class="form-label" for="password">Password</label>
                <a href="#" class="forgot-link">Forgot password?</a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                class="form-input"
                [(ngModel)]="password"
                required
                minlength="6"
                placeholder="••••••••"
                [disabled]="loading()"
              />
            </div>
            
            @if (error()) {
              <div class="alert alert-error">{{ error() }}</div>
            }
            
            <button 
              type="submit" 
              class="btn btn-primary btn-lg w-full gradient-btn" 
              [disabled]="loading() || !loginForm.valid"
            >
              @if (loading()) {
                <span class="spinner"></span>
                Signing in...
              } @else {
                Sign In
              }
            </button>
            
            <button type="button" class="btn btn-outline w-full google-btn">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="Google">
              Sign in with Google
            </button>
          </form>
          
          <p class="auth-footer">
            Don't have an account? <a routerLink="/register">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
      background: #fff;
      margin: -2rem; /* Offset app-root padding */
    }

    .auth-side {
      flex: 1;
      background: #1e293b;
      background-image: radial-gradient(circle at top right, rgba(132, 204, 22, 0.15), transparent 40%),
                        linear-gradient(to bottom, #1e293b, #0f172a);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      color: #fff;
      position: relative;
      overflow: hidden;
    }

    .auth-side-content {
      max-width: 480px;
      position: relative;
      z-index: 1;
    }

    .auth-side h1 {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 2rem 0 1.5rem;
      letter-spacing: -0.025em;
    }

    .auth-side h1 span {
      color: var(--primary);
    }

    .auth-side p {
      font-size: 1.125rem;
      color: #94a3b8;
      margin-bottom: 3rem;
    }

    .auth-features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .auth-feature {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 500;
    }

    .feature-dot {
      width: 8px;
      height: 8px;
      background: var(--primary);
      border-radius: 50%;
      box-shadow: 0 0 12px var(--primary);
    }

    .auth-form-side {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-form-container {
      width: 100%;
      max-width: 400px;
    }

    .auth-header {
      margin-bottom: 2.5rem;
    }

    .auth-header h2 {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.025em;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .logo.white { color: #fff; }
    .logo-text { font-weight: 700; font-size: 1.25rem; }
    .logo-text span { color: var(--primary); }

    .mobile-only { display: none; }

    @media (max-width: 992px) {
      .hide-mobile { display: none; }
      .mobile-only { display: flex; }
      .auth-page { margin: 0; }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .form-label { margin-bottom: 0; }

    .forgot-link {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--primary-dark);
    }

    .gradient-btn {
      background: var(--primary-gradient);
      border: none;
      font-weight: 600;
      height: 48px;
      margin-top: 1rem;
    }

    .gradient-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .google-btn {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-weight: 500;
      border-color: #e2e8f0;
    }

    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;
    }

    .auth-footer a {
      font-weight: 600;
      color: var(--primary-dark);
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .alert-error {
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fee2e2;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    
    this.loading.set(true);
    this.error.set('');
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigate(['/documents']);
      },
      error: (err) => {
        this.error.set(err.message || 'Login failed');
        this.loading.set(false);
      }
    });
  }
}
