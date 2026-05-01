const https = require('https');
https.get('https://5a5e554c-0a41-4ae8-a007-2c01e6a3e53a-00-2qsja5cwc15oo.picard.replit.dev/api/Exercises/1', (res) => {
  let d = '';
  res.on('data', c => d+=c);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log(d);
  });
});
