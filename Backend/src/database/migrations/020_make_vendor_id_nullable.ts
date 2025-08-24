import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop the existing foreign key constraint first
  await knex.schema.alterTable('hotels', (table) => {
    table.dropForeign(['vendor_id']);
  });
  
  // Modify the column to be nullable in a separate step
  await knex.schema.alterTable('hotels', (table) => {
    table.integer('vendor_id').unsigned().nullable().alter();
  });
  
  // Re-add the foreign key constraint with SET NULL on delete
  await knex.schema.alterTable('hotels', (table) => {
    table.foreign('vendor_id').references('id').inTable('vendors').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop the foreign key constraint
  await knex.schema.alterTable('hotels', (table) => {
    table.dropForeign(['vendor_id']);
  });
  
  // Make the column not nullable again
  await knex.schema.alterTable('hotels', (table) => {
    table.integer('vendor_id').unsigned().notNullable().alter();
  });
  
  // Re-add the original foreign key constraint
  await knex.schema.alterTable('hotels', (table) => {
    table.foreign('vendor_id').references('id').inTable('vendors').onDelete('CASCADE');
  });
}