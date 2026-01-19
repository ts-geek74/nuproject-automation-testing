class DashboardPage {
    constructor(page) {
        this.page = page;
        // Adjust selectors based on your actual CRM dashboard
        this.userProfile = page.locator('.user-profile, .user-info, [data-testid="user-profile"]');
        this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")');
        this.dashboardHeader = page.locator('h1:has-text("Dashboard"), .dashboard-title');
        this.welcomeMessage = page.locator('.welcome-message, .user-greeting');
    }

    async isLoggedIn() {
        try {
            // Check if dashboard elements are visible
            // Updated to include 'map' as the application redirects there
            await this.page.waitForURL(/.*dashboard|.*home|.*app|.*map/, { timeout: 15000 });
            // If we are on the map/dashboard, return true even if specific header isn't found immediately
            return true;
        } catch (error) {
            return false;
        }
    }

    async getUserEmail() {
        try {
            const userText = await this.userProfile.textContent();
            return userText.trim();
        } catch (error) {
            return null;
        }
    }

    async logout() {
        await this.logoutButton.click();
        // Wait for logout to complete
        await this.page.waitForURL(/.*login|.*signin/, { timeout: 10000 });
    }

    async waitForDashboardLoad() {
        await this.dashboardHeader.waitFor({ state: 'visible', timeout: 15000 });
    }
}

module.exports = { DashboardPage };
