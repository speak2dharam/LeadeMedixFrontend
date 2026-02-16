import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
debugger
  // ✅ If user is already logged in, redirect them away
  if (authService.isLoggedIn()) {
    router.navigate(['/dashboard']); // or your home route
    return false;
  }

  // ✅ Otherwise allow access to login/register

  return true;
};
