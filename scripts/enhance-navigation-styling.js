const fs = require('fs');
const path = require('path');

/**
 * Add enhanced styling to the navigation bar in all HTML files
 * - Better spacing
 * - Fix three dots menu
 * - Improve overall appearance
 */

console.log('🎨 Enhancing navigation styling...\n');

const filesDir = path.join(__dirname, '..', 'Files');
const htmlFiles = fs.readdirSync(filesDir).filter(file => file.endsWith('.html') && !file.includes('.backup'));

const enhancedStyles = `
<style id="enhanced-nav-styles">
/* Enhanced Navigation Styling - Compact & Centered */

/* Compact navigation bar with proper height */
div[data-header-section="navigation"] {
    height: 45px !important;
    min-height: 45px !important;
    max-height: 45px !important;
    margin-bottom: 20px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    padding: 0 24px !important;
    position: relative !important;
    z-index: 1000 !important;
    display: flex !important;
    align-items: center !important;
    overflow: visible !important;
}

/* Navigation inner container - center items */
div[data-header-section="navigation"] > div {
    height: 45px !important;
    min-height: 45px !important;
    max-height: 45px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
}

/* Menu groups - vertically centered */
div[data-header-section="navigation"] [role="group"] {
    display: flex !important;
    align-items: center !important;
    height: 45px !important;
    gap: 0px !important;
}

/* Menu items - compact and centered */
div[data-header-section="navigation"] [role="menuitem"] {
    padding: 0 8px !important;
    margin: 0 !important;
    height: 45px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: background-color 0.2s ease !important;
    vertical-align: middle !important;
}

/* Icons inside menu items - centered */
div[data-header-section="navigation"] [role="menuitem"] svg {
    display: block !important;
    margin: 0 !important;
    vertical-align: middle !important;
}

/* Text/labels inside menu items - centered */
div[data-header-section="navigation"] [role="menuitem"] span,
div[data-header-section="navigation"] [role="menuitem"] a,
div[data-header-section="navigation"] [role="menuitem"] button {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    vertical-align: middle !important;
    line-height: 45px !important;
    padding: 0 !important;
    margin: 0 !important;
}

/* Remove extra spacing from text elements */
div[data-header-section="navigation"] [data-widget="Text"] {
    padding: 0 !important;
    margin: 0 !important;
}

/* Link elements - centered */
div[data-header-section="navigation"] a {
    display: inline-flex !important;
    align-items: center !important;
    height: 100% !important;
    padding: 0 !important;
}

/* Menu item content wrapper - centered */
div[data-header-section="navigation"] [data-widget="MenuItemContent"] {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100% !important;
    padding: 0 !important;
}

/* Hover effects - minimal padding */
div[data-header-section="navigation"] [role="menuitem"]:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    border-radius: 3px !important;
}

/* Remove any extra padding on highlighted/active items */
div[data-header-section="navigation"] [role="menuitem"][data-highlighted="true"],
div[data-header-section="navigation"] [role="menuitem"][aria-selected="true"] {
    background-color: rgba(255, 255, 255, 0.15) !important;
    border-radius: 3px !important;
    padding: 0 8px !important;
}

/* Make sure the three dots menu is visible and centered */
div[data-header-section="navigation"] .uif1137,
div[data-header-section="navigation"] [role="menuitem"]:last-child {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    visibility: visible !important;
    opacity: 1 !important;
    height: 45px !important;
}

/* Three dots icon - visible and centered */
div[data-header-section="navigation"] svg[data-icon*="OVERFLOW"],
div[data-header-section="navigation"] [role="menuitem"]:last-child svg {
    display: block !important;
    visibility: visible !important;
    margin: auto !important;
}

/* Dropdown menu styling */
[role="menu"] {
    background: white !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    padding: 8px 0 !important;
    min-width: 200px !important;
    margin-top: 2px !important;
    text-align: left !important;
}

/* Dropdown menu items - left aligned */
[role="menu"] [role="menuitem"] {
    padding: 10px 20px !important;
    height: auto !important;
    transition: background-color 0.15s ease !important;
    text-align: left !important;
    justify-content: flex-start !important;
    display: flex !important;
    align-items: center !important;
}

/* Dropdown text alignment - keep left but don't force block display yet */
[role="menu"] [role="menuitem"] {
    text-align: left !important;
}

/* Main dropdown content - flex layout with left alignment */
[role="menu"] > [role="menuitem"] > * {
    text-align: left !important;
    justify-content: flex-start !important;
}

/* Override any center alignment */
[role="menu"] *[style*="text-align: center"],
[role="menu"] *[style*="justify-content: center"] {
    text-align: left !important;
    justify-content: flex-start !important;
}

[role="menu"] [role="menuitem"]:hover {
    background-color: #f5f5f5 !important;
}

/* Submenu positioning - left aligned */
[role="menu"] [role="menu"] {
    margin-left: 8px !important;
    text-align: left !important;
}

/* Submenu items - left aligned */
[role="menu"] [role="menu"] [role="menuitem"] {
    text-align: left !important;
    justify-content: flex-start !important;
}

/* Target NetSuite specific widget classes in dropdowns */
[role="menu"] [data-widget="Link"],
[role="menu"] [data-widget="MenuItemContent"] {
    text-align: left !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
}

/* Main dropdown links - keep flex for proper layout */
[role="menu"] > [role="menuitem"] > a,
[role="menu"] > [role="menuitem"] > div {
    display: flex !important;
    align-items: center !important;
    text-align: left !important;
    justify-content: flex-start !important;
}

/* Text spans in main dropdowns - flex for proper alignment */
[role="menu"] > [role="menuitem"] span {
    display: inline-flex !important;
    align-items: center !important;
    text-align: left !important;
}

/* NESTED submenu text spans - BLOCK for left alignment */
.captured-nested-submenu span,
.captured-nested-submenu [data-widget="Text"],
[role="menu"] [role="menu"] span {
    display: block !important;
    text-align: left !important;
    width: 100% !important;
}

/* Nuclear option - override ALL centering */
div[role="menu"] *,
div[role="menu"] *[style],
div[role="menu"] * > *,
[role="menu"] [role="menuitem"] *,
[role="menu"] [role="menuitem"] > * {
    text-align: left !important;
}

/* Specifically target div containers in menus */
[role="menu"] div[data-widget],
[role="menu"] div[class*="uif"] {
    text-align: left !important;
    justify-content: flex-start !important;
}

/* Main dropdown text classes - inline-flex for proper layout */
[role="menu"] > [role="menuitem"] .uif1088,
[role="menu"] > [role="menuitem"] .uif1112,
[role="menu"] > [role="menuitem"] .uif1114,
[role="menu"] > [role="menuitem"] .uif1193 {
    text-align: left !important;
    display: inline-flex !important;
    align-items: center !important;
}

/* NESTED submenu text classes - BLOCK for left alignment */
[role="menu"] [role="menu"] .uif1088,
[role="menu"] [role="menu"] .uif1112,
[role="menu"] [role="menu"] .uif1114,
[role="menu"] [role="menu"] .uif1193,
.captured-nested-submenu .uif1088,
.captured-nested-submenu .uif1112,
.captured-nested-submenu .uif1114,
.captured-nested-submenu .uif1193 {
    text-align: left !important;
    display: block !important;
    width: 100% !important;
}

/* Container classes - flex with left alignment */
[role="menu"] .uif1184,
[role="menu"] .uif1186,
[role="menu"] .uif1189,
[role="menu"] .uif1195 {
    text-align: left !important;
    justify-content: flex-start !important;
}

/* Ultra-specific for nested submenus (3rd level+) */
.captured-nested-submenu [role="menu"] .uif1184.uif1186,
.captured-nested-submenu [role="menu"] .uif1088.uif1112 {
    text-align: left !important;
}

/* Force ALL divs and spans in nested submenus to left-align */
.captured-nested-submenu [role="menu"] div,
.captured-nested-submenu [role="menu"] span,
.captured-nested-submenu [role="menu"] a {
    text-align: left !important;
}

/* ABSOLUTE NUCLEAR option - ONLY for nested submenus */
[role="menu"] [role="menu"] *,
.captured-nested-submenu * {
    text-align: left !important;
    justify-content: flex-start !important;
}

/* Force the menu containers themselves */
div[role="menu"] {
    text-align: left !important;
}

/* Target uif TEXT classes in nested submenus only */
[role="menu"] [role="menu"] .uif1088,
[role="menu"] [role="menu"] .uif1112,
[role="menu"] [role="menu"] .uif1114,
[role="menu"] [role="menu"] .uif1193 {
    text-align: left !important;
    display: block !important;
    width: 100% !important;
}

/* Make dropdowns appear on hover */
div[data-header-section="navigation"] [role="menuitem"]:hover > [role="menu"],
div[data-header-section="navigation"] [role="menuitem"][aria-expanded="true"] > [role="menu"] {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}

/* Ensure proper spacing from page content */
body > div[data-header-section="navigation"] + * {
    margin-top: 20px !important;
}

/* Fix any layout issues */
div[data-header-section="navigation"] * {
    box-sizing: border-box !important;
}
</style>
`;

