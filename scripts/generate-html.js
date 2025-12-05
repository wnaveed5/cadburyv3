const fs = require('fs');
const path = require('path');

/**
 * Generate HTML from captured JSON data
 */
function generateHtml(outputPrefix = 'activities') {
  const jsonPath = path.join(__dirname, 'output', 'captured', `${outputPrefix}-capture.json`);
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found: ${jsonPath}`);
    console.log('💡 Run netsuite-login.js first to capture the data');
    process.exit(1);
  }
  
  console.log('📖 Reading JSON data...');
  const captureData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  // Check if it's the new full navigation structure or old single menu structure
  const isFullNavigation = captureData.topLevelItems && Array.isArray(captureData.topLevelItems);
  const isOldStructure = captureData.menuMap && captureData.menuMap.items;
  
  if (!isFullNavigation && !isOldStructure) {
    console.error('❌ Invalid JSON structure: missing topLevelItems or menuMap.items');
    console.error('   Expected either:');
    console.error('   - topLevelItems (for full navigation capture)');
    console.error('   - menuMap.items (for single menu capture)');
    process.exit(1);
  }
  
  console.log(`🔨 Building HTML from ${isFullNavigation ? 'full navigation' : 'menu map'}...`);
  
  const cssText = captureData.css ? captureData.css.join('\n') : '';
  
  // Recursive function to build HTML from menu map
  function buildMenuHtml(items, depth = 0) {
    if (!items || items.length === 0) return '';
    
    return items.map(item => {
      if (!item.html) return '';
      
      let itemHtml = item.html;
      
      // Remove yellow highlights from item HTML
      itemHtml = removeYellowHighlights(itemHtml);
      
        // If item has submenu, inject it into the item HTML
      if (item.submenu && item.submenu.html) {
        // For full navigation top-level items, use different positioning
        const submenuClass = (isFullNavigation && depth === 0) ? 'captured-top-level-dropdown' : 
                            (depth === 0 ? 'captured-submenu' : 'captured-nested-submenu');
        const zIndex = depth === 0 ? '10001' : '10002';
        const positionStyle = (isFullNavigation && depth === 0) 
          ? 'position: absolute; top: 100%; left: 0; z-index: ' + zIndex + ';'
          : 'position: absolute; left: 100%; top: 0; z-index: ' + zIndex + ';';
        
        // Build submenu HTML - replace items with captured nested items
        let submenuHtml = item.submenu.html;
        // Remove yellow highlights from submenu HTML
        submenuHtml = removeYellowHighlights(submenuHtml);
        if (item.submenu.items && item.submenu.items.length > 0) {
          // Build HTML for nested items (recursively)
          const nestedItemsHtml = buildMenuHtml(item.submenu.items, depth + 1);
          
          // Find the menu container div in submenu HTML
          // Look for the div with role="menu" and the submenu ID
          const submenuId = item.submenu.id;
          
          // Match the opening menu tag and find its matching closing tag by counting divs
          const menuOpenPattern = new RegExp(`<div[^>]*role="menu"[^>]*id="${submenuId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'i');
          const menuOpenMatch = submenuHtml.match(menuOpenPattern);
          
          if (menuOpenMatch) {
            const openIndex = menuOpenMatch.index;
            const openTag = menuOpenMatch[0];
            
            // Find the matching closing tag by counting div tags
            let divDepth = 1;
            let closeIndex = openIndex + openTag.length;
            
            while (closeIndex < submenuHtml.length && divDepth > 0) {
              if (submenuHtml.substring(closeIndex, closeIndex + 4) === '<div') {
                // Check if self-closing
                const nextClose = submenuHtml.indexOf('>', closeIndex);
                if (nextClose > closeIndex && submenuHtml.substring(nextClose - 1, nextClose + 1) !== '/>') {
                  divDepth++;
                }
                closeIndex = nextClose + 1;
              } else if (submenuHtml.substring(closeIndex, closeIndex + 6) === '</div>') {
                divDepth--;
                if (divDepth === 0) {
                  // Found the matching closing tag
                  const before = submenuHtml.substring(0, openIndex + openTag.length);
                  const after = submenuHtml.substring(closeIndex);
                  submenuHtml = before + nestedItemsHtml + after;
                  break;
                }
                closeIndex += 6;
              } else {
                closeIndex++;
              }
            }
          } else {
            // Fallback: find any menu container
            const fallbackPattern = /(<div[^>]*role="menu"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>)/i;
            const fallbackMatch = submenuHtml.match(fallbackPattern);
            if (fallbackMatch) {
              submenuHtml = fallbackMatch[1] + nestedItemsHtml + fallbackMatch[3];
            }
          }
        }
        
        // Inject submenu before the closing </div> of the menu item
        // Find the outermost closing div by matching opening/closing tags
        let divDepth = 0;
        let insertIndex = -1;
        for (let i = 0; i < itemHtml.length; i++) {
          if (itemHtml.substring(i, i + 4) === '<div') {
            // Check if it's a self-closing tag
            const nextClose = itemHtml.indexOf('>', i);
            if (nextClose > i && itemHtml.substring(nextClose - 1, nextClose + 1) !== '/>') {
              divDepth++;
            }
          } else if (itemHtml.substring(i, i + 6) === '</div>') {
            divDepth--;
            if (divDepth === 0) {
              insertIndex = i;
              break;
            }
          }
        }
        
        if (insertIndex > 0) {
          itemHtml = itemHtml.substring(0, insertIndex) + 
                    `<div class="${submenuClass}" style="${positionStyle}">${submenuHtml}</div>` + 
                    itemHtml.substring(insertIndex);
        } else {
          // Fallback to lastIndexOf if matching fails
          const lastClosingDiv = itemHtml.lastIndexOf('</div>');
          if (lastClosingDiv > 0) {
            itemHtml = itemHtml.substring(0, lastClosingDiv) + 
                      `<div class="${submenuClass}" style="${positionStyle}">${submenuHtml}</div>` + 
                      itemHtml.substring(lastClosingDiv);
          }
        }
      }
      
      return itemHtml;
    }).join('');
  }
  
  // Function to remove yellow highlights from HTML
  function removeYellowHighlights(html) {
    if (!html) return html;
    
    // Remove yellow borders and box-shadows from style attributes
    html = html.replace(/style="([^"]*)"/gi, (match, styleContent) => {
      // Remove border properties that contain yellow
      styleContent = styleContent.replace(/border[^:]*:\s*[^;]*yellow[^;]*;?/gi, '');
      styleContent = styleContent.replace(/border[^:]*:\s*[^;]*rgb\(255,\s*255,\s*0\)[^;]*;?/gi, '');
      styleContent = styleContent.replace(/border[^:]*:\s*[^;]*#ffff00[^;]*;?/gi, '');
      
      // Remove box-shadow properties that contain yellow
      styleContent = styleContent.replace(/box-shadow[^:]*:\s*[^;]*yellow[^;]*;?/gi, '');
      styleContent = styleContent.replace(/box-shadow[^:]*:\s*[^;]*rgb\(255,\s*255,\s*0\)[^;]*;?/gi, '');
      styleContent = styleContent.replace(/box-shadow[^:]*:\s*[^;]*255,\s*255,\s*0[^;]*;?/gi, '');
      
      // Clean up multiple semicolons and trailing semicolons
      styleContent = styleContent.replace(/;;+/g, ';').replace(/^\s*;\s*|\s*;\s*$/g, '').trim();
      
      return styleContent ? `style="${styleContent}"` : '';
    });
    
    return html;
  }
  
  let navigationHtml = '';
  let buttonHtml = '';
  let dropdownHtmlWithSubmenus = '';
  
  if (isFullNavigation) {
    // Full navigation structure
    console.log(`📊 Processing ${captureData.topLevelItems.length} top-level items...`);
    
    // Get navigation container HTML
    navigationHtml = captureData.navigation?.html || '';
    navigationHtml = removeYellowHighlights(navigationHtml);
    
    // Build HTML for all top-level items (with submenus injected)
    const itemsHtml = buildMenuHtml(captureData.topLevelItems, 0);
    
    // If we have navigation HTML, inject the items into it
    if (navigationHtml) {
      // Find the navigation container and inject items
      const navPattern = /(<div[^>]*data-header-section="navigation"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>)/i;
      const navMatch = navigationHtml.match(navPattern);
      
      if (navMatch) {
        navigationHtml = navMatch[1] + itemsHtml + navMatch[3];
      } else {
        // Fallback: try to find any container div
        const fallbackPattern = /(<div[^>]*data-header-section="navigation"[^>]*>)([\s\S]*?)(<\/div>)/i;
        const fallbackMatch = navigationHtml.match(fallbackPattern);
        if (fallbackMatch) {
          navigationHtml = fallbackMatch[1] + itemsHtml + fallbackMatch[3];
        } else {
          // Last resort: wrap items in navigation container
          navigationHtml = `<div data-header-section="navigation">${itemsHtml}</div>`;
        }
      }
    } else {
      // No navigation container, just use items
      navigationHtml = itemsHtml;
    }
  } else {
    // Old single menu structure
    const menuMap = captureData.menuMap;
    
    // Build dropdown HTML from menu map
    dropdownHtmlWithSubmenus = captureData.dropdown?.html || '';
    dropdownHtmlWithSubmenus = removeYellowHighlights(dropdownHtmlWithSubmenus);
    
    if (menuMap.items && menuMap.items.length > 0 && dropdownHtmlWithSubmenus) {
      // Build HTML for top-level items (with submenus injected)
      const itemsHtml = buildMenuHtml(menuMap.items, 0);
      
      // Find the menu container in the original dropdown HTML and replace its content
      const menuPattern = /(<div[^>]*role="menu"[^>]*id="[^"]*"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>)/i;
      const menuMatch = dropdownHtmlWithSubmenus.match(menuPattern);
      
      if (menuMatch) {
        // Replace the content between menu opening and closing tags with our built items
        dropdownHtmlWithSubmenus = menuMatch[1] + itemsHtml + menuMatch[3];
      } else {
        // Fallback: try to find menu container without ID
        const fallbackPattern = /(<div[^>]*role="menu"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>)/i;
        const fallbackMatch = dropdownHtmlWithSubmenus.match(fallbackPattern);
        if (fallbackMatch) {
          dropdownHtmlWithSubmenus = fallbackMatch[1] + itemsHtml + fallbackMatch[3];
        } else {
          // Last resort: wrap items in menu container
          const dropdownId = captureData.dropdown?.originalHtml?.match(/id="([^"]*)"/i)?.[1] || 'captured-dropdown';
          const dropdownClasses = captureData.dropdown?.originalHtml?.match(/class="([^"]*)"/i)?.[1] || '';
          dropdownHtmlWithSubmenus = `<div class="${dropdownClasses}" id="${dropdownId}" role="menu">${itemsHtml}</div>`;
        }
      }
    }
    
    // Get button HTML and remove yellow highlights
    buttonHtml = captureData.button?.html || '';
    buttonHtml = removeYellowHighlights(buttonHtml);
  }
  
  const title = isFullNavigation ? 'NetSuite Full Navigation' : 'NetSuite Activities Button';
  const description = isFullNavigation 
    ? 'Hover over menu items to see their dropdowns, then hover over items with submenus to see nested menus appear on the right:'
    : 'Hover over the button to see the dropdown, then hover over items (like "Scheduling") to see submenus appear on the right:';
  
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: 40px;
            background: #f5f5f5;
            margin: 0;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            margin-top: 0;
            color: #333;
        }
        .demo {
            margin: 40px 0;
            padding: 40px;
            background: #fafafa;
            border: 2px dashed #ddd;
            border-radius: 8px;
            position: relative;
        }
        .menu-wrapper {
            position: relative;
            display: inline-block;
        }
        /* Reset any conflicting styles */
        .menu-wrapper * {
            box-sizing: border-box;
        }
        /* All captured CSS from NetSuite */
        ${cssText}
        /* Ensure NetSuite styles take precedence - especially colors */
        .menu-wrapper,
        .menu-wrapper *,
        .captured-dropdown,
        .captured-dropdown *,
        .captured-submenu,
        .captured-submenu *,
        .captured-nested-submenu,
        .captured-nested-submenu * {
            font-family: inherit;
            font-size: inherit;
            line-height: inherit;
        }
        /* Preserve inline styles (which contain computed colors) */
        .menu-wrapper [style],
        .captured-dropdown [style],
        .captured-submenu [style],
        .captured-nested-submenu [style] {
            /* Inline styles should override everything */
        }
        /* Ensure dropdown shows on hover (for single menu structure) */
        .menu-wrapper:hover .captured-dropdown {
            display: block !important;
            visibility: visible !important;
        }
        .captured-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 10000;
        }
        /* Make navigation bar horizontal */
        div[data-header-section="navigation"] {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            flex-wrap: nowrap !important;
            overflow: visible !important; /* allow dropdowns to overflow bar */
            background-color: rgb(96, 119, 153) !important; /* requested blue */
            padding: 8px 12px !important;
            gap: 12px !important;
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
        }
        /* Ensure navigation items are displayed inline and positioned for dropdowns */
        div[data-header-section="navigation"] > div[data-widget="MenuItem"][role="menuitem"],
        div[data-header-section="navigation"] > div[role="menuitem"] {
            display: flex !important;
            align-items: center !important;
            white-space: nowrap !important;
            position: relative;
            overflow: visible;
            color: #ffffff !important;
            height: 36px !important;
            padding: 6px 10px !important;
        }
        /* Pull first icon slightly left, push overflow (last) to the right */
        div[data-header-section="navigation"] > div[data-widget="MenuItem"][role="menuitem"]:first-of-type,
        div[data-header-section="navigation"] > div[role="menuitem"]:first-of-type {
            margin-left: 0 !important;
        }
        div[data-header-section="navigation"] > div[data-widget="MenuItem"][role="menuitem"]:last-of-type,
        div[data-header-section="navigation"] > div[role="menuitem"]:last-of-type,
        div[data-header-section="navigation"] > div[data-widget="MenuItem"].overflow-menu-last {
            margin-left: auto !important;
        }
        /* Hover state for nav items to dark blue */
        div[data-header-section="navigation"] > div[data-widget="MenuItem"][role="menuitem"]:hover,
        div[data-header-section="navigation"] > div[role="menuitem"]:hover {
            background-color: rgb(96, 119, 153) !important; /* keep same hue on hover */
        }
        /* Force text/icons inside top-level nav buttons to white (but not their dropdown panels) */
        div[data-header-section="navigation"] > div[data-widget="MenuItem"][role="menuitem"] > *:not(.captured-top-level-dropdown) *,
        div[data-header-section="navigation"] > div[role="menuitem"] > *:not(.captured-top-level-dropdown) * {
            color: #ffffff !important;
            fill: #ffffff !important;
            stroke: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
            text-decoration-color: #ffffff !important;
        }
        /* Dropdowns and submenus use black text/icons */
        .captured-top-level-dropdown *,
        .captured-submenu *,
        .captured-nested-submenu * {
            color: #000000 !important;
            fill: #000000 !important;
            stroke: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
            text-decoration-color: #000000 !important;
        }
        /* For full navigation: show dropdowns on hover over top-level items */
        div[data-header-section="navigation"] > div[data-widget="MenuItem"][role="menuitem"]:hover > .captured-top-level-dropdown,
        div[data-header-section="navigation"] > div[role="menuitem"]:hover > .captured-top-level-dropdown {
            display: block;
            visibility: visible;
            opacity: 1;
        }
        /* Keep dropdown open when hovering over it or its contents */
        .captured-top-level-dropdown:hover {
            display: block;
            visibility: visible;
            opacity: 1;
        }
        /* Shared dropdown/submenu presentation */
        .captured-top-level-dropdown,
        .captured-submenu,
        .captured-nested-submenu {
            display: none;
            visibility: hidden;
            opacity: 0;
            position: absolute;
            background: white;
            box-shadow: 0 6px 18px rgba(0,0,0,0.18);
            border-radius: 4px;
            transform: translateY(6px);
            transition: opacity 120ms ease, transform 120ms ease;
        }
        /* Top-level dropdowns appear below the item */
        .captured-top-level-dropdown {
            top: 100%;
            left: 0;
            z-index: 10001;
            min-width: max-content;
        }
        /* Submenu positioning - appears on right side when hovering parent item */
        .captured-submenu {
            display: none;
            position: absolute;
            left: 100%;
            top: 0;
            z-index: 10001;
        }
        /* Show submenu only when hovering its direct parent menu item */
        div[data-widget="MenuItem"][role="menuitem"]:hover > .captured-submenu,
        div[role="menuitem"]:hover > .captured-submenu,
        .captured-top-level-dropdown div[data-widget="MenuItem"][role="menuitem"]:hover > .captured-submenu,
        .captured-top-level-dropdown div[role="menuitem"]:hover > .captured-submenu,
        [role="menu"] div[data-widget="MenuItem"][role="menuitem"]:hover > .captured-submenu,
        [role="menu"] div[role="menuitem"]:hover > .captured-submenu {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            transform: translateY(0);
        }
        /* For the overflow (three dots) menu: render dropdown/submenus to the left (override inline left styles) */
        div[data-header-section="navigation"] > div[data-widget="MenuItem"]:last-of-type > .captured-top-level-dropdown,
        div[data-header-section="navigation"] > div[data-widget="MenuItem"].overflow-menu-last > .captured-top-level-dropdown {
            left: auto !important;
            right: 0 !important;
        }
        div[data-header-section="navigation"] > div[data-widget="MenuItem"]:last-of-type .captured-submenu,
        div[data-header-section="navigation"] > div[data-widget="MenuItem"].overflow-menu-last .captured-submenu {
            left: auto !important;
            right: 100% !important;
        }
        div[data-header-section="navigation"] > div[data-widget="MenuItem"]:last-of-type .captured-nested-submenu,
        div[data-header-section="navigation"] > div[data-widget="MenuItem"].overflow-menu-last .captured-nested-submenu {
            left: auto !important;
            right: 100% !important;
        }
        /* Make sure parent items are positioned relatively */
        div[data-widget="MenuItem"][role="menuitem"],
        div[role="menuitem"],
        .captured-top-level-dropdown div[data-widget="MenuItem"][role="menuitem"],
        .captured-top-level-dropdown div[role="menuitem"],
        [role="menu"] div[data-widget="MenuItem"][role="menuitem"],
        [role="menu"] div[role="menuitem"] {
            position: relative;
        }
        /* Nested submenu positioning - appears on right side when hovering item in submenu */
        .captured-nested-submenu {
            display: none;
            visibility: hidden;
            opacity: 0;
            position: absolute;
            left: 100%;
            top: 0;
            z-index: 10002;
            pointer-events: none;
        }
        /* Show nested submenu only when hovering its direct parent item */
        .captured-submenu div[data-widget="MenuItem"][role="menuitem"]:hover > .captured-nested-submenu,
        .captured-submenu div[role="menuitem"]:hover > .captured-nested-submenu,
        .captured-top-level-dropdown .captured-submenu div[data-widget="MenuItem"][role="menuitem"]:hover > .captured-nested-submenu,
        .captured-top-level-dropdown .captured-submenu div[role="menuitem"]:hover > .captured-nested-submenu,
        [role="menu"] .captured-submenu div[data-widget="MenuItem"][role="menuitem"]:hover > .captured-nested-submenu,
        [role="menu"] .captured-submenu div[role="menuitem"]:hover > .captured-nested-submenu {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: translateY(0);
        }
        /* Ensure items in submenus can show nested submenus */
        .captured-submenu div[data-widget="MenuItem"][role="menuitem"],
        .captured-submenu div[role="menuitem"],
        .captured-top-level-dropdown .captured-submenu div[data-widget="MenuItem"][role="menuitem"],
        .captured-top-level-dropdown .captured-submenu div[role="menuitem"] {
            position: relative;
        }
    </style>
