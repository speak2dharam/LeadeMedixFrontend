export interface UserResponseDto {
  id: number;
  email: string;
  roleId?: number;
  firstName?: string | null;
  middleName?: string;
  lastName?: string | null;
  mobile?: string | null;
  isActive: boolean;
  // add other fields you have in backend dto
}
