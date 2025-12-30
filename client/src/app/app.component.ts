import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, CommonModule],
  template: `
    <app-navbar *ngIf="!isFullPage" />
    <main [class.main-content]="!isFullPage">
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
export class AppComponent {
  private router = inject(Router);
  isFullPage = false;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isFullPage = url === '/' || url === '/login' || url === '/register';
    });
  }
}
