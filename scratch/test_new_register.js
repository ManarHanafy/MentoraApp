const https = require('https');

const API = 'f95e09a4-464b-40e5-a5e9-187f64246454-00-zk7weqe8wb4f.spock.replit.dev';

function makeRawReq(path, method, body, headers) {
  return new Promise((resolve) => {
    const options = {
      hostname: API,
      port: 443,
      path,
      method,
      headers: {
        ...headers,
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', c => responseBody += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(responseBody) }); }
        catch { resolve({ status: res.statusCode, data: responseBody }); }
      });
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const ts = Date.now();
  const email = `testuser${ts}@mentora.io`;
  const password = 'Mentora123!';
  
  console.log('1. Registering user via /api/Users ...');
  const regPayload = {
    username: `user${ts}`,
    email,
    firstName: 'Test',
    lastName: 'User',
    password,
    phoneNumber: '+1234567890',
    dateOfBirth: '1995-05-15',
    gender: 'female'
  };
  
  const regRes = await makeRawReq('/api/Users', 'POST', JSON.stringify(regPayload), { 'Content-Type': 'application/json' });
  console.log('Registration Status:', regRes.status);
  console.log('Registration Response:', JSON.stringify(regRes.data));

  if (regRes.status === 200 || regRes.status === 201) {
    console.log('2. Attempting Login...');
    const loginRes = await makeRawReq('/api/Auth/login', 'POST', JSON.stringify({ email, password }), { 'Content-Type': 'application/json' });
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', JSON.stringify(loginRes.data));
  }
}

main().catch(console.error);
