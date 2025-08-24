import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if tables exist before creating them
  
  // Hotel-level admins (Hotel Admins who manage a specific hotel)
  const hotelAdminsExists = await knex.schema.hasTable('hotel_admins');
  if (!hotelAdminsExists) {
    await knex.schema.createTable('hotel_admins', (table) => {
      table.increments('id').primary();
      table.string('admin_id', 20).notNullable().unique();
      table.string('hotel_id', 20).notNullable();
      table.string('email', 255).notNullable();
      table.string('password', 255).notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('phone', 20).nullable();
      table.string('role', 50).notNullable().defaultTo('Hotel Admin');
      table.text('permissions').notNullable();
      table.enum('status', ['active', 'inactive']).defaultTo('active');
      table.timestamp('last_login').nullable();
      table.string('created_by', 50).nullable();
      table.timestamps(true, true);

      table.index('hotel_id');
      table.index('email');
      table.unique(['hotel_id', 'email']);
      table.foreign('hotel_id').references('hotel_id').inTable('hotels').onDelete('CASCADE');
    });
  }

  // Vendor-level admins (for vendor service scope)
  const vendorAdminsExists = await knex.schema.hasTable('vendor_admins');
  if (!vendorAdminsExists) {
    await knex.schema.createTable('vendor_admins', (table) => {
      table.increments('id').primary();
      table.string('vendor_admin_id', 20).notNullable().unique();
      table.string('vendor_id', 20).notNullable();
      table.string('email', 255).notNullable();
      table.string('password', 255).notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('phone', 20).nullable();
      table.string('role', 50).notNullable().defaultTo('Vendor Admin');
      table.text('permissions').notNullable();
      table.enum('status', ['active', 'inactive']).defaultTo('active');
      table.timestamp('last_login').nullable();
      table.string('created_by', 50).nullable();
      table.timestamps(true, true);

      table.index('vendor_id');
      table.index('email');
      table.unique(['vendor_id', 'email']);
    });
  }

  // Super admins (system level) - skip if exists
  const superAdminsExists = await knex.schema.hasTable('super_admins');
  if (!superAdminsExists) {
    await knex.schema.createTable('super_admins', (table) => {
      table.increments('id').primary();
      table.string('super_admin_id', 20).notNullable().unique();
      table.string('email', 255).notNullable().unique();
      table.string('password', 255).notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('phone', 20).nullable();
      table.string('role', 50).notNullable().defaultTo('Super Admin');
      table.text('permissions').notNullable();
      table.enum('status', ['active', 'inactive']).defaultTo('active');
      table.timestamp('last_login').nullable();
      table.timestamps(true, true);
    });
  }

  // Staff table (hotel staff like manager, front desk, housekeeping...)
  const staffExists = await knex.schema.hasTable('staff');
  if (!staffExists) {
    await knex.schema.createTable('staff', (table) => {
      table.increments('id').primary();
      table.string('staff_id', 20).notNullable().unique();
      table.string('hotel_id', 20).notNullable();
      table.string('email', 255).notNullable();
      table.string('password', 255).notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('phone', 20).nullable();
      table.enum('role', [
        'Manager', 'Front Desk', 'Finance Department', 'Booking Agent', 'Gatekeeper',
        'Support', 'Tech Support', 'Service Boy', 'Maintenance', 'Kitchen'
      ]).notNullable();
      table.text('permissions').notNullable();
      table.enum('status', ['active', 'inactive']).defaultTo('active');
      table.timestamp('last_login').nullable();
      table.string('created_by', 50).nullable();
      table.timestamps(true, true);

      table.index('hotel_id');
      table.index('email');
      table.unique(['hotel_id', 'email']);
      table.foreign('hotel_id').references('hotel_id').inTable('hotels').onDelete('CASCADE');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('staff');
  await knex.schema.dropTableIfExists('super_admins');
  await knex.schema.dropTableIfExists('vendor_admins');
  await knex.schema.dropTableIfExists('hotel_admins');
}
