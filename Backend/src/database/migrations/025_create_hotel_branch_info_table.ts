import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('hotel_branch_info', (table) => {
    table.increments('id').primary();
    table.integer('hotel_id').unsigned().notNullable();
    table.string('branch_name', 255).notNullable();
    table.string('branch_code', 20).notNullable();
    
    // Contact information
    table.string('email', 255).nullable();
    table.string('phone', 20).nullable();
    table.string('fax', 20).nullable();
    table.string('website', 500).nullable();
    
    // Address details
    table.text('address').notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();
    table.string('country', 100).notNullable();
    table.string('postal_code', 20).nullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.text('map_formatted_address').nullable();
    
    // Operational details
    table.time('check_in_time').notNullable().defaultTo('14:00:00');
    table.time('check_out_time').notNullable().defaultTo('11:00:00');
    table.integer('star_rating').notNullable().defaultTo(1);
    
    // Policies and descriptions
    table.text('description').nullable();
    table.text('policies').nullable();
    table.text('cancellation_policy').nullable();
    table.text('terms_conditions').nullable();
    
    // Features and amenities
    table.json('amenities').nullable();
    table.json('services').nullable();
    table.json('facilities').nullable();
    
    // Images and media
    table.json('images').nullable();
    table.string('featured_image', 500).nullable();
    table.string('logo', 500).nullable();
    
    // Business information
    table.string('license_number', 100).nullable();
    table.string('tax_id', 100).nullable();
    table.date('established_date').nullable();
    
    // Status and settings
    table.enum('status', ['active', 'inactive', 'maintenance']).defaultTo('active');
    table.boolean('is_main_branch').defaultTo(false);
    table.boolean('accepts_online_booking').defaultTo(true);
    table.boolean('requires_advance_payment').defaultTo(false);
    table.decimal('advance_payment_percentage', 5, 2).defaultTo(0);
    
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('hotel_id').references('id').inTable('hotels').onDelete('CASCADE');
    
    // Unique constraints
    table.unique(['hotel_id', 'branch_code']);
    
    // Indexes
    table.index(['hotel_id', 'status']);
    table.index(['city', 'country']);
    table.index('branch_code');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('hotel_branch_info');
}