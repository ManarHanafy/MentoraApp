const https = require('https');
const d = JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' });

const req = https.request({
  hostname: '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev',
  path: '/api/Auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': d.length
  }
}, res => {
  let b = '';
  res.on('data', chunk => b+=chunk);
  res.on('end', () => require('fs').writeFileSync('reg_out.txt', Object.entries(res.headers).join('\n') + '\n\n' + b));
});
req.write(d);
req.end();
