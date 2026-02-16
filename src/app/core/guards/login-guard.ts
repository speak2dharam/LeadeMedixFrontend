import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAccessTokenValid()) {
    return router.parseUrl('/dashboard');
  }

  return authService.refreshToken().pipe(
    map(() => router.parseUrl('/dashboard')),
    catchError(() => of(true))
  );
};
