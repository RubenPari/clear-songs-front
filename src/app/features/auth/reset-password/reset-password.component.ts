import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="logo-container">
          <i class="bi bi-music-note-beamed text-primary"></i>
          <h2>Clear Songs</h2>
        </div>
        
        <h3 class="mb-4 text-center text-white">Reset Password</h3>

        <div *ngIf="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!successMsg">
          <div class="mb-4">
            <label class="form-label text-light">New Password</label>
            <input type="password" class="form-control" formControlName="newPassword" placeholder="Enter new password">
            <div class="text-danger small mt-1" *ngIf="resetForm.get('newPassword')?.invalid && resetForm.get('newPassword')?.touched">
              Password must be at least 6 characters long.
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 mb-3 fw-bold" [disabled]="resetForm.invalid || isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Reset Password
          </button>
        </form>

        <div class="text-center mt-3" *ngIf="successMsg">
          <a routerLink="/login" class="btn btn-primary w-100 fw-bold">Go to Login</a>
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

    .logo-container {
      text-align: center;
      margin-bottom: 2rem;

      i {
        font-size: 3rem;
        margin-bottom: 0.5rem;
        display: block;
      }

      h2 {
        font-weight: 700;
        margin: 0;
        color: white;
      }
    }
    
    .form-control {
      background-color: var(--bs-gray-800);
      border-color: var(--bs-gray-700);
      color: white;
      
      &:focus {
        background-color: var(--bs-gray-800);
        border-color: var(--bs-primary);
        color: white;
        box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';
  resetForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMsg = 'Invalid password reset link.';
      }
    });
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    this.errorMsg = '';
    
    const data = {
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    };

    this.authService.resetPassword(data).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMsg = 'Password has been reset successfully. You can now login.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.error?.message || 'Failed to reset password. The link might be expired.';
      }
    });
  }
}
