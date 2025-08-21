import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-callback',
  template: `
    <div class="callback-container">
      <mat-spinner></mat-spinner>
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
  imports: [MatProgressSpinnerModule]
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];

      if (code) {
        this.authService.handleCallback(code).subscribe({
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
        this.notificationService.error('No authorization code received');
        this.router.navigate(['/login']);
      }
    });
  }
}
