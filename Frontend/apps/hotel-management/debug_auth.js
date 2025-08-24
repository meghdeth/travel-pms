// Debug authentication and localStorage
console.log('=== Authentication Debug ===');

// Check localStorage contents
console.log('\n📦 Current localStorage contents:');
console.log('hotel_token:', localStorage.getItem('hotel_token'));
console.log('hotel_refresh_token:', localStorage.getItem('hotel_refresh_token'));
console.log('hotel_user:', localStorage.getItem('hotel_user'));
console.log('hotel_data:', localStorage.getItem('hotel_data'));

// Parse and display user data
const userDataStr = localStorage.getItem('hotel_user');
if (userDataStr) {
  try {
    const userData = JSON.parse(userDataStr);
    console.log('\n👤 Parsed user data:');
    console.log('User object:', userData);
    console.log('User role:', userData.role);
    console.log('User role name:', userData.role?.name);
    console.log('User role code:', userData.role?.code);
    console.log('User role isAdmin:', userData.role?.isAdmin);
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
  }
} else {
  console.log('❌ No user data found in localStorage');
}

// Check if hotelAuthService is available
if (typeof window !== 'undefined') {
  // Try to import and test hotelAuthService
  import('shared/lib/hotelAuth').then(({ hotelAuthService }) => {
    console.log('\n🔧 Testing hotelAuthService:');
    console.log('isAuthenticated():', hotelAuthService.isAuthenticated());
    console.log('getUser():', hotelAuthService.getUser());
    console.log('getHotel():', hotelAuthService.getHotel());
    console.log('getUserRole():', hotelAuthService.getUserRole());
  }).catch(error => {
    console.error('❌ Error importing hotelAuthService:', error);
  });
}

console.log('\n=== End Debug ===');