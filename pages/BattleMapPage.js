
import { expect } from '@playwright/test';

export class BattleMapPage {
    constructor(page) {
        this.page = page;

        // Navigation & Sidebar
        this.mapLink = page.getByRole('link', { name: 'Battle Map' });
        this.mapButton = page.locator('button').filter({ hasText: 'Map' });

        // UI Elements
        this.mapRegion = page.locator('canvas.mapboxgl-canvas');
        this.zoomInButton = page.getByRole('button', { name: 'Zoom in' });
        this.zoomOutButton = page.getByRole('button', { name: 'Zoom out' });
        this.orlandoButton = page.getByRole('button', { name: 'Go to Orlando, FL' });

        // Search
        this.searchCombobox = page.getByRole('combobox').first();
        this.searchPlaceholder = 'Search locations or stores...';
        this.searchInput = page.getByPlaceholder('Search locations...');
        this.searchClearButton = page.getByRole('button').filter({ hasText: /^$/ }).nth(1);

        // Layers
        this.layersButton = page.getByRole('button', { name: /Map Layers/i });
        // Using the robust selector from locators.js logic or the descriptive one
        this.categoryDialogTrigger = this.layersButton;

        this.customersCategoryButton = page.getByText('Customers', { exact: true }).first();
        this.clustersCategoryButton = page.getByText('Customer Clusters', { exact: true }).first();
        this.analyticsCategoryButton = page.getByText('Advertisements & Analytics', { exact: true }).first();

        this.storePotentialLayer = page.getByRole('menuitemcheckbox', { name: 'Store Potential Ranking' });
        this.rfmLayer = page.getByRole('menuitemcheckbox', { name: 'Store Performance by RFM Score' });
        this.customerLayer = page.getByRole('menuitemcheckbox', { name: 'Customers', exact: true });
        this.announcementsLayer = page.getByRole('menuitemcheckbox', { name: 'Announcements/Shares' });
        this.influencersLayer = page.getByRole('menuitemcheckbox', { name: 'Influencers' });
        this.customClustersLayer = page.getByRole('menuitemcheckbox', { name: 'Custom Clusters' });
        this.customerClustersLayer = page.getByRole('menuitemcheckbox', { name: 'Customer Clusters', exact: true });
        this.storeVisitsLayer = page.getByRole('menuitemcheckbox', { name: 'Store Visits', exact: true });
        this.marketingROILayer = page.getByRole('menuitemcheckbox', { name: 'Marketing ROI' });
        this.geoTargetsLayer = page.getByRole('menuitemcheckbox', { name: 'Geo Targets' });
        this.lifeModesLayer = page.getByRole('menuitemcheckbox', { name: 'LifeModes Heatmap' });

        // Markers
        // Check locators.js: uses getByAltText for some, but I prefer the robust src filter.
        // I'll keep the src filter but add first() to be safe if multiple overlap.
        this.bronzeMarker = page.locator('.mapboxgl-marker').filter({ has: page.locator('img[src*="bronze"]') });
        this.silverMarker = page.locator('.mapboxgl-marker').filter({ has: page.locator('img[src*="silver"]') });
        this.goldMarker = page.locator('.mapboxgl-marker').filter({ has: page.locator('img[src*="gold"]') });
        this.announcementMarker = page.getByRole('img', { name: 'Announcement Marker' });
        this.visitMarker = page.locator('.mapboxgl-marker').filter({ has: page.locator('img[alt*="Visit" i], img[src*="visit" i]') });
        this.customerMarker = page.locator('.mapboxgl-marker').filter({ has: page.locator('img[alt*="Customer" i]') });

        // Store Details Modal
        // locators.js uses .nth(1) for heading, implying duplicates. I will apply .first() or .nth(1) if context allows.
        // It's safer to scope it to a dialog if possible.
        this.storeDetailsHeader = (name) => page.getByRole('heading', { name: name }).nth(1);

        this.editStoreRankingButton = page.getByRole('button', { name: 'Edit store ranking' });
        this.rankingCombobox = page.getByRole('combobox');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        // Close button: Scope to dialog to avoid clicking sidebar close buttons
        this.closeModalButton = page.getByRole('dialog').getByRole('button', { name: 'Close' });

        // Tabs in Details
        this.overviewTab = page.getByRole('tab', { name: 'Show overview' });
        this.visitsTab = page.getByRole('tab', { name: 'Show visits' });
        this.notesTab = page.getByRole('tab', { name: 'Show notes' });
        this.commentsTab = page.getByRole('tab', { name: 'Show comments' });

        // Custom Clusters / Drawing
        this.toggleDrawControls = page.getByRole('button', { name: 'Toggle Draw Controls' });
        this.drawNewClusterButton = page.getByRole('button', { name: 'Draw New Cluster' });
        this.finishDrawingButton = page.getByRole('button', { name: 'Finish Drawing' });
        this.clusterTitleInput = page.getByRole('textbox', { name: 'Title' });
        this.clusterDescriptionInput = page.getByRole('textbox', { name: 'Description' });
        this.saveClusterDetailsButton = page.getByRole('button', { name: 'Save Details' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });

        // Date Filter
        this.pickVisitDatesButton = page.getByRole('button', { name: 'Pick visit dates' });
        this.datePickerApplyButton = page.getByRole('button', { name: 'Apply' });
        this.datePickerResetButton = page.getByRole('button', { name: 'Reset', exact: true });

        // Filters Panel
        this.filtersButton = page.getByRole('button', { name: 'Filters', exact: true });
        this.applyChangesButton = page.getByRole('button', { name: 'Apply Changes' });
        this.resetAllFiltersButton = page.getByRole('button', { name: 'Reset All' });
        this.resetAllFiltersAndLayersButton = page.getByRole('button', { name: 'Reset All Filters & Layers' });

        // Map Style
        this.mapStyleCombobox = page.getByRole('combobox').filter({ hasText: /Streets|Outdoors|Satellite|Light|Dark/ });

        // Filter triggers inside the panel
        this.stateFilterTrigger = page.getByRole('combobox').filter({ hasText: 'Search state...' }).or(page.getByPlaceholder('Search state...'));
        this.chainFilterTrigger = page.getByRole('combobox').filter({ hasText: 'Search chain...' }).or(page.getByPlaceholder('Search chain...'));
        this.dmaFilterTrigger = page.getByRole('combobox').filter({ hasText: 'Search dma...' }).or(page.getByPlaceholder('Search dma...'));
        this.customClusterFilterTrigger = page.getByRole('combobox').filter({ hasText: 'Search custom cluster...' }).or(page.getByPlaceholder('Search custom cluster...'));
    }

