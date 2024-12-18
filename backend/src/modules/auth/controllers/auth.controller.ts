import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { SignupDto } from '../dto/signup.dto';
import { TokenDto } from '../dto/token.dto';
import { Public } from '../decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user or authenticate existing user' })
  @ApiResponse({ status: 201, description: 'User successfully registered/authenticated' })
  @ApiResponse({ status: 401, description: 'Email already registered with different credentials' })
  async signup(@Body() signupDto: SignupDto) {
    const existingUser = await this.userService.findByEmail(signupDto.email);
    if (existingUser) {
      // If user exists, try to authenticate them
      try {
        await this.authService.validateUser(signupDto.email, signupDto.password);
        return this.authService.createToken(existingUser);
      } catch (error) {
        throw new UnauthorizedException('Email already registered');
      }
    }

    try {
      const user = await this.userService.create(
        signupDto.email,
        signupDto.name,
        signupDto.password
      );
      return this.authService.createToken(user);
    } catch (error) {
      throw new UnauthorizedException('Failed to create user');
    }
  }

  @Public()
  @Post('token')
  @ApiOperation({ summary: 'Authenticate user and get access token' })
  @ApiResponse({ status: 201, description: 'Successfully authenticated' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async token(@Body() tokenDto: TokenDto) {
    try {
      const user = await this.authService.validateUser(
        tokenDto.email,
        tokenDto.password
      );
      return this.authService.createToken(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}