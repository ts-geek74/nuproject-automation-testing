
import { expect } from '@playwright/test';

export class MonthlySummaryPage {
    constructor(page) {
        this.page = page;
        this.sidebarToggle = page.getByLabel('Toggle Sidebar');
        this.yourBusinessSidebarBtn = page.getByRole('button', { name: 'Your Business' });
        this.monthlySummaryLink = page.locator('a').filter({ hasText: 'Monthly Summary' });
        
        // Header / Breadcrumbs
        this.breadcrumbs = page.locator('nav[aria-label="breadcrumb"]').or(page.locator('.breadcrumb')).or(page.locator('ol').filter({ hasText: /Business/ }));
        this.pageHeader = page.getByRole('heading', { name: 'Monthly Summary', exact: false });

        // Summary Cards
        this.b2bRevenueCard = page.getByText('B2B Revenue').first();
        this.dtcRevenueCard = page.getByText('DTC Revenue').first();
        this.totalRevenueCard = page.getByText('Total Revenue').first();
        this.summaryCards = page.locator('div').filter({ hasText: /Revenue/ });
        
        // Global Filters
        this.stateFilter = page.getByRole('button', { name: /state/i }).or(page.getByRole('combobox').first());
        this.stateSearchInput = page.getByPlaceholder('Search state...');
        this.clearSelectionBtn = page.getByRole('button', { name: 'Clear selection' });
        
        // Charts & Sections
        this.dtcRevenueChartHeader = page.getByText('Monthly DTC Revenue').first();
        this.customersChartHeader = page.getByText('Monthly Customers').first();
        this.casesDeliveredChartHeader = page.getByText('Monthly Cases Delivered').first();
        this.storesChartHeader = page.getByText('Monthly Store').first();
        this.salesforceEfficiencyHeader = page.getByText('Salesforce Efficiency').first();

        // Field selectors
        this.dtcRevenueFieldsBtn = page.locator('button').filter({ hasText: /Monthly DTC Revenue Fields/ });
        this.customersFieldsBtn = page.locator('button').filter({ hasText: /Monthly Customers Fields/ });
        this.casesDeliveredFieldsBtn = page.locator('button').filter({ hasText: /Monthly Cases Delivered/ }).and(page.getByRole('button')).or(page.getByRole('button', { name: 'Monthly Cases Delivered' }));
        this.storesFieldsBtn = page.locator('button').filter({ hasText: /Monthly Store Fields/ });

        // Options
        this.optionCurrentYearRevenue = page.getByRole('option', { name: 'Current Year Revenue' });
        this.optionPreviousYearRevenue = page.getByRole('option', { name: 'Previous Year Revenue' });
        this.optionRolling12MonthTotal = page.getByRole('option', { name: 'Rolling 12 Month Total' });
        this.optionDTCRevenueMilestone = page.getByRole('option', { name: 'DTC Revenue Milestone' });
        this.optionActiveCustomers12M = page.getByRole('option', { name: 'Active Customers (12M)', exact: true });
        this.optionPreviousActiveCustomers12M = page.getByRole('option', { name: 'Previous Active Customers (12M)' });
        this.optionNewCustomers = page.getByRole('option', { name: 'New Customers' });
        this.optionChurnedCustomers12M = page.getByRole('option', { name: 'Churned (No Purchase in 12M)' });
        this.optionActiveCustomersMonthly = page.getByRole('option', { name: 'Active Customers (Monthly)', exact: true });
        this.optionPreviousActiveCustomersMonthly = page.getByRole('option', { name: 'Previous Active Customers (Monthly)' });
        this.optionCurrentYearCases = page.getByRole('option', { name: 'Current Year Total Cases Delivered' }).or(page.getByRole('option', { name: 'Current Year Cases Delivered' }));
        this.optionPreviousYearCases = page.getByRole('option', { name: 'Previous Year Total Cases Delivered' }).or(page.getByRole('option', { name: 'Previous Year Cases Delivered' }));
        this.optionRolling12MonthCasesTotal = page.getByRole('option', { name: 'Rolling 12 Month Total' });
        this.optionAnnualCasesMilestone = page.getByRole('option', { name: 'Annual Cases Delivered Milestone' }).or(page.getByRole('option', { name: 'Annual Cases Delivered' }));
        this.optionActiveStore12M = page.getByRole('option', { name: 'Active Store (12M)', exact: true });
        this.optionPreviousActiveStore12M = page.getByRole('option', { name: 'Previous Active Store (12M)' });
        this.optionNewStore = page.getByRole('option', { name: 'New Store' });
        this.optionChurnedStore12M = page.getByRole('option', { name: 'Churned Store (No Purchase in' });
        this.optionActiveStoreMonthly = page.getByRole('option', { name: 'Active Store (Monthly)', exact: true });
        this.optionPreviousActiveStoreMonthly = page.getByRole('option', { name: 'Previous Active Store (Monthly)' });
        
        // Salesforce Efficiency Tabs
        this.mtdTab = page.getByRole('tab', { name: 'MTD' });
        this.lastMonthTab = page.getByRole('tab', { name: 'Last Month' });
        this.last3MonthsTab = page.getByRole('tab', { name: 'Last 3 Months' });
        this.allTab = page.getByRole('tab', { name: 'All' });
        
        // Performance & Activity Sidebar (Details)
        this.salespersonSidebar = page.locator('div[role="dialog"]').or(page.locator('aside')).filter({ hasText: /Performance & Activity/ });
        this.performanceHeading = page.getByRole('heading', { name: 'Performance & Activity' });
        
        // Tabs inside the Sidebar (based on User code)
        this.sidebarVisitsTab = page.getByRole('tab', { name: 'Show visits' });
        this.sidebarNotesTab = page.getByRole('tab', { name: 'Show notes' });
        this.sidebarStoresTab = page.getByRole('tab', { name: 'Show stores' });
        
        // Close buttons
        this.closeNestedSheetBtn = page.getByRole('button', { name: /Close/i }).nth(1);
        this.closeMainSidebarBtn = page.getByRole('button', { name: /Close/i }).first();
    }