</head>
<body style="margin:0; padding:20px; background:#f5f5f5;">
    <div class="menu-wrapper">
        ${isFullNavigation 
          ? navigationHtml 
          : `${buttonHtml}${dropdownHtmlWithSubmenus ? `<div class="captured-dropdown">${dropdownHtmlWithSubmenus}</div>` : ''}`}
    </div>
    <script>
        // Handle submenu hover behavior
        document.addEventListener('DOMContentLoaded', function() {
            // Mark overflow (three dots) menu item as last for positioning
            const navItems = document.querySelectorAll('div[data-header-section="navigation"] > div[data-widget="MenuItem"][role="menuitem"]');
            if (navItems.length > 0) {
                const lastNavItem = navItems[navItems.length - 1];
                lastNavItem.classList.add('overflow-menu-last');
            }

            // Utilities to hide panels quickly (avoid overlap)
            const hidePanel = (panel) => {
                if (!panel) return;
                panel.style.display = 'none';
                panel.style.visibility = 'hidden';
                panel.style.opacity = '0';
                panel.style.transform = 'translateY(6px)';
                if (panel.classList.contains('captured-nested-submenu')) {
                    panel.style.pointerEvents = 'none';
                }
            };

            const hideSiblings = (panel, selector) => {
                if (!panel || !panel.parentElement) return;
                const siblings = panel.parentElement.querySelectorAll(selector);
                siblings.forEach(sib => {
                    if (sib !== panel) hidePanel(sib);
                });
            };

            const showPanel = (panel) => {
                if (!panel) return;
                // ensure layout applied after hides to avoid overlap flicker
                requestAnimationFrame(() => {
                    panel.style.display = 'block';
                    panel.style.visibility = 'visible';
                    panel.style.opacity = '1';
                    panel.style.transform = 'translateY(0)';
                    if (panel.classList.contains('captured-nested-submenu')) {
                        panel.style.pointerEvents = 'auto';
                    }
                });
            };

            // Function to setup hover for a submenu
            function setupSubmenuHover(submenu) {
                // Find the parent menu item
                let parentItem = submenu.parentElement;
                while (parentItem && parentItem !== document.body) {
                    if (parentItem.getAttribute && parentItem.getAttribute('role') === 'menuitem') {
                        break;
                    }
                    parentItem = parentItem.parentElement;
                }
                
                if (parentItem) {
                    parentItem.style.position = 'relative';

                    // Show submenu on hover
                    const showSubmenu = () => {
                        hideSiblings(submenu, '.captured-submenu, .captured-nested-submenu');
                        showPanel(submenu);
                    };
                    
                    // Hide submenu
                    let hideTimeout;
                    const hideSubmenu = () => {
                        hideTimeout = setTimeout(() => {
                            if (!parentItem.matches(':hover') && !submenu.matches(':hover')) {
                                hidePanel(submenu);
                            }
                        }, 100);
                    };
                    
                    parentItem.addEventListener('mouseenter', showSubmenu);
                    parentItem.addEventListener('mouseleave', hideSubmenu);
                    
                    submenu.addEventListener('mouseenter', () => {
                        if (hideTimeout) clearTimeout(hideTimeout);
                        showSubmenu();
                    });
                    
                    submenu.addEventListener('mouseleave', hideSubmenu);
                }
            }
            
            // Handle top-level dropdowns
            const topLevelDropdowns = document.querySelectorAll('.captured-top-level-dropdown');
            topLevelDropdowns.forEach(dropdown => {
                // Find the parent menu item
                let parentItem = dropdown.parentElement;
                while (parentItem && parentItem !== document.body) {
                    if (parentItem.getAttribute && parentItem.getAttribute('role') === 'menuitem') {
                        break;
                    }
                    parentItem = parentItem.parentElement;
                }
                
                if (parentItem) {
                    parentItem.style.position = 'relative';

                    // Show dropdown on hover
                    const showDropdown = () => {
                        // hide other top-level dropdowns to prevent overlap
                        topLevelDropdowns.forEach(other => {
                            if (other !== dropdown) hidePanel(other);
                        });
                        showPanel(dropdown);
                    };
                    
                    // Hide dropdown
                    let hideTimeout;
                    const hideDropdown = () => {
                        hideTimeout = setTimeout(() => {
                            if (!parentItem.matches(':hover') && !dropdown.matches(':hover')) {
                                hidePanel(dropdown);
                            }
                        }, 100);
                    };
                    
                    parentItem.addEventListener('mouseenter', showDropdown);
                    parentItem.addEventListener('mouseleave', hideDropdown);
                    
                    dropdown.addEventListener('mouseenter', () => {
                        if (hideTimeout) clearTimeout(hideTimeout);
                        showDropdown();
                    });
                    
                    dropdown.addEventListener('mouseleave', hideDropdown);
                }
            });
            
            // Find all submenus (both regular and nested)
            const submenus = document.querySelectorAll('.captured-submenu, .captured-nested-submenu');
            submenus.forEach(setupSubmenuHover);
            
            // Find all nested submenus
            const nestedSubmenus = document.querySelectorAll('.captured-nested-submenu');
            
            nestedSubmenus.forEach(nestedSubmenu => {
                // Find the parent menu item that controls this nested submenu
                // The nested submenu should be a direct child of the menu item
                let parentItem = nestedSubmenu.parentElement;
                
                // Walk up to find the menu item with role="menuitem"
                while (parentItem && parentItem !== document.body) {
                    if (parentItem.getAttribute && parentItem.getAttribute('role') === 'menuitem') {
                        break;
                    }
                    parentItem = parentItem.parentElement;
                }
                
                if (parentItem) {
                    // Ensure parent has relative positioning
                    parentItem.style.position = 'relative';
                    
                    // Ensure nested submenu starts hidden
                    nestedSubmenu.style.display = 'none';
                    nestedSubmenu.style.visibility = 'hidden';
                    nestedSubmenu.style.opacity = '0';
                    nestedSubmenu.style.pointerEvents = 'none';
                    
                    // Show nested submenu on hover over parent item
                    parentItem.addEventListener('mouseenter', function(e) {
                        nestedSubmenu.style.display = 'block';
                        nestedSubmenu.style.visibility = 'visible';
                        nestedSubmenu.style.opacity = '1';
                        nestedSubmenu.style.pointerEvents = 'auto';
                    });
                    
                    // Hide when leaving parent (with delay to allow moving to submenu)
                    let hideTimeout;
                    parentItem.addEventListener('mouseleave', function(e) {
                        // Check if mouse is moving to nested submenu
                        const relatedTarget = e.relatedTarget;
                        if (relatedTarget && nestedSubmenu.contains(relatedTarget)) {
                            return; // Don't hide if moving to submenu
                        }
                        
                        hideTimeout = setTimeout(() => {
                            if (!parentItem.matches(':hover') && !nestedSubmenu.matches(':hover')) {
                                nestedSubmenu.style.display = 'none';
                                nestedSubmenu.style.visibility = 'hidden';
                                nestedSubmenu.style.opacity = '0';
                                nestedSubmenu.style.pointerEvents = 'none';
                            }
                        }, 100);
                    });
                    
                    // Keep nested submenu open when hovering over it
                    nestedSubmenu.addEventListener('mouseenter', function() {
                        if (hideTimeout) clearTimeout(hideTimeout);
                        nestedSubmenu.style.display = 'block';
                        nestedSubmenu.style.visibility = 'visible';
                        nestedSubmenu.style.opacity = '1';
                        nestedSubmenu.style.pointerEvents = 'auto';
                    });
                    
                    nestedSubmenu.addEventListener('mouseleave', function() {
                        nestedSubmenu.style.display = 'none';
                        nestedSubmenu.style.visibility = 'hidden';
                        nestedSubmenu.style.opacity = '0';
                        nestedSubmenu.style.pointerEvents = 'none';
                    });
                } else {
                    console.warn('Could not find parent menu item for nested submenu:', nestedSubmenu);
                }
            });
            
            // Also handle purple submenus to ensure they show nested submenus
            const purpleSubmenus = document.querySelectorAll('.captured-submenu');
            purpleSubmenus.forEach(purpleSubmenu => {
                const menuItems = purpleSubmenu.querySelectorAll('div[role="menuitem"]');
                menuItems.forEach(menuItem => {
                    menuItem.style.position = 'relative';
                });
            });
        });
    </script>
</body>
</html>`;
  
  const outputDir = path.join(__dirname, 'output', 'captured');
  const htmlPath = path.join(outputDir, `${outputPrefix}-capture.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log(`✅ Generated HTML: ${htmlPath}`);
}

// Get output prefix from command line argument or use default
const outputPrefix = process.argv[2] || 'activities';
generateHtml(outputPrefix);

