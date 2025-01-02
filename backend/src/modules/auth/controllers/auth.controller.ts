import { Body, Controller, Post, UnauthorizedException, ValidationPipe, Headers } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { SignupDto } from '../dto/signup.dto';
import { TokenDto } from '../dto/token.dto';
import { Public } from '../decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';

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
  async signup(@Body(new ValidationPipe()) signupDto: SignupDto) {
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
        signupDto.firstName,
        signupDto.lastName,
        signupDto.password
      );
      return this.authService.createToken(user);
    } catch (error) {
      throw new UnauthorizedException('Failed to create user');
    }
  }

  @Public()
  @Post('token')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({
    summary: 'Authenticate user and get access token',
    description: 'OAuth2 password grant token endpoint. Requires application/x-www-form-urlencoded content-type.'
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully authenticated',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user_id: '01HQ6V7V6P4M6RJRH0YV3G8E4H',
        expires: '2024-03-26T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Invalid request format or missing required fields' })
  async token(
    @Headers('content-type') contentType: string,
    @Body(new ValidationPipe({
      transform: true,
    })) tokenDto: TokenDto
  ) {
    if (!contentType?.toLowerCase().includes('application/x-www-form-urlencoded')) {
      throw new UnauthorizedException('Invalid content type. Must be application/x-www-form-urlencoded');
    }

    if (tokenDto.grant_type !== 'password') {
      throw new UnauthorizedException('Invalid grant type');
    }

    try {
      const user = await this.authService.validateUser(
        tokenDto.username,
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