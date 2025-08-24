import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable().unique();
    table.text('permissions').notNullable(); // JSON string of permissions
    table.text('description').nullable();
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('roles');
}