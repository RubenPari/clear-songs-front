/**
 * Authentication Route Guard
 * 
 * This functional guard (Angular 15+) protects routes that require authentication.
 * It checks if the user is authenticated before allowing access to protected routes.
 * 
 * How it works:
 * 1. When a user navigates to a protected route, this guard is executed
 * 2. It calls AuthService.checkAuthStatus() to verify authentication
 * 3. If authenticated: allows navigation (returns true)
 * 4. If not authenticated: redirects to login page (returns UrlTree)
 * 
 * The guard uses Angular's functional guard approach, which is:
 * - More tree-shakeable than class-based guards
 * - Better for performance
 * - Easier to test
 * - Uses inject() for dependency injection
 * 
 * Usage:
 * Applied to routes in app.routes.ts:
 * ```typescript
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 * ```
 * 
 * @file auth.guard.ts
 * @author Clear Songs Development Team
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Guard Function
 * 
 * Functional route guard that protects routes requiring authentication.
 * Returns an Observable that emits:
 * - true: User is authenticated, allow navigation
 * - UrlTree: User is not authenticated, redirect to login
 * 
 * The guard is executed before route activation, ensuring unauthorized
 * users cannot access protected pages.
 * 
 * @returns Observable<boolean | UrlTree>
 * 
 * @example
 * // In app.routes.ts:
 * {
 *   path: 'protected',
 *   component: ProtectedComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = () => {
  // Inject dependencies using Angular's inject() function
  // This is the modern way to get services in functional guards
  const authService = inject(AuthService);
  const router = inject(Router);

  /**
   * Check Authentication Status
   * 
   * Calls the AuthService to verify if the user has a valid session.
   * The checkAuthStatus() method makes an HTTP request to the backend
   * to validate the current session.
   * 
   * The result is mapped to either:
   * - true: User is authenticated, allow route activation
   * - UrlTree: User is not authenticated, redirect to login page
   */
  return authService.checkAuthStatus().pipe(
    map((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        // User is authenticated, allow navigation to the protected route
        return true;
      }
      // User is not authenticated, redirect to login page
      // createUrlTree() creates a navigation target that the router can use
      return router.createUrlTree(['/login']);
    })
  );
};
