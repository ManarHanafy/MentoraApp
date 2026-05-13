const https = require('https');

function request(path, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev',
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
        resolve({ statusCode: res.statusCode, body: responseData });
      });
    });
    req.on('error', (e) => { reject(e); });
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  try {
    // Step 1: Login
    console.log('--- Logging in... ---');
    const loginRes = await request('/api/Auth/login', 'POST', {
      email: 'newmanar@gmail.com',
      password: 'Password123!'
    });
    
    if (loginRes.statusCode !== 200) {
      console.error('Login failed:', loginRes.statusCode, loginRes.body);
      return;
    }
    const loginData = JSON.parse(loginRes.body);
    const token = loginData.token || loginData.Token;
    console.log('Login OK, token obtained.');

    // Step 2: Post a Journal entry
    console.log('\n--- Posting journal entry... ---');
    const journalResponse = await request('/api/Journals', 'POST', { journal_text: 'I feel very anxious about my upcoming exam tomorrow' }, token);
    
    console.log('Journal Status:', journalResponse.statusCode);
    console.log('\n=== FULL JOURNAL API RESPONSE ===');
    
    try {
      const parsed = JSON.parse(journalResponse.body);
      console.log(JSON.stringify(parsed, null, 2));
      
      // List all top-level keys
      console.log('\n=== ALL TOP-LEVEL KEYS ===');
      console.log(Object.keys(parsed));
      
      // Check each key's type and value
      for (const key of Object.keys(parsed)) {
        const val = parsed[key];
        const type = Array.isArray(val) ? 'array' : typeof val;
        const preview = type === 'string' ? val.substring(0, 100) : (type === 'object' || type === 'array') ? JSON.stringify(val).substring(0, 200) : val;
        console.log(`  "${key}" (${type}): ${preview}`);
      }
    } catch(e) {
      console.log('RAW (not JSON):', journalResponse.body);
    }
    
    console.log('\n=================================');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
