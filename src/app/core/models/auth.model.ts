export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string | null;
  userId: number;
  email: string;
  name?: string;
  roles: string[];
  firstName?: string;
  middleName?: string;
  lastName?: string;
}
