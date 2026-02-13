export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  userRole: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}
