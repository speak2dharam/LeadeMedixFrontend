import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseapiService } from './baseapi-service';
import { catchError, finalize, firstValueFrom, map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';

type JwtPayload = Record<string, unknown> & {
  exp?: number;
  email?: string;
  sub?: string;
  nameid?: string | number;
};

type AuthSessionUser = {
  userId: number | null;
  email: string | null;
  name?: string | null;
  roles: string[];
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = inject(BaseapiService).getApiBaseUrl() + '/Auth';
  private refreshInFlight$: Observable<string> | null = null;

  login(payload: LoginRequest) {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/login`,
      payload,
      { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res.success) {
          this.setSession(res.data);
        }
      })
    );
  }

  refreshToken() {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refresh$ = this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/refresh`, {}, { withCredentials: true }).pipe(
      map(res => {
        if (!res.success || !res.data?.accessToken) {
          throw new Error('Unable to refresh access token');
        }

        this.setSession(res.data);
        return res.data.accessToken;
      }),
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshInFlight$ = null;
      }),
      shareReplay(1)
    );

    this.refreshInFlight$ = refresh$;
    return refresh$;
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearSession())
    );
  }

  private setSession(data: LoginResponse) {
    sessionStorage.setItem('accessToken', data.accessToken);
    const user: AuthSessionUser = {
      userId: Number.isFinite(Number(data.userId)) ? Number(data.userId) : null,
      email: data.email ?? null,
      name: data.name ?? null,
      roles: this.normalizeRoles(data.roles)
    };
    sessionStorage.setItem('user', JSON.stringify(user));
    this.hydrateUserFromToken(data.accessToken);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  isAccessTokenValid(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return false;
    }

    return !this.isTokenExpired(accessToken);
  }

  clearSession() {
    sessionStorage.clear();
  }

  forceLogout(redirectToLogin = true) {
    this.clearSession();
    if (
      redirectToLogin &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/auth/login')
    ) {
      window.location.href = '/auth/login';
    }
  }

  async initializeAuth(): Promise<void> {
    if (this.isAccessTokenValid()) {
      const accessToken = this.getAccessToken();
      if (accessToken) {
        this.hydrateUserFromToken(accessToken);
      }
      return;
    }

    try {
      await firstValueFrom(this.refreshToken());
    } catch {
      this.clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
  }

  isLoggedIn(): boolean {
    return this.isAccessTokenValid();
  }

  getUser(): AuthSessionUser | null {
    const user = sessionStorage.getItem('user');
    if (!user) {
      return null;
    }

    try {
      const parsed = JSON.parse(user) as Partial<AuthSessionUser>;
      return {
        userId: typeof parsed.userId === 'number' ? parsed.userId : null,
        email: typeof parsed.email === 'string' ? parsed.email : null,
        name: typeof parsed.name === 'string' ? parsed.name : null,
        roles: this.normalizeRoles(parsed.roles),
      };
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    const user = this.getUser();
    if (typeof user?.userId === 'number') {
      return user.userId;
    }

    const payload = this.getAccessTokenPayload();
    return payload ? this.extractUserId(payload) : null;
  }

  getUserEmail(): string | null {
    const user = this.getUser();
    if (user?.email) {
      return user.email;
    }

    const payload = this.getAccessTokenPayload();
    const email = payload?.email;
    return typeof email === 'string' ? email : null;
  }

  getUserName(): string | null {
    const user = this.getUser();
    if (user?.name) {
      return user.name;
    }

    const payload = this.getAccessTokenPayload();
    const name =
      payload?.['unique_name'] ??
      payload?.['name'] ??
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

    return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
  }

  getUserRoles(): string[] {
    const user = this.getUser();
    if (Array.isArray(user?.roles) && user.roles.length > 0) {
      return this.normalizeRoles(user.roles);
    }

    const payload = this.getAccessTokenPayload();
    if (!payload) {
      return [];
    }

    return this.extractRoles(payload);
  }

  private hydrateUserFromToken(accessToken: string) {
    const payload = this.decodeToken(accessToken);
    if (!payload) {
      return;
    }

    const currentUser: AuthSessionUser = this.getUser() ?? {
      userId: null,
      email: null,
      name: null,
      roles: [],
    };
    const tokenRoles = this.extractRoles(payload);
    const mergedUser: AuthSessionUser = {
      ...currentUser,
      name: currentUser.name ?? null,
      userId: this.extractUserId(payload) ?? currentUser.userId,
      email: (payload.email as string | undefined) ?? currentUser.email,
      roles: tokenRoles.length > 0 ? tokenRoles : this.normalizeRoles(currentUser.roles)
    };

    sessionStorage.setItem('user', JSON.stringify(mergedUser));
  }

  private getAccessTokenPayload(): JwtPayload | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return null;
    }

    return this.decodeToken(accessToken);
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload?.exp) {
      return true;
    }

    const currentUnixSeconds = Math.floor(Date.now() / 1000);
    const skewSeconds = 30;
    return payload.exp <= currentUnixSeconds + skewSeconds;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64Payload + '='.repeat((4 - (base64Payload.length % 4)) % 4);
      return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private extractRoles(payload: JwtPayload): string[] {
    const roleValue =
      payload['role'] ??
      payload['roles'] ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (roleValue === undefined || roleValue === null) {
      return [];
    }

    if (Array.isArray(roleValue)) {
      return this.normalizeRoles(roleValue);
    }

    return this.normalizeRoles([roleValue]);
  }

  private extractUserId(payload: JwtPayload): number | null {
    const userIdValue =
      payload['nameid'] ??
      payload['sub'] ??
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    if (userIdValue === undefined || userIdValue === null) {
      return null;
    }

    const parsed = Number(userIdValue);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private normalizeRoles(roles: unknown): string[] {
    if (!Array.isArray(roles)) {
      return [];
    }

    return roles
      .map((role: unknown) => String(role).trim().toUpperCase())
      .filter((role: string) => role.length > 0);
  }
}
