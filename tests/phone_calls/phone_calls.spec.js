class PhoneCallPage {
    constructor(page) {
        this.page = page;

        // Navigation
        this.sidebarToggle = page.getByLabel('Toggle Sidebar');
        this.phoneCallsNavItem = page.getByRole('button', { name: 'Phone Calls' });

        // Filters
        this.filterButton = page.getByRole('button', { name: 'Filter' });
        this.allComboboxes = page.getByRole('combobox');
        this.storeSearchInput = this.allComboboxes.filter({ hasText: 'Search stores...' });
        this.chainSearchInput = this.allComboboxes.filter({ hasText: 'Search chain...' });
        this.creatorSearchInput = this.allComboboxes.filter({ hasText: 'Search creators...' });
        this.storeSearchTextInput = page.getByPlaceholder('Search store...');
        this.creatorSearchTextInput = page.getByPlaceholder('Search creator...');

        this.clearSelectionButton = page.getByRole('button', { name: 'Clear selection' });
        this.pickDatesButton = page.getByRole('button', { name: 'Pick dates' });
        this.applyDateButton = page.getByRole('button', { name: 'Apply' });

        // Data Table
        this.table = page.getByRole('table');
        this.tableHeaders = page.locator('thead th');
        this.tableRows = page.locator('tbody tr').filter({ hasNotText: 'No results.' });
        this.rowsPerPageSelect = page.getByRole('combobox').filter({ hasText: 'Rows per page' });
        this.paginationNextButton = page.getByRole('button', { name: 'Next page' }).or(page.locator('.pagination-next'));
        this.paginationPrevButton = page.getByRole('button', { name: 'Previous page' }).or(page.locator('.pagination-prev'));

        // Actions
        this.exportButton = page.getByRole('button', { name: 'Export' });
        this.attachStoreButton = page.getByRole('button', { name: '+ Attach Store' });
        this.changeStoreButton = page.getByRole('button', { name: 'Change Store' });
        this.viewDetailsButton = page.getByRole('button', { name: 'View Details' });
        this.deleteIcon = page.getByRole('button').filter({ hasText: /^$/ }).nth(1);
        this.deleteConfirmButton = page.getByRole('button', { name: 'Delete' });

        // Change/Attach Store Modal
        this.storeDrawer = page.locator('div[role="dialog"], .side-drawer, [data-state="open"]').last();
        this.searchStoreInput = page.getByRole('textbox', { name: 'Search by name or address...' });
        this.modalApplyButton = page.getByRole('button', { name: 'Apply' });

        // Details Drawer
        this.commentsTab = page.getByRole('tab', { name: 'Show comments' });
        this.photosTab = page.getByRole('tab', { name: 'Show photos' });
        this.noCommentsMessage = page.getByRole('heading', { name: 'No Comments Available' });
        this.noteDetailsContainer = page.getByLabel('Note Details');
        this.closeDrawerButton = page.getByRole('button', { name: 'Close' });

        // Links
        this.battlemapLink = page.getByRole('link', { name: 'View on BattleMap' });
        this.addressLink = page.getByRole('link');

        // Success/Error Messages
        this.successMessage = page.getByText(/successfully|success/i).first();
        this.errorMessage = page.getByText(/error|failed|unable/i).first();
        this.updateNotification = page.getByText(/updated/i).first();
        this.storeAttachedMessage = page.getByText(/store.*attached|attached.*store/i).first();
        this.deleteSuccessMessage = page.getByText(/deleted.*successfully|successfully.*deleted/i).first();

        // Loading indicators
        this.loadingSpinner = page.locator('[data-loading], .loading, .spinner').first();
        this.tableLoadingState = page.locator('tbody').getByText(/loading/i).first();

        // BattleMap Elements
        this.mapPinMarker = page.locator('[class*="marker"], [data-marker], .leaflet-marker-icon').first();
        this.mapSidebar = page.locator('[role="complementary"], .sidebar, [class*="sidebar"]').last();
        this.mapSidebarHeader = page.locator('h1, h2, h3, [class*="header"] h1, [class*="header"] h2').first();
    }

    /**
     * Navigate to Phone Calls page
     */
    async navigateTo() {
        if (await this.sidebarToggle.isVisible()) {
            try {
                if (!(await this.phoneCallsNavItem.isVisible())) {
                    await this.sidebarToggle.click();
                }
            } catch (e) {
                await this.sidebarToggle.click();
            }
        }
        await this.phoneCallsNavItem.click();
        await this.page.waitForURL(/\/phone-calls/);
        await this.page.waitForLoadState('load');

        // Wait for table to be ready
        await this.waitForTableReady();
    }

    /**
     * Wait for table to finish loading
     */
    async waitForTableReady(timeout = 10000) {
        try {
            // Wait for loading spinner to disappear if present
            if (await this.loadingSpinner.isVisible({ timeout: 2000 }).catch(() => false)) {
                await this.loadingSpinner.waitFor({ state: 'hidden', timeout });
            }

            // Wait for table to be visible
            await this.table.waitFor({ state: 'visible', timeout });

            // Wait for either data rows or "No results" message
            await this.page.waitForFunction(
                () => {
                    const tbody = document.querySelector('tbody');
                    if (!tbody) return false;
                    const rows = tbody.querySelectorAll('tr');
                    return rows.length > 0;
                },
                { timeout }
            );
        } catch (error) {
            console.log('Warning: Table ready check timed out:', error.message);
        }
    }

    /**
     * Filter by store with comprehensive validation
     */
    async filterByStore(storeName, selectStoreName = null) {
        const targetStore = selectStoreName || storeName;

        try {
            await this.storeSearchInput.click();
            await this.storeSearchTextInput.fill(storeName);
            await this.page.waitForTimeout(1500); // Wait for debounce + API call

            // Wait for suggestions to appear
            const suggestions = this.page.getByLabel('Suggestions');
            await suggestions.waitFor({ state: 'visible', timeout: 5000 });

            // Select the appropriate store
            const suggestion = suggestions.getByText(targetStore, { exact: true });

            if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
                await suggestion.click();
            } else {
                // Try partial match
                const partialSuggestion = suggestions.getByText(targetStore, { exact: false }).first();
                if (await partialSuggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await partialSuggestion.click();
                } else {
                    throw new Error(`Store "${targetStore}" not found in suggestions`);
                }
            }

            // Wait for filter to apply
            await this.waitForTableReady();
            await this.page.waitForTimeout(1000);

            return { success: true, storeName: targetStore };
        } catch (error) {
            console.error('Filter by store failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Filter by creator with validation
     */
    async filterByCreator(creatorName) {
        try {
            await this.creatorSearchInput.click();
            await this.creatorSearchTextInput.fill(creatorName);
            await this.page.waitForTimeout(1000);

            const option = this.page.getByRole('option', { name: creatorName, exact: false }).first();

            if (!(await option.isVisible({ timeout: 3000 }).catch(() => false))) {
                throw new Error(`Creator "${creatorName}" not found in options`);
            }

            await option.click();
            await this.waitForTableReady();
            await this.page.waitForTimeout(1000);

            return { success: true, creatorName };
        } catch (error) {
            console.error('Filter by creator failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Filter by date range
     */
    async filterByDate(startDay, endDay) {
        try {
            await this.pickDatesButton.click();

            // Click start date
            const startCell = this.page.getByRole('gridcell', { name: startDay, exact: true }).first();
            await startCell.waitFor({ state: 'visible', timeout: 3000 });
            await startCell.click();

            // Click end date
            const endCell = this.page.getByRole('gridcell', { name: endDay, exact: false }).last();
            await endCell.waitFor({ state: 'visible', timeout: 3000 });
            await endCell.click();

            await this.applyDateButton.click();
            await this.waitForTableReady();

            return { success: true, startDay, endDay };
        } catch (error) {
            console.error('Filter by date failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Reset all filters with comprehensive cleanup
     */
    async resetFilters() {
        console.log('Resetting filters...');

        try {
            // Clear store search input
            if (await this.storeSearchTextInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await this.storeSearchTextInput.clear();
                await this.page.keyboard.press('Escape');
                await this.page.waitForTimeout(500);
            }

            // Clear creator search input
            if (await this.creatorSearchTextInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await this.creatorSearchTextInput.clear();
                await this.page.keyboard.press('Escape');
                await this.page.waitForTimeout(500);
            }

            // Click all "Clear selection" buttons
            const clearButtons = this.page.getByRole('button', { name: 'Clear selection' });
            let clearCount = await clearButtons.count();
            let maxIterations = 10;

            while (clearCount > 0 && maxIterations > 0) {
                await clearButtons.first().click();
                await this.page.waitForTimeout(500);
                clearCount = await clearButtons.count();
                maxIterations--;
            }

            // Clear date filters via Filter button
            const filterBtn = this.page.getByRole('button').filter({ hasText: /Filter/ });
            if (await filterBtn.isVisible()) {
                const btnText = await filterBtn.textContent();
                if (btnText.includes('selected')) {
                    await filterBtn.click();
                    const clearFiltersOption = this.page.getByRole('option', { name: 'Clear filters' });
                    if (await clearFiltersOption.isVisible({ timeout: 2000 }).catch(() => false)) {
                        await clearFiltersOption.click();
                    } else {
                        await this.page.keyboard.press('Escape');
                    }
                    await this.page.waitForTimeout(500);
                }
            }

            await this.waitForTableReady();
            console.log('Filters reset successfully');
            return { success: true };
        } catch (error) {
            console.error('Error resetting filters:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Export data with validation
     */
    async exportData() {
        try {
            const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
            await this.exportButton.click();
            const download = await downloadPromise;

            // Verify download
            const path = await download.path();
            const fs = require('fs');

            if (!fs.existsSync(path)) {
                throw new Error('Download file does not exist');
            }

            const stats = fs.statSync(path);
            if (stats.size === 0) {
                throw new Error('Downloaded file is empty');
            }

            console.log(`Export successful: ${stats.size} bytes`);
            return { success: true, download, size: stats.size, path };
        } catch (error) {
            console.error('Export failed:', error.message);
            return { success: false, error: error.message, download: null };
        }
    }

    /**
     * Check if delete operation is available and not disabled
     */
    async isDeleteAvailable(rowIndex = 0) {
        try {
            const deleteBtn = this.deleteIcon.nth(rowIndex);
            const isVisible = await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false);

            if (!isVisible) {
                return { available: false, reason: 'Delete button not visible' };
            }

            const isEnabled = await deleteBtn.isEnabled().catch(() => false);
            if (!isEnabled) {
                return { available: false, reason: 'Delete button is disabled' };
            }

            // Check for any tooltip or disabled state indicators
            const ariaDisabled = await deleteBtn.getAttribute('aria-disabled').catch(() => null);
            if (ariaDisabled === 'true') {
                return { available: false, reason: 'Delete button has aria-disabled=true' };
            }

            const disabledClass = await deleteBtn.getAttribute('class').catch(() => '');
            if (disabledClass.includes('disabled') || disabledClass.includes('Disabled')) {
                return { available: false, reason: 'Delete button has disabled class' };
            }

            return { available: true, reason: 'Delete button is available' };
        } catch (error) {
            return { available: false, reason: error.message };
        }
    }

    /**
     * Delete phone call with comprehensive validation
     */
    async deletePhoneCall(rowIndex = 0) {
        try {
            const rowCountBefore = await this.tableRows.count();
            console.log(`Starting delete: ${rowCountBefore} rows in table`);

            // Get row data before deletion for verification
            const rowData = await this.getRowData(rowIndex);
            console.log('Row to delete:', rowData);

            const deleteBtn = this.deleteIcon.nth(rowIndex);
            await deleteBtn.waitFor({ state: 'visible', timeout: 5000 });
            await deleteBtn.click();
            console.log('Delete button clicked');

            // Wait for confirmation dialog
            await this.deleteConfirmButton.waitFor({ state: 'visible', timeout: 5000 });
            console.log('Confirmation dialog appeared');
            await this.deleteConfirmButton.click();
            console.log('Confirmation button clicked');

            // Wait for either success message OR error message
            await this.page.waitForTimeout(1000);
            const successMsg = await this.waitForSuccessMessage(5000);
            const errorMsg = await this.waitForErrorMessage(3000);

            if (errorMsg) {
                console.error('Delete failed with error message:', errorMsg);
                return {
                    success: false,
                    error: `Delete rejected: ${errorMsg}`,
                    rowCountBefore,
                    rowCountAfter: rowCountBefore,
                    deletedData: rowData,
                    messageShown: errorMsg
                };
            }

            console.log('Success message:', successMsg || 'None shown');

            // Wait longer for table to update after delete
            await this.page.waitForTimeout(3000);
            await this.waitForTableReady();

            const rowCountAfter = await this.tableRows.count();
            console.log(`After delete: ${rowCountAfter} rows in table`);

            // Check if table shows "No results"
            const noResults = await this.page.getByText('No results.').isVisible({ timeout: 2000 }).catch(() => false);
            console.log('No results shown:', noResults);

            // Verify deletion - multiple checks
            const rowsDecreased = rowCountAfter < rowCountBefore;
            const tableEmpty = rowCountAfter === 0 || noResults;
            const deleted = rowsDecreased || tableEmpty;

            console.log('Deletion verification:', {
                rowsDecreased,
                tableEmpty,
                deleted,
                hadSuccessMessage: !!successMsg
            });

            // If no change detected but we got success message, it might be a timing issue
            if (!deleted && successMsg) {
                console.warn('Warning: Success message shown but row count unchanged - possible timing issue');
                // Try one more check after additional wait
                await this.page.waitForTimeout(2000);
                const finalRowCount = await this.tableRows.count();
                const finalNoResults = await this.page.getByText('No results.').isVisible().catch(() => false);
                console.log('Final verification:', { finalRowCount, finalNoResults });

                const finalDeleted = finalRowCount < rowCountBefore || finalNoResults;

                if (!finalDeleted) {
                    // Success message but no deletion - backend might have rejected it
                    return {
                        success: false,
                        error: 'Delete appeared to succeed but row count unchanged',
                        rowCountBefore,
                        rowCountAfter: finalRowCount,
                        deletedData: rowData,
                        messageShown: successMsg,
                        warning: 'Success message shown but deletion not reflected in table'
                    };
                }

                return {
                    success: true,
                    deletedData: rowData,
                    rowCountBefore,
                    rowCountAfter: finalRowCount,
                    messageShown: successMsg,
                    warning: 'Deletion took longer than expected to reflect'
                };
            }

            if (!deleted && !successMsg) {
                console.error('Delete operation failed - no confirmation and no row change');
                return {
                    success: false,
                    error: 'Delete operation may have failed - no confirmation',
                    rowCountBefore,
                    rowCountAfter,
                    deletedData: rowData,
                    messageShown: null
                };
            }

            console.log(`Delete successful: ${rowCountBefore} -> ${rowCountAfter} rows`);
            return {
                success: deleted,
                deletedData: rowData,
                rowCountBefore,
                rowCountAfter,
                messageShown: successMsg,
                rowsDecreased,
                tableEmpty
            };
        } catch (error) {
            console.error('Delete failed with exception:', error.message);
            return {
                success: false,
                error: error.message,
                stack: error.stack
            };
        }
    }

    /**
     * Attach or change store with validation
     */
    async attachOrChangeStore(storeName, isAttach = true) {
        try {
            const button = isAttach ? this.attachStoreButton : this.changeStoreButton;
            const rowIndex = 0;

            // Get current store name (if changing)
            const currentStore = !isAttach ? await this.getStoreNameFromRow(rowIndex) : null;

            await button.first().click();
            await this.page.waitForTimeout(500);

            // Verify modal opened
            await this.searchStoreInput.waitFor({ state: 'visible', timeout: 5000 });

            // Search for store
            await this.searchStoreInput.click();
            await this.searchStoreInput.fill(storeName);
            await this.page.waitForTimeout(1500);

            // Apply selection
            await this.modalApplyButton.first().click();

            // Wait for modal to close
            await this.searchStoreInput.waitFor({ state: 'hidden', timeout: 5000 });

            // Wait for success message
            const successMsg = await this.waitForSuccessMessage(5000);

            // Wait for table to update
            await this.page.waitForTimeout(2000);
            await this.waitForTableReady();

            // Verify store updated in table
            const verification = await this.verifyStoreUpdate(storeName, rowIndex);

            if (!verification.success && !successMsg) {
                throw new Error(`Store update verification failed: expected "${storeName}", got "${verification.actual}"`);
            }

            console.log(`Store ${isAttach ? 'attached' : 'changed'}: ${currentStore} -> ${verification.actual}`);
            return {
                success: true,
                previousStore: currentStore,
                newStore: verification.actual,
                messageShown: !!successMsg
            };
        } catch (error) {
            console.error(`${isAttach ? 'Attach' : 'Change'} store failed:`, error.message);

            // Try to close modal if still open
            if (await this.searchStoreInput.isVisible().catch(() => false)) {
                await this.page.keyboard.press('Escape');
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * View details with comprehensive data extraction
     */
    async viewDetails(rowIndex = 0) {
        try {
            const viewBtn = this.viewDetailsButton.nth(rowIndex);

            if (!(await viewBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
                throw new Error('View Details button not found');
            }

            await viewBtn.click();

            // Wait for drawer to open
            await this.noteDetailsContainer.waitFor({ state: 'visible', timeout: 5000 });

            // Extract all details
            const details = await this.getDetailsSheetData();

            // Verify essential data is present
            if (!details.note && !details.storeName) {
                console.warn('Warning: Details drawer opened but no data found');
                return {
                    success: true,
                    hasData: false,
                    details,
                    warning: 'No data in details drawer'
                };
            }

            return {
                success: true,
                hasData: true,
                details
            };
        } catch (error) {
            console.error('View details failed:', error.message);
            return { success: false, error: error.message, details: null };
        }
    }

    /**
     * Test all tabs in details drawer
     * Note: Comments and Photos tabs always exist but may not have content
     */
    async testDetailsTabs() {
        try {
            const results = {
                commentsTab: { exists: false, success: false, hasContent: false, isEmpty: false },
                photosTab: { exists: false, success: false, hasContent: false, isEmpty: false }
            };

            // Test Comments tab (should exist but may be empty)
            const commentsTabExists = await this.commentsTab.isVisible({ timeout: 3000 }).catch(() => false);
            results.commentsTab.exists = commentsTabExists;

            if (commentsTabExists) {
                try {
                    await this.commentsTab.click();
                    await this.page.waitForTimeout(1000);

                    // Check for "No Comments Available" message
                    const noCommentsVisible = await this.noCommentsMessage.isVisible({ timeout: 2000 }).catch(() => false);

                    // Check for actual comments container
                    const commentsContainer = this.page.locator('[data-comments], .comments-list, [class*="comment"]').first();
                    const hasCommentsContainer = await commentsContainer.isVisible({ timeout: 2000 }).catch(() => false);

                    // Check for any comment items
                    const commentItems = this.page.locator('[data-comment-item], .comment-item, [class*="comment-"]');
                    const commentCount = await commentItems.count();

                    const hasContent = !noCommentsVisible && (hasCommentsContainer || commentCount > 0);
                    const isEmpty = noCommentsVisible || (!hasCommentsContainer && commentCount === 0);

                    results.commentsTab = {
                        exists: true,
                        success: true,
                        hasContent: hasContent,
                        isEmpty: isEmpty,
                        commentCount: commentCount
                    };

                    console.log(`Comments tab: ${hasContent ? `${commentCount} comments found` : 'Empty (no comments)'}`);
                } catch (error) {
                    console.error('Error testing Comments tab:', error.message);
                    results.commentsTab = {
                        exists: true,
                        success: false,
                        hasContent: false,
                        isEmpty: false,
                        error: error.message
                    };
                }
            } else {
                console.log('Comments tab does not exist in UI');
            }

            // Test Photos tab (should exist but may be empty)
            const photosTabExists = await this.photosTab.isVisible({ timeout: 3000 }).catch(() => false);
            results.photosTab.exists = photosTabExists;

            if (photosTabExists) {
                try {
                    await this.photosTab.click();
                    await this.page.waitForTimeout(1000);

                    // Check for "No photos" message
                    const noPhotosMsg = this.page.getByText(/no photos/i).first();
                    const noPhotosVisible = await noPhotosMsg.isVisible({ timeout: 2000 }).catch(() => false);

                    // Check for photo container
                    const photosContainer = this.page.locator('[data-photos], .photos-grid, .photo-gallery, [class*="photo"]').first();
                    const hasPhotosContainer = await photosContainer.isVisible({ timeout: 2000 }).catch(() => false);

                    // Check for individual photo items
                    const photoItems = this.page.locator('[data-photo], .photo-item, img[class*="photo"]');
                    const photoCount = await photoItems.count();

                    const hasContent = !noPhotosVisible && (hasPhotosContainer || photoCount > 0);
                    const isEmpty = noPhotosVisible || (!hasPhotosContainer && photoCount === 0);

                    results.photosTab = {
                        exists: true,
                        success: true,
                        hasContent: hasContent,
                        isEmpty: isEmpty,
                        photoCount: photoCount
                    };

                    console.log(`Photos tab: ${hasContent ? `${photoCount} photos found` : 'Empty (no photos)'}`);
                } catch (error) {
                    console.error('Error testing Photos tab:', error.message);
                    results.photosTab = {
                        exists: true,
                        success: false,
                        hasContent: false,
                        isEmpty: false,
                        error: error.message
                    };
                }
            } else {
                console.log('Photos tab does not exist in UI');
            }

            return { success: true, tabs: results };
        } catch (error) {
            console.error('Test tabs failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Close details drawer
     */
    async closeDetailsDrawer() {
        try {
            await this.closeDrawerButton.nth(1).click();
            await this.noteDetailsContainer.waitFor({ state: 'hidden', timeout: 5000 });
            return { success: true };
        } catch (error) {
            // Fallback: try Escape key
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(500);
            return { success: true, method: 'escape' };
        }
    }

    /**
     * Navigate to BattleMap and verify store
     */
    async navigateToBattleMap(expectedStoreName = null) {
        try {
            if (!(await this.battlemapLink.first().isVisible({ timeout: 5000 }).catch(() => false))) {
                throw new Error('BattleMap link not found');
            }

            await this.battlemapLink.first().click();

            // Wait for URL change
            await this.page.waitForURL(/map/, { timeout: 15000 });

            // Wait for map to load and locate store
            await this.page.waitForTimeout(7000);

            // Verify map loaded
            const mapLoaded = await this.mapPinMarker.isVisible({ timeout: 5000 }).catch(() => false);

            if (!mapLoaded) {
                console.warn('Warning: Map loaded but no pin marker visible');
                return {
                    success: true,
                    mapLoaded: false,
                    warning: 'No pin marker visible'
                };
            }

            // Get store name from map if expected name provided
            let mapStoreName = null;
            let storeMatches = null;

            if (expectedStoreName) {
                mapStoreName = await this.getBattleMapStoreName();
                storeMatches = mapStoreName?.toLowerCase().includes(expectedStoreName.toLowerCase());
            }

            return {
                success: true,
                mapLoaded: true,
                pinVisible: mapLoaded,
                storeName: mapStoreName,
                storeMatches
            };
        } catch (error) {
            console.error('Navigate to BattleMap failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Test Google Maps link
     */
    async testGoogleMapsLink() {
        try {
            // First open details drawer
            const detailsResult = await this.viewDetails(0);
            if (!detailsResult.success) {
                throw new Error('Failed to open details drawer');
            }

            const addressLink = this.addressLink.first();

            if (!(await addressLink.isVisible({ timeout: 5000 }).catch(() => false))) {
                await this.closeDetailsDrawer();
                throw new Error('Google Maps link not found in details');
            }

            // Get the href before clicking
            const href = await addressLink.getAttribute('href');
            const isGoogleMapsLink = href?.includes('google.com/maps');

            if (!isGoogleMapsLink) {
                await this.closeDetailsDrawer();
                throw new Error('Link is not a Google Maps link');
            }

            const context = this.page.context();
            const [newPage] = await Promise.all([
                context.waitForEvent('page', { timeout: 10000 }),
                addressLink.click()
            ]);

            // Wait for Google Maps to load
            await newPage.waitForLoadState('domcontentloaded', { timeout: 10000 });
            const newPageUrl = newPage.url();
            const isGoogleMaps = newPageUrl.includes('google.com/maps');

            // Close the new tab
            await newPage.close();
            await this.page.waitForTimeout(500);

            // Close details drawer
            await this.closeDetailsDrawer();

            return {
                success: isGoogleMaps,
                url: newPageUrl,
                originalHref: href
            };
        } catch (error) {
            console.error('Google Maps link test failed:', error.message);

            // Cleanup: try to close drawer
            await this.closeDetailsDrawer().catch(() => { });

            return { success: false, error: error.message };
        }
    }

    // ==================== Validation & Helper Methods ====================

    /**
     * Wait for success message
     */
    async waitForSuccessMessage(timeout = 5000) {
        try {
            await this.successMessage.waitFor({ state: 'visible', timeout });
            const message = await this.successMessage.textContent();
            console.log('Success message:', message);
            return message;
        } catch (error) {
            return null;
        }
    }

    /**
     * Wait for error message
     */
    async waitForErrorMessage(timeout = 5000) {
        try {
            await this.errorMessage.waitFor({ state: 'visible', timeout });
            const message = await this.errorMessage.textContent();
            console.log('Error message:', message);
            return message;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get row data by index
     */
    async getRowData(rowIndex = 0) {
        try {
            const row = this.tableRows.nth(rowIndex);
            await row.waitFor({ state: 'visible', timeout: 5000 });

            const cells = row.locator('td');
            const cellCount = await cells.count();

            const data = {
                date: cellCount > 0 ? await cells.nth(0).textContent() : '',
                creator: cellCount > 1 ? await cells.nth(1).textContent() : '',
                store: cellCount > 2 ? await cells.nth(2).textContent() : '',
                note: cellCount > 3 ? await cells.nth(3).textContent() : ''
            };

            return data;
        } catch (error) {
            console.error('Get row data failed:', error.message);
            return null;
        }
    }

    /**
     * Get store name from specific row
     */
    async getStoreNameFromRow(rowIndex = 0) {
        try {
            const row = this.tableRows.nth(rowIndex);
            await row.waitFor({ state: 'visible', timeout: 5000 });
            const storeCell = row.locator('td').nth(2);
            return (await storeCell.textContent()).trim();
        } catch (error) {
            console.error('Get store name failed:', error.message);
            return '';
        }
    }

    /**
     * Validate all rows match filter criteria
     */
    async validateAllRowsMatchFilter(expectedStoreName) {
        try {
            await this.page.waitForTimeout(1000);
            const rowCount = await this.tableRows.count();

            if (rowCount === 0) {
                const noResults = await this.page.getByText('No results.').isVisible().catch(() => false);
                return {
                    allMatch: true,
                    totalRows: 0,
                    mismatches: [],
                    isEmpty: noResults
                };
            }

            const mismatches = [];

            for (let i = 0; i < rowCount; i++) {
                const storeName = await this.getStoreNameFromRow(i);
                if (!storeName.toLowerCase().includes(expectedStoreName.toLowerCase())) {
                    mismatches.push({ rowIndex: i, actualStore: storeName });
                }
            }

            const result = {
                allMatch: mismatches.length === 0,
                totalRows: rowCount,
                mismatches,
                isEmpty: false
            };

            if (!result.allMatch) {
                console.warn(`Filter validation failed: ${mismatches.length} mismatches out of ${rowCount} rows`);
            }

            return result;
        } catch (error) {
            console.error('Validate filter failed:', error.message);
            return { allMatch: false, error: error.message };
        }
    }

    /**
     * Extract data from details sheet
     */
    async getDetailsSheetData() {
        await this.noteDetailsContainer.waitFor({ state: 'visible', timeout: 5000 });

        const data = {
            storeName: null,
            note: null,
            date: null,
            creator: null,
            address: null,
            fullContent: null
        };

        try {
            // Extract full content
            data.fullContent = await this.noteDetailsContainer.textContent();

            // Extract store name
            const storeSelectors = [
                '[data-store-name]',
                '[class*="store"]',
                'h2:has-text("Store")',
                'h3:has-text("Store")'
            ];

            for (const selector of storeSelectors) {
                const element = this.page.locator(selector).first();
                if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
                    data.storeName = (await element.textContent()).trim();
                    break;
                }
            }

            // Extract note content
            const noteSelectors = [
                '[data-note]',
                '[class*="note-content"]',
                'p:has-text("Note")',
                '.note'
            ];

            for (const selector of noteSelectors) {
                const element = this.page.locator(selector).first();
                if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
                    data.note = (await element.textContent()).trim();
                    break;
                }
            }

            // Extract date
            const dateElement = this.page.locator('[class*="date"], time, [datetime]').first();
            if (await dateElement.isVisible({ timeout: 1000 }).catch(() => false)) {
                data.date = (await dateElement.textContent()).trim();
            }

            // Extract creator
            const creatorSelectors = [
                '[class*="creator"]',
                '[class*="user"]',
                '[data-creator]',
                'p:has-text("Created by")'
            ];

            for (const selector of creatorSelectors) {
                const element = this.page.locator(selector).first();
                if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
                    data.creator = (await element.textContent()).trim();
                    break;
                }
            }

            // Extract address/Google Maps link
            const addressElement = this.addressLink.first();
            if (await addressElement.isVisible({ timeout: 1000 }).catch(() => false)) {
                data.address = await addressElement.getAttribute('href');
            }

        } catch (error) {
            console.error('Error extracting details sheet data:', error.message);
        }

        return data;
    }

    /**
     * Verify store was updated in table
     */
    async verifyStoreUpdate(expectedStoreName, rowIndex = 0) {
        await this.page.waitForTimeout(2000);
        await this.waitForTableReady();

        const actualStoreName = await this.getStoreNameFromRow(rowIndex);

        return {
            success: actualStoreName.toLowerCase().includes(expectedStoreName.toLowerCase()),
            expected: expectedStoreName,
            actual: actualStoreName
        };
    }

    /**
     * Get store name from BattleMap
     */
    async getBattleMapStoreName() {
        try {
            // Wait for map to locate store
            await this.page.waitForTimeout(7000);

            // Click on marker
            await this.mapPinMarker.waitFor({ state: 'visible', timeout: 10000 });
            await this.mapPinMarker.click();

            // Wait for sidebar
            await this.mapSidebar.waitFor({ state: 'visible', timeout: 5000 });

            // Extract store name
            await this.mapSidebarHeader.waitFor({ state: 'visible', timeout: 3000 });
            const storeName = await this.mapSidebarHeader.textContent();

            return storeName.trim();
        } catch (error) {
            console.error('Error getting BattleMap store name:', error.message);
            return null;
        }
    }

    /**
     * Verify table has data
     */
    async hasTableData() {
        const rowCount = await this.tableRows.count();
        const noResults = await this.page.getByText('No results.').isVisible().catch(() => false);

        return {
            hasData: rowCount > 0,
            isEmpty: noResults,
            rowCount
        };
    }

    /**
     * Get pagination info
     */
    async getPaginationInfo() {
        try {
            const info = {
                hasNextPage: false,
                hasPrevPage: false,
                currentPage: null,
                totalPages: null,
                rowsPerPage: null
            };

            // Check next button
            info.hasNextPage = await this.paginationNextButton.isEnabled().catch(() => false);

            // Check previous button
            info.hasPrevPage = await this.paginationPrevButton.isEnabled().catch(() => false);

            // Try to get current page info from pagination text
            const paginationText = await this.page.locator('[class*="pagination"]').textContent().catch(() => '');
            const pageMatch = paginationText.match(/Page (\d+) of (\d+)/i);

            if (pageMatch) {
                info.currentPage = parseInt(pageMatch[1]);
                info.totalPages = parseInt(pageMatch[2]);
            }

            return info;
        } catch (error) {
            console.error('Get pagination info failed:', error.message);
            return null;
        }
    }

    /**
     * Verify column headers
     */
    async verifyColumns(expectedColumns) {
        const results = [];

        for (const colName of expectedColumns) {
            const header = this.tableHeaders.filter({ hasText: colName }).first();
            const isVisible = await header.isVisible({ timeout: 3000 }).catch(() => false);

            results.push({
                column: colName,
                visible: isVisible
            });
        }

        const allVisible = results.every(r => r.visible);

        return {
            allVisible,
            columns: results,
            missing: results.filter(r => !r.visible).map(r => r.column)
        };
    }

    /**
     * Check for empty state
     */
    async isEmptyState() {
        const noResults = await this.page.getByText('No results.').isVisible({ timeout: 3000 }).catch(() => false);
        const rowCount = await this.tableRows.count();

        return {
            isEmpty: noResults || rowCount === 0,
            noResultsMessage: noResults,
            rowCount
        };
    }
}

module.exports = { PhoneCallPage };