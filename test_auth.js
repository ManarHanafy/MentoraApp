const https = require('https');

function makeReq(path, method, bodyObj) {
  return new Promise((resolve) => {
    const data = bodyObj ? JSON.stringify(bodyObj) : '';
    const options = {
      hostname: '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    if (bodyObj) req.write(data);
    req.end();
  });
}

(async () => {
  console.log("Registering...");
  const regRes = await makeReq('/api/Users/register', 'POST', {
    email: "testapp@test.com", password: "Password123!", firstName: "Test", lastName: "App"
  });
  console.log(regRes);

  console.log("Logging in...");
  const loginRes = await makeReq('/api/Users/login', 'POST', {
    email: "testapp@test.com", password: "Password123!"
  });
  console.log(loginRes);
})();
