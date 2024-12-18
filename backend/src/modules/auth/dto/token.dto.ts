import { IsEmail, IsString } from 'class-validator';

export class TokenDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  grant_type: 'password';
}