import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseapiService } from './baseapi-service';
import { map, tap } from 'rxjs';
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
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/refresh`, {}, { withCredentials: true }).pipe(
      map(res => {
        if (!res.success || !res.data?.accessToken) {
          throw new Error('Unable to refresh access token');
        }

        this.setSession(res.data);
        return res.data.accessToken;
      })
    );
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearSession())
    );
  }

  private setSession(data: LoginResponse) {

    sessionStorage.setItem('accessToken', data.accessToken);
    //localStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('user', JSON.stringify(data));
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearSession() {
    sessionStorage.clear();
  }
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('accessToken');
  }

  getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): number | null {
    const user = this.getUser();
    return user?.userRole ?? null;
  }
}
