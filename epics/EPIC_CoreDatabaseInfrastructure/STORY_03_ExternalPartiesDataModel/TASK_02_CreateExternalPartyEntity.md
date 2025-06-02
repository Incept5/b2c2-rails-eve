---
type: "task"
task_id: "TASK_02_CreateExternalPartyEntity"
story_id: "STORY_03_ExternalPartiesDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "completed"
---

# Task 2: Create External Party Entity

## Task Title
Implement External Party Entity Class with Business Logic

## Detailed Description
Create the ExternalParty entity class following the established patterns from LegalEntity. This entity will encapsulate external party data with proper validation, business rules, and type safety. Include enums for party types and KYC status, validation methods, and business logic for KYC status transitions and party type constraints.

## Technical Approach / Implementation Plan

### 1. Entity Structure Design
- Create ExternalParty class in `backend/src/modules/legal-entity/entities/`
- Define ExternalPartyType and KycStatus enums
- Implement comprehensive validation methods
- Add business logic for KYC status transitions
- Include static helper methods for default values and validation

### 2. Enum Definitions
- **ExternalPartyType**: 'client', 'provider', 'employee'
- **KycStatus**: 'verified', 'pending', 'blocked'
- Ensure consistency with database constraints

### 3. Business Logic Implementation
- KYC status transition validation
- Party type-specific business rules
- Relationship start date validation
- Jurisdiction code validation

### 4. Validation Methods
- Comprehensive entity validation
- Field-level validation methods
- Business rule enforcement
- Data integrity checks

## File Paths to Read
- `backend/src/modules/legal-entity/entities/legal-entity.entity.ts` - Pattern reference for entity structure
- `backend/src/modules/legal-entity/entities/payment-scheme.entity.ts` - Additional pattern reference

## Relevant Code Snippets

### Entity Class Structure
```typescript
export enum ExternalPartyType {
  CLIENT = 'client',
  PROVIDER = 'provider',
  EMPLOYEE = 'employee'
}

export enum KycStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  BLOCKED = 'blocked'
}

export class ExternalParty {
  id: string;
  name: string;
  type: ExternalPartyType;
  jurisdiction: string;
  kycStatus: KycStatus;
  relationshipStart: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Business logic methods
  static getDefaultKycStatus(type: ExternalPartyType): KycStatus;
  static validateKycTransition(from: KycStatus, to: KycStatus): boolean;
  validate(): boolean;
  canTransitionKycTo(newStatus: KycStatus): boolean;
}
```

## API Endpoint Details
Not applicable - this task focuses on entity class creation.

## Database Schema Changes
None - this task creates the entity class to work with existing schema.

## Libraries/Dependencies
No additional dependencies required - uses existing validation and enum patterns.

## Potential Challenges and Solutions

### Challenge 1: KYC Status Transition Logic
**Issue**: Defining valid KYC status transitions
**Solution**: Implement state machine logic with clear transition rules (pending->verified/blocked, blocked can only be set manually)

### Challenge 2: Type-Specific Business Rules
**Issue**: Different party types have different requirements
**Solution**: Implement type-specific validation methods and default behaviors

### Challenge 3: Date Validation Complexity
**Issue**: Relationship start date validation with timezone considerations
**Solution**: Use UTC dates and validate against current date, not future dates allowed

### Challenge 4: International Name Validation
**Issue**: Supporting various character sets and name formats
**Solution**: Implement flexible name validation that supports international characters while preventing malicious input

## Test Cases to Consider

### Entity Validation Testing
1. **Required Fields**: Verify all required fields are validated
2. **Enum Validation**: Test enum value constraints
3. **Date Validation**: Validate relationship start date rules
4. **Name Validation**: Test international character support and length limits

### Business Logic Testing
1. **KYC Transitions**: Test valid and invalid KYC status transitions
2. **Type-Specific Rules**: Validate business rules for each party type
3. **Default Values**: Test default value assignment logic
4. **Edge Cases**: Test boundary conditions and error scenarios

### Integration Testing
1. **Database Mapping**: Verify entity maps correctly to database schema
2. **Enum Consistency**: Ensure enum values match database constraints
3. **Validation Flow**: Test end-to-end validation process

## Implementation Steps
1. Create ExternalParty entity class file
2. Define ExternalPartyType and KycStatus enums
3. Implement entity properties with proper typing
4. Add validation methods and business logic
5. Create static helper methods for defaults and validation
6. Implement KYC status transition logic
7. Add comprehensive error handling and validation messages
8. Test entity validation and business logic
9. Verify consistency with database schema
