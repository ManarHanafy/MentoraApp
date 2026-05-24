const https = require('https');

const API = '7369b2b3-b4e3-44fb-8094-7d778a784912-00-3agg2ahjt7nnk.spock.replit.dev';

function makeReq(path, method, bodyObj) {
  return new Promise((resolve) => {
    const data = bodyObj ? JSON.stringify(bodyObj) : '';
    const options = {
      hostname: API, port: 443, path, method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
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

const ts = Date.now();
const email = `test_${ts}@example.com`;

(async () => {
  // Test 1: Successful registration - show FULL response
  console.log('=== TEST 1: Full register response ===');
  const r1 = await makeReq('/api/Auth/register', 'POST', {
    username: 'user_' + ts,
    email,
    firstName: 'Test',
    lastName: 'User',
    password: 'Password123!'
  });
  console.log('Status:', r1.status);
  console.log('FULL BODY:', r1.body);
  try {
    const parsed = JSON.parse(r1.body);
    console.log('Parsed keys:', Object.keys(parsed));
    console.log('token type:', typeof parsed.token);
    console.log('token value:', parsed.token ? parsed.token.substring(0, 50) + '...' : 'MISSING');
  } catch(e) {
    console.log('JSON parse failed:', e.message);
  }

  // Test 2: Duplicate email registration - see exact error format
  console.log('\n=== TEST 2: Duplicate email error format ===');
  const r2 = await makeReq('/api/Auth/register', 'POST', {
    username: 'user_dup',
    email, // same email - should fail
    firstName: 'Test',
    lastName: 'User',
    password: 'Password123!'
  });
  console.log('Status:', r2.status);
  console.log('FULL ERROR BODY:', r2.body);
  try {
    const parsed = JSON.parse(r2.body);
    console.log('Error keys:', Object.keys(parsed));
    console.log('error field type:', typeof parsed.error);
    console.log('message field type:', typeof parsed.message);
    if (parsed.errors) {
      console.log('errors field type:', typeof parsed.errors, Array.isArray(parsed.errors) ? '(array)' : '(object)');
      console.log('errors value:', JSON.stringify(parsed.errors));
    }
  } catch(e) {
    console.log('JSON parse failed:', e.message);
  }

  // Test 3: Wrong password format
  console.log('\n=== TEST 3: Weak password error format ===');
  const r3 = await makeReq('/api/Auth/register', 'POST', {
    username: 'user_weak',
    email: `weak_${ts}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    password: '123'
  });
  console.log('Status:', r3.status);
  console.log('FULL ERROR BODY:', r3.body);
})();
