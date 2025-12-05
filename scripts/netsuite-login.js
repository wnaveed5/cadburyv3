const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  LOGIN_URL: 'https://system.netsuite.com/pages/customerlogin.jsp',
  EMAIL: process.env.NETSUITE_EMAIL || 'YOUR_EMAIL_HERE',
  PASSWORD: process.env.NETSUITE_PASSWORD || 'YOUR_PASSWORD_HERE',
  EMAIL_SELECTOR: '#email',
  PASSWORD_SELECTOR: '#password',
  SUBMIT_SELECTOR: '#submitButton',
  HEADLESS: false,
  KEEP_BROWSER_OPEN: true,
  VIEWPORT: { width: 1280, height: 800 }, // Smaller viewport to trigger overflow menu (3 dots) after Commerce
  USER_DATA_DIR: path.join(__dirname, 'browser-data'),
  COOKIES_FILE: path.join(__dirname, 'netsuite-cookies.json'),
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function saveCookies(cookies) {
  try {
    ensureDir(path.dirname(CONFIG.COOKIES_FILE));
    fs.writeFileSync(CONFIG.COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log('💾 Cookies saved');
  } catch (err) {
    console.warn('⚠️ Failed to save cookies:', err.message);
  }
}

function loadCookies() {
  try {
    if (fs.existsSync(CONFIG.COOKIES_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.COOKIES_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('⚠️ Failed to load cookies:', err.message);
  }
  return null;
}

async function isLoggedIn(page) {
  try {
    const url = page.url();
    if (url.includes('customerlogin.jsp') || url.includes('login')) {
      return false;
    }
    return !!(await page.evaluate(() => {
      return !!(
        document.querySelector('[data-header-section="navigation"]') ||
        document.querySelector('[data-widget="MenuItem"]')
      );
    }));
  } catch (err) {
    return false;
  }
}

async function highlightNavigationElement(page) {
  try {
    console.log('🎨 Highlighting navigation (red)...');
    await page.evaluate(() => {
      const nav = document.querySelector('div[data-header-section="navigation"]');
      if (nav) {
        nav.style.border = '5px solid red';
        nav.style.boxSizing = 'border-box';
        nav.style.zIndex = '99999';
        nav.style.boxShadow = '0 0 0 5px rgba(255, 0, 0, 0.3)';
      }
    });
    console.log('✅ Navigation highlighted');
  } catch (err) {
    console.warn('⚠️ Failed to highlight navigation:', err.message);
  }
}

async function highlightActivitiesMenuItem(page) {
  try {
    console.log('🎨 Highlighting overflow menu (three dots) button (yellow)...');
    await page.evaluate(() => {
      // Find the overflow menu button (three dots) - usually the last menu item or has a specific icon
      const menuItems = document.querySelectorAll('div[data-widget="MenuItem"][role="menuitem"]');
      let overflowButton = null;
      
      // Try to find by looking for the last visible menu item that might be the overflow
      // Or look for a button with three dots icon/pattern
      for (let i = menuItems.length - 1; i >= 0; i--) {
        const item = menuItems[i];
        const text = item.querySelector('span[data-widget="Text"]');
        const ariaLabel = item.getAttribute('aria-label');
        const hasIcon = item.querySelector('svg, [data-icon]');
        
        // Check if it's the overflow menu (often has no text or has a "more" label)
        if (!text || text.textContent.trim() === '' || 
            (ariaLabel && (ariaLabel.toLowerCase().includes('more') || ariaLabel.toLowerCase().includes('menu')))) {
          overflowButton = item;
          break;
        }
      }
      
      // If not found, try to find by looking for a button with three dots pattern
      if (!overflowButton) {
        for (const item of menuItems) {
          const svg = item.querySelector('svg');
          if (svg) {
            const paths = svg.querySelectorAll('path, circle, ellipse');
            // Three dots typically have 3 similar path elements
            if (paths.length >= 3) {
              overflowButton = item;
              break;
            }
          }
        }
      }
      
      if (overflowButton) {
        overflowButton.style.border = '5px solid yellow';
        overflowButton.style.boxSizing = 'border-box';
        overflowButton.style.zIndex = '99999';
        overflowButton.style.boxShadow = '0 0 0 5px rgba(255, 255, 0, 0.5)';
      }
    });
    console.log('✅ Overflow menu button highlighted');
  } catch (err) {
    console.warn('⚠️ Failed to highlight Customization button:', err.message);
  }
}

async function hoverActivitiesMenuItem(page) {
  try {
    console.log('🖱️ Hovering over Customization button...');
    const handle = await page.evaluateHandle(() => {
      const menuItems = document.querySelectorAll('div[data-widget="MenuItem"][role="menuitem"]');
      for (const item of menuItems) {
        const text = item.querySelector('span[data-widget="Text"]');
        if (text && text.textContent.trim() === 'Customization') {
          return item;
        }
      }
      return null;
    });
    
    if (handle && handle.asElement()) {
      await handle.asElement().hover();
      await new Promise(resolve => setTimeout(resolve, 700));
      console.log('✅ Dropdown opened');
    }
  } catch (err) {
    console.warn('⚠️ Failed to hover:', err.message);
  }
}

// Store captured menu structure
let menuMap = {
  button: null,
  dropdown: null,
  items: [] // Each item can have submenu, which can have nested items
};

// Helper to capture an element with styles
async function captureElementWithStyles(page, elementId, elementType) {
  return await page.evaluate((id, type) => {
    const element = document.getElementById(id);
    if (!element) return null;
    
    const style = window.getComputedStyle(element);
    if (style.visibility === 'hidden' || style.display === 'none') {
      return null;
    }
    
    // Remove highlight styles
    element.style.border = '';
    element.style.boxShadow = '';
    element.removeAttribute('data-green-highlight');
    element.removeAttribute('data-purple-highlight');
    element.removeAttribute('data-orange-highlight');
    
    const getComputedStyleString = (el) => {
      const styles = window.getComputedStyle(el);
      const styleProps = [];
      const importantProps = new Set([
        'display', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height',
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border', 'border-width', 'border-style', 'border-color', 'border-radius',
        'border-top', 'border-right', 'border-bottom', 'border-left',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
        'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
        'background', 'background-color', 'background-image', 'background-position', 'background-repeat', 'background-size',
        'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
        'text-align', 'text-decoration', 'text-transform', 'vertical-align',
        'opacity', 'visibility', 'z-index', 'box-sizing', 'overflow', 'overflow-x', 'overflow-y',
        'transform', 'transition', 'box-shadow', 'cursor', 'pointer-events',
        'flex', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content',
        'grid', 'grid-template-columns', 'grid-template-rows', 'gap',
        'fill', 'stroke', 'stroke-width' // SVG properties
      ]);
      
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        const value = styles.getPropertyValue(prop);
        const priority = styles.getPropertyPriority(prop);
        
        // Always include color-related properties
        const isColorProp = prop.toLowerCase().includes('color') || 
                           prop.toLowerCase().includes('background') ||
                           prop.toLowerCase().includes('fill') ||
                           prop.toLowerCase().includes('stroke');
        
        // Include all important properties and properties with non-default values
        if (value && value !== 'auto' && (
          importantProps.has(prop.toLowerCase()) ||
          isColorProp ||
          priority === 'important' ||
          (value !== 'none' && value !== 'normal' && value !== '0px' && value !== '0' && value !== 'rgba(0, 0, 0, 0)')
        )) {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          const important = priority === 'important' ? ' !important' : '';
          styleProps.push(`${cssProp}: ${value}${important}`);
        }
      }
      return styleProps.join('; ');
    };
    
    const applyStylesToElement = (el) => {
      const styleString = getComputedStyleString(el);
      if (styleString && el.setAttribute) {
        el.setAttribute('style', styleString);
      }
      const children = el.querySelectorAll('*');
      children.forEach(child => {
        const childStyle = getComputedStyleString(child);
        if (childStyle && child.setAttribute) {
          child.setAttribute('style', childStyle);
        }
      });
      return el.outerHTML;
    };
    
    const clone = element.cloneNode(true);
    return {
      id: id,
      html: applyStylesToElement(clone),
      originalHtml: element.outerHTML
    };
  }, elementId, elementType);
}

// Recursive function to traverse and capture menu structure
async function traverseMenu(page, menuId, parentText, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}📋 Processing menu: ${parentText || menuId} (depth ${depth})`);
  
  // Get all items in this menu
  const items = await page.evaluate((id) => {
    const menu = document.getElementById(id);
    if (!menu) return [];
    const menuItems = menu.querySelectorAll('div[data-widget="MenuItem"][role="menuitem"]');
    return Array.from(menuItems).map((item, index) => ({
      index,
      id: item.id,
      text: item.textContent.trim(),
      hasSubmenu: item.getAttribute('aria-haspopup') === 'true' || item.getAttribute('aria-controls'),
      submenuId: item.getAttribute('aria-controls')
    }));
  }, menuId);
  
  const capturedItems = [];
  
  for (const item of items) {
    console.log(`${indent}  🎨 Item: "${item.text}"`);
    
    // Highlight item
    await page.evaluate((itemId, highlightColor) => {
      const item = document.getElementById(itemId);
      if (item) {
        item.style.border = `5px solid ${highlightColor}`;
        item.style.boxSizing = 'border-box';
        item.style.zIndex = '99999';
        item.style.boxShadow = `0 0 0 5px rgba(${highlightColor === 'green' ? '0, 255, 0' : highlightColor === 'purple' ? '128, 0, 128' : '255, 165, 0'}, 0.3)`;
      }
    }, item.id, depth === 0 ? 'green' : depth === 1 ? 'purple' : 'orange');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Capture the item
    const itemData = await captureElementWithStyles(page, item.id, 'item');
    
    const capturedItem = {
      text: item.text,
      id: item.id,
      html: itemData ? itemData.html : null,
      submenu: null
    };
    
    // If item has submenu, hover and recursively process it
    if (item.hasSubmenu && item.submenuId) {
      console.log(`${indent}    🖱️ Hovering "${item.text}" to open submenu...`);
      
      const itemHandle = await page.evaluateHandle((itemId) => {
        return document.getElementById(itemId);
      }, item.id);
      
      if (itemHandle && itemHandle.asElement()) {
        await itemHandle.asElement().hover();
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Capture the submenu
        const submenuData = await captureElementWithStyles(page, item.submenuId, 'submenu');
        
        if (submenuData) {
          capturedItem.submenu = {
            id: item.submenuId,
            html: submenuData.html,
            items: []
          };
          
          // Highlight submenu
          await page.evaluate((submenuId, color) => {
            const submenu = document.getElementById(submenuId);
            if (submenu) {
              submenu.style.border = `5px solid ${color}`;
              submenu.style.boxSizing = 'border-box';
              submenu.style.zIndex = '99999';
              submenu.style.boxShadow = `0 0 0 5px rgba(${color === 'purple' ? '128, 0, 128' : '255, 165, 0'}, 0.3)`;
            }
          }, item.submenuId, depth === 1 ? 'purple' : 'orange');
          
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Recursively process the submenu
          const nestedItems = await traverseMenu(page, item.submenuId, item.text, depth + 1);
          capturedItem.submenu.items = nestedItems;
        }
      }
    }
    
    // Remove highlight
    await page.evaluate((itemId) => {
      const item = document.getElementById(itemId);
      if (item) {
        item.style.border = '';
        item.style.boxShadow = '';
      }
    }, item.id);
    
    capturedItems.push(capturedItem);
  }
  
  return capturedItems;
}

async function highlightDropdownItems(page) {
  try {
    console.log('🔍 Finding Customization dropdown...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dropdownInfo = await page.evaluate(() => {
      const menuItems = document.querySelectorAll('div[data-widget="MenuItem"][role="menuitem"]');
      for (const item of menuItems) {
        const text = item.querySelector('span[data-widget="Text"]');
        if (text && text.textContent.trim() === 'Customization') {
          return item.getAttribute('aria-controls');
        }
      }
      return null;
    });
    
    if (!dropdownInfo) {
      console.warn('⚠️ Dropdown not found');
      return;
    }
    
    // Reset menu map
    menuMap = {
      button: null,
      dropdown: null,
      items: []
    };
    
    // Recursively traverse and capture the entire menu structure
    console.log('🗺️ Mapping menu structure...');
    menuMap.items = await traverseMenu(page, dropdownInfo, 'Customization', 0);
    
    console.log(`✅ Finished mapping menu structure. Captured ${menuMap.items.length} top-level items.`);
  } catch (err) {
    console.warn('⚠️ Failed to map menu structure:', err.message);
  }
}

async function captureActivitiesButton(page) {
  try {
    console.log('📸 Capturing Customization button and dropdown...');
    
    // Remove all highlight styles before capturing
    await page.evaluate(() => {
      // Remove yellow highlight from Customization button
      const menuItems = document.querySelectorAll('div[data-widget="MenuItem"][role="menuitem"]');
      for (const item of menuItems) {
        const text = item.querySelector('span[data-widget="Text"]');
        if (text && text.textContent.trim() === 'Customization') {
          item.style.border = '';
          item.style.boxShadow = '';
          break;
        }
      }
      
      // Remove green highlights from dropdown items
      document.querySelectorAll('[data-green-highlight]').forEach(el => {
        el.style.border = '';
        el.style.boxShadow = '';
        el.removeAttribute('data-green-highlight');
      });
      
      // Remove purple highlights from submenus
      document.querySelectorAll('[data-purple-highlight]').forEach(el => {
        el.style.border = '';
        el.style.boxShadow = '';
        el.removeAttribute('data-purple-highlight');
      });
      
      // Remove orange highlights from nested submenus
      document.querySelectorAll('[data-orange-highlight]').forEach(el => {
        el.style.border = '';
        el.style.boxShadow = '';
        el.removeAttribute('data-orange-highlight');
      });
    });
    
    const captureData = await page.evaluate(() => {
      // Find Customization button
      const menuItems = document.querySelectorAll('div[data-widget="MenuItem"][role="menuitem"]');
      let activitiesButton = null;
      for (const item of menuItems) {
        const text = item.querySelector('span[data-widget="Text"]');
        if (text && text.textContent.trim() === 'Customization') {
          activitiesButton = item;
          break;
        }
      }
      
      if (!activitiesButton) return null;
      
      // Get button HTML (normal state)
      const buttonHtml = activitiesButton.outerHTML;
      const buttonClasses = Array.from(activitiesButton.classList);
      const buttonStyles = window.getComputedStyle(activitiesButton);
      const buttonComputedStyles = {};
      for (let i = 0; i < buttonStyles.length; i++) {
        const prop = buttonStyles[i];
        buttonComputedStyles[prop] = buttonStyles.getPropertyValue(prop);
      }
      
      // Get dropdown
      const dropdownId = activitiesButton.getAttribute('aria-controls');
      const dropdown = dropdownId ? document.getElementById(dropdownId) : null;
      
      let dropdownHtml = null;
      let dropdownItems = [];
      
      if (dropdown) {
        dropdownHtml = dropdown.outerHTML;
        const items = dropdown.querySelectorAll('div[data-widget="MenuItem"][role="menuitem"]');
        dropdownItems = Array.from(items).map(item => ({
          html: item.outerHTML,
          text: item.textContent.trim(),
          classes: Array.from(item.classList)
        }));
      }
      
      // Get ALL CSS rules (capture everything)
      const cssRules = [];
      const allSheets = Array.from(document.styleSheets);
      for (const sheet of allSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.cssText) {
              cssRules.push(rule.cssText);
            }
            // Also capture @media rules
            if (rule.media && rule.media.length > 0) {
              const mediaRules = Array.from(rule.cssRules || []);
              for (const mediaRule of mediaRules) {
                if (mediaRule.cssText) {
                  cssRules.push(`@media ${rule.media.mediaText} { ${mediaRule.cssText} }`);
                }
              }
            }
          }
        } catch (e) {
          // Skip cross-origin stylesheets
        }
      }
      
      // Capture CSS custom properties (variables) from root - CRITICAL for colors
      const rootStyles = window.getComputedStyle(document.documentElement);
      const cssVariables = [];
      // Get all CSS variables from computed styles
      for (let i = 0; i < rootStyles.length; i++) {
        const prop = rootStyles[i];
        if (prop.startsWith('--')) {
          const value = rootStyles.getPropertyValue(prop);
          cssVariables.push(`${prop}: ${value};`);
        }
      }
      // Also try to get variables from style attribute
      try {
        const rootElement = document.documentElement;
        if (rootElement.style) {
          for (let i = 0; i < rootElement.style.length; i++) {
            const prop = rootElement.style[i];
            if (prop.startsWith('--')) {
              const value = rootElement.style.getPropertyValue(prop);
              if (!cssVariables.some(v => v.startsWith(prop))) {
                cssVariables.push(`${prop}: ${value};`);
              }
            }
          }
        }
      } catch (e) {
        // Ignore errors
      }
      if (cssVariables.length > 0) {
        cssRules.unshift(`:root { ${cssVariables.join(' ') } }`);
      }
      
      // Capture base body/html styles that might affect the menu (especially colors)
      const bodyStyles = window.getComputedStyle(document.body);
      const htmlStyles = window.getComputedStyle(document.documentElement);
      const baseStyles = [];
      const baseProps = [
        'font-family', 'font-size', 'line-height', 
        'color', 'background-color', 'background',
        'margin', 'padding'
      ];
      baseProps.forEach(prop => {
        const bodyValue = bodyStyles.getPropertyValue(prop);
        const htmlValue = htmlStyles.getPropertyValue(prop);
        if (bodyValue && bodyValue !== 'initial' && bodyValue !== 'normal' && bodyValue !== 'rgba(0, 0, 0, 0)') {
          baseStyles.push(`body { ${prop}: ${bodyValue}; }`);
        }
        if (htmlValue && htmlValue !== 'initial' && htmlValue !== 'normal' && htmlValue !== bodyValue && htmlValue !== 'rgba(0, 0, 0, 0)') {
          baseStyles.push(`html { ${prop}: ${htmlValue}; }`);
        }
      });
      if (baseStyles.length > 0) {
        cssRules.unshift(...baseStyles);
      }
      
      // Helper to get computed styles as inline style string
      // Capture ALL styles for exact visual match, especially colors
      const getComputedStyleString = (element) => {
        const styles = window.getComputedStyle(element);
        const styleProps = [];
        const importantProps = new Set([
          'display', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height',
          'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
          'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
          'border', 'border-width', 'border-style', 'border-color', 'border-radius',
          'border-top', 'border-right', 'border-bottom', 'border-left',
          'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
          'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
          'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
          'background', 'background-color', 'background-image', 'background-position', 'background-repeat', 'background-size',
          'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
          'text-align', 'text-decoration', 'text-transform', 'vertical-align',
          'opacity', 'visibility', 'z-index', 'box-sizing', 'overflow', 'overflow-x', 'overflow-y',
          'transform', 'transition', 'box-shadow', 'cursor', 'pointer-events',
          'flex', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content',
          'grid', 'grid-template-columns', 'grid-template-rows', 'gap',
          'fill', 'stroke', 'stroke-width' // SVG properties
        ]);
        
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          const value = styles.getPropertyValue(prop);
          const priority = styles.getPropertyPriority(prop);
          
          // Always include color-related properties
          const isColorProp = prop.toLowerCase().includes('color') || 
                             prop.toLowerCase().includes('background') ||
                             prop.toLowerCase().includes('fill') ||
                             prop.toLowerCase().includes('stroke');
          
          // Include all important properties and properties with non-default values
          if (value && value !== 'auto' && (
            importantProps.has(prop.toLowerCase()) ||
            isColorProp ||
            priority === 'important' ||
            (value !== 'none' && value !== 'normal' && value !== '0px' && value !== '0' && value !== 'rgba(0, 0, 0, 0)')
          )) {
            const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            const important = priority === 'important' ? ' !important' : '';
            styleProps.push(`${cssProp}: ${value}${important}`);
          }
        }
        return styleProps.join('; ');
      };
      
      // Apply computed styles to button and all children
      const applyStylesToElement = (element) => {
        const styleString = getComputedStyleString(element);
        if (styleString && element.setAttribute) {
          element.setAttribute('style', styleString);
        }
        // Apply to all children
        const children = element.querySelectorAll('*');
        children.forEach(child => {
          const childStyle = getComputedStyleString(child);
          if (childStyle && child.setAttribute) {
            child.setAttribute('style', childStyle);
          }
        });
        return element.outerHTML;
      };
      
      // Clone and apply styles to button
      const buttonClone = activitiesButton.cloneNode(true);
      const buttonHtmlWithStyles = applyStylesToElement(buttonClone);
      
      // Clone and apply styles to dropdown
      let dropdownHtmlWithStyles = null;
      if (dropdown) {
        const dropdownClone = dropdown.cloneNode(true);
        dropdownHtmlWithStyles = applyStylesToElement(dropdownClone);
      }
      
      // Get inline scripts and event listeners info
      const scripts = [];
      const allScripts = document.querySelectorAll('script');
      for (const script of allScripts) {
        if (script.textContent && (
          script.textContent.includes('MenuItem') ||
          script.textContent.includes('menu') ||
          script.textContent.includes('dropdown')
        )) {
          scripts.push({
            type: script.type || 'text/javascript',
            content: script.textContent.substring(0, 1000) // First 1000 chars
          });
        }
      }
      
      return {
        button: {
          html: buttonHtmlWithStyles,
          originalHtml: buttonHtml,
          classes: buttonClasses
        },
        dropdown: {
          html: dropdownHtmlWithStyles,
          originalHtml: dropdownHtml,
          items: dropdownItems
        },
        css: cssRules,
        scripts: scripts
      };
    });
    
    if (!captureData) {
      console.warn('⚠️ Could not capture Customization button');
      return;
    }
    
    // Add menu map structure to the data
    captureData.menuMap = menuMap;
    
    // Save to JSON only
    const outputDir = path.join(__dirname, 'output', 'captured');
    ensureDir(outputDir);
    const jsonPath = path.join(outputDir, 'customization-capture.json');
    fs.writeFileSync(jsonPath, JSON.stringify(captureData, null, 2), 'utf-8');
    console.log(`💾 Saved JSON to: ${jsonPath}`);
    console.log(`📝 Run 'node scripts/generate-html.js customization' to generate HTML from this JSON`);
    
  } catch (err) {
    console.warn('⚠️ Failed to capture:', err.message);
  }
}

async function loginToNetSuite() {
  console.log('🚀 Starting NetSuite login...');
  
  ensureDir(CONFIG.USER_DATA_DIR);
  
  const browser = await puppeteer.launch({
    headless: CONFIG.HEADLESS,
    defaultViewport: CONFIG.VIEWPORT,
    args: ['--start-maximized'],
    userDataDir: CONFIG.USER_DATA_DIR,
  });
  
  const page = await browser.newPage();
  
  // Set viewport explicitly to ensure overflow menu appears
  await page.setViewport(CONFIG.VIEWPORT);
  
  const savedCookies = loadCookies();
  if (savedCookies && savedCookies.length > 0) {
    try {
      await page.setCookie(...savedCookies);
      console.log('🍪 Restored cookies');
    } catch (err) {
      console.warn('⚠️ Failed to restore cookies:', err.message);
    }
  }
  
  try {
    const dashboardUrl = CONFIG.LOGIN_URL.replace('/pages/customerlogin.jsp', '/app/center/card.nl');
    console.log('🔍 Checking login status...');
    
    try {
      await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      await page.goto(CONFIG.LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const alreadyLoggedIn = await isLoggedIn(page);
    
    if (alreadyLoggedIn) {
      console.log('✅ Already logged in!');
      await page.waitForSelector('div[data-header-section="navigation"]', { timeout: 5000 });
      await highlightNavigationElement(page);
      await highlightActivitiesMenuItem(page);
      await hoverActivitiesMenuItem(page);
      await highlightDropdownItems(page);
      await captureActivitiesButton(page);
    } else {
      console.log('🔐 Logging in...');
      
      if (!page.url().includes('customerlogin') && !page.url().includes('login')) {
        await page.goto(CONFIG.LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      }
      
      await page.waitForSelector(CONFIG.EMAIL_SELECTOR, { timeout: 30000 });
      await page.type(CONFIG.EMAIL_SELECTOR, CONFIG.EMAIL, { delay: 50 });
      console.log('✅ Email entered');
      
      await page.waitForSelector(CONFIG.PASSWORD_SELECTOR, { timeout: 30000 });
      await page.type(CONFIG.PASSWORD_SELECTOR, CONFIG.PASSWORD, { delay: 50 });
      console.log('✅ Password entered');
      
      await page.waitForSelector(CONFIG.SUBMIT_SELECTOR, { timeout: 30000 });
      console.log('🔐 Submitting...');
      
      const navigationPromise = page.waitForNavigation({ 
        waitUntil: 'domcontentloaded', 
        timeout: 120000 
      }).catch(() => {});
      
      await page.click(CONFIG.SUBMIT_SELECTOR);
      await navigationPromise;
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✅ Login successful!');
      
      const cookies = await page.cookies();
      saveCookies(cookies);
      
      await page.waitForSelector('div[data-header-section="navigation"]', { timeout: 10000 });
      await highlightNavigationElement(page);
      await highlightActivitiesMenuItem(page);
      await hoverActivitiesMenuItem(page);
      await highlightDropdownItems(page);
      await captureActivitiesButton(page);
    }
    
    if (CONFIG.KEEP_BROWSER_OPEN) {
      console.log('🌐 Browser will remain open. Press Ctrl+C to close.');
      await new Promise(() => {});
    } else {
      console.log('⏳ Waiting 5 seconds before closing...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await browser.close();
      console.log('👋 Browser closed');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (!CONFIG.KEEP_BROWSER_OPEN) {
      await browser.close();
    }
    process.exit(1);
  }
}

loginToNetSuite();

