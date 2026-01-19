const { expect } = require('@playwright/test');

class StorePage {
    constructor(page) {
        this.page = page;

        // Navigation & Sidebar
        this.sidebarToggle = page.getByLabel('Toggle Sidebar');
        this.storesNavButton = page.getByRole('button', { name: 'Stores' });

        // Main Table Elements
        this.table = page.getByRole('table');
        this.tableRows = page.locator('tbody tr');
        this.headerName = page.getByRole('columnheader', { name: 'Name' });
        this.headerRankings = page.getByRole('columnheader', { name: 'Rankings' });
        this.headerChain = page.getByRole('columnheader', { name: 'Chain' });

        // Filters
        this.filterButton = page.getByRole('button', { name: 'Filter' });
        this.searchStoresInput = page.getByRole('combobox').filter({ hasText: 'Search stores...' });
        this.searchStorePlaceholder = page.getByPlaceholder('Search store...');

        // Actions/Modals
        this.addContactButtons = page.getByRole('button', { name: /Add Contact/i });
        this.contactNameInput = page.getByRole('textbox', { name: 'Name' });
        this.contactRemarkInput = page.getByRole('textbox', { name: 'Remark' });
        this.contactEmailInput = page.getByRole('textbox', { name: 'Email Address' });
        this.contactDesignationInput = page.getByRole('textbox', { name: 'Designation' });
        this.contactNumberInput = page.getByRole('textbox', { name: 'Contact number' });
        this.createContactButton = page.getByRole('button', { name: 'Create' });

        this.actionMenuButtons = page.locator('.lucide-ellipsis-vertical').locator('xpath=..');
        this.editMenuItem = page.getByRole('menuitem', { name: 'Edit' });
        this.deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });

        // Success Messages
        this.successMessage = page.getByText(/successfully/i);
        this.updateNotification = page.getByText(/updated/i);
    }

    async navigateToStores() {
        if (await this.sidebarToggle.isVisible()) {
            await this.sidebarToggle.click();
        }
        await this.storesNavButton.click();
    }

    async clearFilters() {
        if (await this.filterButton.isVisible()) {
            await this.filterButton.click();
            const clearOption = this.page.getByRole('option', { name: /Clear filters/i });
            if (await clearOption.count() > 0 && await clearOption.first().isVisible()) {
                await clearOption.first().click();
                await this.page.waitForTimeout(2000);
            } else {
                // Click outside or click filter button again to close
                await this.page.mouse.click(0, 0);
            }
        }
    }

    async searchStore(name) {
        await this.searchStoresInput.click();
        await this.searchStorePlaceholder.fill(name);
        await this.page.getByRole('option', { name: new RegExp(name, 'i') }).first().click();
    }

    async addContact(name, remark, email, designation, phone) {
        // Find first row's Add Contact button
        const btn = this.page.locator('tbody tr').first().getByRole('button', { name: /Add Contact/i });
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        await this.contactNameInput.fill(name);
        if (remark) await this.contactRemarkInput.fill(remark);
        if (email) await this.contactEmailInput.fill(email);
        if (designation) await this.contactDesignationInput.fill(designation);
        if (phone) await this.contactNumberInput.fill(phone);
        await this.createContactButton.click();
    }

    async toggleFaulty(storeName) {
        const row = this.page.getByRole('row', { name: storeName }).first();
        const toggle = row.getByRole('switch');
        await toggle.scrollIntoViewIfNeeded();
        await toggle.click();
    }

    async sortByColumn(columnName, direction) {
        const header = this.page.getByRole('button', { name: columnName, exact: true }).first();
        await header.click();
        await this.page.getByRole('menuitem', { name: new RegExp(direction, 'i') }).click();
    }
}

module.exports = { StorePage };
