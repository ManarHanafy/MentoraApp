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
  const ts = Date.now();
  const email = `test_chat_sum_${ts}@example.com`;
  
  // Register & Login
  await makeReq('/api/Auth/register', 'POST', {
    username: 'test_sum_' + ts,
    email,
    firstName: 'Sum',
    lastName: 'Test',
    password: 'Password123!'
  });
  const loginRes = await makeReq('/api/Auth/login', 'POST', { email, password: 'Password123!' });
  const token = JSON.parse(loginRes.body).token;
  
  // Start chat
  const startRes = await makeReq('/api/Chats', 'POST', {}, token);
  const chatId = JSON.parse(startRes.body).chatId;
  console.log('Chat Started. ID:', chatId);

  // Send first message
  console.log('Sending message 1...');
  await makeReq(`/api/Chats/${chatId}/messages`, 'POST', { message: 'I feel extremely stressed out because of my exams tomorrow. I cannot sleep.' }, token);

  // Check summary
  console.log('\n--- Checking summary GET ---');
  const sumGet = await makeReq(`/api/Chats/${chatId}/summary`, 'GET', null, token);
  console.log('Summary GET status:', sumGet.status);
  console.log('Summary GET body:', sumGet.body);

  // Call summarize POST
  console.log('\n--- Calling summarize POST ---');
  const sumPost = await makeReq(`/api/Chats/${chatId}/summarize`, 'POST', {}, token);
  console.log('Summarize POST status:', sumPost.status);
  console.log('Summarize POST body:', sumPost.body);
})();
