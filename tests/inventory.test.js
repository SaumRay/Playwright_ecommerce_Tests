// Inventory page tests for https://www.saucedemo.com
// Covers: page load, product listing, sorting, product detail, cart interactions

const { test, expect } = require('@playwright/test');
const { LoginPage }         = require('../pages/LoginPage');
const { InventoryPage }     = require('../pages/InventoryPage');
const { ProductDetailPage } = require('../pages/ProductDetailPage');
const { USERS, URLS, SORT_OPTIONS, PRODUCTS, EXPECTED } = require('../utils/testData');

// SETUP: Login before each test (inventory page requires authentication)
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);
  await expect(page).toHaveURL(URLS.inventory);
});

// GROUP 1: Page Load & Product Listing
test.describe('Product Listing', () => {

  test('Inventory page loads with correct title', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await expect(page).toHaveURL(URLS.inventory);
    const title = await inventoryPage.getTitle();
    expect(title).toBe(EXPECTED.inventoryTitle);
  });

  test('Exactly 6 products are displayed', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    const count = await inventoryPage.getProductCount();
    expect(count).toBe(EXPECTED.totalProducts);
  });

  test('All products have a name, price, description and image', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    const names  = await inventoryPage.getAllProductNames();
    const prices = await inventoryPage.getAllProductPrices();

    // Every name should be a non-empty string
    for (const name of names) {
      expect(name.trim().length).toBeGreaterThan(0);
    }

    // Every price should be a positive number
    for (const price of prices) {
      expect(price).toBeGreaterThan(0);
    }

    // All product images are visible
    const images = inventoryPage.productImages;
    const imgCount = await images.count();
    for (let i = 0; i < imgCount; i++) {
      await expect(images.nth(i)).toBeVisible();
    }

    // All descriptions are visible
    const descs = inventoryPage.productDescs;
    const descCount = await descs.count();
    for (let i = 0; i < descCount; i++) {
      await expect(descs.nth(i)).toBeVisible();
    }
  });

  test('All 6 known products are present in the list', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const names = await inventoryPage.getAllProductNames();

    // Verify each expected product exists somewhere in the list
    for (const productName of Object.values(PRODUCTS)) {
      expect(names).toContain(productName);
    }
  });

  test('Each product has an Add to Cart button', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    const btnCount = await inventoryPage.addToCartBtns.count();
    expect(btnCount).toBe(EXPECTED.totalProducts);
  });

});

// GROUP 2: Sorting
test.describe('Product Sorting', () => {

  test('Sort A→Z: products appear in ascending alphabetical order', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy(SORT_OPTIONS.nameAZ);

    const names = await inventoryPage.getAllProductNames();
    const sorted = [...names].sort();

    expect(names).toEqual(sorted);
  });

  test('Sort Z→A: products appear in descending alphabetical order', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(SORT_OPTIONS.nameZA);

    const names = await inventoryPage.getAllProductNames();
    const sorted = [...names].sort().reverse();

    expect(names).toEqual(sorted);
  });

  test('Sort Price Low→High: prices increase from first to last', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(SORT_OPTIONS.priceLowHigh);

    const prices = await inventoryPage.getAllProductPrices();

    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  test('Sort Price High→Low: prices decrease from first to last', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(SORT_OPTIONS.priceHighLow);

    const prices = await inventoryPage.getAllProductPrices();

    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });

  test('Sort A→Z: first product is Sauce Labs Backpack', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(SORT_OPTIONS.nameAZ);

    const firstName = await inventoryPage.getProductNameAt(0);
    expect(firstName).toBe(EXPECTED.firstAlpha);
  });

  test('Sort Z→A: first product is Test.allTheThings() T-Shirt', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(SORT_OPTIONS.nameZA);

    const firstName = await inventoryPage.getProductNameAt(0);
    expect(firstName).toBe(EXPECTED.lastAlpha);
  });

  test('Sort Low→High: cheapest product (Onesie) is listed first', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(SORT_OPTIONS.priceLowHigh);

    const firstName = await inventoryPage.getProductNameAt(0);
    expect(firstName).toBe(EXPECTED.cheapestProduct);
  });

  test('Sort High→Low: most expensive product (Fleece Jacket) is listed first', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(SORT_OPTIONS.priceHighLow);

    const firstName = await inventoryPage.getProductNameAt(0);
    expect(firstName).toBe(EXPECTED.pricestProduct);
  });

});

