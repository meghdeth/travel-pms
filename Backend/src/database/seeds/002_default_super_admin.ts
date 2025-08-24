import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('super_admins').del();

  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Inserts seed entries
  await knex('super_admins').insert([
    {
      id: 1,
      first_name: 'Super',
      last_name: 'Admin',
      username: 'superadmin',
      email: 'admin@travelpms.com',
      password: hashedPassword,
      status: 'active'
    }
  ]);
}