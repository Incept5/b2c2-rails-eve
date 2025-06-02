import { Injectable, Logger } from '@nestjs/common';
import { ulid } from 'ulid';
import { ExternalPartyRepository, PaginatedResult, QueryOptions, ExternalPartyFilters } from '../repositories/external-party.repository';
import { ExternalParty, ExternalPartyType, KycStatus } from '../entities/external-party.entity';

/**
 * Business exceptions for external party operations
 */
export class PartyNotFoundException extends Error {
  constructor(partyId: string) {
    super(`External party with ID ${partyId} not found`);
    this.name = 'PartyNotFoundException';
  }
}

export class InvalidKycTransitionException extends Error {
  constructor(fromStatus: KycStatus, toStatus: KycStatus) {
    super(`Invalid KYC transition from ${fromStatus} to ${toStatus}`);
    this.name = 'InvalidKycTransitionException';
  }
}

export class ComplianceViolationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComplianceViolationException';
  }
}

export class DuplicatePartyException extends Error {
  constructor(name: string, jurisdiction: string) {
    super(`External party with name '${name}' already exists in jurisdiction ${jurisdiction}`);
    this.name = 'DuplicatePartyException';
  }
}

export class ValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationException';
  }
}

export class AssociatedAccountsException extends Error {
  constructor(partyId: string) {
    super(`Cannot delete external party ${partyId} because it has associated accounts`);
    this.name = 'AssociatedAccountsException';
  }
}

/**
 * DTOs for service operations
 */
export interface CreateExternalPartyDto {
  name: string;
  type: ExternalPartyType;
  jurisdiction: string;
  kycStatus?: KycStatus;
  relationshipStart?: Date;
  notes?: string;
}

export interface UpdateExternalPartyDto {
  name?: string;
  jurisdiction?: string;
  relationshipStart?: Date;
  notes?: string;
}

export interface UpdateKycStatusDto {
  newStatus: KycStatus;
  reason?: string;
  notes?: string;
}

export interface ComplianceFilters {
  requiresReview?: boolean;
  kycStatus?: KycStatus;
  partyType?: ExternalPartyType;
  jurisdiction?: string;
  reviewPeriodDays?: number;
}

export interface BulkKycUpdateDto {
  partyIds: string[];
  newStatus: KycStatus;
  reason: string;
  notes?: string;
}

/**
 * External Party Service
 * Implements business logic for external party operations including KYC workflows
 */
@Injectable()
export class ExternalPartyService {
  private readonly logger = new Logger(ExternalPartyService.name);

  constructor(
    private readonly externalPartyRepository: ExternalPartyRepository
  ) {}

  // =====================================
  // Core Business Operations
  // =====================================

  /**
   * Create a new external party with business rule validation
   */
  async createParty(createDto: CreateExternalPartyDto): Promise<ExternalParty> {
    this.logger.debug(`Creating external party: ${createDto.name}`);

    // Validate input data
    this.validateCreateInput(createDto);

    // Check for duplicate name/jurisdiction combination
    const isUnique = await this.externalPartyRepository.isNameJurisdictionUnique(
      createDto.name,
      createDto.jurisdiction
    );
    if (!isUnique) {
      throw new DuplicatePartyException(createDto.name, createDto.jurisdiction);
    }

    // Generate ULID for new party
    const partyId = ulid();

    // Set default values based on business rules
    const kycStatus = createDto.kycStatus || ExternalParty.getDefaultKycStatus(createDto.type);
    const relationshipStart = createDto.relationshipStart || new Date();

    // Create party object
    const party = new ExternalParty();
    party.id = partyId;
    party.name = createDto.name.trim();
    party.type = createDto.type;
    party.jurisdiction = createDto.jurisdiction.toUpperCase();
    party.kycStatus = kycStatus;
    party.relationshipStart = relationshipStart;
    party.notes = createDto.notes?.trim() || null;
    party.createdAt = new Date();
    party.updatedAt = new Date();

    // Apply type-specific business rules
    this.enforcePartyTypeRules(party);

    // Validate entity configuration
    party.validate();

    // Create in repository
    const created = await this.externalPartyRepository.create(party);
    this.logger.log(`External party created with ID: ${created.id}`);

    return created;
  }

