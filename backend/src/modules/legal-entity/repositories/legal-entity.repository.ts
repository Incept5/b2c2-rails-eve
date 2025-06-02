
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { LegalEntity, LegalEntityType } from '../entities/legal-entity.entity';

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
 * Legal Entity Repository
 * Handles all database operations for legal entities
 */
@Injectable()
export class LegalEntityRepository {
  constructor(private readonly db: DatabaseService) {}

  // =====================================
  // Core CRUD Operations
  // =====================================

  /**
   * Create a new legal entity
   */
  async create(entity: Partial<LegalEntity>): Promise<LegalEntity> {
    try {
      const [created] = await this.db.knex('legal_entities')
        .insert(this.mapToRow(entity))
        .returning('*');
      return this.mapToEntity(created);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Find legal entity by ID
   */
  async findById(entityId: string): Promise<LegalEntity | null> {
    const entity = await this.db.knex('legal_entities')
      .where({ entity_id: entityId })
      .first();
    return entity ? this.mapToEntity(entity) : null;
  }

  /**
   * Update legal entity
   */
  async update(entityId: string, updates: Partial<LegalEntity>): Promise<LegalEntity> {
    try {
      const [updated] = await this.db.knex('legal_entities')
        .where({ entity_id: entityId })
        .update({
          ...this.mapToRow(updates),
          updated_at: this.db.knex.fn.now()
        })
        .returning('*');
      
      if (!updated) {
        throw new Error(`Legal entity with ID ${entityId} not found`);
      }
      
      return this.mapToEntity(updated);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Delete legal entity
   */
  async delete(entityId: string): Promise<void> {
    const deletedCount = await this.db.knex('legal_entities')
      .where({ entity_id: entityId })
      .delete();
    
    if (deletedCount === 0) {
      throw new Error(`Legal entity with ID ${entityId} not found`);
    }
  }

  // =====================================
  // Query Operations
  // =====================================

  /**
   * Find all legal entities with optional filtering and pagination
   */
  async findAll(options: QueryOptions = {}): Promise<PaginatedResult<LegalEntity>> {
    const query = this.db.knex('legal_entities');
    return this.executePaginatedQuery(query, options);
  }

  /**
   * Find legal entities by type
   */
  async findByType(
    entityType: LegalEntityType, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<LegalEntity>> {
    const query = this.db.knex('legal_entities')
      .where({ entity_type: entityType });
    return this.executePaginatedQuery(query, options);
  }

  /**
   * Find legal entities by country
   */
  async findByCountry(
    country: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<LegalEntity>> {
    const query = this.db.knex('legal_entities')
      .where({ country: country.toUpperCase() });
    return this.executePaginatedQuery(query, options);
  }

  /**
   * Find legal entities by parent entity ID
   */
  async findByParent(parentEntityId: string): Promise<LegalEntity[]> {
    const entities = await this.db.knex('legal_entities')
      .where({ parent_entity_id: parentEntityId })
      .orderBy('name');
    return entities.map(entity => this.mapToEntity(entity));
  }

  /**
   * Find all children of a legal entity (branches)
   */
  async findChildren(entityId: string): Promise<LegalEntity[]> {
    return this.findByParent(entityId);
  }

  /**
   * Find all descendants of a legal entity using recursive CTE
   */
  async findDescendants(entityId: string): Promise<LegalEntity[]> {
    const entities = await this.db.knex.raw(`
      WITH RECURSIVE entity_tree AS (
        -- Base case: direct children
        SELECT * FROM legal_entities WHERE parent_entity_id = ?
        
        UNION ALL
        
        -- Recursive case: children of children
        SELECT le.* 
        FROM legal_entities le
        INNER JOIN entity_tree et ON le.parent_entity_id = et.entity_id
      )
      SELECT * FROM entity_tree
      ORDER BY name
    `, [entityId]);

    return entities.rows.map((entity: any) => this.mapToEntity(entity));
  }

  /**
   * Find entities with multiple filters
   */
  async findWithFilters(filters: {
    entityType?: LegalEntityType;
    country?: string;
    parentEntityId?: string;
    canHostAccounts?: boolean;
    canHostWallets?: boolean;
    canHostFxNodes?: boolean;
  }, options: QueryOptions = {}): Promise<PaginatedResult<LegalEntity>> {
    let query = this.db.knex('legal_entities');

    // Apply filters
    if (filters.entityType) {
      query = query.where({ entity_type: filters.entityType });
    }
    if (filters.country) {
      query = query.where({ country: filters.country.toUpperCase() });
    }
    if (filters.parentEntityId) {
      query = query.where({ parent_entity_id: filters.parentEntityId });
    }
    if (filters.canHostAccounts !== undefined) {
      query = query.where({ can_host_accounts: filters.canHostAccounts });
    }
    if (filters.canHostWallets !== undefined) {
      query = query.where({ can_host_wallets: filters.canHostWallets });
    }
    if (filters.canHostFxNodes !== undefined) {
      query = query.where({ can_host_fx_nodes: filters.canHostFxNodes });
    }

    return this.executePaginatedQuery(query, options);
  }

  // =====================================
  // Validation Operations
  // =====================================

  /**
   * Check if legal entity exists by ID
   */
  async existsById(entityId: string): Promise<boolean> {
    const result = await this.db.knex('legal_entities')
      .where({ entity_id: entityId })
      .select(this.db.knex.raw('1'))
      .first();
    return !!result;
  }

  /**
   * Check if legal entity has dependent nodes (placeholder for future asset/fx nodes)
   */
  async hasDependentNodes(entityId: string): Promise<boolean> {
    // For now, check if entity has child entities (branches)
    const childCount = await this.db.knex('legal_entities')
      .where({ parent_entity_id: entityId })
      .count('* as count')
      .first();
    
    return parseInt(childCount?.count as string || '0') > 0;
  }

  /**
   * Validate parent-child relationship (prevent circular references)
   */
  async validateParentChild(entityId: string, parentEntityId: string): Promise<boolean> {
    // Check if parentEntityId is a descendant of entityId (would create a cycle)
    const descendants = await this.findDescendants(entityId);
    return !descendants.some(desc => desc.id === parentEntityId);
  }

  /**
   * Check if name and country combination is unique
   */
  async isNameCountryUnique(name: string, country: string, excludeEntityId?: string): Promise<boolean> {
    let query = this.db.knex('legal_entities')
      .where({ name, country: country.toUpperCase() });
    
    if (excludeEntityId) {
      query = query.whereNot({ entity_id: excludeEntityId });
    }

    const result = await query.first();
    return !result;
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
  ): Promise<PaginatedResult<LegalEntity>> {
    const { 
      page = 1, 
      limit = 20, 
      cursor, 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = options;

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

    const entities = await query;
    const mappedEntities = entities.map((entity: any) => this.mapToEntity(entity));

    // Determine if there are more results
    const hasNext = cursor 
      ? mappedEntities.length === limit
      : (page * limit) < totalCount;

    // Get next cursor if using cursor pagination
    const nextCursor = cursor && mappedEntities.length > 0
      ? mappedEntities[mappedEntities.length - 1][sortBy as keyof LegalEntity]
      : undefined;

    return {
      data: mappedEntities,
      pagination: {
        hasNext,
        nextCursor: nextCursor?.toString(),
        totalCount: cursor ? undefined : totalCount
      }
    };
  }

  /**
   * Map database row to LegalEntity object
   */
  private mapToEntity(row: any): LegalEntity {
    if (!row) return null;

    const entity = new LegalEntity();
    entity.id = row.entity_id;
    entity.name = row.name;
    entity.country = row.country;
    entity.entityType = row.entity_type as LegalEntityType;
    entity.timezone = row.timezone;
    entity.regulatoryScope = row.regulatory_scope;
    entity.parentEntityId = row.parent_entity_id;
    entity.canHostAccounts = row.can_host_accounts;
    entity.canHostWallets = row.can_host_wallets;
    entity.canHostFxNodes = row.can_host_fx_nodes;
    entity.createdAt = row.created_at;
    entity.updatedAt = row.updated_at;

    return entity;
  }

  /**
   * Map LegalEntity object to database row
   */
  private mapToRow(entity: Partial<LegalEntity>): any {
    const row: any = {};

    if (entity.id !== undefined) row.entity_id = entity.id;
    if (entity.name !== undefined) row.name = entity.name;
    if (entity.country !== undefined) row.country = entity.country?.toUpperCase();
    if (entity.entityType !== undefined) row.entity_type = entity.entityType;
    if (entity.timezone !== undefined) row.timezone = entity.timezone;
    if (entity.regulatoryScope !== undefined) row.regulatory_scope = entity.regulatoryScope;
    if (entity.parentEntityId !== undefined) row.parent_entity_id = entity.parentEntityId;
    if (entity.canHostAccounts !== undefined) row.can_host_accounts = entity.canHostAccounts;
    if (entity.canHostWallets !== undefined) row.can_host_wallets = entity.canHostWallets;
    if (entity.canHostFxNodes !== undefined) row.can_host_fx_nodes = entity.canHostFxNodes;
    if (entity.createdAt !== undefined) row.created_at = entity.createdAt;
    if (entity.updatedAt !== undefined) row.updated_at = entity.updatedAt;

    return row;
  }

  /**
   * Handle database errors with meaningful messages
   */
  private handleDatabaseError(error: any): never {
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint?.includes('name_country')) {
        throw new Error('Legal entity with this name and country already exists');
      }
      throw new Error('Unique constraint violation');
    }
    
    if (error.code === '23503') { // Foreign key constraint violation
      throw new Error('Referenced parent entity does not exist');
    }
    
    if (error.code === '23514') { // Check constraint violation
      if (error.constraint?.includes('entity_type')) {
        throw new Error('Invalid entity type provided');
      }
      if (error.constraint?.includes('branch')) {
        throw new Error('Branch entities must have a parent entity');
      }
      throw new Error('Database constraint violation');
    }

    // Re-throw original error if not handled
    throw error;
  }
}
