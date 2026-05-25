const https = require('https');

const payload = JSON.stringify({
  service_id: 'service_ihgc31d',
  template_id: 'template_782w2xh',
  user_id: 'pelNhgC_kHNRPMdcx',
  accessToken: 'auZI9JdImYOVrqieGkY_i',
  template_params: {
    to_email: 'test@example.com',
    email: 'test@example.com',
    to_name: 'Mentora Test',
    name: 'Mentora Test',
    code: '5678',
    otp: '5678',
    message: 'Your Mentora verification code is: 5678'
  }
});

const options = {
  hostname: 'api.emailjs.com',
  path: '/api/v1.0/email/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(payload);
req.end();
