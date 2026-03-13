import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMsg = '';

  onLocalLogin() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';
    
    this.authService.localLogin(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/']); // Redirect to dashboard
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.error?.message || 'Login failed.';
      }
    });
  }

  loginWithSpotify(): void {
    this.authService.login();
  }
}