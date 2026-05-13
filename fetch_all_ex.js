const https = require('https');

const loginData = JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' });

const loginReq = https.request({
  hostname: '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev',
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
      hostname: '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev',
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
