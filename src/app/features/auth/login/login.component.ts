/**
 * Login Component
 *
 * This component displays the login page where users can authenticate with Spotify.
 * It provides a simple interface with a button that initiates the Spotify OAuth flow.
 *
 * The component is publicly accessible (no authentication required) and serves as
 * the entry point for new users or users who need to re-authenticate.
 *
 * Authentication Flow:
 * 1. User clicks "Login with Spotify" button
 * 2. Component calls AuthService.login()
 * 3. User is redirected to backend /auth/login endpoint
 * 4. Backend redirects to Spotify OAuth authorization page
 * 5. User authorizes the application
 * 6. Spotify redirects back to /auth/callback
 * 7. Backend handles token exchange and redirects to frontend /callback
 * 8. CallbackComponent completes authentication
 *
 * Features:
 * - Clean, user-friendly login interface
 * - Displays application features and benefits
 * - Single-click Spotify authentication
 *
 * @component
 * @selector app-login
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class LoginComponent {
  /**
   * Constructor
   *
   * @param authService - Service for handling authentication operations
   */
  constructor(private authService: AuthService) {}

  /**
   * Initiates the Spotify OAuth login flow
   *
   * When called, this method redirects the user to the backend authentication
   * endpoint, which then redirects to Spotify's OAuth authorization page.
   *
   * The actual redirect is handled by the AuthService, which uses window.location.href
   * to perform a full page navigation (required for OAuth flows).
   *
   * After successful authentication, the user will be redirected back to the
   * application through the callback route.
   */
  login(): void {
    this.authService.login();
  }
}
