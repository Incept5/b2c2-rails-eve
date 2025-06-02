---
type: "story"
story_id: "STORY_04_AssetNodesDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "backlog"
---

# Story 4: Asset Nodes Data Model

## Title
Implement Asset Nodes Data Model with Polymorphic Account and Wallet Support

## Description
**As a** system administrator  
**I want** to define asset nodes (bank accounts, crypto wallets, external accounts)  
**So that** the payment network graph can represent all types of financial accounts as nodes with proper balance tracking, compliance status, and operational constraints

## Acceptance Criteria

1. **Given** a system administrator needs to create an asset node, **when** they specify node type (bank_account, crypto_wallet, external_bank_account, external_crypto_wallet), **then** the system creates the node with type-specific validation and required fields

2. **Given** an asset node of type 'bank_account', **when** it is created, **then** it must include IBAN, currency, hosting legal entity, and operational hours, with automatic validation of IBAN format and entity capabilities

3. **Given** an asset node of type 'crypto_wallet', **when** it is created, **then** it must include blockchain address, network specification, currency, and 24/7 operational availability

4. **Given** external asset nodes (external_bank_account, external_crypto_wallet), **when** they are created, **then** they must reference a valid external party and include appropriate KYC verification status

5. **Given** asset nodes with balance information, **when** balance updates occur, **then** the system tracks available balance, earmarked balance, and last update timestamp for modeling purposes

6. **Given** asset nodes with compliance requirements, **when** KYC or blocking status changes, **then** all associated payment methods are automatically updated and flagged for review

## Architecture

### Database Schema
```mermaid
erDiagram
    ASSET_NODES {
        string node_id PK "ULID"
        enum type "ASSET_NODE"
        enum sub_type "bank_account|crypto_wallet|external_bank_account|external_crypto_wallet"
        string currency "3-char ISO code"
        string country "2-char ISO code"
        string account_holder_name "NOT NULL"
        string account_holder_id FK "References external_parties, NULL for internal"
        string legal_entity_id FK "References legal_entities"
        string iban "For bank accounts"
        string blockchain_address "For crypto wallets"
        string network "Blockchain network"
        string timezone "Operational timezone"
        json operating_days "Array of active days"
        string operating_hours "e.g., 24/7, 09:00-17:00"
        string status "active|inactive|suspended"
        enum direction "in|out|bidirectional"
        decimal last_known_balance "For modeling"
        decimal available_balance "Available funds"
        decimal earmarked_balance "Reserved funds"
        timestamp last_update "Balance last updated"
        boolean kyc_verified "Compliance status"
        boolean blocked "Regulatory block"
        boolean under_review "Compliance review"
        timestamp created_at
        timestamp updated_at
    }
    
    LEGAL_ENTITIES ||--o{ ASSET_NODES : "hosts"
    EXTERNAL_PARTIES ||--o{ ASSET_NODES : "owns"
    ASSET_NODES ||--o{ PAYMENT_METHODS : "source"
    ASSET_NODES ||--o{ PAYMENT_METHODS : "destination"
```

### Node Creation Flow
```mermaid
sequenceDiagram
    participant Admin as System Admin
    participant API as Asset Node API
    participant Service as Asset Node Service
    participant Validator as Node Validator
    participant LegalService as Legal Entity Service
    participant Repo as Asset Node Repository
    participant DB as PostgreSQL Database

    Admin->>API: POST /api/asset-nodes
    API->>Service: createAssetNode(dto)
    Service->>Validator: validateNodeType(sub_type, data)
    Service->>Validator: validateIBAN(iban) [if bank account]
    Service->>Validator: validateBlockchainAddress(address) [if crypto]
    Service->>LegalService: validateEntityCapabilities(legal_entity_id, sub_type)
    Service->>Service: setDefaultOperationalHours(sub_type)
    Service->>Service: initializeBalanceTracking()
    Service->>Repo: save(node)
    Repo->>DB: INSERT INTO asset_nodes
    DB-->>Repo: node with ID
    Repo-->>Service: saved node
    Service-->>API: node response
    API-->>Admin: 201 Created with node data
```

## Technical Design Considerations

### Security
- Node IDs use ULIDs for secure, non-sequential identification
- Balance information access restricted based on user permissions
- Blockchain address validation prevents invalid/malicious addresses
- IBAN validation with checksum verification
- Audit logging for all balance updates and status changes

### Validation
- Polymorphic validation based on sub_type (bank vs crypto specific fields)
- IBAN format validation using industry standard algorithms
- Blockchain address validation per network (Bitcoin, Ethereum, etc.)
- Legal entity capability validation (banks can host bank accounts, etc.)
- Currency code validation against supported currencies
- Balance validation (non-negative values, precision limits)

### Performance
- Database indexes on node_id, legal_entity_id, currency, sub_type, and status
- Composite indexes for common query patterns (legal_entity + sub_type)
- Partial indexes for active vs inactive nodes
- Efficient balance query patterns for reporting
- Optimized polymorphic queries using sub_type discrimination

### Database Design
- Polymorphic table design with type-specific optional fields
- Check constraints ensuring required fields per sub_type
- Balance precision using DECIMAL for accurate financial calculations
- JSON fields for flexible operational configuration
- Foreign key constraints with appropriate cascade rules

### Balance Tracking
- Separate fields for available vs earmarked balance modeling
- Timestamp tracking for balance update audit trails
- Precision handling for different currency decimal places
- Balance reconciliation capabilities for accuracy verification
- Historical balance tracking preparation

### Compliance Integration
- KYC status propagation to associated payment methods
- Blocking status enforcement across all node operations
- Review status workflow for compliance team management
- Integration with external party KYC status changes
- Regulatory reporting data structure

### Operational Constraints
- Operating hours enforcement for traditional banking nodes
- 24/7 availability for crypto nodes with network status consideration
- Timezone-aware operational window calculations
- Holiday calendar integration for bank account nodes
- Direction constraints for specialized accounts (in-only, out-only)

### Integration Points
- Repository pattern with polymorphic query support
- Event system for balance changes and status updates
- DTO validation with sub_type specific rules
- Swagger documentation with polymorphic examples
- Error handling for validation and constraint violations

### Scalability Considerations
- Efficient node lookup patterns for payment processing
- Bulk balance update capabilities for batch processing
- Archive strategy for inactive or closed accounts
- Performance optimization for large-scale balance queries
- Horizontal scaling preparation for high-volume scenarios
