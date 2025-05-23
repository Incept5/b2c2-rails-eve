import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  enabled: process.env.AUTH_ENABLED === 'true',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
}));
