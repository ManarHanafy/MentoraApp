const https = require('https');
const d = JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' });

const req = https.request({
  hostname: '7a062fd9-ca89-4384-9cc3-2d5708ee1ab9-00-1mhj59pmn7qzz.janeway.replit.dev',
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
