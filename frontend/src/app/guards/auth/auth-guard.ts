import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthServices} from '../../services/auth/auth.services';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthServices);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  return true;

};