  /**
   * Update external party details (non-KYC fields)
   */
  async updateParty(partyId: string, updateDto: UpdateExternalPartyDto): Promise<ExternalParty> {
    this.logger.debug(`Updating external party: ${partyId}`);

    // Validate party exists
    const existingParty = await this.findById(partyId);

    // Validate unique name/jurisdiction if name or jurisdiction is being updated
    if (updateDto.name || updateDto.jurisdiction) {
      const newName = updateDto.name || existingParty.name;
      const newJurisdiction = updateDto.jurisdiction || existingParty.jurisdiction;
      
      const isUnique = await this.externalPartyRepository.isNameJurisdictionUnique(
        newName,
        newJurisdiction,
        partyId
      );
      if (!isUnique) {
        throw new DuplicatePartyException(newName, newJurisdiction);
      }
    }

    // Validate input
    this.validateUpdateInput(updateDto);

    // Prepare update data
    const updateData = {
      ...updateDto,
      name: updateDto.name?.trim(),
      jurisdiction: updateDto.jurisdiction?.toUpperCase(),
      notes: updateDto.notes?.trim(),
      updatedAt: new Date()
    };

    // Create temporary party object for validation
    const updatedParty = { ...existingParty, ...updateData };
    this.enforcePartyTypeRules(updatedParty as ExternalParty);

    const result = await this.externalPartyRepository.update(partyId, updateData);
    this.logger.log(`External party updated: ${partyId}`);

    return result;
  }

  /**
   * Delete external party with dependency checking
   */
  async deleteParty(partyId: string): Promise<void> {
    this.logger.debug(`Deleting external party: ${partyId}`);

    // Validate party exists
    await this.findById(partyId);

    // Check for associated accounts
    const hasAccounts = await this.externalPartyRepository.hasAssociatedAccounts(partyId);
    if (hasAccounts) {
      throw new AssociatedAccountsException(partyId);
    }

    await this.externalPartyRepository.delete(partyId);
    this.logger.log(`External party deleted: ${partyId}`);
  }

  /**
   * Find external party by ID
   */
  async findById(partyId: string): Promise<ExternalParty> {
    const party = await this.externalPartyRepository.findById(partyId);
    if (!party) {
      throw new PartyNotFoundException(partyId);
    }
    return party;
  }

  // =====================================
  // KYC Management Operations
  // =====================================

  /**
   * Update KYC status with workflow validation and audit trail
   */
  async updateKycStatus(partyId: string, updateDto: UpdateKycStatusDto): Promise<ExternalParty> {
    this.logger.debug(`Updating KYC status for party: ${partyId} to ${updateDto.newStatus}`);

    const party = await this.findById(partyId);
    
    // Validate KYC transition
    if (!this.validateKycTransition(party.kycStatus, updateDto.newStatus)) {
      throw new InvalidKycTransitionException(party.kycStatus, updateDto.newStatus);
    }

    // Apply business rules for status change
    await this.handleKycStatusChange(partyId, party.kycStatus, updateDto.newStatus, updateDto.reason);

    // Prepare audit trail in notes
    const auditNote = `[${new Date().toISOString()}] KYC Status changed from ${party.kycStatus} to ${updateDto.newStatus}` +
                     (updateDto.reason ? `. Reason: ${updateDto.reason}` : '') +
                     (updateDto.notes ? `. Notes: ${updateDto.notes}` : '');

    const existingNotes = party.notes || '';
    const updatedNotes = existingNotes ? `${existingNotes}\n${auditNote}` : auditNote;

    // Update with audit trail
    const result = await this.externalPartyRepository.update(partyId, {
      kycStatus: updateDto.newStatus,
      notes: updatedNotes,
      updatedAt: new Date()
    });

    this.logger.log(`KYC status updated for party ${partyId}: ${party.kycStatus} -> ${updateDto.newStatus}`);
    return result;
  }

  /**
   * Validate KYC transition rules
   */
  validateKycTransition(fromStatus: KycStatus, toStatus: KycStatus): boolean {
    return ExternalParty.validateKycTransition(fromStatus, toStatus);
  }

