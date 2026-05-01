const https = require('https');

const loginData = JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' });

const loginReq = https.request({
  hostname: '5a5e554c-0a41-4ae8-a007-2c01e6a3e53a-00-2qsja5cwc15oo.picard.replit.dev',
  path: '/api/Auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, res => {
  let b = '';
  res.on('data', chunk => b += chunk);
  res.on('end', () => {
    const data = JSON.parse(b);
    const token = data.token;
    
    if (!token) {
      console.log('No token', data);
      return;
    }

    const exReq = https.request({
      hostname: '5a5e554c-0a41-4ae8-a007-2c01e6a3e53a-00-2qsja5cwc15oo.picard.replit.dev',
      path: '/api/Exercises',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, exRes => {
      let eb = '';
      exRes.on('data', chunk => eb += chunk);
      exRes.on('end', () => {
        console.log("STATUS:", exRes.statusCode);
        console.log("BODY:", eb);
      });
    });
    exReq.end();
  });
});
loginReq.write(loginData);
loginReq.end();
