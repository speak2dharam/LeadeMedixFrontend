import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const roleGuard: CanActivateFn = (route) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as number[];

  const userRole = authService.getUserRole();

  if (!userRole) {
    router.navigate(['/Auth/login']);
    return false;
  }

  if (allowedRoles && allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/403']);
  return false;
};
