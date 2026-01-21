const { expect } = require('@playwright/test');

class TeamsPage {
    constructor(page) {
        this.page = page;

        // Navigation & Layout
        this.sidebarToggle = page.getByLabel('Toggle Sidebar');
        this.adminMenu = page.getByRole('button', { name: 'Admin', exact: true });
        this.teamsLink = page.locator('a').filter({ hasText: 'Teams' });
        this.pageHeader = page.locator('h1, h2, h3').filter({ hasText: 'Teams' }).first(); // Generic header finder or checking breadcrumb

        // Table
        this.table = page.locator('table');
        this.tableRows = page.locator('tbody tr');
        this.tableHeaders = page.locator('thead th');
        this.noResultsCell = page.getByRole('cell', { name: 'No results.' });

        // Sorting (Dropdowns based on user flow)
        this.sortUsernameBtn = page.getByRole('button', { name: 'Username' });
        this.sortEmailBtn = page.getByRole('button', { name: 'Email' });
        this.sortAscOption = page.getByRole('menuitem', { name: 'Asc' });
        this.sortDescOption = page.getByRole('menuitem', { name: 'Desc' });

        // Search
        this.searchInput = page.getByRole('textbox', { name: 'Search users...' });

        // Filters
        this.statusFilterBtn = page.getByRole('button', { name: 'Status' });
        this.roleFilterBtn = page.getByRole('button', { name: 'Role' });
        // Use exact match or filter to avoid "Reset bearing" map button
        this.resetButton = page.getByRole('button', { name: 'Reset', exact: true });
        this.clearFilterOption = page.getByRole('option', { name: 'Clear filters' });

        // Action Buttons
        this.inviteUserBtn = page.getByRole('button', { name: 'Invite User' });
        this.viewSettingsBtn = page.getByRole('button', { name: 'View' });
        this.hideInstructionsToggle = page.locator('input[type="checkbox"]').first(); // Assuming toggle is a checkbox, locator based on user snippet might be better: page.locator('.mr-2.flex').first() but that's VAGUE. User said "Hide Instructions" and "Toggle". Locator from user: `page.locator('.mr-2.flex').first().click()` or `page.getByText('StatusRoleInvite UserView').click()`. I'll try reasonable robust ones.

        // Invite Modal
        this.inviteEmailInput = page.getByRole('textbox', { name: 'Email' });
        this.inviteRoleDropdown = page.getByRole('combobox', { name: 'Role' });
        this.inviteSubmitBtn = page.getByRole('button', { name: 'Invite' });
        this.inviteCloseBtn = page.getByRole('button', { name: 'Close' });
        this.invitationFailedMsg = page.getByText('Invitation Failed');
        this.invitationSuccessMsg = page.getByText('Invitation Sent'); // Hypotbetical

        // Edit/User Modal
        this.editEmailDisplay = page.getByLabel('Edit profile').locator('div').filter({ hasText: /^Email$/ }); // Based on user locator
        this.editRoleDropdown = page.getByRole('combobox', { name: 'Role' });
        this.saveUserBtn = page.getByRole('button', { name: 'Save User' });
        this.userDetailsUpdatedToast = page.getByText('User Details Updated Successfully', { exact: true });

        // Delete/Confirmation Modals
        this.deleteConfirmBtn = page.getByRole('button', { name: 'Delete' });
        this.activateConfirmBtn = page.getByRole('button', { name: 'Yes' });
        this.deactivateConfirmBtn = page.getByRole('button', { name: 'Yes' });
        this.cancelModalBtn = page.getByRole('button', { name: 'Cancel' }); // Or click outside

        // Pagination
        // Pagination
        this.rowsPerPageDropdown = page.getByRole('combobox').last(); // Usually the one at bottom is relevant, or use filter
        // User trace used: page.getByRole('button').filter({ hasText: /^$/ }).nth(2) for Next
        // We'll define a base for pagination controls if possible, or just use the indices
        this.nextPageBtn = page.getByRole('button').filter({ hasText: /^$/ }).nth(2); // As per user trace
        this.prevPageBtn = page.getByRole('button').filter({ hasText: /^$/ }).nth(1); // Assuming Prev is before Next

        // Menu Items
        this.editMenuItem = page.getByRole('menuitem', { name: 'Edit' });
        this.deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    }

