const http = require('http');

// Demo hotel admins that should already exist
const existingAdmins = [
  {
    email: 'admin@grandhotel.com',
    password: 'Admin123!',
    hotelName: 'Grand Hotel Downtown'
  }
];

// Hotels to create with their admin accounts
const hotelsToCreate = [
  {
    email: 'admin@coastalresort.com',
    password: 'Admin123!',
    first_name: 'Emily',
    last_name: 'Wilson',
    username: 'admin_coastal',
    name: 'Coastal Resort & Spa',
    address: '456 Ocean Drive',
    city: 'Miami',
    state: 'FL',
    country: 'USA',
    postal_code: '33139',
    phone: '+1-305-555-0200',
    star_rating: 4,
    check_in_time: '15:00',
    check_out_time: '11:00'
  },
  {
    email: 'admin@cityhostel.com',
    password: 'Admin123!',
    first_name: 'Robert',
    last_name: 'Brown',
    username: 'admin_city',
    name: 'City Center Hostel',
    address: '789 Downtown St',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    postal_code: '94102',
    phone: '+1-415-555-0300',
    star_rating: 2,
    check_in_time: '14:00',
    check_out_time: '10:00'
  }
];

// Additional staff members to create
const additionalStaff = [
  {
    hotelEmail: 'admin@grandhotel.com',
    email: 'manager@grandhotel.com',
    password: 'Manager123!',
    first_name: 'Sarah',
    last_name: 'Johnson',
    phone: '+1-555-0102',
    role: 'Manager/Owner'
  },
  {
    hotelEmail: 'admin@grandhotel.com',
    email: 'keeper@grandhotel.com',
    password: 'Keeper123!',
    first_name: 'Mike',
    last_name: 'Davis',
    phone: '+1-555-0103',
    role: 'Gatekeeper'
  },
  {
    hotelEmail: 'admin@grandhotel.com',
    email: 'frontdesk@grandhotel.com',
    password: 'Staff123!',
    first_name: 'Sarah',
    last_name: 'Receptionist',
    phone: '+1234567891',
    role: 'Front Desk'
  },
  {
    hotelEmail: 'admin@coastalresort.com',
    email: 'manager@coastalresort.com',
    password: 'Staff123!',
    first_name: 'Mike',
    last_name: 'Resort Manager',
    phone: '+1234567892',
    role: 'Manager/Owner'
  },
  {
    hotelEmail: 'admin@coastalresort.com',
    email: 'booking@coastalresort.com',
    password: 'Staff123!',
    first_name: 'Lisa',
    last_name: 'Booking Agent',
    phone: '+1234567893',
    role: 'Booking Agent'
  },
  {
    hotelEmail: 'admin@cityhostel.com',
    email: 'support@cityhostel.com',
    password: 'Staff123!',
    first_name: 'David',
    last_name: 'Support Staff',
    phone: '+1234567894',
    role: 'Support'
  }
];

// Store hotel information
const hotelInfo = new Map();

