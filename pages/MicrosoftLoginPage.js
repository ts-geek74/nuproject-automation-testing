class MicrosoftLoginPage {
    constructor(page) {
        this.page = page;
        // Microsoft login page selectors (these are standard Microsoft login elements)
        this.emailInput = page.locator('input[type="email"], input[name="loginfmt"]');
        this.passwordInput = page.locator('input[type="password"], input[name="passwd"]');

        // Robust locators for buttons - Avoid generic #idSIButton9 unless scoped by specific value/text
        this.nextButton = page.getByRole('button', { name: 'Next' }).or(page.locator('input[type="submit"][value="Next"]'));
        this.signInButton = page.getByRole('button', { name: 'Sign in' }).or(page.locator('input[type="submit"][value="Sign in"]'));
        this.staySignedInYesButton = page.getByRole('button', { name: 'Yes' }).or(page.locator('input[type="submit"][value="Yes"]'));
        this.staySignedInNoButton = page.getByRole('button', { name: 'No' }).or(page.locator('input[type="submit"][value="No"]')).or(page.locator('#idBtn_Back'));

        this.errorMessage = page.locator('#passwordError, .error-message, .alert-error, #usernameError, #error');
        this.cancelButton = page.locator('a:has-text("Cancel"), #idBtn_Back');
    }

    async fillEmail(email) {
        await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.emailInput.fill(email);
        await this.nextButton.click();
    }

    async fillPassword(password) {
        await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.passwordInput.fill(password);
        await this.signInButton.click();
    }

    async handleStaySignedIn(staySignedIn = false) {
        try {
            // Wait for the "Stay signed in?" prompt
            // Increased timeout to 60s to allow for manual 2FA entry by user
            console.log('Waiting for "Stay signed in" prompt (enter 2FA manually if required)...');
            await this.staySignedInYesButton.waitFor({ state: 'visible', timeout: 60000 });

            if (staySignedIn) {
                await this.staySignedInYesButton.click();
            } else {
                await this.staySignedInNoButton.click();
            }
        } catch (error) {
            // Prompt may not appear (e.g. if user is already signed in or 2FA skipped), continue
            console.log('Stay signed in prompt did not appear - continuing');
        }
    }

    async login(email, password, staySignedIn = false) {
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.handleStaySignedIn(staySignedIn);
    }

    async cancelLogin() {
        await this.cancelButton.click();
    }

    async getErrorMessage() {
        try {
            await this.errorMessage.waitFor({ state: 'visible', timeout: 3000 });
            return await this.errorMessage.textContent();
        } catch (error) {
            return null;
        }
    }

    async isOnMicrosoftLoginPage() {
        return await this.emailInput.isVisible() || await this.passwordInput.isVisible();
    }
}

module.exports = { MicrosoftLoginPage };
