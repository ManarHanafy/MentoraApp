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
  // Step 1: Register and login a fresh user
  const ts = Date.now();
  const email = `chatdebug_${ts}@example.com`;
  console.log('Registering user...');
  await makeReq('/api/Auth/register', 'POST', {
    username: 'debug_' + ts,
    email,
    firstName: 'Chat',
    lastName: 'Debug',
    password: 'Password123!',
    phoneNumber: '+1234567890',
    dateOfBirth: '1995-05-15',
    gender: 'female'
  });

  console.log('Logging in...');
  const loginRes = await makeReq('/api/Auth/login', 'POST', {
    email,
    password: 'Password123!'
  });
  
  console.log('Login Status:', loginRes.status);
  
  const loginData = JSON.parse(loginRes.body);
  const token = loginData.token;
  
  if (!token) {
    console.error('Failed to log in:', loginRes.body);
    return;
  }
  
  // Step 2: Start a Chat
  console.log('\nStarting Chat...');
  const chatRes = await makeReq('/api/Chats', 'POST', {}, token);
  console.log('Chat Start Status:', chatRes.status);
  console.log('Chat Start Response:', chatRes.body);
  
  const chatData = JSON.parse(chatRes.body);
  const chatId = chatData.id || chatData.Id || chatData.chatId || chatRes.body.trim();
  console.log('Chat ID:', chatId);
  
  // Step 3: Send Message
  console.log('\nSending Message "hello"...');
  const msgRes = await makeReq(`/api/Chats/${chatId}/messages`, 'POST', { message: 'hello' }, token);
  console.log('Message Send Status:', msgRes.status);
  console.log('Message Send Response:', msgRes.body);
})();
