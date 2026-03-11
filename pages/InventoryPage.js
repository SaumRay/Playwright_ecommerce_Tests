// Represents the Products/Inventory page that appears after successful login

class InventoryPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    //Locators
    this.pageTitle       = page.locator('.title');
    this.productList     = page.locator('.inventory_list');
    this.productItems    = page.locator('.inventory_item');
    this.productNames       = page.locator('.inventory_item_name');
    this.productPrices      = page.locator('.inventory_item_price');
    this.productImages      = page.locator('.inventory_item_img img');
    this.productDescs       = page.locator('.inventory_item_desc');
    this.addToCartBtns      = page.locator('button[data-test^="add-to-cart"]');
    this.removeFromCartBtns = page.locator('button[data-test^="remove"]');
    this.shoppingCart    = page.locator('.shopping_cart_link');

    // Sort dropdown
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');

    // Cart
    this.cartIcon  = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');

    // Burger menu
    this.burgerMenuBtn = page.locator('#react-burger-menu-btn');
    this.logoutLink    = page.locator('#logout_sidebar_link');
  }

  //Actions
  //Navigation
  async goto() {
    await this.page.goto('/inventory.html');
  }

  //Sort Actions
  async sortBy(option) {
    // option values: 'az', 'za', 'lohi', 'hilo'
    await this.sortDropdown.selectOption(option);
  }

  //Product Data Getters
  async getProductCount() {
    return await this.productItems.count();
  }

  async getAllProductNames() {
    return await this.productNames.allInnerTexts();
  }

  async getAllProductPrices() {
    const priceTexts = await this.productPrices.allInnerTexts();
    return priceTexts.map(p => parseFloat(p.replace('$', '')));
  }

  async getProductNameAt(index) {
    return await this.productNames.nth(index).innerText();
  }

  async getProductPriceAt(index) {
    const text = await this.productPrices.nth(index).innerText();
    return parseFloat(text.replace('$', ''));
  }

  async isProductListVisible() {
    return await this.productList.isVisible();
  }

  //Cart Actions
  async addToCartByName(productName) {
    const item = this.page.locator('.inventory_item', { hasText: productName });
    await item.locator('button[data-test^="add-to-cart"]').click();
  }

  async removeFromCartByName(productName) {
    const item = this.page.locator('.inventory_item', { hasText: productName });
    await item.locator('button[data-test^="remove"]').click();
  }

  async getCartCount() {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    const text = await this.cartBadge.innerText();
    return parseInt(text);
  }

  async clickCart() {
    await this.cartIcon.click();
  }

  //Product Detail Navigation
  async clickProductByName(productName) {
    await this.page.locator('.inventory_item_name', { hasText: productName }).click();
  }

  /** Open the side navigation menu */
  async openMenu() {
    await this.burgerMenuBtn.click();
  }

  /** Logout via the side menu */
  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }

  //Getters (for assertions)

  /** Returns the current page URL */
  async getCurrentUrl() {
    return this.page.url();
  }

  /** Returns the page title text (e.g. "Products") */
  async getTitle() {
    return await this.pageTitle.innerText();
  }
}

module.exports = { InventoryPage };
