import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthServices} from '../../services/auth/auth.services';

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthServices);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
