const knexConfig = require('./knexfile.js');
const knex = require('knex')(knexConfig.development);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');

    // Check hotels
    const hotels = await knex('hotels').select('hotel_id', 'name', 'email', 'status');
    console.log('🏨 Hotels:');
    console.table(hotels);

    // Check hotel users
    const users = await knex('hotel_users').select('hotel_user_id', 'hotel_id', 'email', 'first_name', 'last_name', 'role', 'status');
    console.log('\n👥 Hotel Users:');
    console.table(users);

    // Check roles
    const roles = await knex('roles').select('*').limit(5);
    console.log('\n👔 Roles (first 5):');
    console.table(roles);

    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await knex.destroy();
  }
}

checkDatabase();