import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { PasswordService } from './services/password.service';
import { UserRepository } from './repositories/user.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { 
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UserService, PasswordService, UserRepository, JwtStrategy],
  exports: [AuthService, UserService],
})
export class AuthModule {}
