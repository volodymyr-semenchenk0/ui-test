
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // Navigate to URL 'http://automationexercise.com'
    await page.goto('https://automationexercise.com');

    // Verify that home page is visible successfully
    await expect(page).toHaveTitle(/Automation Exercise/);
    await expect(page.locator('a[href="/"]:has-text("Home")')).toHaveAttribute('style', 'color: orange;');
});


test('Contact Us Form', async ({ page }) => {

    // Click on 'Contact Us' button
    await page.locator('a[href="/contact_us"]').click();

    // Verify 'GET IN TOUCH' is visible
    await expect(page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();

    page.on('dialog', async dialog => {
        await dialog.accept();
    });

    // Enter name, email, subject, and message
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'johndoe@example.com');
    await page.fill('input[name="subject"]', 'Test Subject');
    await page.fill('textarea[name="message"]', 'This is a test message.');

    // Upload file
    const filePath = './test-data/test-file.txt'; // Replace with your file path
    await page.setInputFiles('input[name="upload_file"]', filePath);

    //Click 'Submit' button
    await page.waitForTimeout(500);
    await page.locator('input[type="submit"]').click();

    //Verify success message 'Success! Your details have been submitted successfully.' is visible
    const successMessage = page.locator('.status.alert.alert-success');
    await expect(successMessage).toBeVisible(); // Ожидание до 10 секунд

    //Click 'Home' button and verify that landed to home page successfully
    await page.locator('a.btn.btn-success[href="/"]').click();
    await expect(page).toHaveURL('https://automationexercise.com/');
});


test('Verify All Products and product detail page', async ({ page }) => {
    // Click on 'Products' button
    await page.getByRole('link',{name: 'Products'}).click();

    // Verify user is navigated to ALL PRODUCTS page successfully
    await expect(page).toHaveURL(/.*\/products/);

    // Verify the products list is visible
    await expect(page.locator('.features_items')).toBeVisible();

    // Click on 'View Product' of first product

    await page.locator('a[href="/product_details/1"]').click();

    // User is landed to product detail page
    await expect(page).toHaveURL(/.*\/product_details/);

    // Verify product details are visible
    await expect(page.locator('.product-information h2')).toHaveText('Blue Top'); // Product name
    await expect(page.locator('.product-information p:has-text("Category: Women > Tops")')).toBeVisible(); // Category
    await expect(page.locator('.product-information > span:has-text("Rs. 500")')).toBeVisible(); // Price
    await expect(page.locator('.product-information p:has-text("Availability: In Stock")')).toBeVisible(); // Availability
    await expect(page.locator('.product-information p:has-text("Condition: New")')).toBeVisible(); // Condition
    await expect(page.locator('.product-information p:has-text("Brand: Polo")')).toBeVisible(); // Brand
});

