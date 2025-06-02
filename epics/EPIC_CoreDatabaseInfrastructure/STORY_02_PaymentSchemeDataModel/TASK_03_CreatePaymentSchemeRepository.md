
---
type: "task"
task_id: "TASK_03_CreatePaymentSchemeRepository"
story_id: "STORY_02_PaymentSchemeDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "completed"
---

# Task 3: Create Payment Scheme Repository

## Task Title
Create PaymentSchemeRepository with comprehensive data access methods and query optimization

## Detailed Description
Implement the repository layer for payment schemes that provides clean data access abstraction with optimized queries, proper error handling, and support for complex filtering and pagination. The repository should handle JSON field queries efficiently and provide methods for common business operations.

## Technical Approach / Implementation Plan

1. **Create Repository File**:
   - Create `backend/src/modules/legal-entity/repositories/payment-scheme.repository.ts`
   - Follow existing repository patterns in the codebase

2. **Base Repository Methods**:
   - Implement CRUD operations (create, read, update, delete)
   - Add pagination support for list operations
   - Include proper error handling and logging

3. **Query Methods**:
   - Find by scheme type (fiat, crypto, fx)
   - Find by currency and country scope
   - Find operational schemes (active during current time)
   - Complex filtering with multiple criteria

4. **JSON Field Queries**:
   - Query schemes by availability days
   - Filter by fee structures and limits
   - Search within operating hours

5. **Business Logic Queries**:
   - Find schemes supporting specific currencies
   - Get schemes with FX support
   - Find schemes within operational windows

6. **Performance Optimization**:
   - Use appropriate indexes for common queries
   - Implement query result caching where beneficial
   - Batch operations for bulk updates

## File Paths to Read
- `backend/src/modules/legal-entity/repositories/legal-entity.repository.ts` - Reference for repository patterns
- `backend/src/modules/auth/repositories/user.repository.ts` - Additional repository examples
- `backend/src/modules/database/database.service.ts` - Database service integration

## Relevant Code Snippets

### Repository Implementation
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaymentScheme, PaymentSchemeType } from '../entities/payment-scheme.entity';
import { Knex } from 'knex';
import { ulid } from 'ulid';

export interface PaymentSchemeFilters {
  type?: PaymentSchemeType;
  currency?: string;
  target_currency?: string;
  country_scope?: string;
  supports_fx?: boolean;
  operational_only?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

@Injectable()
export class PaymentSchemeRepository {
  private readonly logger = new Logger(PaymentSchemeRepository.name);
  private readonly tableName = 'payment_schemes';

  constructor(private readonly databaseService: DatabaseService) {}

  private get knex(): Knex {
    return this.databaseService.getKnex();
  }

  /**
   * Create a new payment scheme
   */
  async create(paymentSchemeData: Omit<PaymentScheme, 'scheme_id' | 'created_at' | 'updated_at'>): Promise<PaymentScheme> {
    this.logger.debug('Creating new payment scheme');
    
    const schemeId = ulid();
    const now = new Date();
    
    const paymentScheme: PaymentScheme = {
      ...paymentSchemeData,
      scheme_id: schemeId,
      created_at: now,
      updated_at: now,
    };

    try {
      await this.knex(this.tableName).insert({
        ...paymentScheme,
        available_days: JSON.stringify(paymentScheme.available_days),
        operating_hours: JSON.stringify(paymentScheme.operating_hours),
        holiday_calendar: JSON.stringify(paymentScheme.holiday_calendar || []),
        fees: JSON.stringify(paymentScheme.fees || {}),
        limits: JSON.stringify(paymentScheme.limits || {}),
      });

      this.logger.log(`Payment scheme created with ID: ${schemeId}`);
      return paymentScheme;
    } catch (error) {
      this.logger.error(`Failed to create payment scheme: ${error.message}`, error.stack);
      throw new Error(`Failed to create payment scheme: ${error.message}`);
    }
  }

  /**
   * Find payment scheme by ID
   */
  async findById(schemeId: string): Promise<PaymentScheme | null> {
    this.logger.debug(`Finding payment scheme by ID: ${schemeId}`);

    try {
      const row = await this.knex(this.tableName)
        .where('scheme_id', schemeId)
        .first();

      if (!row) {
        return null;
      }

      return this.mapRowToEntity(row);
    } catch (error) {
      this.logger.error(`Failed to find payment scheme by ID: ${error.message}`, error.stack);
      throw new Error(`Failed to find payment scheme: ${error.message}`);
    }
  }

