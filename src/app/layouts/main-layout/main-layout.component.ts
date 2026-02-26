/**
 * Main Layout Component
 * 
 * This is the main application layout that wraps all authenticated routes.
 * It provides the navigation structure, toolbar, and sidebar for the application.
 * 
 * Features:
 * - Responsive sidebar navigation (collapses on mobile)
 * - Application toolbar with user menu
 * - Dark/light theme toggle
 * - Global loading indicator overlay
 * - User profile display and logout functionality
 * 
 * The component uses Angular Signals for reactive state management and
 * BreakpointObserver for responsive behavior. The sidebar automatically
 * adapts to screen size (overlay on mobile, persistent on desktop).
 * 
 * Layout Structure:
 * - Sidebar: Navigation menu with links to main features
 * - Toolbar: App title, theme toggle, user menu
 * - Content Area: Router outlet for child components
 * - Loading Overlay: Global loading indicator
 * 
 * @component
 * @selector app-main-layout
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component, Inject, Renderer2, signal, inject, PLATFORM_ID, effect, untracked } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbOffcanvas, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgbModule
  ]
})
export class MainLayoutComponent {
  private readonly THEME_KEY = 'app-theme-preference';
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private offcanvasService = inject(NgbOffcanvas);
  public authService = inject(AuthService);
  public loadingService = inject(LoadingService);

  isHandset = signal(false);
  isDarkTheme = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Setup handset detection using a simple event listener and signal
      this.isHandset.set(window.innerWidth < 768);
      window.addEventListener('resize', () => {
        this.isHandset.set(window.innerWidth < 768);
      });

      // Load theme preference
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme) {
        this.isDarkTheme.set(savedTheme === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkTheme.set(prefersDark);
      }
    }

    // Effect for applying theme automatically when isDarkTheme signal changes
    effect(() => {
      const isDark = this.isDarkTheme();
      if (isDark) {
        this.renderer.addClass(this.document.body, 'dark-theme');
      } else {
        this.renderer.removeClass(this.document.body, 'dark-theme');
      }
      
      if (isPlatformBrowser(this.platformId)) {
        untracked(() => {
          localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
        });
      }
    });
  }

  toggleTheme(): void {
    this.isDarkTheme.update(value => !value);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  openSidebar(content: any): void {
    this.offcanvasService.open(content, { position: 'start' });
  }
}
