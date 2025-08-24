import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('hotel_transactions', (table) => {
    table.increments('id').primary();
    table.string('transaction_id', 50).notNullable().unique();
    table.integer('hotel_id').unsigned().notNullable();
    table.integer('booking_id').unsigned().nullable(); // Can be null for non-booking transactions
    table.integer('bed_booking_id').unsigned().nullable();
    table.integer('user_id').unsigned().nullable();
    
    // Transaction details
    table.enum('transaction_type', [
      'booking_payment', 'refund', 'advance_payment', 'security_deposit',
      'room_service', 'laundry', 'restaurant', 'spa', 'extra_charges',
      'cancellation_fee', 'no_show_fee', 'damage_charge', 'other'
    ]).notNullable();
    
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.enum('transaction_status', ['pending', 'completed', 'failed', 'cancelled', 'refunded']).notNullable();
    
    // Payment details
    table.enum('payment_method', [
      'cash', 'credit_card', 'debit_card', 'bank_transfer', 
      'online_payment', 'wallet', 'cheque', 'other'
    ]).notNullable();
    
    table.string('payment_gateway', 50).nullable(); // PayPal, Stripe, etc.
    table.string('gateway_transaction_id', 100).nullable();
    table.json('gateway_response').nullable();
    
    // Financial details
    table.decimal('gateway_fee', 10, 2).defaultTo(0);
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('net_amount', 10, 2).notNullable();
    
    // Transaction metadata
    table.text('description').nullable();
    table.text('notes').nullable();
    table.string('receipt_number', 50).nullable();
    table.json('additional_data').nullable();
    
    // Staff and audit trail
    table.string('processed_by', 50).nullable(); // hotel_user_id
    table.timestamp('processed_at').nullable();
    table.string('approved_by', 50).nullable(); // For refunds/adjustments
    table.timestamp('approved_at').nullable();
    
    // Refund tracking
    table.integer('refund_of_transaction_id').unsigned().nullable();
    table.decimal('refunded_amount', 10, 2).defaultTo(0);
    table.boolean('is_refundable').defaultTo(true);
    
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('hotel_id').references('id').inTable('hotels').onDelete('CASCADE');
    table.foreign('booking_id').references('id').inTable('hotel_bookings').onDelete('CASCADE');
    table.foreign('bed_booking_id').references('id').inTable('bed_bookings').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('processed_by').references('hotel_user_id').inTable('hotel_users').onDelete('SET NULL');
    table.foreign('approved_by').references('hotel_user_id').inTable('hotel_users').onDelete('SET NULL');
    table.foreign('refund_of_transaction_id').references('id').inTable('hotel_transactions').onDelete('SET NULL');
    
    // Indexes
    table.index(['hotel_id', 'transaction_type']);
    table.index(['booking_id', 'transaction_status']);
    table.index(['transaction_status', 'hotel_id']);
    table.index(['payment_method', 'hotel_id']);
    table.index('transaction_id');
    table.index(['created_at', 'hotel_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('hotel_transactions');
}