test('Search Product', async ({ page }) => {
    // Click on 'Products' button
    await page.getByRole('link',{name: 'Products'}).click();

    // Verify user is navigated to ALL PRODUCTS page successfully
    await expect(page).toHaveURL(/.*\/products/);

    // Enter product name in search input and click search button
    const searchTerm = 'T-shirt';
    await page.locator('#search_product').fill(searchTerm);
    await page.locator('#submit_search').click();

    // Verify 'SEARCHED PRODUCTS' is visible
    await expect(page.getByRole('heading', { name: 'Searched Products' })).toBeVisible();

    // Get all products in the searched results
    const products = page.locator('.features_items .product-image-wrapper');
    const count = await products.count();
    //console.log(`Found ${count} products for the search term: "${searchTerm}"`);
    expect(count).toBeGreaterThan(0);

    // Validate product details
    for (let i = 0; i < count; i++) {
        const product = products.nth(i);

        // Refined selector for product name inside `.productinfo`
        const productName = await product.locator('.productinfo > p').innerText();
        const productPrice = await product.locator('.productinfo > h2').innerText();

        //console.log(`Product ${i + 1}: Name = "${productName}", Price = "${productPrice}"`);

        // Assert product name contains the search term (case-insensitive)
        expect(productName.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
});

test('Verify Subscription in home page', async ({ page }) => {
    // Scroll down to the footer
    await page.locator('footer').scrollIntoViewIfNeeded();

    // Verify the text 'SUBSCRIPTION' is visible
    await expect(page.getByRole('heading', { name: 'Subscription' })).toBeVisible();

    // Enter email address in the input and click the arrow button
    await page.locator('#susbscribe_email').fill('test@example.com');
    await page.locator('#subscribe').click();

    // Verify success message is visible
    const successMessage = page.locator('div.alert-success.alert');
    await expect(successMessage).toBeVisible();
});

test('AutomationExercise Signup Workflow', async ({ page }) => {

    const userData = require('../test-data/userData.json');

    const emailWithTimestamp = userData.credentials.email.replace (
        '{timestamp}',
        Date.now().toString()
    );

    const credentials = {
        ...userData.credentials,
        email: emailWithTimestamp,
    };

    const personalInfo = userData.personalInfo;

    const address = userData.address;

    // Click 'Signup / Login' button
    await page.locator('a[href="/login"]').click();

    // Fill in Signup form
    await page.fill('input[data-qa="signup-name"]', credentials.username);
    await page.fill('input[data-qa="signup-email"]', credentials.email);
    await page.click('button[data-qa="signup-button"]');

    // Fill in account creation form
    await page.check('input#id_gender1');

    // Password
    await page.fill('input#password', credentials.password);

    // Date of Birth
    await page.selectOption('select[data-qa="days"]', personalInfo.dob.day);
    await page.selectOption('select[data-qa="months"]', personalInfo.dob.month);
    await page.selectOption('select[data-qa="years"]', personalInfo.dob.year);

    // Newsletter and offers checkboxes
    await page.check('input#newsletter');
    await page.check('input#optin');

    // Address Information
    await page.fill('input[data-qa="first_name"]', personalInfo.firstName);
    await page.fill('input[data-qa="last_name"]', personalInfo.lastName);
    await page.fill('input[data-qa="company"]', address.company);
    await page.fill('input[data-qa="address"]', address.address1);
    await page.fill('input[data-qa="address2"]', address.address2);
    await page.selectOption('select[data-qa="country"]', address.country);
    await page.fill('input[data-qa="state"]', address.state);
    await page.fill('input[data-qa="city"]', address.city);
    await page.fill('input[data-qa="zipcode"]', address.zipcode);
    await page.fill('input[data-qa="mobile_number"]', personalInfo.mobileNumber);

    // Submit the form
    await page.click('button[data-qa="create-account"]');

    // Verify 'ACCOUNT CREATED!' and click 'Continue' button
    await expect(page.locator('h2:has-text("ACCOUNT CREATED!")')).toBeVisible();
    await page.click('a[data-qa="continue-button"]');

    // Verify 'Logged in as username' at top
    await expect(page.locator(`text=Logged in as ${credentials.username}`)).toBeVisible();

    // Add products to cart
    await page.locator('a[href="/products"]').click();
    await page.locator('.productinfo .btn').first().click();
    await page.locator('.productinfo .btn').nth(1).click();

    // Click 'Cart' button
    await page.getByRole('link', { name: 'Cart' }).click();

    // Verify that cart page is displayed
    await expect(page.locator('ol.breadcrumb li.active:has-text("Shopping Cart")')).toBeVisible();

    await page.locator('a.btn.btn-default.check_out').click();

    // Verify the delivery address matches registration data
    const deliveryAddressText = await page.locator('#address_delivery').innerText();

    expect(deliveryAddressText).toContain(`${personalInfo.firstName} ${personalInfo.lastName}`);
    expect(deliveryAddressText).toContain(address.company);
    expect(deliveryAddressText).toContain(address.address1);
    expect(deliveryAddressText).toContain(address.address2);
    expect(deliveryAddressText).toContain(`${address.city} ${address.state} ${address.zipcode}`);
    expect(deliveryAddressText).toContain(address.country);
    expect(deliveryAddressText).toContain(personalInfo.mobileNumber);

    // Verify the billing address matches registration data
    const billingAddressText = await page.locator('#address_invoice').innerText();

    expect(billingAddressText).toContain(`${personalInfo.firstName} ${personalInfo.lastName}`);
    expect(billingAddressText).toContain(address.company);
    expect(billingAddressText).toContain(address.address1);
    expect(billingAddressText).toContain(address.address2);
    expect(billingAddressText).toContain(`${address.city} ${address.state} ${address.zipcode}`);
    expect(billingAddressText).toContain(address.country);
    expect(billingAddressText).toContain(personalInfo.mobileNumber);

    // Click 'Delete Account' button
    await page.getByRole('link', { name: 'Delete Account' }).click();

    // Verify 'ACCOUNT DELETED!' and click 'Continue' button
    await expect(page.locator('h2:has-text("ACCOUNT DELETED!")')).toBeVisible();
    await page.getByRole('link', { name: 'Continue' }).click();
});

