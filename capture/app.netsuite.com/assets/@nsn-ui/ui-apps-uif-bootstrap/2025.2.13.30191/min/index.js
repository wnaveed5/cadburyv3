// Stub module for NetSuite Static Demo
// This module is not available in static mode
export function bootstrapLegacy(data) {
    console.warn('[NetSuite Static Demo] bootstrapLegacy() called - UI bootstrap disabled in static mode');
    // Minimal initialization to prevent errors
    if (data && data.uif) {
        console.log('[NetSuite Static Demo] UI framework data loaded (static mode)');
    }
}

