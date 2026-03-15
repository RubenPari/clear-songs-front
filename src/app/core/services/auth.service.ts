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
import { Injectable, inject, Injector, signal, effect, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { Observable, tap, filter, map, take, switchMap, catchError, of } from 'rxjs';
import { HttpClient, httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiResponse, User } from '../models/api-response.model';

const RESOURCE_STATUS_RESOLVED = 'resolved';
const RESOURCE_STATUS_ERROR = 'error';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);
  private injector = inject(Injector);

  /**
   * Session Resource using httpResource.
   */
  public sessionResource = httpResource<ApiResponse<{ user?: User }>>(() => `${this.apiUrl}/auth/is-auth`);

  /**
   * Auth state derived from the resource
   */
  public isAuthenticated = computed(() => !!this.sessionResource.value()?.success);

  private _currentUser = signal<User | null>(null);
  public currentUser = this._currentUser.asReadonly();
  constructor() {
    // Sync localStorage with session status
    effect(() => {
      const session = this.sessionResource.value();
      const isAuth = !!session?.success;
      const status = this.sessionResource.status();
      
      if (isAuth) {
        localStorage.setItem('isAuthenticated', 'true');
        this._currentUser.set(session?.data?.user ?? null);
      } else if (status === RESOURCE_STATUS_RESOLVED || status === RESOURCE_STATUS_ERROR) {
        localStorage.removeItem('isAuthenticated');
        this._currentUser.set(null);
      }
    });
  }

  login(): void {
    window.location.href = `${this.apiUrl}/auth/login`;
  }

  handleCallback(code: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/auth/callback?code=${code}`).pipe(
      tap((response) => {
        if (response.success) {
          localStorage.setItem('isAuthenticated', 'true');
          this.sessionResource.reload();
        }
      }),
    );
  }

  logout(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/local-auth/logout`, {}).pipe(
      switchMap((localLogoutResponse) =>
        this.http.get<ApiResponse>(`${this.apiUrl}/auth/logout`).pipe(
          map(() => localLogoutResponse),
          catchError(() => of(localLogoutResponse))
        )
      ),
      tap(() => {
        localStorage.removeItem('isAuthenticated');
        this.sessionResource.reload();
        this.router.navigate(['/login']);
      }),
    );
  }

  register(data: { email: string; password: string }): Observable<ApiResponse<{ message?: string }>> {
    return this.http.post<ApiResponse<{ message?: string }>>(`${this.apiUrl}/local-auth/register`, data);
  }

  localLogin(data: { email: string; password: string }): Observable<ApiResponse<{ user?: User }>> {
    return this.http.post<ApiResponse<{ user?: User }>>(`${this.apiUrl}/local-auth/login`, data).pipe(
      tap((res) => {
        if (res.success) {
          localStorage.setItem('isAuthenticated', 'true');
          this.sessionResource.reload();
        }
      })
    );
  }

  confirmEmail(token: string): Observable<ApiResponse<{ message?: string }>> {
    return this.http.get<ApiResponse<{ message?: string }>>(`${this.apiUrl}/local-auth/confirm-email?token=${token}`);
  }

  forgotPassword(email: string): Observable<ApiResponse<{ message?: string }>> {
    return this.http.post<ApiResponse<{ message?: string }>>(`${this.apiUrl}/local-auth/forgot-password`, { email });
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/local-auth/reset-password`, data);
  }

  changePassword(data: { oldPassword: string; newPassword: string }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/local-auth/change-password`, data);
  }

  checkAuthStatus(): Observable<boolean> {
    return toObservable(this.sessionResource.status, { injector: this.injector }).pipe(
      filter((status) => status === RESOURCE_STATUS_RESOLVED || status === RESOURCE_STATUS_ERROR),
      map(() => {
        const val = this.sessionResource.value();
        return !!val?.success;
      }),
      take(1)
    );
  }
}
