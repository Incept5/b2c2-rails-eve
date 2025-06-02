---
type: "task"
task_id: "TASK_01_CreateExternalPartiesTable"
story_id: "STORY_03_ExternalPartiesDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "todo"
---

# Task 1: Create External Parties Database Table

## Task Title
Create External Parties Migration and Database Schema

## Detailed Description
Create the database migration for the external_parties table to support comprehensive external party management with KYC status tracking, party type categorization, and relationship management. This foundation table will enable proper categorization and compliance tracking for all external parties (clients, providers, employees) in the payment network.

## Technical Approach / Implementation Plan

### 1. Database Schema Design
- Create migration file with timestamp `20250206140000_create_external_parties_table.ts`
- Define external_parties table with comprehensive columns for party management
- Include proper indexes for query performance
- Add check constraints for data integrity
- Support PostgreSQL with proper column types and constraints

### 2. Column Specifications
- **external_id**: Primary key using ULID for secure identification
- **name**: Party name with proper validation and international character support
- **type**: Enum constraint for 'client', 'provider', 'employee'
- **jurisdiction**: ISO 3166-1 alpha-2 country codes
- **kyc_status**: Enum constraint for 'verified', 'pending', 'blocked'
- **relationship_start**: Timestamp for relationship beginning
- **notes**: Text field for compliance and operational notes
- **created_at/updated_at**: Standard audit timestamps

### 3. Database Indexes
- Primary index on external_id
- Composite index on (type, kyc_status) for common filtering
- Index on jurisdiction for country-based queries
- Index on relationship_start for temporal queries

### 4. Constraints and Validation
- Check constraints on enum values
- NOT NULL constraints on required fields
- Length constraints on text fields
- Date validation for relationship_start (not future)

## File Paths to Read
- `backend/src/migrations/20250206120000_create_legal_entities_table.ts` - Reference for migration patterns
- `backend/src/migrations/20250206130000_create_payment_schemes_table.ts` - Reference for enum handling
- `backend/src/config/database.config.ts` - Database configuration patterns

## Relevant Code Snippets

### Migration Structure Template
```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('external_parties', table => {
    // Primary key and basic fields
    table.string('external_id', 26).primary().comment('ULID identifier');
    table.string('name', 255).notNullable().comment('Party name');
    
    // Enum fields with constraints
    table.enu('type', ['client', 'provider', 'employee']).notNullable();
    table.enu('kyc_status', ['verified', 'pending', 'blocked']).notNullable();
    
    // Additional fields
    table.string('jurisdiction', 2).notNullable().comment('ISO country code');
    table.timestamp('relationship_start').notNullable();
    table.text('notes').nullable();
    
    // Audit timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    
    // Indexes for performance
    table.index(['type', 'kyc_status'], 'idx_external_parties_type_kyc');
    table.index('jurisdiction', 'idx_external_parties_jurisdiction');
    table.index('relationship_start', 'idx_external_parties_relationship_start');
  });
}
```

## API Endpoint Details
Not applicable - this task focuses on database schema creation.

## Database Schema Changes
**New Table**: external_parties
- Columns: external_id (PK), name, type, jurisdiction, kyc_status, relationship_start, notes, created_at, updated_at
- Indexes: Primary key, composite (type, kyc_status), jurisdiction, relationship_start
- Constraints: Enum constraints, NOT NULL constraints, check constraints

## Libraries/Dependencies
- **knex**: Database migration framework (already configured)
- **pg**: PostgreSQL driver (already installed)

## Potential Challenges and Solutions

### Challenge 1: Enum Type Consistency
**Issue**: Ensuring enum values match across migration and entity definitions
**Solution**: Use consistent enum values and add validation in entity layer

### Challenge 2: International Name Support
**Issue**: Supporting international characters in party names
**Solution**: Use VARCHAR with UTF-8 encoding, validate length appropriately

### Challenge 3: KYC Status Workflow Integrity
**Issue**: Ensuring valid KYC status transitions
**Solution**: Implement business logic constraints in service layer, database supports all valid states

### Challenge 4: Index Strategy
**Issue**: Balancing query performance with write performance
**Solution**: Create composite indexes for common query patterns, single indexes for individual lookups

## Test Cases to Consider

### Migration Testing
1. **Successful Migration**: Verify table creation with all columns and constraints
2. **Index Creation**: Confirm all indexes are created correctly
3. **Enum Constraints**: Validate enum values are properly constrained
4. **Rollback Testing**: Ensure migration can be rolled back cleanly

### Data Integrity Testing
1. **Required Fields**: Verify NOT NULL constraints work
2. **Enum Validation**: Test enum constraint enforcement
3. **Date Constraints**: Validate relationship_start constraints
4. **Character Encoding**: Test international character support in names

### Performance Testing
1. **Index Usage**: Verify indexes are used in common query patterns
2. **Insert Performance**: Test insertion performance with indexes
3. **Query Performance**: Validate filtering performance on indexed columns

## Implementation Steps
1. Create migration file with proper timestamp naming
2. Define table schema with all required columns
3. Add appropriate indexes for query optimization
4. Include proper constraints and validations
5. Test migration up and down operations
6. Verify table structure in database
7. Validate enum constraints and data types
8. Test index performance with sample queries