  /**
   * Find payment schemes with pagination and filtering
   */
  async findMany(
    filters: PaymentSchemeFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<PaymentScheme>> {
    this.logger.debug('Finding payment schemes with filters and pagination');

    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = pagination;

    const offset = (page - 1) * limit;

    try {
      let query = this.knex(this.tableName);
      
      // Apply filters
      query = this.applyFilters(query, filters);

      // Get total count
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count('* as count');
      const total = parseInt(count as string, 10);

      // Apply pagination and sorting
      const rows = await query
        .orderBy(sort_by, sort_order)
        .limit(limit)
        .offset(offset);

      const data = rows.map(row => this.mapRowToEntity(row));

      return {
        data,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to find payment schemes: ${error.message}`, error.stack);
      throw new Error(`Failed to find payment schemes: ${error.message}`);
    }
  }

  /**
   * Find schemes by type
   */
  async findByType(type: PaymentSchemeType): Promise<PaymentScheme[]> {
    this.logger.debug(`Finding payment schemes by type: ${type}`);

    try {
      const rows = await this.knex(this.tableName)
        .where('type', type)
        .orderBy('name', 'asc');

      return rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Failed to find payment schemes by type: ${error.message}`, error.stack);
      throw new Error(`Failed to find payment schemes by type: ${error.message}`);
    }
  }

  /**
   * Find schemes supporting a specific currency
   */
  async findByCurrency(currency: string): Promise<PaymentScheme[]> {
    this.logger.debug(`Finding payment schemes by currency: ${currency}`);

    try {
      const rows = await this.knex(this.tableName)
        .where('currency', currency)
        .orWhere('target_currency', currency)
        .orderBy('name', 'asc');

      return rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Failed to find payment schemes by currency: ${error.message}`, error.stack);
      throw new Error(`Failed to find payment schemes by currency: ${error.message}`);
    }
  }

  /**
   * Find schemes that are currently operational
   */
  async findOperationalSchemes(currentTime: Date = new Date()): Promise<PaymentScheme[]> {
    this.logger.debug('Finding currently operational payment schemes');

    try {
      // Get all schemes and filter in application layer for complex time logic
      // In a production system, this could be optimized with database-specific JSON queries
      const rows = await this.knex(this.tableName)
        .orderBy('name', 'asc');

      const schemes = rows.map(row => this.mapRowToEntity(row));
      
      // Filter operational schemes using entity business logic
      return schemes.filter(scheme => scheme.isOperational(currentTime));
    } catch (error) {
      this.logger.error(`Failed to find operational payment schemes: ${error.message}`, error.stack);
      throw new Error(`Failed to find operational payment schemes: ${error.message}`);
    }
  }

  /**
   * Find schemes with FX support
   */
  async findFxSupportedSchemes(): Promise<PaymentScheme[]> {
    this.logger.debug('Finding payment schemes with FX support');

    try {
      const rows = await this.knex(this.tableName)
        .where('supports_fx', true)
        .orderBy('name', 'asc');

      return rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Failed to find FX supported schemes: ${error.message}`, error.stack);
      throw new Error(`Failed to find FX supported schemes: ${error.message}`);
    }
  }

  /**
   * Update payment scheme
   */
  async update(schemeId: string, updates: Partial<Omit<PaymentScheme, 'scheme_id' | 'created_at'>>): Promise<PaymentScheme> {
    this.logger.debug(`Updating payment scheme: ${schemeId}`);

    try {
      const updateData = {
        ...updates,
        updated_at: new Date(),
      };

      // Handle JSON fields
      if (updateData.available_days) {
        (updateData as any).available_days = JSON.stringify(updateData.available_days);
      }
      if (updateData.operating_hours) {
        (updateData as any).operating_hours = JSON.stringify(updateData.operating_hours);
      }
      if (updateData.holiday_calendar) {
        (updateData as any).holiday_calendar = JSON.stringify(updateData.holiday_calendar);
      }
      if (updateData.fees) {
        (updateData as any).fees = JSON.stringify(updateData.fees);
      }
      if (updateData.limits) {
        (updateData as any).limits = JSON.stringify(updateData.limits);
      }

      await this.knex(this.tableName)
        .where('scheme_id', schemeId)
        .update(updateData);

      const updated = await this.findById(schemeId);
      if (!updated) {
        throw new Error('Payment scheme not found after update');
      }

      this.logger.log(`Payment scheme updated: ${schemeId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update payment scheme: ${error.message}`, error.stack);
      throw new Error(`Failed to update payment scheme: ${error.message}`);
    }
  }

