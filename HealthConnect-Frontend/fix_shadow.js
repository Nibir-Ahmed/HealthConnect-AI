const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let lines = content.split('\n');
      let modified = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('shadowColor:')) {
          lines[i] = lines[i].replace(/shadowColor:\s*[^,]+,/, "boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',");
          modified = true;
        }
        if (lines[i].includes('shadowOffset:') || lines[i].includes('shadowOpacity:') || lines[i].includes('shadowRadius:')) {
          lines[i] = ''; // remove line
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, lines.filter(line => line !== '').join('\n'));
        console.log('Fixed shadow:', fullPath);
      }
    }
  }
}

processDir(srcDir);
console.log('Done!');
