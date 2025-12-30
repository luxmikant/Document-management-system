import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-register',
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
          <h1>Start your <span>journey</span> with us today.</h1>
          <p>Experience the most secure and intuitive document management platform ever built.</p>
          
          <div class="auth-features">
            <div class="auth-feature">
              <div class="feature-dot"></div>
              <span>Free 14-day trial</span>
            </div>
            <div class="auth-feature">
              <div class="feature-dot"></div>
              <span>No credit card required</span>
            </div>
            <div class="auth-feature">
              <div class="feature-dot"></div>
              <span>Instant setup</span>
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
            <h2>Create account</h2>
            <p class="text-secondary">Join DMSPro and start organizing</p>
          </div>
          
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  class="form-input"
                  [(ngModel)]="firstName"
                  required
                  placeholder="John"
                  [disabled]="loading()"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  class="form-input"
                  [(ngModel)]="lastName"
                  required
                  placeholder="Doe"
                  [disabled]="loading()"
                />
              </div>
            </div>
            
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
              <label class="form-label" for="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                class="form-input"
                [(ngModel)]="password"
                required
                minlength="6"
                placeholder="At least 6 characters"
                [disabled]="loading()"
              />
            </div>
            
            @if (error()) {
              <div class="alert alert-error">{{ error() }}</div>
            }
            
            <button 
              type="submit" 
              class="btn btn-primary btn-lg w-full gradient-btn" 
              [disabled]="loading() || !registerForm.valid"
            >
              @if (loading()) {
                <span class="spinner"></span>
                Creating account...
              } @else {
                Create Account
              }
            </button>
          </form>
          
          <p class="auth-footer">
            Already have an account? <a routerLink="/login">Sign in</a>
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
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  onSubmit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) return;
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    
    this.loading.set(true);
    this.error.set('');
    
    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.toast.success('Account created successfully!');
        this.router.navigate(['/documents']);
      },
      error: (err) => {
        this.error.set(err.message || 'Registration failed');
        this.loading.set(false);
      }
    });
  }
}
