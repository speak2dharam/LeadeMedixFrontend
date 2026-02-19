import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const userRoles = authService.getUserRoles();

  if (userRoles.length === 0) {
    return router.parseUrl('/auth/login');
  }

  const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
  if (hasRequiredRole) {
    return true;
  }

  return router.parseUrl('/403');
};
