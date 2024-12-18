import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Public } from '../decorators/public.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get()
  async findByEmail(@Query('email') email: string) {
    const users = await this.userService.findByEmail(email);
    if (!users || !Array.isArray(users)) {
      return [];
    }
    
    // Return safe user data (exclude password hash)
    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }
}