import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: 'Username (email address)',
    example: 'user@example.com',
    type: 'string',
    format: 'email',
    required: true
  })
  @IsEmail()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    type: 'string',
    minLength: 8,
    required: true
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'OAuth2 grant type',
    example: 'password',
    enum: ['password'],
    type: 'string',
    required: true
  })
  @IsString()
  grant_type: 'password';
}