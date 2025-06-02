import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ExternalParty, ExternalPartyType, KycStatus } from '../entities/external-party.entity';
import { Knex } from 'knex';

/**
 * Query options for repository operations
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    hasNext: boolean;
    nextCursor?: string;
    totalCount?: number;
  };
}

/**
 * External party filters for complex queries
 */
export interface ExternalPartyFilters {
  type?: ExternalPartyType;
  jurisdiction?: string;
  kycStatus?: KycStatus;
  relationshipStartBefore?: Date;
  relationshipStartAfter?: Date;
  hasNotes?: boolean;
  requiresReview?: boolean;
}

/**
 * KYC status change tracking interface
 */
export interface KycStatusChange {
  partyId: string;
  fromStatus: KycStatus;
  toStatus: KycStatus;
  changedAt: Date;
  notes?: string;
}

/**
 * External Party Repository
 * Handles all database operations for external parties
 */
@Injectable()
export class ExternalPartyRepository {
  private readonly logger = new Logger(ExternalPartyRepository.name);
  private readonly tableName = 'external_parties';

  constructor(private readonly db: DatabaseService) {}

  // =====================================
  // Core CRUD Operations
  // =====================================

  /**
   * Create a new external party
   */
  async create(party: Partial<ExternalParty>): Promise<ExternalParty> {
    this.logger.debug('Creating new external party');
    
    try {
      const [created] = await this.db.knex(this.tableName)
        .insert(this.mapToRow(party))
        .returning('*');
      
      this.logger.log(`External party created with ID: ${created.external_id}`);
      return this.mapToEntity(created);
    } catch (error) {
      this.logger.error(`Failed to create external party: ${error.message}`, error.stack);
      this.handleDatabaseError(error);
    }
  }

  /**
   * Find external party by ID
   */
  async findById(partyId: string): Promise<ExternalParty | null> {
    this.logger.debug(`Finding external party by ID: ${partyId}`);

    try {
      const party = await this.db.knex(this.tableName)
        .where({ external_id: partyId })
        .first();
      
      return party ? this.mapToEntity(party) : null;
    } catch (error) {
      this.logger.error(`Failed to find external party by ID: ${error.message}`, error.stack);
      throw new Error(`Failed to find external party: ${error.message}`);
    }
  }

  /**
   * Update external party
   */
  async update(partyId: string, updates: Partial<ExternalParty>): Promise<ExternalParty> {
    this.logger.debug(`Updating external party: ${partyId}`);

    try {
      const [updated] = await this.db.knex(this.tableName)
        .where({ external_id: partyId })
        .update({
          ...this.mapToRow(updates),
          updated_at: this.db.knex.fn.now()
        })
        .returning('*');
      
      if (!updated) {
        throw new Error(`External party with ID ${partyId} not found`);
      }
      
      this.logger.log(`External party updated: ${partyId}`);
      return this.mapToEntity(updated);
    } catch (error) {
      this.logger.error(`Failed to update external party: ${error.message}`, error.stack);
      this.handleDatabaseError(error);
    }
  }

  /**
   * Delete external party
   */
  async delete(partyId: string): Promise<void> {
    this.logger.debug(`Deleting external party: ${partyId}`);

    try {
      const deletedCount = await this.db.knex(this.tableName)
        .where({ external_id: partyId })
        .delete();
      
      if (deletedCount === 0) {
        throw new Error(`External party with ID ${partyId} not found`);
      }

      this.logger.log(`External party deleted: ${partyId}`);
    } catch (error) {
      this.logger.error(`Failed to delete external party: ${error.message}`, error.stack);
      throw new Error(`Failed to delete external party: ${error.message}`);
    }
  }

  // =====================================
  // Query Operations
  // =====================================

  /**
   * Find all external parties with optional filtering and pagination
   */
  async findAll(options: QueryOptions = {}): Promise<PaginatedResult<ExternalParty>> {
    this.logger.debug('Finding all external parties with pagination');
    
    const query = this.db.knex(this.tableName);
    return this.executePaginatedQuery(query, options);
  }

