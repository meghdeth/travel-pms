// Debug authentication flow
const axios = require('axios');

// Test direct API call to backend
async function testDirectLogin() {
  try {
    console.log('🧪 Testing direct backend login...');
    
    const response = await axios.post('http://localhost:3000/api/v1/auth/hotel/login', {
      identifier: 'manager@grandhotel.com',
      password: 'Manager123!'
    });
    
    console.log('✅ Backend response:', response.data);
    
    if (response.data.success) {
      const authData = response.data.data;
      console.log('👤 User data:', authData.user);
      console.log('🏨 Hotel data:', authData.hotel);
      console.log('🔑 Token:', authData.token ? 'Present' : 'Missing');
      console.log('🔄 Refresh token:', authData.refreshToken ? 'Present' : 'Missing');
      
      // Check user role structure
      if (authData.user && authData.user.role) {
        console.log('👔 Role structure:');
        console.log('  - Name:', authData.user.role.name);
        console.log('  - Code:', authData.user.role.code);
        console.log('  - Permissions:', authData.user.role.permissions);
      } else {
        console.log('❌ No role data in user object');
      }
    }
    
  } catch (error) {
    console.error('❌ Backend login failed:', error.response?.data || error.message);
  }
}

testDirectLogin();