const fs = require('fs');
const path = require('path');

console.log('Replacing index.html with captured navigation...\n');

// Read the entire captured navigation HTML file
const capturedPath = path.join(__dirname, 'output/captured/full-navigation-capture.html');
const capturedHtml = fs.readFileSync(capturedPath, 'utf8');

console.log(`✓ Read captured file: ${capturedHtml.length} characters`);

// Create a clean wrapper HTML that includes the full captured content
const wrappedHtml = `<!DOCTYPE html>
<html lang="en">
${capturedHtml.substring(capturedHtml.indexOf('<head>'), capturedHtml.indexOf('</html>'))}
</html>`;

// Write to index.html
const indexPath = path.join(__dirname, '../Files/index.html');
fs.writeFileSync(indexPath, wrappedHtml, 'utf8');

console.log(`✓ Wrote to index.html: ${wrappedHtml.length} characters`);
console.log('\n✅ Successfully replaced index.html with captured navigation!');

