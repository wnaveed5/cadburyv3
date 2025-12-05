const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

/**
 * Extract ONLY the navigation bar (no whitespace, no extra content)
 * and insert it into index.html
 */

console.log('🚀 Extracting ONLY the navigation bar...\n');

// Paths
const capturedPath = path.join(__dirname, 'output', 'captured', 'full-navigation-capture.html');
const indexPath = path.join(__dirname, '..', 'Files', 'index.html');

// Read files
console.log('📖 Reading files...');
const capturedHTML = fs.readFileSync(capturedPath, 'utf8');
const indexHTML = fs.readFileSync(indexPath, 'utf8');

// Parse the captured HTML
const $ = cheerio.load(capturedHTML);

console.log('🔍 Extracting navigation bar ONLY...\n');

// Get ONLY the navigation div - nothing else
const navDiv = $('div[data-header-section="navigation"]');

if (navDiv.length === 0) {
    console.error('❌ Could not find navigation div!');
    process.exit(1);
}

// Get just the navigation HTML - minimal extraction
const navHTML = $.html(navDiv).trim();

console.log(`📊 Navigation bar extracted:`);
console.log(`   - Size: ${(navHTML.length / 1024).toFixed(2)} KB`);
console.log(`   - Preview: ${navHTML.substring(0, 100)}...\n`);

// Extract ONLY navigation-related styles (filter out page styles)
console.log('🎨 Extracting navigation-related styles only...');
const navStyles = [];
$('style').each((i, elem) => {
    const styleContent = $(elem).html();
    if (styleContent && styleContent.trim()) {
        // Only include styles that are related to navigation
        if (styleContent.includes('data-header-section') || 
            styleContent.includes('navigation') ||
            styleContent.includes('MenuBar') ||
            styleContent.includes('MenuItem') ||
            styleContent.includes('dropdown') ||
            styleContent.includes('menu')) {
            navStyles.push(styleContent);
        }
    }
});

console.log(`   - Found ${navStyles.length} navigation-related style blocks\n`);

// Extract navigation scripts
console.log('⚙️  Extracting navigation scripts...');
const navScripts = [];
$('script').each((i, elem) => {
    const scriptContent = $(elem).html();
    if (scriptContent && scriptContent.trim()) {
        // Only include scripts that seem related to navigation/menus
        if (scriptContent.includes('menu') || 
            scriptContent.includes('dropdown') ||
            scriptContent.includes('navigation')) {
            navScripts.push(scriptContent);
        }
    }
});

console.log(`   - Found ${navScripts.length} navigation-related scripts\n`);

// Find red box
console.log('🔍 Finding red box in index.html...');
const redBox = '<div style="background-color: red; height: 50px; width: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">NAVIGATION REPLACED WITH RED BOX</div>';
const redBoxIndex = indexHTML.indexOf(redBox);

if (redBoxIndex === -1) {
    console.error('❌ Red box not found!');
    process.exit(1);
}

console.log(`   ✓ Found at position ${redBoxIndex}\n`);

// Create backup
const backupPath = indexPath + '.backup-nav-only';
fs.writeFileSync(backupPath, indexHTML, 'utf8');
console.log(`💾 Backup: ${backupPath}\n`);

// Build minimal replacement (styles + nav + scripts)
const replacement = `<!-- Navigation Styles -->
${navStyles.map(style => `<style>${style}</style>`).join('\n')}

<!-- Navigation Bar -->
${navHTML}

<!-- Navigation Scripts -->
${navScripts.map(script => `<script>${script}</script>`).join('\n')}`;

// Replace
const redBoxEndIndex = redBoxIndex + redBox.length;
const newIndexHTML = indexHTML.substring(0, redBoxIndex) + 
                    replacement + 
                    indexHTML.substring(redBoxEndIndex);

fs.writeFileSync(indexPath, newIndexHTML, 'utf8');

console.log('✅ Navigation bar inserted!\n');

console.log('📊 Summary:');
console.log(`   - Navigation HTML: ${(navHTML.length / 1024).toFixed(2)} KB`);
console.log(`   - Style blocks: ${navStyles.length}`);
console.log(`   - Script blocks: ${navScripts.length}`);
console.log(`   - Total added: ${(replacement.length / 1024).toFixed(2)} KB`);
console.log(`   - Old file: ${(indexHTML.length / 1024).toFixed(2)} KB`);
console.log(`   - New file: ${(newIndexHTML.length / 1024).toFixed(2)} KB\n`);

console.log('✨ Done! The navigation bar (without whitespace) is now in index.html\n');

