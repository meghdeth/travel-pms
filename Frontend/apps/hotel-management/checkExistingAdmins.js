const http = require('http');

// Test which admin accounts actually exist
const testAdmins = [
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
  const loginData = JSON.stringify({
    identifier: email,
    password
  });

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
      console.log(`✅ ${email} - Login successful`);
      console.log(`   Hotel: ${result.hotel?.name || 'Unknown'}`);
      console.log(`   Hotel ID: ${result.hotel?.id || 'Unknown'}`);
      return true;
    } else {
      console.log(`❌ ${email} - Login failed: ${response.statusCode}`);
      console.log(`   Response: ${response.data}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${email} - Error: ${error.message}`);
    return false;
  }
}

async function checkAllAdmins() {
  console.log('🔍 Checking existing hotel admin accounts...\n');
  
  for (const admin of testAdmins) {
    await testLogin(admin.email, admin.password);
    console.log('');
  }
}

checkAllAdmins()
  .then(() => {
    console.log('✨ Check completed!');
  })
  .catch((error) => {
    console.error('❌ Error:', error);
  });