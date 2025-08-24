import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('vendors').del();

  const hashedPassword = await bcrypt.hash('vendor123', 12);
  const now = new Date();
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  // Inserts seed entries
  await knex('vendors').insert([
    {
      id: 1,
      company_name: 'Demo Hotel Group',
      first_name: 'John',
      last_name: 'Vendor',
      username: 'vendor',
      email: 'vendor@travelpms.com',
      password: hashedPassword,
      contact_number: '+1234567890',
      address: '123 Business Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      status: 'active',
      email_verified: true,
      email_verified_at: knex.fn.now(),
      hotel_limit: 10,
      subscription_status: 'active',
      subscription_expires_at: oneYearFromNow.toISOString().split('T')[0]
    }
  ]);
}