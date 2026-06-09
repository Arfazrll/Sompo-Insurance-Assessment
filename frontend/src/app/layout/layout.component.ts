import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

  isSidenavOpen = true;

  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}
