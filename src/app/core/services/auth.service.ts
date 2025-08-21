import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  /**
   * Redirects the user to the login page on the backend.
   *
   * The login page on the backend is expected to redirect the user to the
   * authorization URL for the Spotify API, which will then redirect the user to
   * the callback URL on the backend. The callback URL is expected to have a
   * query parameter named `code` which contains the authorization code.
   * The backend is expected to handle the authorization code and redirect the
   * user to the frontend with a query parameter named `code` which contains the
   * authorization code.
   */
  login(): void {
    window.location.href = `${this.apiUrl}/auth/login`;
  }

  /**
   * Handles the callback from the backend after the user has authorized the
   * application on the Spotify API.
   *
   * The callback URL is expected to have a query parameter named `code` which
   * contains the authorization code.
   *
   * @param code The authorization code.
   *
   * @returns An Observable which emits the response from the backend.
   */
  handleCallback(code: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/callback?code=${code}`).pipe(
      tap((response) => {
        if (response.success) {
          this.isAuthenticatedSubject.next(true);
          localStorage.setItem('isAuthenticated', 'true');
        }
      })
    );
  }

  /**
   * Logs the user out of the application.
   *
   * This method sends a POST request to the backend to log the user out, and
   * then navigates the user to the login page.
   *
   * @returns An Observable which emits the response from the backend.
   */
  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
        localStorage.removeItem('isAuthenticated');
        this.router.navigate(['/login']);
      })
    );
  }

  /**
   * Checks if the user is authenticated.
   *
   * This method sends a GET request to the backend to check if the user is
   * authenticated, and then updates the {@link isAuthenticated} and
   * {@link currentUser} subjects accordingly.
   *
   * The request is expected to return a JSON object with a single property
   * `status` which is a string that is either `'success'` or `'error'`.
   *
   * If the request fails, the `isAuthenticated` subject is set to `false` and
   * the `currentUser` subject is set to `null`.
   *
   * @returns An Observable which emits the authentication status as a boolean.
   */
  checkAuthStatus(): Observable<boolean> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/is-auth`).pipe(
      map((response) => response.success),
      tap((isAuth) => {
        this.isAuthenticatedSubject.next(isAuth);
        if (isAuth) {
          localStorage.setItem('isAuthenticated', 'true');
        } else {
          localStorage.removeItem('isAuthenticated');
        }
      }),
      catchError(() => {
        this.isAuthenticatedSubject.next(false);
        localStorage.removeItem('isAuthenticated');
        return of(false);
      })
    );
  }

  /**
   * Returns the current authentication status.
   *
   * @returns A boolean indicating whether the user is authenticated.
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
