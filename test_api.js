const https = require('https');

const data = JSON.stringify({
  content: 'I am feeling very stressed today about work'
});

const options = {
  hostname: '7a062fd9-ca89-4384-9cc3-2d5708ee1ab9-00-1mhj59pmn7qzz.janeway.replit.dev',
  port: 443,
  path: '/api/Journals',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log('BODY===');
    console.log(body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
