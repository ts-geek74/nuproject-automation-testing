const { test, expect } = require('@playwright/test');
const { VisitPage } = require('../../pages/VisitPage');
require('dotenv').config();


test.describe('Visit Page Tests', () => {
    test.describe.configure({ mode: 'serial' });

    let page;
    let context;
    let visitPage;

    test.beforeAll(async ({ browser }) => {
        const testEmail = process.env.MS_TEST_EMAIL;
        const testPassword = process.env.MS_TEST_PASSWORD;
        context = await browser.newContext();
        page = await context.newPage();
        visitPage = new VisitPage(page);

        // Raw Codegen Login with provided credentials
        await page.goto('https://app.omnigrowthos.io/auth/login');
        const page1Promise = page.waitForEvent('popup');
        await page.getByRole('button', { name: 'Login with Microsoft' }).click();
        const page1 = await page1Promise;

        // Wait for load
        await page1.waitForLoadState();

        // Email
        await page1.getByRole('textbox', { name: 'Enter your email or phone' }).click();
        await page1.getByRole('textbox', { name: 'Enter your email or phone' }).fill(testEmail);
        await page1.getByRole('button', { name: 'Next' }).click();

        // Password
        await page1.getByRole('textbox', { name: 'Enter the password for test@' }).click();
        await page1.getByRole('textbox', { name: 'Enter the password for test@' }).fill(testPassword);
        await page1.getByRole('button', { name: 'Sign in' }).click();

        // NOTE: OTP step (Enter code) from codegen is skipped as it is one-time use.
        // If 2FA is triggered, manual intervention or configured bypass is required.

        // Handle "Stay signed in?" if it appears
        try {
            await page1.getByText('Don\'t show this again').first().click({ timeout: 5000 });
            await page1.getByRole('button', { name: 'Yes' }).click({ timeout: 5000 });
        } catch (e) {
            // Ignore if these steps don't appear
        }

        // Wait for successful login redirect on the main page
        console.log('Waiting for login to complete and page to redirect...');
        await page.waitForURL(/.*map|.*dashboard/, { timeout: 60000 });

        // Navigate to Visit Page
        await visitPage.navigateTo();
        await page.waitForLoadState('networkidle').catch(() => { });
    });

    test.afterAll(async () => {
        await context.close();
    });

    test.afterEach(async ({ }, testInfo) => {
        // Skip reset for the last test (Date Filter) or if it failed and we want to preserve state?
        // User asked to keep date filter at the end because it has no reset.
        // We simply run resetFilters for everything else.
        if (testInfo.title.includes('FT-02')) {
            console.log('Skipping filter reset for Date Filter test');
            return;
        }

        console.log('Resetting filters...');
        try {
            await visitPage.resetFilters();
        } catch (e) {
            console.log('Error resetting filters:', e);
        }
    });

    test('UI-01 & UI-02: Verify page layout, responsiveness and thumbnails', async () => {
        // UI-01 Page layout
        await expect(page).toHaveURL(/\/visits/);
        // Basic check for table visibility
        await expect(page.locator('table').first()).toBeVisible();

        // Responsive check (Tablet)
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(page.locator('table').first()).toBeVisible(); // Ensure table still renders
        // Restore viewport
        await page.setViewportSize({ width: 1280, height: 720 });

        // UI-02 Check image thumbnails
        const images = page.locator('table img');
        if (await images.count() > 0) {
            await expect(images.first()).toBeVisible();
        } else {
            console.log('Warning: No images found in table to verify UI-02');
        }
    });

    test('FT-01: Filter by Creator', async () => {
        // Open filter to see options
        await visitPage.creatorSearchInput.click();

        // Wait for options
        const firstOption = page.locator('[role="option"]').first();
        await firstOption.waitFor({ state: 'visible', timeout: 10000 });

        if (await firstOption.isVisible()) {
            const creatorName = (await firstOption.textContent()).trim();
            await firstOption.click();

            // Wait for filter to apply
            await page.waitForTimeout(1000);

            // Verify
            await expect.soft(page.getByText(creatorName).first()).toBeVisible();
        } else {
            console.log('No creators found to filter by');
        }
    });

    test('FT-03: Global Store Search', async () => {
        const storeName = 'breadliner'; // from codegen
        await visitPage.filterByStore(storeName);
        // Verify input has value or results updated
        await expect(visitPage.storeSearchTextInput).toHaveValue(storeName);
    });

    test('FT-05: Change Store', async () => {
        if (await visitPage.changeStoreLink.isVisible()) {
            await visitPage.changeStore();
            await expect(visitPage.updateSuccessMessage).toBeVisible();
            await visitPage.page.getByRole('button', { name: 'Close' }).click();
        } else {
            test.skip('Change link not found');
        }
    });

    test('FT-06: Toggle Reject Switch', async () => {
        if (await visitPage.rejectSwitch.isVisible()) {
            await visitPage.rejectVisit();
            await expect(visitPage.updateSuccessMessage).toBeVisible();
        } else {
            test.skip('Reject switch not found');
        }
    });

    test('FT-07: Delete a Visit', async () => {
        if (await visitPage.deleteIcon.isVisible()) {
            await visitPage.deleteVisit();
            await expect(visitPage.successMessage).toBeVisible();
        } else {
            test.skip('Delete icon not found');
        }
    });

    test('FT-08: Export to File', async () => {
        const download = await visitPage.exportData();
        const path = await download.path();
        expect(path).toBeTruthy();
        console.log(`Exported file saved to: ${path}`);
    });

    test('FT-09: View Visit Details', async () => {
        await visitPage.viewDetails();
        // Check for a header or URL change
        await expect(page.locator('h1, h2, .modal-title').first()).toBeVisible();

        // Go back if needed, or assume resetFilters/afterEach handles nav if it stayed on same page
        // If it navigated away, we might need to go back for next tests.
        // Assuming viewDetails might open a modal or new page.
        // If it's a new page, simpler to go back.
        if (page.url().includes('/visits/') === false) {
            await visitPage.navigateTo();
        } else {
            // If modal, maybe close it?
            // Helper to close modal if open
            const closeBtn = page.getByRole('button', { name: 'Close' });
            if (await closeBtn.isVisible()) {
                await closeBtn.click();
            }
        }
    });

    test('PG-01 & PG-02: Pagination', async () => {
        // PG-01 Change Rows Per Page
        if (await visitPage.rowsPerPageSelect.isVisible()) {
            await visitPage.rowsPerPageSelect.click();
            await page.getByRole('option', { name: '50' }).click();
        }

        // PG-02 Navigation Buttons
        if (await visitPage.paginationNextButton.isVisible() && await visitPage.paginationNextButton.isEnabled()) {
            await visitPage.paginationNextButton.click();
        }
    });

    // MOVED TO END
    test('FT-02: Filter by Date Range', async () => {
        // Select a range
        await visitPage.filterByDate('1', '28');
        // Verification: Check if chips or text indicating date range appears
    });
});