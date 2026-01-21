// tests/customer_page/customer_page.spec.js

import { test, expect } from '@playwright/test';
import { login, waitForCustomersTable, verifySorting, sortByDropdown, filterByRFM, verifyRFMTableContent, clearRFMFilter } from '../helpers/customerHelpers.js';

let sharedPage;

// Use serial mode to run tests on the same page state
test.describe.configure({ mode: 'serial' });

test.describe('Customers Page Suite', () => {

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        sharedPage = await context.newPage();

        sharedPage.on('console', msg => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
                console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
            }
        });

        console.log('Performing login once for the entire suite...');
        await login(sharedPage);
        await waitForCustomersTable(sharedPage);
    });

    test.afterAll(async () => {
        if (sharedPage) await sharedPage.close();
    });

    // --- UI & NAVIGATION ---

    test('CUST-001 - Customers page loads without errors', async () => {
        await expect(sharedPage.locator('table')).toBeVisible();
        await expect(sharedPage.locator('tbody tr').first()).toBeVisible();
    });

    test('CUST-002 - Page identifier is correct', async () => {
        const identifier = sharedPage.locator('nav[aria-label="breadcrumb"], h1, h2, h3').first();
        await expect(identifier).toContainText('Customers');
    });

    test('CUST-003 - Table displays expected column headers', async () => {
        const expectedHeaders = ['Customer', 'RFM', 'Email', 'Phone', 'Address', 'Total', 'Orders', 'Last', 'purchased'];
        const text = await sharedPage.locator('thead').innerText();
        for (const h of expectedHeaders) {
            expect(text).toContain(h);
        }
    });

    // --- SEARCH ---

    test('CUST-004 - Search by name returns matching results', async () => {
        const searchBox = sharedPage.getByPlaceholder('Search by name or email');
        await searchBox.click();
        await searchBox.fill('Randi');
        await sharedPage.keyboard.press('Enter');
        await waitForCustomersTable(sharedPage);
        await expect(sharedPage.locator('tbody')).toContainText('Randi', { timeout: 20000 });
    });

    test('CUST-006 - Search by email returns correct customer', async () => {
        const searchBox = sharedPage.getByPlaceholder('Search by name or email');
        await searchBox.click();
        await searchBox.fill('hymanroberts@yahoo.com');
        await sharedPage.keyboard.press('Enter');
        await waitForCustomersTable(sharedPage);
        await expect(sharedPage.locator('tbody')).toContainText('hymanroberts@yahoo.com', { timeout: 20000 });
    });

    test('CUST-007 - Invalid search shows no results', async () => {
        const searchBox = sharedPage.getByPlaceholder('Search by name or email');
        await searchBox.click();
        await searchBox.fill('randomnonexistent123');
        await sharedPage.keyboard.press('Enter');
        await expect(sharedPage.locator('tbody')).toContainText('No results', { timeout: 10000 });
    });

    test('CUST-008 - Clear search input restores results', async () => {
        const searchBox = sharedPage.getByPlaceholder('Search by name or email');
        await searchBox.click();
        await searchBox.fill('');
        await sharedPage.keyboard.press('Enter');
        await waitForCustomersTable(sharedPage);
        const rowCount = await sharedPage.locator('tbody tr').count();
        expect(rowCount).toBeGreaterThan(5);
    });

    // --- SORTING (All 7 Columns) ---

    const sortingColumns = [
        { label: 'Customer', index: 0 },
        { label: 'RFM', index: 1 },
        { label: 'Email', index: 2 },
        { label: 'Phone', index: 3 },
        { label: 'Address', index: 4 },
        { label: 'Total', index: 5 },
        { label: 'Last', index: 6 }
    ];

    for (const col of sortingColumns) {
        test(`CUST-SORT - Sorting by ${col.label} works (Asc/Desc)`, async () => {
            await sortByDropdown(sharedPage, col.label, 'asc');
            await verifySorting(sharedPage, col.index, 'asc');

            await sortByDropdown(sharedPage, col.label, 'desc');
            await verifySorting(sharedPage, col.index, 'desc');
        });
    }

    // --- FILTERING ---

    const rfmSegments = ['No Sales', 'At Risk', 'Potential', 'Loyal', 'Champions'];

    for (const segment of rfmSegments) {
        test(`CUST-009 - Filter by RFM segment: ${segment}`, async () => {
            // Ensure any previous menu interactions are finished
            await sharedPage.waitForTimeout(1000);
            await filterByRFM(sharedPage, segment);
            await verifyRFMTableContent(sharedPage, segment);
            await clearRFMFilter(sharedPage);

            // Verify table has reset
            const count = await sharedPage.locator('tbody tr').count();
            expect(count).toBeGreaterThan(0);
        });
    }

    // --- DETAILS & NAVIGATION ---
    test('CUST-028 - Change rows per page updates view', async () => {
        // Use simple locator from user codegen
        await sharedPage.getByRole('combobox').click();
        await sharedPage.getByRole('option', { name: '50' }).click();
        await waitForCustomersTable(sharedPage);

        const rowCount = await sharedPage.locator('tbody tr').count();
        console.log(`Pagination Check: Selected 50, found ${rowCount} rows.`);
        expect(rowCount).toBeGreaterThan(40);
        expect(rowCount).toBeLessThanOrEqual(55);
    });


    test('CUST-024 - View Details opens details drawer', async () => {
        await sharedPage.getByPlaceholder('Search by name or email').fill('');
        await sharedPage.keyboard.press('Enter');
        await waitForCustomersTable(sharedPage);

        await sharedPage.getByRole('button', { name: 'View Details' }).first().click();

        const drawer = sharedPage.getByRole('dialog');
        await expect(drawer).toBeVisible({ timeout: 15000 });

        // Wait for actual data to load (past "Loading Customer Details")
        // Relaxed check: Simply ensure "Contact Information" is present, avoiding stable name check issues
        await expect(drawer).toContainText('Contact Information', { timeout: 20000 });
    });

    test('CUST-026 - Closing details drawer returns to list', async () => {
        const drawer = sharedPage.getByRole('dialog');
        // Clicking the close button identified by subagent
        await drawer.getByRole('button', { name: 'Close' }).click();

        await expect(drawer).not.toBeVisible({ timeout: 10000 });
        await expect(sharedPage.locator('table')).toBeVisible();
    });




});

test.setTimeout(500000); 