  /**
   * Find external parties by type
   */
  async findByType(
    type: ExternalPartyType, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<ExternalParty>> {
    this.logger.debug(`Finding external parties by type: ${type}`);
    
    const query = this.db.knex(this.tableName)
      .where({ type });
    return this.executePaginatedQuery(query, options);
  }

  /**
   * Find external parties by KYC status
   */
  async findByKycStatus(
    status: KycStatus, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<ExternalParty>> {
    this.logger.debug(`Finding external parties by KYC status: ${status}`);
    
    const query = this.db.knex(this.tableName)
      .where({ kyc_status: status });
    return this.executePaginatedQuery(query, options);
  }

  /**
   * Find external parties by jurisdiction
   */
  async findByJurisdiction(
    jurisdiction: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<ExternalParty>> {
    this.logger.debug(`Finding external parties by jurisdiction: ${jurisdiction}`);
    
    const query = this.db.knex(this.tableName)
      .where({ jurisdiction: jurisdiction.toUpperCase() });
    return this.executePaginatedQuery(query, options);
  }

  /**
   * Find external parties with complex filters
   */
  async findWithFilters(
    filters: ExternalPartyFilters, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<ExternalParty>> {
    this.logger.debug('Finding external parties with complex filters');
    
    let query = this.db.knex(this.tableName);

    // Apply filters
    if (filters.type) {
      query = query.where({ type: filters.type });
    }
    if (filters.jurisdiction) {
      query = query.where({ jurisdiction: filters.jurisdiction.toUpperCase() });
    }
    if (filters.kycStatus) {
      query = query.where({ kyc_status: filters.kycStatus });
    }
    if (filters.relationshipStartBefore) {
      query = query.where('relationship_start', '<=', filters.relationshipStartBefore);
    }
    if (filters.relationshipStartAfter) {
      query = query.where('relationship_start', '>=', filters.relationshipStartAfter);
    }
    if (filters.hasNotes !== undefined) {
      if (filters.hasNotes) {
        query = query.whereNotNull('notes').where('notes', '!=', '');
      } else {
        query = query.where(function() {
          this.whereNull('notes').orWhere('notes', '=', '');
        });
      }
    }

    return this.executePaginatedQuery(query, options);
  }

  // =====================================
  // Specialized Query Methods
  // =====================================

  /**
   * Find parties requiring compliance review
   */
  async findPartiesRequiringReview(): Promise<ExternalParty[]> {
    this.logger.debug('Finding parties requiring compliance review');

    try {
      // Parties blocked or pending for more than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const parties = await this.db.knex(this.tableName)
        .where('kyc_status', KycStatus.BLOCKED)
        .orWhere(function() {
          this.where('kyc_status', KycStatus.PENDING)
              .where('created_at', '<=', thirtyDaysAgo);
        })
        .orderBy('created_at', 'asc');

      return parties.map(party => this.mapToEntity(party));
    } catch (error) {
      this.logger.error(`Failed to find parties requiring review: ${error.message}`, error.stack);
      throw new Error(`Failed to find parties requiring review: ${error.message}`);
    }
  }

  /**
   * Find KYC status history for a party (placeholder for future audit table)
   */
  async findKycStatusHistory(partyId: string): Promise<KycStatusChange[]> {
    this.logger.debug(`Finding KYC status history for party: ${partyId}`);
    
    // For now, return empty array as audit table doesn't exist yet
    // This method provides the interface for future implementation
    return [];
  }

  // =====================================
  // Validation Operations
  // =====================================

  /**
   * Check if external party exists by ID
   */
  async existsById(partyId: string): Promise<boolean> {
    try {
      const result = await this.db.knex(this.tableName)
        .where({ external_id: partyId })
        .select(this.db.knex.raw('1'))
        .first();
      return !!result;
    } catch (error) {
      this.logger.error(`Failed to check party existence: ${error.message}`, error.stack);
      throw new Error(`Failed to check party existence: ${error.message}`);
    }
  }

  /**
   * Check if party has associated accounts (placeholder for future implementation)
   */
  async hasAssociatedAccounts(partyId: string): Promise<boolean> {
    this.logger.debug(`Checking for associated accounts for party: ${partyId}`);
    
    // Placeholder for future asset_nodes relationship check
    // For now, return false as no associations exist yet
    return false;
  }

  /**
   * Check if name and jurisdiction combination is unique
   */
  async isNameJurisdictionUnique(
    name: string, 
    jurisdiction: string, 
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = this.db.knex(this.tableName)
        .where({ 
          name: name.trim(), 
          jurisdiction: jurisdiction.toUpperCase() 
        });
      
      if (excludeId) {
        query = query.whereNot({ external_id: excludeId });
      }

      const result = await query.first();
      return !result;
    } catch (error) {
      this.logger.error(`Failed to check name/jurisdiction uniqueness: ${error.message}`, error.stack);
      throw new Error(`Failed to check name/jurisdiction uniqueness: ${error.message}`);
    }
  }

  // =====================================
  // Statistical and Reporting Methods
  // =====================================

  /**
   * Get party statistics by type and KYC status
   */
  async getPartyStatistics(): Promise<{
    totalParties: number;
    byType: Record<ExternalPartyType, number>;
    byKycStatus: Record<KycStatus, number>;
    byJurisdiction: Record<string, number>;
  }> {
    this.logger.debug('Getting party statistics');

    try {
      const [totalResult, typeStats, kycStats, jurisdictionStats] = await Promise.all([
        // Total count
        this.db.knex(this.tableName).count('* as count').first(),
        
        // By type
        this.db.knex(this.tableName)
          .select('type')
          .count('* as count')
          .groupBy('type'),
          
        // By KYC status
        this.db.knex(this.tableName)
          .select('kyc_status')
          .count('* as count')
          .groupBy('kyc_status'),
          
        // By jurisdiction
        this.db.knex(this.tableName)
          .select('jurisdiction')
          .count('* as count')
          .groupBy('jurisdiction')
      ]);

      const totalParties = parseInt(totalResult?.count as string || '0');
      
      const byType = typeStats.reduce((acc, stat) => {
        acc[stat.type as ExternalPartyType] = parseInt(stat.count as string);
        return acc;
      }, {} as Record<ExternalPartyType, number>);
      
      const byKycStatus = kycStats.reduce((acc, stat) => {
        acc[stat.kyc_status as KycStatus] = parseInt(stat.count as string);
        return acc;
      }, {} as Record<KycStatus, number>);
      
      const byJurisdiction = jurisdictionStats.reduce((acc, stat) => {
        acc[stat.jurisdiction] = parseInt(stat.count as string);
        return acc;
      }, {} as Record<string, number>);

      return {
        totalParties,
        byType,
        byKycStatus,
        byJurisdiction
      };
    } catch (error) {
      this.logger.error(`Failed to get party statistics: ${error.message}`, error.stack);
      throw new Error(`Failed to get party statistics: ${error.message}`);
    }
  }

  // =====================================
  // Private Helper Methods
  // =====================================

  /**
   * Execute paginated query with sorting and cursor support
   */
  private async executePaginatedQuery(
    query: any, 
    options: QueryOptions
  ): Promise<PaginatedResult<ExternalParty>> {
    const { 
      page = 1, 
      limit = 20, 
      cursor, 
      sortBy = 'created_at', 
      sortOrder = 'desc' 
    } = options;

    try {
      // Clone query for count
      const countQuery = query.clone();
      const totalCountResult = await countQuery.count('* as count').first();
      const totalCount = parseInt(totalCountResult?.count as string || '0');

      // Apply cursor pagination if provided
      if (cursor) {
        const operator = sortOrder === 'asc' ? '>' : '<';
        query = query.where(sortBy, operator, cursor);
      } else {
        // Apply offset pagination
        const offset = (page - 1) * limit;
        query = query.offset(offset);
      }

      // Apply sorting and limit
      query = query.orderBy(sortBy, sortOrder).limit(limit);

      const parties = await query;
      const mappedParties = parties.map((party: any) => this.mapToEntity(party));

      // Determine if there are more results
      const hasNext = cursor 
        ? mappedParties.length === limit
        : (page * limit) < totalCount;

      // Get next cursor if using cursor pagination
      const nextCursor = cursor && mappedParties.length > 0
        ? mappedParties[mappedParties.length - 1][sortBy as keyof ExternalParty]
        : undefined;

      return {
        data: mappedParties,
        pagination: {
          hasNext,
          nextCursor: nextCursor?.toString(),
          totalCount: cursor ? undefined : totalCount
        }
      };
    } catch (error) {
      this.logger.error(`Failed to execute paginated query: ${error.message}`, error.stack);
      throw new Error(`Failed to execute paginated query: ${error.message}`);
    }
  }

  /**
   * Map database row to ExternalParty object
   */
  private mapToEntity(row: any): ExternalParty {
    if (!row) return null;

    const party = new ExternalParty();
    party.id = row.external_id;
    party.name = row.name;
    party.type = row.type as ExternalPartyType;
    party.jurisdiction = row.jurisdiction;
    party.kycStatus = row.kyc_status as KycStatus;
    party.relationshipStart = new Date(row.relationship_start);
    party.notes = row.notes;
    party.createdAt = new Date(row.created_at);
    party.updatedAt = new Date(row.updated_at);

    return party;
  }

  /**
   * Map ExternalParty object to database row
   */
  private mapToRow(party: Partial<ExternalParty>): any {
    const row: any = {};

    if (party.id !== undefined) row.external_id = party.id;
    if (party.name !== undefined) row.name = party.name;
    if (party.type !== undefined) row.type = party.type;
    if (party.jurisdiction !== undefined) row.jurisdiction = party.jurisdiction.toUpperCase();
    if (party.kycStatus !== undefined) row.kyc_status = party.kycStatus;
    if (party.relationshipStart !== undefined) row.relationship_start = party.relationshipStart;
    if (party.notes !== undefined) row.notes = party.notes;
    if (party.createdAt !== undefined) row.created_at = party.createdAt;
    if (party.updatedAt !== undefined) row.updated_at = party.updatedAt;

    return row;
  }

  /**
   * Handle database errors with meaningful messages
   */
  private handleDatabaseError(error: any): never {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('External party with this combination already exists');
    }
    
    if (error.code === '23503') { // Foreign key constraint violation
      throw new Error('Referenced entity does not exist');
    }
    
    if (error.code === '23514') { // Check constraint violation
      if (error.constraint?.includes('type')) {
        throw new Error('Invalid external party type provided');
      }
      if (error.constraint?.includes('kyc_status')) {
        throw new Error('Invalid KYC status provided');
      }
      if (error.constraint?.includes('jurisdiction')) {
        throw new Error('Invalid jurisdiction code format');
      }
      if (error.constraint?.includes('relationship_start')) {
        throw new Error('Relationship start date cannot be in the future');
      }
      if (error.constraint?.includes('name')) {
        throw new Error('Party name must be at least 2 characters');
      }
      throw new Error('Database constraint violation');
    }

    // Re-throw original error if not handled
    throw error;
  }
}
