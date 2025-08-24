import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('roles').del();

  // Inserts seed entries
  await knex('roles').insert([
    {
      id: 1,
      name: 'Hotel Manager',
      permissions: JSON.stringify([
        'hotel.view',
        'hotel.edit',
        'rooms.manage',
        'bookings.manage',
        'guests.manage',
        'reports.view'
      ]),
      description: 'Full access to hotel management features',
      status: 'active'
    },
    {
      id: 2,
      name: 'Front Desk',
      permissions: JSON.stringify([
        'bookings.manage',
        'guests.manage',
        'rooms.view'
      ]),
      description: 'Front desk operations access',
      status: 'active'
    },
    {
      id: 3,
      name: 'Housekeeping',
      permissions: JSON.stringify([
        'rooms.view',
        'rooms.status'
      ]),
      description: 'Housekeeping and room status management',
      status: 'active'
    }
  ]);
}