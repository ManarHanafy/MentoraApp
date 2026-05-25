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
  const url = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api/Onboarding/questions';
  try {
    const res = await getUrl(url);
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(JSON.parse(res.data), null, 2));
  } catch (e) {
    console.error('Error fetching questions:', e.message);
  }
}

main().catch(console.error);
