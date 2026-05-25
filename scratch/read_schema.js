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
  const url = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/swagger/v1/swagger.json';
  try {
    const res = await getUrl(url);
    const swagger = JSON.parse(res.data);
    
    console.log('--- Paths: Onboarding ---');
    ['/api/Onboarding/questions', '/api/Onboarding/status', '/api/Onboarding/submit', '/api/Onboarding/reset'].forEach(p => {
      console.log(`Path: ${p}`);
      console.log(JSON.stringify(swagger.paths[p], null, 2));
    });
    
    console.log('--- Components Schemas ---');
    console.log(JSON.stringify(swagger.components?.schemas || {}, null, 2));
  } catch (e) {
    console.error('Error fetching/parsing Swagger:', e.message);
  }
}

main().catch(console.error);
