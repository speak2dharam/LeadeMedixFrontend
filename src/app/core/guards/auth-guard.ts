import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAccessTokenValid()) {
    return true;
  }

  return authService.refreshToken().pipe(
    map(() => {
      return true;
    }),
    catchError(() => of(router.parseUrl('/auth/login')))
  );
};
