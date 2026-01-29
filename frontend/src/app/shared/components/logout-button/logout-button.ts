import { Component } from '@angular/core';
import {AuthServices} from '../../../services/auth/auth.services';
import {Router} from '@angular/router';

@Component({
  selector: 'app-logout-button',
  imports: [],
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.scss',
})
export class LogoutButton {
  constructor(
    private authService: AuthServices,
    private router: Router
  ) {}

  logout() {
    this.authService.removeToken();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}

