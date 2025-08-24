import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if columns exist before adding them
  const hasParentRoleId = await knex.schema.hasColumn('roles', 'parent_role_id');
  const hasHierarchyLevel = await knex.schema.hasColumn('roles', 'hierarchy_level');
  const hasRoleType = await knex.schema.hasColumn('roles', 'role_type');
  const hasRestrictions = await knex.schema.hasColumn('roles', 'restrictions');
  const hasCanCreateSubRoles = await knex.schema.hasColumn('roles', 'can_create_sub_roles');
  const hasHotelId = await knex.schema.hasColumn('roles', 'hotel_id');
  const hasVendorId = await knex.schema.hasColumn('roles', 'vendor_id');

  // Add new columns to roles table for hierarchy
  await knex.schema.alterTable('roles', (table) => {
    if (!hasParentRoleId) {
      table.integer('parent_role_id').unsigned().nullable();
    }
    if (!hasHierarchyLevel) {
      table.integer('hierarchy_level').notNullable().defaultTo(0);
    }
    if (!hasRoleType) {
      table.string('role_type').notNullable().defaultTo('hotel_staff');
    }
    if (!hasRestrictions) {
      table.json('restrictions').nullable();
    }
    if (!hasCanCreateSubRoles) {
      table.boolean('can_create_sub_roles').defaultTo(false);
    }
    if (!hasHotelId) {
      table.integer('hotel_id').unsigned().nullable();
    }
    if (!hasVendorId) {
      table.integer('vendor_id').unsigned().nullable();
    }
  });

  // Add foreign key constraints separately
  await knex.schema.alterTable('roles', (table) => {
    if (!hasParentRoleId) {
      table.foreign('parent_role_id').references('id').inTable('roles').onDelete('SET NULL');
    }
    if (!hasHotelId) {
      table.foreign('hotel_id').references('id').inTable('hotels').onDelete('CASCADE');
    }
    if (!hasVendorId) {
      table.foreign('vendor_id').references('id').inTable('vendors').onDelete('CASCADE');
    }
  });

  // Admin table has been removed - no admin-related operations needed
}

export async function down(knex: Knex): Promise<void> {
  // Check which columns exist before trying to drop them
  const hasParentRoleId = await knex.schema.hasColumn('roles', 'parent_role_id');
  const hasHierarchyLevel = await knex.schema.hasColumn('roles', 'hierarchy_level');
  const hasRoleType = await knex.schema.hasColumn('roles', 'role_type');
  const hasRestrictions = await knex.schema.hasColumn('roles', 'restrictions');
  const hasCanCreateSubRoles = await knex.schema.hasColumn('roles', 'can_create_sub_roles');
  const hasHotelId = await knex.schema.hasColumn('roles', 'hotel_id');
  const hasVendorId = await knex.schema.hasColumn('roles', 'vendor_id');
  
  // Admin table has been removed - no admin columns to check

  // Drop foreign key constraints first
  if (hasParentRoleId || hasHotelId || hasVendorId) {
    await knex.schema.alterTable('roles', (table) => {
      if (hasParentRoleId) table.dropForeign(['parent_role_id']);
      if (hasHotelId) table.dropForeign(['hotel_id']);
      if (hasVendorId) table.dropForeign(['vendor_id']);
    });
  }

  // Admin table has been removed - no admin foreign keys to drop

  // Then drop columns
  await knex.schema.alterTable('roles', (table) => {
    if (hasParentRoleId) table.dropColumn('parent_role_id');
    if (hasHierarchyLevel) table.dropColumn('hierarchy_level');
    if (hasRoleType) table.dropColumn('role_type');
    if (hasRestrictions) table.dropColumn('restrictions');
    if (hasCanCreateSubRoles) table.dropColumn('can_create_sub_roles');
    if (hasHotelId) table.dropColumn('hotel_id');
    if (hasVendorId) table.dropColumn('vendor_id');
  });

  // Admin table has been removed - no admin columns to drop
}