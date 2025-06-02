
import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
import { LegalEntityRepository, PaginatedResult, QueryOptions } from '../repositories/legal-entity.repository';
import { LegalEntity, LegalEntityType } from '../entities/legal-entity.entity';

/**
 * Business exceptions for legal entity operations
 */
export class EntityNotFoundException extends Error {
  constructor(entityId: string) {
    super(`Legal entity with ID ${entityId} not found`);
    this.name = 'EntityNotFoundException';
  }
}

export class InvalidHierarchyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidHierarchyException';
  }
}

export class DuplicateEntityException extends Error {
  constructor(name: string, country: string) {
    super(`Legal entity with name '${name}' already exists in country ${country}`);
    this.name = 'DuplicateEntityException';
  }
}

export class DependentEntitiesException extends Error {
  constructor(entityId: string) {
    super(`Cannot delete legal entity ${entityId} because it has dependent entities`);
    this.name = 'DependentEntitiesException';
  }
}

export class ValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationException';
  }
}

/**
 * DTOs for service operations
 */
export interface CreateLegalEntityDto {
  name: string;
  country: string;
  entityType: LegalEntityType;
  timezone: string;
  regulatoryScope?: string;
  parentEntityId?: string;
}

export interface UpdateLegalEntityDto {
  name?: string;
  country?: string;
  timezone?: string;
  regulatoryScope?: string;
}

export interface EntityFilters {
  entityType?: LegalEntityType;
  country?: string;
  parentEntityId?: string;
  canHostAccounts?: boolean;
  canHostWallets?: boolean;
  canHostFxNodes?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Capability configuration for each entity type
 */
const DEFAULT_CAPABILITIES = {
  [LegalEntityType.BANK]: {
    can_host_accounts: true,
    can_host_wallets: false,
    can_host_fx_nodes: false
  },
  [LegalEntityType.EXCHANGER]: {
    can_host_accounts: false,
    can_host_wallets: true,
    can_host_fx_nodes: false
  },
  [LegalEntityType.CUSTODIAN]: {
    can_host_accounts: false,
    can_host_wallets: true,
    can_host_fx_nodes: false
  },
  [LegalEntityType.FX_PROVIDER]: {
    can_host_accounts: false,
    can_host_wallets: false,
    can_host_fx_nodes: true
  },
  [LegalEntityType.PAYMENT_PROVIDER]: {
    can_host_accounts: true,
    can_host_wallets: false,
    can_host_fx_nodes: false
  },
  [LegalEntityType.BRANCH]: {
    // Inherit from parent - will be set dynamically
    can_host_accounts: false,
    can_host_wallets: false,
    can_host_fx_nodes: false
  }
};

/**
 * Legal Entity Service
 * Implements business logic for legal entity operations
 */
@Injectable()
export class LegalEntityService {
  constructor(private readonly legalEntityRepository: LegalEntityRepository) {}

  /**
   * Create a new legal entity with business rule validation
   */
  async createEntity(createDto: CreateLegalEntityDto): Promise<LegalEntity> {
    // Validate input data
    this.validateCreateInput(createDto);

    // Check for duplicate name/country combination
    const isUnique = await this.legalEntityRepository.isNameCountryUnique(
      createDto.name,
      createDto.country
    );
    if (!isUnique) {
      throw new DuplicateEntityException(createDto.name, createDto.country);
    }

    // Validate parent entity for branches
    let parentEntity: LegalEntity | null = null;
    if (createDto.entityType === LegalEntityType.BRANCH) {
      if (!createDto.parentEntityId) {
        throw new ValidationException('Branch entities must have a parent entity');
      }
      parentEntity = await this.legalEntityRepository.findById(createDto.parentEntityId);
      if (!parentEntity) {
        throw new EntityNotFoundException(createDto.parentEntityId);
      }
    } else if (createDto.parentEntityId) {
      throw new ValidationException('Only branch entities can have a parent entity');
    }

    // Generate ULID for new entity
    const entityId = ulid();

    // Set default capabilities based on entity type
    const capabilities = this.setDefaultCapabilities(createDto.entityType, parentEntity);

    // Create entity object
    const entity = new LegalEntity();
    entity.id = entityId;
    entity.name = createDto.name;
    entity.country = createDto.country.toUpperCase();
    entity.entityType = createDto.entityType;
    entity.timezone = createDto.timezone;
    entity.regulatoryScope = createDto.regulatoryScope;
    entity.parentEntityId = createDto.parentEntityId;
    entity.canHostAccounts = capabilities.can_host_accounts;
    entity.canHostWallets = capabilities.can_host_wallets;
    entity.canHostFxNodes = capabilities.can_host_fx_nodes;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    // Validate entity configuration
    entity.validate();

    // Create in repository
    return this.legalEntityRepository.create(entity);
  }

  /**
   * Find legal entity by ID
   */
  async findById(entityId: string): Promise<LegalEntity> {
    const entity = await this.legalEntityRepository.findById(entityId);
    if (!entity) {
      throw new EntityNotFoundException(entityId);
    }
    return entity;
  }

