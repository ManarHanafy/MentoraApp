const https = require('https');

const API_BASE_URL = '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev';

function request(path, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: API_BASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: responseData
        });
      });
    });

    req.on('error', (e) => { reject(e); });
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  try {
    console.log('--- Step 1: Login ---');
    const loginRes = await request('/api/Auth/login', 'POST', {
      email: 'newmanar@gmail.com',
      password: 'Password123!'
    });
    console.log('Login Status:', loginRes.statusCode);
    console.log('Login Body:', loginRes.body);

    if (loginRes.statusCode !== 200) {
      console.error('Login failed');
      return;
    }

    const loginData = JSON.parse(loginRes.body);
    const token = loginData.token;

    console.log('\n--- Step 2: Post Journal ---');
    const journalRes = await request('/api/Journals', 'POST', {
      journal_text: 'Testing full flow from node script'
    }, token);
    console.log('Journal Status:', journalRes.statusCode);
    console.log('Journal Body:', journalRes.body);

    if (journalRes.statusCode === 401) {
        console.error('UNAUTHORIZED error detected!');
    } else if (journalRes.statusCode === 200 || journalRes.statusCode === 201) {
        console.log('SUCCESS!');
    }

  } catch (err) {
    console.error('Error during test:', err);
  }
}

run();
