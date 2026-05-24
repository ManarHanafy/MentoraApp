const https = require('https');

const API = '7369b2b3-b4e3-44fb-8094-7d778a784912-00-3agg2ahjt7nnk.spock.replit.dev';

function makeReq(path, method, bodyObj, token) {
  return new Promise((resolve) => {
    const data = bodyObj ? JSON.stringify(bodyObj) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const options = { hostname: API, port: 443, path, method, headers };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', e => resolve({ error: e.message }));
    if (bodyObj) req.write(data);
    req.end();
  });
}

(async () => {
  // Step 1: Login to get a token
  console.log('=== Step 1: Login ===');
  const ts = Date.now();
  const email = `chattest_${ts}@example.com`;
  
  // Register first
  await makeReq('/api/Auth/register', 'POST', {
    username: 'chatuser_' + ts,
    email,
    firstName: 'Chat',
    lastName: 'Test',
    password: 'Password123!'
  });
  
  const loginRes = await makeReq('/api/Auth/login', 'POST', { email, password: 'Password123!' });
  const loginData = JSON.parse(loginRes.body);
  const token = loginData.token;
  console.log('Token:', token ? 'Got token ✅' : '❌ No token');
  if (!token) { console.log('Login failed:', loginRes.body); return; }

  // Step 2: Start chat
  console.log('\n=== Step 2: Start Chat ===');
  const startRes = await makeReq('/api/Chats', 'POST', {}, token);
  console.log('Start Chat Status:', startRes.status);
  console.log('Start Chat Body:', startRes.body.substring(0, 200));
  
  let chatId;
  try {
    const chatData = JSON.parse(startRes.body);
    chatId = chatData.id || chatData.Id || chatData.chatId || startRes.body.trim();
    console.log('Chat ID:', chatId);
  } catch { chatId = startRes.body.trim(); }

  if (!chatId) { console.log('❌ No chat ID'); return; }

  // Step 3: Send a message and see FULL response
  console.log('\n=== Step 3: Send Message ===');
  const msgRes = await makeReq(`/api/Chats/${chatId}/messages`, 'POST', { message: 'I feel very stressed and anxious lately, I cant sleep' }, token);
  console.log('Message Status:', msgRes.status);
  console.log('Message FULL Response:', msgRes.body);
  
  try {
    const msgData = JSON.parse(msgRes.body);
    console.log('Message Keys:', Object.keys(msgData));
    console.log('Has suggestedExercises:', !!msgData.suggestedExercises);
    console.log('Has reply:', !!msgData.reply);
  } catch(e) {}

  // Step 4: End chat and see full response
  console.log('\n=== Step 4: End Chat ===');
  const endRes = await makeReq(`/api/Chats/${chatId}/end`, 'POST', {}, token);
  console.log('End Chat Status:', endRes.status);
  console.log('End Chat FULL Response:', endRes.body);
  
  try {
    const endData = JSON.parse(endRes.body);
    console.log('End Chat Keys:', Object.keys(endData));
    console.log('suggestedExercises:', JSON.stringify(endData.suggestedExercises || endData.SuggestedExercises || 'NOT FOUND'));
  } catch(e) {}
})();
