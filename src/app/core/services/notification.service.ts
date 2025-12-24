/**
 * Notification Service
 * 
 * A centralized service for displaying toast notifications throughout the application.
 * This service wraps the ngx-toastr library, providing a consistent API for showing
 * different types of notifications (success, error, warning, info).
 * 
 * The service abstracts away the underlying toastr implementation, making it easy
 * to switch notification libraries in the future if needed. It also provides
 * default titles for each notification type, reducing boilerplate code in components.
 * 
 * Features:
 * - Success notifications (green) for successful operations
 * - Error notifications (red) for errors and failures
 * - Warning notifications (orange) for warnings
 * - Info notifications (blue) for informational messages
 * 
 * Usage:
 * ```typescript
 * constructor(private notificationService: NotificationService) {}
 * 
 * this.notificationService.success('Operation completed successfully!');
 * this.notificationService.error('Something went wrong', 'Error Title');
 * ```
 * 
 * @service
 * @providedIn root
 * @author Clear Songs Development Team
 */
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /**
   * Constructor
   * 
   * @param toastr - The ngx-toastr service instance for displaying toast notifications
   */
  constructor(private toastr: ToastrService) {}

  /**
   * Displays a success notification
   * 
   * Shows a green toast notification indicating a successful operation.
   * The notification automatically disappears after the configured timeout
   * (default: 3000ms as set in app.config.ts).
   * 
   * @param message - The message to display in the notification
   * @param title - Optional title for the notification. Defaults to 'Success' if not provided
   * 
   * @example
   * this.notificationService.success('Track deleted successfully');
   * this.notificationService.success('Playlist cleared', 'Success');
   */
  success(message: string, title?: string): void {
    this.toastr.success(message, title || 'Success');
  }

  /**
   * Displays an error notification
   * 
   * Shows a red toast notification indicating an error or failure.
   * Error notifications are typically used for:
   * - HTTP request failures
   * - Validation errors
   * - Unexpected application errors
   * 
   * @param message - The error message to display
   * @param title - Optional title for the notification. Defaults to 'Error' if not provided
   * 
   * @example
   * this.notificationService.error('Failed to load tracks');
   * this.notificationService.error('Invalid playlist ID', 'Validation Error');
   */
  error(message: string, title?: string): void {
    this.toastr.error(message, title || 'Error');
  }

  /**
   * Displays a warning notification
   * 
   * Shows an orange toast notification for warning messages.
   * Warning notifications are used for:
   * - Non-critical issues
   * - User action confirmations
   * - Important information that requires attention
   * 
   * @param message - The warning message to display
   * @param title - Optional title for the notification. Defaults to 'Warning' if not provided
   * 
   * @example
   * this.notificationService.warning('Please specify at least one range value');
   */
  warning(message: string, title?: string): void {
    this.toastr.warning(message, title || 'Warning');
  }

  /**
   * Displays an informational notification
   * 
   * Shows a blue toast notification for informational messages.
   * Info notifications are used for:
   * - General information
   * - Tips and hints
   * - Non-critical status updates
   * 
   * @param message - The informational message to display
   * @param title - Optional title for the notification. Defaults to 'Info' if not provided
   * 
   * @example
   * this.notificationService.info('Backup created successfully');
   */
  info(message: string, title?: string): void {
    this.toastr.info(message, title || 'Info');
  }
}
