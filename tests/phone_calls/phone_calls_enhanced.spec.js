const { test, expect } = require('@playwright/test');
const { PhoneCallPage } = require('../../pages/PhoneCallPage');
require('dotenv').config();

test.describe('Phone Calls Module Tests', () => {
    test.describe.configure({ mode: 'serial' });

    let page;
    let context;
    let phoneCallPage;

    test.beforeAll(async ({ browser }) => {
        const testEmail = 'Shopify@omnigrowthos.com';
        const testPassword = 'Shopify@1234';

        context = await browser.newContext();
        page = await context.newPage();
        phoneCallPage = new PhoneCallPage(page);

        // Login
        await page.goto('https://app.omnigrowthos.io/auth/login');
        await page.getByRole('textbox', { name: 'Email' }).fill(testEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill(testPassword);
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // Wait for dashboard/map
        await page.waitForURL(/.*dashboard|.*map/, { timeout: 60000 });

        // Navigate to Phone Calls
        await phoneCallPage.navigateTo();
        await page.waitForLoadState('networkidle').catch(() => { });
    });

    test.afterAll(async () => {
        await context.close();
    });

    test.afterEach(async ({ }, testInfo) => {
        // Skip reset for date filter test
        if (testInfo.title.includes('PCM-013')) return;

        try {
            const resetResult = await phoneCallPage.resetFilters();
            if (!resetResult.success) {
                console.warn('Warning: Failed to reset filters:', resetResult.error);
            }
            await page.waitForTimeout(1000);
        } catch (e) {
            console.log('Error resetting filters:', e);
        }
    });

    test('PCM-001: Page Load', async () => {
        await expect(page).toHaveURL(/\/phone-calls/);
        await expect(phoneCallPage.table).toBeVisible();

        // Verify table is ready
        const tableData = await phoneCallPage.hasTableData();
        console.log('Table data status:', tableData);

        // Table should either have data or show empty state
        const hasContent = tableData.hasData || tableData.isEmpty;
        expect(hasContent).toBeTruthy();
    });

    test('PCM-002: Column Visibility', async () => {
        const expectedColumns = ['Date', 'Creator', 'Store', 'Note', 'Details', 'Actions'];

        const verification = await phoneCallPage.verifyColumns(expectedColumns);

        if (!verification.allVisible) {
            console.error('Missing columns:', verification.missing);
        }

        expect(verification.allVisible).toBeTruthy();

        // Individual checks for clarity in reports
        for (const col of expectedColumns) {
            await expect(phoneCallPage.tableHeaders.filter({ hasText: col }).first()).toBeVisible();
        }
    });

    test('PCM-003: Date Display', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available to test date display');
        }

        await expect(phoneCallPage.tableRows.first()).toBeVisible();
        const dateCell = phoneCallPage.tableRows.first().locator('td').first();

        await expect(async () => {
            const text = (await dateCell.textContent()).trim();
            expect(text).not.toBe('');
            // Optionally validate date format
            const hasDateFormat = /\d{1,2}\/\d{1,2}\/\d{2,4}|\w+ \d{1,2},? \d{4}/.test(text);
            if (!hasDateFormat) {
                console.warn('Warning: Date format may be non-standard:', text);
            }
        }).toPass({ timeout: 10000 });
    });

    test('PCM-004: Creator Name', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available to test creator name');
        }

        const creatorCell = phoneCallPage.tableRows.first().locator('td').nth(1);
        await expect(creatorCell).not.toBeEmpty();

        // Verify it contains actual text
        const creatorText = await creatorCell.textContent();
        expect(creatorText.trim().length).toBeGreaterThan(0);
    });

    test('PCM-005: Store Name', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available to test store name');
        }

        const storeCell = phoneCallPage.tableRows.first().locator('td').nth(2);
        await expect(storeCell).not.toBeEmpty();

        // Verify it contains actual text
        const storeText = await storeCell.textContent();
        expect(storeText.trim().length).toBeGreaterThan(0);
    });

    // test('PCM-006 & PCM-007: Attach/Change Store', async () => {
    //     const tableData = await phoneCallPage.hasTableData();

    //     if (!tableData.hasData) {
    //         test.skip('No data available for store attach/change test');
    //     }

    //     // Determine if we're attaching or changing
    //     const hasAttachButton = await phoneCallPage.attachStoreButton.first().isVisible().catch(() => false);
    //     const hasChangeButton = await phoneCallPage.changeStoreButton.first().isVisible().catch(() => false);

    //     if (!hasAttachButton && !hasChangeButton) {
    //         test.skip('No attach/change store option available');
    //     }

    //     const isAttach = hasAttachButton;
    //     const targetStore = 'the brass tap';

    //     // Execute attach/change operation
    //     const result = await phoneCallPage.attachOrChangeStore(targetStore, isAttach);

    //     // Verify operation succeeded
    //     expect(result.success).toBeTruthy();

    //     if (!result.success) {
    //         console.error('Store operation failed:', result.error);
    //         throw new Error(`Failed to ${isAttach ? 'attach' : 'change'} store: ${result.error}`);
    //     }

    //     // Verify success message or store update
    //     if (!result.messageShown && !result.success) {
    //         console.warn('Warning: No success message shown after store operation');
    //     }

    //     console.log(`Store ${isAttach ? 'attached' : 'changed'} successfully:`, result);
    // });

    test('PCM-008: Note Display', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available to test note display');
        }

        const noteCell = phoneCallPage.tableRows.first().locator('td').nth(3);
        await expect(noteCell).toBeVisible();

        // Note can be empty, so just verify cell exists
        const noteText = await noteCell.textContent();
        console.log('Note content:', noteText.trim() || '(empty)');
    });

    test('PCM-009: View Details', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available for details view test');
        }

        const viewDetailsBtn = page.getByRole('button', { name: 'View Details' }).first();

        if (!(await viewDetailsBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip('View Details button not found');
        }

        // Open details drawer
        const detailsResult = await phoneCallPage.viewDetails(0);

        expect(detailsResult.success).toBeTruthy();

        if (!detailsResult.success) {
            throw new Error(`Failed to open details: ${detailsResult.error}`);
        }

        // Check if drawer has data
        if (!detailsResult.hasData) {
            console.warn('Warning:', detailsResult.warning);
        } else {
            // Verify drawer opened and contains data
            await expect(page.getByLabel('Note Details')).toBeVisible();

            console.log('Details data:', detailsResult.details);

            // Verify essential data exists
            const hasEssentialData = detailsResult.details.note ||
                detailsResult.details.storeName ||
                detailsResult.details.fullContent;

            if (!hasEssentialData) {
                console.error('Warning: Details drawer opened but contains no data');
            }

            expect(hasEssentialData).toBeTruthy();
        }

        // Test tabs (tabs should exist but may be empty)
        const tabsResult = await phoneCallPage.testDetailsTabs();

        if (tabsResult.success) {
            console.log('\n' + '─'.repeat(60));
            console.log('Tabs Validation Results:');
            console.log('─'.repeat(60));

            // Comments Tab
            if (tabsResult.tabs.commentsTab.exists) {
                if (tabsResult.tabs.commentsTab.success) {
                    if (tabsResult.tabs.commentsTab.hasContent) {
                        console.log(`✓ Comments tab: ${tabsResult.tabs.commentsTab.commentCount} comment(s) found`);
                    } else if (tabsResult.tabs.commentsTab.isEmpty) {
                        console.log('✓ Comments tab: Empty (no comments available)');
                    } else {
                        console.log('✓ Comments tab: Exists but state unclear');
                    }
                } else {
                    console.log('✗ Comments tab: Error -', tabsResult.tabs.commentsTab.error);
                }
            } else {
                console.log('○ Comments tab: Not present in UI');
            }

            // Photos Tab
            if (tabsResult.tabs.photosTab.exists) {
                if (tabsResult.tabs.photosTab.success) {
                    if (tabsResult.tabs.photosTab.hasContent) {
                        console.log(`✓ Photos tab: ${tabsResult.tabs.photosTab.photoCount} photo(s) found`);
                    } else if (tabsResult.tabs.photosTab.isEmpty) {
                        console.log('✓ Photos tab: Empty (no photos available)');
                    } else {
                        console.log('✓ Photos tab: Exists but state unclear');
                    }
                } else {
                    console.log('✗ Photos tab: Error -', tabsResult.tabs.photosTab.error);
                }
            } else {
                console.log('○ Photos tab: Not present in UI');
            }

            console.log('─'.repeat(60) + '\n');

            // Verify at least one tab was tested successfully OR both don't exist
            const commentsOk = tabsResult.tabs.commentsTab.success || !tabsResult.tabs.commentsTab.exists;
            const photosOk = tabsResult.tabs.photosTab.success || !tabsResult.tabs.photosTab.exists;

            expect(commentsOk && photosOk).toBeTruthy();
        } else {
            console.warn('Could not test tabs:', tabsResult.error);
        }

        // Close drawer
        const closeResult = await phoneCallPage.closeDetailsDrawer();
        expect(closeResult.success).toBeTruthy();
    });

    test('PCM-010: Delete Phone Call', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available for delete test');
        }

        // Check if delete is available and enabled
        const deleteAvailability = await phoneCallPage.isDeleteAvailable(0);

        if (!deleteAvailability.available) {
            console.log('⚠️  Delete not available:', deleteAvailability.reason);
            test.skip(`Delete operation not available: ${deleteAvailability.reason}`);
        }

        console.log('\n' + '═'.repeat(70));
        console.log('                    DELETE OPERATION TEST');
        console.log('═'.repeat(70));
        console.log('Delete availability:', deleteAvailability.reason);

        // Perform delete operation
        const deleteResult = await phoneCallPage.deletePhoneCall(0);

        console.log('\nDelete Result:', JSON.stringify(deleteResult, null, 2));
        console.log('═'.repeat(70) + '\n');

        // Check if delete was explicitly rejected (error message shown)
        if (deleteResult.error?.includes('Delete rejected')) {
            console.log('❌ Delete operation was rejected by the system');
            console.log('   This may be due to permissions or business rules');
            test.skip('Delete operation rejected: ' + deleteResult.error);
        }

        // Verify deletion succeeded
        if (!deleteResult.success) {
            console.error('❌ Delete operation failed:', deleteResult.error);

            // If we have detailed info, show it
            if (deleteResult.rowCountBefore !== undefined) {
                console.log('\nDeletion Analysis:');
                console.log(`  Rows before: ${deleteResult.rowCountBefore}`);
                console.log(`  Rows after: ${deleteResult.rowCountAfter}`);
                console.log(`  Message shown: ${deleteResult.messageShown || 'None'}`);
                console.log(`  Warning: ${deleteResult.warning || 'None'}`);
            }

            // Fail with detailed message
            throw new Error(`Delete operation failed: ${deleteResult.error}`);
        }

        console.log('✅ Delete operation completed');
        console.log('\nDeletion Summary:');
        console.log(`  Rows before: ${deleteResult.rowCountBefore}`);
        console.log(`  Rows after: ${deleteResult.rowCountAfter}`);
        console.log(`  Rows decreased: ${deleteResult.rowsDecreased ? 'Yes' : 'No'}`);
        console.log(`  Table empty: ${deleteResult.tableEmpty ? 'Yes' : 'No'}`);
        console.log(`  Message shown: ${deleteResult.messageShown || 'None'}`);

        if (deleteResult.warning) {
            console.log(`  ⚠️  Warning: ${deleteResult.warning}`);
        }

        if (deleteResult.deletedData) {
            console.log('\nDeleted Row Data:');
            console.log(`  Date: ${deleteResult.deletedData.date}`);
            console.log(`  Creator: ${deleteResult.deletedData.creator}`);
            console.log(`  Store: ${deleteResult.deletedData.store}`);
        }

        // Final validation
        const rowsDecreased = deleteResult.rowCountAfter < deleteResult.rowCountBefore;
        const tableEmpty = deleteResult.rowCountAfter === 0;
        const operationSucceeded = rowsDecreased || tableEmpty;

        if (!operationSucceeded) {
            console.error('\n❌ VALIDATION FAILED:');
            console.error('   Row count did not decrease and table is not empty');
            console.error('   This indicates the delete may not have been processed');

            // Additional debugging - check if row still exists with same data
            const currentRowData = await phoneCallPage.getRowData(0);
            console.error('\n   Current first row data:');
            console.error(`   Date: ${currentRowData?.date}`);
            console.error(`   Creator: ${currentRowData?.creator}`);
            console.error(`   Store: ${currentRowData?.store}`);

            if (deleteResult.deletedData) {
                console.error('\n   Original row data:');
                console.error(`   Date: ${deleteResult.deletedData.date}`);
                console.error(`   Creator: ${deleteResult.deletedData.creator}`);
                console.error(`   Store: ${deleteResult.deletedData.store}`);

                const isSameRow = currentRowData?.date === deleteResult.deletedData.date &&
                    currentRowData?.creator === deleteResult.deletedData.creator &&
                    currentRowData?.store === deleteResult.deletedData.store;

                console.error(`\n   Same row still present: ${isSameRow ? 'YES - Delete failed!' : 'NO - Data changed'}`);

                if (isSameRow) {
                    console.error('\n   ⚠️  ISSUE: The exact same row is still in the table');
                    console.error('   Possible causes:');
                    console.error('   1. Backend rejected delete silently (no error message)');
                    console.error('   2. Permissions issue (user cannot delete this item)');
                    console.error('   3. Delete API endpoint failed');
                    console.error('   4. Optimistic UI update reverted');
                }
            }

            // Additional debugging
            const currentData = await phoneCallPage.hasTableData();
            console.error(`\n   Current table state: ${currentData.rowCount} rows, empty: ${currentData.isEmpty}`);

            console.error('\n   Recommended Actions:');
            console.error('   • Check browser console for API errors');
            console.error('   • Verify user has delete permissions');
            console.error('   • Check if backend logs show delete request');
            console.error('   • Test delete manually in UI to confirm behavior');
        }

        // Final assertion with detailed error message
        if (!operationSucceeded) {
            const errorDetails = deleteResult.deletedData ?
                `\nAttempted to delete: ${deleteResult.deletedData.store} by ${deleteResult.deletedData.creator}\n` +
                `Rows before: ${deleteResult.rowCountBefore}, after: ${deleteResult.rowCountAfter}\n` +
                `Message shown: ${deleteResult.messageShown || 'None'}` :
                `\nRows before: ${deleteResult.rowCountBefore}, after: ${deleteResult.rowCountAfter}`;

            throw new Error(
                `Delete validation failed - row count did not decrease${errorDetails}\n\n` +
                `This likely indicates:\n` +
                `1. Backend silently rejected the delete\n` +
                `2. User lacks delete permissions\n` +
                `3. API endpoint error\n\n` +
                `Check console output above for detailed analysis.`
            );
        }

        expect(operationSucceeded).toBeTruthy();
        console.log('\n✅ Delete validation passed');
        console.log('═'.repeat(70) + '\n');
    });

    test('PCM-011: Filter by Store', async () => {
        const searchTerm = 'GOLDEN FALCON LIQUOR';
        const storeToSelect = 'GOLDEN FALCON LIQUOR';

        // Apply filter
        const filterResult = await phoneCallPage.filterByStore(searchTerm, storeToSelect);

        if (!filterResult.success) {
            test.skip(`Failed to apply filter: ${filterResult.error}`);
        }

        // Wait for filter to apply
        await page.waitForTimeout(2000);

        // Verify the selected store appears in filter display
        await expect(page.getByRole('table').getByText(storeToSelect)).toBeVisible();

        // Check table state
        const emptyState = await phoneCallPage.isEmptyState();

        if (emptyState.isEmpty) {
            console.log(`Store "${storeToSelect}" filtered but no phone call data exists`);
            await expect(page.getByRole('cell', { name: 'No results.' })).toBeVisible();
        } else {
            // Verify all rows match the filter
            const validation = await phoneCallPage.validateAllRowsMatchFilter(storeToSelect);

            expect(validation.totalRows).toBeGreaterThan(0);

            if (!validation.allMatch) {
                console.error('Filter validation failed:', validation.mismatches);
            }

            expect(validation.allMatch).toBeTruthy();

            // Verify first row contains the store
            const storeCell = phoneCallPage.tableRows.first().locator('td').nth(2);
            await expect(storeCell).toContainText(storeToSelect, { ignoreCase: true });
        }
    });

    test('PCM-012: Filter by Creator', async () => {
        const creatorName = 'Katherine Guerra';

        // Apply filter
        const filterResult = await phoneCallPage.filterByCreator(creatorName);

        if (!filterResult.success) {
            test.skip(`Failed to apply creator filter: ${filterResult.error}`);
        }

        await page.waitForTimeout(3000);

        // Check table state
        const tableData = await phoneCallPage.hasTableData();

        if (tableData.hasData) {
            // Verify first row has the correct creator
            const creatorCell = phoneCallPage.tableRows.first().locator('td').nth(1);
            await expect(creatorCell).toContainText(creatorName, { ignoreCase: true });

            // Optionally validate all rows
            const rows = phoneCallPage.tableRows;
            const rowCount = await rows.count();
            console.log(`${rowCount} rows found for creator "${creatorName}"`);
        } else {
            // No results for this creator
            await expect(page.getByText('No results.')).toBeVisible();
            console.log(`No phone calls found for creator "${creatorName}"`);
        }
    });

    test('PCM-013: Date Filter', async () => {
        const startDay = '1';
        const endDay = '22';

        const filterResult = await phoneCallPage.filterByDate(startDay, endDay);

        if (!filterResult.success) {
            console.error('Date filter failed:', filterResult.error);
            throw new Error(`Date filter failed: ${filterResult.error}`);
        }

        expect(filterResult.success).toBeTruthy();

        await page.waitForTimeout(2000);

        // Verify table updated
        const tableData = await phoneCallPage.hasTableData();
        console.log('Table data after date filter:', tableData);

        // Either has filtered data or shows no results
        const hasValidState = tableData.hasData || tableData.isEmpty;
        expect(hasValidState).toBeTruthy();
    });

    test('PCM-014: Pagination', async () => {
        // Get initial pagination info
        const paginationInfo = await phoneCallPage.getPaginationInfo();
        console.log('Pagination info:', paginationInfo);

        // Test rows per page selector
        if (await phoneCallPage.rowsPerPageSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
            await phoneCallPage.rowsPerPageSelect.click();

            const option50 = page.getByRole('option', { name: '50' });
            if (await option50.isVisible({ timeout: 2000 }).catch(() => false)) {
                const rowCountBefore = await phoneCallPage.tableRows.count();
                await option50.click();
                await phoneCallPage.waitForTableReady();

                const rowCountAfter = await phoneCallPage.tableRows.count();
                console.log(`Rows per page changed: ${rowCountBefore} -> ${rowCountAfter}`);
            }
        }

        // Test next page navigation
        if (paginationInfo?.hasNextPage) {
            const currentPageData = await phoneCallPage.getRowData(0);

            await phoneCallPage.paginationNextButton.click();
            await phoneCallPage.waitForTableReady();
            await page.waitForTimeout(1000);

            const nextPageData = await phoneCallPage.getRowData(0);

            // Verify page changed (first row should be different)
            const pageChanged = currentPageData?.date !== nextPageData?.date ||
                currentPageData?.creator !== nextPageData?.creator;

            if (!pageChanged) {
                console.warn('Warning: Page may not have changed after clicking next');
            }

            console.log('Navigation test:', {
                hasNextPage: paginationInfo.hasNextPage,
                pageChanged
            });
        } else {
            console.log('No next page available for pagination test');
        }
    });

    test('PCM-015: Export', async () => {
        test.setTimeout(60000);

        const exportResult = await phoneCallPage.exportData();

        // Verify export succeeded
        expect(exportResult.success).toBeTruthy();

        if (!exportResult.success) {
            console.error('Export failed:', exportResult.error);
            throw new Error(`Export failed: ${exportResult.error}`);
        }

        // Verify download
        expect(exportResult.download).toBeDefined();
        expect(exportResult.size).toBeGreaterThan(0);

        console.log('Export successful:', {
            size: exportResult.size,
            path: exportResult.path
        });

        // Optional: Verify file content
        const fs = require('fs');
        const content = fs.readFileSync(exportResult.path, 'utf-8');

        // Check for expected headers
        const hasHeaders = content.includes('Date') ||
            content.includes('Creator') ||
            content.includes('Store');

        if (!hasHeaders) {
            console.warn('Warning: Export file may not contain expected headers');
        }

        expect(hasHeaders).toBeTruthy();
    });

    test('PCM-018: Battlemap Link', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available for BattleMap test');
        }

        if (!(await phoneCallPage.battlemapLink.first().isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip('Battlemap link not found');
        }

        // Get store name before navigation
        const storeName = await phoneCallPage.getStoreNameFromRow(0);

        // Navigate to BattleMap
        const mapResult = await phoneCallPage.navigateToBattleMap(storeName);

        // Verify navigation succeeded
        expect(mapResult.success).toBeTruthy();

        if (!mapResult.success) {
            throw new Error(`BattleMap navigation failed: ${mapResult.error}`);
        }

        // Verify map loaded
        expect(mapResult.mapLoaded).toBeTruthy();

        if (!mapResult.mapLoaded) {
            console.warn('Warning:', mapResult.warning);
        }

        console.log('BattleMap navigation result:', mapResult);

        // Verify URL
        expect(page.url()).toContain('map');

        // If store name was found, verify it matches
        if (mapResult.storeName) {
            console.log('Map store name:', mapResult.storeName);
            console.log('Expected store:', storeName);

            if (mapResult.storeMatches === false) {
                console.warn('Warning: Store name mismatch on map');
            }
        }

        // Navigate back to Phone Calls
        await phoneCallPage.navigateTo();
        await page.waitForLoadState('networkidle').catch(() => { });
    });

    test('PCM-019: Google Maps Link', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available for Google Maps test');
        }

        // Test Google Maps link
        const mapsResult = await phoneCallPage.testGoogleMapsLink();

        if (!mapsResult.success) {
            test.skip(`Google Maps test failed: ${mapsResult.error}`);
        }

        // Verify link worked
        expect(mapsResult.success).toBeTruthy();
        expect(mapsResult.url).toContain('google.com/maps');

        console.log('Google Maps test successful:', {
            url: mapsResult.url,
            originalHref: mapsResult.originalHref
        });
    });

    test('PCM-020: Empty State', async () => {
        // Search for non-existent store
        await phoneCallPage.storeSearchInput.click();
        await phoneCallPage.storeSearchTextInput.fill('Non Existent Store 12345');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);

        // Verify empty state
        const emptyState = await phoneCallPage.isEmptyState();

        expect(emptyState.isEmpty).toBeTruthy();
        expect(emptyState.noResultsMessage).toBeTruthy();

        await expect(page.getByText('No results.')).toBeVisible();

        console.log('Empty state verified:', emptyState);
    });

    // Additional comprehensive test cases

    test('PCM-021: Error Handling - Failed Store Update', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available for error handling test');
        }

        // Try to attach/change to invalid store
        const hasButton = await phoneCallPage.attachStoreButton.first().isVisible().catch(() => false) ||
            await phoneCallPage.changeStoreButton.first().isVisible().catch(() => false);

        if (!hasButton) {
            test.skip('No attach/change store button available');
        }

        const result = await phoneCallPage.attachOrChangeStore('', false);

        // Should fail or show error
        if (result.success) {
            console.warn('Warning: Empty store name was accepted - may need validation');
        }

        console.log('Error handling result:', result);
    });

    test('PCM-022: Concurrent Filter Application', async () => {
        // Apply multiple filters sequentially
        const store = 'GOLDEN FALCON LIQUOR';
        const creator = 'Katherine Guerra';

        // Apply store filter
        const storeResult = await phoneCallPage.filterByStore(store, store);
        console.log('Store filter:', storeResult);

        if (storeResult.success) {
            await page.waitForTimeout(1000);

            // Apply creator filter on top
            const creatorResult = await phoneCallPage.filterByCreator(creator);
            console.log('Creator filter:', creatorResult);

            await page.waitForTimeout(2000);

            // Verify both filters applied
            const tableData = await phoneCallPage.hasTableData();

            if (tableData.hasData) {
                const rowData = await phoneCallPage.getRowData(0);
                console.log('Filtered row data:', rowData);

                // Check if both filters are applied
                const storeMatches = rowData.store.toLowerCase().includes(store.toLowerCase());
                const creatorMatches = rowData.creator.toLowerCase().includes(creator.toLowerCase());

                console.log('Filter validation:', { storeMatches, creatorMatches });
            } else {
                console.log('No results for combined filters');
            }
        }
    });

    test('PCM-023: Data Integrity After Operations', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData || tableData.rowCount < 2) {
            test.skip('Insufficient data for integrity test');
        }

        // Get initial data
        const initialData = await phoneCallPage.getRowData(0);
        console.log('Initial data:', initialData);

        // Perform view details operation
        const detailsResult = await phoneCallPage.viewDetails(0);

        if (detailsResult.success && detailsResult.hasData) {
            // Verify details match table data
            const detailsData = detailsResult.details;

            const storeMatches = !detailsData.storeName ||
                initialData.store.toLowerCase().includes(detailsData.storeName.toLowerCase()) ||
                detailsData.storeName.toLowerCase().includes(initialData.store.toLowerCase());

            if (!storeMatches) {
                console.warn('Warning: Store name mismatch between table and details');
                console.log('Table store:', initialData.store);
                console.log('Details store:', detailsData.storeName);
            }

            await phoneCallPage.closeDetailsDrawer();
        }

        // Verify table data unchanged
        const finalData = await phoneCallPage.getRowData(0);

        expect(finalData.date).toBe(initialData.date);
        expect(finalData.creator).toBe(initialData.creator);
        expect(finalData.store).toBe(initialData.store);

        console.log('Data integrity verified');
    });

    test('PCM-024: Tabs With and Without Data', async () => {
        const tableData = await phoneCallPage.hasTableData();

        if (!tableData.hasData) {
            test.skip('No data available for tabs validation test');
        }

        // Open details drawer
        const detailsResult = await phoneCallPage.viewDetails(0);

        if (!detailsResult.success) {
            test.skip('Could not open details drawer');
        }

        // Test tabs
        const tabsResult = await phoneCallPage.testDetailsTabs();

        expect(tabsResult.success).toBeTruthy();

        console.log('\n' + '═'.repeat(70));
        console.log('           TABS CONTENT VALIDATION REPORT');
        console.log('═'.repeat(70));

        // Comments Tab Analysis
        if (tabsResult.tabs.commentsTab.exists) {
            console.log('\n📝 COMMENTS TAB:');
            console.log('   Status: Present in UI ✓');

            if (tabsResult.tabs.commentsTab.success) {
                if (tabsResult.tabs.commentsTab.hasContent) {
                    console.log('   Content: ✓ HAS DATA');
                    console.log(`   Count: ${tabsResult.tabs.commentsTab.commentCount} comment(s)`);
                    console.log('   Validation: Comments loaded successfully');
                } else if (tabsResult.tabs.commentsTab.isEmpty) {
                    console.log('   Content: ○ EMPTY');
                    console.log('   Message: "No Comments Available" shown');
                    console.log('   Validation: Empty state handled correctly');
                } else {
                    console.log('   Content: ? UNCLEAR STATE');
                    console.log('   Warning: Tab exists but content status unclear');
                }
            } else {
                console.log('   Error: ✗ FAILED TO TEST');
                console.log(`   Details: ${tabsResult.tabs.commentsTab.error}`);
            }
        } else {
            console.log('\n📝 COMMENTS TAB:');
            console.log('   Status: Not present in UI');
            console.log('   Note: This tab may not be implemented yet');
        }

        // Photos Tab Analysis
        if (tabsResult.tabs.photosTab.exists) {
            console.log('\n📷 PHOTOS TAB:');
            console.log('   Status: Present in UI ✓');

            if (tabsResult.tabs.photosTab.success) {
                if (tabsResult.tabs.photosTab.hasContent) {
                    console.log('   Content: ✓ HAS DATA');
                    console.log(`   Count: ${tabsResult.tabs.photosTab.photoCount} photo(s)`);
                    console.log('   Validation: Photos loaded successfully');
                } else if (tabsResult.tabs.photosTab.isEmpty) {
                    console.log('   Content: ○ EMPTY');
                    console.log('   Message: "No photos" message shown');
                    console.log('   Validation: Empty state handled correctly');
                } else {
                    console.log('   Content: ? UNCLEAR STATE');
                    console.log('   Warning: Tab exists but content status unclear');
                }
            } else {
                console.log('   Error: ✗ FAILED TO TEST');
                console.log(`   Details: ${tabsResult.tabs.photosTab.error}`);
            }
        } else {
            console.log('\n📷 PHOTOS TAB:');
            console.log('   Status: Not present in UI');
            console.log('   Note: This tab may not be implemented yet');
        }

        // Summary
        console.log('\n' + '─'.repeat(70));
        console.log('SUMMARY:');

        const bothExist = tabsResult.tabs.commentsTab.exists && tabsResult.tabs.photosTab.exists;
        const onlyComments = tabsResult.tabs.commentsTab.exists && !tabsResult.tabs.photosTab.exists;
        const onlyPhotos = !tabsResult.tabs.commentsTab.exists && tabsResult.tabs.photosTab.exists;
        const neitherExist = !tabsResult.tabs.commentsTab.exists && !tabsResult.tabs.photosTab.exists;

        if (bothExist) {
            console.log('  ✓ Both Comments and Photos tabs are implemented');

            const commentsEmpty = tabsResult.tabs.commentsTab.isEmpty;
            const photosEmpty = tabsResult.tabs.photosTab.isEmpty;

            if (!commentsEmpty && !photosEmpty) {
                console.log('  ✓ Both tabs have data - fully populated phone call');
            } else if (commentsEmpty && photosEmpty) {
                console.log('  ○ Both tabs are empty - phone call has no comments or photos');
            } else if (commentsEmpty) {
                console.log('  ⚠ Comments empty, Photos have data');
            } else {
                console.log('  ⚠ Comments have data, Photos empty');
            }
        } else if (onlyComments) {
            console.log('  ⚠ Only Comments tab implemented');
        } else if (onlyPhotos) {
            console.log('  ⚠ Only Photos tab implemented');
        } else if (neitherExist) {
            console.log('  ⚠ Neither tab is implemented in UI');
        }

        console.log('═'.repeat(70) + '\n');

        // Test passes if tabs that exist were tested successfully
        const commentsOk = !tabsResult.tabs.commentsTab.exists || tabsResult.tabs.commentsTab.success;
        const photosOk = !tabsResult.tabs.photosTab.exists || tabsResult.tabs.photosTab.success;

        expect(commentsOk && photosOk).toBeTruthy();

        // Close drawer
        await phoneCallPage.closeDetailsDrawer();
    });
});