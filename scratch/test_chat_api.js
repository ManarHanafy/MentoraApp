const https = require('https');

const API = '7369b2b3-b4e3-44fb-8094-7d778a784912-00-3agg2ahjt7nnk.spock.replit.dev';

function makeReq(path, method, bodyObj, token) {
  return new Promise((resolve) => {
    const data = bodyObj ? JSON.stringify(bodyObj) : null;
    const options = {
      hostname: API,
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // 1. Register + Login with fresh user
  const ts = Date.now();
  const email = `testuser${ts}@mentora.io`;
  const password = 'Mentora123!';
  console.log('1. Registering:', email);
  const regRes = await makeReq('/api/Auth/register', 'POST', {
    username: `user${ts}`, firstName: 'Test', lastName: 'User', email, password
  });
  console.log('Register status:', regRes.status, JSON.stringify(regRes.data).slice(0,300));

  console.log('1b. Logging in...');
  const loginRes = await makeReq('/api/Auth/login', 'POST', { email, password });
  const token = loginRes.data?.token;
  if (!token) return console.log('Login failed:', JSON.stringify(loginRes, null, 2));
  console.log('✅ Logged in, token:', token.slice(0,30) + '...');

  // 2. GET /api/Chats (list)
  console.log('\n2. GET /api/Chats');
  const listRes = await makeReq('/api/Chats', 'GET', null, token);
  console.log('Status:', listRes.status);
  console.log('Response shape:', JSON.stringify(listRes.data, null, 2).slice(0, 500));

  // 3. POST /api/Chats (start chat)
  console.log('\n3. POST /api/Chats (start new chat)');
  const startRes = await makeReq('/api/Chats', 'POST', {}, token);
  console.log('Status:', startRes.status);
  console.log('Response:', JSON.stringify(startRes.data, null, 2));
  const chatId = startRes.data?.id || startRes.data?.Id || startRes.data?.chatId || startRes.data;
  if (!chatId) return console.log('No chatId found');
  console.log('chatId:', chatId);

  // 4. Send a message
  console.log('\n4. POST /api/Chats/:id/messages');
  const msgRes = await makeReq(`/api/Chats/${chatId}/messages`, 'POST', { message: 'I am feeling very stressed today' }, token);
  console.log('Status:', msgRes.status);
  console.log('Message response keys:', Object.keys(msgRes.data || {}));
  console.log('riskLevel?:', msgRes.data?.riskLevel, msgRes.data?.risk_level);
  console.log('suggestedAction?:', msgRes.data?.suggestedAction, msgRes.data?.suggested_action);
  console.log('Full response:', JSON.stringify(msgRes.data, null, 2).slice(0, 800));

  // 5. GET /api/Chats/:id (details)
  console.log('\n5. GET /api/Chats/:id (chat details)');
  const detailRes = await makeReq(`/api/Chats/${chatId}`, 'GET', null, token);
  console.log('Status:', detailRes.status);
  console.log('Fields:', Object.keys(detailRes.data || {}));
  console.log('isEnded?:', detailRes.data?.isEnded, detailRes.data?.IsEnded);
  console.log('messages sample:', JSON.stringify((detailRes.data?.messages || []).slice(0, 2), null, 2));

  // 6. GET /api/Chats?pageSize=1 (latest)
  console.log('\n6. GET /api/Chats?pageSize=1 (latest chat)');
  const latestRes = await makeReq('/api/Chats?pageSize=1', 'GET', null, token);
  console.log('Status:', latestRes.status);
  console.log('Shape:', JSON.stringify(latestRes.data, null, 2).slice(0, 600));
}

main().catch(console.error);
