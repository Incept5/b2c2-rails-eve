import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { SignupDto } from '../dto/signup.dto';
import { TokenDto } from '../dto/token.dto';
import { Public } from '../decorators/public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    try {
      const existingUser = await this.userService.findByEmail(signupDto.email);
      if (existingUser) {
        throw new UnauthorizedException('Email already registered');
      }

      const user = await this.userService.create(
        signupDto.email,
        signupDto.name,
        signupDto.password
      );
      return this.authService.createToken(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to create user');
    }
  }

  @Public()
  @Post('token')
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