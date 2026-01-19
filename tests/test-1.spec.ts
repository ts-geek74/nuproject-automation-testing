import { test, expect } from '@playwright/test';


test('test', async ({ page }) => {
  await page.goto('https://app.omnigrowthos.io/auth/login');
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Login with Microsoft' }).click();
  const page1 = await page1Promise;
  await page1.goto('https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=code&client_id=a43e08e8-8d83-4fce-9046-7eb63994304c&redirect_uri=https%3A%2F%2Fapp.omnigrowthos.io%2F__%2Fauth%2Fhandler&state=AMbdmDnuwz9lIFge2ud1TQBlwdO-wGLMueP05py3NhSzZNKR1lnW6wSoIwwDnC3qQsb7QJ_ziKwyqDmQEkmNDNp1ETMx9xCcSVVZSyinZUD-Sfddn_rGMVJ06SRJKXVBw9ljZWFoSEKZcOupmtHy-4Y2_Mw_nF2vWvRH4yARq15VMHsg7r65jX8kbWdoVV_wLedXAPpg6W9RaaAAO6WihRgUYjU0qhnA17G6Bpbf4OgPWzQRAAiKMeMq7Neumy1nC9WURkkMeFg2LV0vaYNKhYgsCqz-o-FwgiJwdknfCMYyti_vNKOVampkQyNtwgRM3Gi_YqJTM-7I2DaMDMnr&scope=profile%20email%20openid%20User.Read&context_uri=https%3A%2F%2Fapp.omnigrowthos.io');
  await page1.getByRole('textbox', { name: 'Enter your email or phone' }).click();
  await page1.getByRole('textbox', { name: 'Enter your email or phone' }).fill('test@yopmail.com');
  await page1.getByRole('textbox', { name: 'Enter your email or phone' }).press('Enter');
  await page1.getByRole('button', { name: 'Next' }).click();
  await page1.getByRole('textbox', { name: 'Enter your email or phone' }).click();
  await page1.getByRole('textbox', { name: 'Enter your email or phone' }).fill('test@nuorioncapital.com');
  await page1.getByRole('textbox', { name: 'Enter your email or phone' }).press('Enter');
  await page1.getByRole('button', { name: 'Next' }).click();
  await page.locator('div').first().click();
  await page1.getByRole('textbox', { name: 'Enter the password for test@' }).click();
  await page1.getByRole('textbox', { name: 'Enter the password for test@' }).fill('X.911256967547am');
  await page1.getByRole('button', { name: 'Sign in' }).click();
  await page1.getByRole('textbox', { name: 'Enter code' }).fill('078642');
  await page1.getByRole('textbox', { name: 'Enter code' }).press('Enter');
  await page1.locator('.position-buttons').click();
  await page1.getByRole('button', { name: 'Verify' }).click();
  await page1.getByRole('checkbox', { name: 'Don\'t show this again' }).check();
  await page1.getByRole('button', { name: 'Yes' }).click();
  await page.goto('https://app.omnigrowthos.io/map');
  await page.getByRole('combobox').filter({ hasText: 'Search locations or store s...' }).click();
  await page.getByPlaceholder('Search locations...').fill('total wine');
  await page.getByPlaceholder('Search locations...').press('Enter');
  await page.getByText('TOTAL WINE & MORE', { exact: true }).click();
  await page.getByRole('button', { name: 'Map Layers' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Store Performance by RFM Score' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Store Potential Ranking' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'LifeModes Heatmap' }).click();
  await page.locator('html').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();
  await page.getByRole('button', { name: 'Map Layers' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'LifeModes Heatmap' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).first().click();
  await page.locator('html').click();
  await page.getByRole('button', { name: 'Map Layers' }).click();
  await page.locator('html').click();
  await page.getByRole('img', { name: 'bronze marker' }).nth(5).click();
  await page.locator('.fixed.inset-0').click();
  await page.locator('div:nth-child(95) > .relative > img').click();
  await page.getByRole('button', { name: 'Order #6154103030003 Nov 28,' }).click();
  await page.getByRole('button', { name: 'Order #6154103030003 Nov 28,' }).click();
  await page.getByRole('button', { name: 'Order #5463416275187 Mar 19,' }).click();
  await page.getByRole('button', { name: 'Order #5463416275187 Mar 19,' }).click();
  await page.locator('.fixed.inset-0').click();
  await page.getByRole('button', { name: 'Map Layers' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).first().click();
  await page.locator('html').click();
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('combobox').filter({ hasText: 'Search state...' }).click();
  await page.getByText('Massachusetts').click();
  await page.getByRole('button', { name: 'Apply Changes' }).click();
  await page.getByRole('region', { name: 'Map' }).click({
    position: {
      x: 637,
      y: 232
    }
  });
  await page.locator('.fixed.inset-0').click();
  await page.getByRole('button', { name: 'Filters 1' }).click();
  await page.getByRole('combobox').filter({ hasText: 'Massachusetts×' }).click();
  await page.getByPlaceholder('Search state...').fill('te');
  await page.getByRole('option', { name: 'Texas' }).click();
  await page.getByRole('button', { name: 'Apply Changes' }).click();
  await page.getByRole('region', { name: 'Map' }).click({
    position: {
      x: 620,
      y: 285
    }
  });
  await page.locator('.fixed.inset-0').click();
  await page.getByRole('button', { name: 'Filters 1' }).click();
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await page.getByRole('combobox').filter({ hasText: 'Search dma...' }).click();
  await page.getByRole('option', { name: 'Eureka, CA' }).click();
  await page.getByRole('button', { name: 'Apply Changes' }).click();
  await page.getByRole('region', { name: 'Map' }).click({
    position: {
      x: 634,
      y: 286
    }
  });
  await page.locator('.fixed.inset-0').click();
  await page.getByRole('button', { name: 'Filters 1' }).click();
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await page.getByRole('combobox').filter({ hasText: 'Search dma...' }).click();
  await page.getByText('Kansas City, MO').click();
  await page.getByRole('button', { name: 'Apply Changes' }).click();
  await page.getByRole('region', { name: 'Map' }).click({
    position: {
      x: 616,
      y: 338
    }
  });
  await page.locator('.fixed.inset-0').click();
  await page.getByRole('button', { name: 'Filters 1' }).click();
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await page.getByRole('combobox', { name: 'Multi-select: 0 of 10 options' }).click();
  await page.getByText('Restaurant').click();
  await page.getByRole('option', { name: 'Bar, not selected' }).click();
  await page.getByRole('button', { name: 'Apply Changes' }).click();
  await page.getByRole('button', { name: 'Map Layers' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Store Performance by RFM Score' }).click();
  await page.locator('html').click();
  await page.getByRole('img', { name: 'bronze marker' }).click();
  await page.getByRole('button', { name: 'Edit store ranking' }).click();
  await page.getByRole('combobox').click();
  await page.getByText('SILVER').click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Filters 1' }).click();
  await page.getByRole('button', { name: 'Clear all 2 selected options' }).click();
  await page.getByRole('combobox').filter({ hasText: 'Search chain...' }).click();
  await page.getByRole('option', { name: 'TIME LIQUOR' }).click();
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await page.getByRole('button', { name: 'Reset All' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Reset All Filters & Layers' }).click();
});
