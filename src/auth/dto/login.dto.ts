import { IsEmail, IsString, MinLength, IsOptional, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: '2FA code must not exceed 10 characters' })
  twoFactorCode?: string;
}