  /**
   * Delete payment scheme
   */
  async delete(schemeId: string): Promise<void> {
    this.logger.debug(`Deleting payment scheme: ${schemeId}`);

    try {
      const deletedCount = await this.knex(this.tableName)
        .where('scheme_id', schemeId)
        .del();

      if (deletedCount === 0) {
        throw new Error('Payment scheme not found');
      }

      this.logger.log(`Payment scheme deleted: ${schemeId}`);
    } catch (error) {
      this.logger.error(`Failed to delete payment scheme: ${error.message}`, error.stack);
      throw new Error(`Failed to delete payment scheme: ${error.message}`);
    }
  }

  /**
   * Check if scheme exists
   */
  async exists(schemeId: string): Promise<boolean> {
    try {
      const row = await this.knex(this.tableName)
        .where('scheme_id', schemeId)
        .first('scheme_id');

      return !!row;
    } catch (error) {
      this.logger.error(`Failed to check payment scheme existence: ${error.message}`, error.stack);
      throw new Error(`Failed to check payment scheme existence: ${error.message}`);
    }
  }

  /**
   * Apply filters to query
   */
  private applyFilters(query: Knex.QueryBuilder, filters: PaymentSchemeFilters): Knex.QueryBuilder {
    if (filters.type) {
      query = query.where('type', filters.type);
    }

    if (filters.currency) {
      query = query.where('currency', filters.currency);
    }

    if (filters.target_currency) {
      query = query.where('target_currency', filters.target_currency);
    }

    if (filters.country_scope) {
      query = query.where('country_scope', filters.country_scope);
    }

    if (filters.supports_fx !== undefined) {
      query = query.where('supports_fx', filters.supports_fx);
    }

    return query;
  }

  /**
   * Map database row to entity
   */
  private mapRowToEntity(row: any): PaymentScheme {
    return {
      scheme_id: row.scheme_id,
      name: row.name,
      type: row.type,
      currency: row.currency,
      target_currency: row.target_currency,
      country_scope: row.country_scope,
      available_days: JSON.parse(row.available_days),
      operating_hours: JSON.parse(row.operating_hours),
      holiday_calendar: JSON.parse(row.holiday_calendar || '[]'),
      cut_off_time: row.cut_off_time,
      settlement_time: row.settlement_time,
      fees: JSON.parse(row.fees || '{}'),
      spread: row.spread ? parseFloat(row.spread) : undefined,
      limits: JSON.parse(row.limits || '{}'),
      supports_fx: Boolean(row.supports_fx),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
```

## API Endpoint Details
N/A - This is a repository layer implementation.

## Database Schema Changes
N/A - Repository uses existing payment_schemes table.

## Libraries/Dependencies
- Knex.js (already available)
- ulid (already available)
- @nestjs/common (already available)

## Potential Challenges and Solutions

1. **JSON Field Queries**:
   - Challenge: Efficient querying of JSON fields across different databases
   - Solution: Start with application-layer filtering, optimize with database-specific JSON operators later

2. **Complex Time-based Filtering**:
   - Challenge: Operational hours and holiday calendar queries
   - Solution: Load data and use entity business logic for complex time calculations

3. **Performance with Large Datasets**:
   - Challenge: Repository queries may become slow with many schemes
   - Solution: Implement proper indexing and consider caching for frequently accessed data

4. **Error Handling Consistency**:
   - Challenge: Different types of database errors need consistent handling
   - Solution: Standardize error messages and logging patterns

## Test Cases to Consider

1. **CRUD Operations**:
   - Create payment scheme with valid data
   - Find payment scheme by ID
   - Update payment scheme fields
   - Delete payment scheme
   - Handle non-existent scheme operations

2. **Query Methods**:
   - Find schemes by type, currency, country
   - Pagination works correctly with filters
   - Operational schemes filtering
   - FX-supported schemes query

3. **JSON Field Handling**:
   - JSON fields are properly serialized/deserialized
   - Complex JSON structures maintain integrity
   - Invalid JSON data is handled gracefully

4. **Error Scenarios**:
   - Database connection errors
   - Invalid filter combinations
   - Constraint violations
   - Transaction rollback scenarios

5. **Performance**:
   - Large dataset pagination performance
   - Complex filter query performance
   - JSON field query optimization
   - Index usage verification
