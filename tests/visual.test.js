// Visual / Screenshot regression tests for https://www.saucedemo.com

const { test, expect }          = require('@playwright/test');
const { LoginPage }             = require('../pages/LoginPage');
const { InventoryPage }         = require('../pages/InventoryPage');
const { CartPage }              = require('../pages/CartPage');
const { CheckoutStepOnePage }   = require('../pages/CheckoutStepOnePage');
const { CheckoutStepTwoPage }   = require('../pages/CheckoutStepTwoPage');
const { OrderConfirmationPage } = require('../pages/OrderConfirmationPage');
const { USERS, URLS, PRODUCTS, CUSTOMER } = require('../utils/testData');

const VISUAL_OPTIONS = {
  maxDiffPixels: 100,   // allow up to 100 pixels to differ (handles anti-aliasing)
  threshold: 0.2,       // 20% color tolerance per pixel
};

// GROUP 1: Full Page Screenshots
test.describe('Full Page Visual Tests', () => {

  test('Login page matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Full page screenshot comparison
    await expect(page).toHaveScreenshot('login-page.png', {
      ...VISUAL_OPTIONS,
      fullPage: true,
    });
  });

  test('Inventory page matches baseline', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(URLS.inventory);

    await expect(page).toHaveScreenshot('inventory-page.png', {
      ...VISUAL_OPTIONS,
      fullPage: true,
    });
  });

  test('Cart page (empty) matches baseline', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.clickCart();

    await expect(page).toHaveScreenshot('cart-empty.png', {
      ...VISUAL_OPTIONS,
      fullPage: true,
    });
  });

  test('Cart page (with items) matches baseline', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);
    await inventoryPage.clickCart();

    await expect(page).toHaveScreenshot('cart-with-items.png', {
      ...VISUAL_OPTIONS,
      fullPage: true,
    });
  });

  test('Checkout step one page matches baseline', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.clickCart();
    await cartPage.clickCheckout();

    await expect(page).toHaveScreenshot('checkout-step-one.png', {
      ...VISUAL_OPTIONS,
      fullPage: true,
    });
  });

  test('Checkout step two (order summary) matches baseline', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    const stepOne       = new CheckoutStepOnePage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.clickCart();
    await cartPage.clickCheckout();
    await stepOne.fillForm(
      CUSTOMER.valid.firstName,
      CUSTOMER.valid.lastName,
      CUSTOMER.valid.postalCode
    );
    await stepOne.clickContinue();

    await expect(page).toHaveScreenshot('checkout-step-two.png', {
      ...VISUAL_OPTIONS,
      fullPage: true,
    });
  });

  test('Order confirmation page matches baseline', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    const stepOne       = new CheckoutStepOnePage(page);
    const stepTwo       = new CheckoutStepTwoPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.clickCart();
    await cartPage.clickCheckout();
    await stepOne.fillForm(
      CUSTOMER.valid.firstName,
      CUSTOMER.valid.lastName,
      CUSTOMER.valid.postalCode
    );
    await stepOne.clickContinue();
    await stepTwo.clickFinish();

    await expect(page).toHaveScreenshot('order-confirmation.png', {
      ...VISUAL_OPTIONS,
      fullPage: true,
    });
  });
});

// GROUP 2: Component / Element Screenshots
test.describe('Component Visual Tests', () => {

  test('Login form component matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Screenshot just the login form, not the whole page
    const loginForm = page.locator('.login-box');
    await expect(loginForm).toHaveScreenshot('login-form-component.png', VISUAL_OPTIONS);
  });

  test('Product card component matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    // Screenshot just the first product card
    const firstProduct = page.locator('.inventory_item').first();
    await expect(firstProduct).toHaveScreenshot('product-card-component.png', VISUAL_OPTIONS);
  });

  test('Cart icon with badge matches baseline', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);

    // Screenshot just the cart icon area
    const cartIcon = page.locator('.shopping_cart_container');
    await expect(cartIcon).toHaveScreenshot('cart-icon-with-badge.png', VISUAL_OPTIONS);
  });

  test('Error message component matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    // Trigger an error to capture its visual appearance
    await loginPage.clickLogin();

    const errorBanner = page.locator('[data-test="error"]');
    await expect(errorBanner).toHaveScreenshot('error-banner-component.png', VISUAL_OPTIONS);
  });

  test('Sort dropdown matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    const sortDropdown = page.locator('.select_container');
    await expect(sortDropdown).toHaveScreenshot('sort-dropdown-component.png', VISUAL_OPTIONS);
  });

});

// GROUP 3: State-based Visual Tests
// These test that the UI looks correct in specific states
test.describe('State-Based Visual Tests', () => {

  test('Add to Cart button changes visually after clicking', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    const firstProduct = page.locator('.inventory_item').first();

    // Screenshot BEFORE adding to cart
    await expect(firstProduct).toHaveScreenshot('product-card-before-add.png', VISUAL_OPTIONS);

    // Add to cart
    await firstProduct.locator('button[data-test^="add-to-cart"]').click();

    // Screenshot AFTER — button should now say "Remove" (visually different)
    await expect(firstProduct).toHaveScreenshot('product-card-after-add.png', VISUAL_OPTIONS);
  });

  test('Inventory sorted A→Z looks different from Z→A', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    // Sort A→Z and capture
    await inventoryPage.sortBy('az');
    await expect(page.locator('.inventory_list')).toHaveScreenshot('inventory-sorted-az.png', VISUAL_OPTIONS);

    // Sort Z→A and capture — list order should look different
    await inventoryPage.sortBy('za');
    await expect(page.locator('.inventory_list')).toHaveScreenshot('inventory-sorted-za.png', VISUAL_OPTIONS);
  });
});
