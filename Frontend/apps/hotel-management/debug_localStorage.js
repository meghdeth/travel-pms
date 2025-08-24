// Debug localStorage functionality
console.log('=== localStorage Debug ===');

// Check if localStorage is available
if (typeof localStorage !== 'undefined') {
  console.log('✅ localStorage is available');
  
  // Check current stored data
  console.log('\n📦 Current localStorage contents:');
  console.log('hotel_token:', localStorage.getItem('hotel_token'));
  console.log('hotel_user:', localStorage.getItem('hotel_user'));
  console.log('hotel_data:', localStorage.getItem('hotel_data'));
  
  // Test storing and retrieving data
  const testUser = {
    id: 'test123',
    email: 'test@example.com',
    role: {
      name: 'Test Role',
      code: 'TEST',
      permissions: ['test_permission']
    }
  };
  
  console.log('\n🧪 Testing localStorage operations:');
  localStorage.setItem('test_user', JSON.stringify(testUser));
  const retrieved = localStorage.getItem('test_user');
  const parsed = JSON.parse(retrieved);
  
  console.log('Stored:', testUser);
  console.log('Retrieved:', parsed);
  console.log('Match:', JSON.stringify(testUser) === JSON.stringify(parsed));
  
  // Clean up
  localStorage.removeItem('test_user');
  
} else {
  console.log('❌ localStorage is not available');
}

console.log('=== End Debug ===');