const https = require('https');
const url = require('url');

const API_BASE_URL = 'https://a41eb64e-0d86-48e0-aa43-4d51441fa3ce-00-3cz45r2891wll.worf.replit.dev/api';

function apiRequest(path, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(API_BASE_URL + path);
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.path,
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
    const ts = Date.now();
    const email = `testuser_${ts}@example.com`;
    const password = 'Password123!';

    console.log('--- Registering... ---');
    const regRes = await apiRequest('/Auth/register', 'POST', {
      username: `user_${ts}`,
      email,
      firstName: 'Test',
      lastName: 'User',
      password
    });
    console.log('Register status:', regRes.statusCode);

    console.log('--- Logging in... ---');
    const loginRes = await apiRequest('/Auth/login', 'POST', {
      email,
      password
    });
    console.log('Login status:', loginRes.statusCode);
    const loginData = JSON.parse(loginRes.body);
    const token = loginData.token;

    console.log('--- Creating Journal with title and content ---');
    // The requirement is that we must ensure title and content are stored separately.
    // Let's test if the backend parses it, or how we should store it.
    // In Task 2: "Journal content sometimes appears inside the title field. Journal title sometimes becomes 'Mentora Journal'. Prevent duplicate entries. Ensure title and content are stored separately."
    // Let's see what happens if we post: journal_text: "My Custom Title\nThis is my content."
    const postRes = await apiRequest('/Journals', 'POST', {
      journal_text: 'My Custom Title\nThis is my content.'
    }, token);
    console.log('Post status:', postRes.statusCode);
    console.log('Post response:', postRes.body);

    console.log('--- Listing Journals ---');
    const listRes = await apiRequest('/Journals', 'GET', null, token);
    console.log('List status:', listRes.statusCode);
    console.log('List response:', listRes.body);

    const listData = JSON.parse(listRes.body);
    const items = listData.items || listData || [];
    if (items.length > 0) {
      const journalId = items[0].id;
      console.log(`--- Fetching detail for ID: ${journalId} ---`);
      const detailRes = await apiRequest(`/Journals/${journalId}`, 'GET', null, token);
      console.log('Detail status:', detailRes.statusCode);
      console.log('Detail response:', detailRes.body);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
