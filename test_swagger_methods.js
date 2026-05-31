const API_BASE_URL = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080';

async function inspectSwagger() {
  try {
    const res = await fetch(`${API_BASE_URL}/swagger/v1/swagger.json`);
    const data = await res.json();
    const targets = [
      '/api/Account',
      '/api/Users/me',
      '/api/Users/{id}',
      '/api/Users',
    ];
    for (const t of targets) {
      if (data.paths[t]) {
        console.log(`Path: ${t}`);
        console.log(`Methods:`, Object.keys(data.paths[t]));
      } else {
        console.log(`Path ${t} not found in swagger`);
      }
    }
  } catch (e) {
    console.error('Error inspecting swagger:', e.message);
  }
}

inspectSwagger();
