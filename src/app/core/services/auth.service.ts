import { Injectable, inject, Injector, signal, effect, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { Observable, tap, filter, map, take } from 'rxjs';
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
    return this.http.get<ApiResponse>(`${this.apiUrl}/auth/logout`).pipe(
      tap(() => {
        localStorage.removeItem('isAuthenticated');
        this.sessionResource.reload();
        this.router.navigate(['/login']);
      }),
    );
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
