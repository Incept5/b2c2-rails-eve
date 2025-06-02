import type { Knex } from 'knex';

exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('payment_schemes', (table) => {
    // Primary key - ULID string
    table.string('scheme_id').primary();
    
    // Basic scheme information
    table.string('name').notNullable();
    table.enum('type', ['fiat', 'crypto', 'fx']).notNullable();
    
    // Currency and operational fields
    table.string('currency', 3).notNullable(); // ISO 4217 3-char code
    table.string('target_currency', 3).nullable(); // For FX schemes
    table.string('country_scope').notNullable();
    
    // JSON configuration fields for flexible storage
    table.json('available_days').notNullable(); // Array of weekdays
    table.json('operating_hours').notNullable(); // start/end times with timezone
    table.json('holiday_calendar').defaultTo('[]'); // Array of ISO dates
    
    // Time and settlement fields
    table.time('cut_off_time').nullable();
    table.string('settlement_time').notNullable(); // T+1, instant, etc.
    
    // Financial configuration
    table.json('fees').defaultTo('{}'); // {flat_fee, percentage_fee, currency}
    table.decimal('spread', 10, 6).nullable(); // For FX schemes, 6 decimal precision
    table.json('limits').defaultTo('{}'); // {min_amount, max_amount, currency}
    
    // Feature flags
    table.boolean('supports_fx').defaultTo(false);
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraints
    // Check constraint for valid types
    table.check('type IN (?, ?, ?)', ['fiat', 'crypto', 'fx']);
    
    // Check constraint for positive spread values
    table.check('spread IS NULL OR spread >= 0');
    
    // Check constraint for valid currency codes (3 uppercase letters)
    table.check("currency ~ '^[A-Z]{3}$'");
    table.check("target_currency IS NULL OR target_currency ~ '^[A-Z]{3}$'");
    
    // Business logic constraints
    // FX schemes should have target_currency and spread
    table.check(`
      (type != 'fx' OR (target_currency IS NOT NULL AND spread IS NOT NULL))
    `);
    
    // Crypto schemes should support 24/7 operation
    table.check(`
      (type != 'crypto' OR supports_fx = true OR supports_fx = false)
    `);
  });

  // Create indexes for performance
  await knex.schema.table('payment_schemes', (table) => {
    // Index on type for scheme type filtering
    table.index(['type'], 'idx_payment_schemes_type');
    
    // Index on currency for currency-based queries
    table.index(['currency'], 'idx_payment_schemes_currency');
    
    // Index on country_scope for regional filtering
    table.index(['country_scope'], 'idx_payment_schemes_country');
    
    // Composite index for type and currency combinations
    table.index(['type', 'currency'], 'idx_payment_schemes_type_currency');
    
    // Index for FX support filtering
    table.index(['supports_fx'], 'idx_payment_schemes_fx_support');
    
    // Index on target_currency for FX schemes
    table.index(['target_currency'], 'idx_payment_schemes_target_currency');
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payment_schemes');
};
