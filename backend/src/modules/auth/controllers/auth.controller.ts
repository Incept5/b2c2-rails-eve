import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { SignupDto } from '../dto/signup.dto';
import { TokenDto } from '../dto/token.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    const user = await this.userService.create(
      signupDto.email,
      signupDto.name,
      signupDto.password
    );
    return this.authService.createToken(user);
  }

  @Post('token')
  async token(@Body() tokenDto: TokenDto) {
    const user = await this.authService.validateUser(
      tokenDto.email,
      tokenDto.password
    );
    return this.authService.createToken(user);
  }
}