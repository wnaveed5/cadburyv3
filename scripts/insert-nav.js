const fs = require('fs');
const path = require('path');

// Read the captured navigation HTML
const capturedHtmlPath = path.join(__dirname, 'output/captured/full-navigation-capture.html');
const capturedHtml = fs.readFileSync(capturedHtmlPath, 'utf8');

console.log('Extracting ALL components from full-navigation-capture.html...');

// Extract the styles from <head>
const styleStart = capturedHtml.indexOf('<style>');
const styleEnd = capturedHtml.indexOf('</style>') + '</style>'.length;

if (styleStart === -1 || styleEnd === -1) {
    console.error('Could not find style tags in captured HTML');
    process.exit(1);
}

const navigationStyles = capturedHtml.substring(styleStart, styleEnd);
console.log(`✓ Extracted navigation styles (${navigationStyles.length} characters)`);

// Extract everything between <body> and </body> including scripts
const bodyStart = capturedHtml.indexOf('<body');
const bodyTagEnd = capturedHtml.indexOf('>', bodyStart) + 1;
const bodyEnd = capturedHtml.indexOf('</body>');

if (bodyStart === -1 || bodyEnd === -1) {
    console.error('Could not find body tags in captured HTML');
    process.exit(1);
}

// Extract the entire body content (includes menu-wrapper div AND all scripts)
const bodyContent = capturedHtml.substring(bodyTagEnd, bodyEnd).trim();
console.log(`✓ Extracted body content with scripts (${bodyContent.length} characters)`);

// Separate the HTML from the scripts for better organization
const scriptStart = bodyContent.indexOf('<script>');
let navigationHtml, navigationScripts;

if (scriptStart !== -1) {
    navigationHtml = bodyContent.substring(0, scriptStart).trim();
    navigationScripts = bodyContent.substring(scriptStart).trim();
    console.log(`  - Navigation HTML: ${navigationHtml.length} characters`);
    console.log(`  - Navigation Scripts: ${navigationScripts.length} characters`);
} else {
    navigationHtml = bodyContent;
    navigationScripts = '';
    console.log(`  - No scripts found in body`);
}

// Read the index.html file
const indexHtmlPath = path.join(__dirname, '../Files/index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('\nProcessing index.html...');

// Find and remove old navigation styles if they exist
const oldStyleStart = indexHtml.indexOf('<!-- Navigation Styles -->');
if (oldStyleStart !== -1) {
    const oldStyleEnd = indexHtml.indexOf('</style>', oldStyleStart) + '</style>'.length;
    indexHtml = indexHtml.substring(0, oldStyleStart) + indexHtml.substring(oldStyleEnd);
    console.log('✓ Removed old navigation styles');
}

// Find the </head> tag to insert styles
const headEnd = indexHtml.indexOf('</head>');
if (headEnd === -1) {
    console.error('Could not find </head> tag in index.html');
    process.exit(1);
}

// Insert navigation styles before </head>
let updatedIndexHtml = indexHtml.substring(0, headEnd) + 
                       '\n<!-- Navigation Styles -->\n' + navigationStyles + '\n' + 
                       indexHtml.substring(headEnd);
console.log('✓ Inserted navigation styles in <head>');

// Find the navigation to replace - either placeholder or existing navigation
let navStart = updatedIndexHtml.indexOf('<div style="background-color: red;');
if (navStart === -1) {
    // Try to find existing navigation
    navStart = updatedIndexHtml.indexOf('<div class="menu-wrapper">');
    if (navStart === -1) {
        navStart = updatedIndexHtml.indexOf('data-header-section="navigation"');
        if (navStart !== -1) {
            // Go back to find the opening tag
            navStart = updatedIndexHtml.lastIndexOf('<div', navStart);
        }
    }
}

if (navStart === -1) {
    console.error('Could not find navigation placeholder or existing navigation in index.html');
    process.exit(1);
}

// Find the end of the navigation
let navEnd = navStart;
let depth = 0;
let inTag = false;
for (let i = navStart; i < updatedIndexHtml.length; i++) {
    if (updatedIndexHtml[i] === '<') {
        inTag = true;
        if (updatedIndexHtml.substring(i, i + 5) === '<div ') {
            depth++;
        } else if (updatedIndexHtml.substring(i, i + 6) === '</div>') {
            depth--;
            if (depth === 0) {
                navEnd = i + 6;
                break;
            }
        }
    } else if (updatedIndexHtml[i] === '>') {
        inTag = false;
        if (depth === 0) depth = 1; // First opening tag
    }
}

console.log(`✓ Found navigation to replace (${navEnd - navStart} characters)`);

// Find the </body> tag BEFORE replacing navigation (to avoid searching through it)
const indexBodyEnd = updatedIndexHtml.lastIndexOf('</body>');
if (indexBodyEnd === -1) {
    console.error('Could not find </body> tag in index.html');
    process.exit(1);
}

// Replace the navigation
updatedIndexHtml = updatedIndexHtml.substring(0, navStart) + 
                   navigationHtml + 
                   updatedIndexHtml.substring(navEnd);
console.log('✓ Replaced navigation HTML');

// Now find the </body> tag again after replacement
const newIndexBodyEnd = updatedIndexHtml.lastIndexOf('</body>');

// Insert navigation scripts before </body>
if (navigationScripts && newIndexBodyEnd !== -1) {
    updatedIndexHtml = updatedIndexHtml.substring(0, newIndexBodyEnd) + 
                       '\n<!-- Navigation Scripts -->\n' + navigationScripts + '\n' + 
                       updatedIndexHtml.substring(newIndexBodyEnd);
    console.log('✓ Inserted navigation scripts before </body>');
}

// Write the updated index.html
fs.writeFileSync(indexHtmlPath, updatedIndexHtml, 'utf8');

console.log('\n✅ Successfully integrated full navigation into index.html!');
console.log(`Final file size: ${updatedIndexHtml.length} characters`);

