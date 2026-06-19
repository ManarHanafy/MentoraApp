const https = require('https');

const API_HOST = 'a41eb64e-0d86-48e0-aa43-4d51441fa3ce-00-3cz45r2891wll.worf.replit.dev';

function apiRequest(path, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: API_HOST,
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
          headers: res.headers,
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
    const rand = Math.floor(Math.random() * 100000);
    const email = `testuser_${rand}@gmail.com`;
    const password = 'Password123!';
    const username = `testuser_${rand}`;

    console.log(`--- Step 1: Register User (${email}) ---`);
    // Note: React Native calls /api/Users if /api/Auth/register fails, or vice versa
    const registerRes = await apiRequest('/api/Auth/register', 'POST', {
      username,
      email,
      firstName: 'Test',
      lastName: 'User',
      password
    });
    console.log('Register Status:', registerRes.statusCode);
    console.log('Register Body:', registerRes.body);

    console.log('\n--- Step 2: Login ---');
    const loginRes = await apiRequest('/api/Auth/login', 'POST', {
      email,
      password
    });
    console.log('Login Status:', loginRes.statusCode);
    console.log('Login Body:', loginRes.body);

    if (loginRes.statusCode !== 200) {
      console.error('Login failed');
      return;
    }

    const loginData = JSON.parse(loginRes.body);
    const token = loginData.token;

    console.log('\n--- Step 3: POST /api/Journals ---');
    const journalRes = await apiRequest('/api/Journals', 'POST', {
      journal_text: 'Today was a good day, I went for a walk and felt very happy and relaxed.'
    }, token);
    console.log('Journal Post Status:', journalRes.statusCode);
    console.log('Journal Post Body:', journalRes.body);

    console.log('\n--- Step 4: GET /api/Journals ---');
    const getJournalsRes = await apiRequest('/api/Journals', 'GET', null, token);
    console.log('GET Journals Status:', getJournalsRes.statusCode);
    console.log('GET Journals Body:', getJournalsRes.body);

    if (getJournalsRes.statusCode === 200) {
      const list = JSON.parse(getJournalsRes.body);
      if (list.length > 0) {
        const firstId = list[0].id || list[0].Id;
        console.log(`\n--- Step 5: GET /api/Journals/${firstId} ---`);
        const getOneRes = await apiRequest(`/api/Journals/${firstId}`, 'GET', null, token);
        console.log(`GET Journal ${firstId} Status:`, getOneRes.statusCode);
        console.log(`GET Journal ${firstId} Body:`, getOneRes.body);
      }
    }

  } catch (err) {
    console.error('Error during test:', err);
  }
}

run();
