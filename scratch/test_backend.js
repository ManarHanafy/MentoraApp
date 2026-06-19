const https = require('https');

const API_BASE_URL = 'a41eb64e-0d86-48e0-aa43-4d51441fa3ce-00-3cz45r2891wll.worf.replit.dev';

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
    const unique = Date.now();
    const email = `manar_${unique}@gmail.com`;
    const password = 'Password123!';
    const username = `manar_${unique}`;

    console.log('--- Step 1: Register ---');
    const regRes = await request('/api/Auth/register', 'POST', {
      username,
      email,
      firstName: 'Manar',
      lastName: 'Hanafy',
      password,
      phoneNumber: '12345678',
      dateOfBirth: '2000-01-01',
      gender: 'Female'
    });
    console.log('Register Status:', regRes.statusCode);

    if (regRes.statusCode !== 200 && regRes.statusCode !== 201) {
      console.error('Registration failed:', regRes.body);
      return;
    }

    console.log('\n--- Step 2: Login ---');
    const loginRes = await request('/api/Auth/login', 'POST', {
      email,
      password
    });
    console.log('Login Status:', loginRes.statusCode);

    if (loginRes.statusCode !== 200) {
      console.error('Login failed');
      return;
    }

    const loginData = JSON.parse(loginRes.body);
    const token = loginData.token;

    console.log('\n--- Step 3: Post Journal (with journal_text) ---');
    const journalRes1 = await request('/api/Journals', 'POST', {
      journal_text: 'عندي ارق'
    }, token);
    console.log('Journal Status 1:', journalRes1.statusCode);
    console.log('Journal Body 1:', journalRes1.body);

    console.log('\n--- Step 4: Post Journal (with JournalText) ---');
    const journalRes2 = await request('/api/Journals', 'POST', {
      JournalText: 'عندي ارق'
    }, token);
    console.log('Journal Status 2:', journalRes2.statusCode);
    console.log('Journal Body 2:', journalRes2.body);

  } catch (err) {
    console.error('Error during test:', err);
  }
}

run();
