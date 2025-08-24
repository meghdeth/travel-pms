import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if dev columns exist before trying to drop them
  const hasDevHotelUserId = await knex.schema.hasColumn('hotel_users', 'dev_hotel_user_id');
  const hasDevHotelId = await knex.schema.hasColumn('hotel_users', 'dev_hotel_id');
  const hasCreatedBy = await knex.schema.hasColumn('hotel_users', 'created_by');

  await knex.schema.alterTable('hotel_users', (table) => {
    // Add created_by field only if it doesn't exist
    if (!hasCreatedBy) {
      table.string('created_by', 50).nullable().comment('hotel_user_id of creator, null for system-generated admins');
    }
    
    // Remove dev ID columns only if they exist
    if (hasDevHotelUserId) {
      table.dropColumn('dev_hotel_user_id');
    }
    if (hasDevHotelId) {
      table.dropColumn('dev_hotel_id');
    }
  });
  
  // Add foreign key constraint for created_by only if the column was just added
  if (!hasCreatedBy) {
    await knex.schema.alterTable('hotel_users', (table) => {
      table.foreign('created_by').references('hotel_user_id').inTable('hotel_users').onDelete('SET NULL');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasCreatedBy = await knex.schema.hasColumn('hotel_users', 'created_by');
  
  if (hasCreatedBy) {
    // Drop foreign key constraint first
    await knex.schema.alterTable('hotel_users', (table) => {
      table.dropForeign(['created_by']);
    });
    
    // Remove created_by field and add back dev ID columns
    await knex.schema.alterTable('hotel_users', (table) => {
      table.dropColumn('created_by');
      table.string('dev_hotel_user_id', 50).nullable();
      table.string('dev_hotel_id', 50).nullable();
    });
    
    // Add back unique constraints for dev IDs
    await knex.schema.alterTable('hotel_users', (table) => {
      table.unique(['dev_hotel_user_id']);
    });
  }
}