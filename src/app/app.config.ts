/**
 * Application Configuration
 * 
 * This file exports the application-wide configuration object that defines
 * all the providers, services, and global settings for the Angular application.
 * 
 * The configuration uses Angular's new standalone provider functions instead
 * of the traditional NgModule-based approach, following modern Angular best practices.
 * 
 * Key configurations:
 * - Zone.js change detection with event coalescing for better performance
 * - Router configuration with application routes
 * - HTTP client with authentication interceptor
 * - Animations support for Material components
 * - Toastr notifications configuration
 * 
 * @file app.config.ts
 * @author Clear Songs Development Team
 */
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

/**
 * Application-wide configuration
 * 
 * This configuration object is used during application bootstrap to provide
 * all necessary services and features to the entire application.
 * 
 * @constant appConfig
 * @type {ApplicationConfig}
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Zone.js Change Detection Configuration
     * 
     * Enables event coalescing which batches multiple change detection cycles
     * that occur within the same event loop, improving performance by reducing
     * unnecessary change detection runs.
     */
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    /**
     * ng-bootstrap Module
     * 
     * Provides Bootstrap components for Angular, including modals, dropdowns, etc.
     */
    importProvidersFrom(NgbModule),
    
    /**
     * Router Configuration
     * 
     * Provides the Angular Router with the application's route definitions.
     * The routes are defined in app.routes.ts and include authentication guards,
     * lazy loading, and nested routes.
     */
    provideRouter(routes),
    
    /**
     * HTTP Client Configuration
     * 
     * Provides the HttpClient service with interceptors. The authInterceptor
     * automatically adds authentication credentials (cookies) to all HTTP requests
     * and handles authentication errors globally.
     */
    provideHttpClient(withInterceptors([authInterceptor])),
    
    /**
     * Animations Support
     * 
     * Enables Angular animations for smooth transitions and interactions.
     */
    provideAnimations(),
    
    /**
     * Toastr Notifications Configuration
     * 
     * Configures the ngx-toastr library for displaying toast notifications
     * throughout the application. Settings include:
     * - timeOut: 3000ms - How long notifications stay visible
     * - positionClass: 'toast-top-right' - Where notifications appear
     * - preventDuplicates: true - Prevents showing duplicate notifications
     */
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    })
  ]
};
