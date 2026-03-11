// Shopping Cart tests for https://www.saucedemo.com
// Covers: adding items, removing items, cart persistence, empty cart, navigation

const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage }      = require('../pages/CartPage');
const { USERS, URLS, PRODUCTS } = require('../utils/testData');


// SETUP: Login before each test
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);
  await expect(page).toHaveURL(URLS.inventory);
});


// GROUP 1: Cart Page Load
test.describe('Cart Page Load', () => {

  test('Cart page loads with correct title', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    // Navigate via cart icon
    await inventoryPage.clickCart();
    await expect(page).toHaveURL(URLS.cart);
    expect(await cartPage.getTitle()).toBe('Your Cart');
  });

  test('Empty cart shows no items', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.clickCart();

    expect(await cartPage.isCartEmpty()).toBe(true);
    expect(await cartPage.getCartItemCount()).toBe(0);
  });

  test('Empty cart has no badge on the cart icon', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.clickCart();

    expect(await cartPage.getCartBadgeCount()).toBe(0);
  });

  test('Cart page shows Continue Shopping and Checkout buttons', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.clickCart();

    await expect(cartPage.continueShoppingBtn).toBeVisible();
    await expect(cartPage.checkoutBtn).toBeVisible();
  });
});

// GROUP 2: Adding Items to Cart
test.describe('Adding Items', () => {

  test('Adding one item — it appears in the cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await cartPage.goto();

    expect(await cartPage.getCartItemCount()).toBe(1);
    expect(await cartPage.isItemInCart(PRODUCTS.backpack)).toBe(true);
  });

  test('Adding multiple items — all appear in the cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);
    await inventoryPage.addToCartByName(PRODUCTS.boltShirt);
    await cartPage.goto();

    expect(await cartPage.getCartItemCount()).toBe(3);
    expect(await cartPage.isItemInCart(PRODUCTS.backpack)).toBe(true);
    expect(await cartPage.isItemInCart(PRODUCTS.bikeLight)).toBe(true);
    expect(await cartPage.isItemInCart(PRODUCTS.boltShirt)).toBe(true);
  });

  test('Adding all 6 products — cart shows all 6', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    for (const product of Object.values(PRODUCTS)) {
      await inventoryPage.addToCartByName(product);
    }

    await cartPage.goto();
    expect(await cartPage.getCartItemCount()).toBe(6);
  });

  test('Each cart item shows quantity of 1', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);
    await cartPage.goto();

    // Each item quantity should be 1
    const itemCount = await cartPage.getCartItemCount();
    for (let i = 0; i < itemCount; i++) {
      expect(await cartPage.getItemQuantityAt(i)).toBe(1);
    }
  });

  test('Cart item price matches the price on the inventory page', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);

    // Get price from inventory before adding
    const backpackItem      = page.locator('.inventory_item', { hasText: PRODUCTS.backpack });
    const priceOnInventory  = parseFloat(
      (await backpackItem.locator('.inventory_item_price').innerText()).replace('$', '')
    );

    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await cartPage.goto();
    const pricesInCart = await cartPage.getAllItemPrices();
    expect(pricesInCart[0]).toBe(priceOnInventory);
  });

  test('Cart icon badge count matches number of items added', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    expect(await inventoryPage.getCartCount()).toBe(1);

    await inventoryPage.addToCartByName(PRODUCTS.onesie);
    expect(await inventoryPage.getCartCount()).toBe(2);

    await inventoryPage.addToCartByName(PRODUCTS.fleeceJacket);
    expect(await inventoryPage.getCartCount()).toBe(3);
  });

});


// GROUP 3: Removing Items from Cart
test.describe('Removing Items', () => {

  test('Removing an item from the cart page — it disappears', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await cartPage.goto();

    expect(await cartPage.isItemInCart(PRODUCTS.backpack)).toBe(true);
    await cartPage.removeItemByName(PRODUCTS.backpack);

    expect(await cartPage.isCartEmpty()).toBe(true);
    expect(await cartPage.isItemInCart(PRODUCTS.backpack)).toBe(false);
  });

  test('Removing one item from a multi-item cart — others remain', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);

    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);
    await inventoryPage.addToCartByName(PRODUCTS.onesie);
    await cartPage.goto();

    await cartPage.removeItemByName(PRODUCTS.bikeLight);

    expect(await cartPage.getCartItemCount()).toBe(2);
    expect(await cartPage.isItemInCart(PRODUCTS.backpack)).toBe(true);
    expect(await cartPage.isItemInCart(PRODUCTS.bikeLight)).toBe(false);
    expect(await cartPage.isItemInCart(PRODUCTS.onesie)).toBe(true);
  });

  test('Removing all items one by one leaves an empty cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);
    await cartPage.goto();

    await cartPage.removeItemByName(PRODUCTS.backpack);
    await cartPage.removeItemByName(PRODUCTS.bikeLight);

    expect(await cartPage.isCartEmpty()).toBe(true);
  });

  test('Removing an item updates the cart badge count', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);

    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);
    await cartPage.goto();

    expect(await cartPage.getCartBadgeCount()).toBe(2);

    await cartPage.removeItemByName(PRODUCTS.backpack);

    expect(await cartPage.getCartBadgeCount()).toBe(1);
  });

  test('After removing last item, cart badge disappears', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await cartPage.goto();

    await cartPage.removeItemByName(PRODUCTS.backpack);

    expect(await cartPage.getCartBadgeCount()).toBe(0);
    await expect(cartPage.cartBadge).not.toBeVisible();
  });

});

// GROUP 4: Cart Persistence
test.describe('Cart Persistence', () => {

  test('Items added on inventory page persist when navigating to cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.fleeceJacket);

    // Navigate away and come back
    await page.goto(URLS.inventory);
    await cartPage.goto();

    expect(await cartPage.getCartItemCount()).toBe(2);
    expect(await cartPage.isItemInCart(PRODUCTS.backpack)).toBe(true);
    expect(await cartPage.isItemInCart(PRODUCTS.fleeceJacket)).toBe(true);
  });

  test('Cart badge persists after navigating back to inventory', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);
    await inventoryPage.addToCartByName(PRODUCTS.backpack);

    // Go to cart and back to inventory
    await cartPage.goto();
    await cartPage.clickContinueShopping();

    await expect(page).toHaveURL(URLS.inventory);

    // Badge should still show 1
    expect(await inventoryPage.getCartCount()).toBe(1);
  });

  test('Item added persists — button shows Remove on return to inventory', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);

    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await cartPage.goto();
    await cartPage.clickContinueShopping();

    // The Add to Cart button for backpack should still say Remove
    const backpackItem = page.locator('.inventory_item', { hasText: PRODUCTS.backpack });
    const removeBtn    = backpackItem.locator('button[data-test^="remove"]');
    await expect(removeBtn).toBeVisible();
  });
});

// GROUP 5: Cart Navigation
test.describe('Cart Navigation', () => {

  test('Continue Shopping button returns to inventory page', async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.clickContinueShopping();

    await expect(page).toHaveURL(URLS.inventory);
  });

  test('Cart icon click from inventory opens the cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.clickCart();

    await expect(page).toHaveURL(URLS.cart);
  });

  test('Checkout button navigates to checkout step one', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage      = new CartPage(page);

    // Must have at least one item to proceed to checkout
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await cartPage.goto();
    await cartPage.clickCheckout();

    await expect(page).toHaveURL(URLS.checkout);
  });
});
