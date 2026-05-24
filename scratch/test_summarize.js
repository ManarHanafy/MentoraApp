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
  const email = `sumtest${ts}@mentora.io`;
  const password = 'Password123!';

  console.log('1. Register + Login...');
  await req('/api/Auth/register', 'POST', {
    username: `sumtest${ts}`, email, firstName: 'Sum', lastName: 'Tester',
    password, phoneNumber: '+201234567890', dateOfBirth: '1995-01-01', gender: 'female'
  }, { 'Content-Type': 'application/json' });

  const loginRes = await req('/api/Auth/login', 'POST', { email, password }, { 'Content-Type': 'application/json' });
  const token = loginRes.data?.token;
  if (!token) { console.log('❌ Login failed'); return; }
  console.log('✅ Token OK');

  const auth = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  console.log('2. Start chat...');
  const startRes = await req('/api/Chats', 'POST', {}, auth);
  const chatId = startRes.data?.chatId;
  console.log('   chatId:', chatId);

  console.log('3. Send messages about anxiety...');
  await req(`/api/Chats/${chatId}/messages`, 'POST',
    { message: 'I feel very anxious and overwhelmed. I cannot stop worrying about everything and I have trouble sleeping.' }, auth);
  await req(`/api/Chats/${chatId}/messages`, 'POST',
    { message: 'My anxiety has been affecting my work and relationships. I feel stuck and hopeless sometimes.' }, auth);

  console.log('4. Call /summarize (the key step)...');
  const sumRes = await req(`/api/Chats/${chatId}/summarize`, 'POST', {}, auth);
  console.log('   summarize status:', sumRes.status);
  console.log('   summarize response:', JSON.stringify(sumRes.data, null, 2));

  console.log('\n5. Call /end...');
  const endRes = await req(`/api/Chats/${chatId}/end`, 'POST', {}, auth);
  console.log('   end status:', endRes.status);
  console.log('   end response:', JSON.stringify(endRes.data, null, 2));
}

main().catch(console.error);
