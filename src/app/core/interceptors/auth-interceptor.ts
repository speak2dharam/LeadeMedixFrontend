import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  let clonedReq = req;
  if (accessToken) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Access token expired
      if (error.status === 401 && !req.url.includes('/Auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(newToken => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(retryReq);
          }),
          catchError(refreshError => {
            authService.clearSession();
            window.location.href = '/auth/login';
            return throwError(() => refreshError);
          })
        );
      }

      // Refresh token expired
      // if (error.status === 401 && req.url.includes('/Auth/refresh')) {
      //   authService.clearSession();
      //   window.location.href = '/auth/login';
      // }

      return throwError(() => error);
    })
  );
};
