import { Component, Inject, Renderer2, OnInit, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class MainLayoutComponent implements OnInit {
  isHandset = signal(false);
  isDarkTheme = signal(false);

  constructor(
    public authService: AuthService,
    public loadingService: LoadingService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches)
    ).subscribe(matches => {
      this.isHandset.set(matches);
    });
  }

  ngOnInit(): void {}

  toggleTheme(): void {
    this.isDarkTheme.update(value => !value);
    if (this.isDarkTheme()) {
      this.renderer.addClass(this.document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
    }
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
