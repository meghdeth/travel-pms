import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Remove unused columns from hotel_users table
  await knex.schema.alterTable('hotel_users', (table) => {
    // Drop foreign key constraint first
    table.dropForeign(['created_by']);
    
    // Drop the columns
    table.dropColumn('created_by');
    table.dropColumn('avatar');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Add back the columns if rollback is needed
  await knex.schema.alterTable('hotel_users', (table) => {
    table.string('created_by', 50).nullable();
    table.string('avatar', 500).nullable();
    
    // Re-add foreign key constraint
    table.foreign('created_by').references('hotel_user_id').inTable('hotel_users').onDelete('SET NULL');
  });
}