    async navigate() {
        await this.page.goto('https://app.omnigrowthos.io/your-business/monthly-summary', { waitUntil: 'networkidle' });
        await expect(this.dtcRevenueChartHeader).toBeVisible({ timeout: 20000 });
    }

    async selectState(stateName) {
        await this.stateFilter.click();
        await this.stateSearchInput.fill(stateName);
        await this.page.getByRole('option', { name: stateName, exact: true }).click();
    }

    async clearFilters() {
        if (await this.clearSelectionBtn.isVisible()) {
            await this.clearSelectionBtn.click();
        }
    }

    async toggleField(fieldsButton, optionLocator) {
        await fieldsButton.click();
        try {
            await optionLocator.waitFor({ state: 'visible', timeout: 5000 });
            await optionLocator.click();
        } catch (e) {
            console.log(`Failed to find/click option after clicking ${await fieldsButton.innerText()}`);
            await this.page.keyboard.press('Escape').catch(() => {});
            throw e;
        }
        await this.page.keyboard.press('Escape').catch(() => {});
    }

    async exportAsPdf(index = 0) {
        const downloadPromise = this.page.waitForEvent('download');
        await this.page.getByRole('button', { name: 'Export as PDF' }).nth(index).click();
        const download = await downloadPromise;
        return download;
    }

    async refreshData(index = 0) {
        await this.page.getByRole('button', { name: 'Refresh' }).nth(index).click();
    }

    async updateAnnualCases(value) {
        await this.page.getByRole('spinbutton', { name: 'Annual Cases Delivered' }).fill(value.toString());
        await this.page.getByRole('button', { name: 'Save' }).click();
        await expect(this.page.getByText('Milestone updated', { exact: true })).toBeVisible({ timeout: 10000 });
    }
}
