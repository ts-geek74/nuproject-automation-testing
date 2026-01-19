const { test: setup, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const authFile = '.auth/state.json';

setup('authenticate', async ({ page }) => {
    console.log('--- Starting Subagent-aligned Auth Setup ---');
    await page.goto('https://app.omnigrowthos.io/auth/login');

    // Ensure the .auth directory exists
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    // Wait for the form to be ready
    await page.waitForSelector('input[id*="form-item"]');

    // Fill credentials using selectors that worked for subagent
    const emailInput = page.locator('input[id*="form-item"][placeholder*="example.com"]');
    const passwordInput = page.locator('input[id*="form-item"]').nth(1);
    const loginButton = page.getByRole('button', { name: 'Login', exact: true });

    await emailInput.fill('Shopify@omnigrowthos.com');
    await passwordInput.fill('Shopify@1234');
    await loginButton.click();

    // Wait for the app to load
    console.log('Waiting for sidebar...');
    await expect(page.getByLabel('Toggle Sidebar')).toBeVisible({ timeout: 40000 });

    // Important: Wait for data on a page before saving state to ensure session is fully settled
    console.log('Warming up stores page...');
    await page.goto('https://app.omnigrowthos.io/stores');

    // Wait for the "No results." to NOT be the only thing, or for actual cells to appear
    await page.waitForFunction(() => {
        const rows = document.querySelectorAll('tbody tr');
        if (rows.length === 0) return false;
        const cells = rows[0].querySelectorAll('td');
        if (cells.length < 2) return false;
        const text = cells[0].innerText.trim();
        return text !== '' && !text.includes('No results.');
    }, { timeout: 40000 }).catch(e => console.log('Warning: No data seen during setup warmup, but proceeding...'));

    console.log('Saving storage state.');
    await page.context().storageState({ path: authFile });
});