  /**
   * Flag party for compliance review
   */
  async flagPartyForReview(partyId: string, reason: string): Promise<void> {
    this.logger.debug(`Flagging party for review: ${partyId}`);

    const party = await this.findById(partyId);
    
    const reviewNote = `[${new Date().toISOString()}] FLAGGED FOR REVIEW: ${reason}`;
    const existingNotes = party.notes || '';
    const updatedNotes = existingNotes ? `${existingNotes}\n${reviewNote}` : reviewNote;

    await this.externalPartyRepository.update(partyId, {
      notes: updatedNotes,
      updatedAt: new Date()
    });

    this.logger.log(`Party flagged for review: ${partyId} - ${reason}`);
  }

  /**
   * Bulk update KYC status for multiple parties
   */
  async bulkUpdateKycStatus(bulkDto: BulkKycUpdateDto): Promise<{ successful: string[], failed: { partyId: string, error: string }[] }> {
    this.logger.debug(`Bulk updating KYC status for ${bulkDto.partyIds.length} parties to ${bulkDto.newStatus}`);

    const successful: string[] = [];
    const failed: { partyId: string, error: string }[] = [];

    for (const partyId of bulkDto.partyIds) {
      try {
        await this.updateKycStatus(partyId, {
          newStatus: bulkDto.newStatus,
          reason: bulkDto.reason,
          notes: bulkDto.notes
        });
        successful.push(partyId);
      } catch (error) {
        failed.push({
          partyId,
          error: error.message
        });
      }
    }

    this.logger.log(`Bulk KYC update completed: ${successful.length} successful, ${failed.length} failed`);
    return { successful, failed };
  }

  // =====================================
  // Query and Filtering Operations
  // =====================================

  /**
   * Find parties with filtering and pagination
   */
  async findParties(filters: ExternalPartyFilters, options: QueryOptions = {}): Promise<PaginatedResult<ExternalParty>> {
    this.logger.debug('Finding external parties with filters');
    return this.externalPartyRepository.findWithFilters(filters, options);
  }

  /**
   * Find parties by compliance criteria
   */
  async findPartiesByCompliance(complianceFilters: ComplianceFilters): Promise<ExternalParty[]> {
    this.logger.debug('Finding parties by compliance criteria');

    if (complianceFilters.requiresReview) {
      return this.externalPartyRepository.findPartiesRequiringReview();
    }

    // Build filters for standard queries
    const filters: ExternalPartyFilters = {};
    if (complianceFilters.kycStatus) {
      filters.kycStatus = complianceFilters.kycStatus;
    }
    if (complianceFilters.partyType) {
      filters.type = complianceFilters.partyType;
    }
    if (complianceFilters.jurisdiction) {
      filters.jurisdiction = complianceFilters.jurisdiction;
    }

    const result = await this.externalPartyRepository.findWithFilters(filters);
    return result.data;
  }

  /**
   * Get party statistics for compliance reporting
   */
  async getPartyStatistics() {
    this.logger.debug('Getting party statistics');
    return this.externalPartyRepository.getPartyStatistics();
  }

  /**
   * Get parties requiring immediate attention
   */
  async getPartiesRequiringAttention(): Promise<{
    blockedParties: ExternalParty[];
    pendingReview: ExternalParty[];
    missingCompliance: ExternalParty[];
  }> {
    this.logger.debug('Getting parties requiring attention');

    const [blockedParties, pendingReview] = await Promise.all([
      this.externalPartyRepository.findByKycStatus(KycStatus.BLOCKED).then(result => result.data),
      this.externalPartyRepository.findPartiesRequiringReview()
    ]);

    // Find parties missing compliance information
    const missingCompliance = await this.externalPartyRepository.findWithFilters({
      hasNotes: false
    }).then(result => result.data.filter(party => party.getTypeSpecificRules().requiresComplianceNotes));

    return {
      blockedParties,
      pendingReview,
      missingCompliance
    };
  }

  // =====================================
  // Private Helper Methods
  // =====================================

  /**
   * Handle KYC status change business logic
   */
  private async handleKycStatusChange(
    partyId: string, 
    fromStatus: KycStatus, 
    toStatus: KycStatus, 
    reason?: string
  ): Promise<void> {
    // Handle blocked status changes
    if (toStatus === KycStatus.BLOCKED) {
      await this.handleBlockedStatusChange(partyId, reason);
    }

    // Handle verified status changes
    if (toStatus === KycStatus.VERIFIED && fromStatus !== KycStatus.VERIFIED) {
      await this.handleVerifiedStatusChange(partyId);
    }

    // Handle pending status changes
    if (toStatus === KycStatus.PENDING && fromStatus === KycStatus.BLOCKED) {
      await this.handleUnblockedStatusChange(partyId, reason);
    }
  }

