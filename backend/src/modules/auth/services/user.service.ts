import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { PasswordService } from './password.service';
import { ulid } from 'ulid';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(email: string, firstName: string, lastName: string, password: string): Promise<User> {
    const passwordHash = await this.passwordService.hash(password);
    return this.userRepository.create({
      id: ulid(),
      email,
      firstName,
      lastName,
      passwordHash
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    if (updates.passwordHash) {
      updates.passwordHash = await this.passwordService.hash(updates.passwordHash);
    }
    return this.userRepository.update(id, updates);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return this.passwordService.verify(password, user.passwordHash);
  }
}
