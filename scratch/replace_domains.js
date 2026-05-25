const fs = require('fs');
const path = require('path');

const OLD_DOMAINS = [
  '0f6b921e-a2c8-4c9d-859d-a3813100fe18-00-1p9nuv8tu87pt.riker.replit.dev',
  '0f6b921e-a2c8-4c9d-859d-a3813100fe18-00-1p9nuv8tu87pt.riker.replit.dev',
  '0f6b921e-a2c8-4c9d-859d-a3813100fe18-00-1p9nuv8tu87pt.riker.replit.dev'
];
const NEW_DOMAIN = '0f6b921e-a2c8-4c9d-859d-a3813100fe18-00-1p9nuv8tu87pt.riker.replit.dev';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== 'android' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

const rootDir = path.resolve(__dirname, '..');
walkDir(rootDir, (filePath) => {
  const ext = path.extname(filePath);
  const name = path.basename(filePath);
  if (['.js', '.ts', '.tsx', '.json', '.env'].includes(ext) || name === '.env') {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      OLD_DOMAINS.forEach(oldDomain => {
        if (content.includes(oldDomain)) {
          content = content.split(oldDomain).join(NEW_DOMAIN);
          changed = true;
        }
      });
      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    } catch (e) {
      console.error(`Failed to process ${filePath}:`, e.message);
    }
  }
});
console.log('Domain replacement finished!');
