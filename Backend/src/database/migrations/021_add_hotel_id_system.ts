import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if hotel_id column exists in hotels table
  const hotelHasHotelId = await knex.schema.hasColumn('hotels', 'hotel_id');
  
  // Add hotel_id to hotels table if it doesn't exist
  if (!hotelHasHotelId) {
    await knex.schema.alterTable('hotels', (table) => {
      table.string('hotel_id', 30).nullable().unique().after('id');
    });
  }

  // Check if admins table exists first
  const adminsTableExists = await knex.schema.hasTable('admins');
  
  if (adminsTableExists) {
    // Check if columns exist in admins table
    const adminHasHotelId = await knex.schema.hasColumn('admins', 'hotel_id');
    const adminHasHotelUserId = await knex.schema.hasColumn('admins', 'hotel_user_id');
    
    // Add hotel_user_id to admins table if it doesn't exist
    if (!adminHasHotelUserId) {
      await knex.schema.alterTable('admins', (table) => {
        table.string('hotel_user_id', 50).nullable().unique().after('hotel_id');
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // Check if tables exist before checking columns
  const adminsTableExists = await knex.schema.hasTable('admins');
  const hotelsTableExists = await knex.schema.hasTable('hotels');
  
  if (adminsTableExists) {
    const adminHasHotelUserId = await knex.schema.hasColumn('admins', 'hotel_user_id');
    if (adminHasHotelUserId) {
      await knex.schema.alterTable('admins', (table) => {
        table.dropColumn('hotel_user_id');
      });
    }
  }

  if (hotelsTableExists) {
    const hotelHasHotelId = await knex.schema.hasColumn('hotels', 'hotel_id');
    if (hotelHasHotelId) {
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
      
      await knex.schema.alterTable('hotels', (table) => {
        table.dropColumn('hotel_id');
      });
    }
  }
}