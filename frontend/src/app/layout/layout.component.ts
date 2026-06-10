import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDrawerMode } from '@angular/material/sidenav';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {

  isSidenavOpen = true;
  sidenavMode: MatDrawerMode = 'side';
  isMobile = false;

  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.isMobile = result.matches;
      if (this.isMobile) {
        this.isSidenavOpen = false;
        this.sidenavMode = 'over';
      } else {
        this.isSidenavOpen = true;
        this.sidenavMode = 'side';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  closeSidenavOnMobile(): void {
    if (this.isMobile) {
      this.isSidenavOpen = false;
    }
  }
}
