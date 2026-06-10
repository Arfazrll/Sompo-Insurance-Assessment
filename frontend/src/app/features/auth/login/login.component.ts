import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
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
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('purpleRef') purpleRef!: ElementRef<HTMLDivElement>;
  @ViewChild('blackRef') blackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('yellowRef') yellowRef!: ElementRef<HTMLDivElement>;
  @ViewChild('orangeRef') orangeRef!: ElementRef<HTMLDivElement>;

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  // Animation State
  mouseX = 0;
  mouseY = 0;
  isTyping = false;
  isLookingAtEachOther = false;
  isPurplePeeking = false;
  isPurpleBlinking = false;
  isBlackBlinking = false;

  private purpleBlinkTimeout: any;
  private blackBlinkTimeout: any;
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
    this.schedulePurpleBlink();
    this.scheduleBlackBlink();

    this.loginForm.get('password')?.valueChanges.subscribe(val => {
      this.handlePasswordPeeking(val);
    });
  }

  ngAfterViewInit() {
    // Initial calculation trigger
  }

  ngOnDestroy() {
    clearTimeout(this.purpleBlinkTimeout);
    clearTimeout(this.blackBlinkTimeout);
    clearTimeout(this.lookTimeout);
    clearTimeout(this.peekTimeout);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  // Blinking Logics
  private schedulePurpleBlink() {
    const interval = Math.random() * 4000 + 3000;
    this.purpleBlinkTimeout = setTimeout(() => {
      this.isPurpleBlinking = true;
      setTimeout(() => {
        this.isPurpleBlinking = false;
        this.schedulePurpleBlink();
      }, 150);
    }, interval);
  }

  private scheduleBlackBlink() {
    const interval = Math.random() * 4000 + 3000;
    this.blackBlinkTimeout = setTimeout(() => {
      this.isBlackBlinking = true;
      setTimeout(() => {
        this.isBlackBlinking = false;
        this.scheduleBlackBlink();
      }, 150);
    }, interval);
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

  // Calculate Positions
  calculatePosition(ref: ElementRef<HTMLDivElement> | undefined) {
    if (!ref || !ref.nativeElement) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = this.mouseX - centerX;
    const deltaY = this.mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  }

  get purplePos() { return this.calculatePosition(this.purpleRef); }
  get blackPos() { return this.calculatePosition(this.blackRef); }
  get yellowPos() { return this.calculatePosition(this.yellowRef); }
  get orangePos() { return this.calculatePosition(this.orangeRef); }

  get isPasswordVisible() { return !this.hidePassword; }
  get hasPassword() { return (this.loginForm.get('password')?.value || '').length > 0; }

  // Pupil Calculation Logic
  calculatePupilPosition(ref: ElementRef<HTMLDivElement> | undefined, maxDistance: number, forceLookX?: number, forceLookY?: number) {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    if (!ref || !ref.nativeElement) return { x: 0, y: 0 };

    const rect = ref.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = this.mouseX - centerX;
    const deltaY = this.mouseY - centerY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  }

  // Getters for Pupil Positions
  get purplePupilPos() {
    const forceLookX = (this.hasPassword && !this.hidePassword) ? (this.isPurplePeeking ? 4 : -4) : this.isLookingAtEachOther ? 3 : undefined;
    const forceLookY = (this.hasPassword && !this.hidePassword) ? (this.isPurplePeeking ? 5 : -4) : this.isLookingAtEachOther ? 4 : undefined;
    return this.calculatePupilPosition(this.purpleRef, 5, forceLookX, forceLookY);
  }

  get blackPupilPos() {
    const forceLookX = (this.hasPassword && !this.hidePassword) ? -4 : this.isLookingAtEachOther ? 0 : undefined;
    const forceLookY = (this.hasPassword && !this.hidePassword) ? -4 : this.isLookingAtEachOther ? -4 : undefined;
    return this.calculatePupilPosition(this.blackRef, 4, forceLookX, forceLookY);
  }

  get orangePupilPos() {
    const forceLookX = (this.hasPassword && !this.hidePassword) ? -5 : undefined;
    const forceLookY = (this.hasPassword && !this.hidePassword) ? -4 : undefined;
    return this.calculatePupilPosition(this.orangeRef, 5, forceLookX, forceLookY);
  }

  get yellowPupilPos() {
    const forceLookX = (this.hasPassword && !this.hidePassword) ? -5 : undefined;
    const forceLookY = (this.hasPassword && !this.hidePassword) ? -4 : undefined;
    return this.calculatePupilPosition(this.yellowRef, 5, forceLookX, forceLookY);
  }

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

