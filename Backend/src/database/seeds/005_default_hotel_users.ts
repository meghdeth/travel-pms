import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('hotel_users').del();

  // Hash passwords
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const hashedManagerPassword = await bcrypt.hash('Manager123!', 10);
  const hashedFrontDeskPassword = await bcrypt.hash('FrontDesk123!', 10);

  // Inserts seed entries for Grand Hotel Downtown (Hotel ID: 1000000000)
  await knex('hotel_users').insert([
    // Grand Hotel Downtown Users
    {
      id: 1,
      hotel_user_id: '11100000000000001', // Hotel Admin: 11(admin) + 1(hotel) + 0000000000(hotel_id) + 00001
      hotel_id: '1000000000',
      email: 'admin@grandhoteldowntown.com',
      password: hashedPassword,
      first_name: 'Hotel',
      last_name: 'Admin',
      phone: '+1-555-0101',
      role: 'Hotel Admin',
      permissions: JSON.stringify({
        can_manage_users: true,
        can_manage_rooms: true,
        can_manage_bookings: true,
        can_view_reports: true,
        can_manage_settings: true
      }),
      status: 'active'
    },
    {
      id: 2,
      hotel_user_id: '12100000000000001', // Manager: 12(manager) + 1(hotel) + 0000000000(hotel_id) + 00001
      hotel_id: '1000000000',
      email: 'manager@grandhoteldowntown.com',
      password: hashedManagerPassword,
      first_name: 'Hotel',
      last_name: 'Manager',
      phone: '+1-555-0102',
      role: 'Manager',
      permissions: JSON.stringify({
        can_manage_users: false,
        can_manage_rooms: true,
        can_manage_bookings: true,
        can_view_reports: true,
        can_manage_settings: false
      }),
      status: 'active',
      created_by: '11100000000000001'
    },
    {
      id: 3,
      hotel_user_id: '14100000000000001', // Front Desk: 14(front_desk) + 1(hotel) + 0000000000(hotel_id) + 00001
      hotel_id: '1000000000',
      email: 'frontdesk@grandhoteldowntown.com',
      password: hashedFrontDeskPassword,
      first_name: 'Front',
      last_name: 'Desk',
      phone: '+1-555-0103',
      role: 'Front Desk',
      permissions: JSON.stringify({
        can_manage_users: false,
        can_manage_rooms: false,
        can_manage_bookings: true,
        can_view_reports: false,
        can_manage_settings: false
      }),
      status: 'active',
      created_by: '11100000000000001'
    },
    // Luxury Resort & Spa Users (Hotel ID: 1000000001)
    {
      id: 4,
      hotel_user_id: '11100000000100001', // Hotel Admin: 11(admin) + 1(hotel) + 0000000001(hotel_id) + 00001
      hotel_id: '1000000001',
      email: 'admin@luxuryresortspa.com',
      password: hashedPassword,
      first_name: 'Resort',
      last_name: 'Admin',
      phone: '+1-555-0201',
      role: 'Hotel Admin',
      permissions: JSON.stringify({
        can_manage_users: true,
        can_manage_rooms: true,
        can_manage_bookings: true,
        can_view_reports: true,
        can_manage_settings: true
      }),
      status: 'active'
    },
    {
      id: 5,
      hotel_user_id: '12100000000100001', // Manager: 12(manager) + 1(hotel) + 0000000001(hotel_id) + 00001
      hotel_id: '1000000001',
      email: 'manager@luxuryresortspa.com',
      password: hashedManagerPassword,
      first_name: 'Resort',
      last_name: 'Manager',
      phone: '+1-555-0202',
      role: 'Manager',
      permissions: JSON.stringify({
        can_manage_users: false,
        can_manage_rooms: true,
        can_manage_bookings: true,
        can_view_reports: true,
        can_manage_settings: false
      }),
      status: 'active',
      created_by: '11100000000100001'
    },
    {
      id: 6,
      hotel_user_id: '14100000000100001', // Front Desk: 14(front_desk) + 1(hotel) + 0000000001(hotel_id) + 00001
      hotel_id: '1000000001',
      email: 'frontdesk@luxuryresortspa.com',
      password: hashedFrontDeskPassword,
      first_name: 'Resort',
      last_name: 'Front Desk',
      phone: '+1-555-0203',
      role: 'Front Desk',
      permissions: JSON.stringify({
        can_manage_users: false,
        can_manage_rooms: false,
        can_manage_bookings: true,
        can_view_reports: false,
        can_manage_settings: false
      }),
      status: 'active',
      created_by: '11100000000100001'
    }
  ]);
}