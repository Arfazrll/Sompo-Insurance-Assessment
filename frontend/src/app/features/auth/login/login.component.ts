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
    setTimeout(() => {
      this.mouseX = window.innerWidth / 2;
      this.mouseY = window.innerHeight / 2;
      this.updatePositions();
    });
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
    this.updatePositions();
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
    this.updatePositions();
    clearTimeout(this.lookTimeout);
    this.lookTimeout = setTimeout(() => {
      this.isLookingAtEachOther = false;
      this.updatePositions();
    }, 800);
  }

  onInputBlur() {
    this.isTyping = false;
    this.updatePositions();
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
    this.updatePositions();
    this.handlePasswordPeeking(this.loginForm.get('password')?.value);
  }

  private handlePasswordPeeking(passwordVal: string) {
    clearTimeout(this.peekTimeout);
    if (passwordVal && passwordVal.length > 0 && !this.hidePassword) {
      const schedulePeek = () => {
        this.peekTimeout = setTimeout(() => {
          this.isPurplePeeking = true;
          this.updatePositions();
          setTimeout(() => {
            this.isPurplePeeking = false;
            this.updatePositions();
          }, 800);
        }, Math.random() * 3000 + 2000);
      };
      schedulePeek();
    } else {
      this.isPurplePeeking = false;
      this.updatePositions();
    }
  }

  // Cached Positions
  purplePos = { faceX: 0, faceY: 0, bodySkew: 0 };
  blackPos = { faceX: 0, faceY: 0, bodySkew: 0 };
  yellowPos = { faceX: 0, faceY: 0, bodySkew: 0 };
  orangePos = { faceX: 0, faceY: 0, bodySkew: 0 };

  purplePupilPos = { x: 0, y: 0 };
  blackPupilPos = { x: 0, y: 0 };
  orangePupilPos = { x: 0, y: 0 };
  yellowPupilPos = { x: 0, y: 0 };

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

  updatePositions() {
    this.purplePos = this.calculatePosition(this.purpleRef);
    this.blackPos = this.calculatePosition(this.blackRef);
    this.yellowPos = this.calculatePosition(this.yellowRef);
    this.orangePos = this.calculatePosition(this.orangeRef);

    const forcePurpleX = (this.hasPassword && !this.hidePassword) ? (this.isPurplePeeking ? 4 : -4) : this.isLookingAtEachOther ? 3 : undefined;
    const forcePurpleY = (this.hasPassword && !this.hidePassword) ? (this.isPurplePeeking ? 5 : -4) : this.isLookingAtEachOther ? 4 : undefined;
    this.purplePupilPos = this.calculatePupilPosition(this.purpleRef, 5, forcePurpleX, forcePurpleY);

    const forceBlackX = (this.hasPassword && !this.hidePassword) ? -4 : this.isLookingAtEachOther ? 0 : undefined;
    const forceBlackY = (this.hasPassword && !this.hidePassword) ? -4 : this.isLookingAtEachOther ? -4 : undefined;
    this.blackPupilPos = this.calculatePupilPosition(this.blackRef, 4, forceBlackX, forceBlackY);

    const forceOrangeX = (this.hasPassword && !this.hidePassword) ? -5 : undefined;
    const forceOrangeY = (this.hasPassword && !this.hidePassword) ? -4 : undefined;
    this.orangePupilPos = this.calculatePupilPosition(this.orangeRef, 5, forceOrangeX, forceOrangeY);

    const forceYellowX = (this.hasPassword && !this.hidePassword) ? -5 : undefined;
    const forceYellowY = (this.hasPassword && !this.hidePassword) ? -4 : undefined;
    this.yellowPupilPos = this.calculatePupilPosition(this.yellowRef, 5, forceYellowX, forceYellowY);
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

