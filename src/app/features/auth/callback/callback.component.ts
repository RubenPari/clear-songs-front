/**
 * OAuth Callback Component
 *
 * This component handles the callback from Spotify OAuth flow after user authorization.
 * It is displayed when Spotify redirects the user back to the application with an
 * authorization code in the query parameters.
 *
 * OAuth Flow:
 * 1. User authorizes app on Spotify
 * 2. Spotify redirects to backend /auth/callback?code=XXX
 * 3. Backend exchanges code for token and creates session
 * 4. Backend redirects to frontend /callback?code=XXX
 * 5. This component extracts the code and validates the session
 * 6. On success: redirects to dashboard
 * 7. On failure: shows error and redirects to login
 *
 * The component displays a loading spinner while processing the authentication,
 * providing visual feedback to the user during the OAuth exchange.
 *
 * @component
 * @selector app-callback
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-callback',
  template: `
    <div class="callback-container">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Authenticating with Spotify...</p>
    </div>
  `,
  styles: [
    `
      .callback-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        p {
          margin-top: 20px;
          font-size: 18px;
          color: #666;
        }
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule]
})
export class CallbackComponent implements OnInit {
  /**
   * DestroyRef for managing subscription cleanup
   * Used with takeUntilDestroyed() to automatically unsubscribe when component is destroyed
   */
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Constructor
   *
   * @param route - ActivatedRoute for accessing query parameters
   * @param router - Router for navigation after authentication
   * @param authService - Service for handling authentication operations
   * @param notificationService - Service for displaying user notifications
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  /**
   * Component Initialization
   *
   * On component initialization, this method:
   * 1. Extracts the authorization code from query parameters
   * 2. Validates the code exists
   * 3. Calls the backend to exchange the code for a session
   * 4. Handles success/failure and navigates accordingly
   *
   * The method uses takeUntilDestroyed() to automatically clean up subscriptions
   * when the component is destroyed, preventing memory leaks.
   */
  ngOnInit(): void {
    /**
     * Extract Authorization Code from Query Parameters
     *
     * Spotify OAuth redirects include the authorization code in the query string.
     * We subscribe to queryParams to get this code and process the authentication.
     */
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const code = params['code'];

        /**
         * Process Authentication
         *
         * The OAuth flow can work in two ways:
         * 1. If a code is present: The backend hasn't processed it yet, so we call handleCallback
         * 2. If no code: The backend has already processed the token exchange and redirected here,
         *    so we just verify authentication status
         */
        if (code) {
          // Backend hasn't processed the code yet, exchange it for a session token
          this.authService.handleCallback(code)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.notificationService.success('Successfully logged in to Spotify!');
                this.router.navigate(['/dashboard']);
              },
              error: () => {
                this.notificationService.error('Failed to authenticate with Spotify');
                this.router.navigate(['/login']);
              },
            });
        } else {
          // Backend has already processed the token exchange, just verify authentication
          this.authService.checkAuthStatus()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (isAuthenticated) => {
                if (isAuthenticated) {
                  this.notificationService.success('Successfully logged in to Spotify!');
                  this.router.navigate(['/dashboard']);
                } else {
                  this.notificationService.error('Authentication failed');
                  this.router.navigate(['/login']);
                }
              },
              error: () => {
                this.notificationService.error('Failed to verify authentication');
                this.router.navigate(['/login']);
              },
            });
        }
      });
  }
}
