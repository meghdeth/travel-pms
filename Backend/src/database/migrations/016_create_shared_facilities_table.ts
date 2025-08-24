import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('shared_facilities', (table) => {
    table.increments('id').primary();
    table.integer('hotel_id').unsigned().notNullable();
    table.integer('room_id').unsigned().nullable(); // null means hotel-wide facility
    
    table.enum('facility_type', [
      'bathroom', 'kitchen', 'lounge', 'laundry', 'balcony', 'terrace', 
      'gym', 'study_room', 'game_room', 'tv_room', 'dining_area', 'storage', 'other'
    ]).notNullable();
    
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.string('location', 100).notNullable();
    table.integer('capacity').unsigned().nullable();
    table.enum('gender_restriction', ['male', 'female', 'mixed']).nullable();
    
    // Amenities as JSON array
    table.json('amenities').notNullable();
    
    // Availability
    table.boolean('is_available').notNullable().defaultTo(true);
    table.json('schedule').nullable(); // Array of FacilitySchedule
    table.boolean('requires_booking').nullable();
    table.integer('max_booking_duration').nullable(); // in minutes
    
    // Maintenance as JSON
    table.json('maintenance').notNullable();
    
    // Rules and policies
    table.json('rules').nullable(); // Array of strings
    table.decimal('cleaning_fee', 8, 2).nullable();
    table.decimal('deposit_required', 8, 2).nullable();
    
    // Status
    table.enum('status', ['active', 'maintenance', 'out_of_order', 'temporarily_closed']).notNullable().defaultTo('active');
    table.text('notes').nullable();
    
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('hotel_id').references('id').inTable('hotels').onDelete('CASCADE');
    table.foreign('room_id').references('id').inTable('rooms').onDelete('CASCADE');
    
    // Indexes
    table.index(['hotel_id', 'facility_type']);
    table.index(['hotel_id', 'status']);
    table.index(['room_id', 'facility_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('shared_facilities');
}