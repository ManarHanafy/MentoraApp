const https = require('https');

const API_HOST = '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev';
const API_BASE = '/api';

async function testApi() {
  const loginData = JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' });
  
  console.log('--- Logging in ---');
  const token = await new Promise((resolve) => {
    const req = https.request({
      hostname: API_HOST,
      path: `${API_BASE}/Auth/login`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data).token));
    });
    req.write(loginData);
    req.end();
  });

  if (!token) {
    console.error('Login failed');
    return;
  }
  console.log('Token received');

  console.log('\n--- Testing POST /api/Chats ---');
  const chatId = await new Promise((resolve) => {
    const req = https.request({
      hostname: API_HOST,
      path: `${API_BASE}/Chats`,
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      console.log('Status:', res.statusCode);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Response:', data);
        try {
          const json = JSON.parse(data);
          resolve(json.chatId || json.id || json.Id);
        } catch(e) {
          resolve(null);
        }
      });
    });
    req.end();
  });

  if (chatId) {
    console.log('\n--- Testing POST /api/Chats/{id}/messages ---');
    const msgReq = https.request({
      hostname: API_HOST,
      path: `${API_BASE}/Chats/${chatId}/messages`,
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      console.log('Status:', res.statusCode);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => console.log('Response:', data));
    });
    msgReq.write(JSON.stringify({ Message: "Hello AI" }));
    msgReq.end();
  } else {
    console.log('Could not start chat');
  }
}

testApi();
