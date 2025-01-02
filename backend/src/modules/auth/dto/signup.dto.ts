import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for the account (minimum 8 characters)',
    example: 'securepassword123',
    minLength: 8
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'password is too short' })
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John'
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe'
  })
  @IsNotEmpty()
  lastName: string;
}