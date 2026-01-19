class VisitPage {
    constructor(page) {
        this.page = page;

        // Navigation
        this.sidebarToggle = page.getByLabel('Toggle Sidebar');
        this.visitsNavItem = page.getByRole('button', { name: 'Visits' });

        // Filters
        // Filters - Using more stable locators (nth) as text changes when selected
        this.allComboboxes = page.getByRole('combobox');
        this.storeSearchInput = this.allComboboxes.nth(0);
        this.chainSearchInput = this.allComboboxes.nth(1);
        this.creatorSearchInput = this.allComboboxes.nth(2);

        this.storeSearchTextInput = page.getByPlaceholder('Search store...');
        this.filterButton = page.getByRole('button', { name: 'Filter' });
        this.clearSelectionButton = page.getByRole('button', { name: 'Clear selection' });
        this.pickDatesButton = page.getByRole('button', { name: 'Pick dates' });
        this.applyDateButton = page.getByRole('button', { name: 'Apply' });

        // Data Table
        this.rowsPerPageSelect = page.getByRole('combobox').filter({ hasText: 'Rows per page' }); // Adjust if needed
        this.paginationNextButton = page.getByRole('button', { name: 'Next page' }).or(page.locator('.pagination-next'));
        this.paginationPrevButton = page.getByRole('button', { name: 'Previous page' }).or(page.locator('.pagination-prev'));

        // Actions
        this.changeStoreLink = page.getByRole('button', { name: 'Change Store' }).first();
        this.changeStoreSearchInput = page.getByRole('textbox', { name: 'Search by name or address...' });
        this.changeStoreApplyButton = page.getByRole('button', { name: 'Apply' }).first();
        this.rejectSwitch = page.getByRole('switch').first();
        this.deleteIcon = page.getByRole('button').filter({ hasText: /^$/ }).nth(1);
        this.exportButton = page.getByRole('button', { name: 'Export' });

        // Modals / Dialogs
        this.deleteConfirmDialog = page.getByRole('heading', { name: 'Are you sure?' });
        this.deleteConfirmButton = page.getByRole('button', { name: 'Delete' });
        this.successMessage = page.getByText('Visit Removed Successfully').first();
        this.updateSuccessMessage = page.getByText('Visit Updated', { exact: true }).first();
    }

    async navigateTo() {
        await this.page.goto('https://app.omnigrowthos.io/map');
        if (await this.sidebarToggle.isVisible()) {
            try {
                if (!(await this.visitsNavItem.isVisible())) {
                    await this.sidebarToggle.click();
                }
            } catch (e) {
                await this.sidebarToggle.click();
            }
        }
        await this.visitsNavItem.click();
        await this.page.waitForURL(/\/visits/);
    }

    async filterByStore(storeName) {
        await this.storeSearchInput.click();
        await this.storeSearchTextInput.fill(storeName);
        // Logic might vary: fill and press enter? or wait for options?
        // Codegen showed: .fill('breadliner') -> then nothing explicit except maybe filter?
        // Assuming search happens on type or requires pressing Enter/selection
        // If exact match needed:
        // await this.page.getByRole('option', { name: storeName }).click();
        // But codegen simply typed. We can verify if typed. 
        // Optional: Press Enter
        await this.storeSearchTextInput.press('Enter');
    }

    async filterByDate(startDay, endDay) {
        await this.pickDatesButton.click();
        await this.page.getByRole('gridcell', { name: startDay }).first().click();
        await this.page.getByRole('gridcell', { name: endDay }).last().click();
        await this.applyDateButton.click();
    }

    async viewDetails() {
        await this.page.getByRole('button', { name: 'View Details' }).first().click();
    }

    async clearFilters() {
        if (await this.clearSelectionButton.isVisible()) {
            await this.clearSelectionButton.click();
            await this.page.waitForLoadState('networkidle');
        }
        // Also clear inputs manually if needed
        await this.storeSearchInput.click();
        await this.storeSearchTextInput.fill('');
        await this.page.keyboard.press('Escape'); // Close dropdown

        await this.creatorSearchInput.click();
        await this.page.keyboard.press('Escape'); // Just reset
    }

    async deleteVisit() {
        // Ensure row is selected if required. 
        // Locating the checkbox for the first row:
        const firstRowCheckbox = this.page.locator('tbody tr').first().getByRole('checkbox');
        if (await firstRowCheckbox.isVisible() && !(await firstRowCheckbox.isChecked())) {
            await firstRowCheckbox.click();
        }

        await this.deleteIcon.click();
        await this.deleteConfirmDialog.waitFor();
        await this.deleteConfirmButton.click();
    }

    async changeStore(newStoreName) {
        await this.changeStoreLink.click();
        await this.changeStoreSearchInput.click();
        // Clear if needed or just fill
        await this.changeStoreSearchInput.fill(newStoreName || '');
        // If selection needed, add logic. For now just clicking apply as per simple flow
        await this.changeStoreApplyButton.click();
    }

    async rejectVisit() {
        await this.rejectSwitch.click();
    }

    async exportData() {
        const downloadPromise = this.page.waitForEvent('download');
        await this.exportButton.click();
        const download = await downloadPromise;
        return download;
    }

    async resetFilters() {
        console.log('Starting robust filter reset...');

        // 1. Click all visible "Clear selection" buttons
        // These are often "X" buttons next to the selected items in comboboxes
        const clearButtons = this.page.getByRole('button', { name: 'Clear selection' });
        let clearCount = await clearButtons.count();
        while (clearCount > 0) {
            console.log(`Found ${clearCount} clear selection buttons. Clicking first...`);
            await clearButtons.first().click();
            await this.page.waitForTimeout(500); // Wait for animation/update
            clearCount = await clearButtons.count();
        }

        // 2. Clear generic "Filter" dropdowns
        // The button label changes to "Filter X selected", so we use a regex/partial match
        const filterBtn = this.page.getByRole('button').filter({ hasText: /Filter/ });
        if (await filterBtn.isVisible()) {
            const btnText = await filterBtn.textContent();
            if (btnText.includes('selected')) {
                console.log(`Resetting generic filters (Current: ${btnText})`);
                await filterBtn.click();
                const clearFiltersOption = this.page.getByRole('option', { name: 'Clear filters' });
                if (await clearFiltersOption.isVisible()) {
                    await clearFiltersOption.click();
                } else {
                    await this.page.keyboard.press('Escape');
                }
                await this.page.waitForTimeout(500);
            }
        }

        // 3. Explicitly clear the Store Search text if it's still there
        // Sometimes the text remains in the input even if the selection is cleared
        if (await this.storeSearchTextInput.isVisible()) {
            const val = await this.storeSearchTextInput.inputValue();
            if (val) {
                console.log(`Clearing store search text value: ${val}`);
                await this.storeSearchTextInput.fill('');
                await this.storeSearchTextInput.press('Enter');
            }
        }

        console.log('Filter reset complete.');
        await this.page.waitForTimeout(500);
    }
}

module.exports = { VisitPage };
