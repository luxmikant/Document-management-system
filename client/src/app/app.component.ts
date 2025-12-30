import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-toast />
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 64px);
      padding: 1.5rem 1rem;
    }
    
    @media (min-width: 768px) {
      .main-content {
        padding: 2rem;
      }
    }
  `]
})
export class AppComponent {}
