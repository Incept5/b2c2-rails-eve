import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findByEmail(@Query('email') email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }
    
    // Return safe user data (exclude password hash)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}