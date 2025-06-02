import type { Knex } from 'knex';

exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('external_parties', (table) => {
    // Primary key - ULID string
    table.string('external_id', 26).primary().comment('ULID identifier');
    
    // Basic party information
    table.string('name', 255).notNullable().comment('Party name');
    table.enum('type', ['client', 'provider', 'employee']).notNullable().comment('Party type');
    table.string('jurisdiction', 2).notNullable().comment('ISO 3166-1 alpha-2 country code');
    table.enum('kyc_status', ['verified', 'pending', 'blocked']).notNullable().comment('KYC verification status');
    
    // Relationship and operational fields
    table.timestamp('relationship_start').notNullable().comment('When relationship began');
    table.text('notes').nullable().comment('Free-form notes for compliance and operations');
    
    // Audit timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    
    // Constraints
    // Check constraint for valid party types
    table.check('type IN (?, ?, ?)', ['client', 'provider', 'employee']);
    
    // Check constraint for valid KYC status values
    table.check('kyc_status IN (?, ?, ?)', ['verified', 'pending', 'blocked']);
    
    // Check constraint for valid jurisdiction codes (2 uppercase letters)
    table.check("jurisdiction ~ '^[A-Z]{2}$'");
    
    // Check constraint for relationship_start not in future
    table.check('relationship_start <= CURRENT_TIMESTAMP');
    
    // Check constraint for name length (minimum 2 characters)
    table.check('length(name) >= 2');
  });

  // Create indexes for performance
  await knex.schema.table('external_parties', (table) => {
    // Composite index for common filtering patterns (type + kyc_status)
    table.index(['type', 'kyc_status'], 'idx_external_parties_type_kyc');
    
    // Index on jurisdiction for country-based queries
    table.index(['jurisdiction'], 'idx_external_parties_jurisdiction');
    
    // Index on relationship_start for temporal queries
    table.index(['relationship_start'], 'idx_external_parties_relationship_start');
    
    // Index on type for party type filtering
    table.index(['type'], 'idx_external_parties_type');
    
    // Index on kyc_status for compliance queries
    table.index(['kyc_status'], 'idx_external_parties_kyc_status');
    
    // Index on created_at for audit and sorting
    table.index(['created_at'], 'idx_external_parties_created_at');
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('external_parties');
};
