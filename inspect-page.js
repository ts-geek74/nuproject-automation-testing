require('dotenv').config();
const { chromium } = require('@playwright/test');

(async () => {
    console.log('🔍 Inspecting login page structure...\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Navigate to login page
        await page.goto('https://app.omnigrowthos.io/auth/login?redirect=%2Fmap');
        console.log('✓ Navigated to:', page.url());

        // Wait for page to load
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Get page title
        const title = await page.title();
        console.log('  Page title:', title);

        // Find all buttons
        console.log('\n📋 Finding buttons on the page...');
        const buttons = await page.locator('button').all();
        console.log(`  Found ${buttons.length} buttons:`);

        for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].textContent().catch(() => '');
            const classes = await buttons[i].getAttribute('class').catch(() => '');
            const id = await buttons[i].getAttribute('id').catch(() => '');
            console.log(`    ${i + 1}. Text: "${text.trim()}" | Class: "${classes}" | ID: "${id}"`);
        }

        // Find main container
        console.log('\n📋 Looking for main containers...');
        const containers = await page.locator('div[class*="login"], div[class*="auth"], div[class*="container"], main, form').all();
        console.log(`  Found ${containers.length} potential containers:`);

        for (let i = 0; i < Math.min(containers.length, 5); i++) {
            const classes = await containers[i].getAttribute('class').catch(() => '');
            const id = await containers[i].getAttribute('id').catch(() => '');
            console.log(`    ${i + 1}. Class: "${classes}" | ID: "${id}"`);
        }

        // Get page HTML structure (first 2000 chars)
        console.log('\n📋 Page HTML structure (partial):');
        const bodyHTML = await page.locator('body').innerHTML();
        console.log(bodyHTML.substring(0, 2000));

        console.log('\n✓ Inspection complete. Press Ctrl+C to close browser.');

        // Keep browser open for manual inspection
        await page.waitForTimeout(60000);

    } catch (error) {
        console.error('✗ Error:', error.message);
    } finally {
        await browser.close();
    }
})();
