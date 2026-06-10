import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../shared/models/api-error.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  registerForm: FormGroup;
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
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.registerForm.get('password')?.valueChanges.subscribe(val => {
      this.handlePasswordPeeking(val);
    });
  }

  ngOnDestroy() {
    clearTimeout(this.lookTimeout);
    clearTimeout(this.peekTimeout);
  }

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
    this.handlePasswordPeeking(this.registerForm.get('password')?.value);
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

  get hasPassword() { return (this.registerForm.get('password')?.value || '').length > 0; }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        const apiError = error.error as ApiErrorResponse;
        this.errorMessage = apiError?.message || 'Terjadi kesalahan saat registrasi';
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control?.errors || !control.touched) return '';

    const labels: { [key: string]: string } = {
      fullName: 'Nama lengkap',
      email: 'Email',
      password: 'Password'
    };

    if (control.errors['required']) return `${labels[field]} wajib diisi`;
    if (control.errors['email']) return 'Format email tidak valid';
    if (control.errors['minlength']) return 'Password minimal 8 karakter';
    return '';
  }
}
