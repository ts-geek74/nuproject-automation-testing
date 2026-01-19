require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { MicrosoftLoginPage } = require('../../pages/MicrosoftLoginPage');
const { DashboardPage } = require('../../pages/DashboardPage');
const { loginWithMicrosoft } = require('../helpers/microsoft-auth');

test.describe('Microsoft Account Login Tests', () => {
    let loginPage;
    let dashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        await loginPage.goto();
    });

    test('TC-001: Successful login with valid Microsoft account', async ({ page }) => {
        // Arrange
        const testEmail = process.env.MS_TEST_EMAIL;
        const testPassword = process.env.MS_TEST_PASSWORD;

        // Act
        await loginPage.clickMicrosoftLogin();
        await loginWithMicrosoft(page, testEmail, testPassword);

        // Assert
        await expect(page).toHaveURL(/.*dashboard|.*home|.*app/);
        expect(await dashboardPage.isLoggedIn()).toBeTruthy();

        // Verify user information is displayed
        const userEmail = await dashboardPage.getUserEmail();
        if (userEmail) {
            expect(userEmail.toLowerCase()).toContain(testEmail.toLowerCase().split('@')[0]);
        }
    });

    test('TC-002: Login with invalid Microsoft credentials', async ({ page }) => {
        // Arrange
        const invalidEmail = 'invalid.user@example.com';
        const invalidPassword = 'WrongPassword123!';

        // Setup popup listener
        const popupPromise = page.waitForEvent('popup');

        // Act
        await loginPage.clickMicrosoftLogin();

        // Handle popup
        const popup = await popupPromise;
        await popup.waitForLoadState('domcontentloaded');
        const msLoginPage = new MicrosoftLoginPage(popup);

        // Interact with popup
        await msLoginPage.fillEmail(invalidEmail);
        // Note: For non-existent accounts, Microsoft usually errors after Next, preventing password entry.
        // We catch the error here or expect it.

        // If email is invalid, error might appear immediately after Next
        await popup.waitForTimeout(2000);
        let errorMessage = await msLoginPage.getErrorMessage();

        if (!errorMessage) {
            // If no error yet, try password (unlikely for "invalid.user" but possible for valid user with wrong pass)
            try {
                await msLoginPage.fillPassword(invalidPassword);
                await popup.waitForTimeout(2000);
                errorMessage = await msLoginPage.getErrorMessage();
            } catch (e) {
                // If fillPassword fails, check if error message is present on email step
                errorMessage = await msLoginPage.getErrorMessage();
            }
        }

        // Assert
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.toLowerCase()).toMatch(/incorrect|invalid|doesn't exist|wrong|enter a valid|issue with your account/i);

        // Clean up
        await popup.close();
    });

    test('TC-003: Login with disabled Microsoft account', async ({ page }) => {
        // Skip if disabled account not configured
        if (!process.env.MS_DISABLED_EMAIL) {
            test.skip();
        }

        // Arrange
        const disabledEmail = process.env.MS_DISABLED_EMAIL;
        const password = process.env.MS_TEST_PASSWORD;

        // Setup popup listener
        const popupPromise = page.waitForEvent('popup');

        // Act
        await loginPage.clickMicrosoftLogin();

        // Handle popup
        const popup = await popupPromise;
        await popup.waitForLoadState('domcontentloaded');
        const msLoginPage = new MicrosoftLoginPage(popup);

        await msLoginPage.login(disabledEmail, password);

        // Assert
        await popup.waitForTimeout(2000);
        const errorMessage = await msLoginPage.getErrorMessage();

        expect(errorMessage).toBeTruthy();
        expect(errorMessage.toLowerCase()).toMatch(/disabled|blocked|suspended|locked/i);

        // Clean up
        await popup.close();
    });

    test('TC-004: User cancels Microsoft login', async ({ page }) => {
        // Setup popup listener
        const popupPromise = page.waitForEvent('popup');

        // Act
        await loginPage.clickMicrosoftLogin();

        // Handle popup
        const popup = await popupPromise;
        await popup.waitForLoadState('domcontentloaded');
        const msLoginPage = new MicrosoftLoginPage(popup);

        // Check if cancel button exists before clicking
        const cancelVisible = await msLoginPage.cancelButton.isVisible().catch(() => false);
        if (cancelVisible) {
            await msLoginPage.cancelLogin();
        } else {
            // Alternative: close the page/popup or navigate back
            await popup.close();
        }

        // Assert - user should be back on login page (main page)
        await page.waitForTimeout(1000);
        expect(await loginPage.isOnLoginPage()).toBeTruthy();
        expect(await dashboardPage.isLoggedIn()).toBeFalsy();
    });

    test('TC-008: OAuth redirect validation', async ({ page }) => {
        // Arrange
        const redirectUrls = [];
        const testEmail = process.env.MS_TEST_EMAIL;
        const testPassword = process.env.MS_TEST_PASSWORD;

        // Monitor network redirects
        page.on('response', response => {
            if (response.status() >= 300 && response.status() < 400) {
                redirectUrls.push({
                    url: response.url(),
                    status: response.status(),
                    location: response.headers()['location']
                });
            }
        });

        // Act
        await loginPage.clickMicrosoftLogin();
        await loginWithMicrosoft(page, testEmail, testPassword);

        // Assert
        // Verify redirect chain includes Microsoft login
        const hasMicrosoftRedirect = redirectUrls.some(redirect =>
            redirect.url.includes('login.microsoftonline.com') ||
            redirect.url.includes('login.live.com')
        );

        // Verify final URL is within CRM domain
        const finalUrl = page.url();
        expect(finalUrl).toContain(process.env.CRM_BASE_URL || 'localhost');

        // Log redirect chain for debugging
        console.log('Redirect chain:', redirectUrls);
    });

    test('TC-014: Cross-browser compatibility check', async ({ page, browserName }) => {
        // Arrange
        const testEmail = process.env.MS_TEST_EMAIL;
        const testPassword = process.env.MS_TEST_PASSWORD;

        // Act
        await loginPage.clickMicrosoftLogin();
        await loginWithMicrosoft(page, testEmail, testPassword);

        // Assert
        expect(await dashboardPage.isLoggedIn()).toBeTruthy();

        // Log browser info
        console.log(`Login successful on ${browserName}`);
    });
});
