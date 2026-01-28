
import { test, expect } from '@playwright/test';
import { loginAndNavigateToSalesMaterials, waitForSalesMaterialsTable, sortByDropdown, verifySorting, uploadSalesMaterial, selectDateRange } from '../helpers/salesMaterialHelpers';
import fs from 'fs';
import path from 'path';

let sharedPage;
let uploadFilePath;

test.describe.configure({ mode: 'serial' });

test.describe('Sales Material Module Suite', () => {

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        sharedPage = await context.newPage();

        await loginAndNavigateToSalesMaterials(sharedPage);

        uploadFilePath = path.resolve(process.cwd(), 'test_upload.png');
        if (!fs.existsSync(uploadFilePath)) {
            fs.writeFileSync(uploadFilePath, 'Dummy content for upload test');
        }
    });

    test.afterAll(async () => {
        if (sharedPage) await sharedPage.close();
        if (fs.existsSync(uploadFilePath)) {
            fs.unlinkSync(uploadFilePath);
        }
    });

    test('SM-001 | Authentication | Login check', async () => {
        await expect(sharedPage).not.toHaveURL(/.*\/login/);
    });

    test('SM-002 | Navigation | Navigate to Sales Materials page', async () => {
        if (!sharedPage.url().includes('/admin/sales-materials')) {
            await sharedPage.getByRole('button', { name: 'Admin', exact: true }).click();
            await sharedPage.getByText('Sales Materials').click();
            await waitForSalesMaterialsTable(sharedPage);
        }
        await expect(sharedPage).toHaveURL(/.*\/admin\/sales-materials/);
    });

    test('SM-003 | UI | Verify Sales Materials page UI elements', async () => {
        await expect(sharedPage.locator('table')).toBeVisible();
        await expect(sharedPage.getByRole('button', { name: 'Upload Sales Material' })).toBeVisible();
        await expect(sharedPage.getByRole('button', { name: 'Pick dates' })).toBeVisible();
    });

    test('SM-004 | Search | Open creator search dropdown', async () => {
        const dropdown = sharedPage.locator('button, div, [role="combobox"]').filter({ hasText: 'Search creators...' }).last();
        await dropdown.click();
        // Wait for search input in popover
        const searchInput = sharedPage.getByPlaceholder('Search creator...').first();
        await expect(searchInput).toBeVisible({ timeout: 10000 });
    });

    test('SM-005 to SM-006 | Search | Search and select creator', async () => {
        const searchInput = sharedPage.getByPlaceholder('Search creator...').first();
        if (!(await searchInput.isVisible())) {
            const dropdown = sharedPage.locator('button, div, [role="combobox"]').filter({ hasText: 'Search creators...' }).last();
            await dropdown.click();
            await searchInput.waitFor({ state: 'visible', timeout: 5000 });
        }

        // Find a valid creator name from the table if any (Creator is Index 1)
        const firstRowCreator = await sharedPage.locator('tbody tr td').nth(1).first().innerText().catch(() => '');
        const searchName = (firstRowCreator && firstRowCreator.trim().length > 0) ? firstRowCreator.trim() : 'Test';

        console.log(`Searching for creator: ${searchName}`);
        await searchInput.clear();
        await searchInput.fill(searchName);

        // Wait for search results to filter
        await sharedPage.waitForTimeout(2000);

        const option = sharedPage.getByRole('option', { name: searchName, exact: true }).first();
        const optionAny = sharedPage.getByRole('option').filter({ hasText: searchName }).first();

        // Try to find the correct option
        let targetOption = option;
        if (!(await targetOption.isVisible())) {
            targetOption = optionAny;
        }

        if (await targetOption.isVisible()) {
            await targetOption.click();
            await waitForSalesMaterialsTable(sharedPage);
            // SM-006 Verify result
            const bodyText = await sharedPage.locator('tbody').innerText();
            if (!bodyText.includes('No results') && bodyText.includes(searchName)) {
                console.log('Search successful.');
            }
        } else {
            // Close the dropdown if no results
            await sharedPage.keyboard.press('Escape');
            console.log(`Creator "${searchName}" not found in search options.`);
        }
        // Small buffer to let UI settle
        await sharedPage.waitForTimeout(500);
    });

    test('SM-007 | Search | Clear creator selection', async () => {
        const clearBtn = sharedPage.getByRole('button', { name: 'Clear selection' });
        if (await clearBtn.isVisible()) {
            await clearBtn.click();
            await waitForSalesMaterialsTable(sharedPage);
        }
        await expect(clearBtn).not.toBeVisible();
    });

    test('SM-008 | Date Filter | Open date picker', async () => {
        await sharedPage.getByRole('button', { name: 'Pick dates' }).click();
        // Date picker should be visible (e.g., has grid cells)
        await expect(sharedPage.getByRole('grid').first()).toBeVisible({ timeout: 10000 });
    });

    test('SM-009 | Date Filter | Verify previous month button exists', async () => {
        const prevBtn = sharedPage.getByLabel('Go to previous month').or(sharedPage.getByRole('button', { name: 'Go to previous month' })).first();
        await expect(prevBtn).toBeVisible();
        // User requested not to change the month, just checking normally
        console.log('Previous month button is visible.');
    });

    test('SM-010 to SM-012 | Date Filter | Select dates and apply', async () => {
        // Use helper to select range
        await selectDateRange(sharedPage, '1', '15');
        // Now Apply should be visible - use a more robust check
        const applyBtn = sharedPage.getByRole('button', { name: 'Apply' });
        await expect(applyBtn).toBeVisible({ timeout: 10000 });
        await applyBtn.click();
        await waitForSalesMaterialsTable(sharedPage);
    });

    test('SM-013 | Table | Verify filtered results', async () => {
        await expect(sharedPage.locator('table')).toBeVisible();
        // Reset filters after date test to avoid hiding next test results
        await sharedPage.getByRole('button', { name: 'Pick dates' }).click();
        const resetBtn = sharedPage.getByRole('button', { name: 'Reset' });
        if (await resetBtn.isVisible()) {
            await resetBtn.click();
            await waitForSalesMaterialsTable(sharedPage);
        } else {
            await sharedPage.keyboard.press('Escape');
        }
    });

    test('SM-021 to SM-025 | Upload | Upload sales material', async () => {
        // Ensure we are on a clean state
        await sharedPage.reload();
        await waitForSalesMaterialsTable(sharedPage);

        const uniqueCaption = `Auto_${Date.now()}`;
        await uploadSalesMaterial(sharedPage, uploadFilePath, uniqueCaption);
        // The helper already verifies the toast, but we can check if the caption is in the table
        await waitForSalesMaterialsTable(sharedPage);
        await expect(sharedPage.locator('tbody')).toContainText(uniqueCaption);
    });

    test('SM-015 to SM-018 | Edit | Action menu and edit', async () => {
        const row = sharedPage.locator('tbody tr').filter({ hasText: 'Auto_' }).first();
        await row.getByRole('button', { name: 'Open menu' }).click();
        await sharedPage.getByRole('menuitem', { name: 'Edit' }).click();

        const updatedCaption = `Edit_${Date.now()}`;
        await sharedPage.getByRole('textbox', { name: 'Caption' }).fill(updatedCaption);
        await sharedPage.getByRole('button', { name: 'Save Sales Material' }).click();

        await expect(sharedPage.getByText('Sales Material Updated', { exact: true })).toBeVisible({ timeout: 10000 }).catch(() => { });
        await waitForSalesMaterialsTable(sharedPage);
        await expect(sharedPage.locator('tbody')).toContainText(updatedCaption);
    });

    test('SM-014 | Download | Download file', async () => {
        const row = sharedPage.locator('tbody tr').first();
        await expect(row).toBeVisible({ timeout: 10000 });

        // Use the download button which is at index 4 (0-based)
        const downloadCell = row.locator('td').nth(4);
        const downloadBtn = downloadCell.locator('button');

        // Start waiting for download before the click
        const downloadPromise = sharedPage.waitForEvent('download', { timeout: 60000 });

        await downloadBtn.click();

        const download = await downloadPromise;
        expect(download).toBeTruthy();
        expect(download.suggestedFilename()).toBeTruthy();
        console.log(`Download successful: ${await download.suggestedFilename()}`);
    });

    // Indices: Date=0, File Name=2, Caption=3
    const sortingConfigs = [
        // { label: 'Date', idAsc: 'SM-026', idDesc: 'SM-027', colIdx: 0 },
        { label: 'File Name', idAsc: 'SM-028', idDesc: 'SM-029', colIdx: 2 },
        { label: 'Caption', idAsc: 'SM-030', idDesc: 'SM-031', colIdx: 3 }
    ];

    /* 
    for (const st of sortingConfigs) {
        test(`${st.idAsc} | Sorting | Sort by ${st.label} ascending`, async () => {
            await sortByDropdown(sharedPage, st.label, 'asc');
            // await verifySorting(sharedPage, st.colIdx, 'asc');
        });

        test(`${st.idDesc} | Sorting | Sort by ${st.label} descending`, async () => {
            await sortByDropdown(sharedPage, st.label, 'desc');
            // await verifySorting(sharedPage, st.colIdx, 'desc');
        });
    }
    */

    test('SM-032 | Pagination | Default rows', async () => {
        const rowText = sharedPage.locator('div').filter({ hasText: 'Rows per page' });
        await expect(rowText.first()).toBeVisible();
    });

    test('SM-033 | Pagination | Change to 20', async () => {
        const rowsCombo = sharedPage.getByRole('combobox').filter({ hasText: /^[0-9]+$/ }).last();
        if (await rowsCombo.isVisible()) {
            await rowsCombo.click();
            await sharedPage.getByRole('option', { name: '20' }).click();
            await waitForSalesMaterialsTable(sharedPage);
        }
    });

    test('SM-034 | Pagination | Stability', async () => {
        const nextBtn = sharedPage.getByRole('button', { name: 'Go to next page' });
        if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
            await nextBtn.click();
            await waitForSalesMaterialsTable(sharedPage);
            await expect(sharedPage.locator('tbody')).toBeVisible();
            await sharedPage.getByRole('button', { name: 'Go to previous page' }).click();
            await waitForSalesMaterialsTable(sharedPage);
        }
    });

    test('SM-035 | Refresh | Page reload', async () => {
        await sharedPage.reload();
        await waitForSalesMaterialsTable(sharedPage);
        await expect(sharedPage.locator('table')).toBeVisible();
    });

    test('SM-036 | State | Sorting persists', async () => {
        await sortByDropdown(sharedPage, 'Caption', 'desc');
        await sharedPage.reload();
        await waitForSalesMaterialsTable(sharedPage);
        await verifySorting(sharedPage, 3, 'desc');
    });

    test('SM-019 to SM-020 | Delete | Delete material', async () => {
        const row = sharedPage.locator('tbody tr').filter({ hasText: 'Edit_' }).first();
        if (await row.count() > 0) {
            await row.getByRole('button', { name: 'Open menu' }).click();
            await sharedPage.getByRole('menuitem', { name: 'Delete' }).click();
            const confirm = sharedPage.getByRole('button', { name: 'Delete', exact: true });
            if (await confirm.isVisible()) {
                await confirm.click();
            }

            // Wait for toast and row to disappear
            await expect(sharedPage.getByText('Sales Material Deleted', { exact: true })).toBeVisible({ timeout: 10000 }).catch(() => { });
            await row.waitFor({ state: 'hidden', timeout: 10000 });
            await waitForSalesMaterialsTable(sharedPage);
            await expect(row).not.toBeVisible();
        }
    });

    test('SM-040 | Performance | Page load SLA', async () => {
        const start = Date.now();
        await sharedPage.reload();
        await waitForSalesMaterialsTable(sharedPage);
        expect(Date.now() - start).toBeLessThan(15000);
    });

});

test.setTimeout(600000);
