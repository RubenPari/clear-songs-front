import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card text-center">
        <div class="logo-container mb-4">
          <i class="bi bi-envelope-check text-primary" style="font-size: 4rem;"></i>
        </div>
        
        <h3 class="mb-4 text-white">Email Confirmation</h3>

        <div *ngIf="isLoading" class="my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-secondary mt-3">Confirming your email address...</p>
        </div>

        <div *ngIf="!isLoading && successMsg" class="alert alert-success">
          {{ successMsg }}
        </div>

        <div *ngIf="!isLoading && errorMsg" class="alert alert-danger">
          {{ errorMsg }}
        </div>

        <div class="mt-4" *ngIf="!isLoading">
          <a routerLink="/login" class="btn btn-primary w-100 fw-bold">Return to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bs-body-bg);
      padding: 1rem;
    }
    
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
      background: var(--bs-gray-900);
      border-radius: 1rem;
      box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.5);
      border: 1px solid var(--bs-gray-800);
    }
  `]
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  isLoading = true;
  successMsg = '';
  errorMsg = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.isLoading = false;
        this.errorMsg = 'No confirmation token provided.';
        return;
      }

      this.authService.confirmEmail(token).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMsg = 'Your email has been confirmed successfully! You can now login.';
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error?.error?.message || 'Failed to confirm email. The token may be invalid or expired.';
        }
      });
    });
  }
}
