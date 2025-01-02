import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(user: Partial<User>): Promise<User> {
    const [created] = await this.db.knex('users')
      .insert(this.mapToRow(user))
      .returning('*');
    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.knex('users')
      .where({ id })
      .first();
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.knex('users')
      .where({ email })
      .first();
    return user ? this.mapToEntity(user) : null;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const [updated] = await this.db.knex('users')
      .where({ id })
      .update({
        ...updates,
        updated_at: this.db.knex.fn.now()
      })
      .returning('*');
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.knex('users')
      .where({ id })
      .delete();
  }

  private mapToEntity(row: any): User {
    return row ? {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } : null;
  }

  private mapToRow(entity: Partial<User>): any {
    return {
      id: entity.id,
      email: entity.email,
      first_name: entity.firstName,
      last_name: entity.lastName,
      password_hash: entity.passwordHash,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}