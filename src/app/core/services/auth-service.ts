import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseapiService } from './baseapi-service';
import { tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = inject(BaseapiService).getApiBaseUrl() + '/Auth';

  login(payload: LoginRequest) {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/login`,
      payload
    ).pipe(
      tap(res => {
        if (res.success) {
          this.setSession(res.data);
        }
      })
    );
  }

  refreshToken() {
    const refreshToken = this.getRefreshToken();

    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/refresh`,
      { refreshToken }
    ).pipe(
      tap(res => {
        if (res.success) {
          this.setSession(res.data);
        }
      })
    );
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  private setSession(data: LoginResponse) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data));
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearSession() {
    localStorage.clear();
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): number | null {
    const user = this.getUser();
    return user?.userRole ?? null;
  }
}
