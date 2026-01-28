
import { expect } from '@playwright/test';

/**
 * Perform login and navigate to Sales Materials page.
 */
export async function loginAndNavigateToSalesMaterials(page) {
    console.log('Performing login...');
    await page.goto('https://app.omnigrowthos.io/auth/login');

    // Fill credentials manually to ensure session is active
    await page.getByRole('textbox', { name: 'Email' }).fill('Shopify@omnigrowthos.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Shopify@1234');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for a navigation or an element that indicates successful login
    await page.waitForSelector('button:has-text("Admin"), a:has-text("Admin")', { timeout: 30000 });

    console.log('Navigating to Sales Materials page...');
    await page.goto('https://app.omnigrowthos.io/admin/sales-materials');

    await waitForSalesMaterialsTable(page);
}

/** 
 * Wait for the Sales Materials table to be visible and stable.
 */
export async function waitForSalesMaterialsTable(page) {
    await page.waitForSelector('table', { state: 'visible', timeout: 30000 });
    // Use a specific wait for table content rather than networkidle
    await page.waitForSelector('tbody tr', { state: 'visible', timeout: 15000 }).catch(() => {
        console.log('Table body or rows not found within 15s, checked and proceeding...');
    });
    await page.waitForTimeout(1000);
}

/**
 * Trigger sorting and wait for table update.
 */
export async function sortByDropdown(page, columnName, order) {
    console.log(`ACTION: Sorting by ${columnName} (${order})...`);
    // Locate header button by name
    const headerBtn = page.getByRole('button', { name: columnName, exact: true });
    await headerBtn.click();

    // Select Asc/Desc from menu - look for radix or standard popover
    const menu = page.locator('div[role="menu"], [id^="radix-"], .popover-content').last();
    await menu.waitFor({ state: 'visible', timeout: 5000 });

    const optionName = order === 'asc' ? 'Asc' : 'Desc';
    // Try both role menuitem and direct text
    const menuItem = menu.getByRole('menuitem', { name: optionName }).or(menu.getByText(optionName, { exact: true }));

    await menuItem.first().click();

    // Wait for the table to finish sorting and updating
    await page.waitForTimeout(2000); // Give it time to trigger state change
    await waitForSalesMaterialsTable(page);
}

/**
 * Verify sorting for a specific column index.
 * @param {import('@playwright/test').Page} page
 * @param {number} columnIndex - 0-based index of the column to verify
 * @param {'asc'|'desc'} expectedOrder
 */
export async function verifySorting(page, columnIndex, expectedOrder = 'asc') {
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    const cells = await page.$$eval(`tbody tr td:nth-child(${columnIndex + 1})`, (els) =>
        els.map((e) => e.innerText.trim())
    );

    if (cells.length < 2) {
        console.log('Not enough rows to verify sorting.');
        return;
    }

    const values = cells.map((v, idx) => {
        const cleanV = v.replace(/[\n\r]/g, ' ').trim();

        // Try parsing as date
        const date = Date.parse(cleanV);
        if (!isNaN(date)) {
            // Note: Date.parse might behave weirdly if no year is present
            return date;
        }

        // Try parsing as number
        const num = parseFloat(cleanV.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(num) && cleanV.match(/^[0-9]/)) {
            return num;
        }

        return cleanV.toLowerCase();
    });

    console.log(`Sorting check for column ${columnIndex}:`, values);

    const sorted = [...values].sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        const sa = String(a);
        const sb = String(b);
        return sa.localeCompare(sb);
    });

    if (expectedOrder === 'desc') sorted.reverse();

    if (JSON.stringify(values) !== JSON.stringify(sorted)) {
        console.error(`Actual   (${expectedOrder}):`, values);
        console.error(`Expected (${expectedOrder}):`, sorted);
        throw new Error(`Column ${columnIndex} not sorted correctly (${expectedOrder}).`);
    } else {
        console.log(`Column ${columnIndex} (${expectedOrder}) verified successfully.`);
    }
}

/**
 * Upload a sales material file.
 */
export async function uploadSalesMaterial(page, filePath, caption) {
    await page.getByRole('button', { name: 'Upload Sales Material' }).click();

    // Handle file upload
    // The locator for the dropzone or input might vary, using the one from user locators
    // await page.getByText('Drag and drop or click to').click(); This opens system dialog which we can't control directly with click
    // but setInputFiles on the input works better.
    // User locator: await page.getByRole('dialog', { name: 'Upload Sales Material' }).setInputFiles('IMG_0467.PNG');
    // We need to find the file input. Usually it's hidden.
    // We can try setting input files on the dialog or strictly on 'input[type="file"]'

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    if (caption) {
        await page.getByRole('textbox', { name: 'Caption' }).click();
        await page.getByRole('textbox', { name: 'Caption' }).fill(caption);
    }

    await page.getByRole('button', { name: 'Upload' }).click();
    await expect(page.getByText('Sales Material Uploaded', { exact: true })).toBeVisible({ timeout: 10000 });
}

/**
 * Select a date range in the open date picker.
 */
export async function selectDateRange(page, startDay = '1', endDay = '28') {
    // Select start date
    await page.getByRole('gridcell', { name: startDay, exact: true }).first().click();
    // Select end date
    await page.getByRole('gridcell', { name: endDay, exact: true }).first().click();
    // Now Apply should be visible
}
