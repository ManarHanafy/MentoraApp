const http = require('http');
const https = require('https');

function probe(url, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : '';
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': 'Bearer test-token'
      }
    };

    const req = client.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });

    req.on('error', (e) => {
      resolve({ url, error: e.message });
    });

    if (body) {
      req.write(data);
    }
    req.end();
  });
}

async function run() {
  const targets = [
    { url: 'http://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api/Users', method: 'POST', body: { username: 'test', email: 'test@test.com', firstName: 'Test', lastName: 'User', password: 'Password123' } },
    { url: 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api/Users', method: 'POST', body: { username: 'test', email: 'test@test.com', firstName: 'Test', lastName: 'User', password: 'Password123' } },
    { url: 'http://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api/Auth/login', method: 'POST', body: { email: 't@t.com', password: 'password' } },
    { url: 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api/Auth/login', method: 'POST', body: { email: 't@t.com', password: 'password' } }
  ];

  for (const t of targets) {
    const res = await probe(t.url, t.method, t.body);
    console.log(`URL: ${t.method} ${t.url}`);
    if (res.error) {
      console.log(`ERROR: ${res.error}`);
    } else {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`BODY: ${res.body}`);
    }
    console.log('--------------------------------------');
  }
}

run();
