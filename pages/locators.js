test('test', async ({ page }) => {
    await page.goto('https://app.omnigrowthos.io/auth/login'); await page.getByRole('textbox', { name: 'Email' }).click(); await page.getByRole('textbox', { name: 'Email' }).fill('Shopify@omnigrowthos.com'); await page.getByRole('textbox', { name: 'Email' }).press('Tab'); await page.getByRole('textbox', { name: 'Password' }).fill('Shopify@1234'); await page.getByRole('button', { name: 'Login', exact: true }).click(); await page.locator('.inline-flex.items-center.justify-center.gap-2.whitespace-nowrap.text-sm.font-medium.focus-visible\\:outline-none.focus-visible\\:ring-1.focus-visible\\:ring-ring.disabled\\:pointer-events-none.disabled\\:opacity-50.\\[\\&_svg\\]\\:pointer-events-none.\\[\\&_svg\\]\\:size-4.\\[\\&_svg\\]\\:shrink-0.border.hover\\:text-accent-foreground.h-10').first().click(); await page.getByRole('dialog').getByRole('button', { name: 'Customers' }).click(); await page.getByRole('button', { name: 'Customer Clusters' }).click(); await page.getByRole('button', { name: 'Advertisements & Analytics' }).click(); await page.locator('.inline-flex.items-center.justify-center.gap-2.whitespace-nowrap.text-sm.font-medium medium.focus - visible\\: outline - none.focus - visible\\: ring - 1.focus - visible\\: ring - ring.disabled\\: pointer - events - none.disabled\\: opacity - 50.\\[\\& _svg\\]\\: pointer - events - none.\\[\\& _svg\\]\\: size - 4.\\[\\& _svg\\]\\: shrink - 0.border.hover\\: text - accent - foreground.h - 10').first().click();
    await page.getByRole('button', { name: 'Go to Orlando, FL' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Potential Ranking' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Performance by RFM Score' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.locator('header').click();
    await page.locator('div:nth-child(53) > .relative.flex > .w-12').click();
    await page.getByRole('heading', { name: 'Southern Nights Orlando' }).nth(1).click();
    await page.getByText('BRONZE').click();
    await page.getByRole('tab', { name: 'Show visits' }).click();
    await page.getByRole('tab', { name: 'Show notes' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.locator('div:nth-child(87) > .relative.flex > .absolute.-top-1 > .relative > .absolute.inset-0.bg-blue-500\\/20').click();
    await page.getByText('1042 N Mills Ave', { exact: true }).click();
    await page.getByRole('heading', { name: 'Will\'s Pub' }).nth(1).click();
    await page.getByText('N Mills Ave, Orlando, FL 32803, USA').click();
    await page.getByRole('tab', { name: 'Show visits' }).click();
    await page.getByRole('tab', { name: 'Show notes' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Potential Ranking' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Performance by RFM Score' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Potential Ranking' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).first().click();
    await page.getByAltText('bronze  marker').first().click();
    await page.getByRole('heading', { name: 'Liquor Master' }).nth(1).click();
    await page.getByText('LIQUOR MASTERS').click();
    await page.getByRole('tab', { name: 'Show overview' }).click();
    await page.getByText('BRONZE').click();
    await page.getByText('3936 L B McLeod Rd', { exact: true }).click();
    await page.getByText('3936 L B McLeod Rd, Orlando,').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).first().click();
    await page.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).first().click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Loyal (Green)' }).first().click();
    await page.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).first().click();
    await page.locator('html').click();
    await page.getByRole('img', { name: 'bronze marker' }).nth(2).click();
    await page.getByText('BRONZE').click();
    await page.getByRole('heading', { name: 'The Liquor Library and Wine' }).nth(1).click();
    await page.getByText('131 N Orange Ave Ste 102,').click();
    await page.getByText('Location', { exact: true }).click();
    await page.getByText('131 N Orange Ave Ste 102', { exact: true }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Loyal (Green)' }).first().click();
    await page.getByRole('menuitemcheckbox', { name: 'Potential Loyal (Yellow)' }).first().click();
    await page.locator('html').click();
    await page.getByRole('img', { name: 'bronze marker' }).nth(2).click();
    await page.getByRole('heading', { name: 'ALS LIQUOR STORE' }).nth(1).click();
    await page.getByText('700 W Gore St, Orlando, FL').click();
    await page.locator('div').filter({ hasText: /^BRONZE$/ }).click();
    await page.getByText('700 W Gore St', { exact: true }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Potential Loyal (Yellow)' }).first().click();
    await page.getByRole('menuitemcheckbox', { name: 'At Risk (Red)' }).first().click();
    await page.locator('html').click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 837,
            y: 227
        }
    });
    await page.getByRole('img', { name: 'bronze marker' }).nth(3).click();
    await page.getByRole('heading', { name: 'HIAWASSEE WINE & LIQUORS' }).nth(1).click();
    await page.getByText('2425 S Hiawassee Rd, Orlando').click();
    await page.getByText('BRONZE').click();
    await page.getByText('5At Risk').click();
    await page.getByText('Location', { exact: true }).click();
    await page.getByText('2425 S Hiawassee Rd', { exact: true }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'At Risk (Red)' }).first().click();
    await page.getByRole('menuitemcheckbox', { name: 'Gray Stores (No Sales Data)' }).click();
    await page.locator('html').click();
    await page.locator('div:nth-child(153) > .relative.flex > .w-12').click();
    await page.getByRole('heading', { name: 'Walmart Wine and Liquor' }).nth(1).click();
    await page.getByText('S Kirkman Rd, Orlando, FL 32811, USA').click();
    await page.getByText('BRONZE').click();
    await page.getByText('Location', { exact: true }).click();
    await page.getByText('2500 S Kirkman Rd', { exact: true }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Gray Stores (No Sales Data)' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Potential Ranking' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).nth(1).click();
    await page.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).nth(1).click();
    await page.locator('div:nth-child(22) > .relative > img').click();
    await page.getByRole('heading', { name: 'Derek Kegler' }).click();
    await page.getByText('1722 Gammon Lane, Orlando,').click();
    await page.getByText('-81.4300').click();
    await page.getByRole('dialog', { name: 'Derek Kegler' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Champions (Blue)' }).nth(1).click();
    await page.getByRole('menuitemcheckbox', { name: 'Loyal (Green)' }).nth(1).click();
    await page.locator('div:nth-child(35) > .relative > img').click();
    await page.getByRole('heading', { name: 'Natalie Mclarty' }).click();
    await page.getByText('3349 South Kirkman Road, 1536').click();
    await page.getByText('-81.4576').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Loyal (Green)' }).nth(1).click();
    await page.getByRole('menuitemcheckbox', { name: 'Potential Loyal (Yellow)' }).nth(1).click();
    await page.locator('div:nth-child(24) > .relative > img').click();
    await page.getByRole('heading', { name: 'colleen Conway' }).click();
    await page.getByText('-81.4735').click();
    await page.getByText('6803 Alta Westgate Drive,').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'At Risk (Red)' }).nth(1).click();
    await page.getByRole('menuitemcheckbox', { name: 'At Risk (Red)' }).nth(1).click();
    await page.getByRole('menuitemcheckbox', { name: 'Potential Loyal (Yellow)' }).nth(1).click();
    await page.getByRole('menuitemcheckbox', { name: 'At Risk (Red)' }).nth(1).click();
    await page.locator('html').click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 727,
            y: 355
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 705,
            y: 347
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 667,
            y: 432
        }
    });
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Gray Customers (No Sales Data)' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'At Risk (Red)' }).nth(1).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Go to Orlando, FL' }).click();
    await page.locator('div:nth-child(41) > .relative > img').click();
    await page.getByRole('heading', { name: 'Katina Pittman' }).click();
    await page.getByText('1569 Hialeah St, Orlando,').click();
    await page.getByText('-81.4616').click();
    await page.getByRole('heading', { name: 'Location' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Gray Customers (No Sales Data)' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Announcements/Shares' }).click();
    await page.locator('html').click();
    await page.getByRole('combobox').filter({ hasText: 'Search locations or stores...' }).click();
    await page.getByPlaceholder('Search locations...').fill('swansea');
    await page.getByText('Noah\'s Yard').click();
    await page.getByRole('img', { name: 'Announcement Marker' }).nth(2).click();
    await page.getByText('Cole Hewitt').click();
    await page.locator('div').filter({ hasText: 'Announcement DateNov 15, 2025' }).nth(3).click();
    await page.getByRole('paragraph').filter({ hasText: 'great branding and exposure' }).click();
    await page.getByRole('button', { name: 'Close' }).nth(1).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Potential Ranking' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Announcements/Shares' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Influencers' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Go to Orlando, FL' }).click();
    await page.locator('div:nth-child(4) > div > .lucide > circle:nth-child(2)').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Influencers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Influencers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Influencers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Custom Clusters' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Toggle Draw Controls' }).click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 684,
            y: 183
        }
    });
    await page.locator('.flex.flex-col.gap-3.transition-all > div:nth-child(2)').click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 663,
            y: 185
        }
    });
    await page.locator('.flex.flex-col.gap-3.transition-all > div:nth-child(2)').click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 651,
            y: 189
        }
    });
    await page.getByRole('button', { name: 'Draw New Cluster' }).click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 509,
            y: 147
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 993,
            y: 216
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 936,
            y: 499
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 461,
            y: 433
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 475,
            y: 265
        }
    });
    await page.getByRole('button', { name: 'Finish Drawing' }).click();
    await page.getByRole('textbox', { name: 'Title' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('test cluster');
    await page.getByRole('textbox', { name: 'Description' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('testing custom cluster');
    await page.getByRole('button', { name: 'Save Details' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).click({
        position: {
            x: 707,
            y: 448
        }
    });
    await page.getByRole('button', { name: 'Map Layers' }).dblclick();
    await page.getByText('testing custom cluster').click();
    await page.getByText('Descriptiontesting custom').click();
    await page.getByRole('heading', { name: 'test cluster' }).nth(1).click();
    await page.getByRole('button', { name: 'Edit Details' }).click();
    await page.getByRole('textbox', { name: 'Title' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('test cluster 1');
    await page.getByRole('textbox', { name: 'Description' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('testing custom cluster 1');
    await page.getByRole('button', { name: 'Save Details' }).click();
    await page.getByText('Cluster Updated', { exact: true }).click();
    await page.getByRole('button', { name: 'Close' }).nth(1).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Custom Clusters' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Customer Clusters' }).click();
    await page.locator('html').click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 724,
            y: 272
        }
    });
    await page.getByText('Jacksonville, FL').click();
    await page.getByText('Created Jul 24,').click();
    await page.getByText('customers in this cluster').click();
    await page.getByText('DMA Code:').click();
    await page.getByText('Florida').click();
    await page.getByText('-81.985554').click();
    await page.getByText('-81.985554').click();
    await page.getByText('-81.985554').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Customer Clusters' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Sample Store Visits' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Sample Store Visits' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Visits', exact: true }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Go to Orlando, FL' }).click();
    await page.locator('div:nth-child(4553) > .relative > img').click();
    await page.getByRole('heading', { name: 'Drunken Monkey Coffee Bar' }).nth(1).click();
    await page.locator('div').filter({ hasText: 'Created ByMichael McGlothlin' }).nth(3).click();
    await page.getByText('N Bumby Ave, Orlando, FL 32803, USA').click();
    await page.getByText('Visit Date', { exact: true }).click();
    await page.getByText('Jul 16, 2025, 10:34 PM').click();
    await page.getByText('Using this location since the').click();
    await page.getByRole('img', { name: 'Visit photo' }).click();
    await page.getByRole('tab', { name: 'Show comments' }).click();
    await page.getByRole('heading', { name: 'No Comments Found' }).click();
    await page.getByText('There are no comments').click();
    await page.getByRole('button', { name: 'Store Details' }).click();
    await page.getByRole('heading', { name: 'Drunken Monkey Coffee Bar' }).nth(1).click();
    await page.getByRole('dialog').getByText('N Bumby Ave, Orlando, FL 32803, USA').click();
    await page.getByText('reviews').click();
    await page.getByText('Store Rating').click();
    await page.getByText('BRONZE').click();
    await page.getByRole('button', { name: 'Edit store ranking' }).click();
    await page.getByRole('combobox').click();
    await page.getByText('SILVER').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByText('SILVER', { exact: true }).click();
    await page.getByRole('button', { name: 'Edit store ranking' }).click();
    await page.getByText('SILVERLocation444 N Bumby').click();
    await page.getByRole('combobox').click();
    await page.getByText('BRONZE').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Close' }).nth(1).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Visits', exact: true }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Marketing ROI' }).click();
    await page.locator('html').click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 744,
            y: 221
        }
    });
    await page.getByRole('heading', { name: 'Florida' }).click();
    await page.getByText('ROAS').click();
    await page.getByText('0.70').click();
    await page.getByText('Revenue:').click();
    await page.getByText('$237,406.9').click();
    await page.getByText('$237,406.9').click();
    await page.getByText('Revenue: $237,406.9 Total').click();
    await page.getByText('$166,020.2').click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 733,
            y: 99
        }
    });
    await page.getByRole('heading', { name: 'South Carolina' }).click();
    await page.getByText('ROAS').click();
    await page.getByText('0.89').click();
    await page.getByText('Revenue:').click();
    await page.getByText('$68,737.1').click();
    await page.getByText('Total Spend:').click();
    await page.getByText('$60,848.0').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByLabel('Close popup').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Marketing ROI' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Geo Targets' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.locator('html').click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 727,
            y: 409
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 760,
            y: 201
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 719,
            y: 183
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 625,
            y: 185
        }
    });
    await page.getByRole('img', { name: 'bronze marker' }).nth(1).click();
    await page.getByText('7', { exact: true }).click();
    await page.getByText('Potential').click();
    await page.getByRole('button', { name: 'Store rating info' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Geo Targets' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await page.getByRole('combobox', { name: 'Multi-select: 0 of 23 options' }).click();
    await page.locator('.mr-2.flex').first().click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'LifeModes Heatmap' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Go to Orlando, FL' }).click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 673,
            y: 421
        }
    });
    await page.getByText('Wealthy Enclaves', { exact: true }).click();
    await page.getByText('Demographic cluster insights').click();
    await page.getByText('Lifemode Overview').click();
    await page.getByText('Census Nodes').click();
    await page.getByText('10251').click();
    await page.getByText('10251').click();
    await page.getByText('Online Customers').click();
    await page.getByText('4459').click();
    await page.getByText('Retail Stores', { exact: true }).click();
    await page.getByText('294').first().click();
    await page.getByText('Census Node Distribution').click();
    await page.getByText('Wealthy Enclaves Cluster\'s Share12.01%Wealthy Enclaves Cluster12.01%Other').click();
    await page.getByText('Total Stores').click();
    await page.getByText('294').nth(1).click();
    await page.getByText('Store to Census Ratio0.7324').click();
    await page.getByText('0.7324').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Filters 1' }).click();
    await page.getByRole('button', { name: 'Reset All' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByText('Analytics').click();
    await page.locator('html').click();
    await page.getByRole('combobox').filter({ hasText: 'Streets' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'LifeModes Heatmap' }).click();
    await page.locator('html').click();
    await page.getByRole('combobox').filter({ hasText: 'Streets' }).click();
    await page.getByRole('option', { name: 'Outdoors' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Outdoors' }).click();
    await page.getByRole('option', { name: 'Satellite' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Satellite' }).click();
    await page.getByRole('option', { name: 'Light' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Light' }).click();
    await page.getByRole('option', { name: 'Dark' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Dark' }).click();
    await page.getByText('Streets').click();
    await page.locator('header').click();
    await page.getByPlaceholder('Search state...').fill('florida');
    await page.getByRole('option', { name: 'Florida' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 748,
            y: 190
        }
    });
    await page.getByText('Florida').click();
    await page.getByRole('dialog', { name: 'Florida' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Filters 1' }).click();
    await page.locator('div').filter({ hasText: 'Reset AllCancelApply Changes' }).nth(2).click();
    await page.getByRole('button', { name: 'Filters 1' }).click();
    await page.getByRole('button', { name: 'Reset All' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Search chain...' }).click();
    await page.getByRole('option', { name: 'TOTAL WINE' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('button', { name: 'Filters 1' }).click();
    await page.getByRole('button', { name: 'Clear selection' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Search dma...' }).click();
    await page.getByRole('option', { name: 'Buffalo, NY' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 650,
            y: 264
        }
    });
    await page.getByText('Buffalo, NY').click();
    await page.getByText('Created Jul 24,').click();
    await page.getByText('New York').click();
    await page.getByText('-78.504994').click();
    await page.getByText('DMA Code:').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Filters 1' }).click();
    await page.getByRole('button', { name: 'Reset All' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Search custom cluster...' }).click();
    await page.getByPlaceholder('Search custom cluster...').click();
    await page.getByPlaceholder('Search custom cluster...').fill('test c');
    await page.getByText('test cluster').click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 733,
            y: 341
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 733,
            y: 337
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 855,
            y: 434
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 823,
            y: 415
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 714,
            y: 371
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 731,
            y: 316
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 665,
            y: 327
        }
    });
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 751,
            y: 319
        }
    });
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('region', { name: 'Map' }).click({
        position: {
            x: 802,
            y: 422
        }
    });
    await page.getByRole('button', { name: 'View Cluster Details' }).click();
    await page.getByRole('heading', { name: 'test cluster' }).nth(1).click();
    await page.getByRole('button', { name: 'Close' }).nth(1).click();
    await page.getByRole('button', { name: 'Filters 1' }).click();
    await page.getByRole('button', { name: 'Clear selection' }).click();
    await page.getByRole('combobox', { name: 'Multi-select: 0 of 8 options' }).click();
    await page.locator('.mr-2.flex').first().click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Potential Ranking' }).click();
    await page.locator('html').click();
    await page.locator('div:nth-child(44) > .relative.flex > .w-12').click();
    await page.getByRole('heading', { name: 'Original American Kitchen (' }).nth(1).click();
    await page.getByText('15 SE 1st Ave, Gainesville,').click();
    await page.getByText('Store Rating').click();
    await page.getByText('BRONZE').click();
    await page.getByText('BRONZELocation15 SE 1st').click();
    await page.getByText('BRONZE').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Filters 1' }).click();
    await page.getByRole('button', { name: 'Reset All' }).click();
    await page.getByRole('button', { name: 'Apply Changes' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Custom Clusters' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Potential Ranking' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).dblclick();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Store Visits', exact: true }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Map Layers' }).click();
    await page.locator('html').click();
    await page.getByRole('button', { name: 'Pick visit dates' }).click();
    await page.getByRole('gridcell', { name: '1' }).nth(1).click();
    await page.getByRole('gridcell', { name: '14' }).first().click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Go to Orlando, FL' }).click();
    await page.locator('div:nth-child(12) > .relative > img').click();
    await page.getByRole('heading', { name: 'SunStop Urban Market #' }).nth(1).click();
    await page.getByRole('img', { name: 'Visit photo' }).click();
    await page.locator('.p-4.xs\\:p-6').click();
    await page.getByText('Jan 13, 2026, 1:44 AM').click();
    await page.getByRole('button', { name: 'Close' }).nth(1).click();
    await page.getByRole('button', { name: 'Jan 01, 2026 - Jan 14,' }).click();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await page.getByRole('combobox').filter({ hasText: 'Search locations or stores...' }).click();
    await page.getByText('SHARPSTOWN LIQUOR').click();
    await page.getByRole('img', { name: 'bronze marker' }).click();
    await page.getByRole('heading', { name: 'SHARPSTOWN LIQUOR' }).nth(1).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Go to Orlando, FL' }).click();
    await page.getByRole('button', { name: 'Reset All Filters & Layers' }).click();
});