import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Step 1: Add a temporary column with the new ENUM values
  await knex.raw(`
    ALTER TABLE hotel_users 
    ADD COLUMN role_new ENUM(
      'Hotel Admin', 
      'Manager', 
      'Finance Department', 
      'Front Desk',
      'Booking Agent', 
      'Gatekeeper', 
      'Support', 
      'Tech Support',
      'Service Boy', 
      'Maintenance', 
      'Kitchen'
    ) NOT NULL DEFAULT 'Manager'
  `);
  
  // Step 2: Copy data from old role column to new, mapping 'Manager/Owner' to 'Manager'
  await knex.raw(`
    UPDATE hotel_users 
    SET role_new = CASE 
      WHEN role = 'Manager/Owner' THEN 'Manager'
      ELSE role
    END
  `);
  
  // Step 3: Drop the old role column
  await knex.schema.alterTable('hotel_users', (table) => {
    table.dropColumn('role');
  });
  
  // Step 4: Rename the new column to 'role'
  await knex.raw('ALTER TABLE hotel_users CHANGE role_new role ENUM(\'Hotel Admin\', \'Manager\', \'Finance Department\', \'Front Desk\', \'Booking Agent\', \'Gatekeeper\', \'Support\', \'Tech Support\', \'Service Boy\', \'Maintenance\', \'Kitchen\') NOT NULL');
}

export async function down(knex: Knex): Promise<void> {
  // Revert back to the old enum values
  await knex.raw(`
    ALTER TABLE hotel_users 
    MODIFY COLUMN role ENUM(
      'Hotel Admin',
      'Manager/Owner',
      'Finance Department', 
      'Front Desk',
      'Booking Agent', 
      'Gatekeeper', 
      'Support', 
      'Tech Support',
      'Service Boy', 
      'Maintenance', 
      'Kitchen'
    ) NOT NULL
  `);
  
  // Update any 'Manager' records back to 'Manager/Owner'
  await knex('hotel_users')
    .where('role', 'Manager')
    .update('role', 'Manager/Owner');
}