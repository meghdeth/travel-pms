import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('beds', (table) => {
    table.increments('id').primary();
    table.integer('room_id').unsigned().notNullable();
    table.string('bed_number', 50).notNullable();
    table.enum('bed_type', ['single', 'double', 'queen', 'king', 'bunk']).notNullable();
    table.enum('status', ['available', 'occupied', 'maintenance']).defaultTo('available');
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    // Foreign key constraint
    table.foreign('room_id').references('id').inTable('rooms').onDelete('CASCADE');
    
    // Unique constraint for bed number within a room
    table.unique(['room_id', 'bed_number']);
    
    // Indexes
    table.index(['room_id']);
    table.index(['status']);
    table.index(['bed_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('beds');
}