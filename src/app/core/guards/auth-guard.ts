import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // router.navigate(['/auth/login']);
  // return false;
   // 2) No access token => try refresh (cookie)
  return authService.refreshToken().pipe(
    map(() => {
      // store access token inside refreshToken() OR here
      return true; // allow route now
    }),
    catchError(() => of(router.parseUrl('/auth/login')))
  );
};
