import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as number[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const userRole = authService.getUserRole();

  if (userRole === null) {
    return router.parseUrl('/auth/login');
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  return router.parseUrl('/403');
};