// GROUP 3: Product Detail Page
test.describe('Product Detail Page', () => {

  test('Clicking a product name opens its detail page', async ({ page }) => {
    const inventoryPage     = new InventoryPage(page);
    const productDetailPage = new ProductDetailPage(page);
    await inventoryPage.clickProductByName(PRODUCTS.backpack);

    // URL should change to a product detail URL
    await expect(page).toHaveURL(/inventory-item\.html/);

    // Product name on detail page should match what we clicked
    const detailName = await productDetailPage.getName();
    expect(detailName).toBe(PRODUCTS.backpack);
  });

  test('Product detail page shows name, description, price and image', async ({ page }) => {
    const inventoryPage     = new InventoryPage(page);
    const productDetailPage = new ProductDetailPage(page);

    await inventoryPage.clickProductByName(PRODUCTS.bikeLight);

    await expect(productDetailPage.productName).toBeVisible();
    await expect(productDetailPage.productDesc).toBeVisible();
    await expect(productDetailPage.productPrice).toBeVisible();
    await expect(productDetailPage.productImage).toBeVisible();

    // Price should be a valid number
    const price = await productDetailPage.getPrice();
    expect(price).toBeGreaterThan(0);
  });

  test('Price on detail page matches the price shown on inventory page', async ({ page }) => {
    const inventoryPage     = new InventoryPage(page);
    const productDetailPage = new ProductDetailPage(page);

    // Get the price from the inventory list first
    const items = inventoryPage.productItems;
    const backpackItem = page.locator('.inventory_item', { hasText: PRODUCTS.backpack });
    const priceOnList  = parseFloat(
      (await backpackItem.locator('.inventory_item_price').innerText()).replace('$', '')
    );

    // Navigate to detail page
    await inventoryPage.clickProductByName(PRODUCTS.backpack);
    const priceOnDetail = await productDetailPage.getPrice();

    expect(priceOnDetail).toBe(priceOnList);
  });

  test('Back to Products button returns to inventory page', async ({ page }) => {
    const inventoryPage     = new InventoryPage(page);
    const productDetailPage = new ProductDetailPage(page);

    await inventoryPage.clickProductByName(PRODUCTS.backpack);
    await expect(page).toHaveURL(/inventory-item\.html/);

    await productDetailPage.clickBackToProducts();

    await expect(page).toHaveURL(URLS.inventory);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('Add to Cart on detail page increments cart badge to 1', async ({ page }) => {
    const inventoryPage     = new InventoryPage(page);
    const productDetailPage = new ProductDetailPage(page);

    await inventoryPage.clickProductByName(PRODUCTS.fleeceJacket);

    // Add to cart button should be visible before clicking
    expect(await productDetailPage.isAddToCartVisible()).toBe(true);

    await productDetailPage.addToCart();

    // Cart badge should now show 1
    const cartCount = await productDetailPage.getCartCount();
    expect(cartCount).toBe(1);

    // Button should switch to Remove
    expect(await productDetailPage.isRemoveVisible()).toBe(true);
    expect(await productDetailPage.isAddToCartVisible()).toBe(false);
  });

  test('Remove button on detail page decrements cart badge', async ({ page }) => {
    const inventoryPage     = new InventoryPage(page);
    const productDetailPage = new ProductDetailPage(page);

    await inventoryPage.clickProductByName(PRODUCTS.fleeceJacket);
    await productDetailPage.addToCart();
    expect(await productDetailPage.getCartCount()).toBe(1);

    await productDetailPage.removeFromCart();

    // Cart badge should disappear
    expect(await productDetailPage.getCartCount()).toBe(0);

    // Button should switch back to Add to Cart
    expect(await productDetailPage.isAddToCartVisible()).toBe(true);
  });
});

// GROUP 4: Add to Cart from Inventory Page
test.describe('Add to Cart from Inventory', () => {

  test('Adding one product increments cart badge to 1', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    expect(await inventoryPage.getCartCount()).toBe(0);

    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    expect(await inventoryPage.getCartCount()).toBe(1);
  });

  test('Adding two products increments cart badge to 2', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);

    expect(await inventoryPage.getCartCount()).toBe(2);
  });

  test('Button changes to Remove after adding a product', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addToCartByName(PRODUCTS.backpack);

    // The Add to Cart button for that specific item should now say Remove
    const backpackItem = page.locator('.inventory_item', { hasText: PRODUCTS.backpack });
    const removeBtn    = backpackItem.locator('button[data-test^="remove"]');
    await expect(removeBtn).toBeVisible();
  });

  test('Removing a product decrements cart badge', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    expect(await inventoryPage.getCartCount()).toBe(1);

    await inventoryPage.removeFromCartByName(PRODUCTS.backpack);
    expect(await inventoryPage.getCartCount()).toBe(0);
  });
});
