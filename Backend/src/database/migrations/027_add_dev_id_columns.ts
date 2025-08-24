import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add dev_hotel_id column to hotels table
  const hotelHasDevId = await knex.schema.hasColumn('hotels', 'dev_hotel_id');
  if (!hotelHasDevId) {
    await knex.schema.alterTable('hotels', (table) => {
      table.string('dev_hotel_id', 50).nullable().unique().after('hotel_id');
    });
  }

  // Add dev_hotel_user_id and dev_hotel_id columns to hotel_users table
  const hotelUserHasDevUserId = await knex.schema.hasColumn('hotel_users', 'dev_hotel_user_id');
  const hotelUserHasDevHotelId = await knex.schema.hasColumn('hotel_users', 'dev_hotel_id');
  
  if (!hotelUserHasDevUserId) {
    await knex.schema.alterTable('hotel_users', (table) => {
      table.string('dev_hotel_user_id', 50).nullable().unique().after('hotel_user_id');
    });
  }
  
  if (!hotelUserHasDevHotelId) {
    await knex.schema.alterTable('hotel_users', (table) => {
      table.string('dev_hotel_id', 50).nullable().after('dev_hotel_user_id');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove dev columns
  const hotelHasDevId = await knex.schema.hasColumn('hotels', 'dev_hotel_id');
  if (hotelHasDevId) {
    await knex.schema.alterTable('hotels', (table) => {
      table.dropColumn('dev_hotel_id');
    });
  }

  const hotelUserHasDevUserId = await knex.schema.hasColumn('hotel_users', 'dev_hotel_user_id');
  const hotelUserHasDevHotelId = await knex.schema.hasColumn('hotel_users', 'dev_hotel_id');
  
  if (hotelUserHasDevUserId) {
    await knex.schema.alterTable('hotel_users', (table) => {
      table.dropColumn('dev_hotel_user_id');
    });
  }
  
  if (hotelUserHasDevHotelId) {
    await knex.schema.alterTable('hotel_users', (table) => {
      table.dropColumn('dev_hotel_id');
    });
  }
}