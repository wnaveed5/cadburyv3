const fs = require('fs');
const path = require('path');

/**
 * Remove inline navigation styles and link to external CSS file
 */

console.log('🎨 Externalizing navigation CSS...\n');

const filesDir = path.join(__dirname, '..', 'Files');
const htmlFiles = fs.readdirSync(filesDir).filter(file => file.endsWith('.html') && !file.includes('.backup'));

const cssLink = '<link rel="stylesheet" href="navigation.css">';

let successCount = 0;

console.log(`📁 Processing ${htmlFiles.length} files...\n`);

for (const filename of htmlFiles) {
    const filePath = path.join(filesDir, filename);
    console.log(`📄 ${filename}`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // Remove inline enhanced nav styles
        if (content.includes('id="enhanced-nav-styles"')) {
            console.log('   🗑️  Removing inline styles...');
            
            const styleStart = content.indexOf('<style id="enhanced-nav-styles">');
            const styleEnd = content.indexOf('</style>', styleStart) + 8;
            
            if (styleStart !== -1 && styleEnd > styleStart) {
                content = content.substring(0, styleStart) + content.substring(styleEnd);
                changed = true;
                console.log('   ✅ Inline styles removed');
            }
        }
        
        // Add external CSS link if not already present
        if (!content.includes('navigation.css')) {
            console.log('   🔗 Adding external CSS link...');
            
            // Find </head> tag
            const headEndIndex = content.indexOf('</head>');
            if (headEndIndex !== -1) {
                content = content.substring(0, headEndIndex) + 
                         '    ' + cssLink + '\n' +
                         content.substring(headEndIndex);
                changed = true;
                console.log('   ✅ External CSS link added');
            } else {
                console.log('   ⚠️  Could not find </head> tag');
            }
        } else {
            console.log('   ℹ️  External CSS link already present');
        }
        
        // Save the file
        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('   💾 File updated\n');
            successCount++;
        } else {
            console.log('   ⏭️  No changes needed\n');
        }
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Summary:');
console.log(`   ✓ Updated: ${successCount} files`);
console.log(`   📁 Total: ${htmlFiles.length} files`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✨ Done! Navigation CSS externalized to Files/navigation.css');
console.log('   Now you can edit navigation.css in one place!\n');

