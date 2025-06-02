/**
 * External Party Types
 * Defines the different types of external parties that can exist in the system
 */
export enum ExternalPartyType {
  CLIENT = 'client',
  PROVIDER = 'provider',
  EMPLOYEE = 'employee'
}

/**
 * KYC Status Types
 * Defines the KYC verification status for external parties
 */
export enum KycStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  BLOCKED = 'blocked'
}

/**
 * External Party Entity
 * Represents an external party in the payment network graph
 * 
 * External parties are entities outside the organization that can be associated
 * with external accounts. Each party has KYC status tracking and compliance management.
 */
export class ExternalParty {
  /**
   * Unique identifier for the external party (ULID)
   */
  id: string;

  /**
   * Human-readable name of the external party
   */
  name: string;

  /**
   * Type of external party which determines business rules and capabilities
   */
  type: ExternalPartyType;

  /**
   * ISO 3166-1 alpha-2 country code for the party's jurisdiction
   */
  jurisdiction: string;

  /**
   * KYC verification status for compliance tracking
   */
  kycStatus: KycStatus;

  /**
   * Timestamp when the relationship with this party began
   */
  relationshipStart: Date;

  /**
   * Optional free-form notes for compliance and operational information
   */
  notes?: string;

  /**
   * Timestamp when the party was created
   */
  createdAt: Date;

  /**
   * Timestamp when the party was last updated
   */
  updatedAt: Date;

  /**
   * Get the default KYC status for a given party type
   * This helps ensure consistent status assignment based on party type
   */
  static getDefaultKycStatus(type: ExternalPartyType): KycStatus {
    switch (type) {
      case ExternalPartyType.CLIENT:
        // Clients typically start with pending status requiring verification
        return KycStatus.PENDING;
      case ExternalPartyType.PROVIDER:
        // Providers may start pending but can operate with restricted access
        return KycStatus.PENDING;
      case ExternalPartyType.EMPLOYEE:
        // Employees typically have expedited verification process
        return KycStatus.PENDING;
      default:
        return KycStatus.PENDING;
    }
  }

  /**
   * Validate KYC status transition rules
   * Returns true if transition is valid, false otherwise
   */
  static validateKycTransition(from: KycStatus, to: KycStatus): boolean {
    // Define valid transitions
    const validTransitions: Record<KycStatus, KycStatus[]> = {
      [KycStatus.PENDING]: [KycStatus.VERIFIED, KycStatus.BLOCKED],
      [KycStatus.VERIFIED]: [KycStatus.BLOCKED], // Can only be blocked from verified
      [KycStatus.BLOCKED]: [KycStatus.VERIFIED], // Can be unblocked to verified
    };

    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * Check if this party can transition to a new KYC status
   */
  canTransitionKycTo(newStatus: KycStatus): boolean {
    return ExternalParty.validateKycTransition(this.kycStatus, newStatus);
  }

  /**
   * Get business rules based on party type
   */
  getTypeSpecificRules(): {
    requiresVerifiedKycForHighValue: boolean;
    canHaveMultipleAccounts: boolean;
    hasSpecialAccessRights: boolean;
    requiresComplianceNotes: boolean;
  } {
    switch (this.type) {
      case ExternalPartyType.CLIENT:
        return {
          requiresVerifiedKycForHighValue: true,
          canHaveMultipleAccounts: true,
          hasSpecialAccessRights: false,
          requiresComplianceNotes: true,
        };
      case ExternalPartyType.PROVIDER:
        return {
          requiresVerifiedKycForHighValue: false, // Can operate with pending for services
          canHaveMultipleAccounts: true,
          hasSpecialAccessRights: false,
          requiresComplianceNotes: true,
        };
      case ExternalPartyType.EMPLOYEE:
        return {
          requiresVerifiedKycForHighValue: false,
          canHaveMultipleAccounts: false, // Typically one testing account
          hasSpecialAccessRights: true, // May have admin/testing access
          requiresComplianceNotes: false, // Internal party, less compliance overhead
        };
      default:
        return {
          requiresVerifiedKycForHighValue: true,
          canHaveMultipleAccounts: false,
          hasSpecialAccessRights: false,
          requiresComplianceNotes: true,
        };
    }
  }

  /**
   * Check if party can be associated with high-value accounts
   */
  canHaveHighValueAccounts(): boolean {
    const rules = this.getTypeSpecificRules();
    
    // If type requires verified KYC for high value, check status
    if (rules.requiresVerifiedKycForHighValue) {
      return this.kycStatus === KycStatus.VERIFIED;
    }
    
    // If blocked, cannot have any high-value accounts
    if (this.kycStatus === KycStatus.BLOCKED) {
      return false;
    }
    
    // Otherwise, allow based on type rules
    return true;
  }

  /**
   * Validate jurisdiction code format
   */
  static isValidJurisdiction(jurisdiction: string): boolean {
    // Must be exactly 2 uppercase letters (ISO 3166-1 alpha-2)
    return /^[A-Z]{2}$/.test(jurisdiction);
  }

  /**
   * Validate party name format and content
   */
  static isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }
    
