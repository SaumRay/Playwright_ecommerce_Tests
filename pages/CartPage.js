// Represents the Shopping Cart page (/cart.html)

class CartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    //Locators 
    this.pageTitle        = page.locator('.title');
    this.cartList         = page.locator('.cart_list');
    this.cartItems        = page.locator('.cart_item');
    this.cartItemNames    = page.locator('.inventory_item_name');
    this.cartItemPrices   = page.locator('.inventory_item_price');
    this.cartItemQtys     = page.locator('.cart_quantity');
    this.removeButtons    = page.locator('button[data-test^="remove"]');

    //Footer buttons
    this.continueShoppingBtn = page.locator('[data-test="continue-shopping"]');
    this.checkoutBtn         = page.locator('[data-test="checkout"]');

    //Cart badge (top right icon)
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartIcon  = page.locator('.shopping_cart_link');
  }

  //Navigation 

  async goto() {
    await this.page.goto('/cart.html');
  }

  async clickContinueShopping() {
    await this.continueShoppingBtn.click();
  }

  async clickCheckout() {
    await this.checkoutBtn.click();
  }

  // Cart Item Actions 

  /** Remove an item from the cart by its product name */
  async removeItemByName(productName) {
    const item = this.page.locator('.cart_item', { hasText: productName });
    await item.locator('button[data-test^="remove"]').click();
  }

  // Getters 
  async getTitle() {
    return await this.pageTitle.innerText();
  }

  async getCartItemCount() {
    return await this.cartItems.count();
  }

  async getAllItemNames() {
    return await this.cartItemNames.allInnerTexts();
  }

  async getAllItemPrices() {
    const priceTexts = await this.cartItemPrices.allInnerTexts();
    return priceTexts.map(p => parseFloat(p.replace('$', '')));
  }

  async getItemQuantityAt(index) {
    return parseInt(await this.cartItemQtys.nth(index).innerText());
  }

  async isItemInCart(productName) {
    const names = await this.getAllItemNames();
    return names.includes(productName);
  }

  async isCartEmpty() {
    return (await this.cartItems.count()) === 0;
  }

  async getCartBadgeCount() {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    return parseInt(await this.cartBadge.innerText());
  }

  async getCurrentUrl() {
    return this.page.url();
  }
}

module.exports = { CartPage };
