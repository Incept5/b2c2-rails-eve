
/**
 * Legal Entity Types
 * Defines the different types of legal entities that can exist in the system
 */
export enum LegalEntityType {
  BANK = 'bank',
  EXCHANGER = 'exchanger',
  PAYMENT_PROVIDER = 'payment_provider',
  CUSTODIAN = 'custodian',
  FX_PROVIDER = 'fx_provider',
  BRANCH = 'branch'
}

/**
 * Legal Entity Entity
 * Represents a legal entity in the payment network graph
 * 
 * Legal entities are the foundational nodes that can host various types of accounts,
 * wallets, and FX nodes. Each entity has specific capabilities based on its type.
 */
export class LegalEntity {
  /**
   * Unique identifier for the legal entity (ULID)
   */
  id: string;

  /**
   * Human-readable name of the legal entity
   */
  name: string;

  /**
   * ISO 3166-1 alpha-2 country code where the entity is registered
   */
  country: string;

  /**
   * Type of legal entity which determines its capabilities
   */
  entityType: LegalEntityType;

  /**
   * Timezone identifier for the entity's operational timezone
   */
  timezone: string;

  /**
   * Optional regulatory scope or jurisdiction details
   */
  regulatoryScope?: string;

  /**
   * Parent entity ID for branch entities (null for top-level entities)
   * Only entities of type 'branch' should have a parent
   */
  parentEntityId?: string;

  /**
   * Whether this entity can host bank accounts
   * Typically true for banks and their branches
   */
  canHostAccounts: boolean;

  /**
   * Whether this entity can host crypto wallets
   * Typically true for exchanges, custodians and their branches
   */
  canHostWallets: boolean;

  /**
   * Whether this entity can host FX nodes
   * Typically true for FX providers and their branches
   */
  canHostFxNodes: boolean;

  /**
   * Timestamp when the entity was created
   */
  createdAt: Date;

  /**
   * Timestamp when the entity was last updated
   */
  updatedAt: Date;

  /**
   * Get the default capabilities for a given entity type
   * This helps ensure consistent capability assignment based on entity type
   */
  static getDefaultCapabilities(entityType: LegalEntityType): {
    canHostAccounts: boolean;
    canHostWallets: boolean;
    canHostFxNodes: boolean;
  } {
    switch (entityType) {
      case LegalEntityType.BANK:
        return {
          canHostAccounts: true,
          canHostWallets: false,
          canHostFxNodes: false
        };
      case LegalEntityType.EXCHANGER:
      case LegalEntityType.CUSTODIAN:
        return {
          canHostAccounts: false,
          canHostWallets: true,
          canHostFxNodes: false
        };
      case LegalEntityType.FX_PROVIDER:
        return {
          canHostAccounts: false,
          canHostWallets: false,
          canHostFxNodes: true
        };
      case LegalEntityType.PAYMENT_PROVIDER:
        return {
          canHostAccounts: true,
          canHostWallets: false,
          canHostFxNodes: false
        };
      case LegalEntityType.BRANCH:
        // Branches inherit capabilities from their parent
        // This should be handled by the service layer
        return {
          canHostAccounts: false,
          canHostWallets: false,
          canHostFxNodes: false
        };
      default:
        return {
          canHostAccounts: false,
          canHostWallets: false,
          canHostFxNodes: false
        };
    }
  }

  /**
   * Validate that the entity configuration is valid
   * Returns true if valid, throws error with details if invalid
   */
  validate(): boolean {
    // Branch entities must have a parent
    if (this.entityType === LegalEntityType.BRANCH && !this.parentEntityId) {
      throw new Error('Branch entities must have a parent entity');
    }

    // Non-branch entities should not have a parent
    if (this.entityType !== LegalEntityType.BRANCH && this.parentEntityId) {
      throw new Error('Only branch entities can have a parent entity');
    }

    // Country code must be 2 characters (ISO 3166-1 alpha-2)
    if (!this.country || this.country.length !== 2) {
      throw new Error('Country must be a valid 2-character ISO code');
    }

    // Name is required
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Entity name is required');
    }

    // Timezone is required
    if (!this.timezone || this.timezone.trim().length === 0) {
      throw new Error('Timezone is required');
    }

    return true;
  }
}
