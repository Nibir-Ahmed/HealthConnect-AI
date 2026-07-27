const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('/Users/mdnibirahmed/Desktop/HealthConnect/HealthConnect-Frontend/src');

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for a literal dot outside of a <Text> component
    // A primitive heuristic: check if there's a dot immediately followed by a closing tag, 
    // or a dot surrounded by whitespaces and tags.
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.match(/>\s*\.\s*</) || line.match(/}\s*\.\s*</) || line.match(/>\s*\.\s*{/)) {
            console.log(`FOUND in ${file}:${i+1}: ${line}`);
        }
    });
});
console.log('Done scanning.');