  /**
   * Handle party being blocked
   */
  private async handleBlockedStatusChange(partyId: string, reason?: string): Promise<void> {
    this.logger.warn(`Party ${partyId} blocked. Reason: ${reason || 'No reason provided'}`);
    
    // Future: Flag associated accounts for review
    // For now, log the change for audit purposes
    // This method will be extended when account associations are implemented
  }

  /**
   * Handle party being verified
   */
  private async handleVerifiedStatusChange(partyId: string): Promise<void> {
    this.logger.log(`Party ${partyId} verified - now eligible for high-value accounts`);
    
    // Future: Enable high-value account creation
    // This method will be extended when account associations are implemented
  }

  /**
   * Handle party being unblocked
   */
  private async handleUnblockedStatusChange(partyId: string, reason?: string): Promise<void> {
    this.logger.log(`Party ${partyId} unblocked. Reason: ${reason || 'No reason provided'}`);
    
    // Future: Re-enable account operations
    // This method will be extended when account associations are implemented
  }

  /**
   * Enforce party type-specific business rules
   */
  private enforcePartyTypeRules(party: ExternalParty): void {
    const rules = party.getTypeSpecificRules();

    // Enforce compliance notes requirement
    if (rules.requiresComplianceNotes && (!party.notes || party.notes.trim().length === 0)) {
      // Don't throw error on creation, but log warning for monitoring
      this.logger.warn(`Party ${party.id} of type ${party.type} should have compliance notes`);
    }

    // Validate high-value account eligibility
    if (rules.requiresVerifiedKycForHighValue && party.kycStatus !== KycStatus.VERIFIED) {
      // This is informational - actual enforcement happens during account creation
      this.logger.debug(`Party ${party.id} requires verified KYC for high-value operations`);
    }
  }

  /**
   * Validate create input data
   */
  private validateCreateInput(createDto: CreateExternalPartyDto): void {
    if (!createDto.name?.trim()) {
      throw new ValidationException('Party name is required');
    }

    if (!ExternalParty.isValidName(createDto.name)) {
      throw new ValidationException('Invalid party name format');
    }

    if (!Object.values(ExternalPartyType).includes(createDto.type)) {
      throw new ValidationException('Invalid party type');
    }

    if (!createDto.jurisdiction || !ExternalParty.isValidJurisdiction(createDto.jurisdiction.toUpperCase())) {
      throw new ValidationException('Valid jurisdiction code is required');
    }

    if (createDto.kycStatus && !Object.values(KycStatus).includes(createDto.kycStatus)) {
      throw new ValidationException('Invalid KYC status');
    }

    if (createDto.relationshipStart && !ExternalParty.isValidRelationshipStart(createDto.relationshipStart)) {
      throw new ValidationException('Invalid relationship start date');
    }

    if (createDto.notes && createDto.notes.length > 10000) {
      throw new ValidationException('Notes cannot exceed 10,000 characters');
    }
  }

  /**
   * Validate update input data
   */
  private validateUpdateInput(updateDto: UpdateExternalPartyDto): void {
    if (updateDto.name !== undefined) {
      if (!updateDto.name?.trim()) {
        throw new ValidationException('Party name cannot be empty');
      }
      if (!ExternalParty.isValidName(updateDto.name)) {
        throw new ValidationException('Invalid party name format');
      }
    }

    if (updateDto.jurisdiction !== undefined) {
      if (!updateDto.jurisdiction || !ExternalParty.isValidJurisdiction(updateDto.jurisdiction.toUpperCase())) {
        throw new ValidationException('Valid jurisdiction code is required');
      }
    }

    if (updateDto.relationshipStart !== undefined) {
      if (!ExternalParty.isValidRelationshipStart(updateDto.relationshipStart)) {
        throw new ValidationException('Invalid relationship start date');
      }
    }

    if (updateDto.notes !== undefined && updateDto.notes && updateDto.notes.length > 10000) {
      throw new ValidationException('Notes cannot exceed 10,000 characters');
    }
  }
}