let successCount = 0;

console.log(`📁 Processing ${htmlFiles.length} files...\n`);

for (const filename of htmlFiles) {
    const filePath = path.join(filesDir, filename);
    console.log(`📄 ${filename}`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if enhanced styles already exist
        if (content.includes('id="enhanced-nav-styles"')) {
            console.log('   🔄 Updating existing enhanced styles...');
            
            // Remove old enhanced styles
            const styleStart = content.indexOf('<style id="enhanced-nav-styles">');
            const styleEnd = content.indexOf('</style>', styleStart) + 8;
            content = content.substring(0, styleStart) + content.substring(styleEnd);
        }
        
        // Find the navigation section
        const navIndex = content.indexOf('data-header-section="navigation"') || 
                        content.indexOf('data-header-section=navigation');
        
        if (navIndex === -1) {
            console.log('   ⚠️  Navigation not found\n');
            continue;
        }
        
        // Insert enhanced styles before the navigation
        // Find the start of the navigation div
        let insertPos = content.lastIndexOf('<', navIndex);
        
        content = content.substring(0, insertPos) + 
                 enhancedStyles + '\n' +
                 content.substring(insertPos);
        
        // Save the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('   ✅ Enhanced styling applied\n');
        successCount++;
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Summary:');
console.log(`   ✓ Enhanced: ${successCount} files`);
console.log(`   📁 Total: ${htmlFiles.length} files`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✨ Done! Navigation styling enhanced with:');
console.log('   ✓ Better spacing from content');
console.log('   ✓ Three dots overflow menu fixed');
console.log('   ✓ Improved hover effects');
console.log('   ✓ Better dropdown styling\n');

