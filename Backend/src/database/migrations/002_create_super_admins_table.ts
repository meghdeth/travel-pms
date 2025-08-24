import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('super_admins', (table) => {
    table.increments('id').primary();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('username', 100).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.string('avatar', 500).nullable();
    table.text('address').nullable();
    table.text('details').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('super_admins');
}