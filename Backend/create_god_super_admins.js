const knexConfig = require('./knexfile.js');
const knex = require('knex')(knexConfig.development);
const bcrypt = require('bcryptjs');

async function createGodAndSuperAdmins() {
  try {
    console.log('🔐 Creating GOD Admin and Super Admin users...\n');

    // Create system hotel entry first if needed
    const systemHotel = await knex('hotels').where({ hotel_id: '0000000000' }).first();
    if (!systemHotel) {
      await knex('hotels').insert({
        id: 999,
        hotel_id: '0000000000',
        vendor_id: null,
        name: 'System Administration',
        slug: 'system-admin',
        description: 'System level hotel for administrators',
        address: 'System Level',
        city: 'System',
        state: 'SYS',
        country: 'System',
        postal_code: '00000',
        phone: '+1-000-000-0000',
        email: 'system@hotelpms.com',
        star_rating: 5,
        check_in_time: '00:00:00',
        check_out_time: '23:59:59',
        status: 'active',
        is_featured: false,
        avg_rating: 0,
        total_reviews: 0
      });
      console.log('✅ System hotel created');
    }

    // Hash passwords
    const godAdminPassword = await bcrypt.hash('GodAdmin123!', 10);
    const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);

    // Check if GOD Admin exists
    const existingGodAdmin = await knex('hotel_users').where({ email: 'god@hotelpms.com' }).first();
    if (!existingGodAdmin) {
      await knex('hotel_users').insert({
        id: 100,
        hotel_user_id: '00000000000000001', // Special ID for GOD Admin
        hotel_id: '0000000000', // System level hotel ID
        email: 'god@hotelpms.com',
        password: godAdminPassword,
        first_name: 'GOD',
        last_name: 'Admin',
        phone: '+1-000-000-0000',
        role: 'GOD Admin',
        permissions: JSON.stringify({
          level: 'GOD',
          can_delete_permanently: true,
          can_delist_hotels: true,
          can_deactivate_hotels: true,
          can_manage_all: true,
          can_override_any_action: true
        }),
        status: 'active'
      });
      console.log('✅ GOD Admin created: god@hotelpms.com / GodAdmin123!');
    } else {
      console.log('⚠️  GOD Admin already exists');
    }

    // Check if Super Admin exists
    const existingSuperAdmin = await knex('hotel_users').where({ email: 'super@hotelpms.com' }).first();
    if (!existingSuperAdmin) {
      await knex('hotel_users').insert({
        id: 101,
        hotel_user_id: '00000000000000002', // Special ID for Super Admin
        hotel_id: '0000000000', // System level hotel ID
        email: 'super@hotelpms.com',
        password: superAdminPassword,
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+1-000-000-0001',
        role: 'Super Admin',
        permissions: JSON.stringify({
          level: 'SUPER',
          can_delete_permanently: false,
          can_delist_hotels: true,
          can_deactivate_hotels: true,
          can_manage_all: true,
          cannot_override_delist: false
        }),
        status: 'active'
      });
      console.log('✅ Super Admin created: super@hotelpms.com / SuperAdmin123!');
    } else {
      console.log('⚠️  Super Admin already exists');
    }

    console.log('\n🎉 GOD and Super Admin setup complete!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ GOD ADMIN (Full Access + Delete)                       │');
    console.log('│ Email: god@hotelpms.com                                 │');
    console.log('│ Password: GodAdmin123!                                  │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ SUPER ADMIN (Full Access + Delist, No Delete)          │');
    console.log('│ Email: super@hotelpms.com                               │');
    console.log('│ Password: SuperAdmin123!                                │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ HOTEL ADMIN (Hotel Management, No Delist)              │');
    console.log('│ Email: admin@grandhoteldowntown.com                     │');
    console.log('│ Password: Admin123!                                     │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
  } catch (error) {
    console.error('❌ Error creating admins:', error.message);
  } finally {
    await knex.destroy();
  }
}

createGodAndSuperAdmins();