async function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function loginHotelAdmin(email, password) {
  const loginData = JSON.stringify({ identifier: email, password });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/hotel/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  try {
    const response = await makeRequest(options, loginData);
    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      
      // Extract hotel_id from JWT token
      const token = result.data.token;
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const hotelId = payload.hotel_id;
      
      return { 
        success: true, 
        hotel: { 
          id: hotelId, 
          name: result.data.user.hotel ? result.data.user.hotel.name : 'Unknown Hotel' 
        }, 
        token: result.data.token, 
        user: result.data.user 
      };
    } else {
      return { success: false, error: `HTTP ${response.statusCode}: ${response.data}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createHotel(hotelData) {
  const postData = JSON.stringify(hotelData);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/hotel/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  try {
    const response = await makeRequest(options, postData);
    if (response.statusCode === 201) {
      const result = JSON.parse(response.data);
      return { success: true, hotel: result.hotel, admin: result.admin };
    } else {
      return { success: false, error: `HTTP ${response.statusCode}: ${response.data}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createStaffMember(hotelId, staffData, authToken) {
  const postData = JSON.stringify(staffData);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/staff/${hotelId}/staff`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${authToken}`
    }
  };

  try {
    const response = await makeRequest(options, postData);
    if (response.statusCode === 201) {
      const result = JSON.parse(response.data);
      return { success: true, staff: result.staff };
    } else {
      return { success: false, error: `HTTP ${response.statusCode}: ${response.data}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createAllDemoData() {
  console.log('🚀 Creating demo hotels and staff members...\n');
  
  console.log('📋 Step 1: Creating demo hotels...');
  
  // Create new hotels first
  for (const hotelData of hotelsToCreate) {
    try {
      const createResult = await createHotel(hotelData);
      if (createResult.success) {
        console.log(`✅ Created hotel: ${hotelData.name} with admin ${hotelData.email}`);
        // Try to login to the newly created admin
        const loginResult = await loginHotelAdmin(hotelData.email, hotelData.password);
        if (loginResult.success) {
          hotelInfo.set(hotelData.email, {
            hotelId: loginResult.hotel.id,
            hotelName: loginResult.hotel.name,
            token: loginResult.token
          });
        }
      } else {
        console.log(`❌ Failed to create hotel ${hotelData.name}: ${createResult.error}`);
      }
    } catch (error) {
      console.log(`❌ Failed to create hotel ${hotelData.name}: ${error.message}`);
    }
  }
  
  console.log('\n📋 Step 2: Logging in to existing hotel admin accounts...');
  
  // Login to existing admin accounts
  for (const admin of existingAdmins) {
    try {
      const loginResult = await loginHotelAdmin(admin.email, admin.password);
      if (loginResult.success) {
        console.log(`✅ Logged in: ${admin.email} (${loginResult.hotel.name})`);
        hotelInfo.set(admin.email, {
          hotelId: loginResult.hotel.id,
          hotelName: loginResult.hotel.name,
          token: loginResult.token
        });
      } else {
        console.log(`❌ Failed to login ${admin.email}: ${loginResult.error}`);
        // If login fails, try to create the Grand Hotel
        if (admin.email === 'admin@grandhotel.com') {
          console.log('🔄 Attempting to create Grand Hotel Downtown...');
          const grandHotelData = {
            email: 'admin@grandhotel.com',
            password: 'Admin123!',
            first_name: 'John',
            last_name: 'Anderson',
            username: 'admin_grand',
            name: 'Grand Hotel Downtown',
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postal_code: '10001',
            phone: '+1-555-0101',
            star_rating: 5,
            check_in_time: '15:00',
            check_out_time: '11:00'
          };
          
          try {
            const createResult = await createHotel(grandHotelData);
            if (createResult.success) {
              console.log(`✅ Created Grand Hotel Downtown with admin ${admin.email}`);
              const loginResult = await loginHotelAdmin(admin.email, admin.password);
              if (loginResult.success) {
                hotelInfo.set(admin.email, {
                  hotelId: loginResult.hotel.id,
                  hotelName: loginResult.hotel.name,
                  token: loginResult.token
                });
              }
            } else {
              console.log(`❌ Failed to create Grand Hotel: ${createResult.error}`);
            }
          } catch (createError) {
            console.log(`❌ Failed to create Grand Hotel: ${createError.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`❌ Failed to login ${admin.email}: ${error.message}`);
    }
  }
  
  console.log('\n📋 Step 3: Creating additional staff members...');
  
  // Create additional staff members
  for (const staff of additionalStaff) {
    const hotelData = hotelInfo.get(staff.hotelEmail);
    
    if (!hotelData) {
      console.log(`❌ Hotel not found for ${staff.email}`);
      continue;
    }
    
    try {
      const result = await createStaffMember(hotelData.hotelId, staff, hotelData.token);
      if (result.success) {
        console.log(`✅ Created staff member: ${staff.email} (${staff.role} at ${hotelData.hotelName})`);
      } else {
        console.log(`❌ Failed to create staff member ${staff.email}: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Failed to create staff member ${staff.email}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Demo data creation completed!');
  
  console.log('\n📋 Available Demo Users:');
  
  console.log('\n🏨 Hotel Admin (Full Access):');
  console.log('1. admin@grandhotel.com - Password: Admin123! (Grand Hotel Downtown)');
  
  console.log('\n👥 Additional Staff Members:');
  console.log('1. manager@grandhotel.com - Password: Manager123! (Manager/Owner at Grand Hotel Downtown)');
  console.log('2. keeper@grandhotel.com - Password: Keeper123! (Gatekeeper at Grand Hotel Downtown)');
  
  console.log('\n🔐 You can now test role-based access with these accounts!');
  
  console.log('\n📝 Testing Notes:');
  console.log('- Hotel Admin can see Staff Management section');
  console.log('- Manager/Gatekeeper cannot see Staff Management section');
  console.log('- All users can access the hotel dashboard');
  
  console.log('\n✨ Demo users setup complete!');
  
  console.log('\n🎯 All done!');
}

createAllDemoData()
  .then(() => {
    console.log('');
  })
  .catch((error) => {
    console.error('❌ Error:', error);
  });