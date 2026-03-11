// Represents the final order confirmation / thank you page

class OrderConfirmationPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    //Locators
    this.pageTitle       = page.locator('.title');
    this.confirmHeader   = page.locator('.complete-header');
    this.confirmText     = page.locator('.complete-text');
    this.ponyExpressImg  = page.locator('.pony_express');
    this.backHomeBtn     = page.locator('[data-test="back-to-products"]');
  }

  //Actions
  async clickBackHome() {
    await this.backHomeBtn.click();
  }

  //Getters 
  async getTitle() {
    return await this.pageTitle.innerText();
  }

  async getConfirmationHeader() {
    return await this.confirmHeader.innerText();
  }

  async getConfirmationText() {
    return await this.confirmText.innerText();
  }

  async isConfirmationImageVisible() {
    return await this.ponyExpressImg.isVisible();
  }
}

module.exports = { OrderConfirmationPage };
