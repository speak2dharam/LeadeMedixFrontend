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

  const userRoles = authService.getUserRoles().map(role => role.trim().toUpperCase());
  const requiredRoles = allowedRoles.map(role => String(role).trim().toUpperCase());

  if (userRoles.length === 0) {
    return router.parseUrl('/auth/login');
  }

  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
  if (hasRequiredRole) {
    return true;
  }

  return router.parseUrl('/403');
};
