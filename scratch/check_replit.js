const https = require('https');

const API = '7369b2b3-b4e3-44fb-8094-7d778a784912-00-3agg2ahjt7nnk.spock.replit.dev';

function checkHealth() {
  const options = {
    hostname: API,
    port: 443,
    path: '/api/crisis/resources',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  
  const req = https.request(options, (res) => {
    console.log('STATUS:', res.statusCode);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('BODY:', body);
    });
  });
  
  req.on('error', (e) => {
    console.error('ERROR:', e);
  });
  
  req.end();
}

checkHealth();
