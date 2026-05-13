const https = require('https');
https.get('https://8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev/api/Exercises/1', (res) => {
  let d = '';
  res.on('data', c => d+=c);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log(d);
  });
});
