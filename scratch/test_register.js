const https = require('https');

function probe(path, method = 'POST', body = null) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve({
          path,
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });

    req.on('error', (e) => {
      resolve({ path, error: e.message });
    });

    if (body) {
      req.write(data);
    }
    req.end();
  });
}

async function run() {
  const payload = {
    username: 'testuser_' + Math.floor(Math.random() * 100000),
    email: 'test_' + Math.floor(Math.random() * 100000) + '@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'Password123!'
  };

  console.log('Sending payload:', JSON.stringify(payload));

  const res1 = await probe('/api/Users', 'POST', payload);
  console.log(`PATH: POST /api/Users`);
  console.log(`STATUS: ${res1.statusCode}`);
  console.log(`BODY: ${res1.body}`);
  console.log('--------------------------------------');

  const res2 = await probe('/api/Auth/register', 'POST', payload);
  console.log(`PATH: POST /api/Auth/register`);
  console.log(`STATUS: ${res2.statusCode}`);
  console.log(`BODY: ${res2.body}`);
  console.log('--------------------------------------');
}

run();
