class LoginPage {
    constructor(page) {
        this.page = page;

        // Microsoft Login Button - Multiple locator strategies for reliability
        // Strategy 1: Text-based (most reliable)
        this.microsoftLoginButton = page.getByRole('button', { name: 'Login with Microsoft' });

        // Alternative locators (use if primary fails):
        // Strategy 2: SVG + Text combination (very specific)
        this.microsoftLoginButtonAlt1 = page.locator('button:has(svg[viewBox="0 0 23 23"]):has-text("Login with Microsoft")');

        // Strategy 3: Button with Microsoft SVG logo
        this.microsoftLoginButtonAlt2 = page.locator('button >> svg[viewBox="0 0 23 23"]').locator('..');

        // Strategy 4: Class-based with text (less reliable due to Tailwind classes)
        this.microsoftLoginButtonAlt3 = page.locator('button.w-full:has-text("Microsoft")');

        // Other page elements
        this.errorMessage = page.locator('.error-message, .alert-danger, .text-red-500');
        this.loginContainer = page.locator('h1:has-text("Login")');
        this.loginForm = page.locator('form');
        this.emailInput = page.locator('input[type="email"], label:has-text("Email") + input');
        this.passwordInput = page.locator('input[type="password"], label:has-text("Password") + input');
        this.loginButton = page.locator('button:has-text("Login"):not(:has-text("Microsoft"))');
    }

    async goto() {
        await this.page.goto('https://app.omnigrowthos.io/auth/login?redirect=%2Fmap');
        // Wait for login page to load - use h1 instead of .login-container
        await this.loginContainer.waitFor({ state: 'visible', timeout: 10000 });
    }

    async clickMicrosoftLogin() {
        // Try primary locator first
        try {
            await this.microsoftLoginButton.click({ timeout: 5000 });
            console.log('✓ Clicked Microsoft login button (primary locator)');
            return;
        } catch (error) {
            console.log('  Primary locator failed, trying alternatives...');
        }

        // Try alternative locators
        const alternatives = [
            { locator: this.microsoftLoginButtonAlt1, name: 'SVG + Text combination' },
            { locator: this.microsoftLoginButtonAlt2, name: 'SVG logo' },
            { locator: this.microsoftLoginButtonAlt3, name: 'Class-based' }
        ];

        for (const alt of alternatives) {
            try {
                await alt.locator.click({ timeout: 3000 });
                console.log(`✓ Clicked Microsoft login button (${alt.name} locator)`);
                return;
            } catch (error) {
                console.log(`  ${alt.name} locator failed`);
            }
        }

        // If all fail, throw error
        throw new Error('Could not find Microsoft login button with any locator strategy');
    }

    async getErrorMessage() {
        if (await this.errorMessage.isVisible()) {
            return await this.errorMessage.textContent();
        }
        return null;
    }

    async isOnLoginPage() {
        return await this.loginContainer.isVisible();
    }

    async loginWithCredentials(email, password) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}

module.exports = { LoginPage };
