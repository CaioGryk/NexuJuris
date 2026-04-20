import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'name é obrigatório' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'tenantId é obrigatório' })
  tenantId: string;
}