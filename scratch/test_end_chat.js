const https = require('https');
const API = 'f95e09a4-464b-40e5-a5e9-187f64246454-00-zk7weqe8wb4f.spock.replit.dev';

function req(path, method, body, headers) {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: API, port: 443, path, method,
      headers: { ...headers, ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}) }
    };
    const r = https.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    r.on('error', e => resolve({ status: 0, error: e.message }));
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

async function main() {
  const ts = Date.now();
  const email = `endtest${ts}@mentora.io`;
  const password = 'Password123!';

  console.log('1. Register...');
  await req('/api/Auth/register', 'POST', {
    username: `endtest${ts}`, email, firstName: 'End', lastName: 'Tester',
    password, phoneNumber: '+201234567890', dateOfBirth: '1995-01-01', gender: 'female'
  }, { 'Content-Type': 'application/json' });

  console.log('2. Login...');
  const loginRes = await req('/api/Auth/login', 'POST', { email, password }, { 'Content-Type': 'application/json' });
  const token = loginRes.data?.token;
  if (!token) { console.log('❌ Login failed:', loginRes); return; }
  console.log('✅ Got token:', token.slice(0, 30) + '...');

  const auth = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  console.log('3. Start chat...');
  const startRes = await req('/api/Chats', 'POST', {}, auth);
  const chatId = startRes.data?.chatId;
  console.log('   chatId:', chatId, '| status:', startRes.status);

  console.log('4. Send a real message...');
  const msgRes = await req(`/api/Chats/${chatId}/messages`, 'POST',
    { message: 'I am feeling very anxious and stressed about my work. I cannot sleep and I feel overwhelmed.' }, auth);
  console.log('   msg status:', msgRes.status, '| riskLevel:', msgRes.data?.riskLevel);

  console.log('5. Send another message...');
  const msg2Res = await req(`/api/Chats/${chatId}/messages`, 'POST',
    { message: 'I have been feeling like this for weeks and it is affecting my relationships too.' }, auth);
  console.log('   msg2 status:', msg2Res.status, '| riskLevel:', msg2Res.data?.riskLevel);

  console.log('6. End chat...');
  const endRes = await req(`/api/Chats/${chatId}/end`, 'POST', {}, auth);
  console.log('   end status:', endRes.status);
  console.log('   end response:', JSON.stringify(endRes.data, null, 2));
}

main().catch(console.error);
