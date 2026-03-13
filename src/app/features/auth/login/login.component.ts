/**
 * Login Component
 *
 * @component
 * @selector app-login
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  currentLang = signal('en');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('app-lang-preference');
      if (savedLang && ['en', 'it'].includes(savedLang)) {
        this.currentLang.set(savedLang);
        this.translate.use(savedLang);
      }
    }
  }

  login(): void {
    this.authService.login();
  }

  switchLanguage(): void {
    const newLang = this.currentLang() === 'en' ? 'it' : 'en';
    this.currentLang.set(newLang);
    this.translate.use(newLang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('app-lang-preference', newLang);
    }
  }
}