    async goto() {
        // Since we mostly start from Dashboard or a direct link
        await this.page.goto('https://app.omnigrowthos.io/map');
    }

    async searchStore(name) {
        await this.searchCombobox.click();
        await this.searchInput.fill(name);
        await this.page.getByText(name).first().click();
    }

    async toggleLayer(layerLocator) {
        await this.ensureLayersMenuOpen();
        await layerLocator.scrollIntoViewIfNeeded();
        await layerLocator.click({ force: true });
        // Click outside to close menu
        await this.page.locator('html').click();
    }

    async ensureLayersMenuOpen() {
        const menu = this.page.getByRole('menu');
        if (!await menu.isVisible()) {
            // Force click the layers button as Mapbox canvas might intercept
            await this.layersButton.click({ force: true });
            try {
                await expect(menu).toBeVisible({ timeout: 5000 });
            } catch (e) {
                // Retry if needed
                await this.layersButton.click({ force: true });
                await expect(menu).toBeVisible({ timeout: 10000 });
            }
        }
    }

    async navigateToCity(cityName) {
        await this.page.keyboard.press('Escape');
        
        // Clear existing selection if any
        await this.clearSearch();

        await this.searchCombobox.click({ force: true }).catch(() => {});
        // Fill and wait for options
        await this.searchInput.fill(cityName);
        await this.page.waitForTimeout(1000);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(4000); // Wait for map transition
    }

    async updateStoreRating(newRating) {
        await this.editStoreRankingButton.click();
        await this.rankingCombobox.click();
        await this.page.getByText(newRating).click();
        await this.saveButton.click();
    }

    async drawCluster(points) {
        await this.toggleDrawControls.click();
        await this.drawNewClusterButton.click();
        for (const point of points) {
            await this.mapRegion.click({ position: point });
        }
        await this.finishDrawingButton.click();
    }
    
    async clearSearch() {
        if (await this.searchClearButton.isVisible()) {
            await this.searchClearButton.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(500);
        }
    }

    async manualResetFilters() {
        // Ensure side sheet is closed first
        if (await this.closeModalButton.isVisible()) {
             await this.closeModalButton.click({ force: true }).catch(() => {});
        }
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.page.waitForTimeout(500);

        // User's script uses "Reset All Filters & Layers" button directly
        if (await this.resetAllFiltersAndLayersButton.isVisible()) {
            await this.resetAllFiltersAndLayersButton.click({ force: true });
            await this.page.waitForTimeout(2000);
        } else {
            // Fallback to internal reset inside panel if that's where we are
            await this.filtersButton.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(1000);
            if (await this.resetAllFiltersButton.isVisible()) {
                await this.resetAllFiltersButton.click({ force: true });
                await this.applyChangesButton.click({ force: true });
                await this.page.waitForTimeout(2000);
            }
            await this.page.keyboard.press('Escape').catch(() => {});
        }
    }
}
