---
type: "task"
task_id: "TASK_01_CreateLegalEntitiesMigration"
story_id: "STORY_01_LegalEntityDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "todo"
---

# Task 1: Create Legal Entities Database Migration

## Task Title
Create Knex.js migration for legal_entities table with proper schema and constraints

## Detailed Description
Create a database migration that establishes the legal_entities table with all required fields, data types, constraints, and indexes. This migration will serve as the foundation for storing legal entity data including banks, exchanges, custodians, payment providers, and FX providers.

## Technical Approach / Implementation Plan

1. **Create Migration File**: Generate new migration file with timestamp naming convention
2. **Define Table Schema**: Create table with all required columns and proper data types
3. **Add Constraints**: Implement foreign key, check, and unique constraints
4. **Create Indexes**: Add performance indexes for common query patterns
5. **Add Down Migration**: Implement proper rollback functionality

## File Paths to Read
- `backend/src/migrations/20240319000000_create_users_table.ts` - Reference existing migration pattern
- `backend/src/config/database.config.ts` - Understand database configuration

## Relevant Code Snippets
```typescript
// Migration structure based on existing pattern
exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('legal_entities', (table) => {
    // Column definitions here
  });
};
```

## API Endpoint Details
N/A - This is a database migration task

## Database Schema Changes
Create `legal_entities` table with:
- `entity_id` (string, primary key, ULID)
- `name` (string, not null)
- `country` (string, 2-char ISO code)
- `entity_type` (enum: bank|exchanger|payment_provider|custodian|fx_provider|branch)
- `timezone` (string, not null)
- `regulatory_scope` (string, optional)
- `parent_entity_id` (string, foreign key to entity_id, nullable)
- `can_host_accounts` (boolean, default based on type)
- `can_host_wallets` (boolean, default based on type)
- `can_host_fx_nodes` (boolean, default based on type)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp, default now)

**Constraints:**
- Foreign key: parent_entity_id references legal_entities(entity_id)
- Unique constraint: (name, country)
- Check constraint: entity_type in allowed values
- Check constraint: branch entities must have parent_entity_id

**Indexes:**
- Primary index on entity_id
- Index on parent_entity_id
- Index on entity_type
- Index on country
- Composite index on (entity_type, country)

## Libraries/Dependencies
- Knex.js (already configured)
- PostgreSQL compatibility

## Potential Challenges and Solutions
- **Challenge**: Enum type support across SQLite and PostgreSQL
  - **Solution**: Use string column with check constraint for compatibility
- **Challenge**: Self-referencing foreign key for parent-child relationships
  - **Solution**: Make parent_entity_id nullable and add proper constraint
- **Challenge**: Setting default capability values based on entity type
  - **Solution**: Handle in application logic rather than database defaults

## Test Cases to Consider
- Migration runs successfully on fresh database
- Migration can be rolled back cleanly
- All constraints are properly enforced
- Indexes are created and improve query performance
- Self-referencing foreign key works correctly
- Check constraints prevent invalid data
