/**
 * Application Routes Configuration
 * 
 * This file defines all the routes for the Clear Songs Angular application.
 * It uses Angular's modern functional guard approach (Angular 15+) instead
 * of class-based guards for better tree-shaking and performance.
 * 
 * Route Structure:
 * - Public routes: login, callback (Spotify OAuth)
 * - Protected routes: All routes under MainLayoutComponent require authentication
 * - Default redirect: Root path and unknown paths redirect to dashboard
 * 
 * Authentication:
 * The authGuard functional guard protects all routes under MainLayoutComponent,
 * ensuring users must be authenticated before accessing the main application features.
 * 
 * @file app.routes.ts
 * @author Clear Songs Development Team
 */
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { CallbackComponent } from './features/auth/callback/callback.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PlaylistsComponent } from './features/playlists/playlists.component';
import { TrackManagementComponent } from './features/tracks/track-management/track-managment.component';

/**
 * Application Routes
 * 
 * Defines the complete routing structure for the application.
 * Routes are evaluated in order, so more specific routes should come before
 * wildcard routes.
 * 
 * @constant routes
 * @type {Routes}
 */
export const routes: Routes = [
  /**
   * Login Route (Public)
   * 
   * Displays the login page where users can authenticate with Spotify.
   * This route is publicly accessible and does not require authentication.
   */
  {
    path: 'login',
    component: LoginComponent,
  },
  
  /**
   * OAuth Callback Route (Public)
   * 
   * Handles the callback from Spotify OAuth flow after user authorization.
   * This route receives the authorization code from Spotify and exchanges it
   * for an access token. After successful authentication, users are redirected
   * to the dashboard.
   */
  {
    path: 'callback',
    component: CallbackComponent,
  },
  
  /**
   * Main Application Layout (Protected)
   * 
   * This is the main container for all authenticated routes. It includes:
   * - The MainLayoutComponent which provides the navigation sidebar and toolbar
   * - Authentication guard that ensures users are logged in
   * - Child routes for different features of the application
   */
  {
    path: '',
    component: MainLayoutComponent,
    /**
     * Authentication Guard
     * 
     * The functional authGuard checks if the user is authenticated before
     * allowing access to any routes under this layout. If not authenticated,
     * the user is redirected to the login page.
     */
    canActivate: [authGuard],
    children: [
      /**
       * Dashboard Route
       * 
       * Displays the main dashboard with library overview, statistics, and
       * artist summary. This is the default landing page after login.
       */
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      
      /**
       * Track Management Route
       * 
       * Provides tools for managing tracks, including deletion by artist
       * or by track count range. Users can filter and delete tracks in bulk.
       */
      {
        path: 'tracks',
        component: TrackManagementComponent,
      },
      
      /**
       * Playlist Management Route
       * 
       * Allows users to manage Spotify playlists, including clearing tracks
       * from playlists and removing tracks from both playlists and the library.
       */
      {
        path: 'playlists',
        component: PlaylistsComponent,
      },
      
      /**
       * Default Child Route
       * 
       * Redirects empty path under main layout to dashboard.
       * Uses 'full' pathMatch to ensure it only matches exactly empty path.
       */
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  
  /**
   * Wildcard Route (Catch-all)
   * 
   * Catches any unmatched routes and redirects to the dashboard.
   * This ensures users always land on a valid page, even if they navigate
   * to a non-existent route.
   */
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
