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
  
  console.log('Attempting Login with', email, '...');
  const loginRes = await makeRawReq('/api/Auth/login', 'POST', JSON.stringify({ email, password }), { 'Content-Type': 'application/json' });
  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', JSON.stringify(loginRes.data));

  const token = loginRes.data?.token;
  if (!token) {
    console.log('Login failed for newmanar@gmail.com. Let us try Manar@gmail.com...');
    const loginRes2 = await makeRawReq('/api/Auth/login', 'POST', JSON.stringify({ email: 'Manar@gmail.com', password }), { 'Content-Type': 'application/json' });
    console.log('Manar@gmail.com Login Status:', loginRes2.status);
    console.log('Manar@gmail.com Login Response:', JSON.stringify(loginRes2.data));
    return;
  }

  console.log('Login Succeeded! Token:', token.slice(0, 30) + '...');

  console.log('\nStarting chat...');
  const startRes = await makeRawReq('/api/Chats', 'POST', null, { 'Authorization': `Bearer ${token}` });
  const chatId = startRes.data?.chatId;
  console.log('chatId:', chatId);

  console.log('Sending message anxious message...');
  await makeRawReq(`/api/Chats/${chatId}/messages`, 'POST', JSON.stringify({ message: 'I feel anxious' }), { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

  console.log('Calling endChat (/api/Chats/:id/end)...');
  const endRes = await makeRawReq(`/api/Chats/${chatId}/end`, 'POST', null, { 'Authorization': `Bearer ${token}` });
  console.log('endChat Status:', endRes.status);
  console.log('endChat Full Response:', JSON.stringify(endRes.data, null, 2));
}

main().catch(console.error);
