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

    await expect(page.getByLabel('Toggle Sidebar')).toBeVisible({ timeout: 40000 });

    // Important: Wait for data on a page before saving state to ensure session is fully settled

    await page.goto('https://app.omnigrowthos.io/stores');

    // Wait for the "Rows per page" text which indicates the table pagination is loaded
    await page.waitForSelector('text=Rows per page', { timeout: 40000 });


    // Wait for actual store data - look for the "View on BattleMap" or "View on Google Map" text
    await page.locator('text=View on BattleMap').first().waitFor({ timeout: 40000 });


    // Give it an extra moment for any final lazy-loaded content
    await page.waitForTimeout(1500);


    await page.context().storageState({ path: authFile });


});