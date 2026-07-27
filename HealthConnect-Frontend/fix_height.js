const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'screens');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const regex = /<View style=\{\{\s*height:\s*windowHeight\s*-\s*\d+\s*\}\}>/g;
      if (regex.test(content)) {
        content = content.replace(regex, '<View style={{ flex: 1 }}>');
        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', fullPath);
      }
    }
  }
}

processDir(srcDir);
console.log('Done!');
