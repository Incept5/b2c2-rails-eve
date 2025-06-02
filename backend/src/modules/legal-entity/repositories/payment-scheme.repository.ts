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

/**
 * Payment Scheme Repository
 * Handles all database operations for payment schemes
 */
@Injectable()
export class PaymentSchemeRepository {
  private readonly logger = new Logger(PaymentSchemeRepository.name);
  private readonly tableName = 'payment_schemes';

  constructor(private readonly databaseService: DatabaseService) {}

  private get knex(): Knex {
    return this.databaseService.knex;
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
        ...this.mapToRow(paymentScheme),
      });

      this.logger.log(`Payment scheme created with ID: ${schemeId}`);
      return paymentScheme;
    } catch (error) {
      this.logger.error(`Failed to create payment scheme: ${error.message}`, error.stack);
      this.handleDatabaseError(error);
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
   * Find schemes by country scope
   */
  async findByCountryScope(countryScope: string): Promise<PaymentScheme[]> {
    this.logger.debug(`Finding payment schemes by country scope: ${countryScope}`);

    try {
      const rows = await this.knex(this.tableName)
        .where('country_scope', countryScope)
        .orderBy('name', 'asc');

      return rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Failed to find payment schemes by country scope: ${error.message}`, error.stack);
      throw new Error(`Failed to find payment schemes by country scope: ${error.message}`);
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

      const rowData = this.mapToRow(updateData);
      
      await this.knex(this.tableName)
        .where('scheme_id', schemeId)
        .update(rowData);

      const updated = await this.findById(schemeId);
      if (!updated) {
        throw new Error('Payment scheme not found after update');
      }

      this.logger.log(`Payment scheme updated: ${schemeId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update payment scheme: ${error.message}`, error.stack);
      this.handleDatabaseError(error);
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
   * Check if scheme name is unique
   */
  async isNameUnique(name: string, excludeSchemeId?: string): Promise<boolean> {
    try {
      let query = this.knex(this.tableName)
        .where('name', name);
      
      if (excludeSchemeId) {
        query = query.whereNot('scheme_id', excludeSchemeId);
      }

      const row = await query.first('scheme_id');
      return !row;
    } catch (error) {
      this.logger.error(`Failed to check scheme name uniqueness: ${error.message}`, error.stack);
      throw new Error(`Failed to check scheme name uniqueness: ${error.message}`);
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
    const scheme = new PaymentScheme();
    scheme.scheme_id = row.scheme_id;
    scheme.name = row.name;
    scheme.type = row.type;
    scheme.currency = row.currency;
    scheme.target_currency = row.target_currency;
    scheme.country_scope = row.country_scope;
    scheme.available_days = JSON.parse(row.available_days);
    scheme.operating_hours = JSON.parse(row.operating_hours);
    scheme.holiday_calendar = JSON.parse(row.holiday_calendar || '[]');
    scheme.cut_off_time = row.cut_off_time;
    scheme.settlement_time = row.settlement_time;
    scheme.fees = JSON.parse(row.fees || '{}');
    scheme.spread = row.spread ? parseFloat(row.spread) : undefined;
    scheme.limits = JSON.parse(row.limits || '{}');
    scheme.supports_fx = Boolean(row.supports_fx);
    scheme.created_at = new Date(row.created_at);
    scheme.updated_at = new Date(row.updated_at);
    
    return scheme;
  }

  /**
   * Map entity to database row
   */
  private mapToRow(scheme: Partial<PaymentScheme>): any {
    const row: any = {};

    if (scheme.scheme_id !== undefined) row.scheme_id = scheme.scheme_id;
    if (scheme.name !== undefined) row.name = scheme.name;
    if (scheme.type !== undefined) row.type = scheme.type;
    if (scheme.currency !== undefined) row.currency = scheme.currency;
    if (scheme.target_currency !== undefined) row.target_currency = scheme.target_currency;
    if (scheme.country_scope !== undefined) row.country_scope = scheme.country_scope;
    if (scheme.available_days !== undefined) row.available_days = JSON.stringify(scheme.available_days);
    if (scheme.operating_hours !== undefined) row.operating_hours = JSON.stringify(scheme.operating_hours);
    if (scheme.holiday_calendar !== undefined) row.holiday_calendar = JSON.stringify(scheme.holiday_calendar);
    if (scheme.cut_off_time !== undefined) row.cut_off_time = scheme.cut_off_time;
    if (scheme.settlement_time !== undefined) row.settlement_time = scheme.settlement_time;
    if (scheme.fees !== undefined) row.fees = JSON.stringify(scheme.fees);
    if (scheme.spread !== undefined) row.spread = scheme.spread;
    if (scheme.limits !== undefined) row.limits = JSON.stringify(scheme.limits);
    if (scheme.supports_fx !== undefined) row.supports_fx = scheme.supports_fx;
    if (scheme.created_at !== undefined) row.created_at = scheme.created_at;
    if (scheme.updated_at !== undefined) row.updated_at = scheme.updated_at;

    return row;
  }

  /**
   * Handle database errors with meaningful messages
   */
  private handleDatabaseError(error: any): never {
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint?.includes('name')) {
        throw new Error('Payment scheme with this name already exists');
      }
      throw new Error('Unique constraint violation');
    }
    
    if (error.code === '23503') { // Foreign key constraint violation
      throw new Error('Referenced entity does not exist');
    }
    
    if (error.code === '23514') { // Check constraint violation
      if (error.constraint?.includes('type')) {
        throw new Error('Invalid payment scheme type provided');
      }
      if (error.constraint?.includes('currency')) {
        throw new Error('Invalid currency code format');
      }
      if (error.constraint?.includes('spread')) {
        throw new Error('Spread value must be non-negative');
      }
      throw new Error('Database constraint violation');
    }

    // Re-throw original error if not handled
    throw error;
  }
}
