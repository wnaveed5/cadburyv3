const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

/**
 * Extract navigation (HTML + CSS + JS) from full-navigation-capture.html
 * and insert it into index.html where the red box is
 */

console.log('🚀 Starting navigation insertion...\n');

// Paths
const capturedPath = path.join(__dirname, 'output', 'captured', 'full-navigation-capture.html');
const indexPath = path.join(__dirname, '..', 'Files', 'index.html');

// Read files
console.log('📖 Reading files...');
const capturedHTML = fs.readFileSync(capturedPath, 'utf8');
const indexHTML = fs.readFileSync(indexPath, 'utf8');

console.log(`   ✓ Captured file: ${(capturedHTML.length / 1024).toFixed(2)} KB`);
console.log(`   ✓ Index file: ${(indexHTML.length / 1024).toFixed(2)} KB\n`);

// Parse the captured HTML to extract components
console.log('🔍 Extracting navigation components from captured file...');
const $ = cheerio.load(capturedHTML);

// Extract all style tags
const styles = [];
$('style').each((i, elem) => {
    const styleContent = $(elem).html();
    if (styleContent && styleContent.trim()) {
        styles.push(styleContent);
    }
});

// Extract all script tags
const scripts = [];
$('script').each((i, elem) => {
    const scriptContent = $(elem).html();
    if (scriptContent && scriptContent.trim()) {
        scripts.push(scriptContent);
    }
});

// Extract the navigation div
const navDiv = $('div[data-header-section="navigation"]');
const navHTML = navDiv.length > 0 ? $.html(navDiv) : '';

console.log(`   ✓ Extracted ${styles.length} style blocks`);
console.log(`   ✓ Extracted ${scripts.length} script blocks`);
console.log(`   ✓ Extracted navigation HTML: ${(navHTML.length / 1024).toFixed(2)} KB\n`);

if (!navHTML) {
    console.error('❌ Could not find navigation div in captured file!');
    process.exit(1);
}

// Find the red box in index.html
console.log('🔍 Finding red box in index.html...');
const redBox = '<div style="background-color: red; height: 50px; width: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">NAVIGATION REPLACED WITH RED BOX</div>';
const redBoxIndex = indexHTML.indexOf(redBox);

if (redBoxIndex === -1) {
    console.error('❌ Could not find red box in index.html!');
    console.log('Searching for alternative red box formats...');
    
    if (indexHTML.includes('background-color: red')) {
        console.log('   ✓ Found "background-color: red" - but exact match failed');
    }
    if (indexHTML.includes('RED BOX')) {
        console.log('   ✓ Found "RED BOX" text');
    }
    
    process.exit(1);
}

console.log(`   ✓ Found red box at position ${redBoxIndex}\n`);

// Create backup
const backupPath = indexPath + '.backup-final';
fs.writeFileSync(backupPath, indexHTML, 'utf8');
console.log(`💾 Backup saved: ${backupPath}\n`);

// Build the replacement content (styles + nav + scripts)
console.log('🔧 Building replacement content...');

const replacement = `
<!-- ========== CAPTURED NAVIGATION START ========== -->

<!-- Navigation Styles -->
${styles.map((style, i) => `<style data-nav-style="${i}">
${style}
</style>`).join('\n')}

<!-- Navigation HTML -->
${navHTML}

<!-- Navigation Scripts -->
${scripts.map((script, i) => `<script data-nav-script="${i}">
${script}
</script>`).join('\n')}

<!-- ========== CAPTURED NAVIGATION END ========== -->
`;

// Replace red box with navigation
const redBoxEndIndex = redBoxIndex + redBox.length;
const newIndexHTML = indexHTML.substring(0, redBoxIndex) + 
                    replacement + 
                    indexHTML.substring(redBoxEndIndex);

// Save the new index.html
fs.writeFileSync(indexPath, newIndexHTML, 'utf8');

console.log('✅ Navigation inserted successfully!\n');

console.log('📊 Summary:');
console.log(`   - Removed: ${redBox.length} characters (red box)`);
console.log(`   - Added: ${replacement.length} characters (navigation)`);
console.log(`   - Style blocks: ${styles.length}`);
console.log(`   - Script blocks: ${scripts.length}`);
console.log(`   - Original file: ${(indexHTML.length / 1024).toFixed(2)} KB`);
console.log(`   - New file: ${(newIndexHTML.length / 1024).toFixed(2)} KB`);
console.log(`   - Change: +${((newIndexHTML.length - indexHTML.length) / 1024).toFixed(2)} KB\n`);

console.log('✨ Done! Open index.html in a browser to see the navigation.\n');

