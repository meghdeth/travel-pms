import { hotelAuthService } from 'shared/lib/hotelAuth';

interface DemoUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'Hotel Admin' | 'Hotel Manager' | 'Hotel Guest Keeper';
  hotel_name: string;
  hotel_address: string;
  hotel_city: string;
  hotel_state: string;
  hotel_zip: string;
  hotel_type: 'hotel' | 'hostel' | 'bnb' | 'dormitory' | 'resort' | 'motel';
}

const demoUsers: DemoUser[] = [
  {
    email: 'admin@grandhotel.com',
    password: 'Admin123!',
    first_name: 'John',
    last_name: 'Anderson',
    phone: '+1-555-0101',
    role: 'Hotel Admin',
    hotel_name: 'Grand Hotel Downtown',
    hotel_address: '123 Main Street',
    hotel_city: 'New York',
    hotel_state: 'NY',
    hotel_zip: '10001',
    hotel_type: 'hotel'
  },
  {
    email: 'manager@grandhotel.com',
    password: 'Manager123!',
    first_name: 'Sarah',
    last_name: 'Johnson',
    phone: '+1-555-0102',
    role: 'Hotel Manager',
    hotel_name: 'Grand Hotel Downtown',
    hotel_address: '123 Main Street',
    hotel_city: 'New York',
    hotel_state: 'NY',
    hotel_zip: '10001',
    hotel_type: 'hotel'
  },
  {
    email: 'keeper@grandhotel.com',
    password: 'Keeper123!',
    first_name: 'Mike',
    last_name: 'Davis',
    phone: '+1-555-0103',
    role: 'Hotel Guest Keeper',
    hotel_name: 'Grand Hotel Downtown',
    hotel_address: '123 Main Street',
    hotel_city: 'New York',
    hotel_state: 'NY',
    hotel_zip: '10001',
    hotel_type: 'hotel'
  },
  {
    email: 'admin@coastalresort.com',
    password: 'Admin123!',
    first_name: 'Emily',
    last_name: 'Wilson',
    phone: '+1-555-0201',
    role: 'Hotel Admin',
    hotel_name: 'Coastal Resort & Spa',
    hotel_address: '456 Ocean Drive',
    hotel_city: 'Miami',
    hotel_state: 'FL',
    hotel_zip: '33101',
    hotel_type: 'resort'
  },
  {
    email: 'manager@cityhostel.com',
    password: 'Manager123!',
    first_name: 'Robert',
    last_name: 'Brown',
    phone: '+1-555-0301',
    role: 'Hotel Manager',
    hotel_name: 'City Center Hostel',
    hotel_address: '789 Urban Street',
    hotel_city: 'San Francisco',
    hotel_state: 'CA',
    hotel_zip: '94102',
    hotel_type: 'hostel'
  }
];

export async function createDemoUsers() {
  console.log('Creating demo users...');
  
  for (const user of demoUsers) {
    try {
      const registrationData = {
        email: user.email,
        password: user.password,
        phone: user.phone,
        name: user.hotel_name,
        address: user.hotel_address,
        city: user.hotel_city,
        state: user.hotel_state,
        zip_code: user.hotel_zip,
        hotel_type: user.hotel_type,
        first_name: user.first_name,
        last_name: user.last_name,
      };
      
      await hotelAuthService.register(registrationData);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } catch (error: any) {
      console.error(`❌ Failed to create user ${user.email}:`, error.message);
    }
  }
  
  console.log('Demo user creation completed!');
}

// Usage instructions:
// To run this script, you can call createDemoUsers() from a component or page
// Example: import { createDemoUsers } from './scripts/createDemoUsers';
//          createDemoUsers();