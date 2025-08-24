import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing roles
  await knex('roles').del();

  // Insert hierarchical roles
  await knex('roles').insert([
    // Level 0: Super Admin (Global)
    {
      id: 1,
      name: 'Super Admin',
      hierarchy_level: 0,
      role_type: 'system',
      permissions: JSON.stringify(['*']),
      can_create_sub_roles: true,
      description: 'System super administrator with full access'
    },
    
    // Level 1: Vendor (Multi-hotel)
    {
      id: 2,
      name: 'Vendor',
      hierarchy_level: 1,
      role_type: 'vendor',
      parent_role_id: 1,
      permissions: JSON.stringify([
        'vendor.*',
        'hotel.create',
        'hotel.manage',
        'voucher.create',
        'voucher.manage'
      ]),
      can_create_sub_roles: true,
      description: 'Vendor with multiple hotels management'
    },
    
    // Level 2: Hotel Admin (Single hotel)
    {
      id: 3,
      name: 'Hotel Admin',
      hierarchy_level: 2,
      role_type: 'hotel_admin',
      parent_role_id: 2,
      permissions: JSON.stringify([
        'hotel.manage',
        'staff.create',
        'staff.manage',
        'roles.assign',
        'voucher.create',
        'reports.full_access'
      ]),
      can_create_sub_roles: true,
      description: 'Hotel administrator - can create and manage all hotel staff'
    },
    
    // Level 3: Manager/Owner
    {
      id: 4,
      name: 'Manager/Owner',
      hierarchy_level: 3,
      role_type: 'hotel_staff',
      parent_role_id: 3,
      permissions: JSON.stringify([
        'bookings.view_all',
        'bookings.manage',
        'rooms.manage',
        'rates.manage',
        'reports.view',
        'staff.supervise',
        'revenue.view'
      ]),
      can_create_sub_roles: false,
      description: 'Hotel manager with full operational access except admin functions'
    },
    
    // Level 3: Finance Department
    {
      id: 5,
      name: 'Finance Department',
      hierarchy_level: 3,
      role_type: 'hotel_staff',
      parent_role_id: 3,
      permissions: JSON.stringify([
        'bookings.view_financial',
        'revenue.view',
        'revenue.reports',
        'rates.view',
        'payments.view',
        'financial_kpis.view'
      ]),
      restrictions: JSON.stringify({
        cannot_edit_rooms: true,
        cannot_book_rooms: true,
        cannot_manage_staff: true
      }),
      description: 'Finance department - access to booking revenue and financial KPIs only'
    },
    
    // Level 3: Front Desk
    {
      id: 6,
      name: 'Front Desk',
      hierarchy_level: 3,
      role_type: 'hotel_staff',
      parent_role_id: 3,
      permissions: JSON.stringify([
        'bookings.create',
        'bookings.manage_checkin',
        'bookings.manage_checkout',
        'calendar.view',
        'rooms.view_availability',
        'guests.manage',
        'payments.process',
        'cash_ledger.manage'
      ]),
      description: 'Front desk staff - booking management, check-in/out, cash transactions'
    },
    
    // Level 4: Booking Agent
    {
      id: 7,
      name: 'Booking Agent',
      hierarchy_level: 4,
      role_type: 'hotel_staff',
      parent_role_id: 6,
      permissions: JSON.stringify([
        'rooms.check_availability',
        'bookings.create',
        'bookings.view_own',
        'vouchers.apply'
      ]),
      restrictions: JSON.stringify({
        special_rates_only: true,
        requires_approval: true,
        cannot_modify_rates: true
      }),
      description: 'Booking agent - limited booking access with special rates via vouchers'
    }
  ]);
}