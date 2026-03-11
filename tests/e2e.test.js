// Full End-to-End scenarios for https://www.saucedemo.com
// These tests simulate complete real user journeys from login to order confirmation

const { test, expect }          = require('@playwright/test');
const { LoginPage }             = require('../pages/LoginPage');
const { InventoryPage }         = require('../pages/InventoryPage');
const { CartPage }              = require('../pages/CartPage');
const { CheckoutStepOnePage }   = require('../pages/CheckoutStepOnePage');
const { CheckoutStepTwoPage }   = require('../pages/CheckoutStepTwoPage');
const { OrderConfirmationPage } = require('../pages/OrderConfirmationPage');
const { USERS, URLS, PRODUCTS, CUSTOMER, SORT_OPTIONS } = require('../utils/testData');

// E2E SCENARIO 1: Happy path — buy a single item
test('E2E — Buy a single item from login to order confirmation', async ({ page }) => {
  const loginPage     = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage      = new CartPage(page);
  const stepOne       = new CheckoutStepOnePage(page);
  const stepTwo       = new CheckoutStepTwoPage(page);
  const confirmPage   = new OrderConfirmationPage(page);

  // Step 1: Login
  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);
  await expect(page).toHaveURL(URLS.inventory);

  // Step 2: Adding one product to cart
  await inventoryPage.addToCartByName(PRODUCTS.backpack);
  expect(await inventoryPage.getCartCount()).toBe(1);

  // Step 3: Going to cart and verifying item is there or not
  await inventoryPage.clickCart();
  await expect(page).toHaveURL(URLS.cart);
  expect(await cartPage.isItemInCart(PRODUCTS.backpack)).toBe(true);

  // Step 4: Proceeding to checkout
  await cartPage.clickCheckout();
  await expect(page).toHaveURL(URLS.checkoutStepOne);

  // Step 5: Fill in customer information
  await stepOne.fillForm(
    CUSTOMER.valid.firstName,
    CUSTOMER.valid.lastName,
    CUSTOMER.valid.postalCode
  );
  await stepOne.clickContinue();
  await expect(page).toHaveURL(URLS.checkoutStepTwo);

  // Step 6: Verify order summary
  expect(await stepTwo.getCartItemCount()).toBe(1);
  expect(await stepTwo.getAllItemNames()).toContain(PRODUCTS.backpack);
  const total = await stepTwo.getTotal();
  expect(total).toBeGreaterThan(0);

  // Step 7: Finish the order
  await stepTwo.clickFinish();
  await expect(page).toHaveURL(URLS.confirmation);

  // Step 8: Verify confirmation
  expect(await confirmPage.getConfirmationHeader()).toBe('Thank you for your order!');
  expect(await confirmPage.isConfirmationImageVisible()).toBe(true);

  // Step 9: Going back home — cart should be empty
  await confirmPage.clickBackHome();
  await expect(page).toHaveURL(URLS.inventory);
  expect(await inventoryPage.getCartCount()).toBe(0);
});

// E2E SCENARIO 2: Buy multiple items
test('E2E — Buy multiple items and verify total is correct', async ({ page }) => {
  const loginPage     = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage      = new CartPage(page);
  const stepOne       = new CheckoutStepOnePage(page);
  const stepTwo       = new CheckoutStepTwoPage(page);
  const confirmPage   = new OrderConfirmationPage(page);

  // Login
  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);

  // Adding 3 items
  const itemsToBuy = [PRODUCTS.backpack, PRODUCTS.bikeLight, PRODUCTS.onesie];
  for (const item of itemsToBuy) {
    await inventoryPage.addToCartByName(item);
  }
  expect(await inventoryPage.getCartCount()).toBe(3);

  // Going to cart
  await inventoryPage.clickCart();
  expect(await cartPage.getCartItemCount()).toBe(3);

  // Checkout
  await cartPage.clickCheckout();
  await stepOne.fillForm(
    CUSTOMER.valid.firstName,
    CUSTOMER.valid.lastName,
    CUSTOMER.valid.postalCode
  );
  await stepOne.clickContinue();

  // Verifying all 3 items in summary
  const summaryNames = await stepTwo.getAllItemNames();
  for (const item of itemsToBuy) {
    expect(summaryNames).toContain(item);
  }

  // Verify total = item total + tax
  const itemTotal = await stepTwo.getItemTotal();
  const tax       = await stepTwo.getTax();
  const total     = await stepTwo.getTotal();
  expect(total).toBeCloseTo(itemTotal + tax, 2);

  // Completing order
  await stepTwo.clickFinish();
  await expect(page).toHaveURL(URLS.confirmation);
  expect(await confirmPage.getConfirmationHeader()).toBe('Thank you for your order!');
});

