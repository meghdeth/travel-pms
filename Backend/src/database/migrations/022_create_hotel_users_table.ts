import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('hotel_users', (table) => {
    table.increments('id').primary();
    table.string('hotel_user_id', 20).notNullable().unique(); // Format: role(2)+type(1)+hotel_id(10)+sequence(5)
    table.string('hotel_id', 20).notNullable(); // 10-digit hotel ID
    table.string('email', 255).notNullable();
    table.string('password', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20).nullable();
    table.enum('role', [
      'Hotel Admin', 'Manager', 'Finance Department', 'Front Desk',
      'Booking Agent', 'Gatekeeper', 'Support', 'Tech Support',
      'Service Boy', 'Maintenance', 'Kitchen'
    ]).notNullable();
    table.text('permissions').notNullable(); // JSON string
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamp('last_login').nullable();
    table.string('created_by', 50).nullable(); // References hotel_user_id
    table.string('avatar', 500).nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('hotel_id');
    table.index('email');
    table.index('role');
    table.index('status');
    table.unique(['hotel_id', 'email']); // One email per hotel
    
    // Foreign key constraints
    table.foreign('hotel_id').references('hotel_id').inTable('hotels').onDelete('CASCADE');
    table.foreign('created_by').references('hotel_user_id').inTable('hotel_users').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('hotel_users');
}