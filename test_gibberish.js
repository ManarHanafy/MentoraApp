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
    
    if (!token) return;

    const jData = JSON.stringify({ journal_text: "asdflkajsdhf alksdfh asdf lkasjdf asdf" });
    const jReq = https.request({
      hostname: '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev',
      path: '/api/Journals',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': jData.length
      }
    }, jRes => {
      let jb = '';
      jRes.on('data', chunk => jb += chunk);
      jRes.on('end', () => {
        console.log("STATUS:", jRes.statusCode);
        console.log("RESPONSE:", jb);
      });
    });
    jReq.write(jData);
    jReq.end();
  });
});
loginReq.write(loginData);
loginReq.end();