    actionsMenuButton(row) {
        return row.getByRole('button', { name: 'Open menu' });
    }

    async navigateToTeams() {
        console.log('Navigating to Teams page...');
        try {
            // Attempt 1: Hover (Popup mode)
            if (await this.adminMenu.isVisible()) {
                await this.adminMenu.hover();
                await this.teamsLink.waitFor({ state: 'visible', timeout: 1500 }); // Fast fail
                await this.teamsLink.click();
                return;
            }
        } catch (e) {
            console.log('Hover attempt unsuccessful, switching to Sidebar interaction...');
        }

        // Attempt 2: Sidebar Expansion (User verified path)
        // Ensure sidebar is open or we can access Admin
        if (!await this.adminMenu.isVisible()) {
            console.log('Admin menu hidden, toggling sidebar...');
            await this.sidebarToggle.click();
            await this.adminMenu.waitFor({ state: 'visible', timeout: 5000 });
        }

        // Click Admin to expand
        console.log('Clicking Admin...');
        await this.adminMenu.click();

        // Wait for Teams link
        console.log('Waiting for Teams link...');
        try {
            await this.teamsLink.waitFor({ state: 'visible', timeout: 3000 });
        } catch (e) {
            console.log('Teams link not found after Admin click. Toggling sidebar and retrying...');
            await this.sidebarToggle.click();
            await this.page.waitForTimeout(500); // Animation wait
            await this.adminMenu.click();
            await this.teamsLink.waitFor({ state: 'visible', timeout: 5000 });
        }
        await this.teamsLink.click();

        await this.page.waitForLoadState('networkidle');
    }

    async sortTable(column, order) {
        if (column === 'Username') await this.sortUsernameBtn.click();
        if (column === 'Email') await this.sortEmailBtn.click();

        if (order === 'Asc') await this.sortAscOption.click();
        if (order === 'Desc') await this.sortDescOption.click();

        await this.page.waitForTimeout(1000); // Wait for sort
    }

    // Helper to get all text from a specific column index
    async getColumnData(columnIndex) {
        return await this.tableRows.locator(`td:nth-child(${columnIndex + 1})`).allInnerTexts();
    }

    async verifySorting(column, order) {
        const columnIndex = column === 'Username' ? 0 : 1; // 0=Username, 1=Email (assuming standard layout, need to verify from headers really)
        // User provided locator for headers: Username, Email, Status, Role...
        // Let's assume indices: Username=0, Email=1

        const texts = await this.getColumnData(columnIndex);
        const sortedTexts = [...texts].sort((a, b) => {
            return a.localeCompare(b, undefined, { sensitivity: 'base' });
        });

        if (order === 'Desc') sortedTexts.reverse();

        expect(texts).toEqual(sortedTexts);
    }

    async filterByStatus(status) {
        await this.statusFilterBtn.click();
        if (status === 'Clear') {
            await this.clearFilterOption.click();
        } else {
            // Use exact match to avoid "Active" matching "Inactive"
            await this.page.getByRole('option', { name: status, exact: true }).click();
        }
        await this.page.click('body'); // Close dropdown if needed, or it closes on select
        await this.page.waitForTimeout(500);
    }

    async filterByRole(role) {
        await this.roleFilterBtn.click();
        await this.page.getByRole('option', { name: role, exact: true }).click(); // Exact match

        // Removed explicit close (click body) to prevent accidental resets

        // Verify filter application by checking button text update (User pattern: "Role Admin")
        await expect(this.roleFilterBtn).toHaveText(new RegExp(`Role.*${role}`, 'i'), { timeout: 5000 });

        await this.page.waitForLoadState('networkidle'); // Wait for fetch
        await this.page.waitForTimeout(1000); // UI render buffer
    }

    async resetFilters() {
        if (await this.resetButton.isVisible()) {
            await this.resetButton.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(1000);
        }
    }

    async performRowAction(rowIndex, action) {
        // action: 'Edit', 'Delete', 'Activate', 'Deactivate'
        const row = this.tableRows.nth(rowIndex);
        await row.getByRole('button', { name: 'Open menu' }).click();
        await this.page.getByRole('menuitem', { name: action }).click();
    }
}

module.exports = { TeamsPage };
