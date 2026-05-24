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
  console.log('1. Registering...');
  await makeRawReq('/api/Auth/register', 'POST', JSON.stringify({
    username: `user${ts}`, firstName: 'Test', lastName: 'User', email, password
  }), { 'Content-Type': 'application/json' });

  const loginRes = await makeRawReq('/api/Auth/login', 'POST', JSON.stringify({ email, password }), { 'Content-Type': 'application/json' });
  const token = loginRes.data?.token;
  if (!token) return console.log('Login failed');

  // Let's test ending chat in three ways!
  
  // Variation 1: Start Chat, send msg, call end with JSON body '{}'
  const chat1 = (await makeRawReq('/api/Chats', 'POST', null, { 'Authorization': `Bearer ${token}` })).data?.chatId;
  await makeRawReq(`/api/Chats/${chat1}/messages`, 'POST', JSON.stringify({ message: 'I feel anxious' }), { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
  console.log('\n--- V1: Calling end with json body "{}" ---');
  const res1 = await makeRawReq(`/api/Chats/${chat1}/end`, 'POST', '{}', {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  console.log('V1 Status:', res1.status, 'Response:', JSON.stringify(res1.data));

  // Variation 2: Start Chat, send msg, call end with NO body and NO Content-Type
  const chat2 = (await makeRawReq('/api/Chats', 'POST', null, { 'Authorization': `Bearer ${token}` })).data?.chatId;
  await makeRawReq(`/api/Chats/${chat2}/messages`, 'POST', JSON.stringify({ message: 'I feel anxious' }), { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
  console.log('\n--- V2: Calling end with NO body and NO Content-Type ---');
  const res2 = await makeRawReq(`/api/Chats/${chat2}/end`, 'POST', null, {
    'Authorization': `Bearer ${token}`
  });
  console.log('V2 Status:', res2.status, 'Response:', JSON.stringify(res2.data));

  // Variation 3: Start Chat, send msg, call end with empty string body and Content-Type: application/json
  const chat3 = (await makeRawReq('/api/Chats', 'POST', null, { 'Authorization': `Bearer ${token}` })).data?.chatId;
  await makeRawReq(`/api/Chats/${chat3}/messages`, 'POST', JSON.stringify({ message: 'I feel anxious' }), { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
  console.log('\n--- V3: Calling end with empty string body and Content-Type ---');
  const res3 = await makeRawReq(`/api/Chats/${chat3}/end`, 'POST', '', {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  console.log('V3 Status:', res3.status, 'Response:', JSON.stringify(res3.data));
}

main().catch(console.error);
