import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('example_table', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Insert initial row
  await knex('example_table').insert({
    name: 'Example Row',
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('example_table');
}