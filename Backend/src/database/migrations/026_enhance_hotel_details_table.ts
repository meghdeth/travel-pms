import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add missing columns to hotels table for comprehensive management
  const hasLicenseNumber = await knex.schema.hasColumn('hotels', 'license_number');
  const hasTaxId = await knex.schema.hasColumn('hotels', 'tax_id');
  const hasManagerName = await knex.schema.hasColumn('hotels', 'manager_name');
  const hasManagerEmail = await knex.schema.hasColumn('hotels', 'manager_email');
  const hasManagerPhone = await knex.schema.hasColumn('hotels', 'manager_phone');
  const hasBusinessType = await knex.schema.hasColumn('hotels', 'business_type');
  const hasChainInfo = await knex.schema.hasColumn('hotels', 'chain_info');
  
  await knex.schema.alterTable('hotels', (table) => {
    if (!hasLicenseNumber) {
      table.string('license_number', 100).nullable();
    }
    if (!hasTaxId) {
      table.string('tax_id', 100).nullable();
    }
    if (!hasManagerName) {
      table.string('manager_name', 200).nullable();
    }
    if (!hasManagerEmail) {
      table.string('manager_email', 255).nullable();
    }
    if (!hasManagerPhone) {
      table.string('manager_phone', 20).nullable();
    }
    if (!hasBusinessType) {
      table.enum('business_type', [
        'hotel', 'motel', 'resort', 'hostel', 'guesthouse', 
        'apartment', 'villa', 'boutique', 'budget', 'luxury'
      ]).defaultTo('hotel');
    }
    if (!hasChainInfo) {
      table.json('chain_info').nullable(); // For hotel chains
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('hotels', (table) => {
    table.dropColumn('license_number');
    table.dropColumn('tax_id');
    table.dropColumn('manager_name');
    table.dropColumn('manager_email');
    table.dropColumn('manager_phone');
    table.dropColumn('business_type');
    table.dropColumn('chain_info');
  });
}