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
  const email = `test_journal_${ts}@example.com`;
  
  // Register & Login
  await makeReq('/api/Auth/register', 'POST', {
    username: 'test_jr_' + ts,
    email,
    firstName: 'Journal',
    lastName: 'Test',
    password: 'Password123!'
  });
  const loginRes = await makeReq('/api/Auth/login', 'POST', { email, password: 'Password123!' });
  const token = JSON.parse(loginRes.body).token;
  console.log('Token obtained:', !!token);

  // Post Journal
  const payload = { journal_text: 'I am so happy and excited about my new project today! Everything is going great.' };
  console.log('Sending payload to /api/Journals:', payload);
  
  const res = await makeReq('/api/Journals', 'POST', payload, token);
  console.log('Journal POST Status:', res.status);
  console.log('Journal POST Response:', res.body);
})();
