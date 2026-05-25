const https = require('https');

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function main() {
  const baseUrl = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080';
  
  // Try to find Swagger
  const swaggerPaths = [
    '/swagger/v1/swagger.json',
    '/swagger/index.html',
    '/api-docs'
  ];
  
  for (const path of swaggerPaths) {
    try {
      const res = await getUrl(baseUrl + path);
      console.log(`Path: ${path}, Status: ${res.status}`);
      if (res.status === 200 && path.endsWith('.json')) {
        const obj = JSON.parse(res.data);
        console.log('Available Paths:');
        Object.keys(obj.paths || {}).forEach(p => {
          console.log(`  ${p}: ${Object.keys(obj.paths[p]).join(', ')}`);
        });
        return;
      }
    } catch (e) {
      console.log(`Error checking ${path}:`, e.message);
    }
  }
}

main().catch(console.error);
