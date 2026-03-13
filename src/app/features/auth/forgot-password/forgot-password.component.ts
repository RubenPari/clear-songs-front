import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="logo-container">
          <i class="bi bi-music-note-beamed text-primary"></i>
          <h2>Clear Songs</h2>
        </div>
        
        <h3 class="mb-2 text-center text-white">Forgot Password</h3>
        <p class="text-secondary text-center mb-4">Enter your email and we'll send you a link to reset your password.</p>

        <div *ngIf="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" *ngIf="!successMsg">
          <div class="mb-4">
            <label class="form-label text-light">Email address</label>
            <input type="email" class="form-control" formControlName="email" placeholder="name@example.com">
            <div class="text-danger small mt-1" *ngIf="forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched">
              Please enter a valid email.
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 mb-3 fw-bold" [disabled]="forgotForm.invalid || isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Send Reset Link
          </button>
        </form>

        <div class="text-center mt-3">
          <a routerLink="/login" class="text-secondary text-decoration-none"><i class="bi bi-arrow-left me-1"></i> Back to Login</a>
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
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';
    
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMsg = res.data?.message || 'If that email exists, a reset link has been sent.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.error?.message || 'Failed to send reset link.';
      }
    });
  }
}
