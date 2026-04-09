const https = require('https');
https.get('https://7a062fd9-ca89-4384-9cc3-2d5708ee1ab9-00-1mhj59pmn7qzz.janeway.replit.dev/swagger/v1/swagger.json', (res) => {
  let d = '';
  res.on('data', c => d+=c);
  res.on('end', () => {
    try {
      const j = JSON.parse(d);
      console.log("PATHS:");
      console.log(Object.keys(j.paths));
    } catch(e) { console.log(e); }
  });
});
