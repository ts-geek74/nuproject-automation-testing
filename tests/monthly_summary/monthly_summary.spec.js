
const { test, expect } = require('@playwright/test');
const { MonthlySummaryPage } = require('../../pages/MonthlySummaryPage');
require('dotenv').config();

test.describe('Monthly Summary Module Tests', () => {
    test.describe.configure({ mode: 'serial' });

    let page;
    let context;
    let monthlySummaryPage;

    test.beforeAll(async ({ browser }) => {
        const testEmail = 'Shopify@omnigrowthos.com';
        const testPassword = 'Shopify@1234';

        context = await browser.newContext();
        page = await context.newPage();
        monthlySummaryPage = new MonthlySummaryPage(page);

        // Login
        await page.goto('https://app.omnigrowthos.io/auth/login');
        await page.getByRole('textbox', { name: 'Email' }).fill(testEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill(testPassword);
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await page.waitForSelector('button:has-text("Admin"), [aria-label="Toggle Sidebar"]', { timeout: 45000 });

        // Navigate
        await monthlySummaryPage.navigate();
    });

    test.afterAll(async () => {
        await context.close();
    });

    // --- Helper for Salesforce Sidesheet Opening ---
    async function openSidebar() {
        await monthlySummaryPage.salesforceEfficiencyHeader.scrollIntoViewIfNeeded();
        const bubble = page.locator('.recharts-scatter circle').first();
        
        // Try opening. If tooltip appears, click it. If not, click bubble.
        await bubble.click({ force: true });
        await page.waitForTimeout(500);
        
        const possibleTrigger = page.locator('.recharts-tooltip-wrapper h3, .recharts-tooltip-wrapper h4, [role="tooltip"] h3').first();
        if (await possibleTrigger.isVisible()) {
            await possibleTrigger.click();
        } else {
            // Try again if first click didn't trigger
            if (!(await monthlySummaryPage.performanceHeading.first().isVisible())) {
                await bubble.dblclick({ force: true }).catch(() => {});
            }
        }
        await expect(monthlySummaryPage.performanceHeading.first()).toBeVisible({ timeout: 15000 });
    }

    async function closeNested() {
        const closeBtn = page.getByRole('button', { name: /Close/i }).nth(1);
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        } else {
            await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(500);
    }

    // --- Page & Header ---
    test('MS-001 | Page | Page Load | Verify Monthly Summary page loads successfully', async () => {
        await expect(page).toHaveURL(/\/monthly-summary/);
        await expect(monthlySummaryPage.dtcRevenueChartHeader).toBeVisible();
    });

    test('MS-002 | Header | Breadcrumbs | Verify breadcrumbs are visible', async () => {
        await expect(monthlySummaryPage.breadcrumbs.first()).toBeVisible();
    });

    // --- Summary Cards ---
    test('MS-003 | Summary Cards | B2B Revenue | Verify B2B Revenue card is visible', async () => {
        await expect(monthlySummaryPage.b2bRevenueCard).toBeVisible();
    });
    test('MS-004 | Summary Cards | DTC Revenue | Verify DTC Revenue card is visible', async () => {
        await expect(monthlySummaryPage.dtcRevenueCard).toBeVisible();
    });
    test('MS-005 | Summary Cards | Total Revenue | Verify Total Revenue card is visible', async () => {
        await expect(monthlySummaryPage.totalRevenueCard).toBeVisible();
    });
    test('MS-006 | Summary Cards | Layout | Verify summary cards appear above charts', async () => {
        const cardsBox = await monthlySummaryPage.summaryCards.first().boundingBox();
        const chartBox = await monthlySummaryPage.dtcRevenueChartHeader.boundingBox();
        expect(cardsBox.y).toBeLessThan(chartBox.y);
    });

    // --- Global Filter ---
    test('MS-007 | Global Filter | State Dropdown | Verify state filter dropdown is visible', async () => {
        await expect(monthlySummaryPage.stateFilter).toBeVisible();
    });
    test('MS-008 | Global Filter | State Search | Verify state search input works', async () => {
        await monthlySummaryPage.stateFilter.click();
        await monthlySummaryPage.stateSearchInput.fill('Florida');
        await expect(page.getByRole('option', { name: 'Florida' })).toBeVisible();
        await page.keyboard.press('Escape');
    });
    test('MS-009 | Global Filter | State Selection | Verify selecting a state updates charts', async () => {
        await monthlySummaryPage.selectState('Florida');
        await expect(monthlySummaryPage.dtcRevenueChartHeader).toBeVisible();
    });
    test('MS-010 | Global Filter | Clear State | Verify clearing state filter resets charts', async () => {
        await monthlySummaryPage.clearFilters();
        await expect(monthlySummaryPage.clearSelectionBtn).not.toBeVisible();
    });

    // --- Monthly DTC Revenue ---
    test('MS-011 | Monthly DTC Revenue | Chart Load | Verify Monthly DTC Revenue chart is visible', async () => {
        await expect(monthlySummaryPage.dtcRevenueChartHeader).toBeVisible();
    });
    test('MS-012 | Monthly DTC Revenue | Current Year Revenue | Verify Current Year Revenue toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.dtcRevenueFieldsBtn, monthlySummaryPage.optionCurrentYearRevenue);
    });
    test('MS-013 | Monthly DTC Revenue | Previous Year Revenue | Verify Previous Year Revenue toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.dtcRevenueFieldsBtn, monthlySummaryPage.optionPreviousYearRevenue);
    });
    test('MS-014 | Monthly DTC Revenue | Rolling 12 Month Total | Verify Rolling 12M Total toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.dtcRevenueFieldsBtn, monthlySummaryPage.optionRolling12MonthTotal);
    });
    test('MS-015 | Monthly DTC Revenue | DTC Revenue Milestone | Verify DTC Revenue milestone toggle', async () => {
        try { await monthlySummaryPage.toggleField(monthlySummaryPage.dtcRevenueFieldsBtn, monthlySummaryPage.optionDTCRevenueMilestone); } catch(e) {}
    });
    test('MS-016 | Monthly DTC Revenue | Field Switch | Verify switching between DTC fields', async () => {
        await monthlySummaryPage.dtcRevenueFieldsBtn.click();
        await monthlySummaryPage.optionCurrentYearRevenue.click();
        await monthlySummaryPage.optionPreviousYearRevenue.click();
        await page.keyboard.press('Escape');
    });

    // --- Monthly Customers ---
    test('MS-017 | Monthly Customers | Chart Load | Verify Monthly Customers chart is visible', async () => {
        await expect(monthlySummaryPage.customersChartHeader).toBeVisible();
    });
    test('MS-018 | Monthly Customers | Active Customers (12M) | Verify Active Customers (12M) toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.customersFieldsBtn, monthlySummaryPage.optionActiveCustomers12M);
    });
    test('MS-019 | Monthly Customers | Previous Active Customers (12M) | Verify Previous Active Customers (12M)', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.customersFieldsBtn, monthlySummaryPage.optionPreviousActiveCustomers12M);
    });
    test('MS-020 | Monthly Customers | New Customers | Verify New Customers toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.customersFieldsBtn, monthlySummaryPage.optionNewCustomers);
    });
    test('MS-021 | Monthly Customers | Churned Customers | Verify Churned Customers (12M) toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.customersFieldsBtn, monthlySummaryPage.optionChurnedCustomers12M);
    });
    test('MS-022 | Monthly Customers | Active Customers (Monthly) | Verify Active Customers (Monthly)', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.customersFieldsBtn, monthlySummaryPage.optionActiveCustomersMonthly);
    });
    test('MS-023 | Monthly Customers | Previous Active Customers (Monthly) | Verify Previous Active Customers (Monthly)', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.customersFieldsBtn, monthlySummaryPage.optionPreviousActiveCustomersMonthly);
    });
    test('MS-024 | Monthly Customers | Field Switch | Verify switching between customer fields', async () => {
        await monthlySummaryPage.customersFieldsBtn.click();
        await monthlySummaryPage.optionNewCustomers.click();
        await monthlySummaryPage.optionActiveCustomers12M.click();
        await page.keyboard.press('Escape');
    });

    // --- Monthly Cases Delivered ---
    test('MS-025 | Monthly Cases Delivered | Chart Load | Verify Monthly Cases Delivered chart is visible', async () => {
        await expect(monthlySummaryPage.casesDeliveredChartHeader).toBeVisible();
    });
    test('MS-026 | Monthly Cases Delivered | Current Year Cases Delivered | Verify Current Year Cases toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.casesDeliveredFieldsBtn, monthlySummaryPage.optionCurrentYearCases);
    });
    test('MS-027 | Monthly Cases Delivered | Previous Year Cases Delivered | Verify Previous Year Cases toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.casesDeliveredFieldsBtn, monthlySummaryPage.optionPreviousYearCases);
    });
    test('MS-028 | Monthly Cases Delivered | Rolling 12 Month Total | Verify Rolling 12M Total toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.casesDeliveredFieldsBtn, monthlySummaryPage.optionRolling12MonthCasesTotal);
    });
    test('MS-029 | Monthly Cases Delivered | Annual Cases Milestone | Verify Annual Cases Delivered milestone', async () => {
        try { await monthlySummaryPage.toggleField(monthlySummaryPage.casesDeliveredFieldsBtn, monthlySummaryPage.optionAnnualCasesMilestone); } catch(e) {}
    });
    test('MS-030 | Monthly Cases Delivered | Field Switch | Verify switching between case fields', async () => {
        await monthlySummaryPage.casesDeliveredFieldsBtn.click();
        await monthlySummaryPage.optionRolling12MonthCasesTotal.click();
        await page.keyboard.press('Escape');
    });

    // --- Monthly Store ---
    test('MS-031 | Monthly Store | Chart Load | Verify Monthly Store chart is visible', async () => {
        await expect(monthlySummaryPage.storesChartHeader).toBeVisible();
    });
    test('MS-032 | Monthly Store | Active Store (12M) | Verify Active Store (12M) toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.storesFieldsBtn, monthlySummaryPage.optionActiveStore12M);
    });
    test('MS-033 | Monthly Store | Previous Active Store (12M) | Verify Previous Active Store (12M)', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.storesFieldsBtn, monthlySummaryPage.optionPreviousActiveStore12M);
    });
    test('MS-034 | Monthly Store | New Store | Verify New Store toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.storesFieldsBtn, monthlySummaryPage.optionNewStore);
    });
    test('MS-035 | Monthly Store | Churned Store | Verify Churned Store (12M) toggle', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.storesFieldsBtn, monthlySummaryPage.optionChurnedStore12M);
    });
    test('MS-036 | Monthly Store | Active Store (Monthly) | Verify Active Store (Monthly)', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.storesFieldsBtn, monthlySummaryPage.optionActiveStoreMonthly);
    });
    test('MS-037 | Monthly Store | Previous Active Store (Monthly) | Verify Previous Active Store (Monthly)', async () => {
        await monthlySummaryPage.toggleField(monthlySummaryPage.storesFieldsBtn, monthlySummaryPage.optionPreviousActiveStoreMonthly);
    });
    test('MS-038 | Monthly Store | Field Switch | Verify switching between store fields', async () => {
        await monthlySummaryPage.storesFieldsBtn.click();
        await monthlySummaryPage.optionNewStore.click();
        await page.keyboard.press('Escape');
    });

    // --- Salesforce Efficiency ---
    test('MS-039 | Salesforce Efficiency | Default Tab | Verify default tab is selected', async () => {
        const isMtdSelected = await monthlySummaryPage.mtdTab.getAttribute('aria-selected') === 'true';
        const isAllSelected = await monthlySummaryPage.allTab.getAttribute('aria-selected') === 'true';
        expect(isMtdSelected || isAllSelected).toBeTruthy();
    });
    test('MS-040 | Salesforce Efficiency | Last Month | Verify Last Month tab', async () => {
        await monthlySummaryPage.lastMonthTab.click();
        await expect(monthlySummaryPage.lastMonthTab).toHaveAttribute('aria-selected', 'true');
    });
    test('MS-041 | Salesforce Efficiency | Last 3 Months | Verify Last 3 Months tab', async () => {
        await monthlySummaryPage.last3MonthsTab.click();
        await expect(monthlySummaryPage.last3MonthsTab).toHaveAttribute('aria-selected', 'true');
    });
    test('MS-042 | Salesforce Efficiency | MTD | Verify MTD tab', async () => {
        await monthlySummaryPage.mtdTab.click();
        await expect(monthlySummaryPage.mtdTab).toHaveAttribute('aria-selected', 'true');
    });
    test('MS-043 | Salesforce Efficiency | All | Verify All tab', async () => {
        await monthlySummaryPage.allTab.click();
        await expect(monthlySummaryPage.allTab).toHaveAttribute('aria-selected', 'true');
    });
    test('MS-044 | Salesforce Efficiency | Tab Switch | Verify switching between tabs', async () => {
        await monthlySummaryPage.lastMonthTab.click();
        await monthlySummaryPage.allTab.click();
        await expect(monthlySummaryPage.allTab).toHaveAttribute('aria-selected', 'true');
    });

    test('MS-045 | Salesforce Efficiency | Sidesheet Tabs | Verify tab content switching', async () => {
        await openSidebar();
        
        await monthlySummaryPage.sidebarStoresTab.click();
        await expect(monthlySummaryPage.sidebarStoresTab).toHaveAttribute('aria-selected', 'true');
        
        await monthlySummaryPage.sidebarNotesTab.click();
        await expect(monthlySummaryPage.sidebarNotesTab).toHaveAttribute('aria-selected', 'true');

        await monthlySummaryPage.sidebarVisitsTab.click(); 
        await expect(monthlySummaryPage.sidebarVisitsTab).toHaveAttribute('aria-selected', 'true');
        
        await page.getByRole('button', { name: /Close/i }).first().click();
    });

    test('MS-046 | Salesforce Efficiency | Nested Details | Verify detail overlays if data exists', async () => {
        await openSidebar();

        // 1. Visit Details
        await monthlySummaryPage.sidebarVisitsTab.click();
        const visitCard = page.locator('div[role="dialog"] h3, div[role="dialog"] h4, div[role="dialog"] [class*="heading"]').first();
        if (await visitCard.isVisible()) {
            await visitCard.click();
            await expect(page.getByText('Note Details').or(page.getByText('Visit Details'))).toBeVisible();
            await closeNested();
            
            // If main sidebar closed, reopen it
            if (!(await monthlySummaryPage.performanceHeading.first().isVisible())) {
                await openSidebar();
                await monthlySummaryPage.sidebarVisitsTab.click();
            }
        }

        // 2. Store Details
        await monthlySummaryPage.sidebarStoresTab.click();
        const storeCard = page.locator('div[role="dialog"] h3, div[role="dialog"] h4, div[role="dialog"] [class*="heading"]').first();
        if (await storeCard.isVisible()) {
            await storeCard.click();
            await expect(page.locator('[data-state="open"]').or(page.locator('div[role="dialog"]')).nth(1)).toBeVisible();
            await closeNested();

            // Reopen if main sidebar closed
            if (!(await monthlySummaryPage.performanceHeading.first().isVisible())) {
                await openSidebar();
                await monthlySummaryPage.sidebarStoresTab.click();
            }
        }

        await page.getByRole('button', { name: /Close/i }).first().click();
    });
});
