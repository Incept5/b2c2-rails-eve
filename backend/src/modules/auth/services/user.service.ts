import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ulid } from 'ulid';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(email: string, name: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.userRepository.create({
      id: ulid(),
      email,
      name,
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
      updates.passwordHash = await bcrypt.hash(updates.passwordHash, 10);
    }
    return this.userRepository.update(id, updates);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}