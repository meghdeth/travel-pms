import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('hotels', (table) => {
    table.increments('id').primary();
    table.string('hotel_id', 20).notNullable().unique(); // 10-digit hotel ID starting from 1000000000
    table.integer('vendor_id').unsigned().notNullable();
    table.string('name', 255).notNullable();
    table.string('slug', 255).notNullable().unique();
    table.text('description').nullable();
    table.text('address').notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();
    table.string('country', 100).notNullable();
    table.string('postal_code', 20).nullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.string('phone', 20).nullable();
    table.string('email', 255).nullable();
    table.string('website', 500).nullable();
    table.integer('star_rating').notNullable().defaultTo(1);
    table.time('check_in_time').notNullable().defaultTo('14:00:00');
    table.time('check_out_time').notNullable().defaultTo('11:00:00');
    table.text('cancellation_policy').nullable();
    table.json('amenities').nullable();
    table.json('images').nullable();
    table.string('featured_image', 500).nullable();
    table.enum('status', ['active', 'inactive', 'pending']).defaultTo('pending');
    table.boolean('is_featured').defaultTo(false);
    table.decimal('avg_rating', 3, 2).defaultTo(0.00);
    table.integer('total_reviews').defaultTo(0);
    table.timestamps(true, true);
    
    // Foreign key constraint
    table.foreign('vendor_id').references('id').inTable('vendors').onDelete('CASCADE');
    
    // Indexes
    table.index(['vendor_id']);
    table.index(['city', 'country']);
    table.index(['status']);
    table.index(['is_featured']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('hotels');
}