  /**
   * Update legal entity
   */
  async updateEntity(entityId: string, updateDto: UpdateLegalEntityDto): Promise<LegalEntity> {
    // Validate entity exists
    const existingEntity = await this.findById(entityId);

    // Validate unique name/country if name or country is being updated
    if (updateDto.name || updateDto.country) {
      const newName = updateDto.name || existingEntity.name;
      const newCountry = updateDto.country || existingEntity.country;
      
      const isUnique = await this.legalEntityRepository.isNameCountryUnique(
        newName,
        newCountry,
        entityId
      );
      if (!isUnique) {
        throw new DuplicateEntityException(newName, newCountry);
      }
    }

    // Validate input
    this.validateUpdateInput(updateDto);

    // Update entity
    const updateData = {
      ...updateDto,
      country: updateDto.country?.toUpperCase(),
      updatedAt: new Date()
    };

    return this.legalEntityRepository.update(entityId, updateData);
  }

  /**
   * Delete legal entity
   */
  async deleteEntity(entityId: string): Promise<void> {
    // Validate entity exists
    await this.findById(entityId);

    // Check for dependent entities
    const hasDependents = await this.legalEntityRepository.hasDependentNodes(entityId);
    if (hasDependents) {
      throw new DependentEntitiesException(entityId);
    }

    await this.legalEntityRepository.delete(entityId);
  }

  /**
   * Find entities with filtering and pagination
   */
  async findEntities(filters: EntityFilters): Promise<PaginatedResult<LegalEntity>> {
    const queryOptions: QueryOptions = {
      page: filters.page,
      limit: filters.limit
    };

    const repositoryFilters = {
      entityType: filters.entityType,
      country: filters.country?.toUpperCase(),
      parentEntityId: filters.parentEntityId,
      canHostAccounts: filters.canHostAccounts,
      canHostWallets: filters.canHostWallets,
      canHostFxNodes: filters.canHostFxNodes
    };

    return this.legalEntityRepository.findWithFilters(repositoryFilters, queryOptions);
  }

  /**
   * Validate hierarchy to prevent circular references
   */
  async validateHierarchy(entityId: string, parentEntityId: string): Promise<boolean> {
    if (entityId === parentEntityId) {
      return false; // Entity cannot be its own parent
    }

    return this.legalEntityRepository.validateParentChild(entityId, parentEntityId);
  }

  /**
   * Set default capabilities based on entity type
   */
  setDefaultCapabilities(entityType: LegalEntityType, parentEntity?: LegalEntity): {
    can_host_accounts: boolean;
    can_host_wallets: boolean;
    can_host_fx_nodes: boolean;
  } {
    if (entityType === LegalEntityType.BRANCH && parentEntity) {
      // Branches inherit capabilities from parent
      return {
        can_host_accounts: parentEntity.canHostAccounts,
        can_host_wallets: parentEntity.canHostWallets,
        can_host_fx_nodes: parentEntity.canHostFxNodes
      };
    }

    return DEFAULT_CAPABILITIES[entityType] || {
      can_host_accounts: false,
      can_host_wallets: false,
      can_host_fx_nodes: false
    };
  }

  /**
   * Get entity hierarchy (all descendants)
   */
  async getEntityHierarchy(entityId: string): Promise<LegalEntity[]> {
    // Validate entity exists
    await this.findById(entityId);

    return this.legalEntityRepository.findDescendants(entityId);
  }

  /**
   * Get direct children of an entity
   */
  async getEntityChildren(entityId: string): Promise<LegalEntity[]> {
    // Validate entity exists
    await this.findById(entityId);

    return this.legalEntityRepository.findChildren(entityId);
  }

  /**
   * Private validation methods
   */
  private validateCreateInput(createDto: CreateLegalEntityDto): void {
    if (!createDto.name?.trim()) {
      throw new ValidationException('Entity name is required');
    }

    if (!createDto.country || createDto.country.length !== 2) {
      throw new ValidationException('Country must be a valid 2-character ISO code');
    }

    if (!Object.values(LegalEntityType).includes(createDto.entityType)) {
      throw new ValidationException('Invalid entity type');
    }

    if (!createDto.timezone?.trim()) {
      throw new ValidationException('Timezone is required');
    }

    // Validate timezone format (basic check)
    if (!this.isValidTimezone(createDto.timezone)) {
      throw new ValidationException('Invalid timezone format');
    }

    // Validate country code format (basic check)
    if (!/^[A-Z]{2}$/.test(createDto.country.toUpperCase())) {
      throw new ValidationException('Country code must be 2 uppercase letters');
    }
  }

  private validateUpdateInput(updateDto: UpdateLegalEntityDto): void {
    if (updateDto.name !== undefined && !updateDto.name?.trim()) {
      throw new ValidationException('Entity name cannot be empty');
    }

    if (updateDto.country !== undefined) {
      if (!updateDto.country || updateDto.country.length !== 2) {
        throw new ValidationException('Country must be a valid 2-character ISO code');
      }
      if (!/^[A-Z]{2}$/.test(updateDto.country.toUpperCase())) {
        throw new ValidationException('Country code must be 2 uppercase letters');
      }
    }

    if (updateDto.timezone !== undefined) {
      if (!updateDto.timezone?.trim()) {
        throw new ValidationException('Timezone cannot be empty');
      }
      if (!this.isValidTimezone(updateDto.timezone)) {
        throw new ValidationException('Invalid timezone format');
      }
    }
  }

  private isValidTimezone(timezone: string): boolean {
    // Basic timezone validation - could be enhanced with a proper timezone library
    return timezone.includes('/') && timezone.length > 3;
  }
}
