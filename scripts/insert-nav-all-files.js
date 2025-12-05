const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

/**
 * Insert navigation bar into ALL HTML files in the Files directory
 */

console.log('🚀 Inserting navigation into all HTML files...\n');

// Paths
const capturedPath = path.join(__dirname, 'output', 'captured', 'full-navigation-capture.html');
const filesDir = path.join(__dirname, '..', 'Files');

// Read captured navigation file
console.log('📖 Reading captured navigation...');
const capturedHTML = fs.readFileSync(capturedPath, 'utf8');
const $ = cheerio.load(capturedHTML);

// Extract navigation components
const navDiv = $('div[data-header-section="navigation"]');
const navHTML = $.html(navDiv).trim();

const navStyles = [];
$('style').each((i, elem) => {
    const styleContent = $(elem).html();
    if (styleContent && styleContent.trim()) {
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

const navScripts = [];
$('script').each((i, elem) => {
    const scriptContent = $(elem).html();
    if (scriptContent && scriptContent.trim()) {
        if (scriptContent.includes('menu') || 
            scriptContent.includes('dropdown') ||
            scriptContent.includes('navigation')) {
            navScripts.push(scriptContent);
        }
    }
});

console.log(`   ✓ Navigation: ${(navHTML.length / 1024).toFixed(2)} KB`);
console.log(`   ✓ Styles: ${navStyles.length} blocks`);
console.log(`   ✓ Scripts: ${navScripts.length} blocks\n`);

// Build the navigation replacement
const navigationReplacement = `<!-- Navigation Styles -->
${navStyles.map(style => `<style>${style}</style>`).join('\n')}

<!-- Navigation Bar -->
${navHTML}

<!-- Navigation Scripts -->
${navScripts.map(script => `<script>${script}</script>`).join('\n')}`;

// Get all HTML files in the Files directory
console.log('📂 Finding HTML files in Files directory...');
const htmlFiles = fs.readdirSync(filesDir).filter(file => file.endsWith('.html'));

console.log(`   ✓ Found ${htmlFiles.length} HTML files\n`);
htmlFiles.forEach(file => console.log(`      - ${file}`));
console.log();

// Process each file
let successCount = 0;
let skippedCount = 0;

for (const filename of htmlFiles) {
    const filePath = path.join(filesDir, filename);
    console.log(`📄 Processing: ${filename}`);
    
    try {
        // Read the file
        let fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Check if navigation already exists
        const hasExistingNav = fileContent.includes('data-header-section="navigation"') || 
                               fileContent.includes('data-header-section=navigation');
        
        if (hasExistingNav) {
            console.log('   🔄 Replacing existing navigation...');
            
            // Find and replace existing navigation
            // Try minified version first
            let navStartMarker = '<div data-header-section=navigation';
            let navStartIndex = fileContent.indexOf(navStartMarker);
            
            // Try quoted version
            if (navStartIndex === -1) {
                navStartMarker = '<div data-header-section="navigation"';
                navStartIndex = fileContent.indexOf(navStartMarker);
            }
            
            if (navStartIndex === -1) {
                console.log('   ⚠️  Could not find navigation start marker');
                skippedCount++;
                continue;
            }
            
            // Find the end of the navigation div
            let depth = 0;
            let navEndIndex = navStartIndex;
            let foundStart = false;
            
            for (let i = navStartIndex; i < fileContent.length; i++) {
                if (fileContent.substring(i, i + 4) === '<div') {
                    depth++;
                    foundStart = true;
                } else if (fileContent.substring(i, i + 6) === '</div>') {
                    depth--;
                    if (foundStart && depth === 0) {
                        navEndIndex = i + 6;
                        break;
                    }
                }
            }
            
            // Replace old navigation with new one
            fileContent = fileContent.substring(0, navStartIndex) + 
                         navigationReplacement + 
                         fileContent.substring(navEndIndex);
            
            console.log('   ✓ Replaced existing navigation');
            
        } else {
            console.log('   ➕ No navigation found, looking for insertion point...');
            
            // Look for common insertion points
            let insertIndex = -1;
            
            // Try to find the header or body tag
            const bodyIndex = fileContent.indexOf('<body');
            if (bodyIndex !== -1) {
                // Find the end of the body tag
                const bodyEndIndex = fileContent.indexOf('>', bodyIndex);
                if (bodyEndIndex !== -1) {
                    insertIndex = bodyEndIndex + 1;
                    console.log('   ✓ Will insert after <body> tag');
                }
            }
            
            if (insertIndex === -1) {
                console.log('   ⚠️  Could not find suitable insertion point');
                skippedCount++;
                continue;
            }
            
            // Insert navigation
            fileContent = fileContent.substring(0, insertIndex) + 
                         '\n' + navigationReplacement + '\n' +
                         fileContent.substring(insertIndex);
            
            console.log('   ✓ Inserted new navigation');
        }
        
        // Create backup
        const backupPath = filePath + '.backup-nav';
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(filePath, backupPath);
            console.log(`   💾 Backup: ${filename}.backup-nav`);
        }
        
        // Save the modified file
        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log(`   ✅ Saved: ${filename}\n`);
        successCount++;
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        skippedCount++;
    }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Summary:');
console.log(`   ✓ Successful: ${successCount} files`);
console.log(`   ⚠️  Skipped: ${skippedCount} files`);
console.log(`   📁 Total: ${htmlFiles.length} files`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✨ Done! Navigation has been inserted into all HTML files.\n');

