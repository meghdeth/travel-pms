import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('username', 100).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('contact_number', 20).nullable();
    table.text('address').nullable();
    table.string('city', 100).nullable();
    table.string('state', 100).nullable();
    table.string('country', 100).nullable();
    table.enum('status', ['active', 'inactive', 'banned']).defaultTo('active');
    table.boolean('email_verified').defaultTo(false);
    table.timestamp('email_verified_at').nullable();
    table.string('avatar', 500).nullable();
    table.string('verification_token', 500).nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}