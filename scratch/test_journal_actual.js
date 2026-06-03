const https = require('https');

function request(path, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev',
      port: 8080,
      path: '/api' + path,
      method: method,
      rejectUnauthorized: false,
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

async function test() {
  try {
    const ts = Date.now();
    const email = `testuser${ts}@mentora.io`;
    const password = 'Mentora123!';
    
    console.log('Registering user:', email);
    const regRes = await request('/Auth/register', 'POST', {
      username: `user${ts}`,
      email,
      firstName: 'Test',
      lastName: 'User',
      password
    });
    console.log('Register status:', regRes.statusCode);
    if (regRes.statusCode !== 200 && regRes.statusCode !== 201) {
      console.log('Register response:', regRes.body);
      return;
    }

    console.log('Logging in...');
    const loginRes = await request('/Auth/login', 'POST', {
      email: email,
      password: password
    });
    
    if (loginRes.statusCode !== 200) {
      console.error('Login failed:', loginRes.statusCode, loginRes.body);
      return;
    }
    
    const loginData = JSON.parse(loginRes.body);
    const token = loginData.token;
    console.log('Login OK, token obtained.');

    console.log('Submitting normal journal...');
    const normRes = await request('/Journals', 'POST', {
      journal_text: 'I feel very happy today because I did some exercise and finished my work.'
    }, token);
    console.log('Normal Journal Status:', normRes.statusCode);
    console.log('=== NORMAL JOURNAL RESPONSE ===');
    console.log(normRes.body);

    console.log('\nSubmitting crisis journal...');
    const crisisRes = await request('/Journals', 'POST', {
      journal_text: 'I want to end my life. I have no hope left.'
    }, token);

    console.log('Crisis Journal Status:', crisisRes.statusCode);
    console.log('=== CRISIS JOURNAL RESPONSE ===');
    console.log(crisisRes.body);
  } catch (err) {
    console.error(err);
  }
}

test();
