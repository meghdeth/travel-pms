const http = require('http');

const adminsToTest = [
  { email: 'admin@grandhotel.com', password: 'Admin123!' },
  { email: 'admin@coastalresort.com', password: 'Admin123!' },
  { email: 'admin@cityhostel.com', password: 'Admin123!' }
];

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

async function testLogin(email, password) {
  const loginData = JSON.stringify({ email, password });
  
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
      return {
        success: true,
        email,
        hotelName: result.data.user.hotel.name,
        hotelId: result.data.user.hotel.id,
        token: result.data.token
      };
    } else {
      return {
        success: false,
        email,
        error: `HTTP ${response.statusCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      email,
      error: error.message
    };
  }
}

async function verifyAllAdmins() {
  console.log('🔍 Verifying existing hotel admin accounts...\n');
  
  const workingAdmins = [];
  
  for (const admin of adminsToTest) {
    const result = await testLogin(admin.email, admin.password);
    
    if (result.success) {
      console.log(`✅ ${result.email} - ${result.hotelName} (ID: ${result.hotelId})`);
      workingAdmins.push(result);
    } else {
      console.log(`❌ ${result.email} - ${result.error}`);
    }
  }
  
  console.log(`\n📊 Summary: ${workingAdmins.length}/${adminsToTest.length} admin accounts are working`);
  
  if (workingAdmins.length > 0) {
    console.log('\n✅ Working admin accounts:');
    workingAdmins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.hotelName})`);
    });
  }
}

verifyAllAdmins()
  .then(() => {
    console.log('\n🎯 Verification complete!');
  })
  .catch((error) => {
    console.error('❌ Error:', error);
  });