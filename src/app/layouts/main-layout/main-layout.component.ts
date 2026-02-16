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
import { Component, Inject, Renderer2, OnInit, signal, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbOffcanvas, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
export class MainLayoutComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  isHandset = signal(false);
  isDarkTheme = signal(false);

  constructor(
    public authService: AuthService,
    public loadingService: LoadingService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private offcanvasService: NgbOffcanvas
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Check if screen is mobile (Bootstrap breakpoint: < 768px)
      const checkIsHandset = () => window.innerWidth < 768;
      
      fromEvent(window, 'resize')
        .pipe(
          startWith(null),
          map(() => checkIsHandset()),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(matches => {
          this.isHandset.set(matches);
        });
    }
  }

  private readonly THEME_KEY = 'app-theme-preference';

  ngOnInit(): void {
    this.loadThemePreference();
  }

  private loadThemePreference(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme) {
        this.isDarkTheme.set(savedTheme === 'dark');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkTheme.set(prefersDark);
      }
      this.applyTheme();
    }
  }

  private applyTheme(): void {
    if (this.isDarkTheme()) {
      this.renderer.addClass(this.document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkTheme.update(value => !value);
    this.applyTheme();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, this.isDarkTheme() ? 'dark' : 'light');
    }
  }

  logout(): void {
    this.authService.logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  openSidebar(content: any): void {
    this.offcanvasService.open(content, { position: 'start' });
  }
}
