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
  const email = 'newmanar@gmail.com';
  const password = 'Password123!';
  
  // We can register a test user if login fails, since the server verification is fixed now!
  const ts = Date.now();
  const testEmail = `chattester${ts}@mentora.io`;
  
  console.log('1. Registering test user...');
  const regPayload = {
    username: `tester${ts}`,
    email: testEmail,
    firstName: 'Chat',
    lastName: 'Tester',
    password: 'Password123!',
    phoneNumber: '+1234567890',
    dateOfBirth: '1995-05-15',
    gender: 'female'
  };
  await makeRawReq('/api/Auth/register', 'POST', JSON.stringify(regPayload), { 'Content-Type': 'application/json' });
  
  console.log('2. Logging in...');
  const loginRes = await makeRawReq('/api/Auth/login', 'POST', JSON.stringify({ email: testEmail, password: 'Password123!' }), { 'Content-Type': 'application/json' });
  const token = loginRes.data?.token;
  if (!token) {
    console.log('Login failed');
    return;
  }

  console.log('3. Starting a couple of chats...');
  const c1 = await makeRawReq('/api/Chats', 'POST', null, { 'Authorization': `Bearer ${token}` });
  const id1 = c1.data?.chatId;
  await makeRawReq(`/api/Chats/${id1}/messages`, 'POST', JSON.stringify({ message: 'Hello in chat 1' }), { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
  await makeRawReq(`/api/Chats/${id1}/end`, 'POST', null, { 'Authorization': `Bearer ${token}` });

  const c2 = await makeRawReq('/api/Chats', 'POST', null, { 'Authorization': `Bearer ${token}` });
  const id2 = c2.data?.chatId;
  await makeRawReq(`/api/Chats/${id2}/messages`, 'POST', JSON.stringify({ message: 'Hello in chat 2' }), { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

  console.log('\n4. Fetching chats list...');
  const listRes = await makeRawReq('/api/Chats?pageSize=5', 'GET', null, { 'Authorization': `Bearer ${token}` });
  console.log('Chats List Status:', listRes.status);
  console.log('Chats List Body:', JSON.stringify(listRes.data, null, 2));
}

main().catch(console.error);
