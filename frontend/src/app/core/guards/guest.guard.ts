import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Mencegah user yang sudah login mengakses halaman login/register
  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}
