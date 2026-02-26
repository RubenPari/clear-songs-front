/**
 * Authentication Service
 * 
 * Central service for managing user authentication and session state.
 * This service handles all authentication-related operations including:
 * - Spotify OAuth login flow
 * - Session validation
 * - User logout
 * - Authentication state management using Angular Signals
 * 
 * The service uses Angular Signals (Angular 16+) for reactive state management,
 * providing better performance and simpler API compared to RxJS BehaviorSubjects.
 * 
 * Authentication Flow:
 * 1. User clicks login -> redirects to backend /auth/login
 * 2. Backend redirects to Spotify OAuth
 * 3. User authorizes -> Spotify redirects to /auth/callback with code
 * 4. Backend exchanges code for token -> redirects to frontend /callback
 * 5. Frontend calls handleCallback() -> validates session
 * 6. User is authenticated -> redirected to dashboard
 * 
 * State Management:
 * - Uses signals for reactive authentication state
 * - Automatically checks auth status on service initialization
 * - Syncs with localStorage for persistence across page refreshes
 * 
 * @service
 * @providedIn root
 * @author Clear Songs Development Team
 */
import { Injectable, inject, signal, effect, computed, ResourceStatus } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { HttpClient, httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);
  
  /**
   * Session Resource using httpResource.
   */
  public sessionResource = httpResource<AuthResponse>(`${this.apiUrl}/auth/is-auth`);

  /**
   * Auth state derived from the resource
   */
  public isAuthenticated = computed(() => !!this.sessionResource.value()?.success);
  
  public currentUser = signal<any>(null).asReadonly();

  constructor() {
    // Sync localStorage with session status
    effect(() => {
      const isAuth = this.isAuthenticated();
      if (isAuth) {
        localStorage.setItem('isAuthenticated', 'true');
      } else if (this.sessionResource.status() === ResourceStatus.Resolved) {
        localStorage.removeItem('isAuthenticated');
      }
    });
  }

  login(): void {
    window.location.href = `${this.apiUrl}/auth/login`;
  }

  handleCallback(code: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/callback?code=${code}`).pipe(
      tap((response) => {
        if (response.success) {
          localStorage.setItem('isAuthenticated', 'true');
          this.sessionResource.reload();
        }
      })
    );
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('isAuthenticated');
        this.sessionResource.reload();
        this.router.navigate(['/login']);
      })
    );
  }

  checkAuthStatus(): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      const stop = effect(() => {
        const val = this.sessionResource.value();
        if (val !== undefined) {
          subscriber.next(val.success);
          subscriber.complete();
        }
      });
      return () => stop.destroy();
    });
  }
}
