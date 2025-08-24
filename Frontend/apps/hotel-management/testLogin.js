const http = require('http');

async function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function loginHotelAdmin(email, password) {
  const postData = JSON.stringify({ email, password });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/hotel/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return await makeRequest(options, postData);
}

async function testLogin() {
  console.log('🔐 Testing existing admin login...');
  
  try {
    const result = await loginHotelAdmin('admin@grandhotel.com', 'Admin123!');
    console.log('✅ Login successful!');
    console.log('User data:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }
}

testLogin();