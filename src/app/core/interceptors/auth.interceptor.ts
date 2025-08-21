import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Add credentials for same-origin requests
  const modifiedRequest = request.clone({
    withCredentials: true,
  });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notificationService.error('Session expired. Please login again.');
        router.navigate(['/login']);
      } else if (error.status === 500) {
        notificationService.error('Server error occurred. Please try again.');
      } else if (error.status === 0) {
        notificationService.error(
          'Unable to connect to server. Please check your connection.'
        );
      }

      return throwError(() => error);
    })
  );
};
