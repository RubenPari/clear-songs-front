import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="logo-container">
          <i class="bi bi-music-note-beamed text-primary"></i>
          <h2>Clear Songs</h2>
        </div>
        
        <h3 class="mb-4 text-center text-white">Register</h3>

        <div *ngIf="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" *ngIf="!successMsg">
          <div class="mb-3">
            <label class="form-label text-light">Email address</label>
            <input type="email" class="form-control" formControlName="email" placeholder="name@example.com">
            <div class="text-danger small mt-1" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              Please enter a valid email.
            </div>
          </div>
          
          <div class="mb-4">
            <label class="form-label text-light">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="Password">
            <div class="text-danger small mt-1" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              Password is required (min 6 characters).
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 mb-3 fw-bold" [disabled]="registerForm.invalid || isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Register
          </button>
        </form>

        <div class="text-center mt-3">
          <p class="text-secondary">Already have an account? <a routerLink="/login" class="text-primary text-decoration-none">Login</a></p>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';
    
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMsg = res.data?.message || 'Registration successful. Please check your email.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.error?.message || 'Registration failed.';
      }
    });
  }
}
