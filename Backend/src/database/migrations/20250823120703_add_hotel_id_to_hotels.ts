import { Knex } from "knex";
import { UniqueIdGenerator } from '../../utils/uniqueIdGenerator';

export async function up(knex: Knex): Promise<void> {
  // Check if hotel_id column already exists
  const hasHotelId = await knex.schema.hasColumn('hotels', 'hotel_id');
  
  if (!hasHotelId) {
    // Add hotel_id column to hotels table
    await knex.schema.alterTable('hotels', (table) => {
      table.string('hotel_id', 255).unique().after('id');
    });

    // Populate hotel_id for existing hotels
    const hotels = await knex('hotels').select('id', 'name', 'city');
    
    for (const hotel of hotels) {
      const hotelId = await UniqueIdGenerator.generateNumericHotelId();
      await knex('hotels').where('id', hotel.id).update({ hotel_id: hotelId.toString() });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // Check if hotel_id column exists before dropping
  const hasHotelId = await knex.schema.hasColumn('hotels', 'hotel_id');
  
  if (hasHotelId) {
    // First check if hotel_users table exists and has foreign key constraint
    const hotelUsersExists = await knex.schema.hasTable('hotel_users');
    if (hotelUsersExists) {
      const hasHotelIdFK = await knex.schema.hasColumn('hotel_users', 'hotel_id');
      if (hasHotelIdFK) {
        // Drop foreign key constraint first
        await knex.schema.alterTable('hotel_users', (table) => {
          table.dropForeign(['hotel_id']);
        });
      }
    }
    
    // Now remove hotel_id column
    await knex.schema.alterTable('hotels', (table) => {
      table.dropColumn('hotel_id');
    });
  }
}

