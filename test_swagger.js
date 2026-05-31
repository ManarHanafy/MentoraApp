const API_BASE_URL = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080';

async function checkSwagger() {
  const paths = [
    '/swagger/v1/swagger.json',
    '/swagger/swagger.json',
    '/api/swagger/v1/swagger.json',
    '/api/swagger.json',
    '/swagger.json',
  ];

  for (const p of paths) {
    try {
      console.log(`Checking ${p}...`);
      const res = await fetch(`${API_BASE_URL}${p}`);
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`FOUND SWAGGER! Paths in API:`);
        console.log(Object.keys(data.paths || {}));
        return;
      }
    } catch (e) {
      console.log(`Error checking ${p}:`, e.message);
    }
  }
  console.log('No swagger schema found.');
}

checkSwagger();
