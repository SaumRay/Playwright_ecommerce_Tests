// Represents the individual product detail page

class ProductDetailPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    //Locators 
    this.productName    = page.locator('.inventory_details_name');
    this.productDesc    = page.locator('.inventory_details_desc');
    this.productPrice   = page.locator('.inventory_details_price');
    this.productImage   = page.locator('.inventory_details_img');
    this.addToCartBtn   = page.locator('button[data-test^="add-to-cart"]');
    this.removeBtn      = page.locator('button[data-test^="remove"]');
    this.backButton     = page.locator('[data-test="back-to-products"]');
    this.cartBadge      = page.locator('.shopping_cart_badge');
  }

  //Actions
  async clickBackToProducts() {
    await this.backButton.click();
  }

  async addToCart() {
    await this.addToCartBtn.click();
  }

  async removeFromCart() {
    await this.removeBtn.click();
  }

  //Getters
  async getName() {
    return await this.productName.innerText();
  }

  async getDescription() {
    return await this.productDesc.innerText();
  }

  async getPrice() {
    const text = await this.productPrice.innerText();
    return parseFloat(text.replace('$', ''));
  }

  async getCartCount() {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    return parseInt(await this.cartBadge.innerText());
  }

  async isAddToCartVisible() {
    return await this.addToCartBtn.isVisible();
  }

  async isRemoveVisible() {
    return await this.removeBtn.isVisible();
  }

  async getCurrentUrl() {
    return this.page.url();
  }
}

module.exports = { ProductDetailPage };
