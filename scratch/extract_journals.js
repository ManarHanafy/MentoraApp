const fs = require('fs');
let content = fs.readFileSync('swagger.json', 'utf16le');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}
const data = JSON.parse(content);
const paths = data.paths;
for (const path in paths) {
  if (path.toLowerCase().includes('journal')) {
    console.log('Path:', path);
    console.log(JSON.stringify(paths[path], null, 2));
  }
}
const schemas = data.components.schemas;
for (const schema in schemas) {
  if (schema.toLowerCase().includes('journal')) {
    console.log('Schema:', schema);
    console.log(JSON.stringify(schemas[schema], null, 2));
  }
}
