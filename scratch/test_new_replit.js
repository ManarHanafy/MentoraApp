const https = require('https');

function request(path, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'a41eb64e-0d86-48e0-aa43-4d51441fa3ce-00-3cz45r2891wll.worf.replit.dev',
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: responseData });
      });
    });
    req.on('error', (e) => { reject(e); });
    if (data) req.write(data);
    req.end();
  });
}

async function test() {
  try {
    const ts = Date.now();
    const email = `testuser${ts}@mentora.io`;
    const password = 'Mentora123!';
    
    console.log('Registering user...');
    await request('/Auth/register', 'POST', {
      username: `user${ts}`,
      email,
      firstName: 'Test',
      lastName: 'User',
      password
    });

    console.log('Logging in...');
    const loginRes = await request('/Auth/login', 'POST', {
      email,
      password
    });
    const token = JSON.parse(loginRes.body).token;

    console.log('Fetching details for Basic_Breathing_1xDay...');
    const detailsRes = await request('/Exercises/id-name/Basic_Breathing_1xDay', 'GET', null, token);
    console.log('Details status:', detailsRes.statusCode);
    console.log('=== EXERCISE DETAILS RESPONSE ===');
    console.log(detailsRes.body);
  } catch (err) {
    console.error(err);
  }
}

test();
