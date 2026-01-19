require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { MicrosoftLoginPage } = require('../../pages/MicrosoftLoginPage');
const { DashboardPage } = require('../../pages/DashboardPage');

test.describe('Simple Microsoft Login', () => {
    let loginPage;
    let dashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        await loginPage.goto();
    });

    test('Perform simple Microsoft login', async ({ page }) => {
        // Check if session reuse was successful (redirected to dashboard/app instead of staying on login)
        const redirected = await page.waitForURL(/.*dashboard|.*home|.*app|.*map/, { timeout: 5000 }).catch(() => false);
        
        if (redirected || await dashboardPage.isLoggedIn()) {
            console.log('Valid session found! Skipping login steps.');
        } else {
            console.log('No valid session found. Proceeding with login...');
            
            // Prepare credentials
            const testEmail = process.env.MS_TEST_EMAIL;
            const testPassword = process.env.MS_TEST_PASSWORD;

            // 1. Click "Login with Microsoft"
            const popupPromise = page.waitForEvent('popup');
            await loginPage.clickMicrosoftLogin();

            // 2. Handle the Popup
            const popup = await popupPromise;
            await popup.waitForLoadState('domcontentloaded');
            console.log('Popup opened:', popup.url());

            // 3. Perform Login Logic inside Popup
            const msLoginPage = new MicrosoftLoginPage(popup);

            // This helper handles: Email -> Next -> Password -> Sign in -> Wait for 2FA -> Stay signed in
            await msLoginPage.login(testEmail, testPassword, true);
        }

        // 4. Verify Success
        // Wait for the popup to close automatically (standard OAuth behavior) or redirect to happen on main page
        // We verify the main page URL changes to the app
        await expect(page).toHaveURL(/.*dashboard|.*home|.*app|.*map/, { timeout: 60000 });

        if (await dashboardPage.isLoggedIn()) {
            console.log('Login successful! Home screen visible.');
            // SAVE STATE for next run
            await page.context().storageState({ path: '.auth/state.json' });
            console.log('Session state saved to .auth/state.json');
        } else {
            console.log('Login check failed, but URL matched.');
        }
        expect(await dashboardPage.isLoggedIn()).toBeTruthy();

        console.log('Staying on home screen for 15 seconds for observation...');
        // Increased to allow user to see the result
        await page.waitForTimeout(15000);
    });
});
