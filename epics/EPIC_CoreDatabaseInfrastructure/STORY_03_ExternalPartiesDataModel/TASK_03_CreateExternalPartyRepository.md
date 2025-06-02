---
type: "task"
task_id: "TASK_03_CreateExternalPartyRepository"
story_id: "STORY_03_ExternalPartiesDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "todo"
---

# Task 3: Create External Party Repository

## Task Title
Implement External Party Repository with Data Access Layer

## Detailed Description
Create the ExternalPartyRepository class following the established repository pattern from LegalEntityRepository. This repository will handle all database operations for external parties including CRUD operations, complex filtering, KYC status queries, and efficient pagination. Include specialized query methods for compliance reporting and relationship management.

## Technical Approach / Implementation Plan

### 1. Repository Structure Design
- Create ExternalPartyRepository class in `backend/src/modules/legal-entity/repositories/`
- Follow established patterns from LegalEntityRepository
- Implement comprehensive CRUD operations with error handling
- Add specialized query methods for external party management
- Include pagination and filtering capabilities

### 2. Core Database Operations
- Create, read, update, delete operations with proper error handling
- Bulk operations for efficient data management
- Transaction support for complex operations
- Optimized queries with proper indexing usage

### 3. Specialized Query Methods
- Filter by party type, jurisdiction, KYC status
- KYC status transition tracking and audit queries
- Relationship timeline queries
- Compliance reporting queries
- Associated account relationship queries (preparation for future)

### 4. Data Mapping and Validation
- Database row to entity mapping
- Entity to database row mapping
- Proper error handling with meaningful messages
- Data integrity validation

## File Paths to Read
- `backend/src/modules/legal-entity/repositories/legal-entity.repository.ts` - Primary pattern reference
- `backend/src/modules/legal-entity/repositories/payment-scheme.repository.ts` - Additional pattern reference
- `backend/src/modules/database/database.service.ts` - Database service patterns

## Relevant Code Snippets

### Repository Class Structure
```typescript
@Injectable()
export class ExternalPartyRepository {
  constructor(private readonly db: DatabaseService) {}

  // Core CRUD operations
  async create(party: Partial<ExternalParty>): Promise<ExternalParty>;
  async findById(partyId: string): Promise<ExternalParty | null>;
  async update(partyId: string, updates: Partial<ExternalParty>): Promise<ExternalParty>;
  async delete(partyId: string): Promise<void>;

  // Query operations with filtering
  async findAll(options: QueryOptions): Promise<PaginatedResult<ExternalParty>>;
  async findByType(type: ExternalPartyType, options: QueryOptions): Promise<PaginatedResult<ExternalParty>>;
  async findByKycStatus(status: KycStatus, options: QueryOptions): Promise<PaginatedResult<ExternalParty>>;
  async findByJurisdiction(jurisdiction: string, options: QueryOptions): Promise<PaginatedResult<ExternalParty>>;

  // Specialized queries
  async findWithFilters(filters: ExternalPartyFilters, options: QueryOptions): Promise<PaginatedResult<ExternalParty>>;
  async findKycStatusHistory(partyId: string): Promise<KycStatusChange[]>;
  async findPartiesRequiringReview(): Promise<ExternalParty[]>;
  
  // Validation and existence checks
  async existsById(partyId: string): Promise<boolean>;
  async hasAssociatedAccounts(partyId: string): Promise<boolean>;
  async isNameJurisdictionUnique(name: string, jurisdiction: string, excludeId?: string): Promise<boolean>;
}
```

### Data Mapping Methods
```typescript
private mapToEntity(row: any): ExternalParty {
  const party = new ExternalParty();
  party.id = row.external_id;
  party.name = row.name;
  party.type = row.type as ExternalPartyType;
  party.jurisdiction = row.jurisdiction;
  party.kycStatus = row.kyc_status as KycStatus;
  party.relationshipStart = row.relationship_start;
  party.notes = row.notes;
  party.createdAt = row.created_at;
  party.updatedAt = row.updated_at;
  return party;
}

private mapToRow(party: Partial<ExternalParty>): any {
  const row: any = {};
  if (party.id !== undefined) row.external_id = party.id;
  if (party.name !== undefined) row.name = party.name;
  if (party.type !== undefined) row.type = party.type;
  if (party.jurisdiction !== undefined) row.jurisdiction = party.jurisdiction.toUpperCase();
  if (party.kycStatus !== undefined) row.kyc_status = party.kycStatus;
  if (party.relationshipStart !== undefined) row.relationship_start = party.relationshipStart;
  if (party.notes !== undefined) row.notes = party.notes;
  return row;
}
```

## API Endpoint Details
Not applicable - this task focuses on repository layer implementation.

## Database Schema Changes
None - this task works with the external_parties table created in Task 1.

## Libraries/Dependencies
- **DatabaseService**: Existing knex-based database service
- **Injectable decorator**: NestJS dependency injection
- **Existing pagination interfaces**: From legal entity repository

## Potential Challenges and Solutions

### Challenge 1: Complex Filtering Performance
**Issue**: Efficient querying with multiple filter combinations
**Solution**: Utilize composite indexes and implement query optimization for common filter patterns

### Challenge 2: KYC Status Change Tracking
**Issue**: Maintaining audit trail for KYC status changes
**Solution**: Implement proper update tracking and prepare for future audit table integration

### Challenge 3: Data Consistency
**Issue**: Ensuring data integrity during concurrent operations
**Solution**: Use database transactions and proper locking mechanisms for critical operations

### Challenge 4: International Data Handling
**Issue**: Proper handling of international names and jurisdiction codes
**Solution**: Implement proper character encoding and validation in mapping methods

## Test Cases to Consider

### CRUD Operations Testing
1. **Create**: Test party creation with all field combinations
2. **Read**: Test finding parties by ID and various filters
3. **Update**: Test partial and complete updates with validation
4. **Delete**: Test deletion with dependency checking

### Query Performance Testing
1. **Filtering**: Test all filter combinations for performance
2. **Pagination**: Validate pagination with large datasets
3. **Sorting**: Test sorting by various fields
4. **Index Usage**: Verify proper index utilization

### Data Integrity Testing
1. **Constraint Validation**: Test database constraint enforcement
2. **Mapping Accuracy**: Verify entity-to-row mapping consistency
3. **Error Handling**: Test error scenarios and recovery
4. **Transaction Safety**: Test rollback scenarios

### Business Logic Testing
1. **KYC Status Queries**: Test KYC-specific query methods
2. **Relationship Validation**: Test relationship constraint checking
3. **Compliance Queries**: Test reporting and audit query methods
4. **Uniqueness Validation**: Test name/jurisdiction uniqueness checking

## Implementation Steps
1. Create ExternalPartyRepository class file
2. Implement core CRUD operations with proper error handling
3. Add specialized query methods for filtering and searching
4. Implement data mapping methods (entity <-> database row)
5. Add pagination and sorting capabilities
6. Create validation and existence checking methods
7. Implement specialized compliance and audit query methods
8. Add comprehensive error handling with meaningful messages
9. Test all repository methods with various scenarios
10. Validate query performance and optimization
