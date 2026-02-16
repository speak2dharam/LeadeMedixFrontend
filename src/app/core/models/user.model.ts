export interface UserResponseDto {
  id: number;
  email: string;
  roleId: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  isActive: boolean;
  // add other fields you have in backend dto
}
