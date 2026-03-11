// Represents Checkout Step 2 — order summary / overview

class CheckoutStepTwoPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    //Locators 
    this.pageTitle      = page.locator('.title');
    this.cartItems      = page.locator('.cart_item');
    this.cartItemNames  = page.locator('.inventory_item_name');
    this.cartItemPrices = page.locator('.inventory_item_price');
    this.itemTotal      = page.locator('.summary_subtotal_label');
    this.taxAmount      = page.locator('.summary_tax_label');
    this.totalAmount    = page.locator('.summary_total_label');
    this.finishBtn      = page.locator('[data-test="finish"]');
    this.cancelBtn      = page.locator('[data-test="cancel"]');
    this.paymentInfo    = page.locator('[data-test="payment-info-value"]');
    this.shippingInfo   = page.locator('[data-test="shipping-info-value"]');
  }

  //Actions 
  async clickFinish() {
    await this.finishBtn.click();
  }

  async clickCancel() {
    await this.cancelBtn.click();
  }

  //Getters 
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

  async getItemTotal() {
    // Returns the numeric subtotal e.g. "Item total: $29.99" → 29.99
    const text = await this.itemTotal.innerText();
    return parseFloat(text.replace('Item total: $', ''));
  }

  async getTax() {
    const text = await this.taxAmount.innerText();
    return parseFloat(text.replace('Tax: $', ''));
  }

  async getTotal() {
    const text = await this.totalAmount.innerText();
    return parseFloat(text.replace('Total: $', ''));
  }

  async getPaymentInfo() {
    return await this.paymentInfo.innerText();
  }

  async getShippingInfo() {
    return await this.shippingInfo.innerText();
  }
}

module.exports = { CheckoutStepTwoPage };
