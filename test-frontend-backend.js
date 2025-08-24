const axios = require('axios');

async function testFrontendBackendConnection() {
  console.log('🧪 Testing Frontend-Backend Connection...\n');
  
  try {
    // Test 1: Hotel Admin Login
    console.log('1️⃣  Testing Hotel Admin Login...');
    const adminResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@grandhotel.com',
      password: 'Admin123!'
    });
    
    if (adminResponse.data.success) {
      console.log('✅ Hotel Admin Login: SUCCESS');
      console.log('   Token received:', adminResponse.data.data.token.substring(0, 20) + '...');
      console.log('   User:', adminResponse.data.data.user.firstName, adminResponse.data.data.user.lastName);
      console.log('   Role:', adminResponse.data.data.user.role);
      console.log('   Hotel ID:', adminResponse.data.data.user.hotelId);
    }
    
    // Test 2: Staff Login
    console.log('\n2️⃣  Testing Staff Login...');
    const staffResponse = await axios.post('http://localhost:3001/api/v1/auth/staff/login', {
      email: 'manager@grandhotel.com',
      password: 'Manager123!'
    });
    
    if (staffResponse.data.success) {
      console.log('✅ Staff Login: SUCCESS');
      console.log('   Token received:', staffResponse.data.data.token.substring(0, 20) + '...');
      console.log('   User:', staffResponse.data.data.user.firstName, staffResponse.data.data.user.lastName);
      console.log('   Role:', staffResponse.data.data.user.role);
      console.log('   Hotel ID:', staffResponse.data.data.user.hotelId);
    }
    
    // Test 3: Staff Management (using admin token)
    console.log('\n3️⃣  Testing Staff Management API...');
    const adminToken = adminResponse.data.data.token;
    const staffListResponse = await axios.get(`http://localhost:3001/api/v1/hotel/1000000001/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (staffListResponse.data.success) {
      console.log('✅ Staff Management API: SUCCESS');
      console.log('   Total users found:', staffListResponse.data.data.length);
      staffListResponse.data.data.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.role}) - ${user.email}`);
      });
    }
    
    // Test 4: Create New Staff Member
    console.log('\n4️⃣  Testing Create Staff Member...');
    const newStaffResponse = await axios.post(`http://localhost:3001/api/v1/hotel/1000000001/users`, {
      email: 'receptionist@grandhotel.com',
      password: 'Reception123!',
      firstName: 'Anna',
      lastName: 'Reception',
      role: 'Front Desk',
      phone: '+1234567891'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (newStaffResponse.data.success) {
      console.log('✅ Create Staff Member: SUCCESS');
      console.log('   New staff ID:', newStaffResponse.data.data.hotel_user_id);
      console.log('   Name:', newStaffResponse.data.data.first_name, newStaffResponse.data.data.last_name);
      console.log('   Role:', newStaffResponse.data.data.role);
    }
    
    console.log('\n🎉 All tests passed! Frontend-Backend connection is working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('   Status:', error.response?.status);
    console.error('   URL:', error.config?.url);
  }
}

testFrontendBackendConnection();