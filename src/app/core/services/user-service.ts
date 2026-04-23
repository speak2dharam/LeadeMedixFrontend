import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseapiService } from './baseapi-service';
import { UserResponseDto } from '../models/user.model';
import { PaginatedResponse, PaginationRequest } from '../models/pagination.model';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = inject(BaseapiService).getApiBaseUrl(); // should be https://localhost:7032/api

  getUsers(req: PaginationRequest): Observable<ApiResponse<PaginatedResponse<UserResponseDto>>> {
    let params = new HttpParams()
      .set('pageNumber', req.pageNumber)
      .set('pageSize', req.pageSize);

    if (req.search?.trim()) {
      params = params.set('search', req.search.trim());
    }
    if (req.sortBy?.trim()) {
      params = params.set('sortBy', req.sortBy.trim());
    }
    if (req.sortDir?.trim()) {
      params = params.set('sortDir', req.sortDir.trim());
    }

    return this.http.get<ApiResponse<PaginatedResponse<UserResponseDto>>>(
      `${this.baseUrl}/Users`,
      {
        params,
        withCredentials: true, // IMPORTANT for refresh cookie flow
      }
    );
  }
}
