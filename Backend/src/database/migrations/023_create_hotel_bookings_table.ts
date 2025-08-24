import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('hotel_bookings', (table) => {
    table.increments('id').primary();
    table.string('booking_reference', 50).notNullable().unique();
    table.integer('user_id').unsigned().nullable();
    table.integer('hotel_id').unsigned().notNullable();
    table.integer('room_id').unsigned().notNullable();
    table.integer('room_type_id').unsigned().notNullable();
    
    // Guest details as JSON (similar to QloApps)
    table.json('guest_details').notNullable();
    table.integer('adults').notNullable().defaultTo(1);
    table.integer('children').notNullable().defaultTo(0);
    
    // Booking dates
    table.date('check_in_date').notNullable();
    table.date('check_out_date').notNullable();
    table.integer('nights').notNullable();
    
    // Pricing structure (inspired by QloApps)
    table.decimal('room_rate', 10, 2).notNullable();
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('service_charge', 10, 2).defaultTo(0);
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    
    // Payment information
    table.enum('payment_status', ['pending', 'partial', 'paid', 'refunded', 'failed']).defaultTo('pending');
    table.enum('payment_method', ['cash', 'card', 'bank_transfer', 'online', 'wallet']).nullable();
    table.decimal('paid_amount', 10, 2).defaultTo(0);
    table.decimal('due_amount', 10, 2).defaultTo(0);
    
    // Booking status and source
    table.enum('status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']).notNullable();
    table.enum('booking_source', ['direct', 'ota', 'phone', 'walk_in', 'agent', 'website']).notNullable();
    table.text('special_requests').nullable();
    table.text('internal_notes').nullable();
    
    // Cancellation details
    table.timestamp('cancelled_at').nullable();
    table.string('cancelled_by', 50).nullable();
    table.text('cancellation_reason').nullable();
    table.decimal('refund_amount', 10, 2).nullable();
    
    // Check-in/out details
    table.timestamp('checked_in_at').nullable();
    table.timestamp('checked_out_at').nullable();
    table.string('checked_in_by', 50).nullable();
    table.string('checked_out_by', 50).nullable();
    table.boolean('early_checkin').defaultTo(false);
    table.boolean('late_checkout').defaultTo(false);
    
    // Additional QloApps-inspired fields
    table.string('booking_type', 20).defaultTo('room'); // room, package, etc.
    table.json('room_demands').nullable(); // Special room requirements
    table.string('arrival_time', 10).nullable();
    table.string('departure_time', 10).nullable();
    
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('hotel_id').references('id').inTable('hotels').onDelete('CASCADE');
    table.foreign('room_id').references('id').inTable('rooms').onDelete('CASCADE');
    table.foreign('room_type_id').references('id').inTable('room_types').onDelete('CASCADE');
    table.foreign('cancelled_by').references('hotel_user_id').inTable('hotel_users').onDelete('SET NULL');
    table.foreign('checked_in_by').references('hotel_user_id').inTable('hotel_users').onDelete('SET NULL');
    table.foreign('checked_out_by').references('hotel_user_id').inTable('hotel_users').onDelete('SET NULL');
    
    // Indexes
    table.index(['hotel_id', 'check_in_date', 'check_out_date']);
    table.index(['room_id', 'status']);
    table.index('booking_reference');
    table.index(['status', 'hotel_id']);
    table.index(['payment_status', 'hotel_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('hotel_bookings');
}