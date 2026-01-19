const { MicrosoftLoginPage } = require('../../pages/MicrosoftLoginPage');

/**
 * Handles Microsoft OAuth login flow
 * Supports both same-page redirects and popup windows
 * 
 * @param {Page} page - Playwright page object
 * @param {string} email - Microsoft account email
 * @param {string} password - Microsoft account password
 * @param {Object} options - Additional options
 * @param {boolean} options.staySignedIn - Whether to stay signed in
 * @param {boolean} options.waitForRedirect - Whether to wait for redirect back to app
 * @param {number} options.timeout - Timeout for operations in ms
 */
async function loginWithMicrosoft(page, email, password, options = {}) {
    const {
        staySignedIn = false,
        waitForRedirect = true,
        timeout = 15000
    } = options;

    try {
        // Set up popup listener BEFORE clicking the login button
        const popupPromise = page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);

        // Small delay to ensure popup listener is ready
        await page.waitForTimeout(500);

        // Wait for popup to appear
        const popup = await popupPromise;

        if (popup) {
            // Handle popup flow
            console.log('✓ Microsoft login opened in popup window');
            console.log('  Popup URL:', popup.url());

            // Wait for popup to fully load
            await popup.waitForLoadState('domcontentloaded');

            const msLoginPage = new MicrosoftLoginPage(popup);
            await msLoginPage.login(email, password, staySignedIn);

            // Wait for popup to close after successful login
            await popup.waitForEvent('close', { timeout: 10000 }).catch(async () => {
                console.log('  Popup did not close automatically, closing manually...');
                await popup.close().catch(() => { });
            });
            console.log('✓ Popup closed - login completed');
        } else {
            // Handle same-page redirect flow
            console.log('✓ Microsoft login in same page (redirect flow)');
            console.log('  Current URL:', page.url());

            // Wait for Microsoft login page to load
            await page.waitForLoadState('domcontentloaded');

            const msLoginPage = new MicrosoftLoginPage(page);
            await msLoginPage.login(email, password, staySignedIn);
        }

        if (waitForRedirect) {
            // Wait for redirect back to CRM application
            console.log('  Waiting for redirect to application...');
            await page.waitForURL(/.*dashboard|.*home|.*app|.*map/, { timeout });
            console.log('✓ Redirected back to application:', page.url());
        }
    } catch (error) {
        console.error('✗ Microsoft login failed:', error.message);
        console.error('  Current URL:', page.url());
        throw error;
    }
}

/**
 * Save authentication state for reuse across tests
 * 
 * @param {Page} page - Playwright page object
 * @param {string} filePath - Path to save auth state
 */
async function saveAuthState(page, filePath) {
    const fs = require('fs');
    const path = require('path');

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    await page.context().storageState({ path: filePath });
    console.log(`Authentication state saved to ${filePath}`);
}

/**
 * Load authentication state from file
 * 
 * @param {string} filePath - Path to auth state file
 * @returns {boolean} - True if file exists, false otherwise
 */
function loadAuthState(filePath) {
    const fs = require('fs');
    return fs.existsSync(filePath);
}

/**
 * Clear saved authentication state
 * 
 * @param {string} filePath - Path to auth state file
 */
function clearAuthState(filePath) {
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Authentication state cleared: ${filePath}`);
    }
}

/**
 * Handle Microsoft login with retry logic
 * 
 * @param {Page} page - Playwright page object
 * @param {string} email - Microsoft account email
 * @param {string} password - Microsoft account password
 * @param {number} maxRetries - Maximum number of retry attempts
 */
async function loginWithMicrosoftRetry(page, email, password, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Login attempt ${attempt} of ${maxRetries}`);
            await loginWithMicrosoft(page, email, password);
            return; // Success
        } catch (error) {
            if (attempt === maxRetries) {
                throw new Error(`Login failed after ${maxRetries} attempts: ${error.message}`);
            }
            console.log(`Attempt ${attempt} failed, retrying...`);
            await page.waitForTimeout(2000); // Wait before retry
        }
    }
}

module.exports = {
    loginWithMicrosoft,
    saveAuthState,
    loadAuthState,
    clearAuthState,
    loginWithMicrosoftRetry
};
