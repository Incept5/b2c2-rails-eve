---
type: "task"
task_id: "TASK_04_CreateExternalPartyService"
story_id: "STORY_03_ExternalPartiesDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "todo"
---

# Task 4: Create External Party Service

## Task Title
Implement External Party Service with Business Logic Layer

## Detailed Description
Create the ExternalPartyService class following the established service pattern from LegalEntityService. This service will implement comprehensive business logic for external party management including KYC status workflows, compliance validation, party type-specific rules, and relationship management. Include proper exception handling, validation, and integration points for future account association features.

## Technical Approach / Implementation Plan

### 1. Service Architecture Design
- Create ExternalPartyService class in `backend/src/modules/legal-entity/services/`
- Follow established patterns from LegalEntityService
- Implement comprehensive business logic validation
- Add KYC status workflow management
- Include party type-specific business rules

### 2. Business Logic Implementation
- KYC status transition validation and workflow enforcement
- Party type-specific validation rules (client, provider, employee)
- Relationship management and timeline validation
- Compliance rule enforcement
- Integration preparation for account association

### 3. Exception Handling Strategy
- Custom exception classes for business rule violations
- KYC workflow exceptions
- Validation and constraint exceptions
- Dependency and relationship exceptions
- Proper error messaging and categorization

### 4. Service Methods Structure
- CRUD operations with business logic validation
- KYC status management methods
- Compliance and audit support methods
- Filtering and querying with business rules
- Bulk operations for administrative tasks

## File Paths to Read
- `backend/src/modules/legal-entity/services/legal-entity.service.ts` - Primary pattern reference
- `backend/src/modules/legal-entity/services/payment-scheme.service.ts` - Additional pattern reference
- `backend/src/modules/legal-entity/repositories/legal-entity.repository.ts` - Repository interface patterns

## Relevant Code Snippets

### Service Class Structure
```typescript
@Injectable()
export class ExternalPartyService {
  constructor(private readonly externalPartyRepository: ExternalPartyRepository) {}

  // Core business operations
  async createParty(createDto: CreateExternalPartyDto): Promise<ExternalParty>;
  async updateParty(partyId: string, updateDto: UpdateExternalPartyDto): Promise<ExternalParty>;
  async deleteParty(partyId: string): Promise<void>;
  async findById(partyId: string): Promise<ExternalParty>;

  // KYC management operations
  async updateKycStatus(partyId: string, newStatus: KycStatus, notes?: string): Promise<ExternalParty>;
  async validateKycTransition(partyId: string, newStatus: KycStatus): Promise<boolean>;
  async flagPartyForReview(partyId: string, reason: string): Promise<void>;

  // Query and filtering operations
  async findParties(filters: ExternalPartyFilters): Promise<PaginatedResult<ExternalParty>>;
  async findPartiesByCompliance(complianceFilters: ComplianceFilters): Promise<ExternalParty[]>;

  // Validation and business rules
  private validateCreateInput(createDto: CreateExternalPartyDto): void;
  private validateKycWorkflow(party: ExternalParty, newStatus: KycStatus): void;
  private enforcePartyTypeRules(party: ExternalParty): void;
}
```

### Exception Classes
```typescript
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
```

### KYC Workflow Management
```typescript
async updateKycStatus(partyId: string, newStatus: KycStatus, notes?: string): Promise<ExternalParty> {
  const party = await this.findById(partyId);
  
  // Validate KYC transition
  if (!this.validateKycTransition(party.kycStatus, newStatus)) {
    throw new InvalidKycTransitionException(party.kycStatus, newStatus);
  }

  // Apply business rules for status change
  if (newStatus === KycStatus.BLOCKED) {
    await this.handleBlockedStatusChange(partyId);
  }

  // Update with audit trail
  const updateDto = {
    kycStatus: newStatus,
    notes: notes ? `${party.notes || ''}\n[${new Date().toISOString()}] KYC Status changed to ${newStatus}: ${notes}` : party.notes
  };

  return this.externalPartyRepository.update(partyId, updateDto);
}

private async handleBlockedStatusChange(partyId: string): Promise<void> {
  // Future: Flag associated accounts for review
  // For now, log the change for audit purposes
  // This method will be extended when account associations are implemented
}
```

## API Endpoint Details
Not applicable - this task focuses on service layer implementation.

## Database Schema Changes
None - this task implements business logic over existing schema.

## Libraries/Dependencies
- **ulid**: For generating party IDs (already available)
- **Injectable decorator**: NestJS dependency injection
- **ExternalPartyRepository**: Repository dependency
- **Validation utilities**: For input validation

## Potential Challenges and Solutions

### Challenge 1: KYC Status Workflow Complexity
**Issue**: Managing complex KYC status transitions and business rules
**Solution**: Implement state machine pattern with clear transition rules and validation logic

### Challenge 2: Party Type-Specific Business Rules
**Issue**: Different rules for client, provider, and employee parties
**Solution**: Create type-specific validation methods and rule enforcement strategies

### Challenge 3: Compliance Integration
**Issue**: Preparing for future compliance reporting and audit requirements
**Solution**: Design service methods with audit trails and compliance hooks for future extension

### Challenge 4: Concurrent KYC Updates
**Issue**: Handling concurrent KYC status updates safely
**Solution**: Implement optimistic locking and proper transaction handling

## Test Cases to Consider

### Business Logic Testing
1. **Party Creation**: Test creation with all party types and validation rules
2. **KYC Workflows**: Test all valid and invalid KYC status transitions
3. **Type-Specific Rules**: Validate business rules for each party type
4. **Compliance Validation**: Test compliance rule enforcement

### Exception Handling Testing
1. **Not Found Scenarios**: Test party not found exceptions
2. **Validation Failures**: Test input validation exception handling
3. **Business Rule Violations**: Test business logic exception scenarios
4. **Constraint Violations**: Test duplicate and constraint exception handling

### Integration Testing
1. **Repository Integration**: Test service-repository interaction
2. **Transaction Handling**: Test rollback scenarios
3. **Error Propagation**: Test error handling from repository layer
4. **Audit Trail**: Test audit and logging functionality

### Edge Case Testing
1. **Boundary Conditions**: Test edge cases for dates, names, and status changes
2. **Concurrent Operations**: Test concurrent party operations
3. **Data Integrity**: Test data consistency under various scenarios
4. **Performance**: Test service performance with large datasets

## Implementation Steps
1. Create ExternalPartyService class file
2. Define custom exception classes for business logic
3. Implement core CRUD operations with business validation
4. Add KYC status management and workflow methods
5. Create party type-specific validation and business rules
6. Implement filtering and querying methods with business logic
7. Add compliance and audit support methods
8. Create comprehensive input validation methods
9. Implement proper error handling and exception management
10. Test all service methods with comprehensive scenarios
11. Validate business rule enforcement and exception handling
12. Prepare integration points for future account association features
