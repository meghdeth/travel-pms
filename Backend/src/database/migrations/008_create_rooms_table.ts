import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('rooms', (table) => {
    table.increments('id').primary();
    table.integer('hotel_id').unsigned().notNullable();
    table.integer('room_type_id').unsigned().notNullable();
    table.string('room_number', 50).notNullable();
    table.integer('floor_number').nullable();
    table.enum('status', ['available', 'occupied', 'maintenance', 'out_of_order']).defaultTo('available');
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('hotel_id').references('id').inTable('hotels').onDelete('CASCADE');
    table.foreign('room_type_id').references('id').inTable('room_types').onDelete('CASCADE');
    
    // Unique constraint for room number within a hotel
    table.unique(['hotel_id', 'room_number']);
    
    // Indexes
    table.index(['hotel_id']);
    table.index(['room_type_id']);
    table.index(['status']);
    table.index(['floor_number']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('rooms');
}