// E2E SCENARIO 3: Sort → pick cheapest → buy it
test('E2E — Sort by price, buy the cheapest item', async ({ page }) => {
  const loginPage     = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage      = new CartPage(page);
  const stepOne       = new CheckoutStepOnePage(page);
  const stepTwo       = new CheckoutStepTwoPage(page);
  const confirmPage   = new OrderConfirmationPage(page);

  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);

  // Sort by price low to high
  await inventoryPage.sortBy(SORT_OPTIONS.priceLowHigh);

  // Pick the first (cheapest) product
  const cheapestName = await inventoryPage.getProductNameAt(0);
  const cheapestPrice = await inventoryPage.getProductPriceAt(0);

  // Add it to cart
  await inventoryPage.addToCartByName(cheapestName);
  await inventoryPage.clickCart();

  // Verify correct item in cart
  expect(await cartPage.isItemInCart(cheapestName)).toBe(true);

  // Checkout
  await cartPage.clickCheckout();
  await stepOne.fillForm(
    CUSTOMER.valid.firstName,
    CUSTOMER.valid.lastName,
    CUSTOMER.valid.postalCode
  );
  await stepOne.clickContinue();

  // Verify the item total matches the cheapest price
  const itemTotal = await stepTwo.getItemTotal();
  expect(itemTotal).toBeCloseTo(cheapestPrice, 2);

  // Complete
  await stepTwo.clickFinish();
  await expect(page).toHaveURL(URLS.confirmation);
  expect(await confirmPage.getConfirmationHeader()).toBe('Thank you for your order!');
});

// E2E SCENARIO 4: Add item, remove it from cart, add a different one, buy it
test('E2E — Change mind: remove item from cart, add different one, complete order', async ({ page }) => {
  const loginPage     = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage      = new CartPage(page);
  const stepOne       = new CheckoutStepOnePage(page);
  const stepTwo       = new CheckoutStepTwoPage(page);
  const confirmPage   = new OrderConfirmationPage(page);

  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);

  // Add fleece jacket first
  await inventoryPage.addToCartByName(PRODUCTS.fleeceJacket);
  expect(await inventoryPage.getCartCount()).toBe(1);

  // Go to cart and remove it
  await inventoryPage.clickCart();
  await cartPage.removeItemByName(PRODUCTS.fleeceJacket);
  expect(await cartPage.isCartEmpty()).toBe(true);

  // Go back and add a different item
  await cartPage.clickContinueShopping();
  await inventoryPage.addToCartByName(PRODUCTS.boltShirt);

  // Checkout with the new item
  await inventoryPage.clickCart();
  expect(await cartPage.isItemInCart(PRODUCTS.boltShirt)).toBe(true);
  expect(await cartPage.isItemInCart(PRODUCTS.fleeceJacket)).toBe(false);

  await cartPage.clickCheckout();
  await stepOne.fillForm(
    CUSTOMER.valid.firstName,
    CUSTOMER.valid.lastName,
    CUSTOMER.valid.postalCode
  );
  await stepOne.clickContinue();

  // Summary should only have bolt shirt
  const summaryNames = await stepTwo.getAllItemNames();
  expect(summaryNames).toContain(PRODUCTS.boltShirt);
  expect(summaryNames).not.toContain(PRODUCTS.fleeceJacket);

  await stepTwo.clickFinish();
  await expect(page).toHaveURL(URLS.confirmation);
  expect(await confirmPage.getConfirmationHeader()).toBe('Thank you for your order!');
});

// E2E SCENARIO 5: Full flow with performance glitch user
test('E2E — Performance glitch user can complete a full purchase', async ({ page }) => {
  const loginPage     = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage      = new CartPage(page);
  const stepOne       = new CheckoutStepOnePage(page);
  const stepTwo       = new CheckoutStepTwoPage(page);
  const confirmPage   = new OrderConfirmationPage(page);

  await loginPage.goto();
  await loginPage.login(
    USERS.performanceGlitch.username,
    USERS.performanceGlitch.password
  );

  // Login may be slow for this user
  await expect(page).toHaveURL(URLS.inventory, { timeout: 15000 });

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

  await expect(page).toHaveURL(URLS.confirmation);
  expect(await confirmPage.getConfirmationHeader()).toBe('Thank you for your order!');
});
