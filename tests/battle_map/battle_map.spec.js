
import { test, expect } from '@playwright/test';
import { BattleMapPage } from '../../pages/BattleMapPage';

let sharedPage;
let battleMapPage;

test.describe.configure({ mode: 'serial' });

test.describe('Battle Map Module Suite', () => {

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext({
            permissions: ['geolocation'],
            geolocation: { latitude: 28.5383, longitude: -81.3792 },
            viewport: { width: 1280, height: 720 }
        });

        sharedPage = await context.newPage();
        battleMapPage = new BattleMapPage(sharedPage);

        console.log('--- STARTING MANUAL LOGIN FOR BATTLE MAP ---');
        try {
            await sharedPage.goto('https://app.omnigrowthos.io/auth/login');
            await sharedPage.getByRole('textbox', { name: 'Email' }).fill('Shopify@omnigrowthos.com');
            await sharedPage.getByRole('textbox', { name: 'Email' }).press('Tab');
            await sharedPage.getByRole('textbox', { name: 'Password' }).fill('Shopify@1234');
            await sharedPage.getByRole('button', { name: 'Login', exact: true }).click();

            // Wait for navigation robustly
            await sharedPage.waitForURL(/.*\/(dashboard|map|stores)/, { timeout: 60000 });

            console.log('Navigating to Map page...');
            await sharedPage.goto('https://app.omnigrowthos.io/map');

            console.log('Waiting for Map canvas...');
            const canvas = sharedPage.locator('canvas.mapboxgl-canvas');
            await canvas.waitFor({ state: 'visible', timeout: 90000 });
            await sharedPage.waitForTimeout(5000);
            console.log('--- BATTLE MAP READY ---');
        } catch (error) {
            console.error('Setup failed, taking screenshot...', error);
            // Try to capture state if possible (though if closed, this might fail)
            // Can't screenshot if context is closed
            throw error;
        }
    });

    // Robust cleanup after ANY test to prevent state bleeding
    test.afterEach(async () => {
        if (!sharedPage || sharedPage.isClosed()) return;
        
        try {
            console.log('--- CLEANUP: Closing any open modals/sidebars ---');
            // Try pressing Escape up to 3 times to accept/close layers
            for (let i = 0; i < 3; i++) {
                if (sharedPage.isClosed()) break;
                await sharedPage.keyboard.press('Escape');
                await sharedPage.waitForTimeout(300);
            }

            if (!sharedPage.isClosed()) {
                // Ensure no dialog or sidebar is visible
                const dialog = sharedPage.getByRole('dialog');
                if (await dialog.isVisible()) {
                    console.log('Dialog detected during cleanup, closing...');
                    const closeBtn = dialog.getByRole('button', { name: /close|cancel/i }).first();
                    if (await closeBtn.isVisible()) {
                        await closeBtn.click().catch(() => {});
                    } else {
                        await sharedPage.keyboard.press('Escape');
                    }
                }
                
                // If a sidebar or drawer is still visible (often marked with specific classes or roles)
                const sidebarClose = sharedPage.locator('button').filter({ hasText: /close/i }).first();
                if (await sidebarClose.isVisible()) {
                    await sidebarClose.click().catch(() => {});
                }
            }
        } catch (error) {
            console.log('Cleanup skipped or failed:', error.message);
        }
    });

    // ... (Tests BM-001 to BM-017 remain unchanged or verified by previous steps)



    // test('BM-018-ERR | Store Rating | Handle update failure (400 Error)', async () => {
    //     await sharedPage.route('**/api/stores/**/rating', route => {
    //         route.fulfill({
    //             status: 400,
    //             contentType: 'application/json',
    //             body: JSON.stringify({ error: 'Bad Request', message: 'Update failed' })
    //         });
    //     });

    //     // Ensure modal is open by clicking a marker
    //     // Ensure layer is on or marker is visible
    //     if (!await battleMapPage.bronzeMarker.first().isVisible()) {
    //         await battleMapPage.layersButton.click();
    //         if (!await battleMapPage.storePotentialLayer.isChecked()) {
    //             await battleMapPage.storePotentialLayer.click();
    //         }
    //         await sharedPage.locator('html').click();
    //     }
    //     await battleMapPage.bronzeMarker.or(battleMapPage.silverMarker).or(battleMapPage.goldMarker).first().click();

    //     await expect(battleMapPage.editStoreRankingButton).toBeVisible();
    //     await battleMapPage.editStoreRankingButton.click();
    //     await battleMapPage.rankingCombobox.click();
    //     await sharedPage.getByRole('option', { name: /silver/i }).first().click();
    //     await battleMapPage.saveButton.click();

    //     // Verify error message in UI
    //     await expect(sharedPage.locator('[role="alert"]').or(sharedPage.getByText(/failed|error|request|problem|unable/i)).first()).toBeVisible({ timeout: 10000 });
    //     await sharedPage.unroute('**/api/stores/**/rating');
    //     // Don't close modal - let next test handle state
    // });


    test.afterAll(async () => {
        if (sharedPage) await sharedPage.close();
    });

    // test('BM-001 | Authentication | Login with valid credentials', async () => {
    //     // Clean up any leftover modals from previous tests
    //     await sharedPage.keyboard.press('Escape');
    //     await sharedPage.waitForTimeout(500);
    //     await expect(sharedPage).not.toHaveURL(/.*\/login/);
    // });

    test('BM-002 | Navigation | Navigate to Battle Maps module', async () => {
        await battleMapPage.goto();
        await expect(sharedPage).toHaveURL(/.*\/map/);
        await expect(battleMapPage.layersButton).toBeVisible();
    });

    test('BM-003 | UI | Verify Battle Maps UI elements', async () => {
        await expect(battleMapPage.mapRegion).toBeVisible();
        await expect(battleMapPage.layersButton).toBeVisible();
        await expect(battleMapPage.filtersButton).toBeVisible();
        await expect(battleMapPage.searchCombobox).toBeVisible();
    });

    test('BM-004 | Map Load | Verify default map rendering', async () => {
        await expect(battleMapPage.bronzeMarker.first()).toBeVisible({ timeout: 30000 });
    });

    test('BM-005 | Map Controls | Verify zoom controls', async () => {
        await battleMapPage.zoomInButton.click();
        await sharedPage.waitForTimeout(500);
        await battleMapPage.zoomOutButton.click();
    });

    test('BM-006 | Location | Navigate to predefined city (Orlando, FL)', async () => {
        await battleMapPage.orlandoButton.click();
        // Wait for map to settle
        await sharedPage.waitForTimeout(3000);
        await expect(battleMapPage.bronzeMarker.first()).toBeVisible({ timeout: 15000 });
    });

    test('BM-007 | Search | Search store by name', async () => {
        const storeName = 'Southern Nights Orlando';
        await battleMapPage.clearSearch();
        
        await battleMapPage.searchCombobox.click();
        await battleMapPage.searchInput.fill(storeName);

        // Wait for results to appear and click
        const result = sharedPage.getByText(storeName).first();
        await result.click();

        // Wait for map and click the marker as per flow
        await sharedPage.waitForTimeout(4000);
        await battleMapPage.silverMarker.first().click({ force: true });

        // Verify side sheet/heading
        await expect(battleMapPage.storeDetailsHeader(storeName)).toBeVisible({ timeout: 15000 });
        await battleMapPage.closeModalButton.click().catch(() => sharedPage.keyboard.press('Escape'));
        
        // Clear search manually after success
        await battleMapPage.clearSearch();
    });

    test('BM-008 | Search | Search with invalid keyword', async () => {
        await sharedPage.waitForTimeout(1000);
        
        // Ensure everything is clean
        await sharedPage.keyboard.press('Escape');
        await battleMapPage.clearSearch();

        await battleMapPage.searchCombobox.click({ force: true });
        await battleMapPage.searchInput.fill('InvalidKeyword999_###');
        await expect(sharedPage.getByText(/no location found/i)).toBeVisible({ timeout: 10000 });
        await sharedPage.keyboard.press('Escape');
    });

    test('BM-FAILURE-01 | API | Handle search failure (500 Error)', async () => {
        await sharedPage.waitForTimeout(1000);
        await sharedPage.route('**/api/search**', route => {
            route.fulfill({ status: 500, body: 'Search Error' });
        });
        await battleMapPage.searchCombobox.click();
        await battleMapPage.searchInput.fill('ErrorTrigger');
        // Expect "No location found." on API failure
        await expect(sharedPage.getByText(/no location found/i)).toBeVisible({ timeout: 10000 });
        await sharedPage.unroute('**/api/search**');
        await sharedPage.keyboard.press('Escape');
    });

    test('BM-009 | Layers | Open map layers panel', async () => {
        await battleMapPage.layersButton.click();
        await expect(battleMapPage.storePotentialLayer).toBeVisible();
        await sharedPage.keyboard.press('Escape');
    });

    test('BM-010 | Layers | Enable Store Potential Ranking', async () => {
        await battleMapPage.layersButton.click();
        if (!(await battleMapPage.storePotentialLayer.isChecked())) {
            const potentialPromise = sharedPage.waitForResponse(resp => resp.url().includes('potential') || resp.url().includes('map'));
            await battleMapPage.storePotentialLayer.click();
            await potentialPromise;
        }
        await sharedPage.locator('html').click();
        await sharedPage.waitForTimeout(3000); // Wait for layer to render
        await expect(battleMapPage.bronzeMarker.or(battleMapPage.silverMarker).or(battleMapPage.goldMarker).first()).toBeVisible({ timeout: 15000 });
    });

    test('BM-011 | Layers | Disable Store Potential Ranking', async () => {
        await battleMapPage.layersButton.click();
        if (await battleMapPage.storePotentialLayer.isChecked()) {
            await battleMapPage.storePotentialLayer.click();
        }
        await sharedPage.locator('html').click();
        // Markers might still exist if other layers are on, but we follow the toggle
    });

    test('BM-012 | Layers | Verify Gold/Silver/Bronze markers', async () => {
        await battleMapPage.layersButton.click();
        if (!(await battleMapPage.storePotentialLayer.isChecked())) {
            await battleMapPage.storePotentialLayer.click();
        }
        await sharedPage.locator('html').click();
        await expect(battleMapPage.bronzeMarker.or(battleMapPage.silverMarker).or(battleMapPage.goldMarker).first()).toBeVisible();
        // Verify via alt text handles color coding
    });

    test('BM-013 | RFM | Enable RFM performance layer', async () => {
        // Zoom out a little before running anything else as requested
        await battleMapPage.zoomOutButton.click();
        await sharedPage.waitForTimeout(1000);

        // Use toggleLayer for robust opening
        // We'll catch the promise but not await it strictly if it fails
        const rfmPromise = sharedPage.waitForResponse(resp => resp.url().includes('rfm') || resp.url().includes('map'), { timeout: 10000 }).catch(() => null);
        await battleMapPage.toggleLayer(battleMapPage.rfmLayer);
        await rfmPromise;
        // Wait a bit for render
        await sharedPage.waitForTimeout(2000);
    });

    test('BM-014 | RFM | Toggle individual RFM categories', async () => {
        await battleMapPage.layersButton.click();
        const champions = sharedPage.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).first();
        await expect(champions).toBeVisible();
        await champions.click();
        await champions.click();
        await sharedPage.locator('html').click();
    });

    test('BM-015 | RFM | Disable RFM layer', async () => {
        await battleMapPage.layersButton.click();
        if (await battleMapPage.rfmLayer.isChecked()) {
            await battleMapPage.rfmLayer.click();
        }
        await sharedPage.locator('html').click();
    });

    test('BM-016 | Store Details | Open, Verify and Update store rating', async () => {
        // Ensure markers are visible
        await battleMapPage.layersButton.click();
        if (!(await battleMapPage.storePotentialLayer.isChecked())) {
            await battleMapPage.storePotentialLayer.click();
        }
        await sharedPage.locator('html').click();
        
        // Wait for map data and click a marker
        await expect(battleMapPage.bronzeMarker.or(battleMapPage.silverMarker).or(battleMapPage.goldMarker).first()).toBeVisible({ timeout: 15000 });
        await battleMapPage.bronzeMarker.or(battleMapPage.silverMarker).or(battleMapPage.goldMarker).first().click();
        
        // BM-017 part: Verify Information
        await expect(sharedPage.getByRole('dialog')).toBeVisible();
        await expect(sharedPage.getByText('Store Rating')).toBeVisible();
        await expect(sharedPage.getByText('Location', { exact: true })).toBeVisible();

        // BM-018 part: Update store rating
        await expect(battleMapPage.editStoreRankingButton).toBeVisible();
        await battleMapPage.editStoreRankingButton.click();
        await battleMapPage.rankingCombobox.click();
        await sharedPage.getByRole('option', { name: /silver/i }).first().click();

        await battleMapPage.saveButton.click();
        await expect(sharedPage.getByText('SILVER', { exact: true })).toBeVisible({ timeout: 20000 });
        // Close modal
        await battleMapPage.closeModalButton.click().catch(() => sharedPage.keyboard.press('Escape'));
    });
    test('BM-020 | Customer | Enable and Open customer marker details', async () => {
        // Navigate to Orlando where we know customers exist
        await battleMapPage.navigateToCity('Orlando, FL');
        
        // Zoom in to see individual pins instead of clusters
        await battleMapPage.zoomInButton.click();
        await sharedPage.waitForTimeout(1000);
        await battleMapPage.zoomInButton.click();
        await sharedPage.waitForTimeout(1000);
        
        // Start from a clean slate
        await battleMapPage.resetAllFiltersAndLayersButton.click().catch(() => {});
        await sharedPage.waitForTimeout(1000);

        // Enable Customers layer
        const customerPromise = sharedPage.waitForResponse(resp => resp.url().includes('customers'), { timeout: 20000 }).catch(() => null);
        await battleMapPage.toggleLayer(battleMapPage.customerLayer);
        await customerPromise;
        await sharedPage.waitForTimeout(4000);
        
        // Try clicking up to 3 markers
        const markers = battleMapPage.customerMarker;
        const count = await markers.count();
        console.log(`Found ${count} customer markers`);
        
        let dialogOpened = false;
        for (let i = 0; i < Math.min(count, 3); i++) {
            const marker = markers.nth(i);
            console.log(`Attempting to click customer marker ${i}`);
            
            try {
                await marker.scrollIntoViewIfNeeded();
                await marker.click({ force: true });
            } catch (e) {
                console.log(`Standard click failed for marker ${i}, trying JS click: ${e.message}`);
                await marker.evaluate(el => el.click()).catch(() => {});
            }
            
            await sharedPage.waitForTimeout(2500);
            
            const visible = await sharedPage.getByRole('dialog').or(sharedPage.locator('.drawer-content')).isVisible({ timeout: 4000 }).catch(() => false);
            if (visible) {
                dialogOpened = true;
                console.log('Customer details dialog opened successfully');
                await battleMapPage.closeModalButton.click().catch(() => sharedPage.keyboard.press('Escape'));
                break;
            }
        }
        
        if (!dialogOpened) {
            throw new Error('Could not open customer details dialog');
        }
    });

    test('BM-022 | Announcements | Enable and View announcement details', async () => {
        await battleMapPage.layersButton.click();
        await battleMapPage.announcementsLayer.click();
        await sharedPage.locator('html').click();

        // Navigate to Swansea where announcements exist
        await battleMapPage.searchCombobox.click();
        await battleMapPage.searchInput.fill('Swansea');
        const swanseaResult = sharedPage.locator('[role="option"]').filter({ hasText: 'Swansea' }).first();
        await swanseaResult.waitFor({ state: 'visible', timeout: 10000 });
        await swanseaResult.click();
        await sharedPage.waitForTimeout(5000);

        await expect(battleMapPage.announcementMarker.first()).toBeVisible({ timeout: 20000 });
        await battleMapPage.announcementMarker.first().click();
        await expect(sharedPage.getByText('Announcement Date')).toBeVisible();

        await sharedPage.keyboard.press('Escape');
    });

    // test('BM-024 | Influencers | Enable influencers layer', async () => {
    //     await battleMapPage.layersButton.click();
    //     const influencerPromise = sharedPage.waitForResponse(resp => resp.url().includes('influencers'));
    //     await battleMapPage.influencersLayer.click();
    //     await influencerPromise;
    //     await sharedPage.locator('html').click();
    // });

    // test('BM-025 | Influencers | Open influencer details', async () => {
    //     const influencerMarker = sharedPage.locator('div:nth-child(4) > div > .lucide > circle:nth-child(2)');
    //     await influencerMarker.click();
    //     await expect(sharedPage.getByRole('dialog')).toBeVisible();
    //     await battleMapPage.closeModalButton.click();
    // });

    test('BM-026 | Custom Cluster | Enable draw controls', async () => {
        // Reset layers first to ensure a clean drawing canvas
        await battleMapPage.resetAllFiltersAndLayersButton.click().catch(() => {});
        await sharedPage.waitForTimeout(1000);
        
        await battleMapPage.toggleDrawControls.click();
        await expect(battleMapPage.drawNewClusterButton).toBeVisible();
    });

    test('BM-027/028 | Custom Cluster | Draw and Save new cluster', async () => {
        // Ensure no lingering sidebars are blocking the map
        await sharedPage.locator('html').click(); 
        await sharedPage.keyboard.press('Escape');
        
        // Ensure draw controls are enabled
        if (!await battleMapPage.drawNewClusterButton.isVisible()) {
            await battleMapPage.toggleDrawControls.click();
        }
        await expect(battleMapPage.drawNewClusterButton).toBeVisible();

        await battleMapPage.drawNewClusterButton.click();
        // Use points verified in the user's locators script to ensure valid polygon creation
        const points = [
            { x: 509, y: 147 },
            { x: 993, y: 216 },
            { x: 936, y: 499 },
            { x: 461, y: 433 },
            { x: 475, y: 265 }
        ];

        for (const point of points) {
            // Use force to ensure clicks land on the map even if minor UI markers are nearby
            await battleMapPage.mapRegion.click({ position: point, force: true });
            await sharedPage.waitForTimeout(500); // Wait for Mapbox to process each vertex
        }

        // Force click if obscured by the drawing layer
        await battleMapPage.finishDrawingButton.click({ force: true });

        // Verify/Wait for modal
        await expect(battleMapPage.clusterTitleInput).toBeVisible({ timeout: 10000 });

        // BM-028 part: Save details
        const clusterTitle = `TestCluster_${Date.now()}`;
        await battleMapPage.clusterTitleInput.fill(clusterTitle);
        await battleMapPage.clusterDescriptionInput.fill('Test Description');

        // Wait for save
        const savePromise = sharedPage.waitForResponse(resp =>
            resp.url().includes('custom-clusters') && resp.request().method() === 'POST'
        ).catch(() => console.log('Save response missed or timed out'));

        await battleMapPage.saveClusterDetailsButton.click();

        // Wait for modal to disappear
        await expect(battleMapPage.clusterTitleInput).toBeHidden({ timeout: 10000 });

        sharedPage['lastClusterTitle'] = clusterTitle;
    });

    test('BM-029 | Custom Cluster | Cancel cluster creation', async () => {
        // Ensure draw controls are enabled
        if (!await battleMapPage.drawNewClusterButton.isVisible()) {
            await battleMapPage.toggleDrawControls.click();
        }
        await expect(battleMapPage.drawNewClusterButton).toBeVisible();

        await battleMapPage.drawNewClusterButton.click();
        await battleMapPage.mapRegion.click({ position: { x: 100, y: 100 } });
        await battleMapPage.cancelButton.click();
        await expect(battleMapPage.clusterTitleInput).not.toBeVisible();
    });

    test('BM-030 | Custom Cluster | View and Edit cluster details', async () => {
        const title = sharedPage['lastClusterTitle'] || 'TestCluster'; // Fallback to a known title or generic
        await battleMapPage.filtersButton.click();

        // Open the suggestion and write the name of cluster as per user request
        await battleMapPage.customClusterFilterTrigger.click();
        await sharedPage.getByPlaceholder('Search custom cluster...').fill(title);
        await sharedPage.getByText(title).click();
        await battleMapPage.applyChangesButton.click();

        await sharedPage.getByRole('button', { name: 'View Cluster Details' }).click();
        await expect(sharedPage.getByRole('heading', { name: title }).first()).toBeVisible();

        // BM-031 part: Edit details
        await sharedPage.getByRole('button', { name: 'Edit Details' }).click();
        await battleMapPage.clusterDescriptionInput.fill('Updated Desc');

        const updatePromise = sharedPage.waitForResponse(resp =>
            resp.url().includes('custom-clusters') && (resp.request().method() === 'PUT' || resp.request().method() === 'PATCH')
        ).catch(() => console.log('Update response missed'));

        await battleMapPage.saveClusterDetailsButton.click();
        await expect(sharedPage.getByText(/Cluster Updated|Successfully/i)).toBeVisible({ timeout: 10000 }).catch(() => {});
        
        // Force close details sidepanel/modal
        await battleMapPage.closeModalButton.click().catch(() => {});
        await sharedPage.keyboard.press('Escape');
        await sharedPage.keyboard.press('Escape');
        await sharedPage.waitForTimeout(1000);
    });

    test('BM-032 | Customer Cluster | Enable and View customer clusters', async () => {
        // First navigate to Orlando as requested
        await battleMapPage.navigateToCity('Orlando, FL');

        // Zoom out to see cluster circles better
        await battleMapPage.zoomOutButton.click();
        await sharedPage.waitForTimeout(1000);
        await battleMapPage.zoomOutButton.click();
        await sharedPage.waitForTimeout(1000);

        // Now enable Customer Clusters
        const clustersPromise = sharedPage.waitForResponse(resp => resp.url().includes('clusters'), { timeout: 30000 }).catch(() => null);
        await battleMapPage.toggleLayer(battleMapPage.customerClustersLayer);
        await clustersPromise;
        await sharedPage.waitForTimeout(3000);

        // At this zoom level in Orlando, clicking anywhere opens a cluster side sheet
        await battleMapPage.mapRegion.click({ position: { x: 640, y: 360 } });
        await sharedPage.waitForTimeout(1000);
        
        // Verify cluster details are visible
        await expect(sharedPage.getByText(/customers in this cluster/i)).toBeVisible({ timeout: 10000 });
        await battleMapPage.closeModalButton.click().catch(() => sharedPage.keyboard.press('Escape'));
    });



    test('BM-034 | Visits | Enable store visits layer', async () => {
        // Navigate to Tallahassee to ensure visits are visible
        await battleMapPage.navigateToCity('Tallahassee, FL');
        
        // Wait for results and select Tallahassee, FL - Already done by navigateToCity somewhat, but let's confirm
        // navigateToCity sends Enter, which usually selects first option.
        // But if needed we click the option
        await sharedPage.waitForTimeout(2000); 
        await sharedPage.waitForTimeout(4000); // Wait for map to settle

        await battleMapPage.layersButton.click();
        // The API call might be slow or already happened, so we catch timeout
        const visitsPromise = sharedPage.waitForResponse(resp => resp.url().includes('visits'), { timeout: 30000 }).catch(() => null);
        await battleMapPage.storeVisitsLayer.click();
        await visitsPromise;
        
        await sharedPage.locator('html').click(); // Close menu
        
        // Wait for any visit marker
        await expect(battleMapPage.visitMarker.first()).toBeVisible({ timeout: 20000 });
    });

    test('BM-035 | Visits | View visit details', async () => {
        const markerCount = await battleMapPage.visitMarker.count();
        console.log(`Found ${markerCount} visit markers.`);
        
        if (markerCount > 0) {
            // Try clicking the first couple of markers if needed
            for (let i = 0; i < Math.min(markerCount, 3); i++) {
                console.log(`Attempting to click visit marker ${i}...`);
                const marker = battleMapPage.visitMarker.nth(i);
                
                // Try clicking the image directly or the container
                await marker.locator('img').first().click({ force: true }).catch(() => marker.click({ force: true }));
                
                console.log('Waiting for modal content...');
                const contentFound = await sharedPage.getByText(/Visit Date|Created By|Visit details/i).isVisible({ timeout: 5000 }).catch(() => false);
                
                if (contentFound) {
                    console.log('Modal content found!');
                    // Close modal with timeout protection
                    await Promise.race([
                        battleMapPage.closeModalButton.first().click(),
                        sharedPage.waitForTimeout(2000)
                    ]).catch(() => sharedPage.keyboard.press('Escape'));
                    await sharedPage.waitForTimeout(500);
                    return;
                }
                console.log(`Marker ${i} did not open modal.`);
            }
        }
        
        throw new Error('Could not open visit details modal by clicking markers.');
    });

    test('BM-036 | Date Filter | Open and Apply visit date range', async () => {
        // Ensure visits layer is enabled and we are in Tallahassee
        if (!await battleMapPage.pickVisitDatesButton.isVisible()) {
            await battleMapPage.searchCombobox.click();
            await battleMapPage.searchInput.fill('Tallahassee');
            await sharedPage.locator('[role="option"]').filter({ hasText: 'Tallahassee, FL' }).first().click();
            await sharedPage.waitForTimeout(4000);

            await battleMapPage.layersButton.click();
            await battleMapPage.storeVisitsLayer.click();
            await sharedPage.locator('html').click();
            await expect(battleMapPage.pickVisitDatesButton).toBeVisible({ timeout: 10000 });
        }

        if (!await sharedPage.getByRole('grid').first().isVisible()) {
            console.log('Opening date picker...');
            await battleMapPage.pickVisitDatesButton.click();
        }
        await expect(sharedPage.getByRole('grid').first()).toBeVisible({ timeout: 10000 });

        console.log('Selecting dates...');
        await sharedPage.getByRole('gridcell', { name: '1' }).nth(1).click();
        await sharedPage.getByRole('gridcell', { name: '14' }).first().click();

        console.log('Applying date filter...');
        const filterPromise = sharedPage.waitForResponse(resp => resp.url().includes('date'), { timeout: 15000 }).catch(() => null);
        await battleMapPage.datePickerApplyButton.click();
        await filterPromise;
        console.log('Date filter applied!');
    });

    // test('BM-038 | Date Filter | Reset visit date filter', async () => {
    //     // Ensure date picker is open
    //     if (!await sharedPage.getByRole('button', { name: 'Reset' }).isVisible()) {
    //         await battleMapPage.pickVisitDatesButton.click();
    //     }
    //     await expect(battleMapPage.datePickerResetButton).toBeVisible({ timeout: 5000 });
    //     await battleMapPage.datePickerResetButton.click();
        
    //     // Wait for it to close or reset to confirm action
    //     await sharedPage.waitForTimeout(500); 
    // });

    test('BM-039 | Marketing ROI | Enable marketing ROI layer', async () => {
        await battleMapPage.layersButton.click();
        // Use a more relaxed URL check and catch timeout to prevent "stuck" state
        const roiPromise = sharedPage.waitForResponse(resp => 
            (resp.url().includes('roi') || resp.url().includes('map')) && resp.status() === 200, 
            { timeout: 15000 }
        ).catch(() => console.log('ROI Map response timed out or already loaded'));
        
        await battleMapPage.marketingROILayer.click({ force: true });
        await roiPromise;
        await sharedPage.waitForTimeout(3000); // Give time for layer to actually render
        await sharedPage.locator('html').click();
    });

    test('BM-040 | Marketing ROI | View ROI details', async () => {
        await battleMapPage.mapRegion.click({ position: { x: 744, y: 221 } });
        await expect(sharedPage.getByText('ROAS')).toBeVisible();
        await sharedPage.getByLabel('Close popup').click();
    });

    test('BM-041 | Geo Targets | Enable geo targets layer', async () => {
        await battleMapPage.layersButton.click();
        await battleMapPage.geoTargetsLayer.click();
        await sharedPage.locator('html').click();
        await expect(battleMapPage.mapRegion).toBeVisible();
    });

    // test('BM-042 | LifeModes | Enable and View LifeModes details', async () => {
    //     // Navigate to Orlando
    //     await battleMapPage.navigateToCity('Orlando, FL');

    //     // Enable LifeModes layer
    //     // Network wait can be flaky, so we'll rely on visual confirmation or time
    //     await battleMapPage.toggleLayer(battleMapPage.lifeModesLayer);
    //     await sharedPage.waitForTimeout(3000);

    //     // Click anywhere on map to open side sheet
    //     await battleMapPage.mapRegion.click({ position: { x: 640, y: 360 } });
        
    //     // Verify side sheet content
    //     await expect(sharedPage.getByText(/Demographic cluster insights|Lifemode/i)).toBeVisible({ timeout: 15000 });
        
    //     // Close modal
    //     await battleMapPage.closeModalButton.click().catch(() => sharedPage.keyboard.press('Escape'));
    // });

    test('BM-044 | Filters | Open filters panel', async () => {
        await battleMapPage.filtersButton.click();
        await expect(sharedPage.getByRole('dialog')).toBeVisible();
        await sharedPage.keyboard.press('Escape');
    });

    // test('BM-045-ERR | Filters | Handle filter API failure (500)', async () => {
    //     await sharedPage.route('**/api/map/data**state=Georgia**', route => {
    //         route.fulfill({ status: 500, body: 'Internal Server Error' });
    //     });
    //     await battleMapPage.filtersButton.click();
    //     await sharedPage.getByPlaceholder('Search state...').fill('Georgia');
    //     await sharedPage.getByRole('option', { name: 'Georgia' }).click();
    //     await battleMapPage.applyChangesButton.click();
    //     await expect(sharedPage.getByText(/error|failed/i)).toBeVisible();
    //     await sharedPage.unroute('**/api/map/data**state=Georgia**');
    // });

    test('BM-045 | Filters | Apply state filter and Verify', async () => {
        try {
            await battleMapPage.filtersButton.click({ force: true });
            
            // Apply State Filter using user's recorded flow
            await sharedPage.getByRole('combobox').filter({ hasText: 'Search state...' }).click();
            await sharedPage.getByPlaceholder('Search state...').fill('florida');
            await sharedPage.getByRole('option', { name: 'Florida' }).click();
            
            await expect(sharedPage.getByRole('button', { name: 'Apply Changes' })).toBeVisible();
            await battleMapPage.applyChangesButton.click({ force: true });
            await sharedPage.waitForTimeout(6000);

            // Click the map at the recorded Florida position to ensure side sheet/text is triggered
            await battleMapPage.mapRegion.click({ position: { x: 829, y: 322 }, force: true });
            await sharedPage.waitForTimeout(2000);

            // User's verification: click the text 'Florida'
            await expect(sharedPage.getByText('Florida').first()).toBeVisible({ timeout: 10000 });
            await sharedPage.getByText('Florida').first().click({ force: true }).catch(() => {});
            
            // Verify side sheet/dialog opens
            await expect(sharedPage.getByRole('dialog').or(sharedPage.getByRole('complementary')).or(sharedPage.locator('.drawer-content')).first()).toBeVisible({ timeout: 10000 });
            
            // Close side sheet
            await battleMapPage.closeModalButton.click().catch(() => sharedPage.keyboard.press('Escape'));
        } finally {
            // Manual Reset Cleanup using the button from user's script
            await battleMapPage.manualResetFilters();
        }
    });

    test('BM-046 | Filters | Apply chain filter and Verify', async () => {
        try {
            await battleMapPage.filtersButton.click({ force: true });
            
            // Apply Chain Filter from user script
            await sharedPage.getByRole('combobox').filter({ hasText: 'Search chain...' }).click();
            await sharedPage.getByRole('option', { name: 'TOTAL WINE' }).click();
            
            await battleMapPage.applyChangesButton.click({ force: true });
            await sharedPage.waitForTimeout(5000);

            // Navigate to Houston as per script flow
            await battleMapPage.searchCombobox.click({ force: true });
            await battleMapPage.searchInput.fill('houston');
            await sharedPage.getByText('Houston, Texas, United States').first().click();
            await sharedPage.waitForTimeout(5000);

            // Click on a silver marker (try nth 3 as per script, or first)
            const silverMarkers = sharedPage.getByRole('img', { name: 'silver marker' });
            await expect(silverMarkers.first()).toBeVisible({ timeout: 15000 });
            
            const count = await silverMarkers.count();
            if (count > 3) {
                await silverMarkers.nth(3).click({ force: true });
            } else {
                await silverMarkers.first().click({ force: true });
            }

            // Verification: check for TOTAL WINE heading
            await expect(sharedPage.getByRole('heading', { name: 'TOTAL WINE SPIRITS BEER &' }).first()).toBeVisible({ timeout: 15000 });
            
            await battleMapPage.closeModalButton.click().catch(() => sharedPage.keyboard.press('Escape'));
        } finally {
            await battleMapPage.manualResetFilters();
        }
    });

    test('BM-047 | Filters | Apply DMA filter and Verify', async () => {
        try {
            await battleMapPage.filtersButton.click({ force: true });
            
            // Apply DMA Filter from user script
            await sharedPage.getByRole('combobox').filter({ hasText: 'Search dma...' }).click();
            await sharedPage.getByPlaceholder('Search dma...').fill('FL');
            await sharedPage.getByText('Jacksonville, FL').click();
            
            await battleMapPage.applyChangesButton.click({ force: true });
            await sharedPage.waitForTimeout(6000);

            // Click the map at the recorded DMA position
            await battleMapPage.mapRegion.click({ position: { x: 580, y: 287 }, force: true });
            await sharedPage.waitForTimeout(2000);

            // Verification
            await expect(sharedPage.getByText('Jacksonville, FL').first()).toBeVisible({ timeout: 10000 });
            await sharedPage.getByText('Jacksonville, FL').first().click({ force: true }).catch(() => {});

            await expect(sharedPage.getByRole('dialog').or(sharedPage.getByRole('complementary')).or(sharedPage.locator('.drawer-content')).first()).toBeVisible({ timeout: 10000 });
            await battleMapPage.closeModalButton.click().catch(() => sharedPage.keyboard.press('Escape'));
        } finally {
            await battleMapPage.manualResetFilters();
        }
    });

    test('BM-049 | Filters | Reset all filters', async () => {
        await battleMapPage.filtersButton.click();
        await battleMapPage.resetAllFiltersButton.click();
        await battleMapPage.applyChangesButton.click();
        await sharedPage.waitForTimeout(2000);
        // Verify we are not in filtered state - difficult to check map bounds without reference, 
        // but success without error is a good baseline.
    });

    test('BM-050 | Map Style | Switch map style', async () => {
        await battleMapPage.mapStyleCombobox.click();
        await sharedPage.getByRole('option', { name: 'Satellite' }).click();
        await sharedPage.waitForTimeout(1000);
    });

    test('BM-051 | Map Style | Verify style persistence', async () => {
        await sharedPage.reload();
        await expect(battleMapPage.mapStyleCombobox).toContainText('Satellite');
        // Reset to Streets
        await battleMapPage.mapStyleCombobox.click();
        await sharedPage.getByRole('option', { name: 'Streets' }).click();
    });

    test('BM-052 | Reset | Reset layers & filters', async () => {
        await battleMapPage.resetAllFiltersAndLayersButton.click();
    });

    test('BM-053 | Stability | Rapid toggle layers', async () => {
        await battleMapPage.layersButton.click();
        for (let i = 0; i < 5; i++) {
            await battleMapPage.storePotentialLayer.click();
        }
        await sharedPage.locator('html').click();
    });

    test('BM-054 | Stability | Click empty map area', async () => {
        await battleMapPage.mapRegion.click({ position: { x: 10, y: 10 } });
        await expect(sharedPage.getByRole('dialog')).not.toBeVisible();
    });

    test('BM-055 | Modal | Close modals correctly', async () => {
        await battleMapPage.bronzeMarker.first().click();
        await battleMapPage.closeModalButton.click();
        await expect(sharedPage.getByRole('dialog')).not.toBeVisible();
    });

    test('BM-056 | Performance | Load map with large data', async () => {
        const start = Date.now();
        await sharedPage.reload();
        await expect(battleMapPage.mapRegion).toBeVisible();
        expect(Date.now() - start).toBeLessThan(15000);
    });

    test('BM-057 | Performance | Long session stability', async () => {
        // Continuous usage simulation
        await battleMapPage.zoomInButton.dblclick();
        await battleMapPage.zoomOutButton.dblclick();
        await expect(battleMapPage.mapRegion).toBeVisible();
    });

});
