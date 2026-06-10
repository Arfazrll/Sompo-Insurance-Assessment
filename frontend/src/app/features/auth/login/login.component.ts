import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../shared/models/api-error.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  // Animation State to pass to AuthIllustrationComponent
  isTyping = false;
  isLookingAtEachOther = false;
  isPurplePeeking = false;

  private lookTimeout: any;
  private peekTimeout: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.loginForm.get('password')?.valueChanges.subscribe(val => {
      this.handlePasswordPeeking(val);
    });
  }

  ngOnDestroy() {
    clearTimeout(this.lookTimeout);
    clearTimeout(this.peekTimeout);
  }

  // Typing Logics
  onInputFocus() {
    this.isTyping = true;
    this.isLookingAtEachOther = true;
    clearTimeout(this.lookTimeout);
    this.lookTimeout = setTimeout(() => {
      this.isLookingAtEachOther = false;
    }, 800);
  }

  onInputBlur() {
    this.isTyping = false;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
    this.handlePasswordPeeking(this.loginForm.get('password')?.value);
  }

  private handlePasswordPeeking(passwordVal: string) {
    clearTimeout(this.peekTimeout);
    if (passwordVal && passwordVal.length > 0 && !this.hidePassword) {
      const schedulePeek = () => {
        this.peekTimeout = setTimeout(() => {
          this.isPurplePeeking = true;
          setTimeout(() => {
            this.isPurplePeeking = false;
          }, 800);
        }, Math.random() * 3000 + 2000);
      };
      schedulePeek();
    } else {
      this.isPurplePeeking = false;
    }
  }

  get isPasswordVisible() { return !this.hidePassword; }
  get hasPassword() { return (this.loginForm.get('password')?.value || '').length > 0; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        const apiError = error.error as ApiErrorResponse;
        this.errorMessage = apiError?.message || 'Terjadi kesalahan saat login';
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (!control?.errors || !control.touched) return '';

    if (control.errors['required']) return `${field === 'email' ? 'Email' : 'Password'} wajib diisi`;
    if (control.errors['email']) return 'Format email tidak valid';
    if (control.errors['minlength']) return 'Password minimal 8 karakter';
    return '';
  }
}

