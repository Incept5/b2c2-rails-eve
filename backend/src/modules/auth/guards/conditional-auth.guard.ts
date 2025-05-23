import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class ConditionalAuthGuard extends JwtAuthGuard {
  constructor(
    private configService: ConfigService,
    reflector: Reflector
  ) {
    super(reflector);
  }

  canActivate(context: ExecutionContext) {
    const authEnabled = this.configService.get<boolean>('auth.enabled');
    
    // If auth is disabled, allow all requests
    if (!authEnabled) {
      return true;
    }

    // If auth is enabled, use the normal JWT auth guard logic
    return super.canActivate(context);
  }
}