    const trimmed = name.trim();
    
    // Must be at least 2 characters and no more than 255
    if (trimmed.length < 2 || trimmed.length > 255) {
      return false;
    }
    
    // Allow international characters, letters, numbers, spaces, and common punctuation
    const validNamePattern = /^[\p{L}\p{N}\s\-.'&,()]+$/u;
    return validNamePattern.test(trimmed);
  }

  /**
   * Validate relationship start date
   */
  static isValidRelationshipStart(date: Date): boolean {
    if (!date || !(date instanceof Date)) {
      return false;
    }
    
    const now = new Date();
    // Cannot be in the future
    return date <= now;
  }

  /**
   * Comprehensive entity validation
   * Returns true if valid, throws error with details if invalid
   */
  validate(): boolean {
    // Validate required fields
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('External party ID is required');
    }

    if (!ExternalParty.isValidName(this.name)) {
      throw new Error('Invalid party name: must be 2-255 characters with valid characters only');
    }

    if (!Object.values(ExternalPartyType).includes(this.type)) {
      throw new Error(`Invalid party type: must be one of ${Object.values(ExternalPartyType).join(', ')}`);
    }

    if (!ExternalParty.isValidJurisdiction(this.jurisdiction)) {
      throw new Error('Jurisdiction must be a valid 2-character ISO country code');
    }

    if (!Object.values(KycStatus).includes(this.kycStatus)) {
      throw new Error(`Invalid KYC status: must be one of ${Object.values(KycStatus).join(', ')}`);
    }

    if (!ExternalParty.isValidRelationshipStart(this.relationshipStart)) {
      throw new Error('Relationship start date is required and cannot be in the future');
    }

    // Validate notes length if provided
    if (this.notes && this.notes.length > 10000) {
      throw new Error('Notes cannot exceed 10,000 characters');
    }

    // Validate created/updated timestamps
    if (!this.createdAt || !(this.createdAt instanceof Date)) {
      throw new Error('Created timestamp is required');
    }

    if (!this.updatedAt || !(this.updatedAt instanceof Date)) {
      throw new Error('Updated timestamp is required');
    }

    return true;
  }

  /**
   * Get audit information for compliance tracking
   */
  getAuditInfo(): {
    partyId: string;
    currentStatus: KycStatus;
    type: ExternalPartyType;
    jurisdiction: string;
    relationshipDuration: number; // days
    hasNotes: boolean;
  } {
    const now = new Date();
    const relationshipDays = Math.floor((now.getTime() - this.relationshipStart.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      partyId: this.id,
      currentStatus: this.kycStatus,
      type: this.type,
      jurisdiction: this.jurisdiction,
      relationshipDuration: relationshipDays,
      hasNotes: !!this.notes && this.notes.trim().length > 0,
    };
  }

  /**
   * Check if party requires immediate compliance review
   */
  requiresComplianceReview(): boolean {
    // Blocked parties always require review
    if (this.kycStatus === KycStatus.BLOCKED) {
      return true;
    }

    // Pending status for more than 30 days requires review
    if (this.kycStatus === KycStatus.PENDING) {
      const daysPending = Math.floor((new Date().getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysPending > 30) {
        return true;
      }
    }

    // Type-specific review requirements
    const rules = this.getTypeSpecificRules();
    if (rules.requiresComplianceNotes && (!this.notes || this.notes.trim().length === 0)) {
      return true;
    }

    return false;
  }

  /**
   * Get recommended actions for this party
   */
  getRecommendedActions(): string[] {
    const actions: string[] = [];

    if (this.requiresComplianceReview()) {
      actions.push('Requires compliance review');
    }

    if (this.kycStatus === KycStatus.PENDING) {
      actions.push('KYC verification pending');
    }

    if (this.kycStatus === KycStatus.BLOCKED) {
      actions.push('Party is blocked - review required before account operations');
    }

    const rules = this.getTypeSpecificRules();
    if (rules.requiresComplianceNotes && (!this.notes || this.notes.trim().length === 0)) {
      actions.push('Add compliance notes');
    }

    return actions;
  }
}
