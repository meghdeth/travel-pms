import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('beds', (table) => {
    // Dormitory specific fields
    table.enum('gender_restriction', ['male', 'female', 'mixed']).nullable();
    table.boolean('is_dormitory_bed').notNullable().defaultTo(false);
    table.json('amenities').nullable(); // BedAmenities interface
    table.json('pricing').nullable(); // BedPricing interface
    
    // Position in room
    table.enum('position', ['window', 'door', 'corner', 'center']).nullable();
    table.enum('floor_level', ['bottom', 'top']).nullable(); // for bunk beds
    
    // Booking restrictions
    table.integer('min_stay_nights').nullable();
    table.integer('max_stay_nights').nullable();
    table.integer('advance_booking_days').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('beds', (table) => {
    table.dropColumn('gender_restriction');
    table.dropColumn('is_dormitory_bed');
    table.dropColumn('amenities');
    table.dropColumn('pricing');
    table.dropColumn('position');
    table.dropColumn('floor_level');
    table.dropColumn('min_stay_nights');
    table.dropColumn('max_stay_nights');
    table.dropColumn('advance_booking_days');
  });
}