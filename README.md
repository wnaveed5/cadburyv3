NetSuite Static Frontend Clone

A lightweight static copy of the NetSuite dashboard UI for local demos.

Run Locally (Chrome)
cd capture/app.netsuite.com
python3 -m http.server 8000


Then open in Google Chrome:

http://localhost:8000/app/center/card.nl.html

## Navigation Bar Capture

To capture the entire navigation bar with all menus, submenus, styles, and scripts from the **live NetSuite page**:

### For NetSuite (Live Page)

1. Log into NetSuite and navigate to any page
2. Open Developer Console (F12 or Cmd+Option+I)
3. Copy and paste the **entire contents** of `Files/capture-netsuite-navbar.js` into the console
4. Press Enter
5. The script will automatically:
   - Find and capture the entire navigation bar HTML
   - Collect all related CSS styles (including inline styles)
   - Collect all related JavaScript
   - Force open all menus and submenus to capture their content
   - Generate and download a standalone HTML file
   - Copy the JSON payload to your clipboard

### Files

- **`Files/capture-netsuite-navbar.js`** ⭐ **Use this for live NetSuite pages** - Optimized for NetSuite interface
- **`Files/capture-navbar-complete.js`** - Generic capture script with standalone HTML generation
- **`Files/capture-navbar.js`** - Basic capture script (console output only)
- **`Files/test-navbar-capture.html`** - Test page to load and preview the scripts

### Output

The NetSuite script generates:
- A standalone HTML file with the captured navbar (downloads automatically as `netsuite-navbar-[timestamp].html`)
- JSON payload in console (also copied to clipboard)
- Global variables: `window.capturedNetSuiteNavBar` and `window.capturedNetSuiteNavBarHTML`
- Detailed console output with progress indicators

## Notes


(Use another port if 8000 is taken: 8080, 8001, 3000, etc.)

Notes

Frontend only — no backend or saving.

View-only demo.
