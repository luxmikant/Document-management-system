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
    <div class="auth-container">
      <div class="auth-card card">
        <div class="card-body">
          <div class="auth-header">
            <h1>Create Account</h1>
            <p class="text-secondary">Start managing your documents</p>
          </div>
          
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="firstName">First Name</label>
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
                <label class="form-label" for="lastName">Last Name</label>
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
              <label class="form-label" for="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-input"
                [(ngModel)]="email"
                required
                email
                placeholder="you@example.com"
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
              class="btn btn-primary btn-lg w-full" 
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
    .auth-container {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    
    .auth-card {
      width: 100%;
      max-width: 400px;
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    .auth-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    
    .w-full {
      width: 100%;
    }
    
    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
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
    if (!this.firstName || !this.lastName || !this.email || !this.password) return;
    
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
