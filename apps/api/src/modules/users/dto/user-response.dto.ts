export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  oab: string | null;
  active: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}