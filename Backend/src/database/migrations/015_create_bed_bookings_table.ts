import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('bed_bookings', (table) => {
    table.increments('id').primary();
    table.string('booking_reference', 50).notNullable().unique();
    table.integer('user_id').unsigned().nullable();
    table.integer('hotel_id').unsigned().notNullable();
    table.integer('room_id').unsigned().notNullable();
    table.integer('bed_id').unsigned().notNullable();
    
    // Guest details as JSON
    table.json('guest_details').notNullable();
    
    // Dates
    table.date('check_in_date').notNullable();
    table.date('check_out_date').notNullable();
    table.integer('nights').notNullable();
    
    // Pricing and payment as JSON
    table.json('pricing').notNullable();
    table.json('payment').notNullable();
    
    // Status and source
    table.enum('status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']).notNullable();
    table.enum('booking_source', ['direct', 'ota', 'phone', 'walk_in', 'agent']).notNullable();
    table.text('special_requests').nullable();
    table.text('internal_notes').nullable();
    
    // Cancellation
    table.timestamp('cancelled_at').nullable();
    table.integer('cancelled_by').unsigned().nullable();
    table.text('cancellation_reason').nullable();
    table.decimal('refund_amount', 10, 2).nullable();
    
    // Check-in/out
    table.timestamp('checked_in_at').nullable();
    table.timestamp('checked_out_at').nullable();
    table.boolean('early_checkin').nullable();
    table.boolean('late_checkout').nullable();
    
    // Dormitory specific
    table.string('locker_number', 20).nullable();
    table.string('key_card_number', 50).nullable();
    table.string('emergency_contact', 100).nullable();
    table.string('emergency_phone', 20).nullable();
    
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('hotel_id').references('id').inTable('hotels').onDelete('CASCADE');
    table.foreign('room_id').references('id').inTable('rooms').onDelete('CASCADE');
    table.foreign('bed_id').references('id').inTable('beds').onDelete('CASCADE');
    
    // Indexes
    table.index(['hotel_id', 'check_in_date', 'check_out_date']);
    table.index(['bed_id', 'status']);
    table.index('booking_reference');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('bed_bookings');
}