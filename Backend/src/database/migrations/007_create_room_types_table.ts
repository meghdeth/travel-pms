import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('room_types', (table) => {
    table.increments('id').primary();
    table.integer('hotel_id').unsigned().notNullable();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.integer('max_occupancy').notNullable();
    table.decimal('base_price', 10, 2).notNullable();
    table.json('amenities').nullable();
    table.json('images').nullable();
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    
    // Foreign key constraint
    table.foreign('hotel_id').references('id').inTable('hotels').onDelete('CASCADE');
    
    // Indexes
    table.index(['hotel_id']);
    table.index(['status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('room_types');
}