
import type { Knex } from 'knex';

exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('legal_entities', (table) => {
    // Primary key - ULID string
    table.string('entity_id').primary();
    
    // Basic entity information
    table.string('name').notNullable();
    table.string('country', 2).notNullable(); // 2-char ISO code
    table.string('entity_type').notNullable();
    table.string('timezone').notNullable();
    table.string('regulatory_scope').nullable();
    
    // Self-referencing foreign key for parent-child hierarchy
    table.string('parent_entity_id').nullable();
    table.foreign('parent_entity_id').references('entity_id').inTable('legal_entities');
    
    // Capability flags
    table.boolean('can_host_accounts').nullable();
    table.boolean('can_host_wallets').nullable();
    table.boolean('can_host_fx_nodes').nullable();
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraints
    // Unique constraint on name and country combination
    table.unique(['name', 'country']);
    
    // Check constraint for valid entity types
    table.check('entity_type IN (?, ?, ?, ?, ?, ?)', [
      'bank',
      'exchanger', 
      'payment_provider',
      'custodian',
      'fx_provider',
      'branch'
    ]);
    
    // Check constraint: branch entities must have a parent
    table.check(`
      (entity_type != 'branch' OR parent_entity_id IS NOT NULL)
    `);
    
    // Indexes for performance
    table.index('parent_entity_id');
    table.index('entity_type');
    table.index('country');
    table.index(['entity_type', 'country']);
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  await knex.schema.dropTable('legal_entities');
};
