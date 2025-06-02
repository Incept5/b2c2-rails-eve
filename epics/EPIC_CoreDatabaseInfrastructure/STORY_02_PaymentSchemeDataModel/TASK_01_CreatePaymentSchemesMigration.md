
---
type: "task"
task_id: "TASK_01_CreatePaymentSchemesMigration"
story_id: "STORY_02_PaymentSchemeDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "completed"
---

# Task 1: Create Payment Schemes Database Migration

## Task Title
Create database migration for payment_schemes table with comprehensive schema

## Detailed Description
Implement the database migration to create the payment_schemes table with all required fields, constraints, and indexes. The migration must support the flexible configuration requirements while maintaining data integrity and performance.

## Technical Approach / Implementation Plan

1. **Create Migration File**:
   - Create timestamped migration file: `20250206130000_create_payment_schemes_table.ts`
   - Follow existing migration patterns in the codebase

2. **Schema Implementation**:
   - Implement table with all columns as specified in story architecture
   - Add proper data types, constraints, and default values
   - Include JSON fields for flexible configuration storage

3. **Constraints and Validation**:
   - Add CHECK constraints for enum values (type: fiat|crypto|fx)
   - Add CHECK constraints for positive fee amounts
   - Add NOT NULL constraints for required fields
   - Add unique constraints where appropriate

4. **Indexes**:
   - Primary key index on scheme_id (ULID)
   - Index on type for scheme type filtering
   - Index on currency for currency-based queries
   - Index on country_scope for regional filtering
   - Partial index for active schemes (if status field added)
   - GIN indexes on JSON fields for efficient querying

5. **Rollback**:
   - Implement proper down migration to drop table and indexes

## File Paths to Read
- `backend/src/migrations/20250206120000_create_legal_entities_table.ts` - Reference for migration patterns
- `backend/src/config/database.config.ts` - Database configuration understanding
- `backend/src/modules/database/database.service.ts` - Database service patterns

## Relevant Code Snippets

### Migration Structure
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payment_schemes', (table) => {
    // Primary key and basic fields
    table.string('scheme_id').primary().notNullable();
    table.string('name').notNullable();
    table.enum('type', ['fiat', 'crypto', 'fx']).notNullable();
    
    // Currency and operational fields
    table.string('currency', 3).notNullable(); // ISO 4217 3-char code
    table.string('target_currency', 3).nullable(); // For FX schemes
    table.string('country_scope').notNullable();
    
    // JSON configuration fields
    table.json('available_days').notNullable(); // Array of weekdays
    table.json('operating_hours').notNullable(); // start/end times
    table.json('holiday_calendar').defaultTo('[]'); // Array of ISO dates
    
    // Time and settlement fields
    table.time('cut_off_time').nullable();
    table.string('settlement_time').notNullable(); // T+1, instant, etc.
    
    // Financial configuration
    table.json('fees').defaultTo('{}'); // {flat_fee, percentage_fee}
    table.decimal('spread', 10, 6).nullable(); // For FX schemes
    table.json('limits').defaultTo('{}'); // {min_amount, max_amount}
    
    // Feature flags
    table.boolean('supports_fx').defaultTo(false);
    
    // Timestamps
    table.timestamps(true, true);
    
    // Constraints
    table.check('?? IN (?)', ['type', ['fiat', 'crypto', 'fx']]);
    table.check('spread >= 0');
  });

  // Create indexes
  await knex.schema.table('payment_schemes', (table) => {
    table.index(['type'], 'idx_payment_schemes_type');
    table.index(['currency'], 'idx_payment_schemes_currency');
    table.index(['country_scope'], 'idx_payment_schemes_country');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payment_schemes');
}
```

## API Endpoint Details
N/A - This is a database migration task.

## Database Schema Changes

### New Table: payment_schemes
- **scheme_id**: Primary key (ULID string)
- **name**: Payment scheme name (string, NOT NULL)
- **type**: Scheme type enum (fiat|crypto|fx, NOT NULL)
- **currency**: ISO 4217 currency code (string(3), NOT NULL)
- **target_currency**: Target currency for FX schemes (string(3), nullable)
- **country_scope**: Operating country/region (string, NOT NULL)
- **available_days**: JSON array of operating weekdays
- **operating_hours**: JSON object with start/end times
- **holiday_calendar**: JSON array of ISO date strings
- **cut_off_time**: Daily processing cut-off (time, nullable)
- **settlement_time**: Settlement period descriptor (string, NOT NULL)
- **fees**: JSON object for fee configuration
- **spread**: FX spread value (decimal(10,6), nullable)
- **limits**: JSON object for amount limits
- **supports_fx**: FX support flag (boolean, default false)
- **created_at**: Creation timestamp
- **updated_at**: Last update timestamp

### Indexes
- Primary key on scheme_id
- Index on type for filtering by scheme type
- Index on currency for currency-based queries
- Index on country_scope for regional filtering
- Future: GIN indexes on JSON fields for complex queries

## Libraries/Dependencies
- Knex.js (already available)
- PostgreSQL (database engine)

## Potential Challenges and Solutions

1. **JSON Field Compatibility**:
   - Challenge: JSON field support varies between SQLite (dev) and PostgreSQL (prod)
   - Solution: Use Knex JSON field type which handles compatibility

2. **Enum Constraints**:
   - Challenge: CHECK constraints may differ between databases
   - Solution: Use Knex enum type and additional validation in application layer

3. **ULID Primary Key**:
   - Challenge: Ensure ULID generation is consistent
   - Solution: Generate ULIDs in application layer before insertion

4. **Index Performance**:
   - Challenge: JSON field indexing performance
   - Solution: Start with basic indexes, add GIN indexes based on query patterns

## Test Cases to Consider

1. **Migration Execution**:
   - Migration runs successfully on clean database
   - Migration creates all expected columns and constraints
   - Indexes are created properly

2. **Data Type Validation**:
   - JSON fields accept valid JSON data
   - Enum constraints reject invalid values
   - Decimal fields handle precision correctly

3. **Constraint Testing**:
   - NOT NULL constraints prevent empty required fields
   - CHECK constraints validate enum values
   - Positive value constraints work on spread field

4. **Rollback Testing**:
   - Down migration removes table completely
   - No orphaned indexes or constraints remain

5. **Cross-Database Compatibility**:
   - Migration works on both SQLite (dev) and PostgreSQL (prod)
   - JSON field behavior is consistent across databases
