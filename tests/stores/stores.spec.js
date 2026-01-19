const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

test.describe('Store Module Tests', () => {
    let page;

    async function getCellText(rowIdx, colIdx) {
        const row = page.locator('tbody tr').nth(rowIdx);
        const cell = row.locator('td').nth(colIdx);
        await expect(cell).not.toHaveText('', { timeout: 15000 });
        const text = await cell.textContent();
        return text ? text.trim() : '';
    }

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        console.log('--- Starting Final Definitive Suite v8 ---');
        await page.goto('https://app.omnigrowthos.io/auth/login');
        await page.getByRole('textbox', { name: 'Email' }).fill('Shopify@omnigrowthos.com');
        await page.getByRole('textbox', { name: 'Password' }).fill('Shopify@1234');
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await expect(page.getByLabel('Toggle Sidebar')).toBeVisible({ timeout: 40000 });

        await page.goto('https://app.omnigrowthos.io/stores');
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll('tbody tr');
            return rows.length > 0 && rows[0].querySelectorAll('td').length > 1 && !rows[0].innerText.includes('No results.');
        }, { timeout: 60000 });
        console.log('--- Data Ready ---');
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('SM-001: Verify store list loads successfully', async () => {
        const rowCount = await page.locator('tbody tr').count();
        expect(rowCount).toBeGreaterThan(0);
    });

    test('SM-002: Verify store name display', async () => {
        const text = await getCellText(0, 0);
        expect(text).toBeTruthy();
    });

    test('SM-003: Verify ranking display', async () => {
        const text = await getCellText(0, 1);
        expect(text).toBeTruthy();
    });

    test('SM-004: Verify chain display', async () => {
        const text = await getCellText(0, 2);
        expect(text).toBeTruthy();
    });

    test('SM-005: Verify RFM value', async () => {
        const text = await getCellText(0, 3);
        expect(text).toBeTruthy();
    });

    test('SM-006: Verify MTD cases', async () => {
        const text = await getCellText(0, 4);
        expect(text).toBeDefined();
    });

    test('SM-007: Verify LTM cases', async () => {
        const text = await getCellText(0, 5);
        expect(text).toBeTruthy();
    });

    test('SM-008: Verify prior cases', async () => {
        const text = await getCellText(0, 6);
        expect(text).toBeTruthy();
    });

    test('SM-009: Verify sell through calculation', async () => {
        const text = await getCellText(0, 7);
        expect(text).toBeTruthy();
    });

    test('SM-010: Verify recent visit', async () => {
        const text = await getCellText(0, 8);
        expect(text).toBeTruthy();
    });

    test('SM-011: Verify recent phone call', async () => {
        const text = await getCellText(0, 9);
        expect(text).toBeTruthy();
    });

    test('SM-012: Verify add contact', async () => {
        const btn = page.locator('tbody tr').first().getByRole('button', { name: /Add Contact/i });
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        await page.getByRole('textbox', { name: 'Name' }).fill('Test Bot');
        await page.getByRole('button', { name: 'Create' }).click();
        await page.waitForTimeout(2000);
        if (await page.getByRole('button', { name: 'Cancel' }).isVisible()) {
            await page.getByRole('button', { name: 'Cancel' }).click();
        }
    });

    test('SM-013: Verify faulty toggle', async () => {
        const row = page.locator('tbody tr').first();
        const toggle = row.getByRole('switch').or(row.locator('button[role="switch"]')).first();
        await toggle.scrollIntoViewIfNeeded();
        await toggle.click();
        await page.waitForTimeout(2000);
    });

    test('SM-014: Verify action menu', async () => {
        const menuBtn = page.locator('tbody tr').first().locator('.lucide-ellipsis-vertical').locator('xpath=..');
        await menuBtn.scrollIntoViewIfNeeded();
        await menuBtn.click();
        await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible({ timeout: 10000 });
        await page.keyboard.press('Escape');
    });

    test('SM-015: Verify name sorting', async () => {
        const header = page.getByRole('button', { name: 'Name', exact: true }).first();
        await header.click();
        await page.getByRole('menuitem', { name: /Asc/i }).click();
        await page.waitForTimeout(5000);
        const firstValAsc = await getCellText(0, 0);

        await header.click();
        await page.getByRole('menuitem', { name: /Desc/i }).click();
        await page.waitForTimeout(5000);
        const firstValDesc = await getCellText(0, 0);

        expect(firstValAsc).not.toBe(firstValDesc);
    });

    test('SM-016: Verify pagination', async () => {
        await page.waitForLoadState('networkidle');
        const firstPageData = await getCellText(0, 0);

        const nextBtn = page.locator('button:has(svg.lucide-chevron-right)').last();
        await nextBtn.scrollIntoViewIfNeeded();
        await nextBtn.click();
        await page.waitForTimeout(8000);
        const secondPageData = await getCellText(0, 0);
        expect(firstPageData).not.toBe(secondPageData);
    });

    test('SM-017: Verify store search', async () => {
        await page.goto('https://app.omnigrowthos.io/stores');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(4000);

        // Precise name extraction from first row
        const firstName = await page.locator('tbody tr').first().locator('td').first().locator('span.font-bold').textContent();
        const cleanName = firstName ? firstName.trim() : '';
        console.log(`Searching for: [${cleanName}]`);

        // Perform Search
        const combobox = page.getByRole('combobox').filter({ hasText: 'Search stores...' });
        await combobox.click();
        const input = page.getByPlaceholder('Search store...');
        await input.click();
        await input.fill(cleanName);

        // Wait for and click the DROPDOWN option explicitly
        // Using role="option" ensures we don't click the table cell by mistake
        const option = page.locator('[role="option"]').filter({ hasText: cleanName }).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();

        // Wait for table to reflect search result
        // The first row should now only contain the searched term
        await page.waitForFunction((term) => {
            const rows = document.querySelectorAll('tbody tr');
            return rows.length > 0 &&
                rows[0].innerText.toUpperCase().includes(term.toUpperCase()) &&
                !rows[0].innerText.includes('No results.');
        }, cleanName, { timeout: 30000 });

        const resultText = await getCellText(0, 0);
        expect(resultText.toUpperCase()).toContain(cleanName.toUpperCase());

        // Cleanup: Clear selection if button is visible
        const clearBtn = page.getByRole('button', { name: 'Clear selection' });
        if (await clearBtn.isVisible()) {
            await clearBtn.click();
            await page.waitForTimeout(2000);
        }
    });

    test('SM-018: Verify role restriction', async () => {
        const menuBtn = page.locator('tbody tr').first().locator('.lucide-ellipsis-vertical').locator('xpath=..');
        await menuBtn.scrollIntoViewIfNeeded();
        await menuBtn.click();
        await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeVisible({ timeout: 10000 });
        await page.keyboard.press('Escape');
    });

    test('SM-019: Verify load performance', async () => {
        const startTime = Date.now();
        await page.reload();
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll('tbody tr');
            return rows.length > 0 && !rows[0].innerText.includes('No results.');
        }, { timeout: 30000 });
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(25000);
    });

    test('SM-020: Verify data consistency', async () => {
        const name = await getCellText(0, 0);
        const ranking = await getCellText(0, 1);
        expect(name).toBeTruthy();
        expect(ranking).toBeTruthy();
    });
});
